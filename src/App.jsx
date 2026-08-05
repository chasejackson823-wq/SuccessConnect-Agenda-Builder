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

const DAYS = [1, "tbd"];
const DAY_LABELS = { 1: "Mon, Oct 5 — Pre-Conference", tbd: "Main Conference (Oct 6–7) — Times TBD" };
const SLOTS = ["8:00 AM", "1:00 PM"];
const LEVELS = ["Foundational", "Intermediate", "Advanced"];

function mkSession(id, day, slotIdx, modId, subIdx, title, blurb, room, levelIdx, speaker) {
  const mod = MODULES.find((m) => m.id === modId);
  return {
    id, day, time: slotIdx === null ? "Time TBD" : SLOTS[slotIdx], slotIdx, room,
    module: modId, sub: mod.subs[subIdx % mod.subs.length], title, blurb,
    level: LEVELS[levelIdx % LEVELS.length], speaker,
  };
}

// Real session data pulled from Chase's saved SAP Connect Las Vegas 2026 (SC26) session
// catalog page, "Success Connect" (HCM) track. 22 sessions are Monday Oct 5 pre-conference
// trainings/workshops with confirmed AM/PM blocks (rooms not yet assigned by SAP).
// The other 90 are main-conference sessions (Tue Oct 6 / Wed Oct 7) that SAP has published
// titles and descriptions for, but has not yet assigned a day, time, or room — grouped here
// under the "tbd" day so nothing gets lost while we wait on the real schedule.
const SESSIONS = [
  mkSession(1, 1, 0, "lms", 0, "Advanced Customization and Enhancements in SAP SuccessFactors Learning (HCMPC09)", "Hands-on pre-conference training session — bring a laptop, test systems provided.", "Room TBD", 2, "Pre-conference training"),
  mkSession(2, 1, 0, "onb", 0, "Beyond the Basics: Advanced Onboarding Configuration and Offboarding Readiness (HCMPC05)", "Hands-on pre-conference training session — bring a laptop, test systems provided.", "Room TBD", 2, "Pre-conference training"),
  mkSession(3, 1, 0, "rec", 0, "Explore AI-First, Intelligent Hiring with SmartRecruiters for SAP SuccessFactors (HCMPC14)", "Hands-on pre-conference training session — bring a laptop, test systems provided.", "Room TBD", 0, "Pre-conference training"),
  mkSession(4, 1, 0, "ec", 2, "Navigating Global Compliance in SAP SuccessFactors Employee Central Global Benefits (HCMPC01)", "Hands-on pre-conference training session — bring a laptop, test systems provided.", "Room TBD", 0, "Pre-conference training"),
  mkSession(5, 1, 0, "scm", 0, "Optimizing the Talent Management Cycle with AI (HCMPC17)", "Hands-on pre-conference training session — bring a laptop, test systems provided.", "Room TBD", 2, "Pre-conference training"),
  mkSession(6, 1, 0, "ecp", 0, "Payroll Control Center in SAP SuccessFactors: Configuring and Managing Payroll Processes (HCMPC07)", "Hands-on pre-conference training session — bring a laptop, test systems provided.", "Room TBD", 0, "Pre-conference training"),
  mkSession(7, 1, 0, "ana", 1, "SAP SuccessFactors Employee Central Story Reporting: Analysis with Effective Dating & Time-Based Logic (HCMPC12)", "Hands-on pre-conference training session — bring a laptop, test systems provided.", "Room TBD", 0, "Pre-conference training"),
  mkSession(8, 1, 0, "ec", 0, "SAP SuccessFactors Employee Central Fundamentals including AI Tools and Joule (HCMPC02)", "Hands-on pre-conference training session — bring a laptop, test systems provided.", "Room TBD", 0, "Pre-conference training"),
  mkSession(9, 1, 0, "scm", 0, "Using the Talent Intelligence Hub and Growth Portfolio Functionality in SAP SuccessFactors Solutions (HCMPC19)", "Hands-on pre-conference training session — bring a laptop, test systems provided.", "Room TBD", 2, "Pre-conference training"),
  mkSession(10, 1, 1, "ana", 0, "Accelerating Your Autonomous HCM Journey: End-to-End Enablement for Business Continuity (HCMPC21)", "Half-day interactive pre-conference workshop.", "Room TBD", 1, "Pre-conference workshop"),
  mkSession(11, 1, 1, "lms", 0, "A Look at Class Management in SAP SuccessFactors Learning (HCMPC10)", "Hands-on pre-conference training session — bring a laptop, test systems provided.", "Room TBD", 0, "Pre-conference training"),
  mkSession(12, 1, 1, "ana", 1, "Beyond Story Report Templates: Turning HR Data into Business Impact (HCMPC13)", "Hands-on pre-conference training session — bring a laptop, test systems provided.", "Room TBD", 2, "Pre-conference training"),
  mkSession(13, 1, 1, "ecp", 0, "Evolving Payroll Execution in the Payroll Control Center with the new Manage Payroll Activities (HCMPC08)", "Hands-on pre-conference training session — bring a laptop, test systems provided.", "Room TBD", 2, "Pre-conference training"),
  mkSession(14, 1, 1, "scm", 0, "Exploring Unified Talent Management Capabilities with SAP SuccessFactors Career and Talent Development (HCMPC18)", "Hands-on pre-conference training session — bring a laptop, test systems provided.", "Room TBD", 2, "Pre-conference training"),
  mkSession(15, 1, 1, "ana", 0, "From Curiosity to Action: Discovering Your High-Value AI Agent Use Cases with SAP (XPC01)", "Half-day interactive pre-conference workshop.", "Room TBD", 0, "Pre-conference workshop"),
  mkSession(16, 1, 1, "ec", 0, "Intelligent Workflow Automation: Enhancing Approval Processes in SAP SuccessFactors Employee Central (HCMPC03)", "Hands-on pre-conference training session — bring a laptop, test systems provided.", "Room TBD", 2, "Pre-conference training"),
  mkSession(17, 1, 1, "pmgm", 0, "Mastering Business Rules in SAP SuccessFactors Performance & Goals: Going Beyond Limits in Performance Reviews (HCMPC20)", "Hands-on pre-conference training session — bring a laptop, test systems provided.", "Room TBD", 2, "Pre-conference training"),
  mkSession(18, 1, 1, "comp", 0, "Mastering the Art of Compensation Cycle Planning with SAP SuccessFactors Compensation (HCMPC11)", "Hands-on pre-conference training session — bring a laptop, test systems provided.", "Room TBD", 0, "Pre-conference training"),
  mkSession(19, 1, 1, "ec", 1, "Modernizing Position Management with AI-Driven Efficiency (HCMPC06)", "Hands-on pre-conference training session — bring a laptop, test systems provided.", "Room TBD", 2, "Pre-conference training"),
  mkSession(20, 1, 1, "rec", 0, "Optimizing Job Requisitions and Multi-Channel Posting with SmartRecruiters for SAP SuccessFactors (HCMPC15)", "Hands-on pre-conference training session — bring a laptop, test systems provided.", "Room TBD", 0, "Pre-conference training"),
  mkSession(21, 1, 1, "ana", 0, "SAP SuccessFactors System Administration Fundamentals including AI Tools and Joule (HCMPC04)", "Hands-on pre-conference training session — bring a laptop, test systems provided.", "Room TBD", 0, "Pre-conference training"),
  mkSession(22, 1, 1, "rec", 0, "SmartRecruiters for SAP SuccessFactors Foundation Excellence: Configuring Critical System Guardrails (HCMPC16)", "Hands-on pre-conference training session — bring a laptop, test systems provided.", "Room TBD", 0, "Pre-conference training"),
  mkSession(23, 'tbd', null, "ana", 0, "2027 and beyond: Future of work predictions reality check (HCM1320)", "Last year’s predictions were full of provocative takes. What happened, what didn’t, and what's next?", "TBD", 0, "Strategy talk"),
  mkSession(24, 'tbd', null, "ec", 0, "Accelerate business growth with aligned HR and finance (HCM1394)", "The best results happen when HR and finance move as one. Learn how midsize companies are driving business growth by aligning HR and finance with SAP GROW offerings.", "TBD", 0, "Strategy talk"),
  mkSession(25, 'tbd', null, "ana", 1, "AI-enabled workforce planning: A new era for HR and finance (HCM1688)", "Learn how SAP's new workforce planning capability can help HR, finance, and business leaders plan, simulate, and proactively optimize their workforce.", "TBD", 1, "Strategy talk"),
  mkSession(26, 'tbd', null, "rec", 0, "Ask the experts: Talent acquisition (HCM1427)", "Bring your toughest hiring questions to the people who know the answers. SmartRecruiters and SAP SuccessFactors solutions experts tackle your questions in an open forum on AI, migration, integration, and skills-based hiring.", "TBD", 0, "Ask the expert"),
  mkSession(27, 'tbd', null, "ana", 0, "Autonomous HCM: The future of HR is already here (HCM1417)", "What does it mean for HCM to be truly autonomous? Examine how AI is moving HR from reactive administration to proactive, self-executing processes.", "TBD", 0, "Strategy talk"),
  mkSession(28, 'tbd', null, "ecp", 0, "Autonomous payroll in action: Activating AI agents for every pay run (HCM1492)", "What if payroll could anticipate issues before they became employee concerns?", "TBD", 2, "Solution deep dive"),
  mkSession(29, 'tbd', null, "time", 0, "Autonomous workforce management is here—and HR is in the driver's seat (HCM1490)", "Autonomous workforce management isn't about removing HR from the equation, it's about giving HR the power to lead it.", "TBD", 1, "Strategy talk"),
  mkSession(30, 'tbd', null, "ecp", 0, "Better AI starts here: Building on a unified HR foundation (HCM1483)", "Better AI doesn't start with more tools, it starts with better data.", "TBD", 0, "Strategy talk"),
  mkSession(31, 'tbd', null, "ec", 0, "Bridge the HR and finance gap to unlock business agility (HCM1509)", "See how an SAP customer aligned HR and finance to create a connected approach to workforce and business planning.", "TBD", 0, "Customer success story"),
  mkSession(32, 'tbd', null, "lms", 0, "Building an adoption strategy for AI capabilities in learning and talent (HCM1407)", "Uncover how organizations are creating adoption strategies that increase awareness, encourage usage, and help employees get value from learning and talent AI capabilities in SAP SuccessFactors solutions.", "TBD", 0, "Strategy talk"),
  mkSession(33, 'tbd', null, "ana", 0, "Connect, enhance, evolve: HCM innovations for integration and extensibility (HCM1445)", "Dive into our latest integration and extensibility strategy and innovations across SAP SuccessFactors solutions. See how you can harness them to optimize workflows, connect systems smoothly, and evolve your HR processes.", "TBD", 2, "Solution deep dive"),
  mkSession(34, 'tbd', null, "ecp", 0, "Expedite your cloud migration with SAP Readiness Check, proven worldwide (HCM1326)", "The SAP Readiness Check toolset for SAP SuccessFactors solutions supports your move from the SAP ERP HCM solution on-premises to SAP SuccessFactors HCM.", "TBD", 2, "Solution deep dive"),
  mkSession(35, 'tbd', null, "rec", 0, "Experience agentic recruiting at scale: Accelerate volume hiring with AI (HCM1429)", "See how agentic AI streamlines high-volume hiring, from AI-assisted job discovery to automated interview scheduling and beyond.", "TBD", 2, "Solution deep dive"),
  mkSession(36, 'tbd', null, "pmgm", 0, "Extending HCM agents with Joule Studio: A performance management use case (HCM1464)", "As you look to increase employee productivity with AI, it is key to identify areas requiring customization based on your business needs. Get an overview of the SAP solutions that enable extensibility and AI for your HCM solutions.", "TBD", 1, "Strategy talk"),
  mkSession(37, 'tbd', null, "ana", 0, "Extending HCM solutions with SAP Business AI Platform: Deep dive (HCM1500)", "Find out how SAP Business AI Platform helps SAP SuccessFactors HCM customers extend HCM solutions.", "TBD", 0, "Solution deep dive"),
  mkSession(38, 'tbd', null, "ana", 1, "Five ways talent leaders win with story reports (HCM1691)", "Learn five proven ways talent leaders are using story reports in SAP SuccessFactors HCM to drive decisions.", "TBD", 2, "Solution deep dive"),
  mkSession(39, 'tbd', null, "ana", 1, "From insights to action: People Intelligence Assistant for Autonomous HCM (HCM1689)", "Learn how the new People Intelligence Assistant and Agents can help HR leaders move from reactive dashboard-watching to confident decisions.", "TBD", 0, "Strategy talk"),
  mkSession(40, 'tbd', null, "ana", 0, "From principles to practice: Operationalizing responsible AI in HR (HCM1411)", "Deploying AI in HR demands more than good intentions.", "TBD", 0, "Solution deep dive"),
  mkSession(41, 'tbd', null, "lms", 0, "From skills to action with AI assistants and agents for learning and talent (HCM1361)", "Discover how Joule Assistants orchestrate connected agents across learning and talent management to continuously generate and act on talent intelligence.", "TBD", 2, "Strategy talk"),
  mkSession(42, 'tbd', null, "time", 0, "From vision to value: SAP SuccessFactors strategy for regulated industries (HCM1489)", "Discover how SAP helps regulated industries transform HR operations with purpose-built capabilities including position budgeting control for cloud and consolidated time recording.", "TBD", 0, "Strategy talk"),
  mkSession(43, 'tbd', null, "ana", 0, "Governing HCM agents with SAP Integration Suite (HCM1465)", "Review what a production-ready agentic HR workflow requires with SAP Integration Suite as the governance layer for agentic HR automation.", "TBD", 2, "Strategy talk"),
  mkSession(44, 'tbd', null, "ana", 0, "HCM partner AI agent showdown (HCM1330)", "Watch a high-energy competition where HCM partners pitch AI agents built for SAP SuccessFactors solutions. Partners will present to expert judges and receive real-time feedback, and then the audience will vote for their favorite.", "TBD", 0, "Strategy talk"),
  mkSession(45, 'tbd', null, "ana", 0, "How co-innovation with SAP is driving customer adoption of agentic AI (HCM1419)", "Hear directly from SAP about what happens when we join forces with our customers to solve HR challenges with AI.", "TBD", 0, "Customer success story"),
  mkSession(46, 'tbd', null, "scm", 0, "How Joule Assistants and Joule Agents turn talent intelligence into action (HCM1359)", "Experience real-world demonstrations of SAP SuccessFactors solutions’ AI innovations across learning, talent, and skills.", "TBD", 2, "Solution demo"),
  mkSession(47, 'tbd', null, "ana", 0, "How SAP's AI data engine turns everyday work into meaningful insights (HCM1412)", "SAP's AI data engine reads work signals like Microsoft Teams messages, emails, and calendars to help build a living, synthesized narrative using agents like the Performance Intelligence Agent and Skills Evidence Agent.", "TBD", 0, "Solution deep dive"),
  mkSession(48, 'tbd', null, "ana", 0, "How to activate AI assistants and agents for HCM in “SAP for Me” (HCM1415)", "The SAP for Me tool is your central hub for activating AI assistants and agents across SAP SuccessFactors solutions.", "TBD", 0, "Quick tips"),
  mkSession(49, 'tbd', null, "pmgm", 0, "How to deliver more-relevant performance experiences with business rules (HCM1353)", "Learn how to activate your skills strategy across SAP SuccessFactors solutions with proven, practical steps for setup and governance of your skills and job architecture.", "TBD", 2, "Quick tips"),
  mkSession(50, 'tbd', null, "ec", 0, "How to plan transformation with organizational modeling (HCM1485)", "Transformation timelines move fast—and the cost of poor org design decisions is high.", "TBD", 0, "Quick tips"),
  mkSession(51, 'tbd', null, "ana", 0, "How to use SAP Business AI Platform to extend HCM: Use case highlights (HCM1466)", "See SAP's official catalog for the full session description.", "TBD", 0, "Quick tips"),
  mkSession(52, 'tbd', null, "lms", 1, "Improve feature adoption in SAP SuccessFactors with WalkMe solutions (HCM1408)", "WalkMe solutions help organizations measure adoption, identify where users need support, and uncover opportunities to increase engagement with SAP SuccessFactors solutions.", "TBD", 0, "Solution deep dive"),
  mkSession(53, 'tbd', null, "ana", 1, "Inside SAP’s skills-led workforce transformation with AI and data (HCM1277)", "Learn how SAP evolved from establishing a global skills foundation to orchestrating an autonomous workforce with SAP SuccessFactors solutions, the SAP Business Data Cloud solution, and agentic AI capabilities.", "TBD", 1, "Customer success story"),
  mkSession(54, 'tbd', null, "lms", 0, "Leading the next era of work starts with learning and talent strategies (HCM1362)", "Work is being redefined by AI, shifting how organizations develop talent, deploy skills, and create value. Explore how HR leaders can move beyond automating processes to elevate workforce capabilities and reinvent work itself.", "TBD", 2, "Strategy talk"),
  mkSession(55, 'tbd', null, "ecp", 0, "Modernize your HCM strategy by moving to the cloud (HCM1325)", "Learn more about the SAP ERP Human Capital Management  solution's on-premises maintenance timelines and cloud innovations available today.", "TBD", 0, "Strategy talk"),
  mkSession(56, 'tbd', null, "ec", 0, "Modernizing HR to scale for growth (HCM1511)", "Learn from a midsize customer panel as they share their HR modernization journey with SAP SuccessFactors solutions.", "TBD", 0, "Customer success story"),
  mkSession(57, 'tbd', null, "rec", 0, "Navigating the future of hiring: AI trends reshaping talent acquisition (HCM1479)", "AI is rapidly transforming every stage of the hiring journey, yet many organizations continue to feel outpaced by change.", "TBD", 0, "Strategy talk"),
  mkSession(58, 'tbd', null, "ec", 0, "No ticket required: AI-supported HR service delivery (HCM1491)", "An employee has a question. What happens next can redefine how employees experience HR.", "TBD", 0, "Solution deep dive"),
  mkSession(59, 'tbd', null, "ana", 1, "People Intelligence deep dive: Prebuilt insights, AI, cross-suite use cases (HCM1690)", "Dive deep into People Intelligence with a solution overview, including prebuilt insights, SAP SuccessFactors data products, customization options, cross-suite insights, and AI-assisted analysis.", "TBD", 2, "Solution deep dive"),
  mkSession(60, 'tbd', null, "ana", 0, "Practical tips for governing HR agents with SAP AI Agent Hub (HCM1416)", "Get actionable tips for using the SAP AI Agent Hub solution to monitor, configure, and govern AI agents in SAP SuccessFactors solutions.", "TBD", 0, "Strategy talk"),
  mkSession(61, 'tbd', null, "rec", 0, "Quick tips: Accelerate hiring transformation with SmartRecruiters solutions (HCM1432)", "Moving from the SAP SuccessFactors Recruiting solution to the SmartRecruiters for SAP SuccessFactors solution? Get quick, practical tips to unlock value fast.", "TBD", 0, "Quick tips"),
  mkSession(62, 'tbd', null, "ana", 1, "Quick tips to analyze and close pay gaps with pay transparency insights (HCM1694)", "Does your organization have what it needs to meet the EU reporting requirements?", "TBD", 0, "Quick tips"),
  mkSession(63, 'tbd', null, "ana", 1, "Quick tips to get started with People Intelligence (HCM1693)", "Ready to get started with People Intelligence? Get quick tips for readiness checks, enablement paths, and services packages.", "TBD", 0, "Quick tips"),
  mkSession(64, 'tbd', null, "ec", 0, "Quick tips to improve process efficiency with mass data management (HCM1487)", "When workforce data changes at scale, mass data management in the SAP SuccessFactors Employee Central solution helps teams move faster without sacrificing accuracy.", "TBD", 0, "Quick tips"),
  mkSession(65, 'tbd', null, "ecp", 0, "Quick tips: Tools and proven practices for your HCM cloud migration (HCM1327)", "Harness key tools, assets, and services that support every stage of your HCM cloud migration journey.", "TBD", 0, "Quick tips"),
  mkSession(66, 'tbd', null, "ana", 0, "Quick tips you can use to estimate AI usage in SAP SuccessFactors HCM (HCM1413)", "Before you activate AI agents and skills in SAP SuccessFactors solutions, understand how your employees will use it.", "TBD", 0, "Quick tips"),
  mkSession(67, 'tbd', null, "pmgm", 0, "Redefine pay for performance for a new era (HCM1363)", "Traditional pay-for-performance models no longer fit an AI-driven workplace.", "TBD", 0, "Strategy talk"),
  mkSession(68, 'tbd', null, "ana", 0, "Road map and vision: AI in SAP SuccessFactors HCM (HCM1418)", "Get a forward-looking view of where SAP SuccessFactors solutions are headed with AI. Preview upcoming agent capabilities, Joule solution enhancements, and AI-powered features across talent, core HR, and workforce management.", "TBD", 0, "Roadmap"),
  mkSession(69, 'tbd', null, "scm", 0, "Road map and vision: Career development and internal mobility (HCM1357)", "Explore the product vision and road map for the SAP SuccessFactors Career and Talent Development solution.", "TBD", 0, "Roadmap"),
  mkSession(70, 'tbd', null, "comp", 0, "Road map and vision: Compensation (HCM1356)", "See what's next for the SAP SuccessFactors Compensation solution, including AI assistants and agents.", "TBD", 0, "Roadmap"),
  mkSession(71, 'tbd', null, "ec", 0, "Road map and vision: Core HR (HCM1475)", "The future of HR starts at the core.", "TBD", 0, "Roadmap"),
  mkSession(72, 'tbd', null, "ec", 0, "Road map and vision: HCM application and technology foundation (HCM1444)", "Explore the innovations powering SAP SuccessFactors HCM. Discover the transformative power of agentic AI on SAP Business AI Platform, alongside key innovations in integration, extensibility, security, and system administration.", "TBD", 0, "Roadmap"),
  mkSession(73, 'tbd', null, "ana", 1, "Road map and vision: HR reporting, analytics, and workforce planning (HCM1687)", "Explore what's coming for story reports in SAP SuccessFactors HCM, HR analytics with People Intelligence, and workforce planning.", "TBD", 0, "Roadmap"),
  mkSession(74, 'tbd', null, "ec", 0, "Road map and vision: HR service delivery (HCM1480)", "Transform HR service delivery from transactional case handling to intelligent, employee-centric experiences.", "TBD", 0, "Roadmap"),
  mkSession(75, 'tbd', null, "lms", 0, "Road map and vision: Learning (HCM1354)", "Learning is no longer about delivering courses, but delivering the right knowledge, at the right moment, in the flow of work.", "TBD", 0, "Roadmap"),
  mkSession(76, 'tbd', null, "ecp", 0, "Road map and vision: Payroll (HCM1481)", "Autonomous payroll isn't about removing people from the process—it's about removing friction. The future of payroll streamlines every pay cycle without compromising the trust, governance, and transparency it demands.", "TBD", 0, "Roadmap"),
  mkSession(77, 'tbd', null, "pmgm", 0, "Road map and vision: Performance and goal management (HCM1355)", "Performance management is becoming the intelligent engine for growth. Explore the road map and vision for the SAP SuccessFactors Performance & Goals solution, enhanced by Joule Assistants and Joule Agents.", "TBD", 0, "Roadmap"),
  mkSession(78, 'tbd', null, "ec", 2, "Road map and vision: SAP SuccessFactors Employee Central Global Benefits (HCM1478)", "Strengthen your benefits strategy with what’s next for the SAP SuccessFactors Employee Central Global Benefits solution. Review recent enhancements, preview upcoming innovations, and understand key investment areas, including U.S.", "TBD", 0, "Roadmap"),
  mkSession(79, 'tbd', null, "scm", 0, "Road map and vision: Skills across SAP SuccessFactors HCM (HCM1358)", "Get to know our vision and strategy for the talent intelligence hub, SAP’s unified skills framework.", "TBD", 0, "Roadmap"),
  mkSession(80, 'tbd', null, "rec", 0, "Road map and vision: Talent acquisition (HCM1426)", "Get an inside look at the product vision and road map for the SmartRecruiters for SAP SuccessFactors and SAP SuccessFactors Onboarding solutions.", "TBD", 2, "Roadmap"),
  mkSession(81, 'tbd', null, "time", 0, "Road map and vision: Workforce management (HCM1482)", "Get a first look at what's coming for SAP SuccessFactors solutions for workforce management.", "TBD", 0, "Roadmap"),
  mkSession(82, 'tbd', null, "rec", 0, "Roundtable: Measuring the impact of AI in the age of intelligent hiring (HCM1431)", "Engage with experts and peers in an interactive discussion exploring value-based use cases where AI can empower your organization to hire the right skills faster, navigate candidate fraud, and streamline every step of the hiring journey.", "TBD", 2, "Roundtable discussion"),
  mkSession(83, 'tbd', null, "ana", 0, "Run, manage, automate: AI-enhanced innovations in HCM system administration (HCM1447)", "Discover the next generation of system administration for SAP SuccessFactors solutions, supported by AI-enhanced innovations.", "TBD", 2, "Solution deep dive"),
  mkSession(84, 'tbd', null, "ana", 0, "Safeguard your workforce: Innovations in security and identity management (HCM1446)", "Explore the latest security and identity management innovations across SAP SuccessFactors solutions.", "TBD", 2, "Solution deep dive"),
  mkSession(85, 'tbd', null, "ana", 0, "SAP Business AI Platform and HCM overview (HCM1499)", "Get an overview of SAP Business AI Platform and the opportunity it provides for SAP SuccessFactors HCM customers.", "TBD", 0, "Solution deep dive"),
  mkSession(86, 'tbd', null, "ana", 0, "SAP Integration Suite: Connecting HR processes with the power of AI (HCM1456)", "Take a deep dive into how SAP Integration Suite can help HR organizations streamline the creation of integration flows with new built-in AI capabilities.", "TBD", 2, "Solution deep dive"),
  mkSession(87, 'tbd', null, "ecp", 0, "SAP Integration Suite: HCM integration for benefits, payroll, and finance (HCM1459)", "See SAP's official catalog for the full session description.", "TBD", 2, "Solution deep dive"),
  mkSession(88, 'tbd', null, "rec", 0, "SAP runs SAP: Recruiting with SmartRecruiters solutions and agentic AI (HCM1278)", "Discover how SAP adopted SmartRecruiters solutions and is creating a next-generation recruiting ecosystem that combines talent data, workforce intelligence, and agentic AI.", "TBD", 1, "Customer success story"),
  mkSession(89, 'tbd', null, "ana", 0, "SAP SuccessFactors product strategy: Making Autonomous HCM a reality (HCM1328)", "Get an inside look at the product strategy for SAP SuccessFactors HCM, including how we prioritize investments, evaluate partnerships, assess trends, and shape our road map.", "TBD", 2, "Strategy talk"),
  mkSession(90, 'tbd', null, "rec", 0, "See how to create connected talent experiences across hiring and beyond (HCM1428)", "Discover the power of a seamless talent journey that turns eager candidates into productive new hires and successful employees.", "TBD", 0, "Solution demo"),
  mkSession(91, 'tbd', null, "ana", 1, "See how to unlock AI-enabled workforce insights with People Intelligence (HCM1692)", "Watch a live demo of People Intelligence and see how it connects data from SAP SuccessFactors HCM and beyond to deliver insights across hiring, retention, skills, and compensation.", "TBD", 0, "Solution demo"),
  mkSession(92, 'tbd', null, "onb", 0, "See how to unlock new hire success from day one with agentic onboarding (HCM1430)", "Explore how agentic AI capabilities in the SAP SuccessFactors Onboarding solution connect people, processes, and data, delivering personalized experiences that boost productivity.", "TBD", 2, "Solution deep dive"),
  mkSession(93, 'tbd', null, "ana", 0, "See how to work smarter with Spaces in Joule Work (HCM1414)", "The Joule solution is evolving. Discover Spaces in the Joule Work capability, a reimagined AI experience that brings intelligence, tasks, and collaboration into one unified place.", "TBD", 0, "Solution demo"),
  mkSession(94, 'tbd', null, "ecp", 0, "See it work: A live end-to-end demo of an integrated HR foundation (HCM1488)", "Most HR teams still rely on multiple systems to do what one should.", "TBD", 0, "Solution demo"),
  mkSession(95, 'tbd', null, "ec", 0, "Seven ways agentic AI is transforming core HR (HCM1484)", "AI agents don't just support HR work, they change what HR work means.", "TBD", 0, "Strategy talk"),
  mkSession(96, 'tbd', null, "ana", 0, "Shape the future with Autonomous HCM from SAP SuccessFactors solutions (HCM1289)", "See how SAP SuccessFactors turns the vision of Autonomous HCM into action.", "TBD", 0, "Keynote"),
  mkSession(97, 'tbd', null, "scm", 0, "Skills strategies for the early talent career crisis (HCM1360)", "Strategy-level session on where SAP is heading next.", "TBD", 0, "Strategy talk"),
  mkSession(98, 'tbd', null, "time", 0, "Staff, track, bill: The full project lifecycle for professional services (HCM1494)", "In professional services, every unbilled hour is lost revenue.", "TBD", 2, "Solution deep dive"),
  mkSession(99, 'tbd', null, "ana", 0, "Streamline HCM processes with  workflows and automation using SAP Build (HCM1463)", "See SAP's official catalog for the full session description.", "TBD", 0, "Solution demo"),
  mkSession(100, 'tbd', null, "ana", 0, "The human side of AI: Elevating HR's impact in an AI-driven enterprise (HCM1395)", "As AI adoption accelerates, HR is uniquely positioned to connect technology investments with workforce and business outcomes.", "TBD", 0, "Strategy talk"),
  mkSession(101, 'tbd', null, "lms", 1, "Turn AI activation to adoption with SAP SuccessFactors and WalkMe solutions (HCM1406)", "Enabling AI features is only the beginning. The real challenge is helping employees discover, trust, and use them consistently.", "TBD", 0, "Quick tips"),
  mkSession(102, 'tbd', null, "ecp", 0, "What customers have to say about moving HR to the cloud (HCM1329)", "Hear directly from customers who have navigated their move from the SAP ERP Human Capital Management solution on-premises to SAP SuccessFactors HCM.", "TBD", 0, "Customer success story"),
  mkSession(103, 'tbd', null, "ana", 0, "What HR leaders should do to prepare for Joule Assistants and Joule Agents (HCM1421)", "AI agents are reshaping how HR work gets done, from hiring to onboarding and everything in between.", "TBD", 0, "Strategy talk"),
  mkSession(104, 'tbd', null, "time", 0, "When every shift counts: Transforming workforce scheduling in manufacturing (HCM1493)", "When production plans change, your workforce schedule should too.", "TBD", 2, "Solution deep dive"),
  mkSession(105, 'tbd', null, "ana", 0, "Workshop: Chart your path toward Autonomous HCM (HCM1331)", "Ready to embrace the future of HCM but not sure where to start? Discover agentic AI readiness and adoption best practices.", "TBD", 0, "Workshop‎"),
  mkSession(106, 'tbd', null, "pmgm", 0, "Workshop: Create an impact-driven performance and rewards strategy (HCM1335)", "Looking to build a pay-for-performance process that fairly rewards employee contribution? Explore innovative ways to measure workforce impact and value creation.", "TBD", 0, "Workshop‎"),
  mkSession(107, 'tbd', null, "scm", 0, "Workshop: Keeping humans at the center of AI-driven talent management (HCM1337)", "AI is rapidly transforming talent management by reducing the manual burden that comes with traditional processes. But how can you ensure people remain at the heart of this new operating model?", "TBD", 0, "Workshop‎"),
  mkSession(108, 'tbd', null, "ana", 0, "Workshop: Preparing people managers to lead in the age of AI (HCM1334)", "The people manager role is undergoing a critical shift driven by agentic AI and evolving employee needs.", "TBD", 0, "Workshop‎"),
  mkSession(109, 'tbd', null, "ana", 0, "Workshop: Redesign jobs for the agentic AI era (HCM1332)", "As AI changes how work gets done, now is the time to rethink traditional job models.", "TBD", 0, "Workshop‎"),
  mkSession(110, 'tbd', null, "ana", 0, "Workshop: Reimagine the user experience with Joule Work for HR (HCM1336)", "Discover how the Joule Work capability provides a unified entry point to Autonomous HCM, empowering users to complete tasks quickly and confidently with an intent-driven experience.", "TBD", 0, "Workshop‎"),
  mkSession(111, 'tbd', null, "ana", 1, "Workshop: Shaping the future of workforce planning (HCM1338)", "Every organization's approach to workforce planning is unique, but the need for visibility is universal. Examine how the latest AI-enabled innovations help bring clarity and insight to every workforce decision.", "TBD", 0, "Workshop‎"),
  mkSession(112, 'tbd', null, "rec", 0, "Workshop: What’s next for the role of the recruiter (HCM1333)", "AI and automation have fundamentally reshaped the recruiting function—but how has this transformation impacted the role of the recruiter?", "TBD", 0, "Workshop‎"),
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

function buildSchedule(rankedModules, selectedSubs) {
  const chosen = new Set();
  DAYS.forEach((day) => {
    SLOTS.forEach((_, slotIdx) => {
      const candidates = SESSIONS.filter((s) => s.day === day && s.slotIdx === slotIdx);
      let best = null;
      let bestScore = 0;
      candidates.forEach((c) => {
        const { score } = scoreSession(c, rankedModules, selectedSubs);
        if (score > bestScore) {
          bestScore = score;
          best = c;
        }
      });
      if (best && bestScore > 0) chosen.add(best.id);
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
function SessionCard({ session, inSchedule, onToggle, matches }) {
  const color = modColor(session.module);
  return (
    <div style={{ display: "flex", border: `1px solid ${inSchedule ? color : C.line}`, borderRadius: 10, background: C.paperRaised, overflow: "hidden" }}>
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
      <div style={{ width: 108, flexShrink: 0, padding: "14px 12px", display: "flex", flexDirection: "column", justifyContent: "space-between", borderLeft: `1px dashed ${C.lineDark}` }}>
        <div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 500, color: C.ink }}>{session.time}</div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: C.inkSoft, marginTop: 2 }}>{session.room}</div>
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

  return (
    <div className="max-w-3xl mx-auto px-6" style={{ paddingTop: 40, paddingBottom: 64 }}>
      <StepDots stage="schedule" />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 22, marginBottom: 4 }}>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 600, color: C.ink }}>
          {attendeeLabel}'s schedule
        </h2>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: C.inkSoft }}>
          {totalSelected} session{totalSelected === 1 ? "" : "s"} booked
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
                    <SessionCard key={s.id} session={s} matches={matches} inSchedule={schedule.has(s.id)} onToggle={() => toggleInSchedule(s.id)} />
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
                    <SessionCard key={s.id} session={s} matches={matches} inSchedule={schedule.has(s.id)} onToggle={() => toggleInSchedule(s.id)} />
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
    () => SESSIONS.filter((s) => schedule.has(s.id)).sort((a, b) => a.day - b.day || a.slotIdx - b.slotIdx),
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

  const removeSession = (id) => setSchedule((prev) => { const next = new Set(prev); next.delete(id); return next; });

  const csvRows = () => {
    const header = [
      "Name", "Company", "Role", "Day", "Time", "Room", "Module", "Session Title", "Level",
      "Planned Modules", "Plans Notes", "Meeting Requested", "Meeting Topic",
    ];
    const plannedStr = [...landscape.plannedModules].map(modName).join("; ");
    const rows = bookedSessions.map((s) => [
      landscape.name, landscape.company, landscape.role, DAY_LABELS[s.day], s.time, s.room, modName(s.module), s.title, s.level,
      plannedStr, landscape.plans, landscape.meetingRequested ? "Yes" : "No", landscape.meetingTopic,
    ]);
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

      {DAYS.filter((d) => byDay[d]).map((d) => (
        <div key={d} style={{ marginBottom: 26 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 16, color: C.ink, marginBottom: 10 }}>{DAY_LABELS[d]}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {byDay[d].map((s, i) => (
              <div key={s.id} style={{ display: "flex", gap: 14, padding: "12px 0", borderTop: i === 0 ? "none" : `1px solid ${C.line}` }}>
                <div style={{ width: 78, flexShrink: 0, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, color: C.inkSoft, paddingTop: 2 }}>{s.time}</div>
                <div style={{ width: 3, borderRadius: 2, background: modColor(s.module), flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, padding: "1px 6px", borderRadius: 4, color: "#fff", background: modColor(s.module) }}>
                      {modShort(s.module)}
                    </span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: C.inkSoft }}>{s.room}</span>
                  </div>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14.5, color: C.ink }}>{s.title}</div>
                </div>
                <button onClick={() => removeSession(s.id)} style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: C.inkSoft, background: "none", border: "none", cursor: "pointer", alignSelf: "start" }}>
                  Remove
                </button>
              </div>
            ))}
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
