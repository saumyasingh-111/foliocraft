"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import {
  savePortfolio,
  getUserPortfolios,
  checkUsernameAvailability,
} from "@/lib/db/portfolios";
import { createOrUpdateUserProfile } from "@/lib/firebase/firestore";
import { MediaAssetControl } from "@/components/shared/MediaAssetControl";
import {
  PortfolioData,
  EducationItem,
  ExperienceItem,
  SkillItem,
  ProjectItem,
  AchievementItem,
  ThemeId,
} from "@/themes/types";
import {
  THEME_REGISTRY,
  createEmptyPortfolio,
  SAMPLE_DEMO_PORTFOLIO,
} from "@/lib/utils/defaults";
import { slugify } from "@/lib/utils/slugify";
import { getAppDomain } from "@/lib/utils/url";
import {
  User,
  BookOpen,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  Trophy,
  Share2,
  FileText,
  Palette,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Upload,
  Check,
  AlertCircle,
  Eye,
  Sparkles,
} from "lucide-react";

const STEPS = [
  { id: 1, title: "Personal Details", icon: User },
  { id: 2, title: "About Me", icon: BookOpen },
  { id: 3, title: "Education", icon: GraduationCap },
  { id: 4, title: "Experience", icon: Briefcase },
  { id: 5, title: "Skills", icon: Wrench },
  { id: 6, title: "Projects", icon: FolderGit2 },
  { id: 7, title: "Achievements", icon: Trophy },
  { id: 8, title: "Socials", icon: Share2 },
  { id: 9, title: "Resume", icon: FileText },
  { id: 10, title: "Theme & Slug", icon: Palette },
];

function OnboardingWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedTheme = searchParams.get("theme") as ThemeId | null;
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);

  // Draft Portfolio State (Clean empty template)
  const [formData, setFormData] = useState<PortfolioData>(() =>
    createEmptyPortfolio("temp", "draft", "", "")
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load user data or initial draft
  useEffect(() => {
    if (!user) return;

    const init = async () => {
      try {
        const existing = await getUserPortfolios(user.uid);
        if (existing && existing.length > 0) {
          const loaded = { ...existing[0] };
          if (preselectedTheme) {
            loaded.themeId = preselectedTheme;
            const meta = THEME_REGISTRY.find((t) => t.id === preselectedTheme);
            if (meta) loaded.themeSettings = meta.defaultSettings;
          }
          loaded.userId = user.uid;
          loaded.ownerId = user.uid;
          setFormData(loaded);
        } else {
          // Initialize genuinely clean empty fields for the new user
          const usernameSlug = slugify(
            user.displayName || user.email?.split("@")[0] || "creative"
          );
          const empty = createEmptyPortfolio(
            user.uid,
            usernameSlug,
            user.displayName || "",
            user.email || ""
          );
          if (preselectedTheme) {
            empty.themeId = preselectedTheme;
            const meta = THEME_REGISTRY.find((t) => t.id === preselectedTheme);
            if (meta) empty.themeSettings = meta.defaultSettings;
          }
          setFormData(empty);
        }
      } catch (err: any) {
        console.error("Error loading onboarding data:", err);
        setSaveError("Failed to fetch existing portfolio. Starting with a fresh draft.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [user, preselectedTheme]);

  // Load sample demo data on explicit user choice
  const handleLoadSampleData = async () => {
    if (!user) return;
    const usernameSlug = slugify(
      user.displayName || user.email?.split("@")[0] || formData.username || "creative"
    );
    const sample: PortfolioData = {
      ...SAMPLE_DEMO_PORTFOLIO,
      portfolioId: formData.portfolioId,
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
    setFormData(sample);
    await persistChanges(sample);
  };

  // Clear all fields to clean slate
  const handleClearToEmpty = async () => {
    if (!user) return;
    const usernameSlug = slugify(
      user.displayName || user.email?.split("@")[0] || formData.username || "creative"
    );
    const clean = createEmptyPortfolio(
      user.uid,
      usernameSlug,
      user.displayName || "",
      user.email || ""
    );
    clean.portfolioId = formData.portfolioId;
    clean.themeId = formData.themeId;
    clean.themeSettings = formData.themeSettings;
    setFormData(clean);
    await persistChanges(clean);
  };

  // Save intermediate state
  const persistChanges = async (targetData = formData): Promise<boolean> => {
    if (!user) return false;
    setSaveError(null);
    try {
      await savePortfolio({
        ...targetData,
        userId: user.uid,
        ownerId: user.uid,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      return true;
    } catch (err: any) {
      console.error("Save error:", err);
      setSaveError(err?.message || "Failed to save changes to database. Please check your connection.");
      return false;
    }
  };

  const handleNext = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const saved = await persistChanges();
      if (!saved) {
        // Halt if save failed so user is aware of database persistence issue
        return;
      }

      if (currentStep < STEPS.length) {
        setCurrentStep((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        // Final step: validate username and redirect to editor
        const isAvailable = await checkUsernameAvailability(
          formData.username,
          formData.portfolioId
        );
        if (!isAvailable) {
          setSlugError("This username is already taken. Please choose another.");
          return;
        }
        await persistChanges();
        if (user?.uid) {
          await createOrUpdateUserProfile(user.uid, { onboardingCompleted: true }).catch(() => {});
        }
        router.push(`/editor/${formData.portfolioId}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Education Helpers
  const addEducation = () => {
    const item: EducationItem = {
      id: "edu-" + Date.now(),
      institution: "",
      degree: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      current: false,
      grade: "",
      description: "",
    };
    setFormData((prev) => ({ ...prev, education: [...prev.education, item] }));
  };

  const removeEducation = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((e) => e.id !== id),
    }));
  };

  // Experience Helpers
  const addExperience = () => {
    const item: ExperienceItem = {
      id: "exp-" + Date.now(),
      company: "",
      position: "",
      employmentType: "Full-time",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
      skillsUsed: [],
    };
    setFormData((prev) => ({ ...prev, experience: [...prev.experience, item] }));
  };

  const removeExperience = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.filter((e) => e.id !== id),
    }));
  };

  // Skills Helpers
  const addSkill = (name: string, category: SkillItem["category"]) => {
    if (!name.trim()) return;
    const item: SkillItem = {
      id: "sk-" + Date.now(),
      name: name.trim(),
      category,
      proficiency: "Advanced",
    };
    setFormData((prev) => ({ ...prev, skills: [...prev.skills, item] }));
  };

  const removeSkill = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s.id !== id),
    }));
  };

  // Projects Helpers
  const addProject = () => {
    const item: ProjectItem = {
      id: "proj-" + Date.now(),
      title: "",
      description: "",
      category: "Selected Work",
      technologies: [],
      featured: true,
      coverImageUrl: "https://images.unsplash.com/photo-1507842229451-7f01be7ff612?auto=format&fit=crop&w=1200&q=80",
    };
    setFormData((prev) => ({ ...prev, projects: [...prev.projects, item] }));
  };

  const removeProject = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }));
  };

  // Achievements Helpers
  const addAchievement = () => {
    const item: AchievementItem = {
      id: "ach-" + Date.now(),
      title: "",
      organization: "",
      date: new Date().getFullYear().toString(),
      description: "",
    };
    setFormData((prev) => ({ ...prev, achievements: [...prev.achievements, item] }));
  };

  const removeAchievement = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      achievements: prev.achievements.filter((a) => a.id !== id),
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-editorial-ivory flex flex-col items-center justify-center">
        <div className="h-8 w-8 border-2 border-editorial-charcoal border-t-transparent rounded-full animate-spin mb-3" />
        <span className="font-mono text-xs uppercase text-editorial-muted">Preparing Wizard...</span>
      </div>
    );
  }

  const progressPercent = Math.round((currentStep / STEPS.length) * 100);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 lg:px-12">
      {/* Wizard Header & Progress */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-editorial-mocha font-semibold">
              Step {currentStep} of {STEPS.length}
            </span>
            <h1 className="font-serif text-3xl text-editorial-charcoal mt-1">
              {STEPS[currentStep - 1].title}
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleLoadSampleData}
              className="inline-flex items-center space-x-1.5 border border-editorial-border bg-white px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider text-editorial-charcoal hover:bg-editorial-sand/30"
              title="Fill fields with sample creative portfolio data"
            >
              <Sparkles className="h-3 w-3 text-amber-600" />
              <span>Load Sample Data</span>
            </button>
            <button
              type="button"
              onClick={handleClearToEmpty}
              className="inline-flex items-center space-x-1.5 border border-editorial-border bg-white px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider text-editorial-muted hover:text-editorial-charcoal"
              title="Reset all fields to clean empty draft"
            >
              <Trash2 className="h-3 w-3" />
              <span>Clear to Empty</span>
            </button>
            <button
              onClick={() => {
                persistChanges();
                router.push("/dashboard");
              }}
              className="text-xs font-mono uppercase tracking-wider text-editorial-muted hover:text-editorial-charcoal ml-2"
            >
              Save & Exit
            </button>
          </div>
        </div>

        {/* Database Persistence Status & Alerts */}
        {saveError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-mono flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-500" />
            <span>{saveError}</span>
          </div>
        )}
        {saveSuccess && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono flex items-center space-x-2">
            <Check className="h-4 w-4 flex-shrink-0 text-emerald-500" />
            <span>Progress saved to database.</span>
          </div>
        )}

        {/* Visual Progress Bar */}
        <div className="h-1.5 w-full bg-editorial-border overflow-hidden">
          <div
            className="h-full bg-editorial-charcoal transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step Tabs indicator */}
        <div className="hidden sm:flex items-center justify-between overflow-x-auto py-2 text-[11px] font-mono uppercase text-editorial-muted border-b border-editorial-border/60">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isCurrent = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            return (
              <button
                key={step.id}
                onClick={() => {
                  persistChanges();
                  setCurrentStep(step.id);
                }}
                className={`flex items-center space-x-1.5 px-2 py-1 transition-colors ${
                  isCurrent
                    ? "text-editorial-charcoal font-bold border-b-2 border-editorial-charcoal"
                    : isCompleted
                    ? "text-editorial-mocha hover:text-editorial-charcoal"
                    : "opacity-50 hover:opacity-80"
                }`}
              >
                <Icon className="h-3 w-3" />
                <span>{step.id}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Wizard Form Container */}
      <div className="border border-editorial-border bg-white p-8 lg:p-10 shadow-editorial mb-8">
        
        {/* =========================================================================
            STEP 1: PERSONAL INFORMATION
        ========================================================================== */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <p className="text-xs text-editorial-muted font-sans">
              Introduce yourself with basic credentials. You can update this at any time in the live editor.
            </p>

            <MediaAssetControl
              label="Profile Photograph"
              description="Upload a photo from your device (permanently saved) or provide an external image URL."
              value={formData.personalInfo.avatarUrl || ""}
              onChange={(url) =>
                setFormData((prev) => ({
                  ...prev,
                  profileImage: url || null,
                  personalInfo: { ...prev.personalInfo, avatarUrl: url || undefined },
                }))
              }
              variant="avatar"
              type="image"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-editorial-charcoal font-medium">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.personalInfo.fullName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, fullName: e.target.value },
                    }))
                  }
                  placeholder="e.g. Alex Morgan"
                  className="mt-1.5 block w-full border border-editorial-border bg-editorial-ivory/30 px-3.5 py-2.5 text-sm text-editorial-charcoal focus:border-editorial-charcoal focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-editorial-charcoal font-medium">
                  Professional Title *
                </label>
                <input
                  type="text"
                  value={formData.personalInfo.professionalTitle}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, professionalTitle: e.target.value },
                    }))
                  }
                  placeholder="e.g. Systems Architect & Designer"
                  className="mt-1.5 block w-full border border-editorial-border bg-editorial-ivory/30 px-3.5 py-2.5 text-sm text-editorial-charcoal focus:border-editorial-charcoal focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-editorial-charcoal font-medium">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.personalInfo.location || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, location: e.target.value },
                    }))
                  }
                  placeholder="e.g. San Francisco & Tokyo"
                  className="mt-1.5 block w-full border border-editorial-border bg-editorial-ivory/30 px-3.5 py-2.5 text-sm text-editorial-charcoal focus:border-editorial-charcoal focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-editorial-charcoal font-medium">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={formData.personalInfo.email || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, email: e.target.value },
                    }))
                  }
                  placeholder="e.g. alex@morgan.design"
                  className="mt-1.5 block w-full border border-editorial-border bg-editorial-ivory/30 px-3.5 py-2.5 text-sm text-editorial-charcoal focus:border-editorial-charcoal focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-editorial-charcoal font-medium">
                Personal Tagline
              </label>
              <input
                type="text"
                value={formData.personalInfo.tagline || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, tagline: e.target.value },
                  }))
                }
                placeholder="e.g. Crafting digital artifacts with quiet precision and enduring clarity."
                className="mt-1.5 block w-full border border-editorial-border bg-editorial-ivory/30 px-3.5 py-2.5 text-sm text-editorial-charcoal focus:border-editorial-charcoal focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-editorial-charcoal font-medium">
                Hero Headline (Large Display Text)
              </label>
              <textarea
                rows={2}
                value={formData.personalInfo.heroHeadline || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, heroHeadline: e.target.value },
                  }))
                }
                placeholder="e.g. Designing products where visual elegance meets rigorous architecture."
                className="mt-1.5 block w-full border border-editorial-border bg-editorial-ivory/30 px-3.5 py-2.5 text-sm text-editorial-charcoal focus:border-editorial-charcoal focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 2: ABOUT ME
        ========================================================================== */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <p className="text-xs text-editorial-muted font-sans">
              Provide context about your background, narrative, and technical interests.
            </p>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-editorial-charcoal font-medium">
                Long Biography (About Me narrative)
              </label>
              <textarea
                rows={5}
                value={formData.about.bioLong || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    about: { ...prev.about, bioLong: e.target.value },
                  }))
                }
                placeholder="Share your journey, philosophy, design approach, or engineering background..."
                className="mt-1.5 block w-full border border-editorial-border bg-editorial-ivory/30 px-3.5 py-2.5 text-sm text-editorial-charcoal focus:border-editorial-charcoal focus:bg-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-editorial-charcoal font-medium">
                  Years of Professional Experience
                </label>
                <input
                  type="number"
                  value={formData.about.yearsOfExperience || 0}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      about: { ...prev.about, yearsOfExperience: parseInt(e.target.value) || 0 },
                    }))
                  }
                  className="mt-1.5 block w-full border border-editorial-border bg-editorial-ivory/30 px-3.5 py-2.5 text-sm text-editorial-charcoal focus:border-editorial-charcoal focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-editorial-charcoal font-medium">
                  Status Indicator (e.g. Availability)
                </label>
                <input
                  type="text"
                  value={formData.personalInfo.statusBadge || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, statusBadge: e.target.value },
                    }))
                  }
                  placeholder="e.g. Open to senior roles & advisory"
                  className="mt-1.5 block w-full border border-editorial-border bg-editorial-ivory/30 px-3.5 py-2.5 text-sm text-editorial-charcoal focus:border-editorial-charcoal focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 3: EDUCATION
        ========================================================================== */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-xs text-editorial-muted font-sans">
                List degrees, institutions, or courses. Optional section.
              </p>
              <button
                type="button"
                onClick={addEducation}
                className="inline-flex items-center space-x-1.5 border border-editorial-border bg-editorial-ivory px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-editorial-charcoal hover:bg-editorial-sand/30"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Institution</span>
              </button>
            </div>

            {formData.education.map((edu, idx) => (
              <div key={edu.id} className="border border-editorial-border p-5 bg-editorial-ivory/20 space-y-4 relative">
                <div className="flex items-center justify-between border-b border-editorial-border pb-2">
                  <span className="text-xs font-mono uppercase text-editorial-mocha font-semibold">
                    Education #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeEducation(edu.id)}
                    className="text-red-500 hover:text-red-700 text-xs font-mono uppercase"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-editorial-charcoal">Institution</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          education: prev.education.map((item) =>
                            item.id === edu.id ? { ...item, institution: val } : item
                          ),
                        }));
                      }}
                      placeholder="e.g. RISD or Stanford University"
                      className="mt-1 block w-full border border-editorial-border bg-white px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-editorial-charcoal">Degree & Major</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          education: prev.education.map((item) =>
                            item.id === edu.id ? { ...item, degree: val } : item
                          ),
                        }));
                      }}
                      placeholder="e.g. B.S. in Computer Science"
                      className="mt-1 block w-full border border-editorial-border bg-white px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-editorial-charcoal">Years (e.g. 2018 - 2022)</label>
                    <input
                      type="text"
                      value={edu.startDate}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          education: prev.education.map((item) =>
                            item.id === edu.id ? { ...item, startDate: val } : item
                          ),
                        }));
                      }}
                      placeholder="e.g. 2018 - 2022"
                      className="mt-1 block w-full border border-editorial-border bg-white px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-editorial-charcoal">Grade or Honor (Optional)</label>
                    <input
                      type="text"
                      value={edu.grade || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          education: prev.education.map((item) =>
                            item.id === edu.id ? { ...item, grade: val } : item
                          ),
                        }));
                      }}
                      placeholder="e.g. Summa Cum Laude"
                      className="mt-1 block w-full border border-editorial-border bg-white px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =========================================================================
            STEP 4: EXPERIENCE
        ========================================================================== */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-xs text-editorial-muted font-sans">
                Add employment history, agency work, or independent client engagements.
              </p>
              <button
                type="button"
                onClick={addExperience}
                className="inline-flex items-center space-x-1.5 border border-editorial-border bg-editorial-ivory px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-editorial-charcoal hover:bg-editorial-sand/30"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Position</span>
              </button>
            </div>

            {formData.experience.map((exp, idx) => (
              <div key={exp.id} className="border border-editorial-border p-5 bg-editorial-ivory/20 space-y-4">
                <div className="flex items-center justify-between border-b border-editorial-border pb-2">
                  <span className="text-xs font-mono uppercase text-editorial-mocha font-semibold">
                    Experience #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeExperience(exp.id)}
                    className="text-red-500 hover:text-red-700 text-xs font-mono uppercase"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-editorial-charcoal">Company</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          experience: prev.experience.map((item) =>
                            item.id === exp.id ? { ...item, company: val } : item
                          ),
                        }));
                      }}
                      placeholder="e.g. Aura Systems"
                      className="mt-1 block w-full border border-editorial-border bg-white px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-editorial-charcoal">Position / Role</label>
                    <input
                      type="text"
                      value={exp.position}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          experience: prev.experience.map((item) =>
                            item.id === exp.id ? { ...item, position: val } : item
                          ),
                        }));
                      }}
                      placeholder="e.g. Staff Product Designer"
                      className="mt-1 block w-full border border-editorial-border bg-white px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-editorial-charcoal">Duration</label>
                    <input
                      type="text"
                      value={exp.startDate}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          experience: prev.experience.map((item) =>
                            item.id === exp.id ? { ...item, startDate: val } : item
                          ),
                        }));
                      }}
                      placeholder="e.g. 2021 — Present"
                      className="mt-1 block w-full border border-editorial-border bg-white px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-editorial-charcoal">Location</label>
                    <input
                      type="text"
                      value={exp.location || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          experience: prev.experience.map((item) =>
                            item.id === exp.id ? { ...item, location: val } : item
                          ),
                        }));
                      }}
                      placeholder="e.g. San Francisco (Remote)"
                      className="mt-1 block w-full border border-editorial-border bg-white px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-editorial-charcoal">Description</label>
                  <textarea
                    rows={2}
                    value={exp.description}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        experience: prev.experience.map((item) =>
                          item.id === exp.id ? { ...item, description: val } : item
                        ),
                      }));
                    }}
                    placeholder="Key accomplishments, leadership responsibilities, or impact metrics..."
                    className="mt-1 block w-full border border-editorial-border bg-white px-3 py-2 text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =========================================================================
            STEP 5: SKILLS
        ========================================================================== */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <p className="text-xs text-editorial-muted font-sans">
              Enter your core competencies. You can tag technical skills, languages, tools, and design capabilities.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              {formData.skills.map((skill) => (
                <span
                  key={skill.id}
                  className="inline-flex items-center space-x-1.5 border border-editorial-border bg-editorial-ivory px-3 py-1.5 text-xs font-mono text-editorial-charcoal"
                >
                  <span>{skill.name}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(skill.id)}
                    className="text-editorial-muted hover:text-red-600 ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="pt-4 border-t border-editorial-border flex items-center space-x-3">
              <input
                id="new-skill-input"
                type="text"
                placeholder="Add skill (e.g. Next.js, Figma, Strategic Writing)..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const el = e.currentTarget;
                    addSkill(el.value, "Technical");
                    el.value = "";
                  }
                }}
                className="border border-editorial-border bg-white px-3.5 py-2 text-sm text-editorial-charcoal flex-grow focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("new-skill-input") as HTMLInputElement;
                  if (el) {
                    addSkill(el.value, "Technical");
                    el.value = "";
                  }
                }}
                className="border border-editorial-charcoal bg-editorial-charcoal text-editorial-ivory px-4 py-2 text-xs font-mono uppercase"
              >
                Add Skill
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 6: PROJECTS
        ========================================================================== */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-xs text-editorial-muted font-sans">
                Showcase your featured projects, case studies, or published work.
              </p>
              <button
                type="button"
                onClick={addProject}
                className="inline-flex items-center space-x-1.5 border border-editorial-border bg-editorial-ivory px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-editorial-charcoal hover:bg-editorial-sand/30"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Project</span>
              </button>
            </div>

            {formData.projects.map((proj, idx) => (
              <div key={proj.id} className="border border-editorial-border p-5 bg-editorial-ivory/20 space-y-4">
                <div className="flex items-center justify-between border-b border-editorial-border pb-2">
                  <span className="text-xs font-mono uppercase text-editorial-mocha font-semibold">
                    Project #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeProject(proj.id)}
                    className="text-red-500 hover:text-red-700 text-xs font-mono uppercase"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-editorial-charcoal">Project Title</label>
                    <input
                      type="text"
                      value={proj.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          projects: prev.projects.map((p) =>
                            p.id === proj.id ? { ...p, title: val } : p
                          ),
                        }));
                      }}
                      placeholder="e.g. Chronicle — Editorial Journal"
                      className="mt-1 block w-full border border-editorial-border bg-white px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-editorial-charcoal">Category / Domain</label>
                    <input
                      type="text"
                      value={proj.category}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          projects: prev.projects.map((p) =>
                            p.id === proj.id ? { ...p, category: val } : p
                          ),
                        }));
                      }}
                      placeholder="e.g. Web Application & Typography"
                      className="mt-1 block w-full border border-editorial-border bg-white px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-editorial-charcoal">Demo / Live URL (Optional)</label>
                    <input
                      type="url"
                      value={proj.demoUrl || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          projects: prev.projects.map((p) =>
                            p.id === proj.id ? { ...p, demoUrl: val } : p
                          ),
                        }));
                      }}
                      placeholder="https://example.com"
                      className="mt-1 block w-full border border-editorial-border bg-white px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-editorial-charcoal">GitHub / Repository (Optional)</label>
                    <input
                      type="url"
                      value={proj.githubUrl || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          projects: prev.projects.map((p) =>
                            p.id === proj.id ? { ...p, githubUrl: val } : p
                          ),
                        }));
                      }}
                      placeholder="https://github.com/..."
                      className="mt-1 block w-full border border-editorial-border bg-white px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-editorial-charcoal">Description</label>
                  <textarea
                    rows={2}
                    value={proj.description}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        projects: prev.projects.map((p) =>
                          p.id === proj.id ? { ...p, description: val } : p
                        ),
                      }));
                    }}
                    placeholder="Summary of the project problem, architecture, or creative decisions..."
                    className="mt-1 block w-full border border-editorial-border bg-white px-3 py-2 text-sm"
                  />
                </div>

                <div className="pt-2">
                  <MediaAssetControl
                    label="Project Cover Screenshot"
                    description="Provide a hosted image link or select a local image for temporary preview."
                    value={proj.coverImageUrl || ""}
                    onChange={(url) => {
                      setFormData((prev) => ({
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
              </div>
            ))}
          </div>
        )}

        {/* =========================================================================
            STEP 7: ACHIEVEMENTS & CERTIFICATIONS
        ========================================================================== */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-xs text-editorial-muted font-sans">
                Awards, press mentions, or certifications. Optional.
              </p>
              <button
                type="button"
                onClick={addAchievement}
                className="inline-flex items-center space-x-1.5 border border-editorial-border bg-editorial-ivory px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-editorial-charcoal hover:bg-editorial-sand/30"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Award / Honor</span>
              </button>
            </div>

            {formData.achievements.map((ach, idx) => (
              <div key={ach.id} className="border border-editorial-border p-5 bg-editorial-ivory/20 space-y-4">
                <div className="flex items-center justify-between border-b border-editorial-border pb-2">
                  <span className="text-xs font-mono uppercase text-editorial-mocha font-semibold">
                    Achievement #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAchievement(ach.id)}
                    className="text-red-500 hover:text-red-700 text-xs font-mono uppercase"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-editorial-charcoal">Honor / Title</label>
                    <input
                      type="text"
                      value={ach.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          achievements: prev.achievements.map((a) =>
                            a.id === ach.id ? { ...a, title: val } : a
                          ),
                        }));
                      }}
                      placeholder="e.g. Site of the Day"
                      className="mt-1 block w-full border border-editorial-border bg-white px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-editorial-charcoal">Organization</label>
                    <input
                      type="text"
                      value={ach.organization}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          achievements: prev.achievements.map((a) =>
                            a.id === ach.id ? { ...a, organization: val } : a
                          ),
                        }));
                      }}
                      placeholder="e.g. Awwwards or Red Dot"
                      className="mt-1 block w-full border border-editorial-border bg-white px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =========================================================================
            STEP 8: SOCIAL LINKS
        ========================================================================== */}
        {currentStep === 8 && (
          <div className="space-y-6">
            <p className="text-xs text-editorial-muted font-sans">
              Connect your online presence. Unfilled links will automatically be hidden on your portfolio.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-editorial-charcoal font-medium">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={formData.socialLinks.linkedin || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, linkedin: e.target.value },
                    }))
                  }
                  placeholder="https://linkedin.com/in/..."
                  className="mt-1.5 block w-full border border-editorial-border bg-editorial-ivory/30 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-editorial-charcoal font-medium">
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={formData.socialLinks.github || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, github: e.target.value },
                    }))
                  }
                  placeholder="https://github.com/..."
                  className="mt-1.5 block w-full border border-editorial-border bg-editorial-ivory/30 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-editorial-charcoal font-medium">
                  Twitter / X
                </label>
                <input
                  type="url"
                  value={formData.socialLinks.twitter || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, twitter: e.target.value },
                    }))
                  }
                  placeholder="https://x.com/..."
                  className="mt-1.5 block w-full border border-editorial-border bg-editorial-ivory/30 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-editorial-charcoal font-medium">
                  Dribbble or Behance
                </label>
                <input
                  type="url"
                  value={formData.socialLinks.dribbble || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, dribbble: e.target.value },
                    }))
                  }
                  placeholder="https://dribbble.com/..."
                  className="mt-1.5 block w-full border border-editorial-border bg-editorial-ivory/30 px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 9: RESUME
        ========================================================================== */}
        {currentStep === 9 && (
          <div className="space-y-6">
            <p className="text-xs text-editorial-muted font-sans">
              Provide an optional PDF resume or hosted document link. A download button will appear on your published portfolio.
            </p>

            <MediaAssetControl
              label="Resume PDF Document"
              description="Provide an externally hosted PDF link (e.g. Google Drive public link, Dropbox, GitHub, or personal site) for permanent download, or select a local PDF for temporary session preview."
              value={formData.resumeUrl || ""}
              onChange={(url) =>
                setFormData((prev) => ({ ...prev, resumeUrl: url, resumeURL: url }))
              }
              variant="document"
              type="pdf"
            />
          </div>
        )}

        {/* =========================================================================
            STEP 10: THEME SELECTION & SLUG
        ========================================================================== */}
        {currentStep === 10 && (
          <div className="space-y-8">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-editorial-charcoal font-medium">
                Claim Your Unique URL Slug *
              </label>
              <div className="mt-1.5 flex items-center">
                <span className="border border-r-0 border-editorial-border bg-editorial-sand/30 px-3 py-2.5 text-xs font-mono text-editorial-charcoal">
                  {getAppDomain()}/portfolio/
                </span>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => {
                    setSlugError(null);
                    setFormData((prev) => ({
                      ...prev,
                      username: slugify(e.target.value),
                    }));
                  }}
                  placeholder="alex-morgan"
                  className="block w-full border border-editorial-border bg-editorial-ivory/30 px-3.5 py-2.5 text-sm font-mono text-editorial-charcoal focus:border-editorial-charcoal focus:bg-white focus:outline-none"
                  required
                />
              </div>
              {slugError && (
                <div className="mt-2 flex items-center space-x-1.5 text-xs text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>{slugError}</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-mono uppercase tracking-wider text-editorial-charcoal font-medium">
                Choose Your Portfolio Archetype
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {THEME_REGISTRY.map((theme) => {
                  const isSelected = formData.themeId === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          themeId: theme.id,
                          themeSettings: theme.defaultSettings,
                        }))
                      }
                      className={`text-left border p-4 transition-all ${
                        isSelected
                          ? "border-editorial-charcoal bg-editorial-sand/30 shadow-md ring-1 ring-editorial-charcoal"
                          : "border-editorial-border bg-white hover:border-editorial-charcoal/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 bg-editorial-ivory border border-editorial-border">
                          {theme.category}
                        </span>
                        {isSelected && <Check className="h-4 w-4 text-editorial-charcoal" />}
                      </div>
                      <h4 className="font-serif text-base text-editorial-charcoal font-medium">
                        {theme.name}
                      </h4>
                      <p className="text-[11px] text-editorial-muted mt-1 line-clamp-2">
                        {theme.tagline}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 1}
          className="inline-flex items-center space-x-1.5 border border-editorial-border bg-white px-5 py-2.5 text-xs font-mono uppercase tracking-wider text-editorial-charcoal hover:bg-editorial-sand/20 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Previous</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={saving}
          className="inline-flex items-center space-x-2 bg-editorial-charcoal px-6 py-2.5 text-xs font-mono uppercase tracking-wider text-editorial-ivory hover:bg-editorial-softdark transition-colors disabled:opacity-50"
        >
          <span>
            {currentStep === STEPS.length
              ? "Finish & Open Visual Studio"
              : "Next Step"}
          </span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-mono text-xs">Loading Wizard...</div>}>
      <OnboardingWizardContent />
    </Suspense>
  );
}
