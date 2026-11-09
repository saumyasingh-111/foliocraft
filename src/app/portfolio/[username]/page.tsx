import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getPortfolioByUsername } from "@/lib/db/portfolios";
import { ThemeRenderer } from "@/themes/ThemeRenderer";
import { INITIAL_DEFAULT_PORTFOLIO } from "@/lib/utils/defaults";
import { ArrowLeft, Sparkles, Globe } from "lucide-react";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const portfolio = await getPortfolioByUsername(username);

  if (!portfolio) {
    return {
      title: "Portfolio Not Found — FolioCraft",
      description: "The requested portfolio does not exist or has been unpublished.",
    };
  }

  const name = portfolio.personalInfo.fullName;
  const title = portfolio.personalInfo.professionalTitle;
  const headline = portfolio.personalInfo.heroHeadline || portfolio.personalInfo.tagline || "";
  const avatar = portfolio.personalInfo.avatarUrl;

  return {
    title: `${name} — ${title}`,
    description: headline || `${name}'s personal portfolio and selected works.`,
    openGraph: {
      title: `${name} — ${title}`,
      description: headline,
      type: "profile",
      images: avatar ? [{ url: avatar }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} — ${title}`,
      description: headline,
      images: avatar ? [avatar] : [],
    },
  };
}

export default async function PublicPortfolioPage({ params }: Props) {
  const { username } = await params;
  
  // Lookup published portfolio
  let portfolio = await getPortfolioByUsername(username);

  // If in local dev and username is 'alex-morgan', fallback to default seed
  if (!portfolio && username.toLowerCase() === "alex-morgan") {
    portfolio = INITIAL_DEFAULT_PORTFOLIO;
  }

  // Handle Missing or Unpublished Portfolios Gracefully
  if (!portfolio) {
    return (
      <div className="min-h-screen bg-editorial-ivory flex flex-col items-center justify-center p-6 text-center">
        <div className="border border-editorial-border bg-white p-10 max-w-md shadow-editorial space-y-6">
          <div className="h-12 w-12 border border-editorial-charcoal bg-editorial-charcoal text-editorial-ivory mx-auto flex items-center justify-center font-serif text-xl font-bold">
            F
          </div>
          <div className="space-y-2">
            <h1 className="font-serif text-2xl text-editorial-charcoal">
              Portfolio Not Accessible
            </h1>
            <p className="text-xs text-editorial-muted font-sans leading-relaxed">
              The portfolio for <span className="font-mono font-bold text-editorial-charcoal">@{username}</span> either does not exist, or the owner has not yet published it.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center space-x-1.5 border border-editorial-charcoal bg-editorial-charcoal px-5 py-2.5 text-xs font-mono uppercase tracking-wider text-editorial-ivory hover:bg-editorial-softdark transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Explore Platform</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Schema.org Person JSON-LD for rich search results
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: portfolio.personalInfo.fullName,
    jobTitle: portfolio.personalInfo.professionalTitle,
    description: portfolio.about.bioLong || portfolio.personalInfo.tagline,
    url: typeof window !== "undefined" ? window.location.href : undefined,
    image: portfolio.personalInfo.avatarUrl,
    sameAs: [
      portfolio.socialLinks.linkedin,
      portfolio.socialLinks.github,
      portfolio.socialLinks.twitter,
      portfolio.socialLinks.personalWebsite,
    ].filter(Boolean),
  };

  return (
    <>
      {/* Search Engine Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Render Selected Theme Engine */}
      <ThemeRenderer data={portfolio} />

      {/* Discrete Editorial Platform Branding Badge */}
      <aside className="fixed bottom-4 right-4 z-50">
        <Link
          href="/"
          target="_blank"
          className="group inline-flex items-center space-x-2 border border-editorial-charcoal/20 bg-white/95 px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider text-editorial-charcoal shadow-editorial backdrop-blur hover:border-editorial-charcoal hover:bg-white transition-all"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-editorial-mocha group-hover:scale-125 transition-transform" />
          <span>Made with FolioCraft</span>
        </Link>
      </aside>
    </>
  );
}
