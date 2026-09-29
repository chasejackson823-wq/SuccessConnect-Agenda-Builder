# SuccessConnect Agenda Builder — Project Handoff

This document is meant to be uploaded into a new Claude conversation along with
`successconnect-schedule-builder.jsx` and `successconnect-agenda-builder-source.zip`, so that
conversation can keep building without starting over. Contact: George (Chase Jackson's team, Veritas Prime).

## Version 3 (9/28/26): simplified launch build

Built to go out same day with **no outside setup**: no Pardot, no lead sheet, no backend. Nothing
the attendee enters leaves their browser.

**Flow:** Topics → Sessions → Your agenda.

1. **Topics page:** tap topic chips; tap order is the priority (numbered on the chip). One optional
   field, first name, used only to title the phone image. No other text boxes, no "building for a
   client" mode, no role question.
2. **ALL THAT!** (Tue Oct 6, 8 PM–midnight, LIV Nightclub at Fontainebleau) is the headline card on
   page 1, a "Register ↗" pill in the header on every page, and a button on the agenda page. All of
   them open marketing's real registration page (`PARTY.url`), which is how people actually
   register. The party is on their agenda and calendar by default ("Keep it on my agenda").
3. **1:1 meetings:** no in-app time picker. Every agenda gets a 30-minute "Meet the Veritas Prime team"
   block at Booth #6100, placed in an open gap near midday (`boothEvent`). "Request a 1:1 ↗" buttons
   open the existing meeting form (`MEETING_URL`); the team follows up to schedule.
4. **Raj's session (PAR1008,** Wed 9:30–9:50, SUCCESS 269) is auto-added when they pick Employee Central
   Payroll, Payroll Outsourcing or Employee Central. Removable.
5. **Take it with you:** "Add everything to my calendar" (.ics with every timed event, PT, reminders)
   and "Save the itinerary to my phone" (branded PNG; uses the phone's share sheet where available).
   Editing the agenda resets both so nobody saves a stale copy.
6. **Veritas Prime theme:** Manrope + IBM Plex Mono (self-hosted via @fontsource), black/white with teal
   #0ECAD8, lavender #9A9AE2, lime #94E21A, the brand gradient rule, and the VP mark (`VP_MARK_PATH`).

**Config at the top of `src/App.jsx`:** `BOOTH_NUMBER`, `MEETING_URL`, `FLOOR_HOURS`, `BOOTH_VISIT_MIN`,
`PARTY`, `VP_SESSION_CODE`, `VP_SESSION_TRIGGERS`.

**Removed from v2** (can come back later if marketing wants lead capture): required/optional
in-app 1:1 time picker, contact fields and consent, Pardot form handler posts, Google Sheet lead
log, "Email it to me", shareable agenda link.

**Known limits:** the Claude artifact preview can't download files, so test calendar and image on
the deployed site. SAP's "not yet scheduled" sessions are listed on the agenda but not in the
calendar file.

---

## Original handoff (v1), still accurate for the data model and refresh process

## Current state / where things stand

- **267 real sessions** loaded from SAP's official SC26 (SuccessConnect Las
  Vegas 2026) session catalog — titles, full descriptions, speakers/session
  types, levels, and real day/start/end times pulled directly from SAP's
  published catalog page (not mocked).
- 231 of those 267 have a confirmed day/time; 36 are still "Not Yet Scheduled"
  by SAP as of the last data refresh (9/25/26) and sit under their own tab in
  the app.
- **Duration-aware conflict detection is fully implemented.** Every session
  has both a `slotIdx` (a display bucket) and real `startMin`/`endMin`
  (minutes since midnight, from SAP's actual start/end times). Conflict
  checking (`sessionsOverlap`, `conflictingSessions`) runs on the real
  start/end times, not the display bucket — so two sessions with different
  slot buckets that still genuinely overlap in time get caught. The
  auto-recommendation engine (`buildSchedule`) greedily avoids all overlaps;
  manual "Add" actions still allow a user to knowingly double-book (useful for
  team/group planning) but flag it clearly with a red border, a warning
  banner naming the conflicting session(s), a per-day conflict-count badge,
  and a "Conflicts With" column in the CSV export.
- **Room/location**: SAP has not published separate room numbers for this
  event. Each session's SAP catalog code (e.g. `HCM1492`, `X1987`, `PAR1020`)
  is displayed in the location field instead, since that's the only
  identifying/location-adjacent reference SAP currently provides.
- **Module label conventions** (see `MODULES` array in the code):
  - `scm` → displayed as **"CTD" / "Career & Talent Development"** (not
    "Succession Management" — this was a deliberate correction)
  - `ana` → displayed as **"Reporting"** (was "PA&P" / "People Analytics &
    Planning", which was confusing to users)
  - `bpaas` → displayed as **"Payroll Outsourcing"** (was "BPaaS"), and is
    **excluded** from the "Which modules are live in your landscape today?"
    picker (client landscapes don't run BPaaS as a "live module" the way they
    run a SuccessFactors module — it's a service, not something "live" in
    their system) but still appears in the "Plans on the horizon?" picker.

## Data model conventions (important for anyone touching `SESSIONS`)

Each session is created via:
```js
mkSession(id, day, slotIdx, modId, subIdx, title, blurb, room, levelIdx, speaker, startMin, endMin)
```
- `day`: `1` = Monday (pre-conference), `2` = Tuesday, `3` = Wednesday, or the
  string `'tbd'` for not-yet-scheduled sessions.
- `slotIdx`: index into the `SLOTS` display-label array — cosmetic grouping
  only, **not** used for conflict logic.
- `room`: the session's SAP catalog code (see above), used as the
  location/reference field.
- `startMin`/`endMin`: minutes since midnight, or `null` for `'tbd'` sessions.
  **This is what conflict detection actually runs on.**
- The `speaker` parameter is actually used to hold the SAP **session type**
  tag (e.g. "Customer success story," "Strategy talk," "Ask the expert,"
  "Demo station," "Hands-on lab") — a naming leftover from an early version,
  not literal speaker names. Worth renaming if this file gets refactored, but
  functionally correct as-is.
- Session titles embed the SAP code as `"Title (CODE)"` — several places in
  the code extract the code back out of the title via regex when needed.
- A handful of sessions (currently ~13-14 codes) are offered **twice** — same
  code, two different real time slots (e.g. repeated on both Tuesday and
  Wednesday, or twice on the same day). Each occurrence is its own
  `mkSession` row with its own unique `id`, sharing the same `code`/`room`.
  When refreshing catalog data in the future, match old-to-new rows carefully
  by (code, day, time) — not by code alone — or duplicate-time sessions will
  get silently collapsed into identical rows (this bit us once during this
  build; see the fix that restored the second `HCM1698` time slot).

## How data refreshes work

The session data was built by having Chase save SAP's live session catalog
page as a fully-expanded ("Show more" clicked), complete local HTML file
(Chrome: Save As → Webpage, Complete) and uploading it. Straight "Print to
PDF" or "View Source" don't work — the catalog is JS-rendered, and the PDF
export came out blank. The HTML file was parsed with BeautifulSoup, selecting
`.catalog-result` list items, pulling title/code from `.title-text`, the
session type from `.attribute-Sessiontype .attribute-values`, the description
from `.abstract-component .description`, level from the
`.badge.rf-session-level` badge, and day/start/end time by regex-matching the
"Add to schedule | Day, Oct D | Start Time - End Time TZ" text block.

If/when SAP updates the catalog again (more sessions finalized, rooms
published, etc.), repeat this process: save a fresh complete HTML export,
re-parse, and diff against the existing `SESSIONS` array by SAP code —
watching for the duplicate-code/duplicate-time gotcha above.

## Deployment

- Source lives in a GitHub repo; Vercel is connected to it and auto-deploys on
  push/upload.
- To update: unzip `successconnect-agenda-builder-source.zip`, replace the
  repo's contents on GitHub (web upload works fine — no CLI needed), commit
  to main, and Vercel redeploys automatically.
- Vercel project settings: Framework Preset = "Other", Root Directory = blank
  (files are at repo root, not nested in a subfolder). If Root Directory or
  Framework Preset get out of sync with the actual repo structure, you'll get
  a 404 on the deployed URL — that's the first thing to check if a deploy
  "succeeds" but the live site 404s.
- There's also a live Claude Artifact preview link the team has been using for
  quick visual review without waiting on a GitHub/Vercel round-trip — ask
  Chase for the current link if you need it; it gets republished in place
  each time there's a meaningful update, so the same link always reflects the
  latest state.

## Files included with this handoff

- `successconnect-schedule-builder.jsx` — the canonical, current single-file
  source (this is `src/App.jsx` in the Vite project).
- `successconnect-agenda-builder-source.zip` — the full Vite/React/Tailwind v4
  project (minus `node_modules`/`dist`), ready to `npm install && npm run
  build`, or to re-upload to GitHub as-is.

Everything above reflects the state of the project as of this handoff. Treat
this document as background/context, not as a task list — check with Chase
for what he actually wants done next.
