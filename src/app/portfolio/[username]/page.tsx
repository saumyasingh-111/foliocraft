import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPortfolioByUsername } from "@/lib/db/portfolios";
import { ThemeRenderer } from "@/themes/ThemeRenderer";
import { getPortfolioUrl } from "@/lib/utils/url";
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
  const portfolioUrl = getPortfolioUrl(username);

  return {
    title: `${name} — ${title}`,
    description: headline || `${name}'s personal portfolio and selected works.`,
    alternates: {
      canonical: portfolioUrl,
    },
    openGraph: {
      title: `${name} — ${title}`,
      description: headline,
      type: "profile",
      url: portfolioUrl,
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
  const portfolio = await getPortfolioByUsername(username);

  // Handle Missing or Unpublished Portfolios Gracefully
  if (!portfolio) {
    return (
      <div className="min-h-screen bg-editorial-ivory flex flex-col items-center justify-center p-6 text-center">
        <div className="border border-editorial-border bg-white p-10 max-w-md shadow-editorial space-y-6">
          <Image
            src="/logo.png"
            alt="FolioCraft"
            width={48}
            height={48}
            className="h-12 w-12 object-contain mx-auto rounded-sm"
          />
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
    url: getPortfolioUrl(username),
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
          <Image
            src="/logo.png"
            alt="FolioCraft"
            width={16}
            height={16}
            className="h-3.5 w-3.5 object-contain rounded-xs"
          />
          <span>Made with FolioCraft</span>
        </Link>
      </aside>
    </>
  );
}
