import React, { useState, useMemo } from "react";

// ---------- Design tokens ----------
const C = {
  paper: "#EDEFEC",
  paperRaised: "#F7F8F6",
  ink: "#16213D",
  inkSoft: "#5B6472",
  amber: "#DD9A1F",
  amberDeep: "#B87C12",
  line: "#CACFC9",
  lineDark: "#9AA1A8",
};

const MODULE_COLORS = ["#16213D", "#1B7A72", "#B2542F", "#6B4E71", "#5C6B3D"];

// TODO(Chase): swap in the real registration link
const HAPPY_HOUR_URL = "https://your-registration-link.com";
const HAPPY_HOUR_DATE = "October 6, 2026";
const HAPPY_HOUR_VENUE = "LIV Nightclub";

const MODULES = [
  { id: "ec", name: "Employee Central", short: "EC", subs: ["Core HR", "Org Management", "Global Benefits"] },
  { id: "ecp", name: "Employee Central Payroll", short: "ECP", subs: ["Payroll Control Center", "Off-Cycle Processing", "Tax & Compliance"] },
  { id: "rec", name: "Recruiting", short: "REC", subs: ["Recruiting Marketing", "Candidate Experience"] },
  { id: "onb", name: "Onboarding", short: "ONB", subs: ["Onboarding 1.0 Transition", "Cross-Boarding"] },
  { id: "pmgm", name: "Performance & Goals", short: "PMGM", subs: ["Continuous Performance", "Goal Management"] },
  { id: "comp", name: "Compensation", short: "COMP", subs: ["Variable Pay", "Comp Statements"] },
  { id: "scm", name: "Succession & Development", short: "SCM", subs: ["Talent Pools", "Career Worksheet"] },
  { id: "lms", name: "Learning", short: "LMS", subs: ["Learning Needs", "Content Marketplace"] },
  { id: "time", name: "Time Tracking", short: "TIME", subs: ["Time Sheets", "Scheduling"] },
  { id: "ana", name: "People Analytics & Planning", short: "PA&P", subs: ["Workforce Planning", "Story Reports"] },
  { id: "bpaas", name: "BPaaS / Managed Payroll", short: "BPaaS", subs: ["Managed Services", "AMS Support"] },
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
// session catalog page, "Success Connect" (HCM) track — 259 sessions total. Day/time is
// confirmed for 225 of them (22 Monday pre-conference, 97 Tuesday, 106 Wednesday); 34 sessions
// still had no day/time assigned when this was saved and sit under the "Not Yet Scheduled" tab.
// Room numbers are not yet published for any session — shown as "Room TBD" throughout.
const SESSIONS = [
  mkSession(1, 1, 0, "lms", 0, "Advanced Customization and Enhancements in SAP SuccessFactors Learning (HCMPC09)", "Pre-Conference Training: This hands-on skill-building session is led by instructors and is intended to help customers deepen skills, gain confidence, and maximize the value of your SAP investments.", "Room TBD", 2, "Pre-conference training", 480, 720),
  mkSession(2, 1, 0, "lms", 0, "A Look at Class Management in SAP SuccessFactors Learning (HCMPC10)", "Pre-Conference Training: This hands-on skill-building session is led by instructors and is intended to help customers deepen skills, gain confidence, and maximize the value of your SAP investments.", "Room TBD", 0, "Pre-conference training", 480, 720),
  mkSession(3, 1, 0, "onb", 0, "Beyond the Basics: Advanced Onboarding Configuration and Offboarding Readiness (HCMPC05)", "Pre-Conference Training: This hands-on skill-building session is led by instructors and is intended to help customers deepen skills, gain confidence, and maximize the value of your SAP investments.", "Room TBD", 2, "Pre-conference training", 480, 720),
  mkSession(4, 1, 0, "rec", 0, "Explore AI-First, Intelligent Hiring with SmartRecruiters for SAP SuccessFactors (HCMPC14)", "Pre-Conference Training: This hands-on skill-building session is led by instructors and is intended to help customers deepen skills, gain confidence, and maximize the value of your SAP investments.", "Room TBD", 0, "Pre-conference training", 480, 720),
  mkSession(5, 1, 0, "ec", 2, "Navigating Global Compliance in SAP SuccessFactors Employee Central Global Benefits (HCMPC01)", "Pre-Conference Training: This hands-on skill-building session is led by instructors and is intended to help customers deepen skills, gain confidence, and maximize the value of your SAP investments.", "Room TBD", 0, "Pre-conference training", 480, 720),
  mkSession(6, 1, 0, "scm", 0, "Optimizing the Talent Management Cycle with AI (HCMPC17)", "Pre-Conference Training: This hands-on skill-building session is led by instructors and is intended to help customers deepen skills, gain confidence, and maximize the value of your SAP investments.", "Room TBD", 2, "Pre-conference training", 480, 720),
  mkSession(7, 1, 0, "ecp", 0, "Payroll Control Center in SAP SuccessFactors: Configuring and Managing Payroll Processes (HCMPC07)", "Pre-Conference Training: This hands-on skill-building session is led by instructors and is intended to help customers deepen skills, gain confidence, and maximize the value of your SAP investments.", "Room TBD", 0, "Pre-conference training", 480, 720),
  mkSession(8, 1, 0, "ana", 1, "SAP SuccessFactors Employee Central Story Reporting: Analysis with Effective Dating & Time-Based Logic (HCMPC12)", "Pre-Conference Training: This hands-on skill-building session is led by instructors and is intended to help customers deepen skills, gain confidence, and maximize the value of your SAP investments.", "Room TBD", 0, "Pre-conference training", 480, 720),
  mkSession(9, 1, 0, "ec", 0, "SAP SuccessFactors Employee Central Fundamentals including AI Tools and Joule (HCMPC02)", "Pre-Conference Training: This hands-on skill-building session is led by instructors and is intended to help customers deepen skills, gain confidence, and maximize the value of your SAP investments.", "Room TBD", 0, "Pre-conference training", 480, 720),
  mkSession(10, 1, 0, "scm", 0, "Using the Talent Intelligence Hub and Growth Portfolio Functionality in SAP SuccessFactors Solutions (HCMPC19)", "Pre-Conference Training: This hands-on skill-building session is led by instructors and is intended to help customers deepen skills, gain confidence, and maximize the value of your SAP investments.", "Room TBD", 2, "Pre-conference training", 480, 720),
  mkSession(11, 1, 1, "ana", 0, "Accelerating Your Autonomous HCM Journey: End-to-End Enablement for Business Continuity (HCMPC21)", "Pre-conference workshop: Through expert guidance and interactive exercises, you'll explore the full SAP SuccessFactors adoption lifecycle, from AI-powered innovations to long-term support strategies, and leave with practical best practices to maximize the value of your HCM investment.", "Room TBD", 1, "Pre-conference workshop", 780, 1020),
  mkSession(12, 1, 1, "ana", 1, "Beyond Story Report Templates: Turning HR Data into Business Impact (HCMPC13)", "Pre-Conference Training: This hands-on skill-building session is led by instructors and is intended to help customers deepen skills, gain confidence, and maximize the value of your SAP investments.", "Room TBD", 2, "Pre-conference training", 780, 1020),
  mkSession(13, 1, 1, "ecp", 0, "Evolving Payroll Execution in the Payroll Control Center with the new Manage Payroll Activities (HCMPC08)", "Pre-Conference Training: This hands-on skill-building session is led by instructors and is intended to help customers deepen skills, gain confidence, and maximize the value of your SAP investments.", "Room TBD", 2, "Pre-conference training", 780, 1020),
  mkSession(14, 1, 1, "scm", 0, "Exploring Unified Talent Management Capabilities with SAP SuccessFactors Career and Talent Development (HCMPC18)", "Pre-Conference Training: This hands-on skill-building session is led by instructors and is intended to help customers deepen skills, gain confidence, and maximize the value of your SAP investments.", "Room TBD", 2, "Pre-conference training", 780, 1020),
  mkSession(15, 1, 1, "ana", 0, "From Curiosity to Action: Discovering Your High-Value AI Agent Use Cases with SAP (XPC01)", "Pre-conference workshop: Through a expert-led discovery process, you'll identify and prioritize your organization's highest-impact AI opportunities and leave with a tailored AI Use Case Roadmap and a dedicated plan to guide your next steps.", "Room TBD", 0, "Pre-conference workshop", 780, 1020),
  mkSession(16, 1, 1, "ec", 0, "Intelligent Workflow Automation: Enhancing Approval Processes in SAP SuccessFactors Employee Central (HCMPC03)", "Pre-Conference Training: This hands-on skill-building session is led by instructors and is intended to help customers deepen skills, gain confidence, and maximize the value of your SAP investments.", "Room TBD", 2, "Pre-conference training", 780, 1020),
  mkSession(17, 1, 1, "pmgm", 0, "Mastering Business Rules in SAP SuccessFactors Performance & Goals: Going Beyond Limits in Performance Reviews (HCMPC20)", "Pre-Conference Training: This hands-on skill-building session is led by instructors and is intended to help customers deepen skills, gain confidence, and maximize the value of your SAP investments.", "Room TBD", 2, "Pre-conference training", 780, 1020),
  mkSession(18, 1, 1, "comp", 0, "Mastering the Art of Compensation Cycle Planning with SAP SuccessFactors Compensation (HCMPC11)", "Pre-Conference Training: This hands-on skill-building session is led by instructors and is intended to help customers deepen skills, gain confidence, and maximize the value of your SAP investments.", "Room TBD", 0, "Pre-conference training", 780, 1020),
  mkSession(19, 1, 1, "ec", 1, "Modernizing Position Management with AI-Driven Efficiency (HCMPC06)", "Pre-Conference Training: This hands-on skill-building session is led by instructors and is intended to help customers deepen skills, gain confidence, and maximize the value of your SAP investments.", "Room TBD", 2, "Pre-conference training", 780, 1020),
  mkSession(20, 1, 1, "rec", 0, "Optimizing Job Requisitions and Multi-Channel Posting with SmartRecruiters for SAP SuccessFactors (HCMPC15)", "Pre-Conference Training: This hands-on skill-building session is led by instructors and is intended to help customers deepen skills, gain confidence, and maximize the value of your SAP investments.", "Room TBD", 0, "Pre-conference training", 780, 1020),
  mkSession(21, 1, 1, "ana", 0, "SAP SuccessFactors System Administration Fundamentals including AI Tools and Joule (HCMPC04)", "Pre-Conference Training: This hands-on skill-building session is led by instructors and is intended to help customers deepen skills, gain confidence, and maximize the value of your SAP investments.", "Room TBD", 0, "Pre-conference training", 780, 1020),
  mkSession(22, 1, 1, "rec", 0, "SmartRecruiters for SAP SuccessFactors Foundation Excellence: Configuring Critical System Guardrails (HCMPC16)", "Pre-Conference Training: This hands-on skill-building session is led by instructors and is intended to help customers deepen skills, gain confidence, and maximize the value of your SAP investments.", "Room TBD", 0, "Pre-conference training", 780, 1020),
  mkSession(23, 2, 7, "rec", 0, "2027 talent acquisition trends: Navigate the future of intelligent hiring (HCM1479)", "AI is rapidly transforming every stage of the hiring journey, yet many organizations continue to feel outpaced by change.", "Room TBD", 0, "Strategy talk", 585, 630),
  mkSession(24, 2, 7, "lms", 1, "Accelerate SAP SuccessFactors adoption with WalkMe solutions (HCM1408)", "WalkMe solutions help organizations measure adoption, identify where users need support, and uncover opportunities to increase engagement with SAP SuccessFactors solutions.", "Room TBD", 1, "Solution deep dive", 585, 630),
  mkSession(25, 2, 7, "ana", 0, "Building the AI-ready enterprise: Unlocking intelligence through innovation (XSER2149)", "Learn how a leading enterprise is partnering with SAP to build the foundation for enterprise-scale AI.", "Room TBD", 0, "Customer success story", 585, 630),
  mkSession(26, 2, 7, "ec", 0, "Connect HR and finance to drive business growth (HCM1394)", "The best results happen when HR and finance move as one. Learn how companies are driving business growth by aligning HR and finance with SAP GROW offerings.", "Room TBD", 1, "Strategy talk", 585, 630),
  mkSession(27, 2, 7, "ana", 0, "ConocoPhillips: Industry AI for the future of energy and natural resources (XIND1818)", "Discover how the Industry AI portfolio helps oil, gas, energy, utilities, mill products, mining, and chemicals companies innovate and boost operational performance.", "Room TBD", 1, "Customer success story", 585, 630),
  mkSession(28, 2, 7, "scm", 0, "Customer panel: Colgate and Delta Air Lines reimagine skills-based talent (HCM1839)", "Hear the Colgate-Palmolive Company and Delta Air Lines engage in a strategic conversation on the future of skills-based talent.", "Room TBD", 0, "Customer success story", 585, 630),
  mkSession(29, 2, 7, "ecp", 0, "Prepare your business for the future by moving HCM to the cloud (HCM1325)", "Learn more about the SAP ERP Human Capital Management solution's on-premises maintenance timelines and cloud innovations available today.", "Room TBD", 0, "Strategy talk", 585, 630),
  mkSession(30, 2, 7, "ec", 0, "Road map: Leverage an enterprise AI foundation in the age of Autonomous HCM (HCM1444)", "Explore the innovations powering SAP SuccessFactors HCM. Discover the transformative power of agentic AI on SAP Business AI Platform, alongside key innovations in integration, extensibility, security, and system administration.", "Room TBD", 0, "Roadmap", 585, 630),
  mkSession(31, 2, 7, "ana", 0, "Turn AI into outcomes: Build the foundation with SAP Business AI Platform (XBAIP1208)", "Discover how an SAP customer is using SAP Business AI Platform to stay future ready and turn real processes, data, and governance into autonomous outcomes that close the AI value gap at scale.", "Room TBD", 1, "Customer success story", 585, 630),
  mkSession(32, 2, 8, "ecp", 0, "Compliant payroll at scale: A strategy for global growth (HCM1913)", "Payroll compliance is harder when every country plays by different rules. See how a single connected payroll system monitors regulatory changes across every jurisdiction, validates each pay run, and maintains audit-ready documentation.", "Room TBD", 0, "Strategy talk", 600, 620),
  mkSession(33, 2, 8, "time", 0, "From vision to value: Transforming HR in regulated industries (HCM1489)", "Discover how SAP helps regulated industries transform HR operations with purpose-built capabilities including position budgeting control for cloud and consolidated time recording.", "Room TBD", 1, "Strategy talk", 600, 620),
  mkSession(34, 2, 8, "pmgm", 0, "Maximize organizational performance by aligning people, jobs, and structure (PAR1027)", "Get customer insights on talent cards from chemical company LyondellBasell Industries N.V. while an SAP expert explores structures for effective org design.", "Room TBD", 1, "Customer success story", 600, 620),
  mkSession(35, 2, 10, "ana", 0, "Building enterprise AI at scale through collaboration (X2215)", "Discover how SAP, Accenture, and global enterprises are transforming emerging AI capabilities into business value.", "Room TBD", 0, "Customer success story", 645, 690),
  mkSession(36, 2, 10, "ana", 0, "Managing risk and compliance across a blended workforce (SPM1629)", "As the external workforce grows, so does regulatory scrutiny.", "Room TBD", 0, "Strategy talk", 645, 690),
  mkSession(37, 2, 10, "ana", 0, "Paving the path to AI at scale: The Autonomous Enterprise vision (XERP1862)", "Find out what it looks like when a world-class organization bets on ERP as the foundation for enterprise AI.", "Room TBD", 0, "Customer success story", 645, 690),
  mkSession(38, 2, 10, "ana", 0, "Retail industry tour (XIND2188)", "See the Industry AI portfolio in action. Explore a new agentic operating system for retail, including scenarios for new product introduction, retail supply chain planning, loyalty, shopping, order management, and store intelligence.", "Room TBD", 1, "Industry tour", 645, 690),
  mkSession(39, 2, 10, "ana", 0, "SAP Sovereign Cloud and security and compliance: Built without compromise (XSER1746)", "Sovereignty and security are no longer afterthoughts—they’re the conditions for cloud innovation.", "Room TBD", 0, "Strategy talk", 645, 690),
  mkSession(40, 2, 10, "ana", 0, "SAP SuccessFactors: A new era for HR with Autonomous HCM (HCM1289)", "Discover how customers are turning the promise of Autonomous HCM into measurable results with SAP SuccessFactors solutions.", "Room TBD", 0, "Keynote", 645, 705),
  mkSession(41, 2, 11, "ana", 0, "Unlocking your data goldmine: The foundation for AI success (XSER2150)", "Enterprises sit on a goldmine of data but spend more time curating it than acting on it. Explore the strategic vision behind the SAP Business Data Cloud solution.", "Room TBD", 0, "Strategy talk", 660, 680),
  mkSession(42, 2, 15, "ana", 0, "Quick tips: How to get started with Autonomous HCM (HCM1985)", "AI agents are already transforming HR—automating hiring, onboarding, and talent decisions through autonomous multistep workflows.", "Room TBD", 0, "Quick tips", 710, 715),
  mkSession(43, 2, 16, "ana", 0, "2027 and beyond: Future of work predictions reality check (HCM1320)", "Last year’s predictions were full of provocative takes. What happened, what didn’t, and what's next?", "Room TBD", 0, "Strategy talk", 720, 740),
  mkSession(44, 2, 16, "ana", 0, "Accelerate time to value of SAP projects with SAP Joule for Consultants (XJOU1969)", "Unlock the value of your software investments sooner by equipping SAP project teams to implement SAP solutions up to 14% faster.", "Room TBD", 0, "Strategy talk", 720, 740),
  mkSession(45, 2, 16, "ana", 0, "Brighthouse: Streamline HR operations with SAP Cloud Application Services (HCM1747)", "Discover how Brighthouse is advancing its SAP SuccessFactors solutions operations with SAP Cloud Application Services offerings, using AI to create a more proactive operating model.", "Room TBD", 0, "Customer success story", 720, 765),
  mkSession(46, 2, 16, "rec", 0, "Discipline over customization: Steelcase’s global HR foundation (PAR1006)", "A disciplined governance model and PwC-leading practices drove Steelcase to a standard, low-customization implementation of SAP SuccessFactors solutions.", "Room TBD", 0, "Customer success story", 720, 740),
  mkSession(47, 2, 16, "ana", 0, "Industry AI tour (XIND2196)", "Take a guided industry AI tour to see autonomous, agentic solutions in action across seven Industry domains. Explore how SAP connects data, applications, and AI to improve decisions and outcomes.", "Room TBD", 1, "Industry tour", 720, 765),
  mkSession(48, 2, 16, "ana", 0, "Putting the human in Autonomous HCM (HCM2254)", "What does an AI-enabled workforce really look like in practice? Share what your organization is navigating and hear what’s top of mind for your peers.", "Room TBD", 1, "Roundtable discussion", 720, 765),
  mkSession(49, 2, 16, "lms", 0, "Reduce risk and skill gaps with intelligent personalized learning (HCM1361)", "Accelerate workforce readiness and stay ahead of compliance. Discover how proactive compliance intelligence surfaces certification gaps before they become operational events.", "Room TBD", 2, "Strategy talk", 720, 765),
  mkSession(50, 2, 16, "ana", 0, "Road map and vision: Unlocking the value of AI in SAP SuccessFactors HCM (HCM1418)", "Get a forward-looking view of AI across SAP SuccessFactors HCM. Preview the full road map—upcoming agent capabilities, Joule solution enhancements, and AI-powered features spanning talent, core HR, and workforce management.", "Room TBD", 1, "Roadmap", 720, 765),
  mkSession(51, 2, 16, "time", 0, "Road map: Compliant workforce management in the age of Autonomous HCM (HCM1968)", "Get a first look at what's coming for workforce management. From AI scheduling to new agents for time and absence, explore the innovations that cut overtime, overstaffing, and payroll errors.", "Room TBD", 0, "Roadmap", 720, 765),
  mkSession(52, 2, 16, "ana", 1, "Road map: Drive continuous workforce planning in the age of Autonomous HCM (HCM1687)", "Look ahead to learn how continuous workforce planning will help organizations forecast, plan, and execute workforce strategies at the frequency of change.", "Room TBD", 0, "Roadmap", 720, 765),
  mkSession(53, 2, 16, "ana", 0, "SAP Business AI Platform and HCM overview (HCM1499)", "Get an overview of SAP Business AI Platform and the opportunity it provides for SAP SuccessFactors HCM customers.", "Room TBD", 0, "Solution deep dive", 720, 765),
  mkSession(54, 2, 16, "rec", 0, "See how to create connected talent experiences across hiring and beyond (HCM1428)", "Discover the power of a seamless talent journey that turns eager candidates into productive new hires and successful employees.", "Room TBD", 0, "Solution demo", 720, 740),
  mkSession(55, 2, 16, "rec", 0, "Take your first steps into agentic hiring: Lessons from three SAP customers (HCM1911)", "Hiring is one of the first places agentic AI gets real, and knowing where to start is hard. Three SAP customers share how they actually began, building the business case and splitting work between people and agents.", "Room TBD", 0, "Customer success story", 720, 765),
  mkSession(56, 2, 17, "ec", 0, "Building a global HR foundation: ExxonMobil's SAP SuccessFactors journey (HCM1898)", "With around 60,000 employees worldwide, ExxonMobil embarked on a large-scale HR technology transformation centered on implementation of the SAP SuccessFactors Employee Central solution.", "Room TBD", 0, "Customer success story", 750, 770),
  mkSession(57, 2, 17, "ana", 0, "Harness enterprise data and AI for more compliant, sustainable operations (XSUS1737)", "Learn how organizations are using SAP Sustainability solutions to unify operational and sustainability data for better decision-making.", "Room TBD", 0, "Strategy talk", 750, 770),
  mkSession(58, 2, 17, "ana", 0, "Smarter global compliance: Verified HR intelligence in Joule (PAR1026)", "Turn the Joule solution into a global compliance engine. Discover how G-P Gia™, an intelligent global HR compliance platform, delivers instant, verified labor law guidance across 50+ countries.", "Room TBD", 0, "Strategy talk", 750, 770),
  mkSession(59, 2, 17, "lms", 1, "Turn AI activation to adoption with SAP SuccessFactors and WalkMe solutions (HCM1406)", "Deploying AI is only the beginning. The real challenge is helping employees discover, trust, and use it consistently in ways that change how work gets done.", "Room TBD", 0, "Quick tips", 750, 770),
  mkSession(60, 2, 18, "ana", 0, "Leading business functions with embedded intelligence (PAR1000)", "Learn how Accenture helps organizations build on existing SAP investments by embedding intelligence into finance, supply chain, procurement, HR, and customer operations.", "Room TBD", 2, "Strategy talk", 780, 800),
  mkSession(61, 2, 18, "ec", 0, "Org design without guesswork: Simulate, decide, and evolve with confidence (HCM1912)", "Most organizations approach org design reactively—when the pressure is already on.", "Room TBD", 0, "Strategy talk", 780, 800),
  mkSession(62, 2, 18, "ana", 0, "What HR leaders should do to prepare for Joule Assistants and Joule Agents (HCM1421)", "AI agents are already transforming HR—automating hiring, onboarding, and talent decisions through autonomous multistep workflows.", "Room TBD", 1, "Strategy talk", 780, 800),
  mkSession(63, 2, 19, "ec", 0, "Streamline core HR with AI-assisted writing and intelligent HR actions​ (HCM1699)", "See how the SAP SuccessFactors Employee Central solution helps HR teams simplify everyday HR transactions, improve data quality, and lower manual follow-up.", "Room TBD", 2, "Hands-on lab", 795, 870),
  mkSession(64, 2, 19, "rec", 0, "Supercharge your hiring process with SmartRecruiters solutions (HCM1695)", "Discover how to hire faster and smarter with SmartRecruiters solutions in a hands-on lab covering the recruiting process with the latest innovations in hiring.", "Room TBD", 0, "Hands-on lab", 795, 855),
  mkSession(65, 2, 19, "ana", 0, "Workshop: Redesign jobs for the agentic AI era (HCM1332)", "As AI changes how work gets done, now is the time to rethink traditional job models. Discover how you can apply task intelligence, outcomes-based design, and job enrichment techniques to make jobs better for humans and optimized for AI.", "Room TBD", 0, "Workshop‎", 795, 855),
  mkSession(66, 2, 19, "ana", 0, "Workshop: Reimagine the user experience with Joule Work for HR (HCM1336)", "Discover how the Joule Work capability provides a unified entry point to Autonomous HCM, empowering users to complete tasks quickly and confidently with an intent-driven experience.", "Room TBD", 0, "Workshop‎", 795, 855),
  mkSession(67, 2, 20, "time", 0, "Autonomous workforce management: How HR achieves global compliance (HCM1490)", "Autonomous workforce management isn't about removing HR from the equation, it's about giving HR the power to lead it.", "Room TBD", 1, "Strategy talk", 810, 830),
  mkSession(68, 2, 20, "pmgm", 0, "Close skill gaps and personalize development aligned to business goals (HCM1365)", "Discover how AI-agentic experiences help close skill gaps by aligning employee growth with business demands.", "Room TBD", 0, "Solution deep dive", 810, 855),
  mkSession(69, 2, 20, "ana", 0, "From AI hype to HR impact: Proving value at scale at IBM (PAR1013)", "Most organizations have deployed AI, yet few can prove business impact.", "Room TBD", 0, "Customer success story", 810, 830),
  mkSession(70, 2, 20, "ana", 0, "From vision to value: Universal Horror Unleashed and SAP (XIND1819)", "Nothing to be scared of. Learn how Universal Horror Unleashed used a two-tier architecture to bring a unique guest experience to Las Vegas.", "Room TBD", 1, "Customer success story", 810, 855),
  mkSession(71, 2, 20, "ana", 0, "Guided tour: How AI transforms automotive—from procurement to shop floor (XIND2189)", "From the first order signal to the last bolt on the line—the Industry AI portfolio is rewriting how automotive companies build.", "Room TBD", 1, "Industry tour", 810, 855),
  mkSession(72, 2, 20, "ana", 1, "How BESTSELLER is empowering its leaders with trusted data and insights (HCM1305)", "Learn how BESTSELLER, an early adopter of People Intelligence, is using predelivered insights for workforce composition, recruiting, and time management to arm leaders with trusted, relevant, and timely workforce intelligence.", "Room TBD", 0, "Customer success story", 810, 830),
  mkSession(73, 2, 20, "onb", 0, "How Lockheed Martin transformed HR for 123,000 users (HCM1744)", "Transforming HCM demands the right strategy, the right partners, and disciplined execution.", "Room TBD", 0, "Customer success story", 810, 855),
  mkSession(74, 2, 20, "rec", 0, "Road map: Hire the right talent faster in the age of Autonomous HCM (HCM1426)", "Get an inside look at the product vision and road map for intelligent talent acquisition solutions. Discover how AI assistants and agents offer automation and insights to help you attract, engage, hire, and onboard top talent.", "Room TBD", 2, "Roadmap", 810, 855),
  mkSession(75, 2, 20, "ec", 0, "Road map: What's next for HR operations in the age of Autonomous HCM (HCM1475)", "AI is rewriting how HR manages people.", "Room TBD", 0, "Roadmap", 810, 855),
  mkSession(76, 2, 20, "ana", 0, "SAP Business AI Platform: The foundation of the Autonomous Enterprise (XBAIP1209)", "Draw back the curtain to reveal the three pillars of SAP Business AI Platform—build, contextualize and reason, and govern.", "Room TBD", 0, "Strategy talk", 810, 830),
  mkSession(77, 2, 20, "ana", 0, "Secure, connect, evolve: HCM innovations for integrations and security (HCM1445)", "Discover our latest innovations in security, identity management, integration, and extensibility.", "Room TBD", 2, "Solution deep dive", 810, 855),
  mkSession(78, 2, 20, "ana", 0, "Stater Bros. Markets: Skills-based workforce management in the age of AI (HCM1970)", "Finding and retaining top talent is a top priority for most businesses today. Learn how Stater Bros.", "Room TBD", 0, "Customer success story", 810, 855),
  mkSession(79, 2, 20, "ana", 0, "The process edge: How SAP Signavio solutions make transformation stick (XBAIP1666)", "Process excellence is the foundation of high-performing organizations across finance, procurement, HR, and supply chain.", "Room TBD", 0, "Customer success story", 810, 855),
  mkSession(80, 2, 21, "ana", 1, "Align HR to the business with continuous workforce planning and redesign (HCM1688)", "As AI fundamentally changes how work is performed, workforce planning demands a new level of strategic intelligence.", "Room TBD", 1, "Strategy talk", 840, 860),
  mkSession(81, 2, 21, "scm", 0, "Redesign your job architecture to support career and talent development (PAR1021)", "The SAP SuccessFactors Career and Talent Development solution needs a fit-for-purpose job architecture—but most were built for compensation, not talent.", "Room TBD", 1, "Strategy talk", 840, 860),
  mkSession(82, 2, 21, "ecp", 0, "See it work: A live end-to-end demo of an integrated HR foundation (HCM1488)", "Most HR teams still rely on multiple systems to do what one should.", "Room TBD", 1, "Solution demo", 840, 860),
  mkSession(83, 2, 22, "ana", 0, "Autonomous HCM: The future of HR is already here (HCM1417)", "What does it mean for HCM to be truly autonomous? Examine how AI is moving HR from reactive administration to proactive, self-executing processes.", "Room TBD", 0, "Strategy talk", 870, 915),
  mkSession(84, 2, 22, "ana", 0, "Beyond the pilot: How SAP Cloud ERP turns AI into real business outcomes (XERP1861)", "AI alone does not create value. Business outcomes do. Learn how AI-enabled ERP helps organizations automate routine tasks, improve decision-making, and increase productivity, enabling greater operational efficiency and scalable growth.", "Room TBD", 0, "Strategy talk", 870, 915),
  mkSession(85, 2, 22, "ecp", 0, "Configuration management in practice with CodeBot (PAR1012)", "Strategy only holds up when it survives daily execution.", "Room TBD", 0, "Customer success story", 870, 890),
  mkSession(86, 2, 22, "ecp", 0, "Expedite your cloud migration with SAP Readiness Check, proven worldwide (HCM1326)", "The SAP Readiness Check toolset helps you prepare for your move from the SAP ERP Human Capital Management solution on-premises to SAP SuccessFactors HCM.", "Room TBD", 0, "Solution deep dive", 870, 915),
  mkSession(87, 2, 22, "rec", 0, "How to establish your skills foundation to power an agile talent strategy (HCM1353)", "Learn how to activate your skills strategy with proven, practical steps for setup and governance of your skills and job architecture.", "Room TBD", 2, "Quick tips", 870, 890),
  mkSession(88, 2, 22, "ana", 0, "Joule Work: How customers are reshaping work for the Autonomous Enterprise (XJOU1399)", "Explore outcomes, best practices, and lessons from early adopters of the Joule Work capability, including SAP as customer zero. Learn more about the proactive, outcome-driven user experience where people express goals and AI gets them done.", "Room TBD", 0, "Customer success story", 870, 915),
  mkSession(89, 2, 22, "rec", 0, "Road map: Accelerate employee growth in the age of Autonomous HCM (HCM1356)", "Look ahead to learn how SAP SuccessFactors solutions for learning and talent management are shaping the future of Autonomous HCM.", "Room TBD", 0, "Roadmap", 870, 915),
  mkSession(90, 2, 22, "rec", 0, "Roundtable: Measuring the impact of AI in the age of intelligent hiring (HCM1431)", "Engage with experts and peers in an interactive discussion exploring value-based use cases where AI can empower your organization to hire the right skills faster, navigate candidate fraud, and streamline every step of the hiring journey.", "Room TBD", 2, "Roundtable discussion", 870, 915),
  mkSession(91, 2, 22, "ana", 0, "SAP Integration Suite: Connecting HR processes with the power of AI (HCM1456)", "Take a deep dive into how SAP Integration Suite can help HR organizations streamline the creation of integration flows with new built-in AI capabilities.", "Room TBD", 2, "Solution deep dive", 870, 915),
  mkSession(92, 2, 22, "scm", 0, "Scotiabank: Turning insights into action to accelerate AI and skills growth (HCM1743)", "Discover how Scotiabank is reimagining its global talent strategy with AI within SAP SuccessFactors solutions.", "Room TBD", 0, "Customer success story", 870, 915),
  mkSession(93, 2, 22, "ecp", 0, "The efficient employee lifecycle: How integrated HR cuts complexity (HCM1483)", "HR fragmentation has a cost: errors, delays, vendor spend, and compliance risk.", "Room TBD", 0, "Strategy talk", 870, 915),
  mkSession(94, 2, 22, "ana", 0, "Utilities, oil, gas, and energy tour (XIND2192)", "Join executive Torsten Welte to discuss industry-relevant innovations across line of business.", "Room TBD", 1, "Industry tour", 870, 915),
  mkSession(95, 2, 23, "rec", 1, "Built for growth: Allison’s scalable blueprint for M&A agility (PAR1016)", "Learn how Allison Transmission Inc. deployed the SAP SuccessFactors Employee Central, SAP SuccessFactors Recruiting, and SAP SuccessFactors Onboarding solutions to create a flexible playbook for acquisitions.", "Room TBD", 0, "Customer success story", 900, 920),
  mkSession(96, 2, 23, "ana", 0, "Joule solution road map: What’s planned and why it matters to your business (XJOU1953)", "Learn how core capabilities in Joule are advancing to increase value across domains and industries. Discover the business context of key investments, including the orchestration agent harness, skill hub, Joule Work, and enterprise grounding.", "Room TBD", 0, "Roadmap", 900, 920),
  mkSession(97, 2, 23, "scm", 0, "Learn PepsiCo’s secret skills recipe for career growth and mobility (HCM1905)", "Knowing who’s needed, when, and where is key to accelerating your strategic priorities. Discover how PepsiCo is transforming talent by aligning skills, development, and business outcomes to drive employee growth and engagement.", "Room TBD", 0, "Customer success story", 900, 920),
  mkSession(98, 2, 23, "ec", 0, "Lockheed Martin: Reimagine HR service delivery for the modern enterprise (HCM1916)", "Discover how Lockheed Martin transformed HR service delivery to meet the needs of a modern, global workforce with the SAP SuccessFactors Enterprise Service Management solution.", "Room TBD", 0, "Customer success story", 900, 920),
  mkSession(99, 2, 24, "pmgm", 0, "Advance skills, performance, and growth with SAP SuccessFactors solutions (HCM1697)", "Dive into SAP SuccessFactors talent development and performance management in this hands-on lab.", "Room TBD", 2, "Hands-on lab", 915, 990),
  mkSession(100, 2, 24, "onb", 0, "Hands-on challenge: Put Joule and agentic AI to work across HR (HCM1701)", "Ready for a challenge? Compete with fellow HCM professionals to see which team can complete AI-powered HR scenarios first.", "Room TBD", 1, "Hands-on lab", 915, 990),
  mkSession(101, 2, 24, "ana", 1, "Uncover HR insights with story reports in SAP SuccessFactors solutions (HCM1702)", "Designed for reporting administrators, this hands-on lab session can help you take reporting to the next level.", "Room TBD", 2, "Hands-on lab", 915, 990),
  mkSession(102, 2, 24, "pmgm", 0, "Workshop: Create an impact-driven performance and rewards strategy (HCM1335)", "Looking to build a pay-for-performance process that fairly rewards employee contribution? Explore innovative ways to measure workforce impact and value creation.", "Room TBD", 0, "Workshop‎", 915, 975),
  mkSession(103, 2, 24, "ana", 0, "Workshop: Keeping humans at the center of Autonomous HCM (HCM1337)", "AI is rapidly transforming HCM by reducing the manual burden that comes with traditional HR processes. But how can you ensure people remain at the heart of this new operating model?", "Room TBD", 0, "Workshop‎", 915, 975),
  mkSession(104, 2, 25, "ana", 0, "Closing the context gap with SAP Business AI Platform (XBAIP1644)", "The Autonomous Enterprise runs on agents that understand how your business works.", "Room TBD", 0, "Strategy talk", 930, 950),
  mkSession(105, 2, 25, "ec", 0, "Quick tips to improve process efficiency with mass data management (HCM1487)", "When workforce data changes at scale, mass data management in the SAP SuccessFactors Employee Central solution helps teams move faster without sacrificing accuracy.", "Room TBD", 0, "Quick tips", 930, 950),
  mkSession(106, 2, 25, "ana", 0, "See how to work smarter with Spaces in Joule Work (HCM1414)", "The Joule solution is evolving. Discover Spaces in Joule Work, a reimagined AI experience that brings intelligence, tasks, and collaboration into one unified place.", "Room TBD", 0, "Solution demo", 930, 950),
  mkSession(107, 2, 26, "onb", 0, "Ask the experts: Hire and onboard faster with talent acquisition solutions (HCM1427)", "Bring your toughest hiring questions to the people who know the answers. In an open forum, product experts tackle your questions on agentic talent acquisition, AI, migration, integration, and skills-based hiring.", "Room TBD", 1, "Ask the expert", 945, 990),
  mkSession(108, 2, 26, "ana", 0, "Consumer products industry tour (XIND2187)", "See the Industry AI portfolio in action.", "Room TBD", 1, "Industry tour", 945, 990),
  mkSession(109, 2, 26, "ana", 0, "Driving adoption: Practical lessons from SAP Fieldglass customers (SPM1630)", "Technology only delivers value when people actually use it. Learn practical, real-world lessons from customers of SAP Fieldglass solutions on the best ways to drive adoption.", "Room TBD", 0, "Strategy talk", 945, 990),
  mkSession(110, 2, 26, "ana", 0, "Extend the Autonomous Enterprise across LOBs with the Joule Studio solution (XBAIP1682)", "The Autonomous Enterprise is powered by AI, but requires business context, orchestration, and governance.", "Room TBD", 0, "Strategy talk", 945, 990),
  mkSession(111, 2, 26, "ana", 0, "Getting started with agentic AI adoption (SCM1472)", "Find out how to begin using agentic AI in asset and service management. Discuss practical adoption paths, organizational readiness, use cases, and challenges in bringing AI agents into asset operations and field service environments.", "Room TBD", 0, "Roundtable discussion", 945, 990),
  mkSession(112, 2, 26, "ecp", 0, "Inside SAP’s skills-led workforce transformation with AI and data (HCM1277)", "Learn how SAP evolved from establishing a global skills foundation to orchestrating an autonomous workforce with SAP SuccessFactors solutions, the SAP Business Data Cloud solution, and agentic AI capabilities.", "Room TBD", 2, "Customer success story", 945, 990),
  mkSession(113, 2, 26, "ana", 0, "NTT Data: Unifying people, processes, and technology in the age of AI (HCM1931)", "Hear how NTT Data, a global IT services and consulting organization, transformed a fragmented landscape of legacy HR systems and processes into a unified AI-ready platform.", "Room TBD", 0, "Customer success story", 945, 990),
  mkSession(114, 2, 26, "rec", 0, "Road map: Develop your people in the age of Autonomous HCM (HCM1358)", "Look ahead to learn how proactive AI experiences are shaping the future of skills, learning, and talent development.", "Room TBD", 0, "Roadmap", 945, 990),
  mkSession(115, 2, 26, "ecp", 0, "Road map: Transforming how people are paid in the age of Autonomous HCM (HCM1481)", "Autonomous payroll isn't about removing people from the process—it's about removing friction. The future of payroll streamlines every pay cycle without compromising the trust, governance, and transparency that the process demands.", "Room TBD", 0, "Roadmap", 945, 990),
  mkSession(116, 2, 26, "ana", 1, "Turn people insights into confident talent decisions (HCM1690)", "A continuous and comprehensive view of your workforce is critical to effective talent deployment, development, and compensation.", "Room TBD", 2, "Solution deep dive", 945, 990),
  mkSession(117, 2, 27, "ana", 0, "Quick tips you can use to estimate AI usage in SAP SuccessFactors HCM (HCM1413)", "Before you activate AI agents and skills in SAP SuccessFactors solutions, understand how your employees will use them.", "Room TBD", 0, "Quick tips", 960, 980),
  mkSession(118, 2, 27, "ecp", 0, "Trust your data, change with confidence, and run better (PAR1019)", "Learn how trusted HR and payroll teams prepare systems, validate accuracy, and reduce risks across daily operations.", "Room TBD", 1, "Strategy talk", 960, 980),
  mkSession(119, 2, 28, "ana", 0, "Govern AI adoption in the flow of work with WalkMe solutions (XBAIP1832)", "AI governance is strongest with oversight and visibility into how people use AI in their everyday work.", "Room TBD", 0, "Strategy talk", 990, 1010),
  mkSession(120, 3, 2, "ana", 0, "How to activate AI assistants and agents for HCM in “SAP for Me” (HCM1415)", "The SAP for Me tool is your central hub for activating AI assistants and agents across SAP SuccessFactors solutions.", "Room TBD", 0, "Quick tips", 480, 500),
  mkSession(121, 3, 3, "rec", 0, "Experience agentic recruiting at scale: Accelerate volume hiring with AI (HCM1429)", "See how agentic AI streamlines high-volume hiring, from job discovery to automated interview scheduling and beyond.", "Room TBD", 2, "Solution deep dive", 495, 540),
  mkSession(122, 3, 3, "ana", 0, "From the SAP Ariba Sourcing solution to SAP S/4HANA: Modernization journey (XIND1820)", "Learn how Los Alamos National Laboratory is using source-to-contract solutions to support acquisition planning and SLA-driven customer commitments in a highly regulated environment.", "Room TBD", 1, "Customer success story", 495, 540),
  mkSession(123, 3, 3, "rec", 0, "Harness skills intelligence to drive better talent decisions (HCM1351)", "Discover how the foundational skills data layer across SAP SuccessFactors HCM powers smarter learning and talent decisions.", "Room TBD", 0, "Solution deep dive", 495, 540),
  mkSession(124, 3, 3, "ec", 0, "No ticket required: How AI is changing HR service delivery (HCM1491)", "An employee has a question. What happens next can redefine how employees experience HR.", "Room TBD", 2, "Solution deep dive", 495, 540),
  mkSession(125, 3, 3, "ana", 1, "Road map: Drive continuous workforce planning in the age of Autonomous HCM (HCM1687)", "Look ahead to learn how continuous workforce planning will help organizations forecast, plan, and execute workforce strategies at the frequency of change.", "Room TBD", 0, "Roadmap", 495, 540),
  mkSession(126, 3, 3, "ecp", 0, "Road map: Transforming how people are paid in the age of Autonomous HCM (HCM1481)", "Autonomous payroll isn't about removing people from the process—it's about removing friction. The future of payroll streamlines every pay cycle without compromising the trust, governance, and transparency that the process demands.", "Room TBD", 0, "Roadmap", 495, 540),
  mkSession(127, 3, 3, "ana", 0, "Telecommunications and media industries tour (XIND2193)", "Join SAP industry experts on a guided tour to explore business AI built into the flow of work—accelerating monetization, sharpening customer experiences, and strengthening operational agility on one integrated platform.", "Room TBD", 1, "Industry tour", 495, 540),
  mkSession(128, 3, 3, "ana", 1, "Workforce planning in the age of AI: Ask the right questions (FIN1964)", "AI is reshaping the workforce faster than planning models can adapt. Finance, HR, and procurement each see a different piece—but no one sees the whole.", "Room TBD", 0, "Strategy talk", 495, 540),
  mkSession(129, 3, 4, "ana", 0, "How co-innovation with SAP is driving customer adoption of agentic AI (HCM1419)", "Hear directly from SAP about what happens when we join forces with our customers to solve HR challenges with AI.", "Room TBD", 0, "Strategy talk", 510, 530),
  mkSession(130, 3, 4, "ana", 0, "Smarter leasing decisions with SAP Customer Experience and SAP Business AI (X2214)", "Learn how Far East Organization, one of Singapore’s largest private property developers, is collaborating with SAP to create an AI-enabled real estate lease renewal solution, unifying lease and financial data from the SAP Customer Experience portfolio, SAP Business AI, and SAP S/4HANA for greater visibility and informed leasing decisions at scale.", "Room TBD", 0, "Customer success story", 510, 530),
  mkSession(131, 3, 5, "ana", 0, "Corning Incorporated: From early adoption to real impact with Joule Studio (XBAIP1681)", "Hear a firsthand account of Corning Incorporated’s experience in the SAP Early Adopter Care program.", "Room TBD", 0, "Customer success story", 540, 560),
  mkSession(132, 3, 5, "ana", 0, "How BAT standardized HR across more than 90 countries (HCM1952)", "Discover how BAT, a consumer goods organization, created a consistent experience for its globally distributed workforce using a single HR platform.", "Room TBD", 0, "Customer success story", 540, 560),
  mkSession(133, 3, 5, "ecp", 0, "Powering your enterprise AI strategy: Payroll, time, and compliance (PAR1010)", "Enterprise AI strategies succeed or fail at the foundation. We explore how agentic AI is transforming payroll, time, and compliance from back-end functions into strategic assets.", "Room TBD", 1, "Strategy talk", 540, 560),
  mkSession(134, 3, 5, "rec", 0, "Quick tips: Accelerate hiring transformation with AI (HCM1432)", "Learn about AI migration tools and flexible transition options to enhance your hiring strategy quickly and confidently, empowering your talent acquisition teams with the latest agentic sourcing, screening, and recruiting capabilities.", "Room TBD", 0, "Quick tips", 540, 560),
  mkSession(135, 3, 5, "rec", 0, "Supercharge your hiring process with SmartRecruiters solutions (HCM1695)", "Discover how to hire faster and smarter with SmartRecruiters solutions in a hands-on lab covering the recruiting process with the latest innovations in hiring.", "Room TBD", 0, "Hands-on lab", 540, 600),
  mkSession(136, 3, 5, "ecp", 0, "Unlock payroll insights with the enhanced payroll control center (HCM1698)", "Get hands-on with managing payroll activities in the payroll control center (PCC). Build custom charts to compare payroll results across periods, drill down to employee-level details, and access pay slips directly.", "Room TBD", 0, "Hands-on lab", 540, 600),
  mkSession(137, 3, 5, "ana", 0, "Workshop: Chart your path toward Autonomous HCM (HCM1331)", "Ready to embrace the future of HCM but not sure where to start? Discover agentic AI readiness and adoption best practices.", "Room TBD", 0, "Workshop‎", 540, 600),
  mkSession(138, 3, 5, "ana", 0, "Workshop: Preparing people managers to lead in the age of AI (HCM1334)", "The people manager role is undergoing a critical shift driven by agentic AI and evolving employee needs.", "Room TBD", 0, "Workshop‎", 540, 600),
  mkSession(139, 3, 6, "rec", 0, "Evolve from compliance risk to compliance ready with AI (HCM1359)", "See how proactive compliance intelligence transforms compliance from reactive scramble to strategic advantage by surfacing certification gaps before they halt operations, automating manual tracking and reducing audit prep from weeks to hours, and driving measurable drops in penalties and incidents.", "Room TBD", 2, "Solution demo", 570, 590),
  mkSession(140, 3, 6, "ana", 0, "Gaining trusted 360° views for AI outcomes with the SAP Reltio solution (XBAIP1645)", "AI delivers real business outcomes only when it understands how your business operates.", "Room TBD", 0, "Strategy talk", 570, 615),
  mkSession(141, 3, 6, "pmgm", 0, "Improve agility and performance with total workforce management (SPM1628)", "To maximize agility, companies are shifting from filling predefined, static roles to choosing candidates with proven competencies, regardless of worker type.", "Room TBD", 0, "Strategy talk", 570, 615),
  mkSession(142, 3, 6, "ana", 0, "Industry AI: The competitive edge for consumer industries (XIND1857)", "Learn how the Industry AI portfolio embeds intelligent assistants and autonomous agents into consumer industry processes.", "Room TBD", 1, "Customer success story", 570, 615),
  mkSession(143, 3, 6, "rec", 0, "Measure what matters by connecting employee impact to talent decisions (HCM1362)", "Without visibility into workforce signals and employee contributions, recognition falters, learning ROI is hard to justify, and talent decisions turn reactive.", "Room TBD", 2, "Strategy talk", 570, 615),
  mkSession(144, 3, 6, "ana", 0, "Public services industries tour (XIND2195)", "Take a guided tour with SAP public services industry experts to discover AI-powered innovations, industry best practices, and transformative business processes.", "Room TBD", 1, "Industry tour", 570, 615),
  mkSession(145, 3, 6, "ana", 0, "Road map: Unlocking the value of AI in SAP SuccessFactors HCM (HCM1984)", "Spotlight on: Get a forward-looking view of AI across SAP SuccessFactors HCM. Preview the full road map—upcoming agent capabilities, Joule solution enhancements, and AI-powered features spanning talent, core HR, and workforce management.", "Room TBD", 0, "Roadmap", 570, 590),
  mkSession(146, 3, 6, "ec", 0, "Road map: What's next for HR operations in the age of Autonomous HCM (HCM1475)", "AI is rewriting how HR manages people.", "Room TBD", 0, "Roadmap", 570, 615),
  mkSession(147, 3, 6, "ana", 0, "Run, manage, automate: AI-enhanced innovations in HCM system administration (HCM1447)", "Discover the next generation of system administration for SAP SuccessFactors solutions, supported by AI-enhanced innovations.", "Room TBD", 2, "Solution deep dive", 570, 615),
  mkSession(148, 3, 6, "ecp", 0, "SAP Integration Suite: HCM integration for benefits, payroll, and finance (HCM1459)", "Explore specific HCM use cases for SAP Integration Suite in third-party benefits management, external payroll, and integrating organizational changes that affect budgets between HCM and SAP S/4HANA.", "Room TBD", 2, "Solution deep dive", 570, 615),
  mkSession(149, 3, 6, "ana", 0, "SAP SuccessFactors product strategy: Making Autonomous HCM a reality (HCM1328)", "Get an inside look at the product strategy for SAP SuccessFactors HCM, including how we prioritize investments, evaluate partnerships, assess trends, and shape our road map.", "Room TBD", 2, "Strategy talk", 570, 615),
  mkSession(150, 3, 6, "ec", 0, "Sky Chefs: Modernizing HR to scale for growth (HCM1511)", "Hear Sky Chefs share its HR modernization journey with SAP SuccessFactors solutions.", "Room TBD", 0, "Customer success story", 570, 590),
  mkSession(151, 3, 6, "ecp", 0, "The payroll advantage: Maximizing value from SAP SuccessFactors (PAR1008)", "Discover how integrating payroll into your strategy for SAP SuccessFactors solutions maximizes business value.", "Room TBD", 2, "Strategy talk", 570, 590),
  mkSession(152, 3, 8, "scm", 0, "Explore Southwire’s approach to building the foundation for career growth (HCM1841)", "Learn how Southwire is building the foundation for a connected career experience that helps salaried team members explore growth opportunities, understand career pathways, and take ownership of their development journey.", "Room TBD", 0, "Customer success story", 600, 620),
  mkSession(153, 3, 8, "ana", 0, "Starting smart: How Lockheed Martin got Joule adoption off the ground (HCM1915)", "Lockheed Martin accelerated adoption of the Joule solution by focusing on high-value use cases of the SAP SuccessFactors Employee Central solution that simplify everyday HR work.", "Room TBD", 0, "Customer success story", 600, 620),
  mkSession(154, 3, 8, "ana", 0, "The road ahead: Navigate the future of work with our Advanced Success Plan (HCM1748)", "Discover how the Advanced Success Plan version for SAP SuccessFactors HCM can serve as your GPS for navigating transformation.", "Room TBD", 0, "Strategy talk", 600, 620),
  mkSession(155, 3, 9, "ana", 1, "How SAP is driving better decisions with faster insights and governed data (HCM1871)", "Learn how the SAP IT team stopped building dashboards and started governing data; with the SAP Business Data Cloud solution and People Intelligence, fragmented HR reporting became a governed, AI-ready foundation.", "Room TBD", 0, "Customer success story", 630, 650),
  mkSession(156, 3, 9, "ec", 1, "Streamline position management with AI, automation, and self-service tools​ (HCM1700)", "This hands-on lab explores position management in the SAP SuccessFactors Employee Central solution. Learn to perform mass updates to position data and complete self-service transactions.", "Room TBD", 2, "Hands-on lab", 630, 705),
  mkSession(157, 3, 9, "ana", 1, "Uncover HR insights with story reports in SAP SuccessFactors solutions (HCM1702)", "Designed for reporting administrators, this hands-on lab session can help you take reporting to the next level.", "Room TBD", 2, "Hands-on lab", 630, 705),
  mkSession(158, 3, 9, "ana", 1, "Workshop: Shaping the future of workforce planning (HCM1338)", "AI is changing work at scale: organizations that redesign roles proactively execute transformation with greater speed and confidence.", "Room TBD", 0, "Workshop‎", 630, 690),
  mkSession(159, 3, 10, "ecp", 0, "Ask the payroll experts: Payroll in the age of Autonomous HCM (HCM1914)", "Hear the hosts of the PayrollBADIes podcast and Siva Sundaresan, Chief Product Officer for SAP SuccessFactors solutions, have a candid conversation about payroll trends and challenges, how AI and automation are changing the way payroll teams work, and why bringing payroll and core HR together matters.", "Room TBD", 0, "Ask the expert", 645, 690),
  mkSession(160, 3, 10, "ana", 0, "Close the AI readiness gap and accelerate your HCM AI journey (HCM1749)", "AI value starts with readiness, not just technology. Identify gaps across data, processes, governance, and change management, pinpointing where your organization needs to focus.", "Room TBD", 0, "Customer success story", 645, 690),
  mkSession(161, 3, 10, "ana", 0, "Connect everything, remove barriers: What’s new in SAP Integration Suite (XBAIP1201)", "Getting ready for AI doesn’t mean starting over. Take a tour of the latest SAP Integration Suite innovations, such as AI-enabled automation, advanced event mesh, and no- and low-code tools for connecting SAP and third-party systems.", "Room TBD", 0, "Strategy talk", 645, 690),
  mkSession(162, 3, 10, "rec", 0, "Drive growth from within: Develop, deploy, and retain top talent (HCM1364)", "Protect critical talent by turning growth opportunities into your retention advantage. Learn how agentic experiences help you build internal pipelines and invest in targeted development that keeps employees engaged.", "Room TBD", 0, "Strategy talk", 645, 690),
  mkSession(163, 3, 10, "pmgm", 0, "Extending HCM agents with Joule Studio: A performance management use case (HCM1464)", "As you look to increase employee productivity with AI, it is key to identify areas requiring customization based on your business needs. Get an overview of the SAP solutions that enable extensibility and AI for your HCM solutions.", "Room TBD", 1, "Strategy talk", 645, 690),
  mkSession(164, 3, 10, "ana", 0, "From principles to practice: Operationalizing responsible AI in HR (HCM1411)", "Take a practical look at how SAP SuccessFactors solutions help HR teams govern AI responsibly, including explainability features, bias monitoring, usage transparency, and the capabilities in the SAP AI Agent Hub solution that keep humans in control of consequential people decisions.", "Room TBD", 0, "Solution deep dive", 645, 690),
  mkSession(165, 3, 10, "ana", 0, "Goods, services, and talent: Enhance outcomes with cohesive control (SPM1620)", "Today’s procurement leaders need a unified approach to effectively manage enterprise spend.", "Room TBD", 0, "Solution deep dive", 645, 690),
  mkSession(166, 3, 10, "ana", 0, "High tech industry tour (XIND2190)", "Join us for a discrete manufacturing industry tour showcasing end-to-end innovation.", "Room TBD", 1, "Industry tour", 645, 690),
  mkSession(167, 3, 10, "onb", 0, "See how to unlock new hire success from day one with agentic onboarding (HCM1430)", "Explore how agentic AI drives the onboarding journey to connect people, processes, and data, delivering personalized experiences that boost productivity.", "Room TBD", 2, "Solution deep dive", 645, 690),
  mkSession(168, 3, 10, "time", 0, "When every shift counts: Transforming workforce scheduling in manufacturing (HCM1493)", "When production plans change, your workforce schedule should too.", "Room TBD", 2, "Solution deep dive", 645, 690),
  mkSession(169, 3, 10, "ana", 0, "Wipro: Accelerating AI’s impact across the employee lifecycle (HCM1869)", "Hear Wipro, a global technology services company, share how AI is powering an intelligent, employee-centric digital experience.", "Room TBD", 0, "Customer success story", 645, 690),
  mkSession(170, 3, 11, "ana", 0, "Jabil and the Autonomous Enterprise: Built on trusted business data (XBAIP1643)", "Everyone claims a context layer. Few can capture how a global manufacturer runs.", "Room TBD", 0, "Customer success story", 660, 680),
  mkSession(171, 3, 11, "ec", 0, "TELUS cut 90% of manual HR approvals—learn how it got there (HCM1897)", "Rolling out a new HRIS is hard. Keeping it running is harder. Discover how TELUS unified its workforce on a single HR platform, cut manual approvals by 90%, and turned go-live into a foundation built for long-term scale.", "Room TBD", 0, "Customer success story", 660, 680),
  mkSession(172, 3, 11, "ana", 1, "Unlock workforce insights across the talent lifecycle: People Intelligence (HCM1692)", "See a live demo of People Intelligence and learn how it automatically connects data from SAP SuccessFactors HCM to deliver insights across hiring, retention, skills, and compensation.", "Room TBD", 0, "Solution demo", 660, 680),
  mkSession(173, 3, 12, "ana", 0, "Connect systems across the enterprise to keep the business flowing smoothly (XBAIP1878)", "See how an SAP customer uses SAP Integration Suite to connect SAP and third-party systems across its enterprise.", "Room TBD", 0, "Customer success story", 690, 710),
  mkSession(174, 3, 12, "ecp", 0, "Delivering the impossible: Transforming payroll, time, and benefits (PAR1030)", "A people-centric approach to transforming payroll, time, and benefits at scale demands bold thinking and strong partnership.", "Room TBD", 1, "Customer success story", 690, 710),
  mkSession(175, 3, 12, "ec", 0, "Organizational modeling in action: Tips and best practices (HCM1485)", "Ready to put organizational modeling to work? See how the SAP SuccessFactors Employee Central solution helps you simulate restructures, assess impact, and plan with confidence before you commit.", "Room TBD", 0, "Quick tips", 690, 710),
  mkSession(176, 3, 13, "ana", 0, "The AI dividend: Turning business complexity into competitive advantage (X1991)", "AI is everywhere. The results often aren’t. While many organizations are still exploring the potential of AI, a new class of leaders is already capturing it—reducing costs, accelerating decisions, and unlocking growth.", "Room TBD", 1, "Ask the expert", 695, 715),
  mkSession(177, 3, 14, "ana", 0, "Autonomous Adaptive Production: How Industry AI drives measurable outcomes (XIND1817)", "Leaders are driving business value from the Industry AI portfolio.", "Room TBD", 1, "Customer success story", 705, 750),
  mkSession(178, 3, 14, "ecp", 0, "Autonomous payroll in action: Global compliance, every pay run (HCM1492)", "What if payroll could anticipate issues before they became employee concerns?", "Room TBD", 2, "Solution deep dive", 705, 750),
  mkSession(179, 3, 14, "lms", 0, "Building an adoption strategy for AI experiences in learning and talent (HCM1407)", "Uncover how organizations are creating adoption strategies that increase awareness, encourage usage, and help employees get value from learning and talent AI experiences in SAP SuccessFactors solutions.", "Room TBD", 1, "Strategy talk", 705, 750),
  mkSession(180, 3, 14, "rec", 0, "Build the blueprint to your recruiting strategy transformation (HCM1750)", "Turn your recruiting transformation into an actionable plan that accelerates time to value for your talent acquisition strategy.", "Room TBD", 0, "Roadmap", 705, 750),
  mkSession(181, 3, 14, "ana", 0, "Extending HCM solutions with SAP Business AI Platform: Deep dive (HCM1500)", "Find out how SAP Business AI Platform helps SAP SuccessFactors HCM customers extend HCM solutions.", "Room TBD", 0, "Solution deep dive", 705, 750),
  mkSession(182, 3, 14, "ana", 0, "How SAP project teams deliver faster with SAP Joule for Consultants (XJOU1400)", "Discover how IT teams can accelerate SAP projects and cloud transformations with on-demand answers and guidance grounded in exclusive, expertly curated SAP knowledge with the SAP Joule for Consultants solution.", "Room TBD", 0, "Customer success story", 705, 750),
  mkSession(183, 3, 14, "ana", 0, "Mill products and chemicals industry tour (XIND2191)", "Join the tour to see innovations and roadmap relevant metals, building materials, packaging, and chemicals.", "Room TBD", 1, "Industry tour", 705, 750),
  mkSession(184, 3, 14, "ana", 0, "Road map and vision: Unlocking the value of AI in SAP SuccessFactors HCM (HCM1418)", "Get a forward-looking view of AI across SAP SuccessFactors HCM. Preview the full road map—upcoming agent capabilities, Joule solution enhancements, and AI-powered features spanning talent, core HR, and workforce management.", "Room TBD", 1, "Roadmap", 705, 750),
  mkSession(185, 3, 14, "rec", 0, "Road map: Hire the right talent faster in the age of Autonomous HCM (HCM1426)", "Get an inside look at the product vision and road map for intelligent talent acquisition solutions. Discover how AI assistants and agents offer automation and insights to help you attract, engage, hire, and onboard top talent.", "Room TBD", 2, "Roadmap", 705, 750),
  mkSession(186, 3, 14, "ec", 0, "Road map: Leverage an enterprise AI foundation in the age of Autonomous HCM (HCM1444)", "Explore the innovations powering SAP SuccessFactors HCM. Discover the transformative power of agentic AI on SAP Business AI Platform, alongside key innovations in integration, extensibility, security, and system administration.", "Room TBD", 0, "Roadmap", 705, 750),
  mkSession(187, 3, 14, "ana", 0, "Running HR agents securely: From architecture to action (HCM1465)", "AI agents in HR now take action, approving requests and updating records, without a human in the loop. That power is exciting, but it also raises the stakes for how HR data and processes are protected.", "Room TBD", 1, "Strategy talk", 705, 750),
  mkSession(188, 3, 14, "time", 0, "Staff, track, bill: The full project lifecycle for professional services (HCM1494)", "In professional services, every unbilled hour is lost revenue.", "Room TBD", 2, "Solution deep dive", 705, 750),
  mkSession(189, 3, 16, "ana", 0, "How to use SAP Business AI Platform to extend HCM: Use case highlights (HCM1466)", "Learn how SAP Business AI Platform can address common use cases for extensibility, highlighting actual customer scenarios and what solutions were involved.", "Room TBD", 0, "Quick tips", 720, 740),
  mkSession(190, 3, 16, "ana", 0, "Joule: Enterprise-scale AI built on interoperability and trust (XJOU1696)", "Create a unified AI experience across SAP and third-party systems through open standards Agent2Agent (A2A) and model context protocol (MCP), Microsoft 365 Copilot integration, and SAP Joule action bar.", "Room TBD", 0, "Strategy talk", 720, 740),
  mkSession(191, 3, 16, "scm", 1, "Seagate's job and skill architecture by Cobrainer (PAR1017)", "A talent intelligence hub only delivers full value when using governed job and skill data.", "Room TBD", 0, "Customer success story", 720, 740),
  mkSession(192, 3, 17, "ana", 0, "Less admin, more impact: Modernizing employee document management (PAR1029)", "Employee documents touch every HR process, yet many organizations still rely on manual, disconnected systems that create risk and slow down HR.", "Room TBD", 1, "Customer success story", 750, 770),
  mkSession(193, 3, 17, "ana", 1, "Quick tips to analyze and close pay gaps with pay transparency insights (HCM1694)", "Does your organization have what it needs to meet the EU reporting requirements?", "Room TBD", 0, "Quick tips", 750, 770),
  mkSession(194, 3, 17, "ecp", 0, "Quick tips: Tools and proven practices for your HCM cloud migration (HCM1327)", "Harness key tools, assets, and services that support every stage of your HCM cloud migration journey.", "Room TBD", 0, "Quick tips", 750, 770),
  mkSession(195, 3, 18, "ecp", 0, "Best practices and insights from AMD and Cameco on HR cloud migration (HCM1329)", "Hear from customers who have navigated their move from the SAP ERP Human Capital Management solution on-premises to SAP SuccessFactors HCM.", "Room TBD", 0, "Customer success story", 780, 825),
  mkSession(196, 3, 18, "rec", 0, "Build operational resilience through compliance Iearning (HCM1352)", "Every organization has roles that can't stay vacant and compliance requirements that can't slip. Learn how AI continuously identifies compliance needs, keeps certifications current, and retains critical expertise inside the business.", "Room TBD", 0, "Solution deep dive", 780, 825),
  mkSession(197, 3, 18, "rec", 0, "Cleared for takeoff: How Ryanair scales hiring for 200,000+ applications (HCM1910)", "With 10,000 hires ahead and 200,000+ applications a year, Ryanair knew a bigger recruiting team wasn’t the answer.", "Room TBD", 0, "Customer success story", 780, 825),
  mkSession(198, 3, 18, "ana", 1, "Five ways talent leaders win with story reports (HCM1691)", "Learn five proven ways talent leaders are using story reports in SAP SuccessFactors HCM to drive better decisions.", "Room TBD", 2, "Solution deep dive", 780, 825),
  mkSession(199, 3, 18, "onb", 0, "Hands-on challenge: Put Joule and agentic AI to work across HR (HCM1701)", "Ready for a challenge? Compete with fellow HCM professionals to see which team can complete AI-powered HR scenarios first.", "Room TBD", 1, "Hands-on lab", 780, 855),
  mkSession(200, 3, 18, "ana", 0, "Inside SAP: Turning AI and transformation into enterprise value (XBAIP1665)", "Enterprise transformation only succeeds when strategy, processes, and AI move in sync.", "Room TBD", 2, "Customer success story", 780, 825),
  mkSession(201, 3, 18, "ana", 0, "Joule explained: Reshape how work gets done across your business (XJOU1398)", "Learn how Joule, SAP’s portfolio-wide AI solution, includes capabilities to help you advance toward the Autonomous Enterprise.", "Room TBD", 0, "Strategy talk", 780, 825),
  mkSession(202, 3, 18, "ecp", 0, "Lumen: Payroll modernization at scale (HCM1902)", "Payroll is the highest-stakes call in HR—every employee feels the result. Hear Lumen share what global payroll modernization demanded: navigating complex integrations, aligning teams, and protecting payroll accuracy at scale.", "Room TBD", 0, "Customer success story", 780, 800),
  mkSession(203, 3, 18, "ana", 0, "Practical tips for governing HR agents with SAP AI Agent Hub (HCM1416)", "Get actionable tips for using the SAP AI Agent Hub solution to monitor, configure, and govern AI agents in SAP SuccessFactors solutions.", "Room TBD", 0, "Quick tips", 780, 800),
  mkSession(204, 3, 18, "ana", 0, "Project-centric industries tour (XIND2194)", "Take a guided tour with SAP services industries experts to discover how AI-powered innovations can boost margins, optimize resources, and improve client satisfaction.", "Room TBD", 1, "Industry tour", 780, 825),
  mkSession(205, 3, 18, "rec", 0, "Road map: Accelerate employee growth in the age of Autonomous HCM (HCM1356)", "Look ahead to learn how SAP SuccessFactors solutions for learning and talent management are shaping the future of Autonomous HCM.", "Room TBD", 0, "Roadmap", 780, 825),
  mkSession(206, 3, 18, "time", 0, "Road map: Compliant workforce management in the age of Autonomous HCM (HCM1968)", "Get a first look at what's coming for workforce management. From AI scheduling to new agents for time and absence, explore the innovations that cut overtime, overstaffing, and payroll errors.", "Room TBD", 0, "Roadmap", 780, 825),
  mkSession(207, 3, 18, "ana", 0, "Road map: Secure, compliant HCM with SAP NS2 in regulated industries (HCM1745)", "AI is transforming HCM in regulated industries, improving workforce experiences while meeting strict security and compliance needs.", "Room TBD", 0, "Roadmap", 780, 825),
  mkSession(208, 3, 18, "ecp", 0, "Unlock payroll insights with the enhanced payroll control center (HCM1698)", "Get hands-on with managing payroll activities in the payroll control center (PCC). Build custom charts to compare payroll results across periods, drill down to employee-level details, and access pay slips directly.", "Room TBD", 0, "Hands-on lab", 540, 600),
  mkSession(209, 3, 18, "lms", 0, "Workshop: Connect talent investments to business outcomes (HCM1906)", "Learning and development investments are critical to the success of your people and organization, but are you able to effectively measure the ROI of these initiatives?", "Room TBD", 0, "Workshop‎", 780, 840),
  mkSession(210, 3, 18, "rec", 0, "Workshop: What’s next for the role of the recruiter (HCM1333)", "AI and automation have fundamentally reshaped the recruiting function—but how has this transformation impacted the role of the recruiter?", "Room TBD", 0, "Workshop‎", 780, 840),
  mkSession(211, 3, 20, "rec", 0, "Acuity Brands: Guiding employees through key moments in SAP SuccessFactors (HCM2006)", "Employees rely on SAP SuccessFactors solutions for some of their most important workplace interactions.", "Room TBD", 1, "Customer success story", 810, 830),
  mkSession(212, 3, 20, "rec", 0, "SAP runs SAP: Recruiting with SmartRecruiters solutions and agentic AI (HCM1278)", "Discover how SAP adopted SmartRecruiters solutions and is creating a next-generation recruiting ecosystem that combines talent data, workforce intelligence, and agentic AI.", "Room TBD", 1, "Customer success story", 810, 830),
  mkSession(213, 3, 21, "rec", 0, "Accelerate hiring transformation with AI (HCM1982)", "Discover how intelligent hiring solutions enable organizations to source the right candidates faster, convert qualified candidates more efficiently, and elevate every hiring experience.", "Room TBD", 0, "Solution demo", 840, 860),
  mkSession(214, 3, 21, "ec", 0, "One platform, one people strategy: How Vale transformed global HR (HCM1930)", "What does it take to unify HR globally and make it AI-ready?", "Room TBD", 0, "Customer success story", 840, 860),
  mkSession(215, 3, 22, "ana", 0, "2027 and beyond: Future of work predictions reality check (HCM1983)", "Last year’s predictions were full of provocative takes. What happened, what didn’t, and what's next?", "Room TBD", 1, "Solution demo", 870, 890),
  mkSession(216, 3, 22, "ana", 1, "Accelerate the value of HR analytics with People Intelligence (HCM1693)", "People Intelligence unlocks a connected chain: skills gaps become visible, development needs are clear, talent deployment is optimized, and pay is tied to real contribution.", "Room TBD", 0, "Quick tips", 870, 890),
  mkSession(217, 3, 22, "onb", 0, "Ask the experts: Hire and onboard faster with talent acquisition solutions (HCM1427)", "Bring your toughest hiring questions to the people who know the answers. In an open forum, product experts tackle your questions on agentic talent acquisition, AI, migration, integration, and skills-based hiring.", "Room TBD", 1, "Ask the expert", 870, 915),
  mkSession(218, 3, 22, "ana", 0, "From UI to intent: SAP’s agentic UX strategy for the Autonomous Enterprise (XPUC1754)", "As AI reshapes the enterprise, SAP's UX strategy puts human intent at the center of autonomous, agentic, and multimodal Joule solution experiences, turning complexity into clarity and technology into measurable business value.", "Room TBD", 0, "Strategy talk", 870, 915),
  mkSession(219, 3, 22, "ana", 0, "How Deloitte scaled recognition to its 200,000 professionals with SAP BDC (XBAIP1646)", "See how Deloitte and Semos Cloud built a recognition hub for more than 200,000 professionals on SAP Business AI Platform.", "Room TBD", 0, "Customer success story", 870, 915),
  mkSession(220, 3, 22, "ana", 0, "How SAP's AI evidence engine turns everyday work into meaningful insights (HCM1412)", "SAP's AI evidence engine reads work signals like Microsoft Teams messages, emails, and calendars to help build a living, synthesized narrative using agents like the Performance Intelligence Agent and Skills Evidence Agent.", "Room TBD", 0, "Solution deep dive", 870, 915),
  mkSession(221, 3, 22, "ana", 0, "Navigating the era of AI-native enterprise architecture with SAP LeanIX (XBAIP1667)", "Explore the capabilities we’re building to help you plan, design, and manage AI-enabled change in your organization.", "Room TBD", 0, "Strategy talk", 870, 890),
  mkSession(222, 3, 22, "rec", 0, "Road map: Develop your people in the age of Autonomous HCM (HCM1358)", "Look ahead to learn how proactive AI experiences are shaping the future of skills, learning, and talent development.", "Room TBD", 0, "Roadmap", 870, 915),
  mkSession(223, 3, 22, "ana", 0, "Streamline HCM processes with  workflows and automation using SAP Build (HCM1463)", "Look in depth at process automation with the SAP Build solution. Learn how to create automation and workflows with the low-code/no-code tool to streamline complex processes, based on real-world customer examples and use cases.", "Room TBD", 0, "Solution deep dive", 870, 915),
  mkSession(224, 3, 22, "ana", 0, "The human side of AI: Elevating HR's impact in the Autonomous Enterprise (HCM1395)", "As AI adoption accelerates, HR is uniquely positioned to connect technology investments with workforce and business outcomes.", "Room TBD", 1, "Strategy talk", 870, 890),
  mkSession(225, 3, 22, "ec", 0, "What it really takes: HR transformation at QuikTrip and Fujitsu (HCM1901)", "HR transformation doesn't end at go-live—it begins there. Hear QuikTrip and Fujitsu share what it really took: two industries, two scales, and years of real-world implementation decisions.", "Room TBD", 0, "Customer success story", 870, 915),
  mkSession(226, 'tbd', null, "lms", 0, "Accelerate talent and learning impact (HCM2038)", "Experience how agentic AI across the talent lifecycle can help your organization align workforce plans to business needs.", "Room TBD", 0, "Demo station", null, null),
  mkSession(227, 'tbd', null, "ana", 0, "Activate Joule Assistants and Joule Agents for HCM (HCM2033)", "Learn how to activate Joule Assistants and Joule Agents in SAP SuccessFactors HCM. Get a step-by-step walk-through of tools, tips, and enablement best practices.", "Room TBD", 0, "Demo station", null, null),
  mkSession(228, 'tbd', null, "ana", 0, "Agent Lab (XBAIP2175)", "Step into the world of AI agents and see what’s possible when AI can understand business context, reason across data and processes, and take action.", "Room TBD", 1, "Demo station", null, null),
  mkSession(229, 'tbd', null, "ana", 1, "Agent-led toolchain: Transform to become an autonomous enterprise. (X2261)", "Reduce your transformation debt and risks by accelerating outcomes and turning operational insights into actions.", "Room TBD", 1, "Demo station", null, null),
  mkSession(230, 'tbd', null, "ana", 0, "Boost your HR system administration with AI agents (HCM2040)", "Discover the power of AI in system administration for SAP SuccessFactors HCM. Explore how AI agents now automate configuration transports and streamline role-based permissions management.", "Room TBD", 1, "Demo station", null, null),
  mkSession(231, 'tbd', null, "ana", 0, "Build: Create connected agents, apps, and workflows. (XBAIP2159)", "Discover how the build capabilities of SAP Business AI Platform provide the tools to develop AI-enabled applications, agents, and workflows to extend applications and quickly meet business needs.", "Room TBD", 1, "Demo station", null, null),
  mkSession(232, 'tbd', null, "ana", 0, "Build inclusive workplaces with AI and SAP solutions (X2115)", "Most organizations have diversity data. Few can act on it.", "Room TBD", 1, "Demo station", null, null),
  mkSession(233, 'tbd', null, "ana", 0, "Connect, extend, and automate HR processes faster (HCM1467)", "Need to integrate external service providers, legacy systems, or complex business rules into your HR workflows? See how SAP Business AI Platform helps you connect, extend, and automate HR processes faster.", "Room TBD", 1, "Demo station", null, null),
  mkSession(234, 'tbd', null, "ec", 0, "Connect HR and finance to drive business growth (HCM2037)", "The best results happen when HR and finance move as one. See how you can drive business growth by connecting HR and finance to create a more unified approach to workforce and business planning.", "Room TBD", 0, "Demo station", null, null),
  mkSession(235, 'tbd', null, "ana", 0, "Contextualize & Reason: Build your data foundation for agentic AI. (XBAIP2160)", "Enable AI to understand your business, not just your data.", "Room TBD", 1, "Demo station", null, null),
  mkSession(236, 'tbd', null, "ana", 0, "Discover the Industry AI portfolio (XIND2224)", "Visit the industry AI demo station and see how SAP’s autonomous, industry-native agents are transforming end-to-end processes—from asset management and adaptive production to unified commerce in co-innovation with our selected customers.", "Room TBD", 1, "Demo station", null, null),
  mkSession(237, 'tbd', null, "ana", 0, "Drive better business value with Industry AI (XIND2158)", "Discover how the Industry AI portfolio brings industry-specific intelligence, business context, and AI-enabled capabilities into the processes that matter most.", "Room TBD", 1, "Demo station", null, null),
  mkSession(238, 'tbd', null, "ana", 1, "Drive growth with workforce analytics and planning (HCM2039)", "Experience how contextual, readily available insights can help your HR team and leaders make more impactful people decisions.", "Room TBD", 1, "Demo station", null, null),
  mkSession(239, 'tbd', null, "rec", 0, "Experience agentic screening with Winston Interview (HCM2034)", "Step into the candidate experience and meet Winston, your AI interviewer.", "Room TBD", 0, "Demo station", null, null),
  mkSession(240, 'tbd', null, "ecp", 0, "Experience how SAP is building the Autonomous Enterprise (XSRS2013)", "Discover how SAP uses SAP Business AI Platform, the SAP Business Data Cloud solution, SAP Business AI, the Joule solution, and SAP SuccessFactors solutions to transform business processes and drive innovation.", "Room TBD", 1, "Demo station", null, null),
  mkSession(241, 'tbd', null, "ana", 0, "Experience SAP's AI-powered mobile apps and Joule Work mobile. (XPUC1811)", "Get to know SAP´s latest AI infused mobile apps, including Joule Work mobile, see demos of the apps, and try them out.", "Room TBD", 1, "Demo station", null, null),
  mkSession(242, 'tbd', null, "ana", 0, "Explore SAP’s AI-native agentic user experience (XPUC1814)", "Look at where user experience for the Autonomous Enterprise is headed, and how SAP is leading the way, with the AI-native Joule Work engagement layer experiences complementing existing application experiences", "Room TBD", 1, "Demo station", null, null),
  mkSession(243, 'tbd', null, "ana", 0, "Explore solutions for your industry (XIND2157)", "Learn how SAP helps your industry run better—from industry-specific solutions to capabilities across lines of business and beyond.", "Room TBD", 1, "Demo station", null, null),
  mkSession(244, 'tbd', null, "ana", 0, "From Competition to Collaboration (X2236)", "Experience what it takes to move from competition to collaboration through the lens of a multi-purpose arena at the SAP Connect Experience Center.", "Room TBD", 1, "Demo station", null, null),
  mkSession(245, 'tbd', null, "ana", 0, "Get hands-on with our Future of Work Research Lab (HCM2041)", "How are you feeling about the future of work? The doctor is in! Meet the Future of Work Research Lab team of scientists for a hands-on opportunity to explore AI’s impact on workers, teams, and organizations.", "Room TBD", 0, "Demo station", null, null),
  mkSession(246, 'tbd', null, "ana", 0, "Govern: Drive AI at scale with built-in governance. (XBAIP2161)", "AI at scale starts with AI you can trust.", "Room TBD", 1, "Demo station", null, null),
  mkSession(247, 'tbd', null, "onb", 0, "Hire and onboard the right talent faster (HCM2042)", "See how agentic talent acquisition helps you intelligently source, screen, hire, and onboard top talent with ease.", "Room TBD", 0, "Demo station", null, null),
  mkSession(248, 'tbd', null, "ana", 0, "Introducing the Joule solution (XJOU2294)", "Learn how SAP is advancing toward the Autonomous Enterprise—a vision where AI doesn’t just assist people, it executes on their behalf. Joule is central to how SAP makes this vision a reality.", "Room TBD", 0, "Demo station", null, null),
  mkSession(249, 'tbd', null, "ana", 0, "It's the beginning of stronger teams and better outcomes. (HCM2049)", "See how SAP Services and Support helps organizations use intelligent technologies within human capital management to optimize operations, accelerate adoption, enhance employee experiences, and gain predictive insights for workforce planning and talent management.", "Room TBD", 1, "Demo station", null, null),
  mkSession(250, 'tbd', null, "ecp", 0, "Pay your global workforce accurately, every time (HCM2036)", "Discover how a connected, agentic payroll and workforce management experience helps your global workforce get paid accurately and on time.", "Room TBD", 0, "Demo station", null, null),
  mkSession(251, 'tbd', null, "ana", 0, "Rate your favorite SAP products: Write a review (X2152)", "Your opinion matters. SAP partners with TrustRadius, an online review site, to capture our customers’ voices. You can share your in-depth insights and feedback through a 10-minute survey.", "Room TBD", 1, "Demo station", null, null),
  mkSession(252, 'tbd', null, "ec", 2, "Retain top talent with strategic total rewards (HCM2043)", "See how you can build, manage, and continuously optimize compensation and benefits programs grounded in transparency, consistency, and data-driven decisions.", "Room TBD", 0, "Demo station", null, null),
  mkSession(253, 'tbd', null, "ana", 0, "SAP Joule for Consultants solution (XJOU2292)", "SAP Joule for Consultants is a conversational AI solution that accelerates SAP projects with expert guidance from SAP's most exclusive and up-to-date knowledge base.", "Room TBD", 0, "Demo station", null, null),
  mkSession(254, 'tbd', null, "ana", 0, "Shape the future of SAP UX. (XPUC2155)", "Explore research-powered innovation shaping today’s UX and tomorrow’s possibilities—and learn how you can help define the future of intelligent UX.", "Room TBD", 1, "Demo station", null, null),
  mkSession(255, 'tbd', null, "ec", 0, "Simplify HR operations and HR service delivery (HCM2035)", "See how you can manage your entire workforce and the employee lifecycle with accurate, compliant, and consistent data.", "Room TBD", 0, "Demo station", null, null),
  mkSession(256, 'tbd', null, "lms", 1, "Take the WalkMe Challenge (XBAIP2154)", "Discover how WalkMe solutions help people adopt SAP solutions—from SAP S/4HANA Cloud to the Joule solution—in the flow of work.", "Room TBD", 1, "Demo station", null, null),
  mkSession(257, 'tbd', null, "ana", 0, "The BTM Value Challenge (XBAIP2153)", "Play this three-to-four minute timebox-intensive game to experience AI-enabled capabilities in SAP Signavio solutions.", "Room TBD", 1, "Demo station", null, null),
  mkSession(258, 'tbd', null, "lms", 0, "Upskill smarter with AI-assisted learning. (X2151)", "Discover interactive learning that helps you build real-world experiences with SAP solutions. Explore the Autonomous Enterprise through hands-on scenarios with AI-enabled role plays and a study companion.", "Room TBD", 1, "Demo station", null, null),
  mkSession(259, 'tbd', null, "pmgm", 0, "WalkMe solutions: the people part of AI. Turn investment into performance. (X2382)", "Turn AI adoption into performance every step of the way to the Autonomous Enterprise.", "Room TBD", 1, "Demo station", null, null),
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

function buildSchedule(rankedModules, selectedSubs) {
  const chosen = new Set();
  DAYS.forEach((day) => {
    const candidates = SESSIONS
      .filter((s) => s.day === day && s.startMin != null)
      .map((s) => ({ session: s, ...scoreSession(s, rankedModules, selectedSubs) }))
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score || a.session.startMin - b.session.startMin);

    const dayChosen = [];
    candidates.forEach(({ session }) => {
      const overlapsChosen = dayChosen.some((c) => sessionsOverlap(session, c));
      if (!overlapsChosen) {
        dayChosen.push(session);
        chosen.add(session.id);
      }
    });
  });
  return chosen;
}

// ---------- UI atoms ----------
const STAGES = ["Landscape", "Interests", "Schedule", "Preview"];

function StepDots({ stage }) {
  const idx = { landscape: 0, interests: 1, schedule: 2, preview: 3 }[stage];
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {STAGES.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div className="flex items-center gap-1.5" style={{ opacity: i <= idx ? 1 : 0.4 }}>
            <div style={{ width: 6, height: 6, borderRadius: 999, background: i === idx ? C.amber : C.ink }} />
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: "0.05em", color: C.ink }}>
              {s.toUpperCase()}
            </span>
          </div>
          {i < STAGES.length - 1 && <div style={{ width: 16, height: 1, background: C.line }} />}
        </div>
      ))}
    </div>
  );
}

