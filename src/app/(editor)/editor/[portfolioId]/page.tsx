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
import { MediaAssetControl } from "@/components/shared/MediaAssetControl";
import { ThemeRenderer } from "@/themes/ThemeRenderer";
import {
  PortfolioData,
  ThemeId,
  ProjectItem,
  ExperienceItem,
  EducationItem,
  SkillItem,
  SectionConfig,
  DynamicSection,
  DynamicSectionEntry,
  DynamicSectionLayout,
} from "@/themes/types";
import { SectionBuilderModal } from "@/components/sections/SectionBuilderModal";
import { DynamicEntryEditorModal } from "@/components/sections/DynamicEntryEditorModal";
import {
  THEME_REGISTRY,
  PRESET_COLOR_PALETTES,
  createEmptyPortfolio,
  SAMPLE_DEMO_PORTFOLIO,
} from "@/lib/utils/defaults";
import { slugify } from "@/lib/utils/slugify";
import { getPortfolioUrl, getDisplayPortfolioUrl } from "@/lib/utils/url";
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
  ArrowUp,
  ArrowDown,
  Copy,
  Edit3,
  Wand2,
  ShieldAlert,
  Mail,
  X,
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

  // Dynamic Section Builder States
  const [isSectionBuilderOpen, setIsSectionBuilderOpen] = useState(false);
  const [isEntryEditorOpen, setIsEntryEditorOpen] = useState(false);
  const [activeDynamicSection, setActiveDynamicSection] = useState<DynamicSection | null>(null);
  const [activeEntryForEdit, setActiveEntryForEdit] = useState<DynamicSectionEntry | null>(null);
  const [expandedSectionIds, setExpandedSectionIds] = useState<Record<string, boolean>>({});
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // Load initial portfolio
  useEffect(() => {
    const load = async () => {
      try {
        const item = await getPortfolioById(portfolioId);
        if (item) {
          if (user?.uid) {
            item.userId = user.uid;
            item.ownerId = user.uid;
          }
          setData(item);
          historyRef.current = [item];
          historyIndexRef.current = 0;
        } else {
          // Initialize clean empty portfolio with current user identity
          const baseName = user?.displayName || "";
          const baseEmail = user?.email || "";
          const usernameSlug = slugify(baseName || baseEmail.split("@")[0] || "creator");
          const seeded = createEmptyPortfolio(
            user?.uid || "draft",
            usernameSlug,
            baseName,
            baseEmail
          );
          seeded.portfolioId = portfolioId;
          setData(seeded);
          historyRef.current = [seeded];
          historyIndexRef.current = 0;
        }
      } catch (err: any) {
        console.error("Failed to load portfolio:", err);
        setNotification(err?.message || "Failed to load portfolio from database.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [portfolioId, user]);

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
          const payload = {
            ...next,
            userId: user?.uid || next.userId,
            ownerId: user?.uid || next.ownerId,
          };
          await savePortfolio(payload);
          setSaveStatus("saved");
        } catch (err: any) {
          console.error("Auto-save error:", err);
          setSaveStatus("unsaved");
          setNotification(err?.message || "Failed to auto-save changes.");
          setTimeout(() => setNotification(null), 5000);
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
      const payload = {
        ...data,
        userId: user?.uid || data.userId,
        ownerId: user?.uid || data.ownerId,
      };
      await savePortfolio(payload);
      setSaveStatus("saved");
      setNotification("All changes safely saved to database.");
      setTimeout(() => setNotification(null), 3500);
    } catch (err: any) {
      console.error("Manual save failed:", err);
      setSaveStatus("unsaved");
      setNotification(err?.message || "Failed to save changes. Please check permissions.");
      setTimeout(() => setNotification(null), 6000);
    }
  };

  const handleLoadSampleData = () => {
    if (!user) return;
    const usernameSlug = slugify(
      user.displayName || user.email?.split("@")[0] || data?.username || "creator"
    );
    const sample: PortfolioData = {
      ...SAMPLE_DEMO_PORTFOLIO,
      portfolioId,
      userId: user.uid,
      ownerId: user.uid,
      username: usernameSlug,
      slug: usernameSlug,
      title: `${user.displayName || "My"} Portfolio`,
      personalInfo: {
        ...SAMPLE_DEMO_PORTFOLIO.personalInfo,
        fullName: user.displayName || SAMPLE_DEMO_PORTFOLIO.personalInfo.fullName,
        email: user.email || SAMPLE_DEMO_PORTFOLIO.personalInfo.email,
      },
    };
    updateData(() => sample);
    setNotification("Sample creative profile loaded into workspace.");
    setTimeout(() => setNotification(null), 3000);
  };

  const handleClearToEmpty = () => {
    if (!user) return;
    const usernameSlug = slugify(
      user.displayName || user.email?.split("@")[0] || data?.username || "creator"
    );
    const clean = createEmptyPortfolio(
      user.uid,
      usernameSlug,
      user.displayName || "",
      user.email || ""
    );
    clean.portfolioId = portfolioId;
    if (data) {
      clean.themeId = data.themeId;
      clean.themeSettings = data.themeSettings;
    }
    updateData(() => clean);
    setNotification("Reset to clean empty portfolio.");
    setTimeout(() => setNotification(null), 3000);
  };

  // Dynamic Section Handlers
  const handleAddDynamicSection = (newSection: DynamicSection) => {
    updateData((prev) => ({
      ...prev,
      dynamicSections: [...(prev.dynamicSections || []), newSection],
    }));
    setNotification(`Added section: ${newSection.title}`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleToggleDynamicSectionVisibility = (sectionId: string) => {
    updateData((prev) => ({
      ...prev,
      dynamicSections: (prev.dynamicSections || []).map((s) =>
        s.id === sectionId ? { ...s, isVisible: !s.isVisible } : s
      ),
    }));
  };

  const handleReorderDynamicSection = (sectionId: string, direction: "up" | "down") => {
    updateData((prev) => {
      const list = [...(prev.dynamicSections || [])];
      const index = list.findIndex((s) => s.id === sectionId);
      if (index < 0) return prev;
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;

      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;

      const reindexed = list.map((s, idx) => ({ ...s, order: idx + 1 }));
      return { ...prev, dynamicSections: reindexed };
    });
  };

  const handleUpdateDynamicSectionLayout = (sectionId: string, layout: DynamicSectionLayout) => {
    updateData((prev) => ({
      ...prev,
      dynamicSections: (prev.dynamicSections || []).map((s) =>
        s.id === sectionId ? { ...s, layout } : s
      ),
    }));
  };

  const handleDuplicateDynamicSection = (sectionId: string) => {
    updateData((prev) => {
      const match = (prev.dynamicSections || []).find((s) => s.id === sectionId);
      if (!match) return prev;
      const copy: DynamicSection = {
        ...match,
        id: `sec_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
        title: `${match.title} (Copy)`,
        order: (prev.dynamicSections || []).length + 1,
        entries: (match.entries || []).map((e, idx) => ({
          ...e,
          id: `entry_${Date.now().toString(36)}_${idx}`,
        })),
      };
      return {
        ...prev,
        dynamicSections: [...(prev.dynamicSections || []), copy],
      };
    });
    setNotification("Section duplicated");
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeleteDynamicSection = (sectionId: string) => {
    if (!confirm("Are you sure you want to delete this section and all its entries?")) return;
    updateData((prev) => ({
      ...prev,
      dynamicSections: (prev.dynamicSections || []).filter((s) => s.id !== sectionId),
    }));
    setNotification("Section deleted");
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOpenAddEntryModal = (section: DynamicSection) => {
    setActiveDynamicSection(section);
    setActiveEntryForEdit(null);
    setIsEntryEditorOpen(true);
  };

  const handleOpenEditEntryModal = (section: DynamicSection, entry: DynamicSectionEntry) => {
    setActiveDynamicSection(section);
    setActiveEntryForEdit(entry);
    setIsEntryEditorOpen(true);
  };

  const handleSaveDynamicEntry = (entry: DynamicSectionEntry) => {
    if (!activeDynamicSection) return;
    updateData((prev) => {
      const sections = (prev.dynamicSections || []).map((s) => {
        if (s.id !== activeDynamicSection.id) return s;
        const existingEntries = s.entries || [];
        const index = existingEntries.findIndex((e) => e.id === entry.id);
        let updatedEntries: DynamicSectionEntry[];
        if (index >= 0) {
          updatedEntries = existingEntries.map((e) => (e.id === entry.id ? entry : e));
        } else {
          updatedEntries = [...existingEntries, entry];
        }
        return { ...s, entries: updatedEntries };
      });
      return { ...prev, dynamicSections: sections };
    });
    setNotification("Entry saved");
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeleteDynamicEntry = (sectionId: string, entryId: string) => {
    updateData((prev) => ({
      ...prev,
      dynamicSections: (prev.dynamicSections || []).map((s) => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          entries: (s.entries || []).filter((e) => e.id !== entryId),
        };
      }),
    }));
  };

  const toggleSectionDrawer = (sectionId: string) => {
    setExpandedSectionIds((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleTogglePublish = async () => {
    if (!data) return;
    const nextState = !data.isPublished;

    // Email verification requirement guard
    if (nextState && user && !user.emailVerified) {
      setShowVerificationModal(true);
      return;
    }

    const updated = {
      ...data,
      isPublished: nextState,
      publishedAt: nextState ? new Date().toISOString() : data.publishedAt,
    };
    updateData(() => updated);
    await savePortfolio(updated);
    setNotification(
      nextState
        ? `Portfolio is now LIVE at ${getPortfolioUrl(data.username)}!`
        : "Portfolio unpublished."
    );
    setTimeout(() => setNotification(null), 5000);
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

        {/* Right: Auto-Save Status, Manual Save, Preview & Publish */}
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

          {/* Explicit Manual Save Button */}
          <button
            type="button"
            onClick={handleManualSave}
            disabled={saveStatus === "saving"}
            className="inline-flex items-center space-x-1 border border-editorial-border bg-white px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-editorial-charcoal hover:bg-editorial-sand/30 disabled:opacity-50"
            title="Save all changes directly to database"
          >
            <Save className={`h-3 w-3 ${saveStatus === "saving" ? "animate-pulse" : ""}`} />
            <span>{saveStatus === "saving" ? "Saving..." : "Save"}</span>
          </button>

          <Link
            href={getPortfolioUrl(data.username)}
            target="_blank"
            rel="noopener noreferrer"
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
                    {/* Profile Photo Media Control */}
                    <MediaAssetControl
                      label="Profile Photo"
                      description="Upload a photo from your device (permanently saved) or paste an image URL."
                      value={data.personalInfo.avatarUrl || ""}
                      onChange={(url) =>
                        updateData((prev) => ({
                          ...prev,
                          profileImage: url || null,
                          personalInfo: { ...prev.personalInfo, avatarUrl: url || undefined },
                        }))
                      }
                      variant="avatar"
                      type="image"
                    />

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

                    <div className="pt-3 border-t border-editorial-border">
                      <MediaAssetControl
                        label="Resume PDF Document"
                        description="Paste an externally hosted PDF link (e.g. Google Drive public link, Dropbox, GitHub, personal domain) for a permanent download button, or preview a local PDF."
                        value={data.resumeUrl || ""}
                        onChange={(url) =>
                          updateData((prev) => ({ ...prev, resumeUrl: url, resumeURL: url }))
                        }
                        variant="document"
                        type="pdf"
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

                        <div className="pt-1">
                          <MediaAssetControl
                            label="Cover Screenshot / Image"
                            description="Paste a hosted screenshot URL or preview a local image."
                            value={proj.coverImageUrl || ""}
                            onChange={(url) => {
                              updateData((prev) => ({
                                ...prev,
                                projects: prev.projects.map((p) =>
                                  p.id === proj.id ? { ...p, coverImageUrl: url } : p
                                ),
                              }));
                            }}
                            variant="cover"
                            type="image"
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
              <div className="space-y-6">
                {/* Dynamic Custom Sections Manager */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-lg text-editorial-charcoal">
                        Dynamic Sections
                      </h3>
                      <p className="text-xs text-editorial-muted">
                        Specialized sections for Hackathons, Publications, Talks, etc.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsSectionBuilderOpen(true)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-editorial-charcoal text-editorial-ivory text-xs font-mono uppercase tracking-wider hover:bg-black transition-colors shadow-sm"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Section</span>
                    </button>
                  </div>

                  {/* Empty state or list */}
                  {(!data.dynamicSections || data.dynamicSections.length === 0) ? (
                    <div className="p-5 text-center border border-dashed border-editorial-border bg-white rounded space-y-3">
                      <p className="text-xs text-editorial-muted">
                        No custom dynamic sections added yet. Expand your portfolio with hackathons, research, photography, or AI-generated sections.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsSectionBuilderOpen(true)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded border border-editorial-charcoal text-editorial-charcoal text-xs font-mono uppercase tracking-wider hover:bg-editorial-sand/30 transition-colors"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Explore Blueprint Library</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {[...data.dynamicSections]
                        .sort((a, b) => a.order - b.order)
                        .map((sec, idx, arr) => {
                          const isExpanded = Boolean(expandedSectionIds[sec.id]);
                          const entriesCount = (sec.entries || []).length;

                          return (
                            <div
                              key={sec.id}
                              className="border border-editorial-border bg-white rounded-lg overflow-hidden transition-all shadow-sm"
                            >
                              {/* Header Card */}
                              <div className="p-3.5 bg-editorial-ivory/20 space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center space-x-2">
                                    {/* Reorder Up/Down */}
                                    <div className="flex flex-col space-y-0.5">
                                      <button
                                        type="button"
                                        disabled={idx === 0}
                                        onClick={() => handleReorderDynamicSection(sec.id, "up")}
                                        className="text-editorial-muted hover:text-editorial-charcoal disabled:opacity-20 p-0.5"
                                        title="Move up"
                                      >
                                        <ArrowUp className="h-3 w-3" />
                                      </button>
                                      <button
                                        type="button"
                                        disabled={idx === arr.length - 1}
                                        onClick={() => handleReorderDynamicSection(sec.id, "down")}
                                        className="text-editorial-muted hover:text-editorial-charcoal disabled:opacity-20 p-0.5"
                                        title="Move down"
                                      >
                                        <ArrowDown className="h-3 w-3" />
                                      </button>
                                    </div>

                                    <div>
                                      <h4
                                        className={`text-xs font-mono uppercase font-bold ${
                                          sec.isVisible
                                            ? "text-editorial-charcoal"
                                            : "text-editorial-muted line-through"
                                        }`}
                                      >
                                        {sec.title}
                                      </h4>
                                      <span className="text-[10px] text-editorial-muted">
                                        {sec.category || "Custom"} • {entriesCount} {entriesCount === 1 ? "entry" : "entries"}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center space-x-1">
                                    <button
                                      type="button"
                                      onClick={() => handleToggleDynamicSectionVisibility(sec.id)}
                                      className={`p-1.5 border rounded ${
                                        sec.isVisible
                                          ? "bg-editorial-charcoal text-white"
                                          : "bg-white text-editorial-muted"
                                      }`}
                                      title={sec.isVisible ? "Hide section" : "Show section"}
                                    >
                                      {sec.isVisible ? (
                                        <Eye className="h-3.5 w-3.5" />
                                      ) : (
                                        <EyeOff className="h-3.5 w-3.5" />
                                      )}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDuplicateDynamicSection(sec.id)}
                                      className="p-1.5 border border-editorial-border rounded bg-white text-editorial-muted hover:text-editorial-charcoal"
                                      title="Duplicate section"
                                    >
                                      <Copy className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteDynamicSection(sec.id)}
                                      className="p-1.5 border border-editorial-border rounded bg-white text-rose-500 hover:bg-rose-50"
                                      title="Delete section"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Layout Selector */}
                                <div className="flex items-center justify-between text-xs font-mono pt-1">
                                  <label className="text-[10px] uppercase text-editorial-muted">
                                    Layout:
                                  </label>
                                  <select
                                    value={sec.layout}
                                    onChange={(e) =>
                                      handleUpdateDynamicSectionLayout(
                                        sec.id,
                                        e.target.value as DynamicSectionLayout
                                      )
                                    }
                                    className="border border-editorial-border rounded px-2 py-0.5 text-xs bg-white text-editorial-charcoal"
                                  >
                                    <option value="cards">Cards</option>
                                    <option value="editorial-cards">Editorial Cards</option>
                                    <option value="timeline">Timeline</option>
                                    <option value="achievement-grid">Achievement Grid</option>
                                    <option value="gallery">Lightbox Gallery</option>
                                    <option value="masonry">Masonry</option>
                                    <option value="list">Minimal List</option>
                                    <option value="stats">Stats & Metrics</option>
                                    <option value="featured">Featured Spotlight</option>
                                    <option value="split">50/50 Split</option>
                                    <option value="minimal">Ultra Minimal</option>
                                  </select>
                                </div>
                              </div>

                              {/* Entries Drawer Header */}
                              <div className="border-t border-editorial-border px-3.5 py-2 bg-white flex items-center justify-between">
                                <button
                                  type="button"
                                  onClick={() => toggleSectionDrawer(sec.id)}
                                  className="flex items-center space-x-1 text-xs font-mono text-editorial-muted hover:text-editorial-charcoal"
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="h-3.5 w-3.5" />
                                  ) : (
                                    <ChevronRight className="h-3.5 w-3.5" />
                                  )}
                                  <span>Manage Entries ({entriesCount})</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenAddEntryModal(sec)}
                                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 text-[11px] font-mono font-medium transition-colors"
                                >
                                  <Plus className="h-3 w-3" />
                                  <span>Add Entry</span>
                                </button>
                              </div>

                              {/* Entries List when expanded */}
                              {isExpanded && (
                                <div className="border-t border-editorial-border/60 p-3 space-y-2 bg-editorial-ivory/10">
                                  {entriesCount === 0 ? (
                                    <div className="text-center py-3 text-xs text-editorial-muted font-mono">
                                      No entries yet. Click "+ Add Entry" to populate this section.
                                    </div>
                                  ) : (
                                    sec.entries.map((item, eIdx) => {
                                      const itemTitle =
                                        item.title ||
                                        item.name ||
                                        item.project_name ||
                                        item.event_name ||
                                        item.topic ||
                                        item.company_name ||
                                        `Entry #${eIdx + 1}`;

                                      return (
                                        <div
                                          key={item.id}
                                          className="flex items-center justify-between p-2 rounded border border-editorial-border/70 bg-white text-xs"
                                        >
                                          <span className="font-medium truncate max-w-[180px] text-editorial-charcoal">
                                            {itemTitle}
                                          </span>
                                          <div className="flex items-center space-x-1">
                                            <button
                                              type="button"
                                              onClick={() => handleOpenEditEntryModal(sec, item)}
                                              className="p-1 text-editorial-muted hover:text-editorial-charcoal"
                                              title="Edit entry"
                                            >
                                              <Edit3 className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleDeleteDynamicEntry(sec.id, item.id)
                                              }
                                              className="p-1 text-editorial-muted hover:text-rose-500"
                                              title="Delete entry"
                                            >
                                              <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>

                {/* Core Predefined Sections */}
                <div className="pt-6 border-t border-editorial-border space-y-3">
                  <div>
                    <h3 className="font-serif text-lg text-editorial-charcoal">
                      Core Portfolio Sections
                    </h3>
                    <p className="text-xs text-editorial-muted">
                      Toggle visibility for default profile sections.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {data.sections.map((sec) => (
                      <div
                        key={sec.id}
                        className="flex items-center justify-between p-3 border border-editorial-border bg-editorial-ivory/30 text-xs font-mono uppercase"
                      >
                        <span
                          className={
                            sec.isVisible
                              ? "text-editorial-charcoal font-semibold"
                              : "text-editorial-muted line-through"
                          }
                        >
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
                            sec.isVisible
                              ? "bg-editorial-charcoal text-white"
                              : "bg-white text-editorial-muted"
                          }`}
                          title={sec.isVisible ? "Hide section" : "Show section"}
                        >
                          {sec.isVisible ? (
                            <Eye className="h-3.5 w-3.5" />
                          ) : (
                            <EyeOff className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
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
                    <span className="border border-r-0 border-editorial-border bg-editorial-sand/30 px-2 py-2 text-xs font-mono text-editorial-muted">
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
                  <p className="mt-1.5 text-[11px] font-mono text-editorial-muted truncate">
                    Live Address: <span className="text-editorial-charcoal font-medium">{getDisplayPortfolioUrl(data.username)}</span>
                  </p>
                </div>

                <div className="pt-4 border-t border-editorial-border space-y-3">
                  <button
                    onClick={handleManualSave}
                    disabled={saveStatus === "saving"}
                    className="w-full flex items-center justify-center space-x-1.5 bg-editorial-charcoal text-editorial-ivory py-2.5 text-xs font-mono uppercase tracking-wider hover:bg-editorial-softdark transition-colors disabled:opacity-50"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>{saveStatus === "saving" ? "Saving Changes..." : "Save All Changes"}</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleLoadSampleData}
                      className="inline-flex items-center justify-center space-x-1 border border-editorial-border bg-white px-2 py-2 text-[10px] font-mono uppercase tracking-wider text-editorial-charcoal hover:bg-editorial-sand/30"
                      title="Fill workspace with rich sample creative portfolio data"
                    >
                      <Sparkles className="h-3 w-3 text-amber-600" />
                      <span>Load Sample</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleClearToEmpty}
                      className="inline-flex items-center justify-center space-x-1 border border-editorial-border bg-white px-2 py-2 text-[10px] font-mono uppercase tracking-wider text-editorial-muted hover:text-editorial-charcoal"
                      title="Clear all fields to clean slate"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Clear All</span>
                    </button>
                  </div>
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

      {/* Dynamic Section Builder Modal */}
      {isSectionBuilderOpen && (
        <SectionBuilderModal
          isOpen={isSectionBuilderOpen}
          onClose={() => setIsSectionBuilderOpen(false)}
          onAddSection={handleAddDynamicSection}
          currentSectionsCount={(data.dynamicSections || []).length}
        />
      )}

      {/* Dynamic Entry Editor Modal */}
      {isEntryEditorOpen && activeDynamicSection && (
        <DynamicEntryEditorModal
          isOpen={isEntryEditorOpen}
          onClose={() => {
            setIsEntryEditorOpen(false);
            setActiveDynamicSection(null);
            setActiveEntryForEdit(null);
          }}
          section={activeDynamicSection}
          entry={activeEntryForEdit}
          onSave={handleSaveDynamicEntry}
        />
      )}

      {/* Email Verification Required Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white border border-editorial-border shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowVerificationModal(false)}
              className="absolute top-4 right-4 text-editorial-muted hover:text-editorial-charcoal p-1 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-editorial-charcoal">
                  Email Verification Required
                </h3>
                <p className="text-xs font-mono text-editorial-muted">Security & Publishing Policy</p>
              </div>
            </div>
            <p className="text-sm text-editorial-charcoal/80 leading-relaxed mb-6 font-sans">
              To publish your website to the live domain, your account email (<strong className="font-semibold text-editorial-charcoal">{user?.email}</strong>) must be verified. This prevents spam and protects our platform domain reputation.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowVerificationModal(false)}
                className="w-full sm:w-auto px-4 py-2 text-xs font-mono uppercase tracking-wider text-editorial-charcoal border border-editorial-border hover:bg-editorial-ivory transition-colors"
              >
                Cancel
              </button>
              <Link
                href="/verify-email"
                className="w-full sm:w-auto px-4 py-2 text-xs font-mono uppercase tracking-wider bg-editorial-charcoal text-editorial-ivory hover:bg-editorial-softdark transition-colors inline-flex items-center justify-center space-x-1.5"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Verify Email</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
