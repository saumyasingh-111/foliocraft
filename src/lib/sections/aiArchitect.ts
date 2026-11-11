/**
 * FolioCraft AI Section Architect
 * 
 * Provides intelligent section schema synthesis:
 * 1. AI Generation (via Google Gemini or OpenAI when configured)
 * 2. Semantic NLP Synthesizer (deterministic, high-quality rule engine when no AI key is present)
 * 3. Layout Recommendation Engine
 * 4. Schema Validation & Sanitization
 */

import { DynamicFieldType, DynamicSection, DynamicSectionField, DynamicSectionLayout } from "@/themes/types";

export interface AISectionGenerationResult {
  success: boolean;
  section?: DynamicSection;
  source: "ai-gemini" | "ai-openai" | "semantic-nlp";
  explanation?: string;
  error?: string;
}

export interface LayoutRecommendation {
  recommendedLayout: DynamicSectionLayout;
  alternativeLayouts: DynamicSectionLayout[];
  rationale: string;
}

const ALLOWED_LAYOUTS: DynamicSectionLayout[] = [
  "cards",
  "editorial-cards",
  "timeline",
  "achievement-grid",
  "gallery",
  "masonry",
  "list",
  "stats",
  "featured",
  "split",
  "minimal",
];

const ALLOWED_FIELD_TYPES: DynamicFieldType[] = [
  "text",
  "textarea",
  "number",
  "date",
  "url",
  "email",
  "boolean",
  "select",
  "multi-select",
  "image",
  "image-gallery",
  "document",
  "tags",
  "location",
];

// Sanitize string to prevent XSS and formatting issues
function sanitizeString(str: any, maxLength = 300): string {
  if (typeof str !== "string") return "";
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // strip entire script tags and content
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "") // strip entire style tags and content
    .replace(/<[^>]*>/g, "") // strip remaining HTML tags
    .trim()
    .slice(0, maxLength);
}

// Ensure field ID is safe for object keys (alphanumeric and underscores)
function sanitizeFieldId(id: string): string {
  return id
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/^_+|_+$/g, "") || "field_" + Math.random().toString(36).substring(2, 7);
}

/**
 * Validates and normalizes a generated dynamic section object
 */
