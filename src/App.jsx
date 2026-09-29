import React, { useState, useMemo, useEffect } from "react";

// =====================================================================================
//  CONFIG: everything the team is likely to edit lives in this block.
// =====================================================================================

const BOOTH_NUMBER = "6100";
const BOOTH_LABEL = `Veritas Prime · Booth #${BOOTH_NUMBER}`;
// Where 1:1 meetings happen. Assumed to be at the booth; change here if meetings move to a suite.
const MEETING_LOCATION = BOOTH_LABEL;
// Existing marketing page where attendees request a 1:1 (the team follows up to schedule).
const MEETING_URL = "https://go.veritasprime.com/sap-connect-2026-Veritas-Prime";
const MEETING_LENGTH_MIN = 30;

// Show floor hours, minutes since midnight (PT). Meeting slots and the booth stop live inside these.
const FLOOR_HOURS = {
  2: { open: 7 * 60 + 30, close: 18 * 60 + 30 }, // Tue 7:30 AM – 6:30 PM
  3: { open: 8 * 60, close: 17 * 60 },            // Wed 8:00 AM – 5:00 PM
};
const BOOTH_VISIT_MIN = 30;

const PARTY = {
  name: "ALL THAT! Party at LIV",
  short: "ALL THAT!",
  venue: "LIV Nightclub at Fontainebleau",
  day: 2,
  startMin: 20 * 60,
  endMin: 24 * 60,
  url: "https://go.veritasprime.com/sap-connect-2026-all-that-veritas-prime",
  blurb: "A '90s throwback night hosted by Veritas Prime. Open bar with '90s-inspired cocktails.",
};

// Veritas Prime's own session. Auto-added when any of these interests are picked.
const VP_SESSION_CODE = "PAR1008";
const VP_SESSION_TRIGGERS = ["ecp", "bpaas", "ec"];

// Oct 4 + day index = calendar date (day 1 = Mon Oct 5). Las Vegas is UTC-7 in October.
const EVENT_YEAR = 2026;
const EVENT_MONTH_IDX = 9;
const UTC_OFFSET_MIN = 7 * 60;

// =====================================================================================
//  Brand tokens (Veritas Prime presentation template: Manrope + IBM Plex Mono)
// =====================================================================================
const C = {
  bg: "#FFFFFF",
  surface: "#F2F2F2",
  surfaceSoft: "#F7F8F8",
  ink: "#000000",
  inkSoft: "#4A5058",
  line: "#E1E3E5",
  lineDark: "#B9BEC3",
  teal: "#0ECAD8",
  tealDeep: "#077880",
  tealTint: "#E6FAFB",
  tealPale: "#B6EEEF",
  lavender: "#9A9AE2",
  lime: "#94E21A",
  peach: "#FFB68F",
  navy: "#222E50",
  danger: "#B42318",
  dangerTint: "#FDECEA",
};
const GRAD = "linear-gradient(90deg, #0ECAD8 0%, #9A9AE2 55%, #94E21A 100%)";
const F = {
  sans: "'Manrope', system-ui, sans-serif",
  mono: "'IBM Plex Mono', ui-monospace, monospace",
};
// Module tag fills: brand hues deepened so white tag text stays readable.
const MODULE_COLORS = ["#222E50", "#077880", "#5454B0", "#4A7A08", "#A94E1C"];

const VP_MARK_PATH =
  "M0 0 L318 518 L330 529 L341 535 L354 539 L371 540 L388 536 L400 530 L415 516 L529 328 L547 311 L557 306 L573 302 L774 302 L807 297 L840 287 L880 267 L906 248 L924 231 L944 207 L958 185 L965 169 L971 146 L972 113 L963 78 L955 62 L944 46 L925 27 L909 16 L880 4 L859 0 L700 1 L680 10 L664 26 L506 283 L491 295 L473 302 L424 302 L410 298 L396 291 L376 273 L226 28 L210 11 L200 5 L183 0Z";

const MODULES = [
  { id: "ec", name: "Employee Central", short: "EC", subs: ["Core HR", "Org Management", "Global Benefits"] },
  { id: "ecp", name: "Employee Central Payroll", short: "ECP", subs: ["Payroll Control Center", "Off-Cycle Processing", "Tax & Compliance"] },
  { id: "rec", name: "Recruiting", short: "REC", subs: ["Recruiting Marketing", "Candidate Experience"] },
  { id: "onb", name: "Onboarding", short: "ONB", subs: ["Onboarding 1.0 Transition", "Cross-Boarding"] },
  { id: "pmgm", name: "Performance & Goals", short: "PMGM", subs: ["Continuous Performance", "Goal Management"] },
  { id: "comp", name: "Compensation", short: "COMP", subs: ["Variable Pay", "Comp Statements"] },
  { id: "scm", name: "Career & Talent Development", short: "CTD", subs: ["Talent Pools", "Career Worksheet"] },
  { id: "lms", name: "Learning", short: "LMS", subs: ["Learning Needs", "Content Marketplace"] },
  { id: "time", name: "Time Tracking", short: "TIME", subs: ["Time Sheets", "Scheduling"] },
  { id: "ana", name: "People Analytics & Planning", short: "Reporting", subs: ["Workforce Planning", "Story Reports"] },
  { id: "bpaas", name: "Payroll Outsourcing", short: "Payroll Outsourcing", subs: ["Managed Services", "AMS Support"] },
];

const modColor = (id) => MODULE_COLORS[MODULES.findIndex((m) => m.id === id) % MODULE_COLORS.length];
const modName = (id) => MODULES.find((m) => m.id === id)?.name ?? id;
const modShort = (id) => MODULES.find((m) => m.id === id)?.short ?? id;

const DAYS = [1, 2, 3, "tbd"];
const DAY_LABELS = {
  1: "Mon, Oct 5 — Pre-Conference",
  2: "Tue, Oct 6",
  3: "Wed, Oct 7",
  tbd: "Not Yet Scheduled",
};
const SLOTS = ["8:00 AM", "1:00 PM", "8:00 AM", "8:15 AM", "8:30 AM", "9:00 AM", "9:30 AM", "9:45 AM", "10:00 AM", "10:30 AM", "10:45 AM", "11:00 AM", "11:30 AM", "11:35 AM", "11:45 AM", "11:50 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:15 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:15 PM", "3:30 PM", "3:45 PM", "4:00 PM", "4:30 PM"];
const LEVELS = ["Foundational", "Intermediate", "Advanced"];