function Chip({ active, onClick, children, color }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 12px", borderRadius: 999, fontSize: 13, fontFamily: "'Inter', sans-serif",
        fontWeight: 500, border: `1px solid ${active ? (color || C.ink) : C.line}`,
        background: active ? (color || C.ink) : "transparent", color: active ? "#fff" : C.inkSoft, cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

const inputStyle = {
  padding: "11px 14px", borderRadius: 8, border: `1px solid ${C.line}`, fontFamily: "'Inter', sans-serif",
  fontSize: 14, color: C.ink, background: C.paperRaised, outline: "none", width: "100%",
};

const primaryButtonStyle = {
  padding: "13px 22px", borderRadius: 8, background: C.ink, color: "#fff", border: "none",
  fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer",
};

const secondaryButtonStyle = { ...primaryButtonStyle, background: "transparent", color: C.ink, border: `1px solid ${C.line}` };

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: "0.04em", color: C.inkSoft, marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

// ---------- Stage 1: Landscape ----------
function LandscapeStage({ data, setData, onNext }) {
  const set = (k) => (e) => setData((d) => ({ ...d, [k]: e.target.value }));
  const toggleCurrent = (id) =>
    setData((d) => {
      const next = new Set(d.currentModules);
      next.has(id) ? next.delete(id) : next.add(id);
      return { ...d, currentModules: next };
    });

  const togglePlanned = (id) =>
    setData((d) => {
      const next = new Set(d.plannedModules);
      next.has(id) ? next.delete(id) : next.add(id);
      return { ...d, plannedModules: next };
    });

  const canProceed = data.name.trim() && data.company.trim();

  return (
    <div className="max-w-xl mx-auto px-6" style={{ paddingTop: 56, paddingBottom: 48 }}>
      <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, letterSpacing: "0.08em", color: C.amberDeep, marginBottom: 10 }}>
        SUCCESSCONNECT · PERSONAL AGENDA BUILDER
      </p>
      <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 30, fontWeight: 600, color: C.ink, lineHeight: 1.15, marginBottom: 12 }}>
        Let's start with where you stand today.
      </h1>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14.5, color: C.inkSoft, lineHeight: 1.6, marginBottom: 28 }}>
        A quick picture of your landscape helps us point you at the right sessions, and skip the ones that
        won't apply.
      </p>

      <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
        <button
          onClick={() => setData((d) => ({ ...d, mode: "self" }))}
          style={{ flex: 1, padding: "12px 14px", borderRadius: 10, textAlign: "left", cursor: "pointer",
            border: `1.5px solid ${data.mode === "self" ? C.ink : C.line}`, background: data.mode === "self" ? C.paperRaised : "transparent" }}
        >
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 13.5, color: C.ink }}>I'm attending</div>
        </button>
        <button
          onClick={() => setData((d) => ({ ...d, mode: "client" }))}
          style={{ flex: 1, padding: "12px 14px", borderRadius: 10, textAlign: "left", cursor: "pointer",
            border: `1.5px solid ${data.mode === "client" ? C.ink : C.line}`, background: data.mode === "client" ? C.paperRaised : "transparent" }}
        >
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 13.5, color: C.ink }}>Building for a client</div>
        </button>
      </div>

      <Field label={data.mode === "client" ? "CLIENT NAME" : "YOUR NAME"}>
        <input style={inputStyle} value={data.name} onChange={set("name")} placeholder="Jane Doe" />
      </Field>
      <Field label="COMPANY">
        <input style={inputStyle} value={data.company} onChange={set("company")} placeholder="Acme Corp" />
      </Field>
      <Field label="ROLE (OPTIONAL)">
        <input style={inputStyle} value={data.role} onChange={set("role")} placeholder="VP of HR Operations" />
      </Field>
      {data.mode === "client" && (
        <Field label="BUILT BY (YOUR NAME)">
          <input style={inputStyle} value={data.builderName} onChange={set("builderName")} placeholder="Your name" />
        </Field>
      )}

      <Field label="WHICH MODULES ARE LIVE IN YOUR LANDSCAPE TODAY?">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {MODULES.map((m) => (
            <Chip key={m.id} active={data.currentModules.has(m.id)} onClick={() => toggleCurrent(m.id)}>
              {m.short}
            </Chip>
          ))}
        </div>
      </Field>

      <Field label="WHAT'S DRIVING THIS VISIT? (OPTIONAL)">
        <textarea
          style={{ ...inputStyle, minHeight: 74, resize: "vertical", fontFamily: "'Inter', sans-serif" }}
          value={data.context}
          onChange={set("context")}
          placeholder="e.g. evaluating a payroll BPaaS move, exploring succession planning, renewing AMS support..."
        />
      </Field>

      <Field label="ANY PLANS ON THE HORIZON? (OPTIONAL)">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
          {MODULES.map((m) => (
            <Chip key={m.id} active={data.plannedModules.has(m.id)} onClick={() => togglePlanned(m.id)}>
              {m.short}
            </Chip>
          ))}
        </div>
        <textarea
          style={{ ...inputStyle, minHeight: 60, resize: "vertical", fontFamily: "'Inter', sans-serif" }}
          value={data.plans}
          onChange={set("plans")}
          placeholder="e.g. implementing Employee Central Payroll in Q2 2027, evaluating a move off a legacy payroll system..."
        />
      </Field>

      <div style={{ padding: "16px 16px", borderRadius: 10, border: `1px solid ${C.line}`, background: C.paperRaised, marginBottom: 22 }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14, color: C.ink, marginBottom: 4 }}>
          Want time with Veritas Prime while you're there?
        </div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: C.inkSoft, marginBottom: 12 }}>
          We can set up a short meeting alongside the sessions.
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: data.meetingRequested ? 12 : 0 }}>
          <Chip active={data.meetingRequested} onClick={() => setData((d) => ({ ...d, meetingRequested: true }))}>Yes, set one up</Chip>
          <Chip active={!data.meetingRequested} onClick={() => setData((d) => ({ ...d, meetingRequested: false, meetingTopic: "" }))}>Not this time</Chip>
        </div>
        {data.meetingRequested && (
          <textarea
            style={{ ...inputStyle, minHeight: 60, resize: "vertical", fontFamily: "'Inter', sans-serif" }}
            value={data.meetingTopic}
            onChange={set("meetingTopic")}
            placeholder="What would you like to discuss?"
          />
        )}
      </div>

      <button onClick={onNext} disabled={!canProceed} style={{ ...primaryButtonStyle, opacity: canProceed ? 1 : 0.4, marginTop: 8 }}>
        Choose interests &nbsp;→
      </button>
    </div>
  );
}