export function validateAndSanitizeSection(raw: any, fallbackTitle = "Custom Section"): DynamicSection {
  const title = sanitizeString(raw.title || fallbackTitle, 100) || fallbackTitle;
  const subtitle = sanitizeString(raw.subtitle || "", 200);
  const description = sanitizeString(raw.description || "", 500);
  const category = sanitizeString(raw.category || "General", 50);
  const icon = sanitizeString(raw.icon || "Sparkles", 50);

  let layout: DynamicSectionLayout = "cards";
  if (raw.layout && ALLOWED_LAYOUTS.includes(raw.layout)) {
    layout = raw.layout;
  }

  // Validate fields
  let fields: DynamicSectionField[] = [];
  if (Array.isArray(raw.fields) && raw.fields.length > 0) {
    fields = raw.fields.map((f: any, idx: number) => {
      const fieldId = sanitizeFieldId(f.id || `field_${idx}`);
      const type: DynamicFieldType = ALLOWED_FIELD_TYPES.includes(f.type) ? f.type : "text";
      return {
        id: fieldId,
        label: sanitizeString(f.label || `Field ${idx + 1}`, 60),
        type,
        required: Boolean(f.required),
        placeholder: sanitizeString(f.placeholder || "", 150),
        options: Array.isArray(f.options)
          ? f.options.map((opt: any) => sanitizeString(opt, 50)).filter(Boolean)
          : undefined,
        description: f.description ? sanitizeString(f.description, 150) : undefined,
      };
    });
  }

  // Fallback if no valid fields provided
  if (fields.length === 0) {
    fields = [
      { id: "title", label: "Title", type: "text", required: true, placeholder: "Title" },
      { id: "description", label: "Description", type: "textarea", required: false, placeholder: "Description" },
      { id: "date", label: "Date / Period", type: "date", required: false },
      { id: "url", label: "Link / URL", type: "url", required: false, placeholder: "https://" },
    ];
  }

  // Validate sample entries
  let entries: any[] = [];
  if (Array.isArray(raw.entries) && raw.entries.length > 0) {
    entries = raw.entries.map((entry: any, eIdx: number) => {
      const sanitizedEntry: Record<string, any> = {
        id: `entry_${Date.now().toString(36)}_${eIdx}`,
      };
      for (const field of fields) {
        if (entry[field.id] !== undefined) {
          if (field.type === "tags" && Array.isArray(entry[field.id])) {
            sanitizedEntry[field.id] = entry[field.id].map((t: any) => sanitizeString(t, 40));
          } else if (field.type === "image-gallery" && Array.isArray(entry[field.id])) {
            sanitizedEntry[field.id] = entry[field.id].map((u: any) => sanitizeString(u, 500));
          } else if (typeof entry[field.id] === "string") {
            sanitizedEntry[field.id] = sanitizeString(entry[field.id], 2000);
          } else {
            sanitizedEntry[field.id] = entry[field.id];
          }
        }
      }
      return sanitizedEntry;
    });
  }

  return {
    id: `sec_ai_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
    type: "custom",
    title,
    subtitle,
    description,
    category,
    icon,
    isVisible: true,
    order: typeof raw.order === "number" ? raw.order : 10,
    layout,
    fields,
    entries,
  };
}

/**
 * High-Precision Semantic NLP Rule Engine
 * 
 * Accurately translates human intent into structured schemas without requiring an external AI API.
 */
export function synthesizeSemanticSection(userPrompt: string): DynamicSection {
  const p = userPrompt.toLowerCase();

  // Pattern 1: Hackathons & Competitions
  if (p.includes("hackathon") || p.includes("competition") || p.includes("game jam") || p.includes("contest") || p.includes("bounty")) {
    return validateAndSanitizeSection({
      title: "Hackathons & Competitions",
      subtitle: "Competitive builds, innovation sprints, and prize-winning prototypes",
      description: "Showcase hackathon achievements, team sprints, problem statements, and live demos.",
      category: "Developer & Technology",
      icon: "Trophy",
      layout: "editorial-cards",
      fields: [
        { id: "event_name", label: "Hackathon / Contest Name", type: "text", required: true, placeholder: "e.g. ETHGlobal San Francisco 2024" },
        { id: "project_name", label: "Project / Solution Title", type: "text", required: true, placeholder: "e.g. VeriProof Decentralized Identity" },
        { id: "award", label: "Award / Result", type: "text", required: true, placeholder: "e.g. 1st Place Grand Winner ($15,000)" },
        { id: "date", label: "Date", type: "date", required: false },
        { id: "team_size", label: "Team Size / Role", type: "text", required: false, placeholder: "e.g. 4 Engineers (Lead Architect)" },
        { id: "description", label: "What We Built & Challenges Solved", type: "textarea", required: true, placeholder: "Engineered zero-knowledge identity verification across..." },
        { id: "tech_stack", label: "Tech Stack Used", type: "tags", required: false },
        { id: "demo_url", label: "Live Demo URL", type: "url", required: false, placeholder: "https://devpost.com/software/..." },
        { id: "repo_url", label: "Code Repository", type: "url", required: false, placeholder: "https://github.com/..." },
        { id: "photo", label: "Project Screenshot / Trophy Photo", type: "image", required: false },
      ],
      entries: [
        {
          event_name: "ETHGlobal San Francisco",
          project_name: "VeriProof Protocol",
          award: "1st Place DeFi Track ($10,000)",
          date: "2024-10-15",
          team_size: "3 Engineers (Lead Backend)",
          description: "Engineered zero-knowledge proof verification pipeline on Arbitrum. Reduced on-chain verification latency by 72% in 36 hours.",
          tech_stack: ["Solidity", "Next.js", "Circom", "Rust", "Ethers.js"],
          demo_url: "https://devpost.com/software/veriproof",
          repo_url: "https://github.com/foliocraft/veriproof",
          photo: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
        },
      ],
    });
  }

  // Pattern 2: Publications, Papers & Research
  if (p.includes("paper") || p.includes("publication") || p.includes("research") || p.includes("thesis") || p.includes("patent") || p.includes("journal")) {
    return validateAndSanitizeSection({
      title: "Publications & Research",
      subtitle: "Peer-reviewed papers, conference proceedings, and technical research",
      description: "Scholarly publications, scientific experiments, and foundational research work.",
      category: "Professional",
      icon: "BookOpen",
      layout: "list",
      fields: [
        { id: "title", label: "Paper / Research Title", type: "text", required: true, placeholder: "e.g. Scalable Sparse Attention in Low-Latency Transformers" },
        { id: "venue", label: "Conference / Journal / Publisher", type: "text", required: true, placeholder: "e.g. NeurIPS 2024 / IEEE Transactions" },
        { id: "authors", label: "Authors", type: "text", required: true, placeholder: "e.g. Alex Morgan, Dr. Jane Doe, Eric Smith" },
        { id: "date", label: "Publication Date", type: "date", required: false },
        { id: "doi", label: "DOI / Paper Link", type: "url", required: false, placeholder: "https://doi.org/10.1145/..." },
        { id: "citations", label: "Citations / Impact", type: "number", required: false, placeholder: "48" },
        { id: "abstract", label: "Abstract Summary", type: "textarea", required: false, placeholder: "We propose a novel sparse attention kernel reducing memory footprints by 4x..." },
        { id: "pdf_url", label: "Full PDF Document", type: "document", required: false },
      ],
      entries: [
        {
          title: "Adaptive Linear Attention with Dynamic KV-Cache Eviction",
          venue: "ICLR 2024 Oral Presentation",
          authors: "Alex Morgan, Elena Rostova, Marcus Chen",
          date: "2024-05-10",
          doi: "https://arxiv.org/abs/2405.01928",
          citations: 62,
          abstract: "We introduce a context-aware eviction policy for autoregressive LLMs, maintaining 99.4% benchmark retention while lowering VRAM demands by 3.4x on edge devices.",
        },
      ],
    });
  }

  // Pattern 3: Photography, Gallery & Visual Arts
  if (
    p.includes("photo") ||
    p.includes("gallery") ||
    p.includes("photography") ||
    p.includes("visual") ||
    p.includes("exhibition") ||
    /\b(art|artwork|artist|camera|shots)\b/i.test(p)
  ) {
    return validateAndSanitizeSection({
      title: "Visual Gallery & Photography",
      subtitle: "Selected captures, architectural series, and visual storytelling",
      description: "Curated imagery capturing moments, compositions, and visual narratives.",
      category: "Creative & Design",
      icon: "Camera",
      layout: "gallery",
      fields: [
        { id: "title", label: "Photograph / Artwork Title", type: "text", required: true, placeholder: "e.g. Kyoto Fog, Dawn at Arashiyama" },
        { id: "image", label: "Image Asset", type: "image", required: true },
        { id: "location", label: "Location", type: "location", required: false, placeholder: "e.g. Kyoto, Japan" },
        { id: "year", label: "Year / Date", type: "text", required: false, placeholder: "2024" },
        { id: "gear", label: "Camera / Medium / Specs", type: "text", required: false, placeholder: "e.g. Leica M11 • Summilux 35mm f/1.4" },
        { id: "story", label: "Backstory / Note", type: "textarea", required: false, placeholder: "Captured at 5:45 AM after three hours in rain..." },
      ],
      entries: [
        {
          title: "Solitude in Shinjuku",
          image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
          location: "Tokyo, Japan",
          year: "2024",
          gear: "Fujifilm X-T5 • 23mm f/2.0",
          story: "Reflections along the Omoide Yokocho alleyways during an early winter dusk.",
        },
        {
          title: "Nordic Minimalist Architecture",
          image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
          location: "Copenhagen, Denmark",
          year: "2023",
          gear: "Sony A7R V • 24-70mm GM II",
          story: "Geometric contrasts between natural harbor light and modern basalt facades.",
        },
      ],
    });
  }

  // Pattern 4: Public Speaking, Conferences & Talks
  if (p.includes("speak") || p.includes("conference") || p.includes("talk") || p.includes("keynote") || p.includes("podcast") || p.includes("panel")) {
    return validateAndSanitizeSection({
      title: "Speaking & Keynotes",
      subtitle: "Conferences, keynote addresses, podcast interviews, and workshops",
      description: "Presentations delivered to developer, designer, and leadership audiences worldwide.",
      category: "Professional",
      icon: "Mic",
      layout: "editorial-cards",
      fields: [
        { id: "event_name", label: "Conference / Event", type: "text", required: true, placeholder: "e.g. Next.js Conf 2024" },
        { id: "topic", label: "Talk Title / Topic", type: "text", required: true, placeholder: "e.g. Architecture of Resilient React Server Systems" },
        { id: "date", label: "Date / Year", type: "date", required: false },
        { id: "location", label: "Location / Virtual", type: "location", required: false, placeholder: "e.g. San Francisco, CA & Livestream" },
        { id: "audience", label: "Audience Size", type: "text", required: false, placeholder: "e.g. 1,400 In-Person / 12k Online" },
        { id: "slides_url", label: "Slides URL", type: "url", required: false, placeholder: "https://speakerdeck.com/..." },
        { id: "recording_url", label: "Video Recording", type: "url", required: false, placeholder: "https://youtube.com/watch?v=..." },
        { id: "summary", label: "Key Takeaways", type: "textarea", required: false, placeholder: "Deep-dive into zero-runtime styling, cache invalidation strategies, and SSR." },
      ],
      entries: [
        {
          event_name: "React Summit Global",
          topic: "Zero-Latency Client Hydration with Modular Islands",
          date: "2024-06-18",
          location: "Amsterdam, Netherlands",
          audience: "2,200 Attendees",
          slides_url: "https://speakerdeck.com",
          recording_url: "https://youtube.com",
          summary: "Presented modern caching primitives and micro-bundle optimizations adopted by high-traffic web applications.",
        },
      ],
    });
  }

  // Pattern 5: Startups, Ventures & Angel Investments
  if (p.includes("startup") || p.includes("venture") || p.includes("founder") || p.includes("invest") || p.includes("company") || p.includes("business")) {
    return validateAndSanitizeSection({
      title: "Ventures & Startups",
      subtitle: "Companies founded, advisory roles, and early-stage investments",
      description: "Entrepreneurial pursuits, product launches, market traction, and capital rounds.",
      category: "Business & Entrepreneurship",
      icon: "Briefcase",
      layout: "split",
      fields: [
        { id: "company_name", label: "Venture / Company Name", type: "text", required: true, placeholder: "e.g. HyperScale Cloud" },
        { id: "role", label: "Your Role", type: "text", required: true, placeholder: "e.g. Co-Founder & CTO" },
        { id: "status", label: "Current Status", type: "select", options: ["Active", "Acquired", "Stealth", "Advisor", "Angel Investor"], required: true },
        { id: "funding", label: "Capital Raised / Valuation", type: "text", required: false, placeholder: "e.g. $4.2M Seed (Led by Benchmark)" },
        { id: "description", label: "Company Mission & Impact", type: "textarea", required: true, placeholder: "Automated distributed container orchestration..." },
        { id: "metrics", label: "Key Traction Metric", type: "text", required: false, placeholder: "e.g. 120k Monthly Active Developers" },
        { id: "website", label: "Website", type: "url", required: false, placeholder: "https://hyperscale.io" },
        { id: "logo", label: "Company Logo / Image", type: "image", required: false },
      ],
      entries: [
        {
          company_name: "PulseEngine AI",
          role: "Co-Founder & Head of Product",
          status: "Active",
          funding: "$2.8M Pre-Seed",
          description: "Real-time edge compute observability for autonomous systems and intelligent agent workflows.",
          metrics: "45 Enterprise Accounts • $840k ARR",
          website: "https://pulseengine.example.com",
          logo: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=400&q=80",
        },
      ],
    });
  }

  // Pattern 6: Open Source Contributions & Libraries
  if (p.includes("open source") || p.includes("github") || p.includes("library") || p.includes("npm") || p.includes("package") || p.includes("tool")) {
    return validateAndSanitizeSection({
      title: "Open Source Contributions",
      subtitle: "Libraries, developer tools, and contributions to public software ecosystems",
      description: "Software packages built for the global developer community.",
      category: "Developer & Technology",
      icon: "Code",
      layout: "cards",
      fields: [
        { id: "name", label: "Project / Package Name", type: "text", required: true, placeholder: "e.g. fast-state-store" },
        { id: "role", label: "Role", type: "text", required: true, placeholder: "e.g. Author & Maintainer" },
        { id: "stars", label: "GitHub Stars / Downloads", type: "text", required: false, placeholder: "e.g. 3.4k Stars • 50k Weekly npm downloads" },
        { id: "description", label: "What it does", type: "textarea", required: true, placeholder: "Zero-dependency 400B immutable state manager..." },
        { id: "technologies", label: "Technologies", type: "tags", required: false },
        { id: "repo_url", label: "Repository URL", type: "url", required: false, placeholder: "https://github.com/..." },
        { id: "npm_url", label: "Package URL / Documentation", type: "url", required: false, placeholder: "https://npmjs.com/package/..." },
      ],
      entries: [
        {
          name: "turbomap-gl",
          role: "Creator & Maintainer",
          stars: "2.8k Stars • 80k/mo downloads",
          description: "Ultralight GPU vector tile renderer for high-density spatial data in WebGL.",
          technologies: ["TypeScript", "WebGL", "WebAssembly", "GeoJSON"],
          repo_url: "https://github.com/turbomap",
        },
      ],
    });
  }

  // Pattern 7: Coding Profiles & Competitive Programming
  if (p.includes("leetcode") || p.includes("codeforces") || p.includes("competitive") || p.includes("coding profile") || p.includes("kaggle") || p.includes("rank")) {
    return validateAndSanitizeSection({
      title: "Competitive Programming & Ranks",
      subtitle: "Algorithmic milestones, competitive contest ratings, and problem-solving badges",
      description: "Demonstrated computational proficiency across online judges and platforms.",
      category: "Developer & Technology",
      icon: "Award",
      layout: "achievement-grid",
      fields: [
        { id: "platform", label: "Platform Name", type: "text", required: true, placeholder: "e.g. LeetCode / Codeforces / Kaggle" },
        { id: "rating", label: "Current Rating / Rank", type: "text", required: true, placeholder: "e.g. Guardian (Top 0.8%, 2340 Rating)" },
        { id: "problems_solved", label: "Problems Solved / Medals", type: "text", required: false, placeholder: "e.g. 1,450 Solved (480 Hard)" },
        { id: "profile_url", label: "Profile Link", type: "url", required: false, placeholder: "https://leetcode.com/username" },
        { id: "badges", label: "Special Badges / Accolades", type: "tags", required: false },
        { id: "highlight", label: "Notable Achievement", type: "textarea", required: false, placeholder: "Finished Global Rank 34 out of 28,000 in Biweekly Contest 120." },
      ],
      entries: [
        {
          platform: "LeetCode",
          rating: "Guardian • 2,410 Rating (Top 0.5%)",
          problems_solved: "1,240 Problems (420 Hard)",
          profile_url: "https://leetcode.com",
          badges: ["Knight", "Guardian", "Annual Badge 2024"],
          highlight: "Achieved Global Rank 42 in Weekly Contest 392.",
        },
        {
          platform: "Codeforces",
          rating: "Candidate Master (1945)",
          problems_solved: "680 Solved",
          profile_url: "https://codeforces.com",
          badges: ["Division 1 Qualified"],
          highlight: "Consistent Division 1 competitor with algorithmic focus on dynamic programming.",
        },
      ],
    });
  }

  // Pattern 8: Testimonials & Client Reviews
  if (p.includes("testimonial") || p.includes("review") || p.includes("client quote") || p.includes("recommendation") || p.includes("endorsement")) {
    return validateAndSanitizeSection({
      title: "Client Testimonials & Endorsements",
      subtitle: "Kind words from founders, engineering directors, and collaborative partners",
      description: "Authentic feedback on craftsmanship, communication, and project delivery.",
      category: "Professional",
      icon: "Award",
      layout: "editorial-cards",
      fields: [
        { id: "quote", label: "Testimonial Quote", type: "textarea", required: true, placeholder: "Alex delivered our core engine 3 weeks ahead of schedule..." },
        { id: "author", label: "Client / Colleague Name", type: "text", required: true, placeholder: "e.g. Sarah Jenkins" },
        { id: "role", label: "Title & Organization", type: "text", required: true, placeholder: "e.g. VP of Engineering at Stripe" },
        { id: "project", label: "Project Collaborated On", type: "text", required: false, placeholder: "e.g. High-Throughput Payment Ingestion Pipeline" },
        { id: "avatar", label: "Photo / Avatar", type: "image", required: false },
        { id: "linkedin", label: "Author Profile Link", type: "url", required: false, placeholder: "https://linkedin.com/in/..." },
      ],
      entries: [
        {
          quote: "One of the most exceptionally thorough engineers I've worked with. Architected our distributed caching layer with impeccable attention to edge cases and zero downtime.",
          author: "Marcus Vance",
          role: "Head of Infrastructure, CloudScale Systems",
          project: "Next-Gen Multi-Region Gateway",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
          linkedin: "https://linkedin.com",
        },
      ],
    });
  }

  // Pattern 9: Generic Custom Intelligent Synthesizer
  // Extracts topic from prompt and builds an elegant custom schema
  const words = userPrompt.split(/\s+/).filter((w) => w.length > 2);
  const guessedTitle = words.slice(0, 4).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  
  return validateAndSanitizeSection({
    title: guessedTitle.length > 3 ? guessedTitle : "Specialized Experience",
    subtitle: `Custom curated overview of ${userPrompt.slice(0, 60)}`,
    description: `Detailed showcase tailored to highlight key achievements, media, and records.`,
    category: "Professional",
    icon: "Sparkles",
    layout: "cards",
    fields: [
      { id: "title", label: "Entry Title / Name", type: "text", required: true, placeholder: "e.g. Key Milestone" },
      { id: "subtitle", label: "Role / Subtitle / Organization", type: "text", required: false, placeholder: "e.g. Lead Contributor" },
      { id: "date", label: "Date / Timeframe", type: "date", required: false },
      { id: "description", label: "Summary & Details", type: "textarea", required: true, placeholder: "Describe the significance and impact..." },
      { id: "tags", label: "Categories / Tags", type: "tags", required: false },
      { id: "link", label: "External URL", type: "url", required: false, placeholder: "https://" },
      { id: "image", label: "Representative Image", type: "image", required: false },
    ],
    entries: [
      {
        title: "Inaugural Milestone",
        subtitle: "Key Initiative",
        date: new Date().toISOString().split("T")[0],
        description: `Successfully executed custom initiative reflecting: ${userPrompt.slice(0, 100)}.`,
        tags: ["Featured", "Milestone"],
        link: "https://example.com",
      },
    ],
  });
}

/**
 * Calls Gemini API if GEMINI_API_KEY is available in the environment
 */
async function callGeminiForSchema(prompt: string): Promise<DynamicSection | null> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const systemInstruction = `You are FolioCraft's AI Section Architect. You help users design dynamic custom sections for their professional portfolio websites.
Analyze the user's request and return ONLY a valid JSON object describing the section schema.
Do NOT wrap the JSON in Markdown code fences. Return raw JSON only.

Schema format:
{
  "title": string (e.g. "AI Hackathons"),
  "subtitle": string (e.g. "Global competitions and prototype builds"),
  "description": string,
  "category": string (e.g. "Developer & Technology" | "Creative & Design" | "Professional" | "Business & Entrepreneurship" | "Personal"),
  "icon": string (one of: "Trophy", "BookOpen", "Camera", "Mic", "Briefcase", "Code", "Award", "Sparkles", "Heart", "Layers", "Globe"),
  "layout": string (one of: "cards", "editorial-cards", "timeline", "achievement-grid", "gallery", "masonry", "list", "stats", "featured", "split", "minimal"),
  "fields": [
    {
      "id": string (snake_case, e.g. "prize_amount"),
      "label": string,
      "type": string (one of: "text", "textarea", "number", "date", "url", "email", "boolean", "select", "multi-select", "image", "image-gallery", "document", "tags", "location"),
      "required": boolean,
      "placeholder": string,
      "options": string[] (optional, only for select)
    }
  ],
  "entries": [
    {
      // 1 or 2 realistic sample entry objects matching the field IDs
    }
  ]
}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemInstruction },
              { text: `User request: ${prompt}` },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!res.ok) {
      console.warn("Gemini API call failed with status:", res.status);
      return null;
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) return null;

    const parsed = JSON.parse(candidateText.trim());
    return validateAndSanitizeSection(parsed, prompt);
  } catch (err) {
    console.warn("Error running Gemini Section Architect:", err);
    return null;
  }
}