// Minutes-since-midnight -> "9:45 AM" style label.
function minutesToLabel(min) {
  if (min == null) return null;
  const h = Math.floor(min / 60);
  const m = min % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

// "9:45 AM – 10:30 AM" style range, or "Time TBD" when either end is unknown.
function formatTimeRange(startMin, endMin) {
  if (startMin == null || endMin == null) return "Time TBD";
  return `${minutesToLabel(startMin)} – ${minutesToLabel(endMin)}`;
}

// startMin/endMin are minutes-since-midnight for the session's real start and end time,
// pulled from SAP's published schedule. They're what conflict-checking runs on — slotIdx is
// only a display bucket (sessions can share a slotIdx's start time but run different lengths,
// or start in different slots and still overlap once duration is factored in).
function mkSession(id, day, slotIdx, modId, subIdx, title, blurb, room, levelIdx, speaker, startMin, endMin) {
  const mod = MODULES.find((m) => m.id === modId);
  return {
    id, day, slotIdx, room,
    startMin: startMin ?? null, endMin: endMin ?? null,
    time: formatTimeRange(startMin, endMin),
    module: modId, sub: mod.subs[subIdx % mod.subs.length], title, blurb,
    level: LEVELS[levelIdx % LEVELS.length], speaker,
  };
}

// Real, finalized session data pulled from Chase's saved SAP Connect Las Vegas 2026 (SC26)
// session catalog page, "Success Connect" (HCM) track — 267 sessions total (refreshed 9/25/26).
// Day/time is confirmed for 231 of them; 36 sessions still had no day/time assigned when this
// was saved and sit under the "Not Yet Scheduled" tab.
// The "room" field holds each session's SAP catalog code (e.g. "HCM1492"), used as the
// location/reference identifier since dedicated room numbers aren't published separately.
const SESSIONS = [
  mkSession(1, 1, 0, "lms", 0, "Advanced Customization and Enhancements in SAP SuccessFactors Learning (HCMPC09)", "Pre-Conference Training: This hands-on skill-building session is led by instructors and is intended to help customers deepen skills, gain confidence, and maximize the value of your SAP investments.", "HCMPC09", 2, "Pre-conference training", 480, 720),
  mkSession(2, 1, 0, "lms", 0, "A Look at Class Management in SAP SuccessFactors Learning (HCMPC10)", "Pre-Conference Training: This hands-on skill-building session is led by instructors and is intended to help customers deepen skills, gain confidence, and maximize the value of your SAP investments.", "HCMPC10", 0, "Pre-conference training", 480, 720),
  mkSession(3, 1, 0, "onb", 0, "Beyond the Basics: Advanced Onboarding Configuration and Offboarding Readiness (HCMPC05)", "Pre-Conference Training: This hands-on skill-building session is led by instructors and is intended to help customers deepen skills, gain confidence, and maximize the value of your SAP investments.", "HCMPC05", 2, "Pre-conference training", 480, 720),
  mkSession(4, 1, 0, "rec", 0, "Explore AI-First, Intelligent Hiring with SmartRecruiters for SAP SuccessFactors (HCMPC14)", "Pre-Conference Training: This hands-on skill-building session is led by instructors and is intended to help customers deepen skills, gain confidence, and maximize the value of your SAP investments.", "HCMPC14", 0, "Pre-conference training", 480, 720),
  mkSession(5, 1, 0, "ec", 2, "Navigating Global Compliance in SAP SuccessFactors Employee Central Global Benefits (HCMPC01)", "Pre-Conference Training: This hands-on skill-building session is led by instructors and is intended to help customers deepen skills, gain confidence, and maximize the value of your SAP investments.", "HCMPC01", 0, "Pre-conference training", 480, 720),
  mkSession(6, 1, 0, "scm", 0, "Optimizing the Talent Management Cycle with AI (HCMPC17)", "Pre-Conference Training: This hands-on skill-building session is led by instructors and is intended to help customers deepen skills, gain confidence, and maximize the value of your SAP investments.", "HCMPC17", 2, "Pre-conference training", 480, 720),
  mkSession(7, 1, 0, "ecp", 0, "Payroll Control Center in SAP SuccessFactors: Configuring and Managing Payroll Processes (HCMPC07)", "Pre-Conference Training: This hands-on skill-building session is led by instructors and is intended to help customers deepen skills, gain confidence, and maximize the value of your SAP investments.", "HCMPC07", 0, "Pre-conference training", 480, 720),
  mkSession(8, 1, 0, "ana", 1, "SAP SuccessFactors Employee Central Story Reporting: Analysis with Effective Dating & Time-Based Logic (HCMPC12)", "Pre-Conference Training: This hands-on skill-building session is led by instructors and is intended to help customers deepen skills, gain confidence, and maximize the value of your SAP investments.", "HCMPC12", 0, "Pre-conference training", 480, 720),
  mkSession(9, 1, 0, "ec", 0, "SAP SuccessFactors Employee Central Fundamentals including AI Tools and Joule (HCMPC02)", "Pre-Conference Training: This hands-on skill-building session is led by instructors and is intended to help customers deepen skills, gain confidence, and maximize the value of your SAP investments.", "HCMPC02", 0, "Pre-conference training", 480, 720),
  mkSession(10, 1, 0, "scm", 0, "Using the Talent Intelligence Hub and Growth Portfolio Functionality in SAP SuccessFactors Solutions (HCMPC19)", "Pre-Conference Training: This hands-on skill-building session is led by instructors and is intended to help customers deepen skills, gain confidence, and maximize the value of your SAP investments.", "HCMPC19", 2, "Pre-conference training", 480, 720),
  mkSession(11, 1, 1, "ana", 0, "Accelerating Your Autonomous HCM Journey: End-to-End Enablement for Business Continuity (HCMPC21)", "Pre-conference workshop: Through expert guidance and interactive exercises, you'll explore the full SAP SuccessFactors adoption lifecycle, from AI-powered innovations to long-term support strategies, and leave with practical best practices to maximize the value of your HCM investment.", "HCMPC21", 1, "Pre-conference workshop", 780, 1020),
  mkSession(12, 1, 1, "ana", 1, "Beyond Story Report Templates: Turning HR Data into Business Impact (HCMPC13)", "Pre-Conference Training: This hands-on skill-building session is led by instructors and is intended to help customers deepen skills, gain confidence, and maximize the value of your SAP investments.", "HCMPC13", 2, "Pre-conference training", 780, 1020),
  mkSession(13, 1, 1, "ecp", 0, "Evolving Payroll Execution in the Payroll Control Center with the new Manage Payroll Activities (HCMPC08)", "Pre-Conference Training: This hands-on skill-building session is led by instructors and is intended to help customers deepen skills, gain confidence, and maximize the value of your SAP investments.", "HCMPC08", 2, "Pre-conference training", 780, 1020),
  mkSession(14, 1, 1, "scm", 0, "Exploring Unified Talent Management Capabilities with SAP SuccessFactors Career and Talent Development (HCMPC18)", "Pre-Conference Training: This hands-on skill-building session is led by instructors and is intended to help customers deepen skills, gain confidence, and maximize the value of your SAP investments.", "HCMPC18", 2, "Pre-conference training", 780, 1020),
  mkSession(15, 1, 1, "ana", 0, "From Curiosity to Action: Discovering Your High-Value AI Agent Use Cases with SAP (XPC01)", "Pre-conference workshop: Through a expert-led discovery process, you'll identify and prioritize your organization's highest-impact AI opportunities and leave with a tailored AI Use Case Roadmap and a dedicated plan to guide your next steps.", "XPC01", 0, "Pre-conference workshop", 780, 1020),
  mkSession(16, 1, 1, "ec", 0, "Intelligent Workflow Automation: Enhancing Approval Processes in SAP SuccessFactors Employee Central (HCMPC03)", "Pre-Conference Training: This hands-on skill-building session is led by instructors and is intended to help customers deepen skills, gain confidence, and maximize the value of your SAP investments.", "HCMPC03", 2, "Pre-conference training", 780, 1020),
  mkSession(17, 1, 1, "pmgm", 0, "Mastering Business Rules in SAP SuccessFactors Performance & Goals: Going Beyond Limits in Performance Reviews (HCMPC20)", "Pre-Conference Training: This hands-on skill-building session is led by instructors and is intended to help customers deepen skills, gain confidence, and maximize the value of your SAP investments.", "HCMPC20", 2, "Pre-conference training", 780, 1020),
  mkSession(18, 1, 1, "comp", 0, "Mastering the Art of Compensation Cycle Planning with SAP SuccessFactors Compensation (HCMPC11)", "Pre-Conference Training: This hands-on skill-building session is led by instructors and is intended to help customers deepen skills, gain confidence, and maximize the value of your SAP investments.", "HCMPC11", 0, "Pre-conference training", 780, 1020),
  mkSession(19, 1, 1, "ec", 1, "Modernizing Position Management with AI-Driven Efficiency (HCMPC06)", "Pre-Conference Training: This hands-on skill-building session is led by instructors and is intended to help customers deepen skills, gain confidence, and maximize the value of your SAP investments.", "HCMPC06", 2, "Pre-conference training", 780, 1020),
  mkSession(20, 1, 1, "rec", 0, "Optimizing Job Requisitions and Multi-Channel Posting with SmartRecruiters for SAP SuccessFactors (HCMPC15)", "Pre-Conference Training: This hands-on skill-building session is led by instructors and is intended to help customers deepen skills, gain confidence, and maximize the value of your SAP investments.", "HCMPC15", 0, "Pre-conference training", 780, 1020),
  mkSession(21, 1, 1, "ana", 0, "SAP SuccessFactors System Administration Fundamentals including AI Tools and Joule (HCMPC04)", "Pre-Conference Training: This hands-on skill-building session is led by instructors and is intended to help customers deepen skills, gain confidence, and maximize the value of your SAP investments.", "HCMPC04", 0, "Pre-conference training", 780, 1020),
  mkSession(22, 1, 1, "rec", 0, "SmartRecruiters for SAP SuccessFactors Foundation Excellence: Configuring Critical System Guardrails (HCMPC16)", "Pre-Conference Training: This hands-on skill-building session is led by instructors and is intended to help customers deepen skills, gain confidence, and maximize the value of your SAP investments.", "HCMPC16", 0, "Pre-conference training", 780, 1020),
  mkSession(23, 2, 16, "rec", 0, "2027 talent acquisition trends: Navigate the future of intelligent hiring (HCM1479)", "AI is rapidly transforming every stage of the hiring journey, yet many organizations continue to feel outpaced by change.", "HCM1479", 0, "Strategy talk", 720, 765),
  mkSession(24, 2, 7, "lms", 1, "Accelerate SAP SuccessFactors adoption with WalkMe solutions (HCM1408)", "WalkMe solutions help organizations measure adoption, identify where users need support, and uncover opportunities to increase engagement with SAP SuccessFactors solutions.", "HCM1408", 1, "Solution deep dive", 585, 630),
  mkSession(25, 2, 7, "ana", 0, "Building the AI-ready enterprise: Unlocking intelligence through innovation (XSER2149)", "Learn how a leading enterprise is partnering with SAP to build the foundation for enterprise-scale AI.", "XSER2149", 0, "Customer success story", 585, 630),
  mkSession(26, 2, 7, "ec", 0, "Connect HR and finance to drive business growth (HCM1394)", "The best results happen when HR and finance move as one. Learn how companies are driving business growth by aligning HR and finance with SAP GROW offerings.", "HCM1394", 1, "Strategy talk", 585, 630),
  mkSession(27, 2, 7, "ana", 0, "ConocoPhillips: Industry AI for the future of energy and natural resources (XIND1818)", "Discover how the Industry AI portfolio helps oil, gas, energy, utilities, mill products, mining, and chemicals companies innovate and boost operational performance.", "XIND1818", 1, "Customer success story", 585, 630),
  mkSession(28, 2, 7, "scm", 0, "Customer panel: Colgate and Delta Air Lines reimagine skills-based talent (HCM1839)", "Hear the Colgate-Palmolive Company and Delta Air Lines engage in a strategic conversation on the future of skills-based talent.", "HCM1839", 0, "Customer success story", 585, 630),
  mkSession(29, 2, 7, "ecp", 0, "Prepare your business for the future by moving HCM to the cloud (HCM1325)", "Learn more about the SAP ERP Human Capital Management solution's on-premises maintenance timelines and cloud innovations available today.", "HCM1325", 0, "Strategy talk", 585, 630),
  mkSession(30, 2, 7, "ec", 0, "Road map: Leverage an enterprise AI foundation in the age of Autonomous HCM (HCM1444)", "Explore the innovations powering SAP SuccessFactors HCM. Discover the transformative power of agentic AI on SAP Business AI Platform, alongside key innovations in integration, extensibility, security, and system administration.", "HCM1444", 0, "Roadmap", 585, 630),
  mkSession(31, 2, 7, "ana", 0, "Turn AI into outcomes: Build the foundation with SAP Business AI Platform (XBAIP1208)", "Discover how an SAP customer is using SAP Business AI Platform to stay future ready and turn real processes, data, and governance into autonomous outcomes that close the AI value gap at scale.", "XBAIP1208", 1, "Customer success story", 585, 630),
  mkSession(32, 2, 8, "ecp", 0, "Compliant payroll at scale: A strategy for global growth (HCM1913)", "Payroll compliance is harder when every country plays by different rules. See how a single connected payroll system monitors regulatory changes across every jurisdiction, validates each pay run, and maintains audit-ready documentation.", "HCM1913", 0, "Strategy talk", 600, 620),
  mkSession(33, 2, 8, "time", 0, "From vision to value: Transforming HR in regulated industries (HCM1489)", "Discover how SAP helps regulated industries transform HR operations with purpose-built capabilities including position budgeting control for cloud and consolidated time recording.", "HCM1489", 1, "Strategy talk", 600, 620),
  mkSession(34, 2, 8, "pmgm", 0, "Maximize organizational performance by aligning people, jobs, and structure (PAR1027)", "Get customer insights on talent cards from chemical company LyondellBasell Industries N.V. while an SAP expert explores structures for effective org design.", "PAR1027", 1, "Customer success story", 600, 620),
  mkSession(35, 2, 10, "ana", 0, "Building enterprise AI at scale through collaboration (X2215)", "Discover how SAP, Accenture, and global enterprises are transforming emerging AI capabilities into business value.", "X2215", 0, "Customer success story", 645, 690),
  mkSession(36, 2, 10, "ana", 0, "Managing risk and compliance across a blended workforce (SPM1629)", "As the external workforce grows, so does regulatory scrutiny.", "SPM1629", 0, "Strategy talk", 645, 690),
  mkSession(37, 2, 22, "ana", 0, "Paving the path to AI at scale: The Autonomous Enterprise vision (XERP1862)", "Find out what it looks like when a world-class organization bets on ERP as the foundation for enterprise AI.", "XERP1862", 0, "Customer success story", 870, 915),
  mkSession(38, 2, 10, "ana", 0, "Retail industry tour (XIND2188)", "See the Industry AI portfolio in action. Explore a new agentic operating system for retail, including scenarios for new product introduction, retail supply chain planning, loyalty, shopping, order management, and store intelligence.", "XIND2188", 1, "Industry tour", 645, 690),
  mkSession(39, 2, 10, "ana", 0, "SAP Sovereign Cloud and security and compliance: Built without compromise (XSER1746)", "Sovereignty and security are no longer afterthoughts—they’re the conditions for cloud innovation.", "XSER1746", 0, "Strategy talk", 645, 690),
  mkSession(40, 2, 10, "ana", 0, "SAP SuccessFactors: A new era for HR with Autonomous HCM (HCM1289)", "Discover how customers are turning the promise of Autonomous HCM into measurable results with SAP SuccessFactors solutions.", "HCM1289", 0, "Keynote", 645, 705),
  mkSession(41, 2, 11, "ana", 0, "Unlocking your data goldmine: The foundation for AI success (XSER2150)", "Enterprises sit on a goldmine of data but spend more time curating it than acting on it. Explore the strategic vision behind the SAP Business Data Cloud solution.", "XSER2150", 0, "Strategy talk", 660, 680),
  mkSession(42, 2, 15, "ana", 0, "Quick tips: How to get started with Autonomous HCM (HCM1985)", "AI agents are already transforming HR—automating hiring, onboarding, and talent decisions through autonomous multistep workflows.", "HCM1985", 0, "Quick tips", 710, 715),
  mkSession(43, 2, 16, "ana", 0, "2027 and beyond: Future of work predictions reality check (HCM1320)", "Last year’s predictions were full of provocative takes. What happened, what didn’t, and what's next?", "HCM1320", 0, "Strategy talk", 720, 740),
  mkSession(44, 2, 16, "ana", 0, "Accelerate time to value of SAP projects with SAP Joule for Consultants (XJOU1969)", "Unlock the value of your software investments sooner by equipping SAP project teams to implement SAP solutions up to 14% faster.", "XJOU1969", 0, "Strategy talk", 720, 740),
  mkSession(45, 2, 16, "ana", 0, "Brighthouse: Streamline HR operations with SAP Cloud Application Services (HCM1747)", "Discover how Brighthouse is advancing its SAP SuccessFactors solutions operations with SAP Cloud Application Services offerings, using AI to create a more proactive operating model.", "HCM1747", 0, "Customer success story", 720, 765),
  mkSession(46, 2, 16, "rec", 0, "Discipline over customization: Steelcase’s global HR foundation (PAR1006)", "A disciplined governance model and PwC-leading practices drove Steelcase to a standard, low-customization implementation of SAP SuccessFactors solutions.", "PAR1006", 0, "Customer success story", 720, 740),
  mkSession(47, 2, 16, "ana", 0, "Industry AI tour (XIND2196)", "Take a guided industry AI tour to see autonomous, agentic solutions in action across seven Industry domains. Explore how SAP connects data, applications, and AI to improve decisions and outcomes.", "XIND2196", 1, "Industry tour", 720, 765),
  mkSession(48, 2, 16, "ana", 0, "Putting the human in Autonomous HCM (HCM2254)", "What does an AI-enabled workforce really look like in practice? Share what your organization is navigating and hear what’s top of mind for your peers.", "HCM2254", 1, "Roundtable discussion", 720, 765),
  mkSession(49, 2, 16, "lms", 0, "Reduce risk and skill gaps with intelligent personalized learning (HCM1361)", "Accelerate workforce readiness and stay ahead of compliance. Discover how proactive compliance intelligence surfaces certification gaps before they become operational events.", "HCM1361", 2, "Strategy talk", 720, 765),
  mkSession(50, 2, 16, "ana", 0, "Road map and vision: Unlocking the value of AI in SAP SuccessFactors HCM (HCM1418)", "Get a forward-looking view of AI across SAP SuccessFactors HCM. Preview the full road map—upcoming agent capabilities, Joule solution enhancements, and AI-powered features spanning talent, core HR, and workforce management.", "HCM1418", 1, "Roadmap", 720, 765),
  mkSession(51, 2, 16, "time", 0, "Road map: Compliant workforce management in the age of Autonomous HCM (HCM1968)", "Get a first look at what's coming for workforce management. From AI scheduling to new agents for time and absence, explore the innovations that cut overtime, overstaffing, and payroll errors.", "HCM1968", 0, "Roadmap", 720, 765),
  mkSession(52, 2, 16, "ana", 1, "Road map: Drive continuous workforce planning in the age of Autonomous HCM (HCM1687)", "Look ahead to learn how continuous workforce planning will help organizations forecast, plan, and execute workforce strategies at the frequency of change.", "HCM1687", 0, "Roadmap", 720, 765),
  mkSession(53, 2, 16, "ana", 0, "SAP Business AI Platform and HCM overview (HCM1499)", "Get an overview of SAP Business AI Platform and the opportunity it provides for SAP SuccessFactors HCM customers.", "HCM1499", 0, "Solution deep dive", 720, 765),
  mkSession(54, 2, 16, "rec", 0, "See how to create connected talent experiences across hiring and beyond (HCM1428)", "Discover the power of a seamless talent journey that turns eager candidates into productive new hires and successful employees.", "HCM1428", 0, "Solution demo", 720, 740),
  mkSession(55, 2, 7, "rec", 0, "Take your first steps into agentic hiring: Lessons from three SAP customers (HCM1911)", "Hiring is one of the first places agentic AI gets real, and knowing where to start is hard. Three SAP customers share how they actually began, building the business case and splitting work between people and agents.", "HCM1911", 0, "Customer success story", 585, 630),
  mkSession(56, 2, 17, "ec", 0, "Building a global HR foundation: ExxonMobil's SAP SuccessFactors journey (HCM1898)", "With around 60,000 employees worldwide, ExxonMobil embarked on a large-scale HR technology transformation centered on implementation of the SAP SuccessFactors Employee Central solution.", "HCM1898", 0, "Customer success story", 750, 770),
  mkSession(58, 2, 17, "ana", 0, "Smarter global compliance: Verified HR intelligence in Joule (PAR1026)", "Turn the Joule solution into a global compliance engine. Discover how G-P Gia™, an intelligent global HR compliance platform, delivers instant, verified labor law guidance across 50+ countries.", "PAR1026", 0, "Strategy talk", 750, 770),
  mkSession(59, 2, 17, "lms", 1, "Turn AI activation to adoption with SAP SuccessFactors and WalkMe solutions (HCM1406)", "Deploying AI is only the beginning. The real challenge is helping employees discover, trust, and use it consistently in ways that change how work gets done.", "HCM1406", 0, "Quick tips", 750, 770),
  mkSession(60, 2, 18, "ana", 0, "Leading business functions with embedded intelligence (PAR1000)", "Learn how Accenture helps organizations build on existing SAP investments by embedding intelligence into finance, supply chain, procurement, HR, and customer operations.", "PAR1000", 2, "Strategy talk", 780, 800),
  mkSession(61, 2, 18, "ec", 0, "Org design without guesswork: Simulate, decide, and evolve with confidence (HCM1912)", "Most organizations approach org design reactively—when the pressure is already on.", "HCM1912", 0, "Strategy talk", 780, 800),
  mkSession(62, 2, 18, "ana", 0, "What HR leaders should do to prepare for Joule Assistants and Joule Agents (HCM1421)", "AI agents are already transforming HR—automating hiring, onboarding, and talent decisions through autonomous multistep workflows.", "HCM1421", 1, "Strategy talk", 780, 800),
  mkSession(63, 2, 19, "ec", 0, "Streamline core HR with AI-assisted writing and intelligent HR actions​ (HCM1699)", "See how the SAP SuccessFactors Employee Central solution helps HR teams simplify everyday HR transactions, improve data quality, and lower manual follow-up.", "HCM1699", 2, "Hands-on lab", 795, 870),
  mkSession(64, 2, 19, "rec", 0, "Supercharge your hiring process with SmartRecruiters solutions (HCM1695)", "Discover how to hire faster and smarter with SmartRecruiters solutions in a hands-on lab covering the recruiting process with the latest innovations in hiring.", "HCM1695", 0, "Hands-on lab", 795, 855),
  mkSession(65, 2, 19, "ana", 0, "Workshop: Redesign jobs for the agentic AI era (HCM1332)", "As AI changes how work gets done, now is the time to rethink traditional job models. Discover how you can apply task intelligence, outcomes-based design, and job enrichment techniques to make jobs better for humans and optimized for AI.", "HCM1332", 0, "Workshop‎", 795, 855),
  mkSession(66, 2, 19, "ana", 0, "Workshop: Reimagine the user experience with Joule Work for HR (HCM1336)", "Discover how the Joule Work capability provides a unified entry point to Autonomous HCM, empowering users to complete tasks quickly and confidently with an intent-driven experience.", "HCM1336", 0, "Workshop‎", 795, 855),
  mkSession(67, 2, 20, "time", 0, "Autonomous workforce management: How HR achieves global compliance (HCM1490)", "Autonomous workforce management isn't about removing HR from the equation, it's about giving HR the power to lead it.", "HCM1490", 1, "Strategy talk", 810, 830),
  mkSession(68, 2, 20, "pmgm", 0, "Close skill gaps and personalize development aligned to business goals (HCM1365)", "Discover how AI-agentic experiences help close skill gaps by aligning employee growth with business demands.", "HCM1365", 0, "Solution deep dive", 810, 855),
  mkSession(69, 2, 20, "ana", 0, "From AI hype to HR impact: Proving value at scale at IBM (PAR1013)", "Most organizations have deployed AI, yet few can prove business impact.", "PAR1013", 0, "Customer success story", 810, 830),
  mkSession(70, 2, 20, "ana", 0, "From vision to value: Universal Horror Unleashed and SAP (XIND1819)", "Nothing to be scared of. Learn how Universal Horror Unleashed used a two-tier architecture to bring a unique guest experience to Las Vegas.", "XIND1819", 1, "Customer success story", 810, 855),
  mkSession(72, 2, 20, "ana", 1, "How BESTSELLER is empowering its leaders with trusted data and insights (HCM1305)", "Learn how BESTSELLER, an early adopter of People Intelligence, is using predelivered insights for workforce composition, recruiting, and time management to arm leaders with trusted, relevant, and timely workforce intelligence.", "HCM1305", 0, "Customer success story", 810, 830),
  mkSession(73, 2, 20, "onb", 0, "How Lockheed Martin transformed HR for 123,000 users (HCM1744)", "Transforming HCM demands the right strategy, the right partners, and disciplined execution.", "HCM1744", 0, "Customer success story", 810, 855),
  mkSession(74, 2, 20, "rec", 0, "Road map: Hire the right talent faster in the age of Autonomous HCM (HCM1426)", "Get an inside look at the product vision and road map for intelligent talent acquisition solutions. Discover how AI assistants and agents offer automation and insights to help you attract, engage, hire, and onboard top talent.", "HCM1426", 2, "Roadmap", 810, 855),
  mkSession(75, 2, 20, "ec", 0, "Road map: What's next for HR operations in the age of Autonomous HCM (HCM1475)", "AI is rewriting how HR manages people.", "HCM1475", 0, "Roadmap", 810, 855),
  mkSession(76, 2, 20, "ana", 0, "SAP Business AI Platform: The foundation of the Autonomous Enterprise (XBAIP1209)", "Draw back the curtain to reveal the three pillars of SAP Business AI Platform—build, contextualize and reason, and govern.", "XBAIP1209", 0, "Strategy talk", 810, 830),
  mkSession(77, 2, 20, "ana", 0, "Secure, connect, evolve: HCM innovations for integrations and security (HCM1445)", "Discover our latest innovations in security, identity management, integration, and extensibility.", "HCM1445", 2, "Solution deep dive", 810, 855),
  mkSession(78, 2, 20, "ana", 0, "Stater Bros. Markets: Skills-based workforce management in the age of AI (HCM1970)", "Finding and retaining top talent is a top priority for most businesses today. Learn how Stater Bros.", "HCM1970", 0, "Customer success story", 810, 855),
  mkSession(79, 2, 20, "ana", 0, "The process edge: How SAP Signavio solutions make transformation stick (XBAIP1666)", "Process excellence is the foundation of high-performing organizations across finance, procurement, HR, and supply chain.", "XBAIP1666", 0, "Customer success story", 810, 855),
  mkSession(80, 2, 21, "ana", 1, "Align HR to the business with continuous workforce planning and redesign (HCM1688)", "As AI fundamentally changes how work is performed, workforce planning demands a new level of strategic intelligence.", "HCM1688", 1, "Strategy talk", 840, 860),
  mkSession(81, 2, 21, "scm", 0, "Redesign your job architecture to support career and talent development (PAR1021)", "The SAP SuccessFactors Career and Talent Development solution needs a fit-for-purpose job architecture—but most were built for compensation, not talent.", "PAR1021", 1, "Strategy talk", 840, 860),
  mkSession(82, 2, 21, "ecp", 0, "See it work: A live end-to-end demo of an integrated HR foundation (HCM1488)", "Most HR teams still rely on multiple systems to do what one should.", "HCM1488", 1, "Solution demo", 840, 860),
  mkSession(83, 2, 22, "ana", 0, "Autonomous HCM: The future of HR is already here (HCM1417)", "What does it mean for HCM to be truly autonomous? Examine how AI is moving HR from reactive administration to proactive, self-executing processes.", "HCM1417", 0, "Strategy talk", 870, 915),
  mkSession(84, 2, 10, "ana", 0, "Beyond the pilot: How SAP Cloud ERP turns AI into real business outcomes (XERP1861)", "AI alone does not create value. Business outcomes do. Learn how AI-enabled ERP helps organizations automate routine tasks, improve decision-making, and increase productivity, enabling greater operational efficiency and scalable growth.", "XERP1861", 0, "Strategy talk", 645, 690),
  mkSession(85, 2, 22, "ecp", 0, "Configuration management in practice with CodeBot (PAR1012)", "Strategy only holds up when it survives daily execution.", "PAR1012", 0, "Customer success story", 870, 890),
  mkSession(86, 2, 22, "ecp", 0, "Expedite your cloud migration with SAP Readiness Check, proven worldwide (HCM1326)", "The SAP Readiness Check toolset helps you prepare for your move from the SAP ERP Human Capital Management solution on-premises to SAP SuccessFactors HCM.", "HCM1326", 0, "Solution deep dive", 870, 915),
  mkSession(87, 2, 22, "rec", 0, "How to establish your skills foundation to power an agile talent strategy (HCM1353)", "Learn how to activate your skills strategy with proven, practical steps for setup and governance of your skills and job architecture.", "HCM1353", 2, "Quick tips", 870, 890),
  mkSession(88, 2, 22, "ana", 0, "Joule Work: How customers are reshaping work for the Autonomous Enterprise (XJOU1399)", "Explore outcomes, best practices, and lessons from early adopters of the Joule Work capability, including SAP as customer zero. Learn more about the proactive, outcome-driven user experience where people express goals and AI gets them done.", "XJOU1399", 0, "Customer success story", 870, 915),
  mkSession(89, 2, 22, "rec", 0, "Road map: Accelerate employee growth in the age of Autonomous HCM (HCM1356)", "Look ahead to learn how SAP SuccessFactors solutions for learning and talent management are shaping the future of Autonomous HCM.", "HCM1356", 0, "Roadmap", 870, 915),
  mkSession(90, 2, 22, "rec", 0, "Roundtable: Measuring the impact of AI in the age of intelligent hiring (HCM1431)", "Engage with experts and peers in an interactive discussion exploring value-based use cases where AI can empower your organization to hire the right skills faster, navigate candidate fraud, and streamline every step of the hiring journey.", "HCM1431", 2, "Roundtable discussion", 870, 915),
  mkSession(91, 2, 22, "ana", 0, "SAP Integration Suite: Connecting HR processes with the power of AI (HCM1456)", "Take a deep dive into how SAP Integration Suite can help HR organizations streamline the creation of integration flows with new built-in AI capabilities.", "HCM1456", 2, "Solution deep dive", 870, 915),
  mkSession(92, 2, 22, "scm", 0, "Scotiabank: Turning insights into action to accelerate AI and skills growth (HCM1743)", "Discover how Scotiabank is reimagining its global talent strategy with AI within SAP SuccessFactors solutions.", "HCM1743", 0, "Customer success story", 870, 915),
  mkSession(93, 2, 22, "ecp", 0, "The efficient employee lifecycle: How integrated HR cuts complexity (HCM1483)", "HR fragmentation has a cost: errors, delays, vendor spend, and compliance risk.", "HCM1483", 0, "Strategy talk", 870, 915),
  mkSession(94, 2, 22, "ana", 0, "Utilities, oil, gas, and energy tour (XIND2192)", "Join executive Torsten Welte to discuss industry-relevant innovations across line of business.", "XIND2192", 1, "Industry tour", 870, 915),
  mkSession(95, 2, 23, "rec", 1, "Built for growth: Allison’s scalable blueprint for M&A agility (PAR1016)", "Learn how Allison Transmission Inc. deployed the SAP SuccessFactors Employee Central, SAP SuccessFactors Recruiting, and SAP SuccessFactors Onboarding solutions to create a flexible playbook for acquisitions.", "PAR1016", 0, "Customer success story", 900, 920),
  mkSession(96, 2, 23, "ana", 0, "Joule solution road map: What’s planned and why it matters to your business (XJOU1953)", "Learn how core capabilities in Joule are advancing to increase value across domains and industries. Discover the business context of key investments, including the orchestration agent harness, skill hub, Joule Work, and enterprise grounding.", "XJOU1953", 0, "Roadmap", 900, 920),
  mkSession(97, 2, 23, "scm", 0, "Learn PepsiCo’s secret skills recipe for career growth and mobility (HCM1905)", "Knowing who’s needed, when, and where is key to accelerating your strategic priorities. Discover how PepsiCo is transforming talent by aligning skills, development, and business outcomes to drive employee growth and engagement.", "HCM1905", 0, "Customer success story", 900, 920),
  mkSession(98, 2, 23, "ec", 0, "Lockheed Martin: Reimagine HR service delivery for the modern enterprise (HCM1916)", "Discover how Lockheed Martin transformed HR service delivery to meet the needs of a modern, global workforce with the SAP SuccessFactors Enterprise Service Management solution.", "HCM1916", 0, "Customer success story", 900, 920),
  mkSession(99, 2, 24, "pmgm", 0, "Advance skills, performance, and growth with SAP SuccessFactors solutions (HCM1697)", "Dive into SAP SuccessFactors talent development and performance management in this hands-on lab.", "HCM1697", 2, "Hands-on lab", 915, 990),
  mkSession(100, 2, 24, "onb", 0, "Hands-on challenge: Put Joule and agentic AI to work across HR (HCM1701)", "Ready for a challenge? Compete with fellow HCM professionals to see which team can complete AI-powered HR scenarios first.", "HCM1701", 1, "Hands-on lab", 915, 990),
  mkSession(101, 2, 24, "ana", 1, "Uncover HR insights with story reports in SAP SuccessFactors solutions (HCM1702)", "Designed for reporting administrators, this hands-on lab session can help you take reporting to the next level.", "HCM1702", 2, "Hands-on lab", 915, 990),
  mkSession(102, 2, 24, "pmgm", 0, "Workshop: Create an impact-driven performance and rewards strategy (HCM1335)", "Looking to build a pay-for-performance process that fairly rewards employee contribution? Explore innovative ways to measure workforce impact and value creation.", "HCM1335", 0, "Workshop‎", 915, 975),
  mkSession(103, 2, 24, "ana", 0, "Workshop: Keeping humans at the center of Autonomous HCM (HCM1337)", "AI is rapidly transforming HCM by reducing the manual burden that comes with traditional HR processes. But how can you ensure people remain at the heart of this new operating model?", "HCM1337", 0, "Workshop‎", 915, 975),
  mkSession(104, 2, 25, "ana", 0, "Closing the context gap with SAP Business AI Platform (XBAIP1644)", "The Autonomous Enterprise runs on agents that understand how your business works.", "XBAIP1644", 0, "Strategy talk", 930, 950),
  mkSession(105, 2, 25, "ec", 0, "Quick tips to improve process efficiency with mass data management (HCM1487)", "When workforce data changes at scale, mass data management in the SAP SuccessFactors Employee Central solution helps teams move faster without sacrificing accuracy.", "HCM1487", 0, "Quick tips", 930, 950),
  mkSession(106, 2, 25, "ana", 0, "See how to work smarter with Spaces in Joule Work (HCM1414)", "The Joule solution is evolving. Discover Spaces in Joule Work, a reimagined AI experience that brings intelligence, tasks, and collaboration into one unified place.", "HCM1414", 0, "Solution demo", 930, 950),
  mkSession(107, 2, 26, "onb", 0, "Ask the experts: Hire and onboard faster with talent acquisition solutions (HCM1427)", "Bring your toughest hiring questions to the people who know the answers. In an open forum, product experts tackle your questions on agentic talent acquisition, AI, migration, integration, and skills-based hiring.", "HCM1427", 1, "Ask the expert", 945, 990),
  mkSession(108, 2, 26, "ana", 0, "Consumer products industry tour (XIND2187)", "See the Industry AI portfolio in action.", "XIND2187", 1, "Industry tour", 945, 990),
  mkSession(109, 2, 26, "ana", 0, "Driving adoption: Practical lessons from SAP Fieldglass customers (SPM1630)", "Technology only delivers value when people actually use it. Learn practical, real-world lessons from customers of SAP Fieldglass solutions on the best ways to drive adoption.", "SPM1630", 0, "Strategy talk", 945, 990),
  mkSession(110, 2, 26, "ana", 0, "Extend the Autonomous Enterprise across LOBs with the Joule Studio solution (XBAIP1682)", "The Autonomous Enterprise is powered by AI, but requires business context, orchestration, and governance.", "XBAIP1682", 0, "Strategy talk", 945, 990),
  mkSession(111, 2, 26, "ana", 0, "Getting started with agentic AI adoption (SCM1472)", "Find out how to begin using agentic AI in asset and service management. Discuss practical adoption paths, organizational readiness, use cases, and challenges in bringing AI agents into asset operations and field service environments.", "SCM1472", 0, "Roundtable discussion", 945, 990),
  mkSession(112, 2, 26, "ecp", 0, "Inside SAP’s skills-led workforce transformation with AI and data (HCM1277)", "Learn how SAP evolved from establishing a global skills foundation to orchestrating an autonomous workforce with SAP SuccessFactors solutions, the SAP Business Data Cloud solution, and agentic AI capabilities.", "HCM1277", 2, "Customer success story", 945, 990),
  mkSession(113, 2, 26, "ana", 0, "NTT Data: Unifying people, processes, and technology in the age of AI (HCM1931)", "Hear how NTT Data, a global IT services and consulting organization, transformed a fragmented landscape of legacy HR systems and processes into a unified AI-ready platform.", "HCM1931", 0, "Customer success story", 945, 990),
  mkSession(114, 2, 26, "rec", 0, "Road map: Develop your people in the age of Autonomous HCM (HCM1358)", "Look ahead to learn how proactive AI experiences are shaping the future of skills, learning, and talent development.", "HCM1358", 0, "Roadmap", 945, 990),
  mkSession(115, 2, 26, "ecp", 0, "Road map: Transforming how people are paid in the age of Autonomous HCM (HCM1481)", "Autonomous payroll isn't about removing people from the process—it's about removing friction. The future of payroll streamlines every pay cycle without compromising the trust, governance, and transparency that the process demands.", "HCM1481", 0, "Roadmap", 945, 990),
  mkSession(116, 2, 26, "ana", 1, "Turn people insights into confident talent decisions (HCM1690)", "A continuous and comprehensive view of your workforce is critical to effective talent deployment, development, and compensation.", "HCM1690", 2, "Solution deep dive", 945, 990),
  mkSession(117, 2, 27, "ana", 0, "Quick tips you can use to estimate AI usage in SAP SuccessFactors HCM (HCM1413)", "Before you activate AI agents and skills in SAP SuccessFactors solutions, understand how your employees will use them.", "HCM1413", 0, "Quick tips", 960, 980),
  mkSession(118, 2, 27, "ecp", 0, "Trust your data, change with confidence, and run better (PAR1019)", "Learn how trusted HR and payroll teams prepare systems, validate accuracy, and reduce risks across daily operations.", "PAR1019", 1, "Strategy talk", 960, 980),
  mkSession(119, 2, 28, "ana", 0, "Govern AI adoption in the flow of work with WalkMe solutions (XBAIP1832)", "AI governance is strongest with oversight and visibility into how people use AI in their everyday work.", "XBAIP1832", 0, "Strategy talk", 990, 1010),
  mkSession(120, 3, 2, "ana", 0, "How to activate AI assistants and agents for HCM in “SAP for Me” (HCM1415)", "The SAP for Me tool is your central hub for activating AI assistants and agents across SAP SuccessFactors solutions.", "HCM1415", 0, "Quick tips", 480, 500),
  mkSession(121, 3, 3, "rec", 0, "Experience agentic recruiting at scale: Accelerate volume hiring with AI (HCM1429)", "See how agentic AI streamlines high-volume hiring, from job discovery to automated interview scheduling and beyond.", "HCM1429", 2, "Solution deep dive", 495, 540),
  mkSession(122, 3, 3, "ana", 0, "From the SAP Ariba Sourcing solution to SAP S/4HANA: Modernization journey (XIND1820)", "Learn how Los Alamos National Laboratory is using source-to-contract solutions to support acquisition planning and SLA-driven customer commitments in a highly regulated environment.", "XIND1820", 1, "Customer success story", 495, 540),
  mkSession(123, 3, 3, "rec", 0, "Harness skills intelligence to drive better talent decisions (HCM1351)", "Discover how the foundational skills data layer across SAP SuccessFactors HCM powers smarter learning and talent decisions.", "HCM1351", 0, "Solution deep dive", 495, 540),
  mkSession(124, 3, 3, "ec", 0, "No ticket required: How AI is changing HR service delivery (HCM1491)", "An employee has a question. What happens next can redefine how employees experience HR.", "HCM1491", 2, "Solution deep dive", 495, 540),
  mkSession(125, 3, 3, "ana", 1, "Road map: Drive continuous workforce planning in the age of Autonomous HCM (HCM1687)", "Look ahead to learn how continuous workforce planning will help organizations forecast, plan, and execute workforce strategies at the frequency of change.", "HCM1687", 0, "Roadmap", 495, 540),
  mkSession(126, 3, 3, "ecp", 0, "Road map: Transforming how people are paid in the age of Autonomous HCM (HCM1481)", "Autonomous payroll isn't about removing people from the process—it's about removing friction. The future of payroll streamlines every pay cycle without compromising the trust, governance, and transparency that the process demands.", "HCM1481", 0, "Roadmap", 495, 540),
  mkSession(127, 3, 3, "ana", 0, "Telecommunications and media industries tour (XIND2193)", "Join SAP industry experts on a guided tour to explore business AI built into the flow of work—accelerating monetization, sharpening customer experiences, and strengthening operational agility on one integrated platform.", "XIND2193", 1, "Industry tour", 495, 540),
  mkSession(128, 3, 3, "ana", 1, "Workforce planning in the age of AI: Ask the right questions (FIN1964)", "AI is reshaping the workforce faster than planning models can adapt. Finance, HR, and procurement each see a different piece—but no one sees the whole.", "FIN1964", 0, "Strategy talk", 495, 540),
  mkSession(129, 2, 28, "ana", 0, "How co-innovation with SAP is driving customer adoption of agentic AI (HCM1419)", "Hear directly from SAP about what happens when we join forces with our customers to solve HR challenges with AI.", "HCM1419", 0, "Strategy talk", 990, 1010),
  mkSession(130, 3, 4, "ana", 0, "Smarter leasing decisions with SAP Customer Experience and SAP Business AI (X2214)", "Learn how Far East Organization, one of Singapore’s largest private property developers, is collaborating with SAP to create an AI-enabled real estate lease renewal solution, unifying lease and financial data from the SAP Customer Experience portfolio, SAP Business AI, and SAP S/4HANA for greater visibility and informed leasing decisions at scale.", "X2214", 0, "Customer success story", 510, 530),
  mkSession(131, 3, 5, "ana", 0, "Corning Incorporated: From early adoption to real impact with Joule Studio (XBAIP1681)", "Hear a firsthand account of Corning Incorporated’s experience in the SAP Early Adopter Care program.", "XBAIP1681", 0, "Customer success story", 540, 560),
  mkSession(132, 3, 5, "ana", 0, "How BAT standardized HR across more than 90 countries (HCM1952)", "Discover how BAT, a consumer goods organization, created a consistent experience for its globally distributed workforce using a single HR platform.", "HCM1952", 0, "Customer success story", 540, 560),
  mkSession(133, 3, 5, "ecp", 0, "Powering your enterprise AI strategy: Payroll, time, and compliance (PAR1010)", "Enterprise AI strategies succeed or fail at the foundation. We explore how agentic AI is transforming payroll, time, and compliance from back-end functions into strategic assets.", "PAR1010", 1, "Strategy talk", 540, 560),
  mkSession(134, 3, 5, "rec", 0, "Quick tips: Accelerate hiring transformation with AI (HCM1432)", "Learn about AI migration tools and flexible transition options to enhance your hiring strategy quickly and confidently, empowering your talent acquisition teams with the latest agentic sourcing, screening, and recruiting capabilities.", "HCM1432", 0, "Quick tips", 540, 560),
  mkSession(135, 3, 5, "rec", 0, "Supercharge your hiring process with SmartRecruiters solutions (HCM1695)", "Discover how to hire faster and smarter with SmartRecruiters solutions in a hands-on lab covering the recruiting process with the latest innovations in hiring.", "HCM1695", 0, "Hands-on lab", 540, 600),
  mkSession(136, 3, 5, "ecp", 0, "Unlock payroll insights with the enhanced payroll control center (HCM1698)", "Get hands-on with managing payroll activities in the payroll control center (PCC). Build custom charts to compare payroll results across periods, drill down to employee-level details, and access pay slips directly.", "HCM1698", 0, "Hands-on lab", 540, 600),
  mkSession(137, 3, 5, "ana", 0, "Workshop: Chart your path toward Autonomous HCM (HCM1331)", "Ready to embrace the future of HCM but not sure where to start? Discover agentic AI readiness and adoption best practices.", "HCM1331", 0, "Workshop‎", 540, 600),
  mkSession(138, 3, 5, "ana", 0, "Workshop: Preparing people managers to lead in the age of AI (HCM1334)", "The people manager role is undergoing a critical shift driven by agentic AI and evolving employee needs.", "HCM1334", 0, "Workshop‎", 540, 600),
  mkSession(139, 3, 6, "rec", 0, "Evolve from compliance risk to compliance ready with AI (HCM1359)", "See how proactive compliance intelligence transforms compliance from reactive scramble to strategic advantage by surfacing certification gaps before they halt operations, automating manual tracking and reducing audit prep from weeks to hours, and driving measurable drops in penalties and incidents.", "HCM1359", 2, "Solution demo", 570, 590),
  mkSession(140, 3, 6, "ana", 0, "Gaining trusted 360° views for AI outcomes with the SAP Reltio solution (XBAIP1645)", "AI delivers real business outcomes only when it understands how your business operates.", "XBAIP1645", 0, "Strategy talk", 570, 615),
  mkSession(141, 3, 6, "pmgm", 0, "Improve agility and performance with total workforce management (SPM1628)", "To maximize agility, companies are shifting from filling predefined, static roles to choosing candidates with proven competencies, regardless of worker type.", "SPM1628", 0, "Strategy talk", 570, 615),
  mkSession(142, 3, 6, "ana", 0, "Industry AI: The competitive edge for consumer industries (XIND1857)", "Learn how the Industry AI portfolio embeds intelligent assistants and autonomous agents into consumer industry processes.", "XIND1857", 1, "Customer success story", 570, 615),
  mkSession(143, 3, 6, "rec", 0, "Measure what matters by connecting employee impact to talent decisions (HCM1362)", "Without visibility into workforce signals and employee contributions, recognition falters, learning ROI is hard to justify, and talent decisions turn reactive.", "HCM1362", 2, "Strategy talk", 570, 615),
  mkSession(144, 3, 6, "ana", 0, "Public services industries tour (XIND2195)", "Take a guided tour with SAP public services industry experts to discover AI-powered innovations, industry best practices, and transformative business processes.", "XIND2195", 1, "Industry tour", 570, 615),
  mkSession(145, 3, 6, "ana", 0, "Road map: Unlocking the value of AI in SAP SuccessFactors HCM (HCM1984)", "Spotlight on: Get a forward-looking view of AI across SAP SuccessFactors HCM. Preview the full road map—upcoming agent capabilities, Joule solution enhancements, and AI-powered features spanning talent, core HR, and workforce management.", "HCM1984", 0, "Roadmap", 570, 590),
  mkSession(146, 3, 6, "ec", 0, "Road map: What's next for HR operations in the age of Autonomous HCM (HCM1475)", "AI is rewriting how HR manages people.", "HCM1475", 0, "Roadmap", 570, 615),
  mkSession(147, 3, 6, "ana", 0, "Run, manage, automate: AI-enhanced innovations in HCM system administration (HCM1447)", "Discover the next generation of system administration for SAP SuccessFactors solutions, supported by AI-enhanced innovations.", "HCM1447", 2, "Solution deep dive", 570, 615),
  mkSession(148, 3, 6, "ecp", 0, "SAP Integration Suite: HCM integration for benefits, payroll, and finance (HCM1459)", "Explore specific HCM use cases for SAP Integration Suite in third-party benefits management, external payroll, and integrating organizational changes that affect budgets between HCM and SAP S/4HANA.", "HCM1459", 2, "Solution deep dive", 570, 615),
  mkSession(149, 3, 6, "ana", 0, "SAP SuccessFactors product strategy: Making Autonomous HCM a reality (HCM1328)", "Get an inside look at the product strategy for SAP SuccessFactors HCM, including how we prioritize investments, evaluate partnerships, assess trends, and shape our road map.", "HCM1328", 2, "Strategy talk", 570, 615),
  mkSession(150, 3, 6, "ec", 0, "Sky Chefs: Modernizing HR to scale for growth (HCM1511)", "Hear Sky Chefs share its HR modernization journey with SAP SuccessFactors solutions.", "HCM1511", 0, "Customer success story", 570, 590),
  mkSession(151, 3, 6, "ecp", 0, "The payroll advantage: Maximizing value from SAP SuccessFactors (PAR1008)", "Discover how integrating payroll into your strategy for SAP SuccessFactors solutions maximizes business value.", "PAR1008", 2, "Strategy talk", 570, 590),
  mkSession(152, 3, 8, "scm", 0, "Explore Southwire’s approach to building the foundation for career growth (HCM1841)", "Learn how Southwire is building the foundation for a connected career experience that helps salaried team members explore growth opportunities, understand career pathways, and take ownership of their development journey.", "HCM1841", 0, "Customer success story", 600, 620),
  mkSession(153, 3, 8, "ana", 0, "Starting smart: How Lockheed Martin got Joule adoption off the ground (HCM1915)", "Lockheed Martin accelerated adoption of the Joule solution by focusing on high-value use cases of the SAP SuccessFactors Employee Central solution that simplify everyday HR work.", "HCM1915", 0, "Customer success story", 600, 620),
  mkSession(154, 3, 8, "ana", 0, "The road ahead: Navigate the future of work with our Advanced Success Plan (HCM1748)", "Discover how the Advanced Success Plan version for SAP SuccessFactors HCM can serve as your GPS for navigating transformation.", "HCM1748", 0, "Strategy talk", 600, 620),
  mkSession(155, 2, 22, "ana", 1, "How SAP is driving better decisions with faster insights and governed data (HCM1871)", "Learn how the SAP IT team stopped building dashboards and started governing data; with the SAP Business Data Cloud solution and People Intelligence, fragmented HR reporting became a governed, AI-ready foundation.", "HCM1871", 0, "Customer success story", 870, 890),
  mkSession(156, 3, 9, "ec", 1, "Streamline position management with AI, automation, and self-service tools​ (HCM1700)", "This hands-on lab explores position management in the SAP SuccessFactors Employee Central solution. Learn to perform mass updates to position data and complete self-service transactions.", "HCM1700", 2, "Hands-on lab", 630, 705),
  mkSession(157, 3, 9, "ana", 1, "Uncover HR insights with story reports in SAP SuccessFactors solutions (HCM1702)", "Designed for reporting administrators, this hands-on lab session can help you take reporting to the next level.", "HCM1702", 2, "Hands-on lab", 630, 705),
  mkSession(158, 3, 9, "ana", 1, "Workshop: Shaping the future of workforce planning (HCM1338)", "AI is changing work at scale: organizations that redesign roles proactively execute transformation with greater speed and confidence.", "HCM1338", 0, "Workshop‎", 630, 690),
  mkSession(160, 3, 10, "ana", 0, "Close the AI readiness gap and accelerate your HCM AI journey (HCM1749)", "AI value starts with readiness, not just technology. Identify gaps across data, processes, governance, and change management, pinpointing where your organization needs to focus.", "HCM1749", 0, "Customer success story", 645, 690),
  mkSession(161, 3, 10, "ana", 0, "Connect everything, remove barriers: What’s new in SAP Integration Suite (XBAIP1201)", "Getting ready for AI doesn’t mean starting over. Take a tour of the latest SAP Integration Suite innovations, such as AI-enabled automation, advanced event mesh, and no- and low-code tools for connecting SAP and third-party systems.", "XBAIP1201", 0, "Strategy talk", 645, 690),
  mkSession(162, 3, 10, "rec", 0, "Drive growth from within: Develop, deploy, and retain top talent (HCM1364)", "Protect critical talent by turning growth opportunities into your retention advantage. Learn how agentic experiences help you build internal pipelines and invest in targeted development that keeps employees engaged.", "HCM1364", 0, "Strategy talk", 645, 690),
  mkSession(163, 3, 10, "pmgm", 0, "Extending HCM agents with Joule Studio: A performance management use case (HCM1464)", "As you look to increase employee productivity with AI, it is key to identify areas requiring customization based on your business needs. Get an overview of the SAP solutions that enable extensibility and AI for your HCM solutions.", "HCM1464", 1, "Strategy talk", 645, 690),
  mkSession(164, 3, 10, "ana", 0, "From principles to practice: Operationalizing responsible AI in HR (HCM1411)", "Take a practical look at how SAP SuccessFactors solutions help HR teams govern AI responsibly, including explainability features, bias monitoring, usage transparency, and the capabilities in the SAP AI Agent Hub solution that keep humans in control of consequential people decisions.", "HCM1411", 0, "Solution deep dive", 645, 690),
  mkSession(165, 3, 10, "ana", 0, "Goods, services, and talent: Enhance outcomes with cohesive control (SPM1620)", "Today’s procurement leaders need a unified approach to effectively manage enterprise spend.", "SPM1620", 0, "Solution deep dive", 645, 690),
  mkSession(167, 3, 10, "onb", 0, "See how to unlock new hire success from day one with agentic onboarding (HCM1430)", "Explore how agentic AI drives the onboarding journey to connect people, processes, and data, delivering personalized experiences that boost productivity.", "HCM1430", 2, "Solution deep dive", 645, 690),
  mkSession(168, 3, 10, "time", 0, "When every shift counts: Transforming workforce scheduling in manufacturing (HCM1493)", "When production plans change, your workforce schedule should too.", "HCM1493", 2, "Solution deep dive", 645, 690),
  mkSession(169, 3, 10, "ana", 0, "Wipro: Accelerating AI’s impact across the employee lifecycle (HCM1869)", "Hear Wipro, a global technology services company, share how AI is powering an intelligent, employee-centric digital experience.", "HCM1869", 0, "Customer success story", 645, 690),
  mkSession(170, 3, 11, "ana", 0, "Jabil and the Autonomous Enterprise: Built on trusted business data (XBAIP1643)", "Everyone claims a context layer. Few can capture how a global manufacturer runs.", "XBAIP1643", 0, "Customer success story", 660, 680),
  mkSession(171, 3, 11, "ec", 0, "TELUS cut 90% of manual HR approvals—learn how it got there (HCM1897)", "Rolling out a new HRIS is hard. Keeping it running is harder. Discover how TELUS unified its workforce on a single HR platform, cut manual approvals by 90%, and turned go-live into a foundation built for long-term scale.", "HCM1897", 0, "Customer success story", 660, 680),
  mkSession(172, 3, 11, "ana", 1, "Unlock workforce insights across the talent lifecycle: People Intelligence (HCM1692)", "See a live demo of People Intelligence and learn how it automatically connects data from SAP SuccessFactors HCM to deliver insights across hiring, retention, skills, and compensation.", "HCM1692", 0, "Solution demo", 660, 680),
  mkSession(173, 3, 12, "ana", 0, "Connect systems across the enterprise to keep the business flowing smoothly (XBAIP1878)", "See how an SAP customer uses SAP Integration Suite to connect SAP and third-party systems across its enterprise.", "XBAIP1878", 0, "Customer success story", 690, 710),
  mkSession(174, 3, 12, "ecp", 0, "Delivering the impossible: Transforming payroll, time, and benefits (PAR1030)", "A people-centric approach to transforming payroll, time, and benefits at scale demands bold thinking and strong partnership.", "PAR1030", 1, "Customer success story", 690, 710),
  mkSession(175, 3, 12, "ec", 0, "Organizational modeling in action: Tips and best practices (HCM1485)", "Ready to put organizational modeling to work? See how the SAP SuccessFactors Employee Central solution helps you simulate restructures, assess impact, and plan with confidence before you commit.", "HCM1485", 0, "Quick tips", 690, 710),
  mkSession(177, 3, 14, "ana", 0, "Autonomous Adaptive Production: How Industry AI drives measurable outcomes (XIND1817)", "Leaders are driving business value from the Industry AI portfolio.", "XIND1817", 1, "Customer success story", 705, 750),
  mkSession(178, 3, 14, "ecp", 0, "Autonomous payroll in action: Global compliance, every pay run (HCM1492)", "What if payroll could anticipate issues before they became employee concerns?", "HCM1492", 2, "Solution deep dive", 705, 750),
  mkSession(179, 3, 14, "lms", 0, "Building an adoption strategy for AI experiences in learning and talent (HCM1407)", "Uncover how organizations are creating adoption strategies that increase awareness, encourage usage, and help employees get value from learning and talent AI experiences in SAP SuccessFactors solutions.", "HCM1407", 1, "Strategy talk", 705, 750),
  mkSession(180, 3, 14, "rec", 0, "Build the blueprint to your recruiting strategy transformation (HCM1750)", "Turn your recruiting transformation into an actionable plan that accelerates time to value for your talent acquisition strategy.", "HCM1750", 0, "Roadmap", 705, 750),
  mkSession(181, 2, 26, "ana", 0, "Extending HCM solutions with SAP Business AI Platform: Deep dive (HCM1500)", "Find out how SAP Business AI Platform helps SAP SuccessFactors HCM customers extend HCM solutions.", "HCM1500", 0, "Solution deep dive", 945, 990),
  mkSession(182, 2, 10, "ana", 0, "How SAP project teams deliver faster with SAP Joule for Consultants (XJOU1400)", "Discover how IT teams can accelerate SAP projects and cloud transformations with on-demand answers and guidance grounded in exclusive, expertly curated SAP knowledge with the SAP Joule for Consultants solution.", "XJOU1400", 0, "Customer success story", 645, 690),
  mkSession(183, 3, 14, "ana", 0, "Mill products and chemicals industry tour (XIND2191)", "Join the tour to see innovations and roadmap relevant metals, building materials, packaging, and chemicals.", "XIND2191", 1, "Industry tour", 705, 750),
  mkSession(184, 3, 14, "ana", 0, "Road map and vision: Unlocking the value of AI in SAP SuccessFactors HCM (HCM1418)", "Get a forward-looking view of AI across SAP SuccessFactors HCM. Preview the full road map—upcoming agent capabilities, Joule solution enhancements, and AI-powered features spanning talent, core HR, and workforce management.", "HCM1418", 1, "Roadmap", 705, 750),
  mkSession(185, 3, 14, "rec", 0, "Road map: Hire the right talent faster in the age of Autonomous HCM (HCM1426)", "Get an inside look at the product vision and road map for intelligent talent acquisition solutions. Discover how AI assistants and agents offer automation and insights to help you attract, engage, hire, and onboard top talent.", "HCM1426", 2, "Roadmap", 705, 750),
  mkSession(186, 3, 14, "ec", 0, "Road map: Leverage an enterprise AI foundation in the age of Autonomous HCM (HCM1444)", "Explore the innovations powering SAP SuccessFactors HCM. Discover the transformative power of agentic AI on SAP Business AI Platform, alongside key innovations in integration, extensibility, security, and system administration.", "HCM1444", 0, "Roadmap", 705, 750),
  mkSession(187, 3, 14, "ana", 0, "Running HR agents securely: From architecture to action (HCM1465)", "AI agents in HR now take action, approving requests and updating records, without a human in the loop. That power is exciting, but it also raises the stakes for how HR data and processes are protected.", "HCM1465", 1, "Strategy talk", 705, 750),
  mkSession(188, 3, 14, "time", 0, "Staff, track, bill: The full project lifecycle for professional services (HCM1494)", "In professional services, every unbilled hour is lost revenue.", "HCM1494", 2, "Solution deep dive", 705, 750),
  mkSession(189, 3, 16, "ana", 0, "How to use SAP Business AI Platform to extend HCM: Use case highlights (HCM1466)", "Learn how SAP Business AI Platform can address common use cases for extensibility, highlighting actual customer scenarios and what solutions were involved.", "HCM1466", 0, "Quick tips", 720, 740),
  mkSession(190, 3, 16, "ana", 0, "Joule: Enterprise-scale AI built on interoperability and trust (XJOU1696)", "Create a unified AI experience across SAP and third-party systems through open standards Agent2Agent (A2A) and model context protocol (MCP), Microsoft 365 Copilot integration, and SAP Joule action bar.", "XJOU1696", 0, "Strategy talk", 720, 740),
  mkSession(191, 3, 16, "scm", 1, "Seagate's job and skill architecture by Cobrainer (PAR1017)", "A talent intelligence hub only delivers full value when using governed job and skill data.", "PAR1017", 0, "Customer success story", 720, 740),
  mkSession(192, 3, 17, "ana", 0, "Less admin, more impact: Modernizing employee document management (PAR1029)", "Employee documents touch every HR process, yet many organizations still rely on manual, disconnected systems that create risk and slow down HR.", "PAR1029", 1, "Customer success story", 750, 770),
  mkSession(193, 3, 17, "ana", 1, "Quick tips to analyze and close pay gaps with pay transparency insights (HCM1694)", "Does your organization have what it needs to meet the EU reporting requirements?", "HCM1694", 0, "Quick tips", 750, 770),
  mkSession(194, 3, 17, "ecp", 0, "Quick tips: Tools and proven practices for your HCM cloud migration (HCM1327)", "Harness key tools, assets, and services that support every stage of your HCM cloud migration journey.", "HCM1327", 0, "Quick tips", 750, 770),
  mkSession(195, 3, 18, "ecp", 0, "Best practices and insights from AMD and Cameco on HR cloud migration (HCM1329)", "Hear from customers who have navigated their move from the SAP ERP Human Capital Management solution on-premises to SAP SuccessFactors HCM.", "HCM1329", 0, "Customer success story", 780, 825),
  mkSession(196, 3, 18, "rec", 0, "Build operational resilience through compliance Iearning (HCM1352)", "Every organization has roles that can't stay vacant and compliance requirements that can't slip. Learn how AI continuously identifies compliance needs, keeps certifications current, and retains critical expertise inside the business.", "HCM1352", 0, "Solution deep dive", 780, 825),
  mkSession(197, 3, 18, "rec", 0, "Cleared for takeoff: How Ryanair scales hiring for 200,000+ applications (HCM1910)", "With 10,000 hires ahead and 200,000+ applications a year, Ryanair knew a bigger recruiting team wasn’t the answer.", "HCM1910", 0, "Customer success story", 780, 825),
  mkSession(198, 3, 18, "ana", 1, "Five ways talent leaders win with story reports (HCM1691)", "Learn five proven ways talent leaders are using story reports in SAP SuccessFactors HCM to drive better decisions.", "HCM1691", 2, "Solution deep dive", 780, 825),
  mkSession(199, 3, 18, "onb", 0, "Hands-on challenge: Put Joule and agentic AI to work across HR (HCM1701)", "Ready for a challenge? Compete with fellow HCM professionals to see which team can complete AI-powered HR scenarios first.", "HCM1701", 1, "Hands-on lab", 780, 855),
  mkSession(200, 3, 18, "ana", 0, "Inside SAP: Turning AI and transformation into enterprise value (XBAIP1665)", "Enterprise transformation only succeeds when strategy, processes, and AI move in sync.", "XBAIP1665", 2, "Customer success story", 780, 825),
  mkSession(201, 3, 18, "ana", 0, "Joule explained: Reshape how work gets done across your business (XJOU1398)", "Learn how Joule, SAP’s portfolio-wide AI solution, includes capabilities to help you advance toward the Autonomous Enterprise.", "XJOU1398", 0, "Strategy talk", 780, 825),
  mkSession(202, 3, 18, "ecp", 0, "Lumen: Payroll modernization at scale (HCM1902)", "Payroll is the highest-stakes call in HR—every employee feels the result. Hear Lumen share what global payroll modernization demanded: navigating complex integrations, aligning teams, and protecting payroll accuracy at scale.", "HCM1902", 0, "Customer success story", 780, 800),
  mkSession(203, 3, 18, "ana", 0, "Practical tips for governing HR agents with SAP AI Agent Hub (HCM1416)", "Get actionable tips for using the SAP AI Agent Hub solution to monitor, configure, and govern AI agents in SAP SuccessFactors solutions.", "HCM1416", 0, "Quick tips", 780, 800),
  mkSession(204, 3, 18, "ana", 0, "Project-centric industries tour (XIND2194)", "Take a guided tour with SAP services industries experts to discover how AI-powered innovations can boost margins, optimize resources, and improve client satisfaction.", "XIND2194", 1, "Industry tour", 780, 825),
  mkSession(205, 3, 18, "rec", 0, "Road map: Accelerate employee growth in the age of Autonomous HCM (HCM1356)", "Look ahead to learn how SAP SuccessFactors solutions for learning and talent management are shaping the future of Autonomous HCM.", "HCM1356", 0, "Roadmap", 780, 825),
  mkSession(206, 3, 18, "time", 0, "Road map: Compliant workforce management in the age of Autonomous HCM (HCM1968)", "Get a first look at what's coming for workforce management. From AI scheduling to new agents for time and absence, explore the innovations that cut overtime, overstaffing, and payroll errors.", "HCM1968", 0, "Roadmap", 780, 825),
  mkSession(207, 3, 18, "ana", 0, "Road map: Secure, compliant HCM with SAP NS2 in regulated industries (HCM1745)", "AI is transforming HCM in regulated industries, improving workforce experiences while meeting strict security and compliance needs.", "HCM1745", 0, "Roadmap", 780, 825),
  mkSession(208, 3, 1, "ecp", 0, "Unlock payroll insights with the enhanced payroll control center (HCM1698)", "Get hands-on with managing payroll activities in the payroll control center (PCC). Build custom charts to compare payroll results across periods, drill down to employee-level details, and access pay slips directly.", "HCM1698", 0, "Hands-on lab", 780, 840),
  mkSession(209, 3, 18, "lms", 0, "Workshop: Connect talent investments to business outcomes (HCM1906)", "Learning and development investments are critical to the success of your people and organization, but are you able to effectively measure the ROI of these initiatives?", "HCM1906", 0, "Workshop‎", 780, 840),
  mkSession(210, 3, 18, "rec", 0, "Workshop: What’s next for the role of the recruiter (HCM1333)", "AI and automation have fundamentally reshaped the recruiting function—but how has this transformation impacted the role of the recruiter?", "HCM1333", 0, "Workshop‎", 780, 840),
  mkSession(211, 3, 20, "rec", 0, "Acuity Brands: Guiding employees through key moments in SAP SuccessFactors (HCM2006)", "Employees rely on SAP SuccessFactors solutions for some of their most important workplace interactions.", "HCM2006", 1, "Customer success story", 810, 830),
  mkSession(212, 3, 20, "rec", 0, "SAP runs SAP: Recruiting with SmartRecruiters solutions and agentic AI (HCM1278)", "Discover how SAP adopted SmartRecruiters solutions and is creating a next-generation recruiting ecosystem that combines talent data, workforce intelligence, and agentic AI.", "HCM1278", 1, "Customer success story", 810, 830),
  mkSession(213, 3, 21, "rec", 0, "Accelerate hiring transformation with AI (HCM1982)", "Discover how intelligent hiring solutions enable organizations to source the right candidates faster, convert qualified candidates more efficiently, and elevate every hiring experience.", "HCM1982", 0, "Solution demo", 840, 860),
  mkSession(214, 3, 21, "ec", 0, "One platform, one people strategy: How Vale transformed global HR (HCM1930)", "What does it take to unify HR globally and make it AI-ready?", "HCM1930", 0, "Customer success story", 840, 860),
  mkSession(215, 3, 22, "ana", 0, "2027 and beyond: Future of work predictions reality check (HCM1983)", "Last year’s predictions were full of provocative takes. What happened, what didn’t, and what's next?", "HCM1983", 1, "Solution demo", 870, 890),
  mkSession(216, 3, 22, "ana", 1, "Accelerate the value of HR analytics with People Intelligence (HCM1693)", "People Intelligence unlocks a connected chain: skills gaps become visible, development needs are clear, talent deployment is optimized, and pay is tied to real contribution.", "HCM1693", 0, "Quick tips", 870, 890),
  mkSession(217, 3, 22, "onb", 0, "Ask the experts: Hire and onboard faster with talent acquisition solutions (HCM1427)", "Bring your toughest hiring questions to the people who know the answers. In an open forum, product experts tackle your questions on agentic talent acquisition, AI, migration, integration, and skills-based hiring.", "HCM1427", 1, "Ask the expert", 870, 915),
  mkSession(218, 3, 22, "ana", 0, "From UI to intent: SAP’s agentic UX strategy for the Autonomous Enterprise (XPUC1754)", "As AI reshapes the enterprise, SAP's UX strategy puts human intent at the center of autonomous, agentic, and multimodal Joule solution experiences, turning complexity into clarity and technology into measurable business value.", "XPUC1754", 0, "Strategy talk", 870, 915),
  mkSession(219, 3, 22, "ana", 0, "How Deloitte scaled recognition to its 200,000 professionals with SAP BDC (XBAIP1646)", "See how Deloitte and Semos Cloud built a recognition hub for more than 200,000 professionals on SAP Business AI Platform.", "XBAIP1646", 0, "Customer success story", 870, 915),
  mkSession(220, 3, 22, "ana", 0, "How SAP's AI evidence engine turns everyday work into meaningful insights (HCM1412)", "SAP's AI evidence engine reads work signals like Microsoft Teams messages, emails, and calendars to help build a living, synthesized narrative using agents like the Performance Intelligence Agent and Skills Evidence Agent.", "HCM1412", 0, "Solution deep dive", 870, 915),
  mkSession(221, 3, 22, "ana", 0, "Navigating the era of AI-native enterprise architecture with SAP LeanIX (XBAIP1667)", "Explore the capabilities we’re building to help you plan, design, and manage AI-enabled change in your organization.", "XBAIP1667", 0, "Strategy talk", 870, 890),
  mkSession(222, 3, 22, "rec", 0, "Road map: Develop your people in the age of Autonomous HCM (HCM1358)", "Look ahead to learn how proactive AI experiences are shaping the future of skills, learning, and talent development.", "HCM1358", 0, "Roadmap", 870, 915),
  mkSession(223, 3, 22, "ana", 0, "Streamline HCM processes with  workflows and automation using SAP Build (HCM1463)", "Look in depth at process automation with the SAP Build solution. Learn how to create automation and workflows with the low-code/no-code tool to streamline complex processes, based on real-world customer examples and use cases.", "HCM1463", 0, "Solution deep dive", 870, 915),
  mkSession(224, 3, 22, "ana", 0, "The human side of AI: Elevating HR's impact in the Autonomous Enterprise (HCM1395)", "As AI adoption accelerates, HR is uniquely positioned to connect technology investments with workforce and business outcomes.", "HCM1395", 1, "Strategy talk", 870, 890),
  mkSession(225, 3, 22, "ec", 0, "What it really takes: HR transformation at QuikTrip and Fujitsu (HCM1901)", "HR transformation doesn't end at go-live—it begins there. Hear QuikTrip and Fujitsu share what it really took: two industries, two scales, and years of real-world implementation decisions.", "HCM1901", 0, "Customer success story", 870, 915),
  mkSession(226, 'tbd', null, "lms", 0, "Accelerate talent and learning impact (HCM2038)", "Experience how agentic AI across the talent lifecycle can help your organization align workforce plans to business needs.", "HCM2038", 0, "Demo station", null, null),
  mkSession(227, 'tbd', null, "ana", 0, "Activate Joule Assistants and Joule Agents for HCM (HCM2033)", "Learn how to activate Joule Assistants and Joule Agents in SAP SuccessFactors HCM. Get a step-by-step walk-through of tools, tips, and enablement best practices.", "HCM2033", 0, "Demo station", null, null),
  mkSession(228, 'tbd', null, "ana", 0, "Agent Lab (XBAIP2175)", "Step into the world of AI agents and see what’s possible when AI can understand business context, reason across data and processes, and take action.", "XBAIP2175", 1, "Demo station", null, null),
  mkSession(229, 'tbd', null, "ana", 1, "Agent-led toolchain: Transform to become an autonomous enterprise. (X2261)", "Reduce your transformation debt and risks by accelerating outcomes and turning operational insights into actions.", "X2261", 1, "Demo station", null, null),
  mkSession(230, 'tbd', null, "ana", 0, "Boost your HR system administration with AI agents (HCM2040)", "Discover the power of AI in system administration for SAP SuccessFactors HCM. Explore how AI agents now automate configuration transports and streamline role-based permissions management.", "HCM2040", 1, "Demo station", null, null),
  mkSession(231, 'tbd', null, "ana", 0, "Build: Create connected agents, apps, and workflows. (XBAIP2159)", "Discover how the build capabilities of SAP Business AI Platform provide the tools to develop AI-enabled applications, agents, and workflows to extend applications and quickly meet business needs.", "XBAIP2159", 1, "Demo station", null, null),
  mkSession(232, 'tbd', null, "ana", 0, "Build inclusive workplaces with AI and SAP solutions (X2115)", "Most organizations have diversity data. Few can act on it.", "X2115", 1, "Demo station", null, null),
  mkSession(233, 'tbd', null, "ana", 0, "Connect, extend, and automate HR processes faster (HCM1467)", "Need to integrate external service providers, legacy systems, or complex business rules into your HR workflows? See how SAP Business AI Platform helps you connect, extend, and automate HR processes faster.", "HCM1467", 1, "Demo station", null, null),
  mkSession(234, 'tbd', null, "ec", 0, "Connect HR and finance to drive business growth (HCM2037)", "The best results happen when HR and finance move as one. See how you can drive business growth by connecting HR and finance to create a more unified approach to workforce and business planning.", "HCM2037", 0, "Demo station", null, null),
  mkSession(235, 'tbd', null, "ana", 0, "Contextualize & Reason: Build your data foundation for agentic AI. (XBAIP2160)", "Enable AI to understand your business, not just your data.", "XBAIP2160", 1, "Demo station", null, null),
  mkSession(236, 'tbd', null, "ana", 0, "Discover the Industry AI portfolio (XIND2224)", "Visit the industry AI demo station and see how SAP’s autonomous, industry-native agents are transforming end-to-end processes—from asset management and adaptive production to unified commerce in co-innovation with our selected customers.", "XIND2224", 1, "Demo station", null, null),
  mkSession(237, 'tbd', null, "ana", 0, "Drive better business value with Industry AI (XIND2158)", "Discover how the Industry AI portfolio brings industry-specific intelligence, business context, and AI-enabled capabilities into the processes that matter most.", "XIND2158", 1, "Demo station", null, null),
  mkSession(238, 'tbd', null, "ana", 1, "Drive growth with workforce analytics and planning (HCM2039)", "Experience how contextual, readily available insights can help your HR team and leaders make more impactful people decisions.", "HCM2039", 1, "Demo station", null, null),
  mkSession(239, 'tbd', null, "rec", 0, "Experience agentic screening with Winston Interview (HCM2034)", "Step into the candidate experience and meet Winston, your AI interviewer.", "HCM2034", 0, "Demo station", null, null),
  mkSession(240, 'tbd', null, "ecp", 0, "Experience how SAP is building the Autonomous Enterprise (XSRS2013)", "Discover how SAP uses SAP Business AI Platform, the SAP Business Data Cloud solution, SAP Business AI, the Joule solution, and SAP SuccessFactors solutions to transform business processes and drive innovation.", "XSRS2013", 1, "Demo station", null, null),
  mkSession(241, 'tbd', null, "ana", 0, "Experience SAP's AI-powered mobile apps and Joule Work mobile. (XPUC1811)", "Get to know SAP´s latest AI infused mobile apps, including Joule Work mobile, see demos of the apps, and try them out.", "XPUC1811", 1, "Demo station", null, null),
  mkSession(242, 'tbd', null, "ana", 0, "Explore SAP’s AI-native agentic user experience (XPUC1814)", "Look at where user experience for the Autonomous Enterprise is headed, and how SAP is leading the way, with the AI-native Joule Work engagement layer experiences complementing existing application experiences", "XPUC1814", 1, "Demo station", null, null),
  mkSession(243, 'tbd', null, "ana", 0, "Explore solutions for your industry (XIND2157)", "Learn how SAP helps your industry run better—from industry-specific solutions to capabilities across lines of business and beyond.", "XIND2157", 1, "Demo station", null, null),
  mkSession(244, 'tbd', null, "ana", 0, "From Competition to Collaboration (X2236)", "Experience what it takes to move from competition to collaboration through the lens of a multi-purpose arena at the SAP Connect Experience Center.", "X2236", 1, "Demo station", null, null),
  mkSession(245, 'tbd', null, "ana", 0, "Get hands-on with our Future of Work Research Lab (HCM2041)", "How are you feeling about the future of work? The doctor is in! Meet the Future of Work Research Lab team of scientists for a hands-on opportunity to explore AI’s impact on workers, teams, and organizations.", "HCM2041", 0, "Demo station", null, null),
  mkSession(246, 'tbd', null, "ana", 0, "Govern: Drive AI at scale with built-in governance. (XBAIP2161)", "AI at scale starts with AI you can trust.", "XBAIP2161", 1, "Demo station", null, null),
  mkSession(247, 'tbd', null, "onb", 0, "Hire and onboard the right talent faster (HCM2042)", "See how agentic talent acquisition helps you intelligently source, screen, hire, and onboard top talent with ease.", "HCM2042", 0, "Demo station", null, null),
  mkSession(248, 'tbd', null, "ana", 0, "Introducing the Joule solution (XJOU2294)", "Learn how SAP is advancing toward the Autonomous Enterprise—a vision where AI doesn’t just assist people, it executes on their behalf. Joule is central to how SAP makes this vision a reality.", "XJOU2294", 0, "Demo station", null, null),
  mkSession(249, 'tbd', null, "ana", 0, "It's the beginning of stronger teams and better outcomes. (HCM2049)", "See how SAP Services and Support helps organizations use intelligent technologies within human capital management to optimize operations, accelerate adoption, enhance employee experiences, and gain predictive insights for workforce planning and talent management.", "HCM2049", 1, "Demo station", null, null),
  mkSession(250, 'tbd', null, "ecp", 0, "Pay your global workforce accurately, every time (HCM2036)", "Discover how a connected, agentic payroll and workforce management experience helps your global workforce get paid accurately and on time.", "HCM2036", 0, "Demo station", null, null),
  mkSession(251, 'tbd', null, "ana", 0, "Rate your favorite SAP products: Write a review (X2152)", "Your opinion matters. SAP partners with TrustRadius, an online review site, to capture our customers’ voices. You can share your in-depth insights and feedback through a 10-minute survey.", "X2152", 1, "Demo station", null, null),
  mkSession(252, 'tbd', null, "ec", 2, "Retain top talent with strategic total rewards (HCM2043)", "See how you can build, manage, and continuously optimize compensation and benefits programs grounded in transparency, consistency, and data-driven decisions.", "HCM2043", 0, "Demo station", null, null),
  mkSession(253, 'tbd', null, "ana", 0, "SAP Joule for Consultants solution (XJOU2292)", "SAP Joule for Consultants is a conversational AI solution that accelerates SAP projects with expert guidance from SAP's most exclusive and up-to-date knowledge base.", "XJOU2292", 0, "Demo station", null, null),
  mkSession(254, 'tbd', null, "ana", 0, "Shape the future of SAP UX. (XPUC2155)", "Explore research-powered innovation shaping today’s UX and tomorrow’s possibilities—and learn how you can help define the future of intelligent UX.", "XPUC2155", 1, "Demo station", null, null),
  mkSession(255, 'tbd', null, "ec", 0, "Simplify HR operations and HR service delivery (HCM2035)", "See how you can manage your entire workforce and the employee lifecycle with accurate, compliant, and consistent data.", "HCM2035", 0, "Demo station", null, null),
  mkSession(256, 'tbd', null, "lms", 1, "Take the WalkMe Challenge (XBAIP2154)", "Discover how WalkMe solutions help people adopt SAP solutions—from SAP S/4HANA Cloud to the Joule solution—in the flow of work.", "XBAIP2154", 1, "Demo station", null, null),
  mkSession(257, 'tbd', null, "ana", 0, "The BTM Value Challenge (XBAIP2153)", "Play this three-to-four minute timebox-intensive game to experience AI-enabled capabilities in SAP Signavio solutions.", "XBAIP2153", 1, "Demo station", null, null),
  mkSession(258, 'tbd', null, "lms", 0, "Upskill smarter with AI-assisted learning. (X2151)", "Discover interactive learning that helps you build real-world experiences with SAP solutions. Explore the Autonomous Enterprise through hands-on scenarios with AI-enabled role plays and a study companion.", "X2151", 1, "Demo station", null, null),
  mkSession(259, 'tbd', null, "pmgm", 0, "WalkMe solutions: the people part of AI. Turn investment into performance. (X2382)", "Turn AI adoption into performance every step of the way to the Autonomous Enterprise.", "X2382", 1, "Demo station", null, null),
  mkSession(260, 2, 6, "ana", 1, "Opening session live studio: Bringing the Autonomous Enterprise to life (X1987)", "The Autonomous Enterprise is making SAP’s vision a reality: AI grounded in data, connected across processes, and governed to fit how businesses run. Get insights from SAP leaders discussing the announcements of the central keynote and bring your questions.", "X1987", 1, "Ask the expert", 560, 590),
  mkSession(261, 2, 9, "ana", 0, "From intent to action at scale: Becoming an autonomous enterprise (X1988)", "AI-enabled ERP solutions are no longer just a promise—they’re already here. As AI reshapes enterprises, SAP’s strategy is to turn complexity into clarity. Discover how connected AI, trusted data, and end-to-end workforce experiences help organizations empower their people and achieve measurable business value.", "X1988", 1, "Ask the expert", 625, 630),
  mkSession(262, 2, 17, "ana", 1, "AI in weeks: The fast path to AI-ready ERP core with SAP GROW offerings (X3038)", "Most AI transformations stall in planning. This session shows how to go live in just weeks with SAP AI-ready finance, spend, and HCM at a predictable cost, and expand into the SAP Autonomous Suite as you scale. See how to start where you need to with a partner support model that accelerates local rollout.", "X3038", 1, "Strategy talk", 750, 770),
  mkSession(263, 2, 22, "ec", 1, "Mission ready: How Systems Planning & Analysis positioned HR for growth (HCM2317)", "As a fast-growing, private equity-owned defense contractor, Systems Planning & Analysis (SPA) needed an HR system that could keep pace. Learn how SPA deployed SAP SuccessFactors HCM in nine months, creating a unified HR foundation for efficiency, compliance, M&A integration, and scale. Hear advice for system change in a quickly growing company. Eligible for 0.75 Professional Development Credit (PDC) through SHRM (Society for Human Resource Management). Attendees must attend the entire session to receive credit.", "HCM2317", 0, "Customer success story", 870, 915),
  mkSession(264, 2, 22, "rec", 1, "Schwarz: Smarter hiring, faster with SmartRecruiters for SAP SuccessFactors (HCM2290)", "Hiring transformation requires new capabilities, visibility, and alignment with business priorities. Hear how Schwarz is using the SmartRecruiters for SAP SuccessFactors solution to accelerate hiring with embedded AI, automation, and real-time insights, boosting speed and outcomes while building momentum as part of the ecosystem.", "HCM2290", 0, "Customer success story", 870, 915),
  mkSession(265, 2, 25, "ana", 1, "The competitive edge: Exploring the Autonomous Enterprise (X1989)", "AI technology is already helping enterprises boost performance—making AI adoption more vital than ever for companies wanting to protect their competitive advantage. Learn how the Autonomous Enterprise brings together AI engagement, intelligent business execution, and a governed AI foundation to help organizations stay ahead with SAP solutions.", "X1989", 1, "Ask the expert", 925, 940),
  mkSession(266, 2, 26, "scm", 0, "EY: Unlocking the exceptional talent experience (HCM1840)", "What does it take to deliver one of the world's largest SAP SuccessFactors implementations? EY shares lessons learned from transforming the talent experience for more than 400,000 people across 150+ countries. Explore the realities of global deployment, adoption, and change at scale, and learn what the organization would do differently today. Eligible for 0.75 Professional Development Credit (PDC) through SHRM (Society for Human Resource Management). Attendees must attend the entire session to receive credit.", "HCM1840", 0, "Customer success story", 945, 990),
  mkSession(267, 3, 0, "ana", 0, "Connect everything to help achieve anything with SAP Autonomous Suite (X1990)", "Discover how SAP Business AI Platform and the Joule solution work together to create a unified AI experience and provide the foundation for the Autonomous Enterprise. See how AI agents, automation, and business processes can work together to simplify operations, boost productivity, and drive better business outcomes.", "X1990", 1, "Ask the expert", 480, 500),
  mkSession(268, 3, 3, "ec", 0, "Seven ways agentic AI transforms HR operations and the way work gets done (HCM1484)", "AI agents don't just support HR work, they change what HR can accomplish. Explore seven ways agentic AI removes friction across data accuracy, compliance, and employee support, freeing HR teams to focus on decisions, not just execution. Because the future of HR isn't doing more with less, it's doing what only HR can do.", "HCM1484", 0, "Solution deep dive", 495, 540),
  mkSession(269, 3, 12, "ec", 1, "Growing pains to growing engine: How ZS rebuilt its HR foundation for scale (HCM1899)", "Rapid growth is a good problem until your HR infrastructure becomes the bottleneck. With 15,000 employees in 40+ offices, ZS faced a foundation that couldn't scale with its ambitions. See how ZS reimplemented SAP SuccessFactors solutions to simplify work, future-proof its people infrastructure, and unlock AI-ready capabilities without slowing down. Eligible for 0.25 Professional Development Credit (PDC) through SHRM (Society for Human Resource Management). Attendees must attend the entire session to receive credit.", "HCM1899", 0, "Customer success story", 690, 710),
  mkSession(270, 3, 22, "bpaas", 0, "Moving payroll to the cloud: Lessons from Strada’s own transformation (PAR1020)", "Moving payroll to the cloud at scale should feel seamless to the business. Drawing on 150+ customer migrations to SAP Private Cloud Edition, Strada shares how to protect payroll continuity from strategy through go-live, managed services and optimization — building the foundation for SAP Business AI and Autonomous HCM.", "PAR1020", 1, "Strategy talk", 870, 890),
  mkSession(271, 'tbd', null, "ana", 0, "Joule Work (XJOU2293)", "Joule Work is the new front door to your business. It’s a central workspace where people express a goal and AI takes the required actions across systems and domains to get it done. See a live demo and speak to SAP experts to learn how your people can spend more time on outcomes and less time navigating tools.", "XJOU2293", 0, "Demo station", null, null),
  mkSession(272, 'tbd', null, "ana", 0, "Transform HR with Joule Assistants and Joule Agents (HCM2032)", "See Joule Assistants and Joule Agents working across SAP SuccessFactors HCM. Experience how assistants and agents handle complex workflows in recruiting, onboarding, performance, payroll, and more. Get a clear vision of how the Joule solution helps HR teams reduce manual effort, make more informed decisions, and deliver strategic outcomes at scale.", "HCM2032", 0, "Demo station", null, null),
];

function scoreSession(session, rankedModules, selectedSubs) {
  let score = 0;
  const matches = [];
  const idx = rankedModules.indexOf(session.module);
  if (idx !== -1) {
    score += (rankedModules.length - idx) * 2;
    matches.push(modName(session.module));
  }
  const subKey = `${session.module}:${session.sub}`;
  if (selectedSubs.has(subKey)) {
    score += 1;
    if (!matches.length) matches.push(modName(session.module));
  }
  return { score, matches };
}

// Real time-overlap check (same day, and one starts before the other ends). Two sessions can
// have different slotIdx values and still overlap once actual duration is factored in — a
// 60-minute session starting at 9:45 runs into the 10:00 slot, for instance.
function sessionsOverlap(a, b) {
  if (a.day !== b.day) return false;
  if (a.startMin == null || a.endMin == null || b.startMin == null || b.endMin == null) return false;
  return a.startMin < b.endMin && b.startMin < a.endMin;
}

// Sessions already in `schedule` that overlap this one in time. Sessions with no confirmed
// time (Not Yet Scheduled) never conflict, since there's nothing to compare yet.
function conflictingSessions(session, schedule) {
  if (session.startMin == null) return [];
  return SESSIONS.filter(
    (other) => other.id !== session.id && schedule.has(other.id) && sessionsOverlap(session, other)
  );
}


// =====================================================================================
//  Veritas Prime fixed events: meeting, booth stop, our session, ALL THAT!
// =====================================================================================
const VP_SESSION = SESSIONS.find((s) => s.title.includes(`(${VP_SESSION_CODE})`)) || null;
const DAY_SHORT = { 1: "Mon, Oct 5", 2: "Tue, Oct 6", 3: "Wed, Oct 7" };


const overlaps = (a, b) => a.day === b.day && a.startMin < b.endMin && b.startMin < a.endMin;

function meetingEvent(meeting) {
  if (!meeting) return null;
  return {
    kind: "meeting", id: "vp-meeting", day: meeting.day, startMin: meeting.startMin, endMin: meeting.startMin + MEETING_LENGTH_MIN,
    title: "Your 1:1 with Veritas Prime", location: MEETING_LOCATION,
    note: meeting.topic ? `Topic: ${meeting.topic}` : "Time with our SuccessFactors and payroll team.",
  };
}

// Finds a 30-minute gap on the show floor. Prefers the day without the 1:1 (so the booth stop isn't redundant),
// and times close to midday when the floor is busiest. Recomputed whenever the agenda changes, so it always
// lands in an open gap.
function boothEvent(schedule, meeting) {
  const busy = SESSIONS.filter((s) => schedule.has(s.id) && s.startMin != null).map((s) => ({ day: s.day, startMin: s.startMin, endMin: s.endMin }));
  const m = meetingEvent(meeting);
  if (m) busy.push(m);
  const days = meeting ? [meeting.day === 2 ? 3 : 2, meeting.day] : [2, 3];
  for (const day of days) {
    const h = FLOOR_HOURS[day];
    const starts = [];
    for (let t = h.open + 30; t + BOOTH_VISIT_MIN <= h.close; t += 15) starts.push(t);
    starts.sort((a, b) => Math.abs(a - 750) - Math.abs(b - 750));
    const hit = starts.find((t) => !busy.some((b) => overlaps({ day, startMin: t, endMin: t + BOOTH_VISIT_MIN }, b)));
    if (hit != null) return mkBooth(day, hit, !meeting);
  }
  return mkBooth(2, FLOOR_HOURS[2].close - 60, !meeting);
}
// With no 1:1 booked, the booth block becomes their held time with the team.
function mkBooth(day, startMin, meetTeam) {
  return {
    kind: "booth", id: "vp-booth", day, startMin, endMin: startMin + BOOTH_VISIT_MIN,
    label: meetTeam ? "MEET THE TEAM" : "BOOTH STOP",
    title: meetTeam ? "Meet the Veritas Prime team" : "Stop by the Veritas Prime booth",
    location: `Booth #${BOOTH_NUMBER} · Show floor`,
    note: meetTeam ? `We're holding 30 minutes for you at Booth #${BOOTH_NUMBER}. No appointment needed.` : "Meet the team between sessions.",
  };
}

function partyEvent() {
  return {
    kind: "party", id: "vp-party", day: PARTY.day, startMin: PARTY.startMin, endMin: PARTY.endMin,
    title: PARTY.name, location: PARTY.venue, note: PARTY.blurb,
  };
}

function fixedEvents({ schedule, meeting, party }) {
  const out = [];
  const m = meetingEvent(meeting);
  if (m) out.push(m);
  out.push(boothEvent(schedule, meeting));
  if (party) out.push(partyEvent());
  return out;
}

// Session conflicts plus overlaps with the 1:1 (the booth stop moves itself, so it never conflicts).
function allConflicts(session, schedule, meeting) {
  const list = conflictingSessions(session, schedule);
  const m = meetingEvent(meeting);
  if (m && session.startMin != null && overlaps(session, m)) list.unshift({ id: m.id, title: "your 1:1 with Veritas Prime" });
  return list;
}

const qualifiesForVpSession = (ranked) => ranked.some((id) => VP_SESSION_TRIGGERS.includes(id));

function buildSchedule(rankedModules, selectedSubs, meeting) {
  const chosen = new Set();
  const blockers = [];
  const m = meetingEvent(meeting);
  if (m) blockers.push(m);
  if (VP_SESSION && qualifiesForVpSession(rankedModules) && !(m && overlaps(VP_SESSION, m))) {
    chosen.add(VP_SESSION.id);
    blockers.push(VP_SESSION);
  }
  DAYS.forEach((day) => {
    const candidates = SESSIONS
      .filter((s) => s.day === day && s.startMin != null && !chosen.has(s.id))
      .map((s) => ({ session: s, ...scoreSession(s, rankedModules, selectedSubs) }))
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score || a.session.startMin - b.session.startMin);
    const dayChosen = blockers.filter((b) => b.day === day);
    candidates.forEach(({ session }) => {
      if (!dayChosen.some((c) => overlaps(session, c))) {
        dayChosen.push(session);
        chosen.add(session.id);
      }
    });
  });
  return chosen;
}