// ---------- Stage 2: Interests + ranking ----------
function InterestsStage({ selectedModules, toggleModule, selectedSubs, toggleSub, expanded, toggleExpand, rankedModules, moveRank, onBack, onNext }) {
  return (
    <div className="max-w-2xl mx-auto px-6" style={{ paddingTop: 40, paddingBottom: 56 }}>
      <StepDots stage="interests" />
      <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 600, color: C.ink, marginTop: 22, marginBottom: 6 }}>
        What are they here to solve?
      </h2>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: C.inkSoft, marginBottom: 26 }}>
        Select modules of interest, then rank them below. Expand any module to get more specific.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {MODULES.map((m) => {
          const active = selectedModules.has(m.id);
          const isOpen = expanded === m.id;
          return (
            <div key={m.id} style={{ border: `1px solid ${active ? modColor(m.id) : C.line}`, borderRadius: 10, background: active ? C.paperRaised : "transparent", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", padding: "12px 14px", gap: 12 }}>
                <button
                  onClick={() => toggleModule(m.id)}
                  style={{ width: 20, height: 20, borderRadius: 5, flexShrink: 0, cursor: "pointer",
                    border: `1.5px solid ${active ? modColor(m.id) : C.lineDark}`, background: active ? modColor(m.id) : "transparent" }}
                />
                <div style={{ flex: 1, cursor: "pointer" }} onClick={() => toggleModule(m.id)}>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14.5, color: C.ink }}>{m.name}</span>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: C.inkSoft, marginLeft: 8 }}>{m.short}</span>
                </div>
                <button onClick={() => toggleExpand(m.id)} style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: C.inkSoft, background: "none", border: "none", cursor: "pointer" }}>
                  {isOpen ? "Hide detail" : "Refine"}
                </button>
              </div>
              {isOpen && (
                <div style={{ padding: "0 14px 14px 46px", display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {m.subs.map((s) => {
                    const key = `${m.id}:${s}`;
                    return (
                      <Chip key={key} active={selectedSubs.has(key)} onClick={() => toggleSub(key)} color={modColor(m.id)}>
                        {s}
                      </Chip>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {rankedModules.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: "0.06em", color: C.inkSoft, marginBottom: 10 }}>
            RANK BY PRIORITY — TOP GETS THE STRONGEST WEIGHT
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {rankedModules.map((id, i) => (
              <div key={id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, background: C.paperRaised, border: `1px solid ${C.line}` }}>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: C.amberDeep, fontWeight: 600, width: 18 }}>{i + 1}</span>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: modColor(id), flexShrink: 0 }} />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: C.ink, flex: 1 }}>{modName(id)}</span>
                <button onClick={() => moveRank(id, -1)} disabled={i === 0} style={{ ...rankBtnStyle, opacity: i === 0 ? 0.3 : 1 }}>↑</button>
                <button onClick={() => moveRank(id, 1)} disabled={i === rankedModules.length - 1} style={{ ...rankBtnStyle, opacity: i === rankedModules.length - 1 ? 0.3 : 1 }}>↓</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32 }}>
        <button onClick={onBack} style={secondaryButtonStyle}>← Back</button>
        <button onClick={onNext} disabled={selectedModules.size === 0} style={{ ...primaryButtonStyle, opacity: selectedModules.size === 0 ? 0.4 : 1, background: C.amberDeep }}>
          Build schedule ({selectedModules.size} selected) &nbsp;→
        </button>
      </div>
    </div>
  );
}