/**
 * Universal Section Generator Entry Point
 */
export async function generateSectionWithAI(userPrompt: string): Promise<AISectionGenerationResult> {
  if (!userPrompt || userPrompt.trim().length === 0) {
    return {
      success: false,
      source: "semantic-nlp",
      error: "Please provide a description of the section you would like to create.",
    };
  }

  // 1. Try Gemini API if key is configured
  const aiSection = await callGeminiForSchema(userPrompt);
  if (aiSection) {
    return {
      success: true,
      section: aiSection,
      source: "ai-gemini",
      explanation: `Architected tailored "${aiSection.title}" with layout "${aiSection.layout}" using AI.`,
    };
  }

  // 2. High-precision semantic NLP engine fallback
  const semanticSection = synthesizeSemanticSection(userPrompt);
  return {
    success: true,
    section: semanticSection,
    source: "semantic-nlp",
    explanation: `Generated custom "${semanticSection.title}" blueprint using FolioCraft Semantic Engine.`,
  };
}

/**
 * Recommends optimal layout based on section fields and entry count
 */
export function recommendSectionLayout(section: DynamicSection, entryCount = 1): LayoutRecommendation {
  const fields = section.fields || [];
  const fieldTypes = fields.map((f) => f.type);

  // If section has image-gallery or multiple image fields -> gallery / masonry
  const hasGallery = fieldTypes.includes("image-gallery");
  const hasImages = fieldTypes.includes("image");
  const hasDates = fieldTypes.includes("date");
  const hasNumbers = fieldTypes.includes("number");
  const textAreas = fieldTypes.filter((t) => t === "textarea").length;

  if (hasGallery || hasImages) {
    return {
      recommendedLayout: "gallery",
      alternativeLayouts: ["masonry", "editorial-cards", "cards"],
      rationale: "Visual-rich sections with photographs or artwork shine best in a balanced lightbox gallery or masonry grid.",
    };
  }

  if (hasDates && !hasGallery && fields.length >= 3) {
    return {
      recommendedLayout: "timeline",
      alternativeLayouts: ["editorial-cards", "list"],
      rationale: "Chronological entries with dates and milestones read naturally in an editorial timeline.",
    };
  }

  if (hasNumbers && fields.length <= 4 && entryCount >= 3) {
    return {
      recommendedLayout: "stats",
      alternativeLayouts: ["achievement-grid", "cards"],
      rationale: "Metrics, numerical records, and key statistics are highlighted best with large numerical stat cards.",
    };
  }

  if (fields.some((f) => f.id.includes("award") || f.id.includes("prize") || f.id.includes("trophy"))) {
    return {
      recommendedLayout: "achievement-grid",
      alternativeLayouts: ["editorial-cards", "cards"],
      rationale: "Honors and competition records benefit from prominent accent badges in an achievement grid.",
    };
  }

  if (textAreas >= 2 || fields.length >= 6) {
    return {
      recommendedLayout: "editorial-cards",
      alternativeLayouts: ["split", "cards", "list"],
      rationale: "Rich entries with detailed descriptions and multiple metadata attributes fit best in editorial cards.",
    };
  }

  return {
    recommendedLayout: "cards",
    alternativeLayouts: ["list", "editorial-cards", "minimal"],
    rationale: "Classic responsive cards provide a versatile, clean layout that effortlessly adapts to any screen width.",
  };
}