const isVpSession = (s) => VP_SESSION && s.id === VP_SESSION.id;
const sessionCode = (s) => (s.title.match(/\(([A-Z0-9]+)\)\s*$/) || [])[1] || s.room;
const cleanTitle = (s) => s.title.replace(/\s*\([A-Z0-9]+\)\s*$/, "");

// Chronological agenda: booked sessions + Veritas Prime events.
function agendaItems({ schedule, meeting, party }) {
  const sessions = SESSIONS.filter((s) => schedule.has(s.id)).map((s) => ({
    kind: isVpSession(s) ? "vpSession" : "session", id: `s${s.id}`, sessionId: s.id, day: s.day,
    startMin: s.startMin, endMin: s.endMin, title: cleanTitle(s), code: sessionCode(s),
    location: isVpSession(s) ? "SUCCESS 269 · Veritas Prime session" : `SAP Connect · ${sessionCode(s)}`,
    module: s.module, raw: s,
  }));
  const timed = [...sessions.filter((s) => s.day !== "tbd"), ...fixedEvents({ schedule, meeting, party })]
    .sort((a, b) => a.day - b.day || a.startMin - b.startMin);
  const tbd = sessions.filter((s) => s.day === "tbd");
  return { timed, tbd };
}

// =====================================================================================
//  Exports: calendar file, phone image, shareable agenda link, Pardot + lead sheet
// =====================================================================================
function utcStamp(day, min) {
  const ms = Date.UTC(EVENT_YEAR, EVENT_MONTH_IDX, 4 + day, 0, 0) + (min + UTC_OFFSET_MIN) * 60000;
  return new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}
