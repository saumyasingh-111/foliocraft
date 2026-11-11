"use client";

import React, { useState } from "react";
import { DynamicSection, DynamicSectionEntry, DynamicSectionField } from "@/themes/types";
import {
  ExternalLink,
  Github,
  Calendar,
  MapPin,
  Download,
  Award,
  BookOpen,
  Camera,
  Mic,
  Briefcase,
  Code,
  Sparkles,
  Heart,
  Layers,
  Globe,
  Trophy,
  X,
  ChevronRight,
  Maximize2,
  FileText,
} from "lucide-react";

interface DynamicSectionRendererProps {
  section: DynamicSection;
  previewMode?: boolean;
  onEditEntry?: (entry: DynamicSectionEntry) => void;
  onDeleteEntry?: (entryId: string) => void;
  onAddEntry?: () => void;
}

// Icon dictionary
const ICON_MAP: Record<string, React.ElementType> = {
  Trophy,
  BookOpen,
  Camera,
  Mic,
  Briefcase,
  Code,
  Award,
  Sparkles,
  Heart,
  Layers,
  Globe,
};

export function DynamicSectionRenderer({
  section,
  previewMode = false,
  onEditEntry,
  onDeleteEntry,
  onAddEntry,
}: DynamicSectionRendererProps) {
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title?: string } | null>(null);

  if (!section.isVisible) return null;
  const entries = section.entries || [];
  if (entries.length === 0 && !previewMode) return null;

  const IconComponent = ICON_MAP[section.icon || ""] || Sparkles;

  // Helper to extract fields by role or first match
  const findFieldValue = (entry: DynamicSectionEntry, preferredIds: string[], fallbackType?: string) => {
    for (const id of preferredIds) {
      if (entry[id] !== undefined && entry[id] !== "") return entry[id];
    }
    if (fallbackType) {
      const match = section.fields.find((f) => f.type === fallbackType);
      if (match && entry[match.id] !== undefined) return entry[match.id];
    }
    return undefined;
  };

  const getTitle = (entry: DynamicSectionEntry) =>
    findFieldValue(entry, ["title", "name", "project_name", "event_name", "topic", "company_name", "headline"]) ||
    "Untitled";

  const getSubtitle = (entry: DynamicSectionEntry) =>
    findFieldValue(entry, ["subtitle", "role", "venue", "award", "focus", "rating", "author", "location"]);

  const getDescription = (entry: DynamicSectionEntry) =>
    findFieldValue(entry, ["description", "abstract", "summary", "quote", "story", "highlight"], "textarea");

  const getDate = (entry: DynamicSectionEntry) =>
    findFieldValue(entry, ["date", "year", "timeframe"], "date");

  const getTags = (entry: DynamicSectionEntry): string[] => {
    const raw = findFieldValue(entry, ["tags", "technologies", "tech_stack", "badges"], "tags");
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") return raw.split(",").map((s) => s.trim()).filter(Boolean);
    return [];
  };

  const getPrimaryImage = (entry: DynamicSectionEntry) => {
    const img = findFieldValue(entry, ["image", "photo", "cover", "avatar", "logo"], "image");
    if (typeof img === "string" && img.startsWith("http")) return img;
    return undefined;
  };

  const getGalleryImages = (entry: DynamicSectionEntry): string[] => {
    const gallery = findFieldValue(entry, ["gallery", "photos", "images"], "image-gallery");
    if (Array.isArray(gallery)) return gallery.filter((u) => typeof u === "string" && u.startsWith("http"));
    return [];
  };

  const getPrimaryUrl = (entry: DynamicSectionEntry) => {
    return findFieldValue(entry, ["url", "link", "demo_url", "repo_url", "slides_url", "recording_url", "website", "doi"], "url");
  };

  // =========================================================================
  // RENDER LAYOUTS
  // =========================================================================

  // 1. CARDS LAYOUT
  const renderCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {entries.map((entry) => {
        const title = getTitle(entry);
        const subtitle = getSubtitle(entry);
        const desc = getDescription(entry);
        const date = getDate(entry);
        const tags = getTags(entry);
        const img = getPrimaryImage(entry);
        const url = getPrimaryUrl(entry);

        return (
          <div
            key={entry.id}
            className="group flex flex-col justify-between rounded-xl border border-theme-border/70 bg-theme-surface/40 p-6 transition-all duration-300 hover:border-theme-primary/40 hover:shadow-lg"
          >
            <div className="space-y-4">
              {img && (
                <div
                  className="relative h-48 w-full overflow-hidden rounded-lg bg-theme-surface border border-theme-border/50 cursor-pointer"
                  onClick={() => setLightboxImage({ url: img, title })}
                >
                  <img
                    src={img}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Maximize2 className="h-5 w-5 drop-shadow" />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-theme-muted">
                  {subtitle && (
                    <span className="font-mono uppercase tracking-wider text-theme-secondary font-medium">
                      {subtitle}
                    </span>
                  )}
                  {date && (
                    <span className="flex items-center space-x-1 font-mono text-[11px]">
                      <Calendar className="h-3 w-3" />
                      <span>{date}</span>
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-medium tracking-tight text-theme-text group-hover:text-theme-primary transition-colors">
                  {title}
                </h3>
              </div>

              {desc && (
                <p className="text-sm text-theme-muted leading-relaxed line-clamp-4">
                  {desc}
                </p>
              )}
            </div>

            <div className="pt-6 space-y-4">
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-theme-background px-2.5 py-0.5 text-[11px] font-mono text-theme-muted border border-theme-border/50"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 text-xs font-mono uppercase tracking-wider text-theme-primary hover:text-theme-secondary transition-colors"
                >
                  <span>Explore link</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  // 2. EDITORIAL CARDS LAYOUT
  const renderEditorialCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {entries.map((entry) => {
        const title = getTitle(entry);
        const subtitle = getSubtitle(entry);
        const desc = getDescription(entry);
        const date = getDate(entry);
        const tags = getTags(entry);
        const img = getPrimaryImage(entry);
        const url = getPrimaryUrl(entry);

        return (
          <div
            key={entry.id}
            className="group relative rounded-2xl border border-theme-border/80 bg-theme-surface/50 p-7 sm:p-8 transition-all duration-300 hover:border-theme-primary/50 hover:bg-theme-surface/80"
          >
            <div className="flex flex-col sm:flex-row gap-6">
              {img && (
                <div
                  className="sm:w-1/3 h-44 sm:h-auto overflow-hidden rounded-xl border border-theme-border/60 bg-theme-surface shrink-0 cursor-pointer"
                  onClick={() => setLightboxImage({ url: img, title })}
                >
                  <img
                    src={img}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}

              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  {subtitle && (
                    <span className="inline-block rounded bg-theme-primary/10 px-2 py-0.5 text-theme-primary uppercase tracking-wider">
                      {subtitle}
                    </span>
                  )}
                  {date && (
                    <span className="text-theme-muted">{date}</span>
                  )}
                </div>

                <h3 className="text-2xl font-light tracking-tight text-theme-text group-hover:text-theme-primary transition-colors">
                  {title}
                </h3>

                {desc && (
                  <p className="text-sm text-theme-muted leading-relaxed">
                    {desc}
                  </p>
                )}

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {tags.map((t, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-theme-background/70 px-2.5 py-0.5 text-[11px] font-mono text-theme-muted border border-theme-border/50"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {url && (
                  <div className="pt-2">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 text-xs font-mono uppercase tracking-wider text-theme-text border-b border-theme-text pb-0.5 hover:text-theme-primary hover:border-theme-primary transition-colors"
                    >
                      <span>View details</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  // 3. TIMELINE LAYOUT
  const renderTimeline = () => (
    <div className="relative border-l-2 border-theme-border/80 pl-6 sm:pl-8 ml-3 sm:ml-6 space-y-10">
      {entries.map((entry) => {
        const title = getTitle(entry);
        const subtitle = getSubtitle(entry);
        const desc = getDescription(entry);
        const date = getDate(entry);
        const tags = getTags(entry);
        const url = getPrimaryUrl(entry);

        return (
          <div key={entry.id} className="relative group">
            {/* Timeline bead */}
            <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-theme-background bg-theme-primary ring-4 ring-theme-surface" />

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                {date && (
                  <span className="text-theme-secondary font-semibold uppercase tracking-wider">
                    {date}
                  </span>
                )}
                {subtitle && (
                  <span className="text-theme-muted">
                    — {subtitle}
                  </span>
                )}
              </div>

              <h3 className="text-xl font-medium tracking-tight text-theme-text group-hover:text-theme-primary transition-colors">
                {title}
              </h3>

              {desc && (
                <p className="text-sm text-theme-muted leading-relaxed max-w-3xl">
                  {desc}
                </p>
              )}

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="rounded bg-theme-surface px-2 py-0.5 text-[11px] font-mono text-theme-muted border border-theme-border/40"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {url && (
                <div className="pt-1">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-xs font-mono text-theme-primary hover:underline"
                  >
                    <span>Reference Link</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  // 4. ACHIEVEMENT GRID LAYOUT
  const renderAchievementGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {entries.map((entry) => {
        const title = getTitle(entry);
        const award = getSubtitle(entry);
        const desc = getDescription(entry);
        const date = getDate(entry);
        const tags = getTags(entry);
        const url = getPrimaryUrl(entry);

        return (
          <div
            key={entry.id}
            className="relative rounded-xl border border-theme-border bg-theme-surface/60 p-6 flex flex-col justify-between transition-all duration-300 hover:border-theme-primary/50 hover:bg-theme-surface"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="p-2.5 rounded-lg bg-theme-primary/10 text-theme-primary border border-theme-primary/20">
                  <Trophy className="h-5 w-5" />
                </div>
                {date && (
                  <span className="text-[11px] font-mono text-theme-muted uppercase tracking-wider">
                    {date}
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-lg font-medium text-theme-text tracking-tight">
                  {title}
                </h3>
                {award && (
                  <p className="text-sm font-mono text-theme-secondary font-medium pt-0.5">
                    {award}
                  </p>
                )}
              </div>

              {desc && (
                <p className="text-xs text-theme-muted leading-relaxed line-clamp-3">
                  {desc}
                </p>
              )}
            </div>

            <div className="pt-4 space-y-3">
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tags.map((t, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-theme-background text-theme-muted border border-theme-border/50"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-xs font-mono text-theme-primary hover:underline"
                >
                  <span>Verification / Link</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  // 5. GALLERY LAYOUT
  const renderGallery = () => {
    // Collect all primary and gallery images from entries
    const allGalleryItems: { url: string; title: string; subtitle?: string; desc?: string }[] = [];
    entries.forEach((e) => {
      const primary = getPrimaryImage(e);
      const title = getTitle(e);
      const subtitle = getSubtitle(e);
      const desc = getDescription(e);
      if (primary) {
        allGalleryItems.push({ url: primary, title, subtitle, desc });
      }
      const extras = getGalleryImages(e);
      extras.forEach((u) => {
        allGalleryItems.push({ url: u, title, subtitle, desc });
      });
    });

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {allGalleryItems.map((item, idx) => (
          <div
            key={idx}
            className="group relative h-64 overflow-hidden rounded-xl border border-theme-border/60 bg-theme-surface cursor-pointer"
            onClick={() => setLightboxImage({ url: item.url, title: item.title })}
          >
            <img
              src={item.url}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
              <span className="text-xs font-mono uppercase tracking-wider text-white/70">
                {item.subtitle}
              </span>
              <h4 className="text-sm font-medium tracking-tight text-white drop-shadow">
                {item.title}
              </h4>
              {item.desc && (
                <p className="text-[11px] text-white/80 line-clamp-2 pt-1 font-sans">
                  {item.desc}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 6. MASONRY LAYOUT
  const renderMasonry = () => (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
      {entries.map((entry) => {
        const title = getTitle(entry);
        const subtitle = getSubtitle(entry);
        const desc = getDescription(entry);
        const img = getPrimaryImage(entry);
        const tags = getTags(entry);
        const url = getPrimaryUrl(entry);

        return (
          <div
            key={entry.id}
            className="break-inside-avoid rounded-xl border border-theme-border/80 bg-theme-surface/50 p-6 space-y-4 hover:border-theme-primary/50 transition-colors"
          >
            {img && (
              <div
                className="overflow-hidden rounded-lg border border-theme-border/50 cursor-pointer"
                onClick={() => setLightboxImage({ url: img, title })}
              >
                <img src={img} alt={title} className="w-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
            )}
            <div className="space-y-1">
              {subtitle && (
                <span className="text-xs font-mono uppercase tracking-wider text-theme-secondary">
                  {subtitle}
                </span>
              )}
              <h3 className="text-lg font-medium text-theme-text">{title}</h3>
            </div>
            {desc && <p className="text-xs text-theme-muted leading-relaxed">{desc}</p>}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.map((t, i) => (
                  <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-theme-background text-theme-muted">
                    {t}
                  </span>
                ))}
              </div>
            )}
            {url && (
              <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center space-x-1 text-xs font-mono text-theme-primary">
                <span>Link</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        );
      })}
    </div>
  );

  // 7. LIST LAYOUT (Ideal for Publications, Papers, Articles)
  const renderList = () => (
    <div className="divide-y divide-theme-border/70 border-y border-theme-border/70">
      {entries.map((entry) => {
        const title = getTitle(entry);
        const subtitle = getSubtitle(entry);
        const desc = getDescription(entry);
        const date = getDate(entry);
        const url = getPrimaryUrl(entry);
        const docUrl = findFieldValue(entry, ["pdf_url", "document", "paper"], "document");

        return (
          <div
            key={entry.id}
            className="group py-6 flex flex-col md:flex-row md:items-baseline justify-between gap-4 transition-colors hover:bg-theme-surface/30 px-2 rounded-lg"
          >
            <div className="space-y-1.5 md:max-w-2xl">
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-theme-muted">
                {date && <span>{date}</span>}
                {subtitle && <span className="text-theme-secondary font-medium">— {subtitle}</span>}
              </div>

              <h3 className="text-lg sm:text-xl font-normal text-theme-text group-hover:text-theme-primary transition-colors">
                {title}
              </h3>

              {desc && (
                <p className="text-xs sm:text-sm text-theme-muted leading-relaxed pt-1">
                  {desc}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-4 shrink-0 pt-2 md:pt-0">
              {docUrl && (
                <a
                  href={docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-xs font-mono text-theme-secondary border border-theme-border px-3 py-1.5 rounded hover:bg-theme-surface transition-colors"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>PDF Document</span>
                </a>
              )}
              {url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 text-xs font-mono uppercase tracking-wider text-theme-text hover:text-theme-primary transition-colors"
                >
                  <span>View</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  // 8. STATS LAYOUT
  const renderStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {entries.map((entry) => {
        const title = getTitle(entry);
        const subtitle = getSubtitle(entry);
        const desc = getDescription(entry);

        return (
          <div
            key={entry.id}
            className="rounded-xl border border-theme-border bg-theme-surface/50 p-6 text-center space-y-2 hover:border-theme-primary/50 transition-colors"
          >
            <div className="text-3xl sm:text-4xl font-light text-theme-primary font-mono tracking-tight">
              {subtitle || "—"}
            </div>
            <h4 className="text-sm font-medium uppercase tracking-wider text-theme-text">
              {title}
            </h4>
            {desc && <p className="text-xs text-theme-muted pt-1">{desc}</p>}
          </div>
        );
      })}
    </div>
  );

  // 9. FEATURED LAYOUT
  const renderFeatured = () => {
    const [featured, ...rest] = entries;
    if (!featured) return null;

    const fTitle = getTitle(featured);
    const fSub = getSubtitle(featured);
    const fDesc = getDescription(featured);
    const fImg = getPrimaryImage(featured);
    const fUrl = getPrimaryUrl(featured);
    const fTags = getTags(featured);

    return (
      <div className="space-y-10">
        {/* Main Spotlight */}
        <div className="rounded-2xl border border-theme-primary/40 bg-theme-surface/70 p-8 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {fImg && (
            <div
              className="lg:col-span-6 h-72 sm:h-80 rounded-xl overflow-hidden border border-theme-border cursor-pointer"
              onClick={() => setLightboxImage({ url: fImg, title: fTitle })}
            >
              <img src={fImg} alt={fTitle} className="h-full w-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
          )}
          <div className={`${fImg ? "lg:col-span-6" : "lg:col-span-12"} space-y-4`}>
            <span className="inline-block rounded-full bg-theme-primary/10 px-3 py-1 text-xs font-mono text-theme-primary uppercase tracking-widest font-semibold">
              ★ Featured Spotlight
            </span>
            {fSub && <div className="text-xs font-mono uppercase text-theme-secondary">{fSub}</div>}
            <h3 className="text-2xl sm:text-3xl font-light text-theme-text">{fTitle}</h3>
            {fDesc && <p className="text-sm text-theme-muted leading-relaxed">{fDesc}</p>}
            {fTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {fTags.map((t, i) => (
                  <span key={i} className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-theme-background border border-theme-border text-theme-muted">
                    {t}
                  </span>
                ))}
              </div>
            )}
            {fUrl && (
              <div className="pt-2">
                <a href={fUrl} target="_blank" rel="noreferrer" className="inline-flex items-center space-x-1.5 text-xs font-mono uppercase tracking-wider text-theme-primary hover:underline">
                  <span>Visit Showcase</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Remaining items in secondary grid */}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {rest.map((item) => {
              const title = getTitle(item);
              const sub = getSubtitle(item);
              const desc = getDescription(item);
              const url = getPrimaryUrl(item);

              return (
                <div key={item.id} className="rounded-xl border border-theme-border/70 p-5 bg-theme-surface/40 space-y-2">
                  {sub && <span className="text-[11px] font-mono uppercase text-theme-secondary">{sub}</span>}
                  <h4 className="text-base font-medium text-theme-text">{title}</h4>
                  {desc && <p className="text-xs text-theme-muted line-clamp-3">{desc}</p>}
                  {url && (
                    <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center space-x-1 text-xs font-mono text-theme-primary hover:underline pt-2">
                      <span>View</span>
                      <ChevronRight className="h-3 w-3" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // 10. SPLIT LAYOUT (50/50 details)
  const renderSplit = () => (
    <div className="space-y-10 divide-y divide-theme-border/60">
      {entries.map((entry) => {
        const title = getTitle(entry);
        const subtitle = getSubtitle(entry);
        const desc = getDescription(entry);
        const date = getDate(entry);
        const tags = getTags(entry);
        const url = getPrimaryUrl(entry);
        const img = getPrimaryImage(entry);

        return (
          <div key={entry.id} className="pt-8 first:pt-0 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-mono text-theme-muted">
                {date && <span>{date}</span>}
                {subtitle && <span>• {subtitle}</span>}
              </div>
              <h3 className="text-2xl font-light text-theme-text tracking-tight">{title}</h3>
              {img && (
                <div
                  className="h-44 rounded-xl overflow-hidden border border-theme-border/60 cursor-pointer"
                  onClick={() => setLightboxImage({ url: img, title })}
                >
                  <img src={img} alt={title} className="h-full w-full object-cover" />
                </div>
              )}
            </div>

            <div className="md:col-span-7 space-y-4">
              {desc && <p className="text-sm text-theme-muted leading-relaxed">{desc}</p>}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t, idx) => (
                    <span key={idx} className="rounded-full bg-theme-surface px-2.5 py-0.5 text-xs font-mono text-theme-muted border border-theme-border/40">
                      {t}
                    </span>
                  ))}
                </div>
              )}
              {url && (
                <div>
                  <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center space-x-1.5 text-xs font-mono uppercase tracking-wider text-theme-primary hover:underline">
                    <span>Explore</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  // 11. MINIMAL LAYOUT
  const renderMinimal = () => (
    <div className="space-y-8 max-w-4xl">
      {entries.map((entry) => {
        const title = getTitle(entry);
        const subtitle = getSubtitle(entry);
        const desc = getDescription(entry);
        const date = getDate(entry);
        const url = getPrimaryUrl(entry);

        return (
          <div key={entry.id} className="space-y-2 border-b border-theme-border/40 pb-6 last:border-b-0">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-xl font-normal text-theme-text tracking-tight">{title}</h3>
              <div className="text-xs font-mono text-theme-muted flex items-center space-x-2">
                {subtitle && <span>{subtitle}</span>}
                {date && <span>• {date}</span>}
              </div>
            </div>
            {desc && <p className="text-sm text-theme-muted leading-relaxed font-light">{desc}</p>}
            {url && (
              <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center space-x-1 text-xs font-mono text-theme-primary hover:underline pt-1">
                <span>View Link</span>
                <ChevronRight className="h-3 w-3" />
              </a>
            )}
          </div>
        );
      })}
    </div>
  );

  // Router for Layouts
  const renderContentByLayout = () => {
    switch (section.layout) {
      case "editorial-cards":
        return renderEditorialCards();
      case "timeline":
        return renderTimeline();
      case "achievement-grid":
        return renderAchievementGrid();
      case "gallery":
        return renderGallery();
      case "masonry":
        return renderMasonry();
      case "list":
        return renderList();
      case "stats":
        return renderStats();
      case "featured":
        return renderFeatured();
      case "split":
        return renderSplit();
      case "minimal":
        return renderMinimal();
      case "cards":
      default:
        return renderCards();
    }
  };

  return (
    <section className="py-20 px-6 lg:px-16 border-b border-theme-border/60">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-theme-border/40 pb-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-theme-secondary">
              <IconComponent className="h-4 w-4" />
              <span>{section.category || "Section"}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-theme-text">
              {section.title}
            </h2>
            {section.subtitle && (
              <p className="text-sm sm:text-base text-theme-muted font-light leading-relaxed">
                {section.subtitle}
              </p>
            )}
          </div>

          {previewMode && onAddEntry && (
            <button
              onClick={onAddEntry}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-theme-primary text-theme-background text-xs font-mono uppercase tracking-wider hover:opacity-90 transition-opacity shrink-0"
            >
              <span>+ Add Entry</span>
            </button>
          )}
        </div>

        {/* Content */}
        {entries.length === 0 ? (
          <div className="py-12 text-center rounded-xl border border-dashed border-theme-border text-theme-muted text-sm font-mono">
            No entries in this section yet. Click "+ Add Entry" in the editor to add items.
          </div>
        ) : (
          renderContentByLayout()
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] overflow-hidden rounded-xl border border-white/20 bg-black/40"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={lightboxImage.url}
              alt={lightboxImage.title || "Full preview"}
              className="max-h-[80vh] w-auto object-contain mx-auto"
            />
            {lightboxImage.title && (
              <div className="p-4 text-center text-sm font-mono text-white/90 bg-black/60">
                {lightboxImage.title}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
