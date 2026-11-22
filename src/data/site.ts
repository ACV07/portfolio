// ─────────────────────────────────────────────────────────────
//  EDIT THIS FILE to make the portfolio yours.
//  Everything on the site (name, bio, services, timeline, links)
//  is read from here.
// ─────────────────────────────────────────────────────────────

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const asset = <T extends string | null>(path: T): T => {
  if (typeof path === "string" && path.startsWith("/")) {
    return `${basePath}${path}` as T;
  }
  return path;
};

export const site = {
  name: "ADRIAN CHERIAN",
  role: "Cybersecurity enthusiast",
  established: "2025",
  year: "2026", // shown in the footer ©
  city: "Kolkata, India",
  timeZone: "Asia/Kolkata",

  // Photos live in /public. Leave as null to show the placeholder frame.
  // portrait: shown on the Home page (tall photo, 3:5 works best)
  // cutout:   shown in the About spotlight (PNG with the background removed)
  portrait: asset("/adrian.webp") as string | null, // e.g. "/portrait.jpg"
  logo: asset("/acv-logo.png") as string, // ACV logo shown in the top bar
  cutout: asset("/adrian.webp") as string | null, // e.g. "/cutout.png"

  tagline: "Cybersecurity enthusiast and BCA student. Curious by nature. Security-focused by choice.",

  // "\n" starts a new line in the headline
  aboutHeadline: "I think like an attacker,\nto defend like a professional.",
  // Each entry is its own paragraph. The last one is shown as a closing line.
  aboutBio: [
    "I'm a cybersecurity enthusiast and BCA student passionate about understanding, analyzing, and securing digital systems.",
    "My interests lie in ethical hacking, network security, and cyber threat analysis. I'm constantly learning, experimenting, and building the skills needed to tackle real-world security challenges.",
    "Curious by nature. Security-focused by choice.",
  ],

  // Shown as tags under "Focus areas" on About me
  skills: ["Ethical hacking", "Network security", "Threat analysis", "System security"],

  services: ["Ethical hacking", "Network security", "Threat analysis"],

  // Your story, based on your bio. Swap "when" for real years (e.g. "2023") whenever you like.
  timeline: [
    { when: "The spark", title: "Curious about how systems work", text: "Wanting to know how things work turned into asking how they break, and how to protect them." },
    { when: "Studies", title: "BCA student", text: "Building a foundation in computing, programming and networks." },
    { when: "Practice", title: "Hands-on learning", text: "Experimenting with ethical hacking techniques and security tools." },
    { when: "Next", title: "Real-world security", text: "Building the skills to tackle real-world security challenges." },
  ],

  // Experience page, shown as "case files". Newest first.
  // status: "active" for current roles, "completed" for finished ones.
  // notes is optional: one or two lines on what you did or learned.
  experience: [
    { role: "SOC Analyst Intern", org: "ITKRAFTZ", from: "Sep 2026", to: "Present", status: "active" as const, notes: "" },
    { role: "Cybersecurity Analyst Intern", org: "Hackveda Solutions", from: "Mar 2026", to: "May 2026", status: "completed" as const, notes: "" },
    { role: "Cybersecurity Analyst Intern", org: "ITKRAFTZ", from: "May 2025", to: "Jul 2025", status: "completed" as const, notes: "" },
  ],

  // Projects wheel, in display order. Images live in /public/projects.
  projects: [
    {
      name: "OpsPilot",
      image: asset("/projects/opspilot.webp"),
      repo: "https://github.com/ACV07/opspilot",
      description:
        "AI incident commander built at a hackathon. It collects evidence from services, asks DeepSeek for the root cause, and waits for human approval before any remediation.",
      tags: ["Next.js", "TypeScript", "DeepSeek", "Supabase"],
    },
    {
      name: "OpsPilot Simulator",
      image: asset("/projects/opspilot-simulator.webp"),
      repo: "https://github.com/ACV07/opspilot_simulator",
      description:
        "A fake production environment for OpsPilot. It plays out outage scenarios with logs, metrics and deployments, and exposes rollback and recovery actions.",
      tags: ["Node.js", "TypeScript", "REST API", "Docker"],
    },
    {
      name: "Game",
      image: asset("/projects/game.webp"),
      repo: "https://github.com/ACV07/GAME",
      description:
        "Challenge Arena: a web game with coding challenges, drag-and-drop and find-the-error rounds, a live leaderboard and admin controls.",
      tags: ["Python", "Flask", "SQLite"],
    },
    {
      name: "Student Attendance Recorder",
      image: asset("/projects/attendance-recorder.webp"),
      repo: "https://github.com/ACV07/STUDENT-ATTENDANCE-RECORDER",
      description: "Attendance recorder for teachers. Mark students present or absent in the browser and export the register as CSV.",
      tags: ["HTML", "CSS", "JavaScript"],
    },
    {
      name: "Student Attendance Calculator",
      image: asset("/projects/attendance-calculator.webp"),
      repo: "https://github.com/ACV07/STUDENT-ATTENDENCE-CALCULATOR",
      description: "A calculator for working out a student's attendance percentage.",
      tags: [] as string[],
    },
    {
      name: "Currency Converter",
      image: asset("/projects/currency-converter.webp"),
      repo: "https://github.com/ACV07/CURRENCY-CONVERTER",
      description: "A Java program that converts amounts between currencies such as USD, EUR, GBP, INR and JPY.",
      tags: ["Java"],
    },
  ],

  // Skills section (after Projects). level is optional: "Beginner" | "Foundational" | "Intermediate".
  skillGroups: [
    {
      title: "Programming languages",
      items: [
        { name: "Python", level: "Intermediate" },
        { name: "Java", level: "Foundational" },
        { name: "HTML", level: "Beginner" },
      ],
    },
    {
      title: "Cybersecurity",
      items: [
        { name: "OSINT Framework", level: "Intermediate" },
        { name: "AI Threat Reporting", level: "" },
      ],
    },
    {
      title: "Tools and platforms",
      items: [
        { name: "Visual Studio Code", level: "" },
        { name: "Linux", level: "" },
        { name: "MS Office", level: "" },
      ],
    },
  ],

  // Milestones section (after Skills): competitions and hackathons.
  // Put placings first; a "rank" makes it the featured card.
  milestones: [
    { event: "CHRIST University's 24-Hour International Hackathon", result: "2nd Place", rank: 2 },
    { event: "24-Hour National Inter-Collegiate Hackathon", result: "Participant", rank: 0 },
    { event: "Hack or Be Hacked Competition", result: "Participant", rank: 0 },
    { event: "Hackverse (GDG) Hackathon", result: "Participant", rank: 0 },
  ],

  // Certifications section (after Milestones), in priority order: most relevant to security roles first.
  // logo: optional path to an official logo file in /public (shown in white); without it the issuer name is shown.
  certifications: [
    { title: "Ethical Hacker", issuer: "Cisco", url: "https://www.credly.com/earner/earned/badge/bd1200a7-ce1f-486e-bc68-601dc128b29c", logo: null as string | null },
    { title: "Network Defense", issuer: "Cisco", url: "https://www.credly.com/earner/earned/badge/e51dcdce-0842-4372-9120-47e47162cb1d", logo: null as string | null },
    { title: "Network Security", issuer: "Cisco", url: "https://www.credly.com/earner/earned/badge/d6ec72fa-3a5a-4e55-be83-cd1e51defb37", logo: null as string | null },
    { title: "Programming in Java", issuer: "NPTEL", url: "https://archive.nptel.ac.in/noc/Ecertificate/?q=NPTEL25CS110S305260118210287145", logo: null as string | null },
    { title: "Journey to Cloud: Envisioning Your Solution", issuer: "IBM", url: "https://www.credly.com/badges/ca3fe04f-1bfb-47f7-8356-4d919d3f21da", logo: null as string | null },
  ],

  cvUrl: null as string | null, // e.g. "/cv.pdf" (put the file in /public)
  email: "adriancherian77@gmail.com",
  socials: [
    { label: "GitHub", handle: "ACV07", href: "https://github.com/ACV07" },
    { label: "LinkedIn", handle: "adrian-cherian777", href: "https://www.linkedin.com/in/adrian-cherian777/" },
    { label: "X", handle: "@AdrianCherian", href: "https://x.com/AdrianCherian" },
    { label: "Instagram", handle: "@adrian_cherian_7", href: "https://www.instagram.com/adrian_cherian_7?gwpx=b2wybXFqczFqNjB5" },
  ],
};

// Top menu. "/#name" links scroll to a section of the home page.
export const nav = [
  { label: "Home", href: "/" },
  { label: "About me", href: "/#about" },
  { label: "Experience", href: "/#experience" },
  { label: "Projects", href: "/#projects" },
  { label: "Skills", href: "/#skills" },
  { label: "Milestones", href: "/#milestones" },
  { label: "Certifications", href: "/#certifications" },
  { label: "Contact", href: "/#contact" },
];
