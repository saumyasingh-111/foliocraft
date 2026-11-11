"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import {
  getUserPortfolios,
  savePortfolio,
  deletePortfolio,
  getPortfolioAnalytics,
} from "@/lib/db/portfolios";
import { PortfolioData, ThemeId } from "@/themes/types";
import { THEME_REGISTRY, INITIAL_DEFAULT_PORTFOLIO } from "@/lib/utils/defaults";
import { getPortfolioUrl, getDisplayPortfolioUrl } from "@/lib/utils/url";
import {
  Globe,
  Edit3,
  ExternalLink,
  Copy,
  Check,
  Plus,
  Trash2,
  CopyPlus,
  Eye,
  Sparkles,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  Palette,
  BarChart2,
  Users,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [portfolios, setPortfolios] = useState<PortfolioData[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<{ visitorCount: number; pageViews: number; lastVisited: string } | null>(null);

  useEffect(() => {
    if (user?.uid) {
      loadUserPortfolios(user.uid);
    }
  }, [user]);

  const loadUserPortfolios = async (uid: string) => {
    setLoading(true);
    try {
      const data = await getUserPortfolios(uid);
      setPortfolios(data);
      if (data.length > 0) {
        const stats = await getPortfolioAnalytics(data[0].portfolioId);
        if (stats) setAnalytics(stats);
      }
    } catch (err) {
      console.error("Failed to load user portfolios:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = (username: string, portfolioId: string) => {
    const url = getPortfolioUrl(username);
    navigator.clipboard.writeText(url);
    setCopiedId(portfolioId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleTogglePublish = async (portfolio: PortfolioData) => {
    const nextState = !portfolio.isPublished;
    const updated: PortfolioData = {
      ...portfolio,
      isPublished: nextState,
      publishedAt: nextState ? new Date().toISOString() : portfolio.publishedAt,
    };
    await savePortfolio(updated);
    setPortfolios((prev) =>
      prev.map((p) => (p.portfolioId === updated.portfolioId ? updated : p))
    );
    setActionMessage(
      nextState
        ? `"${portfolio.title}" is now publicly accessible!`
        : `"${portfolio.title}" has been unpublished.`
    );
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleDuplicate = async (portfolio: PortfolioData) => {
    if (!user) return;
    const newId = "p-" + Math.random().toString(36).substring(2, 9);
    const newUsername = `${portfolio.username}-copy-${Math.floor(Math.random() * 900 + 100)}`;
    const duplicated: PortfolioData = {
      ...portfolio,
      portfolioId: newId,
      title: `${portfolio.title} (Copy)`,
      username: newUsername,
      isPublished: false,
      publishedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await savePortfolio(duplicated);
    setPortfolios((prev) => [duplicated, ...prev]);
    setActionMessage(`Duplicated as "${duplicated.title}".`);
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleDelete = async (portfolioId: string) => {
    if (portfolios.length <= 1) {
      alert("You must maintain at least one portfolio draft.");
      return;
    }
    if (!confirm("Are you sure you want to delete this portfolio? This cannot be undone.")) {
      return;
    }
    await deletePortfolio(portfolioId, user?.uid);
    setPortfolios((prev) => prev.filter((p) => p.portfolioId !== portfolioId));
    setActionMessage("Portfolio deleted.");
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleCreateNew = async () => {
    if (!user) return;
    const newId = "p-" + Math.random().toString(36).substring(2, 9);
    const usernameSlug = (user.displayName || user.email?.split("@")[0] || "user")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "") + "-" + Math.floor(Math.random() * 900 + 100);

    const newPortfolio: PortfolioData = {
      ...INITIAL_DEFAULT_PORTFOLIO,
      portfolioId: newId,
      userId: user.uid,
      title: `${user.displayName || "My"} Portfolio`,
      username: usernameSlug,
      isPublished: false,
      publishedAt: null,
      personalInfo: {
        ...INITIAL_DEFAULT_PORTFOLIO.personalInfo,
        fullName: user.displayName || "Creative Practitioner",
        email: user.email || "",
      },
    };

    await savePortfolio(newPortfolio);
    router.push(`/editor/${newId}`);
  };

  // Helper to compute completeness percentage
  const calculateCompleteness = (p: PortfolioData) => {
    let score = 0;
    if (p.personalInfo.fullName) score += 15;
    if (p.personalInfo.tagline || p.personalInfo.heroHeadline) score += 15;
    if (p.about.bioLong) score += 15;
    if (p.projects && p.projects.length > 0) score += 25;
    if (p.experience && p.experience.length > 0) score += 15;
    if (p.skills && p.skills.length > 0) score += 15;
    return Math.min(100, score);
  };

  const primaryPortfolio = portfolios[0];

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-12">
      
      {/* Toast alert banner */}
      {actionMessage && (
        <div className="mb-6 flex items-center justify-between border border-editorial-charcoal bg-editorial-charcoal px-5 py-3 text-xs font-mono uppercase tracking-wider text-editorial-ivory animate-fade-in">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="opacity-70 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      {/* Overview Banner */}
      <div className="border border-editorial-border bg-white p-8 lg:p-10 shadow-editorial mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-editorial-mocha font-semibold">
              Personal Portfolio Studio
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-editorial-charcoal">
              Welcome, {user?.displayName || "Creative"}
            </h1>
            <p className="text-sm text-editorial-charcoal/70 max-w-xl font-sans">
              Manage your personal portfolios, customize editorial themes, and monitor publication status.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center space-x-2 border border-editorial-charcoal bg-editorial-charcoal px-5 py-2.5 text-xs font-mono uppercase tracking-wider text-editorial-ivory hover:bg-editorial-softdark transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Portfolio</span>
            </button>

            <Link
              href="/onboarding"
              className="inline-flex items-center space-x-2 border border-editorial-border bg-editorial-card px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-editorial-charcoal hover:bg-editorial-sand/40 transition-colors"
            >
              <Sparkles className="h-4 w-4 text-editorial-mocha" />
              <span>Run Profile Wizard</span>
            </Link>
          </div>
        </div>

        {/* Real Analytics Quick Bar */}
        {primaryPortfolio && (
          <div className="mt-8 pt-6 border-t border-editorial-border/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 border border-editorial-border bg-editorial-ivory/40">
              <span className="text-[10px] font-mono uppercase tracking-wider text-editorial-muted block">
                Publication Status
              </span>
              <span className="text-sm font-serif font-bold text-editorial-charcoal mt-0.5 block">
                {primaryPortfolio.isPublished ? "Live (Public)" : "Draft (Private)"}
              </span>
            </div>

            <div className="p-3 border border-editorial-border bg-editorial-ivory/40">
              <span className="text-[10px] font-mono uppercase tracking-wider text-editorial-muted block">
                Total Page Views
              </span>
              <span className="text-sm font-serif font-bold text-editorial-charcoal mt-0.5 block">
                {analytics?.pageViews ?? 0}
              </span>
            </div>

            <div className="p-3 border border-editorial-border bg-editorial-ivory/40">
              <span className="text-[10px] font-mono uppercase tracking-wider text-editorial-muted block">
                Active Theme
              </span>
              <span className="text-sm font-serif font-bold text-editorial-charcoal mt-0.5 block truncate">
                {THEME_REGISTRY.find((t) => t.id === primaryPortfolio.themeId)?.name || primaryPortfolio.themeId}
              </span>
            </div>

            <div className="p-3 border border-editorial-border bg-editorial-ivory/40">
              <span className="text-[10px] font-mono uppercase tracking-wider text-editorial-muted block">
                Profile Completeness
              </span>
              <span className="text-sm font-serif font-bold text-editorial-charcoal mt-0.5 block">
                {calculateCompleteness(primaryPortfolio)}%
              </span>
            </div>
          </div>
        )}

        {/* Primary Portfolio Quick URL Bar */}
        {primaryPortfolio && (
          <div className="mt-6 pt-6 border-t border-editorial-border/60 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-xs font-mono uppercase text-editorial-muted whitespace-nowrap">
                Public Web Address:
              </span>
              <div className="flex items-center space-x-2 bg-editorial-ivory px-3.5 py-2 border border-editorial-border flex-grow text-xs font-mono text-editorial-charcoal overflow-hidden">
                <Globe className="h-4 w-4 text-editorial-mocha flex-shrink-0" />
                <span className="truncate">
                  {getDisplayPortfolioUrl(primaryPortfolio.username)}
                </span>
              </div>
            </div>

            <div className="md:col-span-4 flex items-center justify-start md:justify-end space-x-3">
              <button
                onClick={() => handleCopyUrl(primaryPortfolio.username, primaryPortfolio.portfolioId)}
                className="inline-flex items-center space-x-1.5 border border-editorial-border bg-white px-3 py-2 text-xs font-mono uppercase tracking-wider text-editorial-charcoal hover:bg-editorial-sand/30 transition-colors"
              >
                {copiedId === primaryPortfolio.portfolioId ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-editorial-mocha" />
                    <span>Copy URL</span>
                  </>
                )}
              </button>

              <Link
                href={getPortfolioUrl(primaryPortfolio.username)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 bg-editorial-charcoal px-3 py-2 text-xs font-mono uppercase tracking-wider text-editorial-ivory hover:bg-editorial-softdark transition-colors"
              >
                <span>View Live</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Portfolios Grid Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl text-editorial-charcoal">
            My Portfolios ({portfolios.length})
          </h2>
          <p className="text-xs text-editorial-muted font-mono">
            Each portfolio has independent content, theme selections, and custom URLs.
          </p>
        </div>
      </div>

      {/* Portfolios Cards Grid */}
      {loading ? (
        <div className="border border-editorial-border bg-white p-12 text-center">
          <div className="inline-block h-8 w-8 border-2 border-editorial-charcoal border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-mono uppercase text-editorial-muted">Retrieving Portfolios from Firestore...</p>
        </div>
      ) : portfolios.length === 0 ? (
        <div className="border border-editorial-border bg-white p-12 text-center space-y-4">
          <Layers className="h-10 w-10 text-editorial-sand mx-auto" />
          <h3 className="font-serif text-xl text-editorial-charcoal">No Portfolios Found</h3>
          <p className="text-sm text-editorial-muted max-w-sm mx-auto">
            You haven’t created a portfolio yet. Launch the wizard or generate a draft instantly.
          </p>
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center space-x-2 bg-editorial-charcoal px-5 py-2.5 text-xs font-mono uppercase tracking-wider text-editorial-ivory"
          >
            <Plus className="h-4 w-4" />
            <span>Create First Portfolio</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {portfolios.map((item) => {
            const themeMeta = THEME_REGISTRY.find((t) => t.id === item.themeId) || THEME_REGISTRY[0];
            const completeness = calculateCompleteness(item);

            return (
              <div
                key={item.portfolioId}
                className="border border-editorial-border bg-white flex flex-col justify-between transition-all hover:border-editorial-charcoal hover:shadow-editorial"
              >
                {/* Visual Thumbnail Frame */}
                <div
                  className="relative h-48 border-b p-5 flex flex-col justify-between"
                  style={{
                    backgroundColor: item.themeSettings.palette.background,
                    borderColor: item.themeSettings.palette.border,
                    color: item.themeSettings.palette.text,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider"
                      style={{
                        backgroundColor: item.themeSettings.palette.surface,
                        border: `1px solid ${item.themeSettings.palette.border}`,
                      }}
                    >
                      {themeMeta.name}
                    </span>

                    <span
                      className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${
                        item.isPublished
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-amber-100 text-amber-800 border border-amber-300"
                      }`}
                    >
                      {item.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-serif font-medium line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs opacity-75 line-clamp-2">
                      {item.personalInfo.heroHeadline || item.personalInfo.tagline}
                    </p>
                  </div>

                  {/* Completeness progress */}
                  <div className="space-y-1 pt-2 border-t" style={{ borderColor: item.themeSettings.palette.border }}>
                    <div className="flex justify-between text-[10px] font-mono opacity-80">
                      <span>Profile Completeness</span>
                      <span>{completeness}%</span>
                    </div>
                    <div className="h-1 w-full bg-black/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-editorial-mocha transition-all"
                        style={{ width: `${completeness}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-5 space-y-4 flex-grow flex flex-col justify-between">
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-editorial-muted font-mono">
                      <span>Slug: /{item.username}</span>
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {item.updatedAt
                            ? new Date(item.updatedAt).toLocaleDateString()
                            : "Recent"}
                        </span>
                      </span>
                    </div>
                    <p className="text-xs text-editorial-charcoal/80 font-sans line-clamp-2">
                      {item.about.bioLong || "No biography added yet."}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="space-y-2 pt-3 border-t border-editorial-border/60">
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href={`/editor/${item.portfolioId}`}
                        className="flex items-center justify-center space-x-1.5 bg-editorial-charcoal py-2 px-3 text-xs font-mono uppercase tracking-wider text-editorial-ivory hover:bg-editorial-softdark transition-colors"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Edit Studio</span>
                      </Link>

                      <button
                        onClick={() => handleTogglePublish(item)}
                        className={`flex items-center justify-center space-x-1 py-2 px-3 text-xs font-mono uppercase tracking-wider border transition-colors ${
                          item.isPublished
                            ? "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
                            : "border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                        }`}
                      >
                        <span>{item.isPublished ? "Unpublish" : "Publish"}</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleCopyUrl(item.username, item.portfolioId)}
                          title="Copy Link"
                          className="p-1.5 text-editorial-muted hover:text-editorial-charcoal transition-colors border border-editorial-border"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <Link
                          href={getPortfolioUrl(item.username)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open Live Website"
                          className="p-1.5 text-editorial-muted hover:text-editorial-charcoal transition-colors border border-editorial-border"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDuplicate(item)}
                          title="Duplicate Portfolio"
                          className="p-1.5 text-editorial-muted hover:text-editorial-charcoal transition-colors border border-editorial-border"
                        >
                          <CopyPlus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleDelete(item.portfolioId)}
                        title="Delete Portfolio"
                        className="p-1.5 text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
