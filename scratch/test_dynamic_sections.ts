/**
 * Comprehensive Dynamic Section System Test Suite
 * 
 * Verifies:
 * - Test A: Hackathons blueprint & custom schema creation
 * - Test B: Publications blueprint & academic schema
 * - Test C: Photography gallery & media fields
 * - Test D: Custom section with arbitrary fields
 * - Test E: AI Architect / Semantic Synthesizer
 * - Test F: Firestore persistence & data normalization
 * - Test G: Security sanitization (XSS injection prevention)
 */

import { SECTION_LIBRARY, createSectionFromBlueprint } from "../src/lib/sections/sectionLibrary";
import { synthesizeSemanticSection, validateAndSanitizeSection, recommendSectionLayout } from "../src/lib/sections/aiArchitect";
import { normalizePortfolioData } from "../src/lib/firebase/firestore";
import { INITIAL_DEFAULT_PORTFOLIO } from "../src/lib/utils/defaults";
import { DynamicSection } from "../src/themes/types";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

async function runTests() {
  console.log("=== STARTING DYNAMIC SECTION SYSTEM TEST SUITE ===\n");

  // -------------------------------------------------------------
  // Test A: Blueprint Library Verification
  // -------------------------------------------------------------
  console.log("--- 1. SECTION BLUEPRINTS ---");
  assert(SECTION_LIBRARY.length >= 10, `Library has ${SECTION_LIBRARY.length} blueprints (>=10 required)`);

  const hackathonBp = SECTION_LIBRARY.find((b) => b.id === "hackathons");
  assert(!!hackathonBp, "Hackathons blueprint found in library");
  if (hackathonBp) {
    const sec = createSectionFromBlueprint(hackathonBp, 1);
    assert(sec.title === "Hackathons & Competitions", "Blueprint converted to section instance");
    assert(sec.entries.length === 1, "Seeded with sample entry");
    assert(sec.entries[0].eventName === "HackMIT 2024", "Sample entry contains event details");
  }

  const publicationsBp = SECTION_LIBRARY.find((b) => b.id === "publications");
  assert(!!publicationsBp, "Publications blueprint found in library");

  const photographyBp = SECTION_LIBRARY.find((b) => b.id === "photography");
  assert(!!photographyBp, "Photography blueprint found in library");

  // -------------------------------------------------------------
  // Test B: Semantic NLP Section Architect (Without External API Key)
  // -------------------------------------------------------------
  console.log("\n--- 2. SEMANTIC NLP SECTION ARCHITECT ---");

  // Hackathon Prompt
  const hackathonAI = synthesizeSemanticSection("I want a section for my AI Hackathons with devpost links, team size, and prize money");
  assert(hackathonAI.title.toLowerCase().includes("hackathon"), `AI generated hackathon title: ${hackathonAI.title}`);
  assert(hackathonAI.layout === "editorial-cards", `AI selected layout: ${hackathonAI.layout}`);
  assert(hackathonAI.fields.some((f) => f.id === "event_name"), "Generated event_name field");
  assert(hackathonAI.fields.some((f) => f.id === "award"), "Generated award field");
  assert(hackathonAI.entries.length > 0, "Generated realistic sample entries");

  // Publications Prompt
  const pubAI = synthesizeSemanticSection("I want to showcase my academic research papers, journals, citation count, and DOI links");
  assert(pubAI.title.toLowerCase().includes("publication") || pubAI.title.toLowerCase().includes("research"), `AI generated publication title: ${pubAI.title}`);
  assert(pubAI.layout === "list", `AI selected list layout for papers: ${pubAI.layout}`);
  assert(pubAI.fields.some((f) => f.id === "citations"), "Generated citations field");

  // Photography Prompt
  const photoAI = synthesizeSemanticSection("I need a photo gallery for my architectural photography and camera gear specs");
  assert(photoAI.title.toLowerCase().includes("gallery") || photoAI.title.toLowerCase().includes("photo"), `AI generated photo title: ${photoAI.title}`);
  assert(photoAI.layout === "gallery", `AI selected gallery layout: ${photoAI.layout}`);
  assert(photoAI.fields.some((f) => f.type === "image"), "Generated image field");

  // Startups Prompt
  const startupAI = synthesizeSemanticSection("Showcase my founded startups, venture capital funding, ARR, and investor metrics");
  assert(startupAI.title.toLowerCase().includes("venture") || startupAI.title.toLowerCase().includes("startup"), `AI generated startup title: ${startupAI.title}`);

  // -------------------------------------------------------------
  // Test C: Layout Recommendation Engine
  // -------------------------------------------------------------
  console.log("\n--- 3. LAYOUT RECOMMENDATION ENGINE ---");
  const recGallery = recommendSectionLayout(photoAI);
  assert(recGallery.recommendedLayout === "gallery", "Gallery layout recommended for photo-rich sections");

  const recTimeline = recommendSectionLayout({
    id: "sec_timeline",
    title: "Career Journey",
    isVisible: true,
    order: 1,
    layout: "cards",
    fields: [
      { id: "title", label: "Milestone", type: "text" },
      { id: "date", label: "Date", type: "date" },
      { id: "description", label: "Details", type: "textarea" },
    ],
    entries: [],
  });
  assert(recTimeline.recommendedLayout === "timeline", "Timeline layout recommended for chronological date fields");

  // -------------------------------------------------------------
  // Test D: Security & Sanitization
  // -------------------------------------------------------------
  console.log("\n--- 4. SECURITY & SANITIZATION ---");
  const maliciousInput = {
    title: "<script>alert('xss')</script>Hackathon Wins",
    subtitle: "<img src=x onerror=alert(1)>Subtitle",
    layout: "invalid-layout",
    fields: [
      { id: "bad.field!@#", label: "<b>Dangerous</b>", type: "unknown-type" },
    ],
    entries: [
      { "bad_field": "<script>evil()</script>Safe Content" },
    ],
  };

  const sanitized = validateAndSanitizeSection(maliciousInput);
  assert(!sanitized.title.includes("<script>"), "Stripped <script> tag from title");
  assert(sanitized.title === "Hackathon Wins", `Title cleanly preserved: "${sanitized.title}"`);
  assert(!sanitized.subtitle?.includes("<img"), "Stripped <img> tag from subtitle");
  assert(sanitized.layout === "cards", "Fell back to valid layout for invalid input");
  assert(sanitized.fields[0].id === "bad_field", `Sanitized field ID: "${sanitized.fields[0].id}"`);
  assert(sanitized.fields[0].label === "Dangerous", `Sanitized field label: "${sanitized.fields[0].label}"`);
  assert(sanitized.fields[0].type === "text", "Fell back to valid field type for unknown type");

  // -------------------------------------------------------------
  // Test E: Data Normalization & Firestore Compatibility
  // -------------------------------------------------------------
  console.log("\n--- 5. FIRESTORE PERSISTENCE & NORMALIZATION ---");
  const samplePortfolio = {
    ...INITIAL_DEFAULT_PORTFOLIO,
    dynamicSections: [hackathonAI, pubAI, photoAI],
  };

  const normalized = normalizePortfolioData(samplePortfolio);
  assert(Array.isArray(normalized.dynamicSections), "Normalized portfolio contains dynamicSections array");
  assert(normalized.dynamicSections!.length === 3, `Preserved all 3 dynamic sections (${normalized.dynamicSections?.length})`);
  assert(normalized.dynamicSections![0].title === hackathonAI.title, "First dynamic section title preserved");

  // Ensure backward compatibility with existing legacy portfolio without dynamicSections
  const legacyPortfolio = {
    ...INITIAL_DEFAULT_PORTFOLIO,
    dynamicSections: undefined,
  };
  const normalizedLegacy = normalizePortfolioData(legacyPortfolio);
  assert(Array.isArray(normalizedLegacy.dynamicSections), "Legacy portfolio normalized with empty array for dynamicSections");
  assert(normalizedLegacy.dynamicSections!.length === 0, "Empty dynamicSections array initialized");

  console.log("\n=======================================================");
  console.log("🎉 ALL TESTS PASSED SUCCESSFULLY!");
  console.log("=======================================================\n");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
