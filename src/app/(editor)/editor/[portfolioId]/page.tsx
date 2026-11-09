"use client";

import React, { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import {
  getPortfolioById,
  savePortfolio,
  checkUsernameAvailability,
} from "@/lib/db/portfolios";
import { uploadPortfolioMedia } from "@/lib/db/storage";
import { ThemeRenderer } from "@/themes/ThemeRenderer";
import {
  PortfolioData,
  ThemeId,
  ProjectItem,
  ExperienceItem,
  EducationItem,
  SkillItem,
  SectionConfig,
} from "@/themes/types";
import {
  THEME_REGISTRY,
  PRESET_COLOR_PALETTES,
  INITIAL_DEFAULT_PORTFOLIO,
} from "@/lib/utils/defaults";
import { slugify } from "@/lib/utils/slugify";
import {
  Monitor,
  Tablet,
  Smartphone,
  Undo2,
  Redo2,
  Save,
  Globe,
  ArrowLeft,
  Palette,
  Layers,
  Type,
  User,
  FolderGit2,
  Briefcase,
  GraduationCap,
  Sparkles,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Check,
  Upload,
  ExternalLink,
  Share2,
  Settings,
  ChevronRight,
  ChevronDown,
  Clock,
} from "lucide-react";

type ViewportMode = "desktop" | "tablet" | "mobile";
type ActiveTab = "content" | "themes" | "design" | "sections" | "settings";

export default function VisualEditorPage({
  params,
}: {
  params: Promise<{ portfolioId: string }>;
}) {
  const resolvedParams = use(params);
  const portfolioId = resolvedParams.portfolioId;

  const { user } = useAuth();
  const router = useRouter();

  // Core state
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewport, setViewport] = useState<ViewportMode>("desktop");
  const [activeTab, setActiveTab] = useState<ActiveTab>("content");
  const [contentSubSection, setContentSubSection] = useState<
    "personal" | "about" | "projects" | "experience" | "skills" | "education" | "socials"
  >("personal");

  // History stack for Undo/Redo
  const historyRef = useRef<PortfolioData[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const isUndoRedoAction = useRef(false);

  // Auto-save & Status
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Load initial portfolio
  useEffect(() => {
    const load = async () => {
      try {
        const item = await getPortfolioById(portfolioId);
        if (item) {
          setData(item);
          historyRef.current = [item];
          historyIndexRef.current = 0;
        } else {
          // Fallback initial
          const seeded = { ...INITIAL_DEFAULT_PORTFOLIO, portfolioId };
          setData(seeded);
          historyRef.current = [seeded];
          historyIndexRef.current = 0;
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [portfolioId]);

  // Push to history stack & trigger debounced auto-save
  const updateData = (updater: (prev: PortfolioData) => PortfolioData) => {
    setData((prev) => {
      if (!prev) return prev;
      const next = updater(prev);

      if (!isUndoRedoAction.current) {
        // truncate future history
        const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
        newHistory.push(next);
        if (newHistory.length > 30) newHistory.shift(); // limit history depth
        historyRef.current = newHistory;
        historyIndexRef.current = newHistory.length - 1;
      }

      // Schedule debounced auto-save
      setSaveStatus("unsaved");
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(async () => {
        setSaveStatus("saving");
        try {
          await savePortfolio(next);
          setSaveStatus("saved");
        } catch (err) {
          console.error("Auto-save error:", err);
          setSaveStatus("unsaved");
        }
      }, 1200);

      return next;
    });
  };

  const handleUndo = () => {
    if (historyIndexRef.current > 0) {
      isUndoRedoAction.current = true;
      historyIndexRef.current -= 1;
      const target = historyRef.current[historyIndexRef.current];
      setData(target);
      savePortfolio(target);
      isUndoRedoAction.current = false;
    }
  };

  const handleRedo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      isUndoRedoAction.current = true;
      historyIndexRef.current += 1;
      const target = historyRef.current[historyIndexRef.current];
      setData(target);
      savePortfolio(target);
      isUndoRedoAction.current = false;
    }
  };

  const handleManualSave = async () => {
    if (!data) return;
    setSaveStatus("saving");
    try {
      await savePortfolio(data);
      setSaveStatus("saved");
      setNotification("All changes safely saved.");
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error("Manual save failed:", err);
      setSaveStatus("unsaved");
    }
  };

  const handleTogglePublish = async () => {
    if (!data) return;
    const nextState = !data.isPublished;
    const updated = {
      ...data,
      isPublished: nextState,
      publishedAt: nextState ? new Date().toISOString() : data.publishedAt,
    };
    updateData(() => updated);
    await savePortfolio(updated);
    setNotification(
      nextState
        ? `Portfolio is now LIVE at /portfolio/${data.username}!`
        : "Portfolio unpublished."
    );
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !data) return;
    setUploadingImage(true);
    try {
      const url = await uploadPortfolioMedia(file, user.uid, data.portfolioId, "avatars");
      updateData((prev) => ({
        ...prev,
        personalInfo: { ...prev.personalInfo, avatarUrl: url },
      }));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-editorial-ivory flex flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 border-2 border-editorial-charcoal border-t-transparent rounded-full animate-spin" />
        <span className="font-mono text-xs uppercase tracking-widest text-editorial-charcoal">
          Loading Visual Studio...
        </span>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-editorial-ivory text-editorial-charcoal">
      
      {/* =========================================================================
          TOP ACTION BAR
      ========================================================================== */}
      <header className="h-14 border-b border-editorial-border bg-white flex items-center justify-between px-4 z-40 flex-shrink-0">
        
        {/* Left: Back & Title */}
        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard"
            className="p-1.5 border border-editorial-border hover:bg-editorial-sand/30 text-editorial-charcoal"
            title="Return to Dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex flex-col">
            <span className="font-serif text-sm font-semibold tracking-tight leading-tight">
              {data.title}
            </span>
            <span className="text-[10px] font-mono text-editorial-muted">
              /{data.username} • {THEME_REGISTRY.find((t) => t.id === data.themeId)?.name}
            </span>
          </div>
        </div>

        {/* Center: Device Viewport Switcher & Undo/Redo */}
        <div className="flex items-center space-x-3">
          {/* Undo / Redo */}
          <div className="flex items-center space-x-1 border border-editorial-border p-0.5 rounded bg-editorial-ivory/50">
            <button
              onClick={handleUndo}
              disabled={historyIndexRef.current <= 0}
              title="Undo"
              className="p-1 text-editorial-charcoal hover:bg-white rounded disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Undo2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndexRef.current >= historyRef.current.length - 1}
              title="Redo"
              className="p-1 text-editorial-charcoal hover:bg-white rounded disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Redo2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Viewport frames */}
          <div className="hidden sm:flex items-center space-x-1 border border-editorial-border p-0.5 rounded bg-editorial-ivory/50">
            <button
              onClick={() => setViewport("desktop")}
              className={`p-1.5 rounded transition-colors ${
                viewport === "desktop" ? "bg-editorial-charcoal text-white" : "text-editorial-muted hover:text-editorial-charcoal"
              }`}
              title="Desktop View (100%)"
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewport("tablet")}
              className={`p-1.5 rounded transition-colors ${
                viewport === "tablet" ? "bg-editorial-charcoal text-white" : "text-editorial-muted hover:text-editorial-charcoal"
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewport("mobile")}
              className={`p-1.5 rounded transition-colors ${
                viewport === "mobile" ? "bg-editorial-charcoal text-white" : "text-editorial-muted hover:text-editorial-charcoal"
              }`}
              title="Mobile View (375px)"
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right: Auto-Save Status, Preview & Publish */}
        <div className="flex items-center space-x-3">
          {/* Auto-save badge */}
          <div className="hidden md:flex items-center space-x-1.5 text-[11px] font-mono text-editorial-muted">
            <span
              className={`h-2 w-2 rounded-full ${
                saveStatus === "saved"
                  ? "bg-emerald-500"
                  : saveStatus === "saving"
                  ? "bg-amber-500 animate-pulse"
                  : "bg-red-400"
              }`}
            />
            <span className="capitalize">{saveStatus}</span>
          </div>

          <Link
            href={`/portfolio/${data.username}`}
            target="_blank"
            className="hidden sm:inline-flex items-center space-x-1 border border-editorial-border bg-white px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-editorial-charcoal hover:bg-editorial-sand/30"
          >
            <span>Live URL</span>
            <ExternalLink className="h-3 w-3" />
          </Link>

          <button
            onClick={handleTogglePublish}
            className={`inline-flex items-center space-x-1.5 px-4 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
              data.isPublished
                ? "bg-emerald-700 text-white hover:bg-emerald-800"
                : "bg-editorial-charcoal text-editorial-ivory hover:bg-editorial-softdark"
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>{data.isPublished ? "Published" : "Publish"}</span>
          </button>
        </div>
      </header>

      {/* Toast notification banner */}
      {notification && (
        <div className="bg-editorial-charcoal text-editorial-ivory text-xs font-mono uppercase tracking-wider px-4 py-2 text-center animate-fade-in z-50">
          {notification}
        </div>
      )}

      {/* =========================================================================
          MAIN SPLIT-SCREEN WORKSPACE
      ========================================================================== */}
      <div className="flex-grow flex overflow-hidden">
        
        {/* LEFT PANEL: Editing Controls (Tabs & Forms) */}
        <aside className="w-full md:w-[440px] lg:w-[480px] border-r border-editorial-border bg-white flex flex-col flex-shrink-0 z-20">
          
          {/* Tab Navigation Strip */}
          <div className="border-b border-editorial-border bg-editorial-ivory/60 flex items-center justify-around px-2 py-1 text-xs font-mono uppercase tracking-wider text-editorial-muted">
            <button
              onClick={() => setActiveTab("content")}
              className={`flex items-center space-x-1.5 py-2 px-3 border-b-2 transition-colors ${
                activeTab === "content"
                  ? "border-editorial-charcoal text-editorial-charcoal font-bold"
                  : "border-transparent hover:text-editorial-charcoal"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>Content</span>
            </button>

            <button
              onClick={() => setActiveTab("themes")}
              className={`flex items-center space-x-1.5 py-2 px-3 border-b-2 transition-colors ${
                activeTab === "themes"
                  ? "border-editorial-charcoal text-editorial-charcoal font-bold"
                  : "border-transparent hover:text-editorial-charcoal"
              }`}
            >
              <Palette className="h-3.5 w-3.5" />
              <span>Themes</span>
            </button>

            <button
              onClick={() => setActiveTab("design")}
              className={`flex items-center space-x-1.5 py-2 px-3 border-b-2 transition-colors ${
                activeTab === "design"
                  ? "border-editorial-charcoal text-editorial-charcoal font-bold"
                  : "border-transparent hover:text-editorial-charcoal"
              }`}
            >
              <Type className="h-3.5 w-3.5" />
              <span>Style</span>
            </button>

            <button
              onClick={() => setActiveTab("sections")}
              className={`flex items-center space-x-1.5 py-2 px-3 border-b-2 transition-colors ${
                activeTab === "sections"
                  ? "border-editorial-charcoal text-editorial-charcoal font-bold"
                  : "border-transparent hover:text-editorial-charcoal"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Sections</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`flex items-center space-x-1.5 py-2 px-3 border-b-2 transition-colors ${
                activeTab === "settings"
                  ? "border-editorial-charcoal text-editorial-charcoal font-bold"
                  : "border-transparent hover:text-editorial-charcoal"
              }`}
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Settings</span>
            </button>
          </div>

          {/* Form Content Scrollable Area */}
          <div className="flex-grow overflow-y-auto p-6 space-y-6">
            
            {/* -------------------------------------------------------------
                TAB 1: CONTENT EDITING
            -------------------------------------------------------------- */}
            {activeTab === "content" && (
              <div className="space-y-6">
                {/* Sub-navigation for content categories */}
                <div className="flex flex-wrap gap-1.5 border-b border-editorial-border pb-3">
                  {(
                    [
                      { id: "personal", label: "Hero & Bio" },
                      { id: "projects", label: "Projects" },
                      { id: "experience", label: "Experience" },
                      { id: "skills", label: "Skills" },
                      { id: "education", label: "Education" },
                      { id: "socials", label: "Social Links" },
                    ] as const
                  ).map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setContentSubSection(sub.id)}
                      className={`px-2.5 py-1 text-xs font-mono uppercase rounded transition-colors ${
                        contentSubSection === sub.id
                          ? "bg-editorial-charcoal text-editorial-ivory"
                          : "bg-editorial-ivory text-editorial-muted hover:text-editorial-charcoal"
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>

                {/* Sub: Personal Information */}
                {contentSubSection === "personal" && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-mono uppercase text-editorial-charcoal font-medium">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={data.personalInfo.fullName}
                        onChange={(e) =>
                          updateData((prev) => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, fullName: e.target.value },
                          }))
                        }
                        className="mt-1 block w-full border border-editorial-border bg-editorial-ivory/30 px-3 py-2 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-editorial-charcoal font-medium">
                        Professional Title
                      </label>
                      <input
                        type="text"
                        value={data.personalInfo.professionalTitle}
                        onChange={(e) =>
                          updateData((prev) => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, professionalTitle: e.target.value },
                          }))
                        }
                        className="mt-1 block w-full border border-editorial-border bg-editorial-ivory/30 px-3 py-2 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-editorial-charcoal font-medium">
                        Headline (Hero Display Title)
                      </label>
                      <textarea
                        rows={2}
                        value={data.personalInfo.heroHeadline || ""}
                        onChange={(e) =>
                          updateData((prev) => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, heroHeadline: e.target.value },
                          }))
                        }
                        className="mt-1 block w-full border border-editorial-border bg-editorial-ivory/30 px-3 py-2 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-editorial-charcoal font-medium">
                        Tagline / Subheadline
                      </label>
                      <textarea
                        rows={2}
                        value={data.personalInfo.tagline || ""}
                        onChange={(e) =>
                          updateData((prev) => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, tagline: e.target.value },
                          }))
                        }
                        className="mt-1 block w-full border border-editorial-border bg-editorial-ivory/30 px-3 py-2 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-editorial-charcoal font-medium">
                        Status Indicator
                      </label>
                      <input
                        type="text"
                        value={data.personalInfo.statusBadge || ""}
                        onChange={(e) =>
                          updateData((prev) => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, statusBadge: e.target.value },
                          }))
                        }
                        placeholder="e.g. Open to advisory & select projects"
                        className="mt-1 block w-full border border-editorial-border bg-editorial-ivory/30 px-3 py-2 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-editorial-charcoal font-medium">
                        Location
                      </label>
                      <input
                        type="text"
                        value={data.personalInfo.location || ""}
                        onChange={(e) =>
                          updateData((prev) => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, location: e.target.value },
                          }))
                        }
                        className="mt-1 block w-full border border-editorial-border bg-editorial-ivory/30 px-3 py-2 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase text-editorial-charcoal font-medium">
                        Biography (About Narrative)
                      </label>
                      <textarea
                        rows={4}
                        value={data.about.bioLong || ""}
                        onChange={(e) =>
                          updateData((prev) => ({
                            ...prev,
                            about: { ...prev.about, bioLong: e.target.value },
                          }))
                        }
                        className="mt-1 block w-full border border-editorial-border bg-editorial-ivory/30 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Sub: Projects Management */}
                {contentSubSection === "projects" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase text-editorial-muted">
                        {data.projects.length} Works Added
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const item: ProjectItem = {
                            id: "proj-" + Date.now(),
                            title: "New Project",
                            description: "Brief summary of work...",
                            category: "Design & Web",
                            technologies: ["Next.js", "Design"],
                            featured: true,
                            coverImageUrl: "https://images.unsplash.com/photo-1507842229451-7f01be7ff612?auto=format&fit=crop&w=800&q=80",
                          };
                          updateData((prev) => ({ ...prev, projects: [...prev.projects, item] }));
                        }}
                        className="inline-flex items-center space-x-1 border border-editorial-border bg-editorial-ivory px-3 py-1 text-xs font-mono uppercase text-editorial-charcoal hover:bg-editorial-sand/30"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add Project</span>
                      </button>
                    </div>

                    {data.projects.map((proj, idx) => (
                      <div key={proj.id} className="border border-editorial-border p-4 bg-editorial-ivory/30 space-y-3">
                        <div className="flex items-center justify-between border-b border-editorial-border pb-2">
                          <span className="text-xs font-mono font-bold text-editorial-mocha">
                            #{idx + 1} {proj.title}
                          </span>
                          <button
                            onClick={() =>
                              updateData((prev) => ({
                                ...prev,
                                projects: prev.projects.filter((p) => p.id !== proj.id),
                              }))
                            }
                            className="text-red-500 hover:text-red-700 text-xs font-mono uppercase"
                          >
                            Delete
                          </button>
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono uppercase text-editorial-muted">Title</label>
                          <input
                            type="text"
                            value={proj.title}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateData((prev) => ({
                                ...prev,
                                projects: prev.projects.map((p) =>
                                  p.id === proj.id ? { ...p, title: val } : p
                                ),
                              }));
                            }}
                            className="mt-1 block w-full border border-editorial-border bg-white px-2.5 py-1.5 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono uppercase text-editorial-muted">Category</label>
                          <input
                            type="text"
                            value={proj.category}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateData((prev) => ({
                                ...prev,
                                projects: prev.projects.map((p) =>
                                  p.id === proj.id ? { ...p, category: val } : p
                                ),
                              }));
                            }}
                            className="mt-1 block w-full border border-editorial-border bg-white px-2.5 py-1.5 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono uppercase text-editorial-muted">Description</label>
                          <textarea
                            rows={2}
                            value={proj.description}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateData((prev) => ({
                                ...prev,
                                projects: prev.projects.map((p) =>
                                  p.id === proj.id ? { ...p, description: val } : p
                                ),
                              }));
                            }}
                            className="mt-1 block w-full border border-editorial-border bg-white px-2.5 py-1.5 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono uppercase text-editorial-muted">Image URL</label>
                          <input
                            type="url"
                            value={proj.coverImageUrl || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateData((prev) => ({
                                ...prev,
                                projects: prev.projects.map((p) =>
                                  p.id === proj.id ? { ...p, coverImageUrl: val } : p
                                ),
                              }));
                            }}
                            className="mt-1 block w-full border border-editorial-border bg-white px-2.5 py-1.5 text-xs"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-mono uppercase text-editorial-muted">Live URL</label>
                            <input
                              type="url"
                              value={proj.demoUrl || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateData((prev) => ({
                                  ...prev,
                                  projects: prev.projects.map((p) =>
                                    p.id === proj.id ? { ...p, demoUrl: val } : p
                                  ),
                                }));
                              }}
                              className="mt-1 block w-full border border-editorial-border bg-white px-2.5 py-1.5 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-mono uppercase text-editorial-muted">GitHub URL</label>
                            <input
                              type="url"
                              value={proj.githubUrl || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateData((prev) => ({
                                  ...prev,
                                  projects: prev.projects.map((p) =>
                                    p.id === proj.id ? { ...p, githubUrl: val } : p
                                  ),
                                }));
                              }}
                              className="mt-1 block w-full border border-editorial-border bg-white px-2.5 py-1.5 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Sub: Experience Management */}
                {contentSubSection === "experience" && (
                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={() => {
                        const item: ExperienceItem = {
                          id: "exp-" + Date.now(),
                          company: "New Company",
                          position: "Senior Role",
                          employmentType: "Full-time",
                          startDate: "2023 — Present",
                          current: true,
                          description: "Key contributions and impact...",
                          skillsUsed: ["Leadership"],
                        };
                        updateData((prev) => ({ ...prev, experience: [...prev.experience, item] }));
                      }}
                      className="inline-flex items-center space-x-1 border border-editorial-border bg-editorial-ivory px-3 py-1 text-xs font-mono uppercase text-editorial-charcoal"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add Experience</span>
                    </button>

                    {data.experience.map((exp) => (
                      <div key={exp.id} className="border border-editorial-border p-4 bg-editorial-ivory/30 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-xs">{exp.position} @ {exp.company}</span>
                          <button
                            onClick={() =>
                              updateData((prev) => ({
                                ...prev,
                                experience: prev.experience.filter((e) => e.id !== exp.id),
                              }))
                            }
                            className="text-red-500 text-xs font-mono"
                          >
                            Remove
                          </button>
                        </div>
                        <input
                          type="text"
                          value={exp.company}
                          placeholder="Company"
                          onChange={(e) => {
                            const val = e.target.value;
                            updateData((prev) => ({
                              ...prev,
                              experience: prev.experience.map((i) => i.id === exp.id ? { ...i, company: val } : i),
                            }));
                          }}
                          className="w-full border p-1 text-xs"
                        />
                        <input
                          type="text"
                          value={exp.position}
                          placeholder="Position"
                          onChange={(e) => {
                            const val = e.target.value;
                            updateData((prev) => ({
                              ...prev,
                              experience: prev.experience.map((i) => i.id === exp.id ? { ...i, position: val } : i),
                            }));
                          }}
                          className="w-full border p-1 text-xs"
                        />
                        <textarea
                          rows={2}
                          value={exp.description}
                          placeholder="Description"
                          onChange={(e) => {
                            const val = e.target.value;
                            updateData((prev) => ({
                              ...prev,
                              experience: prev.experience.map((i) => i.id === exp.id ? { ...i, description: val } : i),
                            }));
                          }}
                          className="w-full border p-1 text-xs"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Sub: Skills Management */}
                {contentSubSection === "skills" && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {data.skills.map((skill) => (
                        <span key={skill.id} className="inline-flex items-center space-x-1 border border-editorial-border bg-editorial-ivory px-2.5 py-1 text-xs font-mono">
                          <span>{skill.name}</span>
                          <button
                            onClick={() =>
                              updateData((prev) => ({
                                ...prev,
                                skills: prev.skills.filter((s) => s.id !== skill.id),
                              }))
                            }
                            className="text-red-500 font-bold ml-1"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <input
                        id="editor-skill-input"
                        type="text"
                        placeholder="New skill..."
                        className="border border-editorial-border p-2 text-xs flex-grow"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const val = e.currentTarget.value.trim();
                            if (!val) return;
                            updateData((prev) => ({
                              ...prev,
                              skills: [...prev.skills, { id: "sk-" + Date.now(), name: val, category: "Technical" }],
                            }));
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Sub: Social Links */}
                {contentSubSection === "socials" && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-mono uppercase text-editorial-muted block">LinkedIn</label>
                      <input
                        type="url"
                        value={data.socialLinks.linkedin || ""}
                        onChange={(e) =>
                          updateData((prev) => ({
                            ...prev,
                            socialLinks: { ...prev.socialLinks, linkedin: e.target.value },
                          }))
                        }
                        className="w-full border p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono uppercase text-editorial-muted block">GitHub</label>
                      <input
                        type="url"
                        value={data.socialLinks.github || ""}
                        onChange={(e) =>
                          updateData((prev) => ({
                            ...prev,
                            socialLinks: { ...prev.socialLinks, github: e.target.value },
                          }))
                        }
                        className="w-full border p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono uppercase text-editorial-muted block">Twitter / X</label>
                      <input
                        type="url"
                        value={data.socialLinks.twitter || ""}
                        onChange={(e) =>
                          updateData((prev) => ({
                            ...prev,
                            socialLinks: { ...prev.socialLinks, twitter: e.target.value },
                          }))
                        }
                        className="w-full border p-2 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* -------------------------------------------------------------
                TAB 2: THEME SWITCHER (THE 6 ARCHETYPES)
            -------------------------------------------------------------- */}
            {activeTab === "themes" && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-serif text-lg text-editorial-charcoal">Theme Archetypes</h3>
                  <p className="text-xs text-editorial-muted">
                    Switch between 6 bespoke designs instantly. Your project content is preserved 100%.
                  </p>
                </div>

                <div className="space-y-3">
                  {THEME_REGISTRY.map((theme) => {
                    const isCurrent = data.themeId === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() =>
                          updateData((prev) => ({
                            ...prev,
                            themeId: theme.id,
                            themeSettings: theme.defaultSettings,
                          }))
                        }
                        className={`w-full text-left p-4 border transition-all ${
                          isCurrent
                            ? "border-editorial-charcoal bg-editorial-sand/30 ring-2 ring-editorial-charcoal shadow-sm"
                            : "border-editorial-border bg-editorial-card hover:border-editorial-charcoal/50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 bg-white border border-editorial-border">
                            {theme.category}
                          </span>
                          {isCurrent && (
                            <span className="text-xs font-mono uppercase text-editorial-charcoal font-bold flex items-center space-x-1">
                              <Check className="h-3.5 w-3.5" />
                              <span>Active</span>
                            </span>
                          )}
                        </div>
                        <h4 className="font-serif text-base text-editorial-charcoal font-medium">
                          {theme.name}
                        </h4>
                        <p className="text-xs text-editorial-muted mt-1 leading-relaxed">
                          {theme.tagline}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                TAB 3: STYLE & COLOR ENGINE
            -------------------------------------------------------------- */}
            {activeTab === "design" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif text-lg text-editorial-charcoal">Color Palette Engine</h3>
                  <p className="text-xs text-editorial-muted">
                    Apply curated editorial palettes or customize specific color tokens.
                  </p>
                </div>

                {/* Preset Palettes */}
                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase text-editorial-muted">Preset Palettes</span>
                  <div className="space-y-2">
                    {PRESET_COLOR_PALETTES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          updateData((prev) => ({
                            ...prev,
                            themeSettings: {
                              ...prev.themeSettings,
                              palette: preset.palette,
                            },
                          }))
                        }
                        className="w-full flex items-center justify-between p-2.5 border border-editorial-border bg-white hover:bg-editorial-sand/20 text-xs font-medium"
                      >
                        <span>{preset.name}</span>
                        <div className="flex space-x-1">
                          <span className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: preset.palette.background }} />
                          <span className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: preset.palette.primary }} />
                          <span className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: preset.palette.secondary }} />
                          <span className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: preset.palette.accent }} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Granular Color Controls */}
                <div className="space-y-3 pt-4 border-t border-editorial-border">
                  <span className="text-xs font-mono uppercase text-editorial-muted">Custom Hex Codes</span>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-mono uppercase text-editorial-muted">Primary Accent</label>
                      <input
                        type="color"
                        value={data.themeSettings.palette.primary}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateData((prev) => ({
                            ...prev,
                            themeSettings: {
                              ...prev.themeSettings,
                              palette: { ...prev.themeSettings.palette, primary: val },
                            },
                          }));
                        }}
                        className="h-8 w-full border border-editorial-border cursor-pointer rounded mt-1"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono uppercase text-editorial-muted">Background</label>
                      <input
                        type="color"
                        value={data.themeSettings.palette.background}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateData((prev) => ({
                            ...prev,
                            themeSettings: {
                              ...prev.themeSettings,
                              palette: { ...prev.themeSettings.palette, background: val },
                            },
                          }));
                        }}
                        className="h-8 w-full border border-editorial-border cursor-pointer rounded mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                TAB 4: SECTION VISIBILITY & ORDERING
            -------------------------------------------------------------- */}
            {activeTab === "sections" && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-serif text-lg text-editorial-charcoal">Section Controls</h3>
                  <p className="text-xs text-editorial-muted">
                    Toggle visibility for any section on your portfolio.
                  </p>
                </div>

                <div className="space-y-2">
                  {data.sections.map((sec) => (
                    <div
                      key={sec.id}
                      className="flex items-center justify-between p-3 border border-editorial-border bg-editorial-ivory/30 text-xs font-mono uppercase"
                    >
                      <span className={sec.isVisible ? "text-editorial-charcoal font-semibold" : "text-editorial-muted line-through"}>
                        {sec.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          updateData((prev) => ({
                            ...prev,
                            sections: prev.sections.map((s) =>
                              s.id === sec.id ? { ...s, isVisible: !s.isVisible } : s
                            ),
                          }));
                        }}
                        className={`p-1.5 border rounded ${
                          sec.isVisible ? "bg-editorial-charcoal text-white" : "bg-white text-editorial-muted"
                        }`}
                        title={sec.isVisible ? "Hide section" : "Show section"}
                      >
                        {sec.isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                TAB 5: SETTINGS & SLUG
            -------------------------------------------------------------- */}
            {activeTab === "settings" && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-serif text-lg text-editorial-charcoal">Portfolio Settings</h3>
                  <p className="text-xs text-editorial-muted">
                    Manage URL slug, document title, and SEO meta tags.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-editorial-charcoal font-medium">
                    Portfolio Title
                  </label>
                  <input
                    type="text"
                    value={data.title}
                    onChange={(e) =>
                      updateData((prev) => ({ ...prev, title: e.target.value }))
                    }
                    className="mt-1 block w-full border border-editorial-border p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-editorial-charcoal font-medium">
                    URL Slug
                  </label>
                  <div className="flex items-center mt-1">
                    <span className="border border-r-0 border-editorial-border bg-editorial-sand/30 px-2 py-2 text-xs font-mono">
                      /portfolio/
                    </span>
                    <input
                      type="text"
                      value={data.username}
                      onChange={(e) => {
                        const val = slugify(e.target.value);
                        updateData((prev) => ({ ...prev, username: val }));
                      }}
                      className="border border-editorial-border p-2 text-xs font-mono flex-grow"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-editorial-border">
                  <button
                    onClick={handleManualSave}
                    className="w-full flex items-center justify-center space-x-1.5 bg-editorial-charcoal text-editorial-ivory py-2.5 text-xs font-mono uppercase tracking-wider"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>Save All Changes</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </aside>

        {/* =========================================================================
            RIGHT PANEL: LIVE INTERACTIVE CANVAS (VIEWPORT SIMULATION)
        ========================================================================== */}
        <main className="flex-grow bg-[#EAE6DE] p-4 sm:p-8 flex items-center justify-center overflow-auto">
          
          <div
            className={`transition-all duration-300 shadow-editorial-lg overflow-y-auto bg-white border border-editorial-charcoal/20 ${
              viewport === "mobile"
                ? "w-[375px] h-[780px] rounded-[36px] ring-8 ring-editorial-charcoal/80 my-auto"
                : viewport === "tablet"
                ? "w-[768px] h-[900px] rounded-2xl ring-4 ring-editorial-charcoal/50 my-auto"
                : "w-full h-full rounded-none"
            }`}
          >
            {/* Live Theme Canvas Rendered with Zero Lag */}
            <ThemeRenderer data={data} previewMode={true} />
          </div>

        </main>

      </div>
    </div>
  );
}