const rankBtnStyle = {
  width: 26, height: 26, borderRadius: 6, border: `1px solid ${C.line}`, background: "#fff",
  cursor: "pointer", fontSize: 12, color: C.ink,
};

// ---------- Session card ----------
function SessionCard({ session, inSchedule, onToggle, matches, conflicts }) {
  const color = modColor(session.module);
  const hasConflict = conflicts && conflicts.length > 0;
  const borderColor = hasConflict ? "#C0392B" : inSchedule ? color : C.line;
  return (
    <div style={{ display: "flex", flexDirection: "column", border: `1px solid ${borderColor}`, borderRadius: 10, background: C.paperRaised, overflow: "hidden" }}>
      <div style={{ display: "flex" }}>
        <div style={{ flex: 1, padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, letterSpacing: "0.04em", padding: "2px 7px", borderRadius: 4, color: "#fff", background: color }}>
              {modShort(session.module)}
            </span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: C.inkSoft }}>{session.level}</span>
            {matches.length > 0 && (
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.amberDeep, fontWeight: 600 }}>★ matches your interest</span>
            )}
          </div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15, color: C.ink, marginBottom: 4 }}>{session.title}</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: C.inkSoft, marginBottom: 6, lineHeight: 1.5 }}>{session.blurb}</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: C.inkSoft }}>{session.speaker}</div>
        </div>
        <div style={{ width: 132, flexShrink: 0, padding: "14px 12px", display: "flex", flexDirection: "column", justifyContent: "space-between", borderLeft: `1px dashed ${C.lineDark}` }}>
          <div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, fontWeight: 500, color: C.ink, lineHeight: 1.4 }}>{session.time}</div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: C.inkSoft, marginTop: 4 }}>{session.room}</div>
          </div>
          <button
            onClick={onToggle}
            style={{ marginTop: 10, padding: "6px 0", borderRadius: 6, fontSize: 11.5, fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600, cursor: "pointer", border: `1px solid ${inSchedule ? color : C.lineDark}`,
              background: inSchedule ? color : "transparent", color: inSchedule ? "#fff" : C.inkSoft }}
          >
            {inSchedule ? "Added ✓" : "Add"}
          </button>
        </div>
      </div>
      {hasConflict && (
        <div style={{ padding: "8px 16px", background: "#FBEAE8", borderTop: "1px solid #C0392B" }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: "#C0392B", fontWeight: 600 }}>
            ⚠ {inSchedule ? "Overlaps" : "Would overlap"} with:{" "}
            {conflicts.slice(0, 2).map((c) => c.title).join(", ")}
            {conflicts.length > 2 ? ` +${conflicts.length - 2} more` : ""}
          </span>
        </div>
      )}
    </div>
  );
}

