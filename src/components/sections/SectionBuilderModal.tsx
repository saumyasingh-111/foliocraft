"use client";

import React, { useState } from "react";
import {
  DynamicSection,
  DynamicSectionField,
  DynamicSectionLayout,
  DynamicFieldType,
} from "@/themes/types";
import {
  SECTION_LIBRARY,
  SECTION_CATEGORIES,
  createSectionFromBlueprint,
  SectionBlueprint,
} from "@/lib/sections/sectionLibrary";
import {
  X,
  Sparkles,
  BookOpen,
  LayoutGrid,
  Wand2,
  Plus,
  Trash2,
  Check,
  Search,
  Trophy,
  Camera,
  Mic,
  Briefcase,
  Code,
  Award,
  Heart,
  Layers,
  Globe,
  Loader2,
  ArrowRight,
  HelpCircle,
} from "lucide-react";

interface SectionBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSection: (section: DynamicSection) => void;
  currentSectionsCount?: number;
}

const ICON_OPTIONS = [
  { name: "Sparkles", icon: Sparkles },
  { name: "Trophy", icon: Trophy },
  { name: "Code", icon: Code },
  { name: "Camera", icon: Camera },
  { name: "BookOpen", icon: BookOpen },
  { name: "Mic", icon: Mic },
  { name: "Briefcase", icon: Briefcase },
  { name: "Award", icon: Award },
  { name: "Layers", icon: Layers },
  { name: "Globe", icon: Globe },
  { name: "Heart", icon: Heart },
];

const LAYOUT_OPTIONS: { id: DynamicSectionLayout; label: string; desc: string }[] = [
  { id: "cards", label: "Grid Cards", desc: "Balanced responsive 3-column cards" },
  { id: "editorial-cards", label: "Editorial Cards", desc: "Elevated magazine-style rich cards" },
  { id: "timeline", label: "Timeline", desc: "Vertical chronological milestone trail" },
  { id: "achievement-grid", label: "Achievement Grid", desc: "Trophies, prizes, and contest ranks" },
  { id: "gallery", label: "Lightbox Gallery", desc: "Visual photography & image showcase" },
  { id: "masonry", label: "Masonry", desc: "Staggered cards of mixed heights" },
  { id: "list", label: "Minimal List", desc: "Clean horizontal rows for publications/articles" },
  { id: "stats", label: "Metrics & Stats", desc: "Large numbers with descriptive labels" },
  { id: "featured", label: "Featured Spotlight", desc: "Hero top card with secondary grid" },
  { id: "split", label: "50/50 Split", desc: "Side-by-side title/media and description" },
  { id: "minimal", label: "Ultra Minimal", desc: "Whitespace-driven typography layout" },
];

const FIELD_TYPES: { id: DynamicFieldType; label: string }[] = [
  { id: "text", label: "Short Text" },
  { id: "textarea", label: "Long Description" },
  { id: "date", label: "Date / Timeframe" },
  { id: "number", label: "Number / Metric" },
  { id: "url", label: "Link / URL" },
  { id: "email", label: "Email Address" },
  { id: "tags", label: "Tags / Technologies" },
  { id: "location", label: "Location" },
  { id: "select", label: "Dropdown Select" },
  { id: "image", label: "Single Image" },
  { id: "image-gallery", label: "Image Gallery" },
  { id: "document", label: "Document / PDF" },
  { id: "boolean", label: "Toggle / Boolean" },
];

const PROMPT_SUGGESTIONS = [
  "AI Hackathons with prize money, team role, project screenshots, and devpost links",
  "Scholarly research papers, conference citations, co-authors, and PDF links",
  "Visual photography portfolio with camera gear specs and Tokyo street shots",
  "Keynote conference presentations with slide deck links and video recordings",
  "High-impact startup ventures with venture capital funding and traction numbers",
  "Competitive programming milestones, LeetCode Guardian rank, and solved problems",
];

