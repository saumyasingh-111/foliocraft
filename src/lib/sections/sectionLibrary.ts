/**
 * FolioCraft Section Library
 * 
 * Curated collection of ready-to-use dynamic section blueprints
 * organized across 5 core disciplines:
 * - Professional
 * - Developer & Technology
 * - Creative & Design
 * - Business & Entrepreneurship
 * - Personal
 */

import { DynamicSection, DynamicSectionField, DynamicSectionLayout } from "@/themes/types";

export interface SectionBlueprint {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: "Professional" | "Developer & Technology" | "Creative & Design" | "Business & Entrepreneurship" | "Personal";
  iconName: string;
  defaultLayout: DynamicSectionLayout;
  allowedLayouts: DynamicSectionLayout[];
  fields: DynamicSectionField[];
  sampleEntry: Record<string, any>;
}

export const SECTION_CATEGORIES = [
  "Professional",
  "Developer & Technology",
  "Creative & Design",
  "Business & Entrepreneurship",
  "Personal",
] as const;

export const SECTION_LIBRARY: SectionBlueprint[] = [
  // =========================================================================
  // 1. PROFESSIONAL
  // =========================================================================
  {
    id: "publications",
    title: "Publications & Papers",
    subtitle: "Academic papers, peer-reviewed articles, books, and essays",
    description: "Chronicle your written scholarship, research papers, conference proceedings, or editorial articles.",
    category: "Professional",
    iconName: "BookOpen",
    defaultLayout: "list",
    allowedLayouts: ["list", "cards", "editorial-cards", "split"],
    fields: [
      { id: "title", label: "Paper / Article Title", type: "text", required: true, placeholder: "e.g. Distributed Consensus in Asynchronous Byzantine Networks" },
      { id: "authors", label: "Authors / Co-authors", type: "text", required: false, placeholder: "e.g. Alex Morgan, Dr. Jane Doe" },
      { id: "publication", label: "Journal / Conference / Publisher", type: "text", required: true, placeholder: "e.g. ACM SIGCOMM 2024" },
      { id: "date", label: "Date of Publication", type: "date", required: false },
      { id: "abstract", label: "Abstract / Summary", type: "textarea", required: false, placeholder: "Brief summary of the research methodology and key findings..." },
      { id: "doi", label: "DOI / Citation Ref", type: "text", required: false, placeholder: "10.1145/3341302.3342082" },
      { id: "url", label: "Paper URL / PDF Link", type: "url", required: false, placeholder: "https://arxiv.org/abs/..." },
    ],
    sampleEntry: {
      title: "Self-Healing Architecture Patterns in Modern Cloud Systems",
      authors: "Alex Morgan, Elena Rostova",
      publication: "IEEE Transactions on Software Engineering",
      date: "2024-03-15",
      abstract: "An empirical investigation into declarative control planes and automated node reconciliation in multi-cloud Kubernetes architectures.",
      doi: "10.1109/TSE.2024.10892",
      url: "https://example.com/paper.pdf",
    },
  },
  {
    id: "awards",
    title: "Awards & Honors",
    subtitle: "Distinctions, medals, industry recognition, and formal accolades",
    description: "Showcase prestigious awards, competitive rankings, and industry prizes.",
    category: "Professional",
    iconName: "Trophy",
    defaultLayout: "achievement-grid",
    allowedLayouts: ["achievement-grid", "cards", "editorial-cards", "timeline"],
    fields: [
      { id: "awardName", label: "Award Name", type: "text", required: true, placeholder: "e.g. Red Dot Best of the Best" },
      { id: "issuer", label: "Awarding Organization", type: "text", required: true, placeholder: "e.g. Design Zentrum Nordrhein Westfalen" },
      { id: "year", label: "Year Received", type: "text", required: true, placeholder: "e.g. 2023" },
      { id: "category", label: "Competition Category", type: "text", required: false, placeholder: "e.g. Product Design & Systems" },
      { id: "description", label: "Citation / Description", type: "textarea", required: false, placeholder: "Awarded for outstanding innovation in accessible user experience..." },
      { id: "certificateUrl", label: "Certificate / Verification Link", type: "url", required: false, placeholder: "https://..." },
    ],
    sampleEntry: {
      awardName: "International Design Excellence Gold",
      issuer: "Industrial Designers Society of America (IDSA)",
      year: "2023",
      category: "Digital Design & Human Factors",
      description: "Recognized among 2,000+ entries for breakthrough simplicity in complex spatial design workflows.",
      certificateUrl: "https://example.com/award-verification",
    },
  },
  {
    id: "volunteer",
    title: "Volunteer & Non-Profit Work",
    subtitle: "Pro-bono initiatives, humanitarian efforts, and community service",
    description: "Highlight your dedication to civic engagement, mentorship, and non-profit missions.",
    category: "Professional",
    iconName: "HeartHandshake",
    defaultLayout: "cards",
    allowedLayouts: ["cards", "timeline", "minimal"],
    fields: [
      { id: "organization", label: "Non-Profit Organization", type: "text", required: true, placeholder: "e.g. Code for America" },
      { id: "role", label: "Volunteer Role", type: "text", required: true, placeholder: "e.g. Lead Technical Mentor" },
      { id: "period", label: "Timeframe / Years", type: "text", required: false, placeholder: "2021 — Present" },
      { id: "cause", label: "Cause / Focus Area", type: "text", required: false, placeholder: "STEM Education & Youth Literacy" },
      { id: "description", label: "Impact & Initiatives", type: "textarea", required: false, placeholder: "Mentored 40+ high school students through introductory algorithms..." },
      { id: "websiteUrl", label: "Organization Website", type: "url", required: false, placeholder: "https://..." },
    ],
    sampleEntry: {
      organization: "Tech4Good Community Labs",
      role: "Pro Bono Frontend Advisor",
      period: "2022 — Present",
      cause: "Digital Accessibility in Civic Tech",
      description: "Guided open-source volunteer engineers improving WCAG 2.1 AAA accessibility benchmarks across civic voter toolkits.",
      websiteUrl: "https://example.org",
    },
  },
  {
    id: "leadership",
    title: "Leadership & Advisory Boards",
    subtitle: "Board positions, steering committees, and advisory appointments",
    description: "Display executive appointments, advisory roles, and governance contributions.",
    category: "Professional",
    iconName: "Shield",
    defaultLayout: "editorial-cards",
    allowedLayouts: ["editorial-cards", "cards", "list"],
    fields: [
      { id: "organization", label: "Company / Foundation", type: "text", required: true, placeholder: "e.g. Open Web Foundation" },
      { id: "position", label: "Leadership Title", type: "text", required: true, placeholder: "e.g. Member of the Technical Advisory Board" },
      { id: "term", label: "Term of Service", type: "text", required: false, placeholder: "2022 — 2025" },
      { id: "focus", label: "Strategic Focus", type: "text", required: false, placeholder: "Open Standards & Protocol Security" },
      { id: "description", label: "Key Contributions & Governance", type: "textarea", required: false },
    ],
    sampleEntry: {
      organization: "NextGen Creative Initiative",
      position: "Advisory Board Member",
      term: "2023 — Present",
      focus: "Emerging Design Technologies",
      description: "Advising the executive director on grants distribution, annual design symposia, and university partnerships.",
    },
  },

  // =========================================================================
  // 2. DEVELOPER & TECHNOLOGY
  // =========================================================================
  {
    id: "hackathons",
    title: "Hackathons & Competitions",
    subtitle: "Competitive prototyping, hackathons, and algorithmic challenges",
    description: "Showcase hackathon victories, fast-paced prototypes, team collaborators, and event photographs.",
    category: "Developer & Technology",
    iconName: "Sparkles",
    defaultLayout: "achievement-grid",
    allowedLayouts: ["achievement-grid", "cards", "editorial-cards", "timeline"],
    fields: [
      { id: "eventName", label: "Hackathon Name", type: "text", required: true, placeholder: "e.g. MIT HackMIT 2024" },
      { id: "organizer", label: "Organizer / University", type: "text", required: false, placeholder: "e.g. Massachusetts Institute of Technology" },
      { id: "position", label: "Position / Award Won", type: "text", required: true, placeholder: "e.g. 1st Place Overall ($10,000 Grand Prize)" },
      { id: "projectName", label: "Built Project Name", type: "text", required: false, placeholder: "e.g. NeuroFlow AI" },
      { id: "date", label: "Date", type: "text", required: false, placeholder: "October 2024" },
      { id: "description", label: "Project & Challenge Summary", type: "textarea", required: false, placeholder: "Built a real-time brain-computer interface stream using WebGPU and WebSockets in 36 hours..." },
      { id: "technologies", label: "Technologies Used", type: "tags", required: false, placeholder: "Python, WebGPU, Rust, Next.js" },
      { id: "team", label: "Team Members", type: "text", required: false, placeholder: "e.g. Alex Morgan, Sam Chen, Priya Patel" },
      { id: "photos", label: "Event Photos", type: "image-gallery", required: false },
      { id: "projectUrl", label: "Live Project / Devpost Link", type: "url", required: false, placeholder: "https://devpost.com/software/..." },
      { id: "repoUrl", label: "GitHub Repository", type: "url", required: false, placeholder: "https://github.com/..." },
    ],
    sampleEntry: {
      eventName: "HackMIT 2024",
      organizer: "MIT TechX",
      position: "1st Place Grand Winner",
      projectName: "SynapseAI",
      date: "Fall 2024",
      description: "Tackled non-invasive neuromorphic signal decoding by training an edge-computing transformer model in under 36 hours.",
      technologies: ["Python", "Rust", "WebAssembly", "TypeScript", "Tailwind CSS"],
      team: "Alex Morgan (Lead), David Lin, Sarah Vance",
      photos: [
        { url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1000&q=80", caption: "Pitching on the main stage to judges" },
      ],
      projectUrl: "https://devpost.com/software/synapse-ai",
      repoUrl: "https://github.com/example/synapse-ai",
    },
  },
  {
    id: "opensource",
    title: "Open Source Contributions",
    subtitle: "Public repositories, open-source packages, and library maintenance",
    description: "Highlight packages you maintain, significant PRs merged into major libraries, and ecosystem contributions.",
    category: "Developer & Technology",
    iconName: "GitPullRequest",
    defaultLayout: "cards",
    allowedLayouts: ["cards", "editorial-cards", "list"],
    fields: [
      { id: "repoName", label: "Repository / Package Name", type: "text", required: true, placeholder: "e.g. vercel/next.js or my-org/fast-cache" },
      { id: "role", label: "Role / Contribution Scope", type: "text", required: true, placeholder: "Core Maintainer / Feature Author / Contributor" },
      { id: "stars", label: "GitHub Stars / Downloads", type: "text", required: false, placeholder: "e.g. 14.5k stars • 250k downloads/mo" },
      { id: "description", label: "Summary of Contributions", type: "textarea", required: false, placeholder: "Authored streaming SSR chunk optimizer reducing TTFB by 28%..." },
      { id: "technologies", label: "Core Stack", type: "tags", required: false, placeholder: "TypeScript, Rust, Turbo" },
      { id: "repoUrl", label: "Repository Link", type: "url", required: true, placeholder: "https://github.com/..." },
      { id: "prUrl", label: "Featured PR / Release Link", type: "url", required: false, placeholder: "https://github.com/.../pull/..." },
    ],
    sampleEntry: {
      repoName: "hyper-router-v2",
      role: "Creator & Lead Maintainer",
      stars: "3.2k stars • 85k npm dl/mo",
      description: "A ultra-lightweight zero-dependency router engine for isomorphic TypeScript runtimes (Node, Bun, Cloudflare Workers).",
      technologies: ["TypeScript", "Web Standards", "Vite", "Bun"],
      repoUrl: "https://github.com/example/hyper-router",
      prUrl: "https://github.com/example/hyper-router/releases/tag/v2.0",
    },
  },
  {
    id: "codingprofiles",
    title: "Competitive Coding & Benchmarks",
    subtitle: "Algorithmic ranks, LeetCode, Codeforces, Kaggle, and benchmarks",
    description: "Display your competitive programming ratings, global percentiles, and problem solving statistics.",
    category: "Developer & Technology",
    iconName: "Code2",
    defaultLayout: "stats",
    allowedLayouts: ["stats", "cards", "minimal"],
    fields: [
      { id: "platform", label: "Platform Name", type: "text", required: true, placeholder: "e.g. LeetCode / Codeforces / Kaggle" },
      { id: "handle", label: "Username / Handle", type: "text", required: true, placeholder: "e.g. @alex_algorithms" },
      { id: "rating", label: "Current Rating / Rank", type: "text", required: true, placeholder: "e.g. 2,240 (Knight) • Top 0.8%" },
      { id: "solved", label: "Problems Solved / Medals", type: "text", required: false, placeholder: "e.g. 1,450+ Solved • 4 Contest Gold Medals" },
      { id: "profileUrl", label: "Public Profile Link", type: "url", required: true, placeholder: "https://leetcode.com/u/..." },
    ],
    sampleEntry: {
      platform: "LeetCode",
      handle: "alex_morgan",
      rating: "2,284 Rating (Guardian) — Top 0.6% Globally",
      solved: "1,240 Problems Solved (420 Hard)",
      profileUrl: "https://leetcode.com",
    },
  },

  // =========================================================================
  // 3. CREATIVE & DESIGN
  // =========================================================================
  {
    id: "casestudies",
    title: "Design Case Studies",
    subtitle: "In-depth design breakdowns, user research, and product narratives",
    description: "Deep dive into product challenges, design iterations, user research insights, and final deliverables.",
    category: "Creative & Design",
    iconName: "Layers",
    defaultLayout: "editorial-cards",
    allowedLayouts: ["editorial-cards", "split", "cards", "featured"],
    fields: [
      { id: "title", label: "Case Study Title", type: "text", required: true, placeholder: "e.g. Redesigning Healthcare Onboarding for 3M Patients" },
      { id: "client", label: "Client / Company", type: "text", required: true, placeholder: "e.g. Vitalis Health" },
      { id: "role", label: "Your Role", type: "text", required: false, placeholder: "e.g. Lead Product Designer & User Researcher" },
      { id: "timeframe", label: "Duration", type: "text", required: false, placeholder: "6 Months • 2023" },
      { id: "challenge", label: "The Problem / Challenge", type: "textarea", required: false, placeholder: "Patients dropped off at a 42% rate during initial insurance verification..." },
      { id: "solution", label: "The Solution & Design Approach", type: "textarea", required: false, placeholder: "Redesigned cognitive steps into a progressive disclosure model with micro-confirmations..." },
      { id: "impact", label: "Measured Impact / Results", type: "text", required: false, placeholder: "e.g. Drop-off reduced by 64%, NPS jumped from 32 to 74" },
      { id: "coverImage", label: "Cover Artwork / Mockup", type: "image", required: false },
      { id: "caseStudyUrl", label: "Full Case Study / Prototype Link", type: "url", required: false, placeholder: "https://..." },
    ],
    sampleEntry: {
      title: "Reimagining the Financial Terminal for Independent Advisors",
      client: "Meridian Wealth Systems",
      role: "Principal Interaction Designer",
      timeframe: "Q1 — Q3 2024",
      challenge: "Legacy desktop terminals were cluttered with 140+ unprioritized financial data tables, requiring 3 weeks of staff onboarding.",
      solution: "Created an adaptive workspace architecture that clusters portfolio volatility, rebalancing triggers, and client alerts contextually.",
      impact: "Reduced routine rebalancing workflow time from 45 minutes to 7 minutes.",
      coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
      caseStudyUrl: "https://example.com/case-study",
    },
  },
  {
    id: "photography",
    title: "Photography & Visual Archives",
    subtitle: "High-resolution photo series, street, architecture, and portraiture",
    description: "Curate photo series with camera specs, locations, and multi-photo masonry grids.",
    category: "Creative & Design",
    iconName: "Camera",
    defaultLayout: "masonry",
    allowedLayouts: ["masonry", "gallery", "cards", "split"],
    fields: [
      { id: "seriesTitle", label: "Series / Collection Title", type: "text", required: true, placeholder: "e.g. Tokyo Midnight: Geometry of Rain" },
      { id: "location", label: "Location / Setting", type: "text", required: false, placeholder: "e.g. Shinjuku & Ginza, Tokyo" },
      { id: "year", label: "Year / Date", type: "text", required: false, placeholder: "e.g. 2024" },
      { id: "gear", label: "Camera & Lens Gear", type: "text", required: false, placeholder: "e.g. Leica M11 • Summicron 35mm f/2" },
      { id: "description", label: "Artist Statement / Series Description", type: "textarea", required: false, placeholder: "Exploring the dialogue between artificial neon reflections and architectural stone..." },
      { id: "photos", label: "Photographs in Collection", type: "image-gallery", required: true },
    ],
    sampleEntry: {
      seriesTitle: "Monoliths in the Fog: Pacific Coastlines",
      location: "Big Sur & Mendocino, California",
      year: "2024",
      gear: "Hasselblad 907X 50C • 45mm f/4",
      description: "A continuous study of coastal geology enduring marine fog layers at daybreak.",
      photos: [
        { url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80", caption: "Point Lobos at 05:40 AM" },
        { url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80", caption: "Granite shelves receding into maritime mist" },
      ],
    },
  },

  // =========================================================================
  // 4. BUSINESS & ENTREPRENEURSHIP
  // =========================================================================
  {
    id: "startups",
    title: "Startups & Ventures",
    subtitle: "Founded companies, incubated products, and entrepreneurial ventures",
    description: "Highlight ventures you co-founded, funding milestones, business models, and product traction.",
    category: "Business & Entrepreneurship",
    iconName: "Rocket",
    defaultLayout: "featured",
    allowedLayouts: ["featured", "cards", "editorial-cards", "stats"],
    fields: [
      { id: "companyName", label: "Company / Venture Name", type: "text", required: true, placeholder: "e.g. OmniFlow Technologies" },
      { id: "role", label: "Your Role / Capacity", type: "text", required: true, placeholder: "e.g. Co-founder & Chief Product Officer" },
      { id: "status", label: "Status / Stage", type: "text", required: false, placeholder: "e.g. Series A ($12M raised) / Acquired" },
      { id: "period", label: "Active Period", type: "text", required: false, placeholder: "2021 — 2024" },
      { id: "tagline", label: "One-line Value Proposition", type: "text", required: true, placeholder: "e.g. Automated reconciliation for modern enterprise logistics" },
      { id: "description", label: "Overview & Growth Trajectory", type: "textarea", required: false, placeholder: "Scaled from zero to $4.2M ARR across 85 enterprise accounts..." },
      { id: "metrics", label: "Key Metrics (comma-separated)", type: "tags", required: false, placeholder: "4.2M ARR, 85 Enterprise Logos, 99.98% SLA" },
      { id: "websiteUrl", label: "Company Website", type: "url", required: false, placeholder: "https://..." },
      { id: "logoUrl", label: "Venture Logo / Cover", type: "image", required: false },
    ],
    sampleEntry: {
      companyName: "KiteSync",
      role: "Co-Founder & Head of Product",
      status: "Acquired by Stripe in 2023",
      period: "2020 — 2023",
      tagline: "Instant cross-border treasury infrastructure for software exporters.",
      description: "Bootstrapped from dorm room to processing $180M annualized volume before being acquired.",
      metrics: ["$180M Vol", "12,000 Merchants", "Acquired 2023"],
      websiteUrl: "https://example.com",
      logoUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80",
    },
  },
  {
    id: "speaking",
    title: "Speaking & Keynotes",
    subtitle: "Keynotes, panel discussions, podcast appearances, and lectures",
    description: "Chronicle your public speaking appearances, slide decks, topics, and event recordings.",
    category: "Business & Entrepreneurship",
    iconName: "Mic",
    defaultLayout: "cards",
    allowedLayouts: ["cards", "list", "timeline", "editorial-cards"],
    fields: [
      { id: "eventName", label: "Conference / Event Name", type: "text", required: true, placeholder: "e.g. Config 2024 by Figma" },
      { id: "topic", label: "Talk Title / Topic", type: "text", required: true, placeholder: "e.g. The Architecture of Calm Interfaces" },
      { id: "date", label: "Event Date", type: "text", required: false, placeholder: "June 2024" },
      { id: "location", label: "Venue & City", type: "text", required: false, placeholder: "Moscone Center, San Francisco & Online" },
      { id: "audience", label: "Audience Size", type: "text", required: false, placeholder: "e.g. 4,500 In-Person • 35k Virtual" },
      { id: "description", label: "Summary & Takeaways", type: "textarea", required: false, placeholder: "Keynote exploring how density reduction in interface tokens prevents user burnout..." },
      { id: "videoUrl", label: "Recording / YouTube Link", type: "url", required: false, placeholder: "https://youtube.com/watch?v=..." },
      { id: "slidesUrl", label: "Slide Deck Link", type: "url", required: false, placeholder: "https://speakerdeck.com/..." },
      { id: "photo", label: "Stage Photograph", type: "image", required: false },
    ],
    sampleEntry: {
      eventName: "Design Matters Tokyo",
      topic: "Typography as an Architectural Foundation",
      date: "September 2024",
      location: "Toranomon Hills Forum, Tokyo",
      audience: "800 Designers & Engineers",
      description: "A 45-minute keynote examining the relationship between physical Japanese joinery and digital responsive grid systems.",
      videoUrl: "https://youtube.com",
      slidesUrl: "https://speakerdeck.com",
      photo: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1000&q=80",
    },
  },

  // =========================================================================
  // 5. PERSONAL
  // =========================================================================
  {
    id: "readinglist",
    title: "Reading List & Library",
    subtitle: "Influential books, essays, monographs, and reading recommendations",
    description: "Share the literary works, technical manuals, and philosophical essays that shape your thinking.",
    category: "Personal",
    iconName: "BookMarked",
    defaultLayout: "cards",
    allowedLayouts: ["cards", "list", "minimal"],
    fields: [
      { id: "bookTitle", label: "Book Title", type: "text", required: true, placeholder: "e.g. The Design of Everyday Things" },
      { id: "author", label: "Author", type: "text", required: true, placeholder: "e.g. Don Norman" },
      { id: "category", label: "Genre / Subject", type: "text", required: false, placeholder: "e.g. Cognitive Science & Design" },
      { id: "takeaway", label: "Personal Reflection / Core Takeaway", type: "textarea", required: false, placeholder: "Changed how I view mental models and affordances..." },
      { id: "rating", label: "Rating / Recommendation", type: "text", required: false, placeholder: "★★★★★ (Must Read)" },
      { id: "link", label: "Goodreads / Purchase Link", type: "url", required: false, placeholder: "https://..." },
    ],
    sampleEntry: {
      bookTitle: "A Pattern Language: Towns, Buildings, Construction",
      author: "Christopher Alexander et al.",
      category: "Architectural Theory & Systems",
      takeaway: "The foundation of modern modular design systems. Teaches that patterns are living solutions to human tensions in physical space.",
      rating: "★★★★★ (Essential)",
      link: "https://goodreads.com",
    },
  },
  {
    id: "interests",
    title: "Interests & Pursuits",
    subtitle: "Personal passions, creative side-quests, sports, and crafts",
    description: "Give recruiters and visitors a multidimensional glimpse of your personality and weekend pursuits.",
    category: "Personal",
    iconName: "Compass",
    defaultLayout: "cards",
    allowedLayouts: ["cards", "minimal", "gallery"],
    fields: [
      { id: "name", label: "Passion / Pursuit Name", type: "text", required: true, placeholder: "e.g. Traditional Joinery & Woodworking" },
      { id: "focus", label: "Specialty / Style", type: "text", required: false, placeholder: "e.g. Japanese Hand-Tool Joinery (Kumiko)" },
      { id: "experience", label: "Years Practicing", type: "text", required: false, placeholder: "e.g. 6 Years" },
      { id: "description", label: "Why it matters to you", type: "textarea", required: false, placeholder: "Working with hand planes demands total presence and physical feedback..." },
      { id: "photo", label: "Photograph / Artifact", type: "image", required: false },
    ],
    sampleEntry: {
      name: "Specialty Coffee Roasting & Pour-Over",
      focus: "Light-roast single origin Ethiopian & Panamanian varietals",
      experience: "5 Years",
      description: "The intersection of chemistry, extraction thermodynamics, and quiet morning ritual.",
      photo: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
    },
  },
];

/**
 * Helper to convert a Blueprint into a dynamic portfolio section instance
 */
export function createSectionFromBlueprint(blueprint: SectionBlueprint, order = 10): DynamicSection {
  const instanceId = `sec_${blueprint.id}_${Date.now().toString(36)}`;
  return {
    id: instanceId,
    type: "custom",
    title: blueprint.title,
    subtitle: blueprint.subtitle,
    description: blueprint.description,
    category: blueprint.category,
    icon: blueprint.iconName,
    isVisible: true,
    order,
    layout: blueprint.defaultLayout,
    fields: blueprint.fields.map((f) => ({ ...f })),
    entries: blueprint.sampleEntry
      ? [{ id: `entry_${Date.now().toString(36)}_0`, ...blueprint.sampleEntry }]
      : [],
  };
}