const icsEscape = (t = "") => String(t).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
function icsFold(line) {
  const out = [];
  let rest = line;
  while (rest.length > 74) { out.push(rest.slice(0, 74)); rest = " " + rest.slice(74); }
  out.push(rest);
  return out.join("\r\n");
}

function buildIcs(items, who) {
  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Veritas Prime//SuccessConnect Agenda Builder//EN",
    "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "X-WR-CALNAME:SAP Connect 2026 · My agenda",
  ];
  items.forEach((it) => {
    const desc =
      it.kind === "session" ? `SAP Connect session ${it.code}. Agenda built with Veritas Prime.`
      : it.kind === "vpSession" ? `Veritas Prime session ${it.code} at SAP Connect.`
      : it.kind === "meeting" ? `${it.note}\nQuestions or need to move it? Stop by Booth #${BOOTH_NUMBER}.`
      : it.kind === "party" ? `${it.note}\nRegistration: ${PARTY.url}`
      : it.note;
    lines.push(
      "BEGIN:VEVENT",
      `UID:${it.id}-${who.replace(/[^a-z0-9]/gi, "").toLowerCase() || "guest"}@sapconnect2026.veritasprime.com`,
      `DTSTAMP:${now}`,
      `DTSTART:${utcStamp(it.day, it.startMin)}`,
      `DTEND:${utcStamp(it.day, it.endMin)}`,
      `SUMMARY:${icsEscape((it.kind === "session" ? "" : "Veritas Prime · ") + it.title)}`,
      `LOCATION:${icsEscape(it.location)}`,
      `DESCRIPTION:${icsEscape(desc)}`,
      "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:Reminder", `TRIGGER:-PT${it.kind === "party" ? 60 : 10}M`, "END:VALARM",
      "END:VEVENT"
    );
  });
  lines.push("END:VCALENDAR");
  return lines.map(icsFold).join("\r\n");
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.rel = "noopener";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