export function SectionBuilderModal({
  isOpen,
  onClose,
  onAddSection,
  currentSectionsCount = 0,
}: SectionBuilderModalProps) {
  const [activeTab, setActiveTab] = useState<"library" | "custom" | "ai">("library");

  // Library State
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Custom Builder State
  const [customTitle, setCustomTitle] = useState("");
  const [customSubtitle, setCustomSubtitle] = useState("");
  const [customCategory, setCustomCategory] = useState("Professional");
  const [customIcon, setCustomIcon] = useState("Sparkles");
  const [customLayout, setCustomLayout] = useState<DynamicSectionLayout>("cards");
  const [customFields, setCustomFields] = useState<DynamicSectionField[]>([
    { id: "title", label: "Title", type: "text", required: true, placeholder: "e.g. Project Title" },
    { id: "subtitle", label: "Role / Subtitle", type: "text", required: false, placeholder: "e.g. Lead Designer" },
    { id: "date", label: "Date", type: "date", required: false },
    { id: "description", label: "Description", type: "textarea", required: true, placeholder: "Detailed summary..." },
    { id: "tags", label: "Tags / Skills", type: "tags", required: false },
    { id: "url", label: "Link", type: "url", required: false, placeholder: "https://" },
  ]);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState<DynamicFieldType>("text");
  const [newFieldRequired, setNewFieldRequired] = useState(false);

  // AI Builder State
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<DynamicSection | null>(null);
  const [aiSource, setAiSource] = useState<string | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filtered blueprints
  const filteredBlueprints = SECTION_LIBRARY.filter((bp) => {
    const matchesCat = selectedCategory === "All" || bp.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      bp.title.toLowerCase().includes(q) ||
      bp.subtitle.toLowerCase().includes(q) ||
      bp.description.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const handleSelectBlueprint = (blueprint: SectionBlueprint) => {
    const section = createSectionFromBlueprint(blueprint, currentSectionsCount + 1);
    onAddSection(section);
    onClose();
  };

  // Add field to custom section
  const handleAddCustomField = () => {
    if (!newFieldLabel.trim()) return;
    const fieldId = newFieldLabel
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "_")
      .replace(/^_+|_+$/g, "") || `field_${customFields.length + 1}`;

    const newField: DynamicSectionField = {
      id: fieldId,
      label: newFieldLabel.trim(),
      type: newFieldType,
      required: newFieldRequired,
      placeholder: `Enter ${newFieldLabel.toLowerCase()}`,
    };

    setCustomFields([...customFields, newField]);
    setNewFieldLabel("");
    setNewFieldRequired(false);
  };

  const handleRemoveCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, idx) => idx !== index));
  };

  const handleCreateCustom = () => {
    if (!customTitle.trim()) return;
    const instanceId = `sec_custom_${Date.now().toString(36)}`;
    const section: DynamicSection = {
      id: instanceId,
      type: "custom",
      title: customTitle.trim(),
      subtitle: customSubtitle.trim(),
      category: customCategory,
      icon: customIcon,
      isVisible: true,
      order: currentSectionsCount + 1,
      layout: customLayout,
      fields: customFields,
      entries: [],
    };
    onAddSection(section);
    onClose();
  };

  // Call AI section builder
  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    setAiError(null);
    setAiResult(null);

    try {
      const res = await fetch("/api/ai/section-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      const data = await res.json();
      if (data.success && data.section) {
        setAiResult(data.section);
        setAiSource(data.source);
        setAiExplanation(data.explanation);
      } else {
        setAiError(data.error || "Unable to generate section schema.");
      }
    } catch (err: any) {
      setAiError(err.message || "Failed to reach Section Architect API.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAcceptAISection = () => {
    if (!aiResult) return;
    const section: DynamicSection = {
      ...aiResult,
      order: currentSectionsCount + 1,
    };
    onAddSection(section);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-100 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4 bg-neutral-900/90">
          <div>
            <h2 className="text-xl font-medium tracking-tight text-neutral-100">
              Add Portfolio Section
            </h2>
            <p className="text-xs text-neutral-400">
              Pick from blueprints, build from scratch, or let the AI Architect design one
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/50 px-6">
          <button
            onClick={() => setActiveTab("library")}
            className={`flex items-center space-x-2 py-3 px-4 border-b-2 text-xs font-mono uppercase tracking-wider transition-all ${
              activeTab === "library"
                ? "border-amber-500 text-amber-400 bg-amber-500/5"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Browse Library ({SECTION_LIBRARY.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("custom")}
            className={`flex items-center space-x-2 py-3 px-4 border-b-2 text-xs font-mono uppercase tracking-wider transition-all ${
              activeTab === "custom"
                ? "border-amber-500 text-amber-400 bg-amber-500/5"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            <span>Custom Designer</span>
          </button>

          <button
            onClick={() => setActiveTab("ai")}
            className={`flex items-center space-x-2 py-3 px-4 border-b-2 text-xs font-mono uppercase tracking-wider transition-all ${
              activeTab === "ai"
                ? "border-amber-500 text-amber-400 bg-amber-500/5"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Design with AI</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: BROWSE LIBRARY */}
          {activeTab === "library" && (
            <div className="space-y-6">
              {/* Category Filters & Search */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedCategory("All")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                      selectedCategory === "All"
                        ? "bg-amber-500 text-neutral-950 font-semibold"
                        : "bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700"
                    }`}
                  >
                    All
                  </button>
                  {SECTION_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                        selectedCategory === cat
                          ? "bg-amber-500 text-neutral-950 font-semibold"
                          : "bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search templates..."
                    className="w-full rounded-lg bg-neutral-950 border border-neutral-800 pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Grid of Blueprints */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredBlueprints.map((bp) => {
                  return (
                    <div
                      key={bp.id}
                      className="group flex flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-950/60 p-5 hover:border-amber-500/50 hover:bg-neutral-950 transition-all"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                            {bp.category}
                          </span>
                          <span className="text-[11px] font-mono text-neutral-500 capitalize">
                            Layout: {bp.defaultLayout}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base font-medium text-neutral-100 group-hover:text-amber-400 transition-colors">
                            {bp.title}
                          </h3>
                          <p className="text-xs text-neutral-400 pt-0.5 line-clamp-2">
                            {bp.description}
                          </p>
                        </div>

                        {/* Fields overview */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {bp.fields.slice(0, 4).map((f) => (
                            <span
                              key={f.id}
                              className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800/80 text-neutral-400"
                            >
                              {f.label}
                            </span>
                          ))}
                          {bp.fields.length > 4 && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 text-neutral-500">
                              +{bp.fields.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-neutral-800/70 mt-4 flex items-center justify-between">
                        <span className="text-[11px] font-mono text-neutral-500">
                          Includes sample entry
                        </span>
                        <button
                          onClick={() => handleSelectBlueprint(bp)}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-amber-500 hover:text-neutral-950 text-neutral-200 text-xs font-mono transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Add to Portfolio</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOM SECTION DESIGNER */}
          {activeTab === "custom" && (
            <div className="space-y-8 max-w-2xl mx-auto">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-neutral-300">
                    Section Title *
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g. Hackathons & Bounties"
                    className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-neutral-300">
                      Subtitle / Tagline
                    </label>
                    <input
                      type="text"
                      value={customSubtitle}
                      onChange={(e) => setCustomSubtitle(e.target.value)}
                      placeholder="e.g. Rapid prototype builds"
                      className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-neutral-300">
                      Category
                    </label>
                    <select
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3.5 py-2 text-sm text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      {SECTION_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Icon Picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-neutral-300">
                    Section Icon
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ICON_OPTIONS.map((item) => {
                      const Icon = item.icon;
                      const isSelected = customIcon === item.name;
                      return (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => setCustomIcon(item.name)}
                          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
                            isSelected
                              ? "border-amber-500 bg-amber-500/10 text-amber-400"
                              : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          <span>{item.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Layout Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-neutral-300">
                    Visual Layout
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {LAYOUT_OPTIONS.map((layout) => (
                      <div
                        key={layout.id}
                        onClick={() => setCustomLayout(layout.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          customLayout === layout.id
                            ? "border-amber-500 bg-amber-500/10"
                            : "border-neutral-800 bg-neutral-950/60 hover:border-neutral-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-medium text-neutral-200">
                            {layout.label}
                          </span>
                          {customLayout === layout.id && (
                            <Check className="h-3.5 w-3.5 text-amber-400" />
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-400 pt-1">
                          {layout.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dynamic Fields Schema Builder */}
                <div className="space-y-3 pt-4 border-t border-neutral-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase tracking-wider text-neutral-300">
                      Fields Schema ({customFields.length})
                    </label>
                    <span className="text-[11px] text-neutral-400">
                      Configure each attribute in this section
                    </span>
                  </div>

                  {/* Existing Fields List */}
                  <div className="space-y-2">
                    {customFields.map((field, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-neutral-200 font-medium">{field.label}</span>
                          <span className="text-[10px] text-neutral-400 rounded bg-neutral-900 px-1.5 py-0.5">
                            {field.type}
                          </span>
                          {field.required && (
                            <span className="text-[10px] text-rose-400">Required</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomField(idx)}
                          className="text-neutral-400 hover:text-rose-400 transition-colors p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Field Form */}
                  <div className="p-3 rounded-lg border border-dashed border-neutral-800 bg-neutral-950/40 space-y-3">
                    <span className="text-[11px] font-mono text-neutral-400">
                      + Add a new attribute field
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      <input
                        type="text"
                        value={newFieldLabel}
                        onChange={(e) => setNewFieldLabel(e.target.value)}
                        placeholder="Field label (e.g. Prize Amount)"
                        className="sm:col-span-5 rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <select
                        value={newFieldType}
                        onChange={(e) => setNewFieldType(e.target.value as DynamicFieldType)}
                        className="sm:col-span-4 rounded-lg bg-neutral-950 border border-neutral-800 px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        {FIELD_TYPES.map((ft) => (
                          <option key={ft.id} value={ft.id}>
                            {ft.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleAddCustomField}
                        className="sm:col-span-3 px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-200 text-xs font-mono hover:bg-neutral-700 transition-colors"
                      >
                        Add Field
                      </button>
                    </div>
                  </div>
                </div>

                {/* Create Custom Section Button */}
                <div className="pt-6">
                  <button
                    type="button"
                    onClick={handleCreateCustom}
                    disabled={!customTitle.trim()}
                    className="w-full py-2.5 rounded-lg bg-amber-500 text-neutral-950 font-mono text-xs uppercase tracking-wider font-semibold hover:bg-amber-400 disabled:opacity-40 transition-colors shadow-lg shadow-amber-500/10"
                  >
                    Create Custom Section
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DESIGN WITH AI */}
          {activeTab === "ai" && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono uppercase tracking-wider">
                  <Sparkles className="h-4 w-4" />
                  <span>AI Section Architect</span>
                </div>
                <h3 className="text-lg font-light text-neutral-100">
                  Describe what you want to showcase
                </h3>
                <p className="text-xs text-neutral-400">
                  FolioCraft will automatically analyze your description, select the optimal layout, design custom schema fields, and seed realistic sample content.
                </p>

                <textarea
                  rows={4}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. I need a section for my AI Hackathons. I want to highlight the event name, date, prize award, tech stack, team size, demo URL, github link, and project screenshots."
                  className="w-full rounded-xl bg-neutral-950 border border-neutral-800 p-4 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />

                {/* Prompt Inspiration Badges */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-mono text-neutral-400">
                    Quick suggestions:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PROMPT_SUGGESTIONS.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAiPrompt(s)}
                        className="text-left text-[11px] rounded-lg bg-neutral-950 border border-neutral-800/80 px-2.5 py-1 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700 transition-colors"
                      >
                        {s.slice(0, 48)}...
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateAI}
                  disabled={isAiLoading || !aiPrompt.trim()}
                  className="w-full py-3 rounded-xl bg-amber-500 text-neutral-950 font-mono text-xs uppercase tracking-wider font-semibold hover:bg-amber-400 disabled:opacity-40 transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/10"
                >
                  {isAiLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Synthesizing Schema...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      <span>Architect Section with AI</span>
                    </>
                  )}
                </button>
              </div>

              {aiError && (
                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs font-mono text-rose-300">
                  {aiError}
                </div>
              )}

              {/* AI Generation Result Preview */}
              {aiResult && (
                <div className="rounded-xl border border-amber-500/40 bg-neutral-950 p-5 space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono uppercase tracking-wider text-amber-400">
                          {aiResult.category}
                        </span>
                        <span className="text-[11px] font-mono text-neutral-400">
                          • Layout: {aiResult.layout}
                        </span>
                      </div>
                      <h4 className="text-lg font-medium text-neutral-100">
                        {aiResult.title}
                      </h4>
                      {aiResult.subtitle && (
                        <p className="text-xs text-neutral-400">
                          {aiResult.subtitle}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Generated via {aiSource}
                    </span>
                  </div>

                  {aiExplanation && (
                    <p className="text-xs text-neutral-300 font-sans italic">
                      "{aiExplanation}"
                    </p>
                  )}

                  {/* Fields list */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                      Synthesized Fields ({aiResult.fields.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {aiResult.fields.map((f) => (
                        <span
                          key={f.id}
                          className="text-xs font-mono rounded bg-neutral-800/80 px-2 py-0.5 text-neutral-200 border border-neutral-700/60"
                        >
                          {f.label} <span className="text-neutral-500 text-[10px]">({f.type})</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Sample Entry Count */}
                  <div className="text-xs font-mono text-neutral-400">
                    Seeded with {aiResult.entries.length} realistic sample entries.
                  </div>

                  <div className="pt-3 border-t border-neutral-800 flex justify-end">
                    <button
                      type="button"
                      onClick={handleAcceptAISection}
                      className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-amber-500 text-neutral-950 font-mono text-xs uppercase tracking-wider font-semibold hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/10"
                    >
                      <Check className="h-4 w-4" />
                      <span>Add Section to Portfolio</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
