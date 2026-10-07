// Single source of truth for every word on the site.
// The old site repeated this across four pages; edit it here once.

const whatsappNumber = "917355366366";

export const whatsappLink = (message?: string) =>
  `https://wa.me/${whatsappNumber}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

export const site = {
  name: "Raghav Puppala",
  url: "https://raghavpuppala.com",
  role: "Financial consultant",
  city: "Hyderabad",
  description:
    "MDRT-qualified financial consultant in Hyderabad. Investments, insurance and retirement planning for families, from an Indian Air Force veteran with 8+ years in practice.",

  contact: {
    phones: [
      { display: "+91 73553 66366", href: "tel:+917355366366" },
      { display: "+91 98494 37374", href: "tel:+919849437374" },
    ],
    email: "hello@raghavpuppala.com",
    days: { short: "Mon - Fri", long: "Monday - Friday" },
    hours: "9 AM - 5 PM",
    demat: "http://p.njw.bz/99909",
  },

  socials: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/raghavpuppala" },
    { label: "Instagram", href: "https://www.instagram.com/raghavpuppala" },
    { label: "Facebook", href: "https://www.facebook.com/raghavpuppala/" },
    { label: "X", href: "https://x.com/raghav366" },
  ],

  portrait: {
    alt: "Raghav Puppala smiling at a café table, in glasses and a navy and white sweater",
  },

  // The credentials band under the hero.
  // `count` makes a value tick up from zero; the rest decode letter by letter.
  credentials: [
    { value: "500+", count: 500, suffix: "+", label: "Client families" },
    { value: "8+", count: 8, suffix: "+", label: "Years in practice" },
    { value: "MDRT", label: "Qualified financial consultant" },
    { value: "IRDAI", label: "Licensed advisor" },
    { value: "AMFI", label: "Registered MF distributor" },
  ],

  hero: {
    headline: ["Your money,", "planned like", "a mission."],
    // The intro, in pieces so the hero can set the name and credentials apart. Two lines:
    // the first ("I'm Raghav Puppala, an Indian Air Force veteran") stays on one line from
    // sm up; on phones the whole sentence wraps naturally.
    lead: [
      [
        { text: "I'm " },
        { text: "Raghav Puppala", as: "name" },
        { text: ", an " },
        { text: "Indian Air Force veteran", as: "strong" },
      ],
      [
        { text: "and " },
        { text: "MDRT-qualified", as: "strong" },
        { text: " financial consultant. I help Hyderabad families invest, insure and retire on schedule." },
      ],
    ],
  },

  flightPlan: [
    {
      title: "Brief",
      body: "We start with your goals, dates, income and what you already own. No products on the table yet.",
    },
    {
      title: "Plan",
      body: "One plan covering what to invest, how much cover you need and when each goal is funded. You see the numbers before you sign anything.",
    },
    {
      title: "Review",
      body: "Markets move and lives change. We check the plan together regularly, and whenever something big happens.",
    },
  ],

  // His appointments with the insurers he advises for (from the old About page).
  affiliations: [
    { org: "HDFC Life", role: "Executive Wealth Planner" },
    { org: "Star Health Insurance", role: "Health Insurance Advisor" },
    { org: "TATA AIG", role: "General Insurance Advisor" },
  ],

  practice: [
    {
      title: "Investments",
      body: "Mutual funds, stocks, IPOs, bonds and savings plans, matched to your goals and time horizon. SIPs set up and reviewed with you, not sold and forgotten.",
      detail: "AMFI-registered mutual fund distributor",
    },
    {
      title: "Insurance",
      body: "Life, health and motor cover sized to what your family actually needs, and nothing it doesn't.",
      detail: "IRDAI-licensed advisor",
    },
    {
      title: "Retirement & goals",
      body: "Pension plans, child education funds and a retirement corpus, so the big milestones are paid for before they arrive.",
      detail: "Planned around your dates, not a product",
    },
  ],

  testimonials: [
    {
      quote:
        "Raghav's expertise in financial consulting has significantly improved my investment strategy and overall financial health.",
      author: "Srikanth MR",
    },
    {
      quote:
        "Raghav's financial advice transformed my investment strategy and helped me achieve my savings goals effectively.",
      author: "Amit Sharma",
    },
    {
      quote: "Thanks to Raghav, my family's insurance needs are well-covered, providing us peace of mind and security.",
      author: "Priya Singh",
    },
  ],

  ventures: [
    {
      id: "adsxcell",
      name: "AdsXcell",
      kicker: "IT & advertising since 2009",
      body: "Bulk SMS and WhatsApp campaigns that put a business's message on thousands of phones at once, and TallyPrime accounting as an authorised Tally partner: new licences, renewals and customisation.",
      // From adsxcell.com: its own client count, and two clients who've written in.
      proof: "500+ businesses and 200+ individuals served, including teams at Panasonic India and D'sire Exhibitions.",
      offerings: ["Bulk SMS", "Bulk WhatsApp", "TallyPrime"],
      cta: { label: "Visit adsxcell.com", href: "https://adsxcell.com" },
      theme: "ads",
    },
    {
      id: "interiors",
      name: "SP Design Studio",
      kicker: "Marketing & lead generation",
      body: "End-to-end interiors by Spandana Puppala, from the first floor plan to a finished home you can walk into and live in. I look after the studio's marketing and lead generation.",
      offerings: ["Turnkey execution", "Space planning & consulting", "Interior styling"],
      cta: { label: "Visit spdesignstudio.in", href: "https://www.spdesignstudio.in/contact" },
      theme: "interiors",
    },
    {
      id: "foundation",
      name: "HridaySpandana Foundation",
      kicker: "Founder",
      body: "The name means the heart's response. Caring for orphans and the elderly through orphanage support, skills training, free medical and education camps, and blood and organ donation drives.",
      offerings: ["Orphanage support", "Health & education camps", "Blood & organ donation"],
      cta: { label: "Visit hridayspandana.org", href: "https://hridayspandana.org" },
      theme: "foundation",
    },
  ],

  footer: {
    tagline: "Planned like a mission.",
    credit: { name: "Abhiraman Kuntimaddi", href: "https://abhiramankuntimaddi.com" },
  },

  disclaimer:
    "Mutual fund investments are subject to market risks; read all scheme related documents carefully. Insurance is the subject matter of solicitation. Past performance is not indicative of future returns.",
} as const;

export type Venture = (typeof site.ventures)[number];