// ---------- Phone itinerary image (canvas) ----------
function wrapText(ctx, text, maxWidth, maxLines) {
  const words = text.split(/\s+/);
  const lines = [];
  let cur = "";
  words.forEach((w) => {
    const test = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && cur) { lines.push(cur); cur = w; } else cur = test;
  });
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    let last = kept[maxLines - 1];
    while (ctx.measureText(`${last}…`).width > maxWidth && last.length) last = last.slice(0, -1);
    kept[maxLines - 1] = `${last.trimEnd()}…`;
    return kept;
  }
  return lines;
}

async function renderItineraryPng({ name, timed, party }) {
  try { await Promise.all(["800 60px Manrope", "700 34px Manrope", "500 26px Manrope", "500 26px 'IBM Plex Mono'", "600 20px 'IBM Plex Mono'"].map((f) => document.fonts.load(f))); } catch { /* fonts optional */ }
  const W = 1080, PAD = 72, TIMEW = 230;
  const cv = document.createElement("canvas");
  const ctx = cv.getContext("2d");
  const titleFont = "700 34px Manrope";
  const byDay = {};
  timed.forEach((it) => { (byDay[it.day] = byDay[it.day] || []).push(it); });
  const days = Object.keys(byDay).map(Number).sort();

  // measure pass
  ctx.font = titleFont;
  const textW = W - PAD * 2 - TIMEW - 28;
  const rows = [];
  days.forEach((d) => {
    rows.push({ type: "day", d });
    byDay[d].forEach((it) => {
      ctx.font = titleFont;
      const lines = wrapText(ctx, it.title, textW, 2);
      rows.push({ type: "item", it, lines, h: 34 + lines.length * 44 + 38 + (it.kind !== "session" ? 62 : 0) });
    });
  });
  const HEADER = 440;
  const body = rows.reduce((h, r) => h + (r.type === "day" ? 104 : r.h), 0);
  const FOOT = 250;
  const H = HEADER + body + FOOT;
  cv.width = W; cv.height = H;

  ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, 0, W, H);
  // header
  ctx.fillStyle = "#000000"; ctx.fillRect(0, 0, W, HEADER);
  const g = ctx.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, "#0ECAD8"); g.addColorStop(0.55, "#9A9AE2"); g.addColorStop(1, "#94E21A");
  ctx.fillStyle = g; ctx.fillRect(0, HEADER - 12, W, 12);
  ctx.save(); ctx.translate(PAD, 70); ctx.scale(0.1, 0.1); ctx.fillStyle = "#FFFFFF"; ctx.fill(new Path2D(VP_MARK_PATH)); ctx.restore();
  ctx.fillStyle = "#FFFFFF"; ctx.font = "700 30px Manrope"; ctx.fillText("Veritas Prime", PAD + 118, 112);
  ctx.fillStyle = "#0ECAD8"; ctx.font = "500 26px 'IBM Plex Mono'"; ctx.fillText("SAP CONNECT · LAS VEGAS · OCT 5–7, 2026", PAD, 210);
  ctx.fillStyle = "#FFFFFF"; ctx.font = "800 64px Manrope";
  ctx.fillText(name ? `${name}'s agenda` : "My SAP Connect agenda", PAD, 295, W - PAD * 2);
  ctx.fillStyle = "#B6EEEF"; ctx.font = "500 32px Manrope"; ctx.fillText("SuccessConnect · Las Vegas", PAD, 350, W - PAD * 2);

  let y = HEADER + 20;
  rows.forEach((r) => {
    if (r.type === "day") {
      y += 64;
      ctx.fillStyle = "#000"; ctx.font = "500 26px 'IBM Plex Mono'";
      ctx.fillText((DAY_LABELS[r.d] || "").toUpperCase(), PAD, y);
      ctx.fillStyle = "#E1E3E5"; ctx.fillRect(PAD, y + 18, W - PAD * 2, 2);
      y += 40;
      return;
    }
    const it = r.it;
    const vp = it.kind !== "session";
    const top = y + 14;
    if (vp) {
      ctx.fillStyle = it.kind === "party" ? "#F3F3FC" : "#E6FAFB";
      ctx.fillRect(PAD - 20, top - 6, W - PAD * 2 + 40, r.h - 20);
      ctx.fillStyle = it.kind === "party" ? "#9A9AE2" : "#0ECAD8"; ctx.fillRect(PAD - 20, top - 6, 8, r.h - 20);
    }
    ctx.fillStyle = "#000"; ctx.font = "500 26px 'IBM Plex Mono'";
    ctx.fillText(minutesToLabel(it.startMin), PAD, top + 38);
    ctx.fillStyle = "#4A5058"; ctx.font = "400 22px 'IBM Plex Mono'";
    ctx.fillText(`to ${it.endMin >= 1440 ? "Midnight" : minutesToLabel(it.endMin)}`, PAD, top + 70);
    const x = PAD + TIMEW;
    let ty = top + 38;
    if (vp) {
      ctx.fillStyle = "#077880"; ctx.font = "600 20px 'IBM Plex Mono'";
      ctx.fillText(it.kind === "party" ? "VERITAS PRIME · ALL THAT! PARTY" : "VERITAS PRIME", x, ty - 4);
      ty += 36;
    }
    ctx.fillStyle = "#000"; ctx.font = titleFont;
    r.lines.forEach((ln, i) => ctx.fillText(ln, x, ty + i * 44));
    ctx.fillStyle = "#4A5058"; ctx.font = "500 24px Manrope";
    ctx.fillText(it.location, x, ty + r.lines.length * 44 + 2, textW);
    y += r.h;
  });

  // footer
  const fy = H - FOOT + 40;
  ctx.fillStyle = "#000"; ctx.fillRect(0, fy, W, H - fy);
  ctx.fillStyle = g; ctx.fillRect(0, fy, W, 8);
  ctx.fillStyle = "#FFFFFF"; ctx.font = "700 36px Manrope";
  ctx.fillText(party ? `See you at ${PARTY.short} · Tue 8 PM · LIV` : `Find us at Booth #${BOOTH_NUMBER}`, PAD, fy + 90, W - PAD * 2);
  ctx.fillStyle = "#B6EEEF"; ctx.font = "500 26px 'IBM Plex Mono'";
  ctx.fillText(`VERITAS PRIME · BOOTH #${BOOTH_NUMBER}`, PAD, fy + 145);

  return new Promise((res) => cv.toBlob((b) => res(b), "image/png"));
}