// ---------- Stage 3: Schedule (Recommended + Browse) ----------
function ScheduleStage({ rankedModules, selectedSubs, schedule, setSchedule, day, setDay, tab, setTab, browseFilter, setBrowseFilter, onBack, onNext, attendeeLabel }) {
  const daySessions = useMemo(() => SESSIONS.filter((s) => s.day === day).sort((a, b) => a.slotIdx - b.slotIdx), [day]);

  const bySlot = useMemo(() => {
    const map = {};
    daySessions.forEach((s) => {
      map[s.slotIdx] = map[s.slotIdx] || [];
      map[s.slotIdx].push(s);
    });
    return map;
  }, [daySessions]);

  const toggleInSchedule = (id) =>
    setSchedule((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const totalSelected = schedule.size;

  const dayConflictCount = useMemo(() => {
    const conflicted = new Set();
    SESSIONS.filter((s) => s.day === day && schedule.has(s.id)).forEach((s) => {
      if (conflictingSessions(s, schedule).length > 0) conflicted.add(s.id);
    });
    return conflicted.size;
  }, [day, schedule]);

  return (
    <div className="max-w-3xl mx-auto px-6" style={{ paddingTop: 40, paddingBottom: 64 }}>
      <StepDots stage="schedule" />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 22, marginBottom: 4 }}>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 600, color: C.ink }}>
          {attendeeLabel}'s schedule
        </h2>
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {dayConflictCount > 0 && (
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#C0392B", fontWeight: 600 }}>
              ⚠ {dayConflictCount} overlap{dayConflictCount === 1 ? "" : "s"} today
            </span>
          )}
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: C.inkSoft }}>
            {totalSelected} session{totalSelected === 1 ? "" : "s"} booked
          </span>
        </span>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 18, marginTop: 18 }}>
        <button onClick={() => setTab("recommended")} style={tabStyle(tab === "recommended")}>Recommended for you</button>
        <button onClick={() => setTab("browse")} style={tabStyle(tab === "browse")}>Browse all sessions</button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {DAYS.map((d) => (
          <Chip key={d} active={day === d} onClick={() => setDay(d)}>{DAY_LABELS[d]}</Chip>
        ))}
        {tab === "browse" && (
          <>
            <div style={{ width: 1, background: C.line, margin: "0 4px" }} />
            <Chip active={browseFilter === "all"} onClick={() => setBrowseFilter("all")}>All modules</Chip>
            {MODULES.map((m) => (
              <Chip key={m.id} active={browseFilter === m.id} onClick={() => setBrowseFilter(m.id)} color={modColor(m.id)}>
                {m.short}
              </Chip>
            ))}
          </>
        )}
      </div>

      {tab === "recommended" ? (
        Object.keys(bySlot).sort((a, b) => a - b).map((slotIdx) => {
          const options = bySlot[slotIdx];
          const relevant = options.filter((s) => scoreSession(s, rankedModules, selectedSubs).score > 0);
          const selectedCount = options.filter((s) => schedule.has(s.id)).length;
          if (relevant.length === 0) return null;
          return (
            <div key={slotIdx} style={{ marginBottom: 22 }}>
              <SlotHeader slotIdx={slotIdx} selectedCount={selectedCount} />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {relevant.map((s) => {
                  const { matches } = scoreSession(s, rankedModules, selectedSubs);
                  return (
                    <SessionCard
                      key={s.id} session={s} matches={matches} inSchedule={schedule.has(s.id)}
                      conflicts={conflictingSessions(s, schedule)} onToggle={() => toggleInSchedule(s.id)}
                    />
                  );
                })}
              </div>
            </div>
          );
        })
      ) : (
        Object.keys(bySlot).sort((a, b) => a - b).map((slotIdx) => {
          const options = bySlot[slotIdx].filter((s) => browseFilter === "all" || s.module === browseFilter);
          const selectedCount = bySlot[slotIdx].filter((s) => schedule.has(s.id)).length;
          if (options.length === 0) return null;
          return (
            <div key={slotIdx} style={{ marginBottom: 22 }}>
              <SlotHeader slotIdx={slotIdx} selectedCount={selectedCount} />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {options.map((s) => {
                  const { matches } = scoreSession(s, rankedModules, selectedSubs);
                  return (
                    <SessionCard
                      key={s.id} session={s} matches={matches} inSchedule={schedule.has(s.id)}
                      conflicts={conflictingSessions(s, schedule)} onToggle={() => toggleInSchedule(s.id)}
                    />
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        <button onClick={onBack} style={secondaryButtonStyle}>← Refine interests</button>
        <button onClick={onNext} disabled={totalSelected === 0} style={{ ...primaryButtonStyle, opacity: totalSelected === 0 ? 0.4 : 1 }}>
          Preview agenda &nbsp;→
        </button>
      </div>
    </div>
  );
}

function tabStyle(active) {
  return {
    padding: "9px 16px", borderRadius: 8, border: `1px solid ${active ? C.ink : C.line}`,
    background: active ? C.ink : "transparent", color: active ? "#fff" : C.inkSoft,
    fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer",
  };
}

function SlotHeader({ slotIdx, selectedCount }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: "0.06em", color: C.lineDark }}>
        {slotIdx === "null" || slotIdx === null
          ? "TIMES TO BE ANNOUNCED"
          : `SLOT ${String(Number(slotIdx) + 1).padStart(2, "0")} — ${SLOTS[slotIdx]}`}
      </div>
      {selectedCount > 1 && (
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.amberDeep, fontWeight: 600 }}>
          {selectedCount} people booked into this slot
        </span>
      )}
    </div>
  );
}

// ---------- Stage 4: Preview ----------
function PreviewStage({ landscape, rankedModules, schedule, setSchedule, onBack, onEditSchedule }) {
  const [finalized, setFinalized] = useState(false);
  const bookedSessions = useMemo(
    () =>
      SESSIONS.filter((s) => schedule.has(s.id)).sort(
        (a, b) => a.day - b.day || (a.startMin ?? Infinity) - (b.startMin ?? Infinity)
      ),
    [schedule]
  );
  const byDay = useMemo(() => {
    const map = {};
    bookedSessions.forEach((s) => {
      map[s.day] = map[s.day] || [];
      map[s.day].push(s);
    });
    return map;
  }, [bookedSessions]);

  const totalConflictCount = useMemo(
    () => bookedSessions.filter((s) => conflictingSessions(s, schedule).length > 0).length,
    [bookedSessions, schedule]
  );

  const removeSession = (id) => setSchedule((prev) => { const next = new Set(prev); next.delete(id); return next; });

  const csvRows = () => {
    const header = [
      "Name", "Company", "Role", "Day", "Time", "Room", "Module", "Session Title", "Level",
      "Conflicts With", "Planned Modules", "Plans Notes", "Meeting Requested", "Meeting Topic",
    ];
    const plannedStr = [...landscape.plannedModules].map(modName).join("; ");
    const rows = bookedSessions.map((s) => {
      const conflictTitles = conflictingSessions(s, schedule).map((c) => c.title).join("; ");
      return [
        landscape.name, landscape.company, landscape.role, DAY_LABELS[s.day], s.time, s.room, modName(s.module), s.title, s.level,
        conflictTitles, plannedStr, landscape.plans, landscape.meetingRequested ? "Yes" : "No", landscape.meetingTopic,
      ];
    });
    return [header, ...rows].map((r) => r.map((v) => `"${(v || "").toString().replace(/"/g, '""')}"`).join(",")).join("\n");
  };

  return (
    <div className="max-w-2xl mx-auto px-6" style={{ paddingTop: 40, paddingBottom: 64 }}>
      <StepDots stage="preview" />

      <div style={{ marginTop: 22, marginBottom: 24, padding: "18px 20px", borderRadius: 12, background: C.ink, color: "#fff" }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: "0.06em", opacity: 0.7, marginBottom: 6 }}>
          SUCCESSCONNECT AGENDA — REVIEW COPY
        </div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 600 }}>{landscape.name}</div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, opacity: 0.85 }}>
          {landscape.company}{landscape.role ? ` · ${landscape.role}` : ""}
        </div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, opacity: 0.7, marginTop: 8 }}>
          Top priorities: {rankedModules.slice(0, 3).map(modName).join(", ")}
        </div>
        {landscape.plannedModules.size > 0 && (
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, opacity: 0.7, marginTop: 4 }}>
            On the roadmap: {[...landscape.plannedModules].map(modName).join(", ")}
          </div>
        )}
        {landscape.meetingRequested && (
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, opacity: 0.7, marginTop: 4 }}>
            Requested a Veritas Prime meeting{landscape.meetingTopic ? ` — ${landscape.meetingTopic}` : ""}
          </div>
        )}
      </div>

      {bookedSessions.length === 0 && (
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: C.inkSoft }}>Nothing booked yet, go back and add a few sessions.</p>
      )}

      {totalConflictCount > 0 && (
        <div style={{ marginBottom: 20, padding: "12px 16px", borderRadius: 10, border: "1.5px solid #C0392B", background: "#FBEAE8" }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#C0392B", fontWeight: 600 }}>
            ⚠ {totalConflictCount} session{totalConflictCount === 1 ? "" : "s"} on this agenda overlap{totalConflictCount === 1 ? "s" : ""} in time — flagged below.
          </span>
        </div>
      )}

      {DAYS.filter((d) => byDay[d]).map((d) => (
        <div key={d} style={{ marginBottom: 26 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 16, color: C.ink, marginBottom: 10 }}>{DAY_LABELS[d]}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {byDay[d].map((s, i) => {
              const conflicts = conflictingSessions(s, schedule);
              const hasConflict = conflicts.length > 0;
              return (
                <div key={s.id} style={{ padding: "12px 0", borderTop: i === 0 ? "none" : `1px solid ${C.line}` }}>
                  <div style={{ display: "flex", gap: 14 }}>
                    <div style={{ width: 128, flexShrink: 0, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: C.inkSoft, paddingTop: 2, lineHeight: 1.4 }}>{s.time}</div>
                    <div style={{ width: 3, borderRadius: 2, background: hasConflict ? "#C0392B" : modColor(s.module), flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, padding: "1px 6px", borderRadius: 4, color: "#fff", background: modColor(s.module) }}>
                          {modShort(s.module)}
                        </span>
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: C.inkSoft }}>{s.room}</span>
                      </div>
                      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14.5, color: C.ink }}>{s.title}</div>
                      {hasConflict && (
                        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: "#C0392B", fontWeight: 600, marginTop: 4 }}>
                          ⚠ Overlaps: {conflicts.slice(0, 2).map((c) => c.title).join(", ")}
                          {conflicts.length > 2 ? ` +${conflicts.length - 2} more` : ""}
                        </div>
                      )}
                    </div>
                    <button onClick={() => removeSession(s.id)} style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: C.inkSoft, background: "none", border: "none", cursor: "pointer", alignSelf: "start" }}>
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, marginBottom: 8 }}>
        <button onClick={onBack} style={secondaryButtonStyle}>← Back to interests</button>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onEditSchedule} style={secondaryButtonStyle}>Edit sessions</button>
          <button onClick={() => setFinalized(true)} disabled={bookedSessions.length === 0} style={{ ...primaryButtonStyle, opacity: bookedSessions.length === 0 ? 0.4 : 1, background: C.amberDeep }}>
            Finalize agenda
          </button>
        </div>
      </div>

      {finalized && (
        <div style={{ marginTop: 24, padding: 18, borderRadius: 12, border: `1px solid ${C.line}`, background: C.paperRaised }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14.5, color: C.ink, marginBottom: 6 }}>Ready to export</div>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: C.inkSoft, lineHeight: 1.5, marginBottom: 12 }}>
            One row per booked session, name and company included on every row so it drops straight into a
            spreadsheet. This copies to your clipboard, we can wire it to post straight into a Google Sheet
            once you have a Sheets endpoint set up.
          </p>
          <button
            onClick={() => navigator.clipboard?.writeText(csvRows())}
            style={{ ...primaryButtonStyle, background: C.ink }}
          >
            Copy as CSV ({bookedSessions.length} rows)
          </button>
        </div>
      )}

      <div style={{ marginTop: 24, padding: "20px 22px", borderRadius: 12, border: `1.5px solid ${C.amberDeep}`, background: "#FBF3E3" }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: "0.06em", color: C.amberDeep, marginBottom: 6 }}>
          WHILE YOU'RE THERE
        </div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 17, color: C.ink, marginBottom: 4 }}>
          Join us for a Veritas Prime happy hour
        </div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.inkSoft, marginBottom: 14 }}>
          {HAPPY_HOUR_DATE} · {HAPPY_HOUR_VENUE}
        </div>
        <a
          href={HAPPY_HOUR_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{ ...primaryButtonStyle, background: C.amberDeep, display: "inline-block", textDecoration: "none" }}
        >
          Register for the happy hour
        </a>
      </div>
    </div>
  );
}