// =====================================================================================
//  UI atoms
// =====================================================================================
function VPMark({ size = 28, color = "currentColor" }) {
  return (
    <svg viewBox="0 0 974 541" width={size} height={(size * 541) / 974} aria-hidden="true" style={{ display: "block", flexShrink: 0 }}>
      <path d={VP_MARK_PATH} fill={color} />
    </svg>
  );
}

const mono = (size = 11, color = C.inkSoft, extra = {}) => ({ fontFamily: F.mono, fontSize: size, letterSpacing: "0.06em", color, ...extra });
const sans = (size = 14, weight = 500, color = C.ink, extra = {}) => ({ fontFamily: F.sans, fontSize: size, fontWeight: weight, color, ...extra });

const STAGES = [
  { id: "topics", label: "Topics" },
  { id: "schedule", label: "Sessions" },
  { id: "agenda", label: "Your agenda" },
];

function StepDots({ stage }) {
  const idx = STAGES.findIndex((s) => s.id === stage);
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {STAGES.map((s, i) => (
        <div key={s.id} className="flex items-center gap-2">
          <div className="flex items-center gap-1.5" style={{ opacity: i <= idx ? 1 : 0.4 }}>
            <div style={{ width: 7, height: 7, borderRadius: 999, background: i === idx ? C.teal : C.ink }} />
            <span style={mono(11, C.ink)}>{s.label.toUpperCase()}</span>
          </div>
          {i < STAGES.length - 1 && <div style={{ width: 14, height: 1, background: C.lineDark }} />}
        </div>
      ))}
    </div>
  );
}

function Chip({ active, onClick, children, color, disabled, title }) {
  return (
    <button
      onClick={onClick} disabled={disabled} title={title}
      style={{
        padding: "7px 13px", borderRadius: 999, fontSize: 13, fontFamily: F.sans, fontWeight: 600,
        border: `1px solid ${active ? color || C.ink : C.lineDark}`,
        background: active ? color || C.ink : C.bg, color: active ? "#fff" : C.ink,
        cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.35 : 1, whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

const inputStyle = {
  padding: "12px 14px", borderRadius: 10, border: `1px solid ${C.lineDark}`, fontFamily: F.sans,
  fontSize: 15, color: C.ink, background: C.bg, outline: "none", width: "100%",
};
const primaryButtonStyle = {
  padding: "14px 22px", borderRadius: 999, background: C.ink, color: "#fff", border: "none",
  fontFamily: F.sans, fontWeight: 700, fontSize: 15, cursor: "pointer",
};
const secondaryButtonStyle = { ...primaryButtonStyle, background: C.bg, color: C.ink, border: `1px solid ${C.lineDark}` };



function Checkbox({ checked, onChange, children, dark }) {
  return (
    <label className="flex items-start gap-3" style={{ cursor: "pointer" }}>
      <span
        role="checkbox" aria-checked={checked} tabIndex={0}
        onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); onChange(!checked); } }}
        onClick={(e) => { e.preventDefault(); onChange(!checked); }}
        style={{
          width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1, display: "grid", placeItems: "center",
          border: `2px solid ${checked ? C.teal : dark ? "#6B7178" : C.lineDark}`, background: checked ? C.teal : "transparent",
        }}
      >
        {checked && <svg width="13" height="13" viewBox="0 0 12 12"><path d="M2 6.5l2.5 2.5L10 3.5" stroke="#000" strokeWidth="2" fill="none" /></svg>}
      </span>
      <span onClick={(e) => { e.preventDefault(); onChange(!checked); }}>{children}</span>
    </label>
  );
}

// =====================================================================================
//  Header with the ALL THAT! invite pinned on every page
// =====================================================================================
function TopBar() {
  return (
    <div style={{ position: "sticky", top: "env(safe-area-inset-top, 0px)", zIndex: 20, background: C.ink }}>
      <div style={{ height: 4, background: GRAD }} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-3" style={{ height: 58 }}>
        <div className="flex items-center gap-2.5" style={{ minWidth: 0 }}>
          <VPMark size={30} color="#fff" />
          <div style={{ minWidth: 0 }}>
            <div style={sans(15, 700, "#fff", { lineHeight: 1.1 })}>Veritas Prime</div>
            <div className="hidden sm:block" style={mono(10, C.teal)}>SAP CONNECT · BOOTH #{BOOTH_NUMBER}</div>
          </div>
        </div>
        <a href={PARTY.url} target="_blank" rel="noopener noreferrer"
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px 7px 10px", borderRadius: 999, textDecoration: "none",
            border: `1px solid ${C.teal}`, background: "rgba(14,202,216,0.14)" }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: C.lime }} />
          <span style={sans(12.5, 800, "#fff", { letterSpacing: "0.02em" })}>{PARTY.short}</span>
          <span className="hidden sm:inline" style={sans(12, 500, "#CFD3D6")}>Tue 8 PM · LIV</span>
          <span style={sans(12, 700, C.teal)}>Register ↗</span>
        </a>
      </div>
    </div>
  );
}

// =====================================================================================
//  Session card + Veritas Prime event row
// =====================================================================================
function SessionCard({ session, inSchedule, onToggle, matches, conflicts }) {
  const color = modColor(session.module);
  const hasConflict = conflicts && conflicts.length > 0;
  const vp = isVpSession(session);
  const borderColor = hasConflict ? C.danger : vp ? C.teal : inSchedule ? color : C.line;
  return (
    <div style={{ display: "flex", flexDirection: "column", border: `1.5px solid ${borderColor}`, borderRadius: 14, background: vp ? C.tealTint : C.bg, overflow: "hidden" }}>
      <div className="flex">
        <div style={{ flex: 1, padding: "14px 14px", minWidth: 0 }}>
          <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 6 }}>
            {vp ? (
              <span className="flex items-center gap-1.5" style={{ ...mono(10.5, "#fff", { fontWeight: 600 }), padding: "3px 8px", borderRadius: 6, background: C.ink }}>
                <VPMark size={14} color={C.teal} /> VERITAS PRIME SESSION
              </span>
            ) : (
              <span style={{ ...mono(10.5, "#fff"), padding: "2px 7px", borderRadius: 5, background: color }}>{modShort(session.module)}</span>
            )}
            <span style={mono(11, C.inkSoft)}>{session.level}</span>
            {matches.length > 0 && !vp && <span style={sans(11.5, 700, C.tealDeep)}>★ matches your interests</span>}
          </div>
          <div style={sans(15, 700, C.ink, { marginBottom: 4, lineHeight: 1.35 })}>{session.title}</div>
          <div style={sans(13, 500, C.inkSoft, { marginBottom: 6, lineHeight: 1.5 })}>{session.blurb}</div>
          <div style={sans(12, 500, C.inkSoft)}>{session.speaker}</div>
        </div>
        <div style={{ width: 118, flexShrink: 0, padding: "14px 10px", display: "flex", flexDirection: "column", justifyContent: "space-between", borderLeft: `1px dashed ${C.lineDark}` }}>
          <div>
            <div style={mono(12, C.ink, { fontWeight: 500, lineHeight: 1.4, letterSpacing: 0 })}>{session.time}</div>
            <div style={mono(11, C.inkSoft, { marginTop: 4 })}>{session.room}</div>
          </div>
          <button onClick={onToggle}
            style={{ marginTop: 10, padding: "8px 0", borderRadius: 999, fontSize: 12.5, fontFamily: F.sans, fontWeight: 700, cursor: "pointer",
              border: `1.5px solid ${inSchedule ? C.ink : C.lineDark}`, background: inSchedule ? C.ink : C.bg, color: inSchedule ? C.teal : C.ink }}>
            {inSchedule ? "Added ✓" : "Add"}
          </button>
        </div>
      </div>
      {hasConflict && (
        <div style={{ padding: "8px 14px", background: C.dangerTint, borderTop: `1px solid ${C.danger}` }}>
          <span style={sans(12, 700, C.danger)}>
            ⚠ {inSchedule ? "Overlaps" : "Would overlap"} with: {conflicts.slice(0, 2).map((c) => c.title).join(", ")}
            {conflicts.length > 2 ? ` +${conflicts.length - 2} more` : ""}
          </span>
        </div>
      )}
    </div>
  );
}

function RemoveBtn({ onClick, dark }) {
  return (
    <button onClick={onClick} aria-label="Remove from agenda" title="Remove"
      style={{ width: 28, height: 28, borderRadius: 999, flexShrink: 0, alignSelf: "start", display: "grid", placeItems: "center", cursor: "pointer",
        background: "none", border: `1px solid ${dark ? "#3A3F45" : C.line}` }}>
      <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke={dark ? "#9CA3A9" : C.inkSoft} strokeWidth="1.6" /></svg>
    </button>
  );
}

const KIND_LABEL = { meeting: "YOUR 1:1", booth: "BOOTH", party: "VERITAS PRIME PARTY", vpSession: "VERITAS PRIME SESSION" };

function VpEventRow({ it, compact, action }) {
  const party = it.kind === "party";
  return (
    <div className="flex gap-3" style={{ padding: compact ? "11px 13px" : "14px 16px", borderRadius: 14, background: party ? "#0B0B0F" : C.ink, color: "#fff", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: party ? GRAD : C.teal }} />
      <div className={compact ? "w-[86px]" : "w-[86px] sm:w-[104px]"} style={{ flexShrink: 0, paddingLeft: 4 }}>
        <div style={mono(12.5, "#fff", { fontWeight: 500, letterSpacing: 0 })}>{minutesToLabel(it.startMin)}</div>
        <div style={mono(11, "#9CA3A9", { letterSpacing: 0 })}>{it.endMin >= 1440 ? "to 12:00 AM" : `to ${minutesToLabel(it.endMin)}`}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="flex items-center gap-1.5" style={mono(10, party ? C.lime : C.teal, { fontWeight: 600 })}>
          <VPMark size={13} color={party ? C.lime : C.teal} /> {it.label || KIND_LABEL[it.kind]}
        </div>
        <div style={sans(15, 700, "#fff", { marginTop: 3, lineHeight: 1.3 })}>{it.title}</div>
        <div style={sans(12.5, 500, "#BFC4C8", { marginTop: 2 })}>{it.location}</div>
      </div>
      {action}
    </div>
  );
}

// =====================================================================================
//  Stage 3: Sessions (Recommended + Browse)
// =====================================================================================
function ScheduleStage({ rankedModules, selectedSubs, schedule, setSchedule, day, setDay, tab, setTab, browseFilter, setBrowseFilter, onBack, onNext, attendeeLabel, meeting, party }) {
  const daySessions = useMemo(() => SESSIONS.filter((s) => s.day === day).sort((a, b) => (a.slotIdx ?? 99) - (b.slotIdx ?? 99)), [day]);
  const bySlot = useMemo(() => {
    const map = {};
    daySessions.forEach((s) => { (map[s.slotIdx] = map[s.slotIdx] || []).push(s); });
    return map;
  }, [daySessions]);

  const toggleInSchedule = (id) => setSchedule((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const fixedToday = fixedEvents({ schedule, meeting, party }).filter((e) => e.day === day).sort((a, b) => a.startMin - b.startMin);
  const dayConflictCount = SESSIONS.filter((s) => s.day === day && schedule.has(s.id) && allConflicts(s, schedule, meeting).length > 0).length;

  const renderSlot = (slotIdx, list) => (
    <div key={slotIdx} style={{ marginBottom: 22 }}>
      <SlotHeader slotIdx={slotIdx} />
      <div className="flex flex-col gap-2">
        {list.map((s) => {
          const { matches } = scoreSession(s, rankedModules, selectedSubs);
          return <SessionCard key={s.id} session={s} matches={matches} inSchedule={schedule.has(s.id)} conflicts={allConflicts(s, schedule, meeting)} onToggle={() => toggleInSchedule(s.id)} />;
        })}
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6" style={{ paddingTop: 30, paddingBottom: 64 }}>
      <StepDots stage="schedule" />
      <div className="flex justify-between items-end gap-3 flex-wrap" style={{ marginTop: 20 }}>
        <h2 style={sans(26, 800, C.ink, { lineHeight: 1.2, margin: 0 })}>{attendeeLabel} sessions</h2>
        <span className="flex items-center gap-3">
          {dayConflictCount > 0 && <span style={sans(12.5, 700, C.danger)}>⚠ {dayConflictCount} overlap{dayConflictCount === 1 ? "" : "s"} today</span>}
          <span style={mono(12, C.inkSoft)}>{schedule.size} BOOKED</span>
        </span>
      </div>
      <p style={sans(14, 500, C.inkSoft, { marginTop: 6 })}>We picked a conflict-free set from your interests. Add or remove anything.</p>

      <div className="flex gap-2 flex-wrap" style={{ margin: "18px 0 14px" }}>
        <button onClick={() => setTab("recommended")} style={tabStyle(tab === "recommended")}>Recommended</button>
        <button onClick={() => setTab("browse")} style={tabStyle(tab === "browse")}>Browse all</button>
      </div>
      <div className="flex gap-2 flex-wrap" style={{ marginBottom: 16 }}>
        {DAYS.map((d) => <Chip key={d} active={day === d} onClick={() => setDay(d)}>{d === "tbd" ? "Time TBD" : DAY_SHORT[d]}</Chip>)}
      </div>
      {tab === "browse" && (
        <div className="flex gap-2 flex-wrap" style={{ marginBottom: 16 }}>
          <Chip active={browseFilter === "all"} onClick={() => setBrowseFilter("all")}>All topics</Chip>
          {MODULES.map((m) => <Chip key={m.id} active={browseFilter === m.id} onClick={() => setBrowseFilter(m.id)} color={modColor(m.id)}>{m.short}</Chip>)}
        </div>
      )}

      {fixedToday.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <div style={mono(11, C.tealDeep, { fontWeight: 600, marginBottom: 8 })}>VERITAS PRIME · ALREADY ON YOUR {DAY_SHORT[day]?.toUpperCase()}</div>
          <div className="flex flex-col gap-2">{fixedToday.map((it) => <VpEventRow key={it.id} it={it} compact />)}</div>
        </div>
      )}

      {Object.keys(bySlot).sort((a, b) => (a === "null" ? 1 : b === "null" ? -1 : a - b)).map((slotIdx) => {
        const options = bySlot[slotIdx];
        const list = tab === "recommended"
          ? options.filter((s) => isVpSession(s) || scoreSession(s, rankedModules, selectedSubs).score > 0 || schedule.has(s.id))
          : options.filter((s) => browseFilter === "all" || s.module === browseFilter);
        return list.length ? renderSlot(slotIdx, list) : null;
      })}

      <div className="flex justify-between gap-3" style={{ marginTop: 8 }}>
        <button onClick={onBack} style={secondaryButtonStyle}>← Topics</button>
        <button onClick={onNext} style={primaryButtonStyle}>See my agenda &nbsp;→</button>
      </div>
    </div>
  );
}

function tabStyle(active) {
  return {
    padding: "9px 16px", borderRadius: 999, border: `1.5px solid ${active ? C.ink : C.lineDark}`,
    background: active ? C.ink : C.bg, color: active ? "#fff" : C.ink, fontFamily: F.sans, fontWeight: 700, fontSize: 13.5, cursor: "pointer",
  };
}

function SlotHeader({ slotIdx }) {
  return (
    <div style={mono(11, C.inkSoft, { marginBottom: 8 })}>
      {slotIdx === "null" || slotIdx === null || slotIdx === "undefined" ? "TIMES TO BE ANNOUNCED" : `STARTING ${SLOTS[slotIdx]}`}
    </div>
  );
}

// =====================================================================================
//  Shared: outbound buttons to marketing's real registration pages
// =====================================================================================
function OutLink({ href, children, tone = "lime", small }) {
  const bg = tone === "lime" ? C.lime : tone === "teal" ? C.teal : C.ink;
  const fg = tone === "ink" ? "#fff" : C.ink;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      style={{ ...primaryButtonStyle, background: bg, color: fg, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8,
        padding: small ? "9px 16px" : "13px 20px", fontSize: small ? 13.5 : 15, whiteSpace: "nowrap" }}>
      {children} <span aria-hidden="true">↗</span>
    </a>
  );
}

function PartyCard({ party, setParty }) {
  return (
    <div style={{ borderRadius: 20, padding: 2, background: GRAD }}>
      <div style={{ borderRadius: 18, background: "#0B0B0F", padding: "20px 20px 18px" }}>
        <div style={mono(11, C.lime)}>YOU'RE INVITED · TUESDAY, OCT 6 · 8 PM–MIDNIGHT</div>
        <div style={sans(34, 800, "#fff", { lineHeight: 1, marginTop: 8, letterSpacing: "-0.01em" })}>ALL THAT!</div>
        <div style={sans(14, 600, "#E8EAEC", { marginTop: 6 })}>{PARTY.venue}</div>
        <div style={sans(13, 500, "#AEB4B9", { marginTop: 4, maxWidth: 440, lineHeight: 1.5 })}>{PARTY.blurb}</div>
        <div className="flex items-center gap-4 flex-wrap" style={{ marginTop: 16 }}>
          <OutLink href={PARTY.url}>Register for ALL THAT!</OutLink>
          <Checkbox checked={party} onChange={setParty} dark>
            <span style={sans(13, 600, "#E8EAEC")}>Keep it on my agenda</span>
          </Checkbox>
        </div>
        <div style={sans(12, 500, "#8C9298", { marginTop: 10 })}>Registration opens our event page in a new tab. Space is limited.</div>
      </div>
    </div>
  );
}