// ---------- App ----------
export default function App() {
  const [stage, setStage] = useState("landscape");

  const [landscape, setLandscape] = useState({
    mode: "self", name: "", company: "", role: "", builderName: "", currentModules: new Set(), context: "",
    plannedModules: new Set(), plans: "", meetingRequested: false, meetingTopic: "",
  });

  const [selectedModules, setSelectedModules] = useState(new Set());
  const [rankedModules, setRankedModules] = useState([]);
  const [selectedSubs, setSelectedSubs] = useState(new Set());
  const [expanded, setExpanded] = useState(null);

  const [schedule, setSchedule] = useState(new Set());
  const [day, setDay] = useState(1);
  const [tab, setTab] = useState("recommended");
  const [browseFilter, setBrowseFilter] = useState("all");

  const toggleModule = (id) => {
    setSelectedModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    setRankedModules((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSub = (key) =>
    setSelectedSubs((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const toggleExpand = (id) => setExpanded((prev) => (prev === id ? null : id));

  const moveRank = (id, dir) =>
    setRankedModules((prev) => {
      const idx = prev.indexOf(id);
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      return next;
    });

  const goToSchedule = () => {
    setSchedule(buildSchedule(rankedModules, selectedSubs));
    setStage("schedule");
  };

  const attendeeLabel = landscape.name || "Your";

  return (
    <div style={{ minHeight: "100vh", background: C.paper }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        input::placeholder, textarea::placeholder { color: ${C.inkSoft}; opacity: 0.7; }
        input:focus, textarea:focus { border-color: ${C.ink} !important; }
        button:focus-visible { outline: 2px solid ${C.amberDeep}; outline-offset: 2px; }
      `}</style>

      {stage === "landscape" && (
        <LandscapeStage data={landscape} setData={setLandscape} onNext={() => setStage("interests")} />
      )}

      {stage === "interests" && (
        <InterestsStage
          selectedModules={selectedModules}
          toggleModule={toggleModule}
          selectedSubs={selectedSubs}
          toggleSub={toggleSub}
          expanded={expanded}
          toggleExpand={toggleExpand}
          rankedModules={rankedModules}
          moveRank={moveRank}
          onBack={() => setStage("landscape")}
          onNext={goToSchedule}
        />
      )}

      {stage === "schedule" && (
        <ScheduleStage
          rankedModules={rankedModules}
          selectedSubs={selectedSubs}
          schedule={schedule}
          setSchedule={setSchedule}
          day={day}
          setDay={setDay}
          tab={tab}
          setTab={setTab}
          browseFilter={browseFilter}
          setBrowseFilter={setBrowseFilter}
          onBack={() => setStage("interests")}
          onNext={() => setStage("preview")}
          attendeeLabel={attendeeLabel}
        />
      )}

      {stage === "preview" && (
        <PreviewStage
          landscape={landscape}
          rankedModules={rankedModules}
          schedule={schedule}
          setSchedule={setSchedule}
          onBack={() => setStage("interests")}
          onEditSchedule={() => setStage("schedule")}
        />
      )}
    </div>
  );
}