function MeetCard() {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap" style={{ padding: "16px 18px", borderRadius: 18, border: `1.5px solid ${C.teal}`, background: C.tealTint }}>
      <div style={{ flex: "1 1 260px" }}>
        <div style={sans(16, 800)}>Want dedicated time with our team?</div>
        <div style={sans(13, 500, C.inkSoft, { marginTop: 3, lineHeight: 1.5 })}>
          We'll save 30 minutes on your agenda to meet us at Booth #{BOOTH_NUMBER}. For a scheduled 1:1, send us a request.
        </div>
      </div>
      <OutLink href={MEETING_URL} tone="ink" small>Request a 1:1</OutLink>
    </div>
  );
}

// =====================================================================================
//  Stage 1: Topics (tap order = priority)
// =====================================================================================
function TopicsStage({ firstName, setFirstName, rankedModules, toggleModule, party, setParty, onNext }) {
  const vpPicked = rankedModules.some((id) => VP_SESSION_TRIGGERS.includes(id));
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6" style={{ paddingTop: 24, paddingBottom: 56 }}>
      <div style={{ background: C.ink, borderRadius: 20, padding: "22px 20px", color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -40, top: -30, opacity: 0.09 }}><VPMark size={260} color="#fff" /></div>
        <div style={mono(11, C.teal)}>SAP CONNECT LAS VEGAS · OCT 5–7</div>
        <h1 style={sans(28, 800, "#fff", { lineHeight: 1.12, margin: "10px 0 10px", maxWidth: 520 })}>
          Your SuccessConnect agenda, built in two minutes.
        </h1>
        <p style={sans(14.5, 500, "#D5D9DC", { lineHeight: 1.55, maxWidth: 500, margin: 0 })}>
          Tap the topics you care about. We'll pull a conflict-free schedule from SAP's full session catalog, save time to
          meet our team at Booth #{BOOTH_NUMBER}, and send it all to your calendar and phone.
        </p>
      </div>

      <div style={{ marginTop: 14 }}><PartyCard party={party} setParty={setParty} /></div>
      <div style={{ marginTop: 14 }}><MeetCard /></div>

      <div style={{ marginTop: 24 }}><StepDots stage="topics" /></div>

      <div style={{ marginTop: 16, padding: "20px 18px", borderRadius: 18, border: `1px solid ${C.line}`, background: C.bg }}>
        <h2 style={sans(22, 800, C.ink, { margin: 0, lineHeight: 1.2 })}>What are you here to solve?</h2>
        <p style={sans(14, 500, C.inkSoft, { margin: "6px 0 16px", lineHeight: 1.5 })}>
          Tap in order of priority. Your first pick counts most.
        </p>
        <div className="flex flex-wrap gap-2">
          {MODULES.map((m) => {
            const rank = rankedModules.indexOf(m.id);
            const on = rank !== -1;
            return (
              <button key={m.id} onClick={() => toggleModule(m.id)} aria-pressed={on}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: on ? "8px 14px 8px 8px" : "9px 14px", borderRadius: 999, cursor: "pointer",
                  border: `1.5px solid ${on ? modColor(m.id) : C.lineDark}`, background: on ? modColor(m.id) : C.bg, color: on ? "#fff" : C.ink,
                  fontFamily: F.sans, fontWeight: 700, fontSize: 14 }}>
                {on && (
                  <span style={{ width: 22, height: 22, borderRadius: 999, background: "#fff", color: modColor(m.id), display: "grid", placeItems: "center", fontFamily: F.mono, fontSize: 12, fontWeight: 600 }}>
                    {rank + 1}
                  </span>
                )}
                {m.name}
              </button>
            );
          })}
        </div>
        {vpPicked && (
          <div className="flex items-center gap-2" style={{ marginTop: 14, ...sans(13, 700, C.tealDeep) }}>
            <VPMark size={14} color={C.tealDeep} /> Adds our session: The payroll advantage (PAR1008), Wed 9:30 AM
          </div>
        )}

        <div style={{ marginTop: 22, maxWidth: 320 }}>
          <label htmlFor="firstName" style={{ display: "block", ...mono(11, C.inkSoft), marginBottom: 6 }}>FIRST NAME (OPTIONAL, FOR YOUR PHONE ITINERARY)</label>
          <input id="firstName" style={inputStyle} value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jane" autoComplete="given-name" />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap" style={{ marginTop: 22 }}>
        <span style={sans(12.5, 600, rankedModules.length ? C.tealDeep : C.inkSoft)}>
          {rankedModules.length ? `${rankedModules.length} topic${rankedModules.length === 1 ? "" : "s"} picked` : "Pick at least one topic"}
        </span>
        <button onClick={onNext} disabled={!rankedModules.length} style={{ ...primaryButtonStyle, opacity: rankedModules.length ? 1 : 0.35 }}>
          Build my agenda &nbsp;→
        </button>
      </div>
    </div>
  );
}

// =====================================================================================
//  Stage 3: Agenda + take-it-with-you actions
// =====================================================================================
function ActionButton({ icon, title, sub, onClick, busy, done }) {
  return (
    <button onClick={onClick} disabled={busy}
      style={{ textAlign: "left", display: "flex", gap: 12, alignItems: "center", width: "100%", padding: "14px 14px", borderRadius: 14,
        border: `1.5px solid ${done ? C.teal : "rgba(255,255,255,0.16)"}`, background: done ? "rgba(14,202,216,0.12)" : "rgba(255,255,255,0.06)",
        cursor: busy ? "default" : "pointer" }}>
      <span style={{ width: 40, height: 40, borderRadius: 12, background: done ? C.teal : "#fff", display: "grid", placeItems: "center", flexShrink: 0 }}>{icon}</span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "block", ...sans(15, 700, "#fff") }}>{busy ? "Working…" : title}</span>
        <span style={{ display: "block", ...sans(12.5, 500, "#BFC4C8", { marginTop: 1 }) }}>{sub}</span>
      </span>
    </button>
  );
}

const IconCal = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>);
const IconPhone = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><rect x="6" y="2" width="12" height="20" rx="2.5" /><path d="M11 18h2" /></svg>);

const textLinkStyle = { ...sans(12, 700, C.teal), background: "none", border: "none", cursor: "pointer", alignSelf: "start", padding: 0, whiteSpace: "nowrap", textDecoration: "none" };

function AgendaStage({ firstName, schedule, setSchedule, party, setParty, onBack, onEditSchedule }) {
  const { timed, tbd } = useMemo(() => agendaItems({ schedule, meeting: null, party }), [schedule, party]);
  const name = firstName.trim();
  // Exports are tied to the agenda they were made from; any edit makes them stale and resets the buttons.
  const agendaKey = `${[...schedule].sort().join(",")}|${party}|${name}`;
  const [status, setStatusRaw] = useState({ key: agendaKey });
  const [img, setImg] = useState(null);
  const cur = status.key === agendaKey ? status : { key: agendaKey };
  const setStatus = (fn) => setStatusRaw((s) => fn(s.key === agendaKey ? s : { key: agendaKey }));
  const imgUrl = img && img.key === agendaKey ? img.url : null;
  const imgBlob = img && img.key === agendaKey ? img.blob : null;

  const removeSession = (id) => setSchedule((prev) => { const n = new Set(prev); n.delete(id); return n; });

  const addToCalendar = () => {
    downloadBlob(new Blob([buildIcs(timed, name || "guest")], { type: "text/calendar;charset=utf-8" }), "SAP-Connect-2026-my-agenda.ics");
    setStatus((s) => ({ ...s, cal: "done" }));
  };
  const makeImage = async () => {
    setStatus((s) => ({ ...s, img: "busy" }));
    const blob = await renderItineraryPng({ name, timed, party });
    setImg((prev) => { if (prev) URL.revokeObjectURL(prev.url); return { key: agendaKey, blob, url: URL.createObjectURL(blob) }; });
    setStatus((s) => ({ ...s, img: "done" }));
  };
  const saveImage = async () => {
    if (!imgBlob) return;
    const file = new File([imgBlob], "SAP-Connect-2026-agenda.png", { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: "My SAP Connect agenda" }); return; } catch { /* fall back to download */ }
    }
    downloadBlob(imgBlob, file.name);
  };

  const byDay = {};
  timed.forEach((it) => { (byDay[it.day] = byDay[it.day] || []).push(it); });
  const days = Object.keys(byDay).map(Number).sort();
  const sessionCount = timed.filter((t) => t.kind === "session" || t.kind === "vpSession").length + tbd.length;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6" style={{ paddingTop: 28, paddingBottom: 64 }}>
      <StepDots stage="agenda" />

      <div style={{ marginTop: 18, background: C.ink, borderRadius: 20, padding: "22px 18px 18px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 4, background: GRAD }} />
        <div style={mono(11, C.teal)}>SAP CONNECT LAS VEGAS · OCT 5–7</div>
        <h2 style={sans(28, 800, "#fff", { margin: "8px 0 4px", lineHeight: 1.15 })}>{name ? `${name}, your week is set.` : "Your week is set."}</h2>
        <p style={sans(14, 500, "#BFC4C8", { margin: 0 })}>
          {sessionCount} session{sessionCount === 1 ? "" : "s"} · time with Veritas Prime at Booth #{BOOTH_NUMBER}{party ? " · ALL THAT! on Tuesday night" : ""}
        </p>
        <div className="flex flex-col gap-2" style={{ marginTop: 18 }}>
          <ActionButton icon={<IconCal />} title="Add everything to my calendar" done={cur.cal === "done"}
            sub={cur.cal === "done" ? "Downloaded. Open the file to add every event at once." : `One tap, ${timed.length} events. Works with Outlook, Apple and Google.`}
            onClick={addToCalendar} />
          <ActionButton icon={<IconPhone />} title="Save the itinerary to my phone" busy={cur.img === "busy"} done={cur.img === "done"}
            sub={cur.img === "done" ? "Ready below. Save it to your photos." : "A branded image of your agenda for your camera roll."}
            onClick={makeImage} />
        </div>
        {imgUrl && (
          <div style={{ marginTop: 14, padding: 12, borderRadius: 14, background: "#15171A" }}>
            <img src={imgUrl} alt="Your agenda as a phone image" style={{ width: "100%", maxWidth: 260, display: "block", margin: "0 auto", borderRadius: 10 }} />
            <div className="flex justify-center" style={{ marginTop: 12 }}>
              <button onClick={saveImage} style={{ ...primaryButtonStyle, background: C.teal, color: C.ink, fontSize: 14 }}>Save image</button>
            </div>
            <div style={sans(12, 500, "#9CA3A9", { textAlign: "center", marginTop: 8 })}>On a phone you can also press and hold the image to save it.</div>
          </div>
        )}
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.12)" }}>
          <div style={mono(10.5, "#9CA3A9", { marginBottom: 10 })}>BEFORE YOU GO</div>
          <div className="flex flex-wrap gap-2">
            <OutLink href={PARTY.url} small>Register for ALL THAT!</OutLink>
            <OutLink href={MEETING_URL} tone="teal" small>Request a 1:1</OutLink>
          </div>
        </div>
      </div>

      {!party && (
        <div style={{ marginTop: 14, borderRadius: 16, padding: 2, background: GRAD }}>
          <div className="flex items-center justify-between gap-3 flex-wrap" style={{ borderRadius: 14, background: "#0B0B0F", padding: "14px 16px" }}>
            <div>
              <div style={sans(16, 800, "#fff")}>ALL THAT! · Tue 8 PM · LIV</div>
              <div style={sans(12.5, 500, "#AEB4B9")}>Our '90s throwback party. Put it back on your agenda?</div>
            </div>
            <button onClick={() => setParty(true)} style={{ ...primaryButtonStyle, background: C.lime, color: C.ink, padding: "10px 18px", fontSize: 14 }}>Add it back</button>
          </div>
        </div>
      )}

      <div style={{ marginTop: 26 }}>
        {days.map((d) => (
          <div key={d} style={{ marginBottom: 26 }}>
            <div style={sans(18, 800, C.ink, { marginBottom: 10 })}>{DAY_LABELS[d]}</div>
            <div className="flex flex-col gap-2">
              {byDay[d].map((it) => {
                if (it.kind !== "session") return (
                  <VpEventRow key={it.id} it={it} action={
                    it.kind === "vpSession" ? <RemoveBtn dark onClick={() => removeSession(it.sessionId)} />
                    : it.kind === "booth" ? <a href={MEETING_URL} target="_blank" rel="noopener noreferrer" style={textLinkStyle}>Request a 1:1 ↗</a>
                    : it.kind === "party" ? (
                      <div className="flex flex-col items-end gap-2" style={{ alignSelf: "start" }}>
                        <a href={PARTY.url} target="_blank" rel="noopener noreferrer" style={{ ...textLinkStyle, color: C.lime }}>Register ↗</a>
                        <RemoveBtn dark onClick={() => setParty(false)} />
                      </div>
                    ) : null
                  } />
                );
                const conflicts = allConflicts(it.raw, schedule, null);
                return (
                  <div key={it.id} className="flex gap-3" style={{ padding: "12px 14px", borderRadius: 14, border: `1px solid ${conflicts.length ? C.danger : C.line}`, background: C.bg }}>
                    <div className="w-[86px] sm:w-[104px]" style={{ flexShrink: 0 }}>
                      <div style={mono(12.5, C.ink, { fontWeight: 500, letterSpacing: 0 })}>{minutesToLabel(it.startMin)}</div>
                      <div style={mono(11, C.inkSoft, { letterSpacing: 0 })}>to {minutesToLabel(it.endMin)}</div>
                    </div>
                    <div style={{ width: 3, borderRadius: 2, background: conflicts.length ? C.danger : modColor(it.module), flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="flex items-center gap-2" style={{ marginBottom: 2 }}>
                        <span style={{ ...mono(10, "#fff"), padding: "1px 6px", borderRadius: 4, background: modColor(it.module) }}>{modShort(it.module)}</span>
                        <span style={mono(11, C.inkSoft)}>{it.code}</span>
                      </div>
                      <div style={sans(14.5, 700, C.ink, { lineHeight: 1.35 })}>{it.title}</div>
                      {conflicts.length > 0 && <div style={sans(12, 700, C.danger, { marginTop: 4 })}>⚠ Overlaps: {conflicts.slice(0, 2).map((c) => c.title).join(", ")}</div>}
                    </div>
                    <RemoveBtn onClick={() => removeSession(it.sessionId)} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {tbd.length > 0 && (
          <div style={{ marginBottom: 26 }}>
            <div style={sans(18, 800, C.ink, { marginBottom: 4 })}>Times not announced yet</div>
            <p style={sans(13, 500, C.inkSoft, { marginTop: 0, marginBottom: 10 })}>SAP hasn't scheduled these. They aren't in your calendar file yet; check the SAP app on site.</p>
            {tbd.map((it) => (
              <div key={it.id} className="flex justify-between gap-3" style={{ padding: "10px 0", borderTop: `1px solid ${C.line}` }}>
                <span style={sans(14, 600)}>{it.title} <span style={mono(11, C.inkSoft)}>{it.code}</span></span>
                <RemoveBtn onClick={() => removeSession(it.sessionId)} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between gap-3 flex-wrap" style={{ marginTop: 10 }}>
        <button onClick={onBack} style={secondaryButtonStyle}>← Topics</button>
        <button onClick={onEditSchedule} style={secondaryButtonStyle}>Edit sessions</button>
      </div>

      <div className="flex items-center justify-center gap-2" style={{ marginTop: 36, ...mono(10.5, C.inkSoft) }}>
        <VPMark size={16} color={C.ink} /> VERITAS PRIME · SAP GOLD PARTNER · BOOTH #{BOOTH_NUMBER}
      </div>
    </div>
  );
}

// =====================================================================================
//  App
// =====================================================================================
const NO_SUBS = new Set();

export default function App() {
  const [stage, setStage] = useState("topics");
  const [firstName, setFirstName] = useState("");
  const [rankedModules, setRankedModules] = useState([]);
  const [party, setParty] = useState(true);
  const [schedule, setSchedule] = useState(new Set());
  const [day, setDay] = useState(2);
  const [tab, setTab] = useState("recommended");
  const [browseFilter, setBrowseFilter] = useState("all");

  useEffect(() => { window.scrollTo({ top: 0 }); }, [stage]);

  const toggleModule = (id) => setRankedModules((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const goToSchedule = () => {
    setSchedule(buildSchedule(rankedModules, NO_SUBS, null));
    setDay(2);
    setTab("recommended");
    setStage("schedule");
  };

  const attendeeLabel = firstName.trim() ? `${firstName.trim()}'s` : "Your";

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: F.sans, color: C.ink }}>
      <style>{`
        * { box-sizing: border-box; }
        body { background: ${C.bg}; }
        input::placeholder, textarea::placeholder { color: ${C.inkSoft}; opacity: 0.6; }
        input:focus, textarea:focus { border-color: ${C.teal} !important; box-shadow: 0 0 0 3px rgba(14,202,216,0.2); }
        button:focus-visible, a:focus-visible, [role=checkbox]:focus-visible { outline: 2px solid ${C.teal}; outline-offset: 2px; }
        button:disabled { cursor: default; }
      `}</style>

      <TopBar />

      {stage === "topics" && (
        <TopicsStage firstName={firstName} setFirstName={setFirstName} rankedModules={rankedModules} toggleModule={toggleModule}
          party={party} setParty={setParty} onNext={goToSchedule} />
      )}
      {stage === "schedule" && (
        <ScheduleStage rankedModules={rankedModules} selectedSubs={NO_SUBS} schedule={schedule} setSchedule={setSchedule}
          day={day} setDay={setDay} tab={tab} setTab={setTab} browseFilter={browseFilter} setBrowseFilter={setBrowseFilter}
          onBack={() => setStage("topics")} onNext={() => setStage("agenda")} attendeeLabel={attendeeLabel} meeting={null} party={party} />
      )}
      {stage === "agenda" && (
        <AgendaStage firstName={firstName} schedule={schedule} setSchedule={setSchedule} party={party} setParty={setParty}
          onBack={() => setStage("topics")} onEditSchedule={() => { setTab("browse"); setStage("schedule"); }} />
      )}
    </div>
  );
}
