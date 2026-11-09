"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { THEME_REGISTRY } from "@/lib/utils/defaults";
import { ThemeId } from "@/themes/types";
import {
  ArrowRight,
  Sparkles,
  Eye,
  Layers,
  Palette,
  Globe,
  UploadCloud,
  CheckCircle2,
  ExternalLink,
  Laptop,
  Smartphone,
  ShieldCheck,
  Code2,
  Compass,
} from "lucide-react";

export default function LandingPage() {
  const [activeHeroTheme, setActiveHeroTheme] = useState<ThemeId>("minimal-editorial");

  const currentThemeMeta = THEME_REGISTRY.find((t) => t.id === activeHeroTheme) || THEME_REGISTRY[0];

  return (
    <div id="top" className="min-h-screen flex flex-col bg-editorial-ivory text-editorial-charcoal selection:bg-editorial-charcoal selection:text-editorial-ivory">
      <Navbar />

      <main className="flex-grow">
        {/* =========================================================================
            1. HERO SECTION
        ========================================================================== */}
        <section className="relative overflow-hidden border-b border-editorial-border py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-6 lg:px-12">
            <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-12">
              
              {/* Left Column: Editorial Headline & Actions */}
              <div className="lg:col-span-6 space-y-8">
                <div className="inline-flex items-center space-x-2 border border-editorial-border bg-editorial-sand/30 px-3.5 py-1.5 text-xs font-mono tracking-widest uppercase text-editorial-charcoal">
                  <span className="h-1.5 w-1.5 rounded-full bg-editorial-mocha animate-pulse" />
                  <span>No-Code Portfolio Publishing Platform</span>
                </div>

                <div className="space-y-4">
                  <h1 className="font-serif text-5xl font-normal tracking-tight text-editorial-charcoal sm:text-6xl lg:text-7xl leading-[1.08]">
                    Your story <br />
                    <span className="italic font-light text-editorial-mocha">deserves</span> its own website.
                  </h1>
                  <p className="max-w-xl text-lg text-editorial-charcoal/80 leading-relaxed font-sans font-light">
                    Create a portfolio that reflects who you are. Choose your style, showcase your work, and publish your personal website in minutes.
                  </p>
                </div>

                {/* Primary & Secondary Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
                  <Link
                    href="/signup"
                    className="group inline-flex items-center justify-center space-x-2.5 border border-editorial-charcoal bg-editorial-charcoal px-7 py-4 text-sm font-medium text-editorial-ivory transition-all hover:bg-editorial-softdark hover:shadow-editorial"
                  >
                    <span>Create Your Portfolio</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>

                  <Link
                    href="#themes"
                    className="inline-flex items-center justify-center space-x-2 border border-editorial-border bg-editorial-card px-6 py-4 text-sm font-medium text-editorial-charcoal transition-colors hover:bg-editorial-sand/40 hover:border-editorial-mocha"
                  >
                    <Eye className="h-4 w-4 text-editorial-mocha" />
                    <span>Explore Themes</span>
                  </Link>
                </div>

                {/* Micro guarantees */}
                <div className="flex flex-wrap items-center gap-y-2 gap-x-6 pt-4 text-xs font-mono text-editorial-muted">
                  <span className="flex items-center space-x-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-editorial-mocha" />
                    <span>Zero code required</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-editorial-mocha" />
                    <span>Instant public URL</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-editorial-mocha" />
                    <span>6 bespoke archetypes</span>
                  </span>
                </div>
              </div>

              {/* Right Column: Live Interactive Theme Preview Mockup */}
              <div className="lg:col-span-6">
                <div className="relative border border-editorial-charcoal/20 bg-white p-4 sm:p-6 shadow-editorial-lg">
                  
                  {/* Top Bar with live theme pill switcher */}
                  <div className="mb-4 flex flex-wrap items-center justify-between border-b border-editorial-border pb-3 gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="h-3 w-3 rounded-full bg-red-400" />
                      <span className="h-3 w-3 rounded-full bg-amber-400" />
                      <span className="h-3 w-3 rounded-full bg-emerald-400" />
                      <span className="ml-2 text-xs font-mono text-editorial-muted">
                        alex-morgan.foliocraft.com
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 text-xs">
                      <span className="text-[11px] font-mono text-editorial-mocha mr-1 hidden sm:inline">
                        Theme:
                      </span>
                      <select
                        value={activeHeroTheme}
                        onChange={(e) => setActiveHeroTheme(e.target.value as ThemeId)}
                        className="rounded border border-editorial-border bg-editorial-ivory px-2 py-1 text-xs font-medium text-editorial-charcoal focus:outline-none"
                      >
                        {THEME_REGISTRY.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Interactive Miniature Portfolio Surface */}
                  <div
                    className="relative min-h-[380px] p-6 transition-all duration-300 border border-editorial-border/60"
                    style={{
                      backgroundColor: currentThemeMeta.defaultSettings.palette.background,
                      color: currentThemeMeta.defaultSettings.palette.text,
                    }}
                  >
                    {/* Header in simulated portfolio */}
                    <div className="flex items-center justify-between border-b pb-4 mb-6" style={{ borderColor: currentThemeMeta.defaultSettings.palette.border }}>
                      <span className="text-sm font-semibold tracking-wider uppercase font-mono">
                        Alex Morgan
                      </span>
                      <div className="flex space-x-4 text-xs opacity-75 font-mono">
                        <span>Works</span>
                        <span>Experience</span>
                        <span>Contact</span>
                      </div>
                    </div>

                    {/* Hero body */}
                    <div className="space-y-4 max-w-md">
                      <div className="inline-block px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest"
                           style={{
                             backgroundColor: currentThemeMeta.defaultSettings.palette.surface,
                             color: currentThemeMeta.defaultSettings.palette.primary,
                             border: `1px solid ${currentThemeMeta.defaultSettings.palette.border}`
                           }}>
                        {currentThemeMeta.category} Portfolio
                      </div>
                      
                      <h3 className="text-2xl sm:text-3xl font-serif font-normal leading-snug">
                        {currentThemeMeta.id === "modern-developer" ? (
                          <span className="font-mono text-xl sm:text-2xl font-bold">
                            &gt; Full-Stack Architect & Open Source Contributor_
                          </span>
                        ) : currentThemeMeta.id === "creative-experimental" ? (
                          <span className="font-mono uppercase tracking-tight font-black text-2xl">
                            Visual Director // Breaking Digital Conventions
                          </span>
                        ) : (
                          <span>Designing digital artifacts with quiet precision and enduring clarity.</span>
                        )}
                      </h3>

                      <p className="text-xs leading-relaxed opacity-80">
                        {currentThemeMeta.description}
                      </p>
                    </div>

                    {/* Simulated Project Card */}
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <div className="p-3 border text-xs" style={{
                        backgroundColor: currentThemeMeta.defaultSettings.palette.surface,
                        borderColor: currentThemeMeta.defaultSettings.palette.border
                      }}>
                        <div className="text-[10px] uppercase font-mono opacity-60">Featured Work</div>
                        <div className="font-semibold text-xs mt-1">Chronicle Publishing</div>
                        <div className="text-[10px] opacity-75 mt-0.5">Next.js & Typography</div>
                      </div>
                      <div className="p-3 border text-xs" style={{
                        backgroundColor: currentThemeMeta.defaultSettings.palette.surface,
                        borderColor: currentThemeMeta.defaultSettings.palette.border
                      }}>
                        <div className="text-[10px] uppercase font-mono opacity-60">Interaction</div>
                        <div className="font-semibold text-xs mt-1">Vesper Audio Labs</div>
                        <div className="text-[10px] opacity-75 mt-0.5">Spatial Audio System</div>
                      </div>
                    </div>

                    {/* Subtle caption */}
                    <div className="mt-6 flex items-center justify-between text-[11px] opacity-70 font-mono">
                      <span>Live Style: {currentThemeMeta.name}</span>
                      <span className="italic">1-click theme switching</span>
                    </div>
                  </div>

                  {/* Mock browser status */}
                  <div className="mt-3 flex items-center justify-between text-xs text-editorial-muted font-mono">
                    <span className="flex items-center space-x-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span>Ready to Publish</span>
                    </span>
                    <span>100% Responsive</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* =========================================================================
            2. THEME SHOWCASE GALLERY (THE 6 ARCHETYPES)
        ========================================================================== */}
        <section id="themes" className="border-b border-editorial-border py-24 bg-editorial-ivory">
          <div className="mx-auto max-w-7xl px-6 lg:px-12">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div className="space-y-3">
                <span className="text-xs font-mono uppercase tracking-widest text-editorial-mocha font-semibold">
                  Theme Architecture
                </span>
                <h2 className="font-serif text-4xl sm:text-5xl font-normal text-editorial-charcoal tracking-tight">
                  Six genuinely distinct aesthetics.
                </h2>
                <p className="max-w-2xl text-base text-editorial-charcoal/70 font-sans">
                  We don’t simply swap background colors. Each theme features bespoke layouts, unique typographic pairings, custom section treatments, and distinct visual personality.
                </p>
              </div>

              <Link
                href="/signup"
                className="inline-flex items-center space-x-2 text-sm font-medium text-editorial-charcoal hover:text-editorial-mocha transition-colors border-b border-editorial-charcoal pb-1 self-start md:self-auto"
              >
                <span>Browse & customize inside editor</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Grid of 6 Themes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {THEME_REGISTRY.map((theme) => {
                const palette = theme.defaultSettings.palette;
                return (
                  <div
                    key={theme.id}
                    className="group flex flex-col border border-editorial-border bg-editorial-card transition-all duration-300 hover:border-editorial-charcoal hover:shadow-editorial-lg"
                  >
                    {/* Visual Card Preview */}
                    <div
                      className="relative h-56 p-6 border-b flex flex-col justify-between overflow-hidden"
                      style={{
                        backgroundColor: palette.background,
                        borderColor: palette.border,
                        color: palette.text,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider"
                          style={{
                            backgroundColor: palette.surface,
                            color: palette.primary,
                            border: `1px solid ${palette.border}`,
                          }}
                        >
                          {theme.category}
                        </span>
                        <div className="flex space-x-1.5">
                          <span
                            className="h-3 w-3 rounded-full border border-black/10"
                            style={{ backgroundColor: palette.primary }}
                          />
                          <span
                            className="h-3 w-3 rounded-full border border-black/10"
                            style={{ backgroundColor: palette.secondary }}
                          />
                          <span
                            className="h-3 w-3 rounded-full border border-black/10"
                            style={{ backgroundColor: palette.accent }}
                          />
                        </div>
                      </div>

                      <div className="space-y-1 my-auto">
                        <h4 className="text-xl font-medium tracking-tight" style={{ fontFamily: theme.defaultSettings.typography.headingFont }}>
                          {theme.name}
                        </h4>
                        <p className="text-xs opacity-75 line-clamp-2">
                          {theme.tagline}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono opacity-60 pt-2 border-t" style={{ borderColor: palette.border }}>
                        <span>Heading: {theme.defaultSettings.typography.headingFont}</span>
                        <span>Body: {theme.defaultSettings.typography.bodyFont}</span>
                      </div>
                    </div>

                    {/* Card Content & Details */}
                    <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <p className="text-sm text-editorial-charcoal/80 leading-relaxed font-sans">
                          {theme.description}
                        </p>
                        <div className="pt-2 text-xs text-editorial-muted">
                          <span className="font-semibold text-editorial-charcoal font-mono">Best for: </span>
                          <span>{theme.bestFor}</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-editorial-border/60 flex items-center justify-between">
                        <Link
                          href={`/signup?theme=${theme.id}`}
                          className="inline-flex items-center space-x-1.5 text-xs font-mono uppercase tracking-wider text-editorial-charcoal hover:text-editorial-mocha font-semibold transition-colors"
                        >
                          <span>Select this theme</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* =========================================================================
            3. HOW IT WORKS (3 SIMPLE STEPS)
        ========================================================================== */}
        <section id="how-it-works" className="border-b border-editorial-border py-24 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-12">
            
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-20">
              <span className="text-xs font-mono uppercase tracking-widest text-editorial-mocha font-semibold">
                Effortless Workflow
              </span>
              <h2 className="font-serif text-4xl sm:text-5xl font-normal text-editorial-charcoal">
                From idea to published URL in ten minutes.
              </h2>
              <p className="text-base text-editorial-charcoal/70">
                No complex hosting setup. No CSS battles. Just your achievements, beautifully framed.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
              
              {/* Step 1 */}
              <div className="border border-editorial-border p-8 bg-editorial-ivory/50 space-y-6 relative">
                <div className="font-serif text-6xl text-editorial-sand font-light">01</div>
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl text-editorial-charcoal">
                    Add your details
                  </h3>
                  <p className="text-sm text-editorial-charcoal/80 leading-relaxed font-sans">
                    Use our clean step-by-step onboarding wizard. Enter your biography, career experience, education, key projects, credentials, and social links.
                  </p>
                </div>
                <div className="pt-2 text-xs font-mono text-editorial-mocha uppercase tracking-wider">
                  Every section optional
                </div>
              </div>

              {/* Step 2 */}
              <div className="border border-editorial-border p-8 bg-editorial-ivory/50 space-y-6 relative">
                <div className="font-serif text-6xl text-editorial-sand font-light">02</div>
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl text-editorial-charcoal">
                    Choose your design
                  </h3>
                  <p className="text-sm text-editorial-charcoal/80 leading-relaxed font-sans">
                    Pick from 6 bespoke portfolio archetypes. Fine-tune palettes, typography, card borders, and section ordering with real-time live preview.
                  </p>
                </div>
                <div className="pt-2 text-xs font-mono text-editorial-mocha uppercase tracking-wider">
                  Instant live visual preview
                </div>
              </div>

              {/* Step 3 */}
              <div className="border border-editorial-border p-8 bg-editorial-ivory/50 space-y-6 relative">
                <div className="font-serif text-6xl text-editorial-sand font-light">03</div>
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl text-editorial-charcoal">
                    Publish your portfolio
                  </h3>
                  <p className="text-sm text-editorial-charcoal/80 leading-relaxed font-sans">
                    Get an instant public link (<span className="font-mono text-xs">yourname.foliocraft.com</span>) to share on resumes, LinkedIn, and with clients. Update anytime.
                  </p>
                </div>
                <div className="pt-2 text-xs font-mono text-editorial-mocha uppercase tracking-wider">
                  Multi-tenant edge delivery
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* =========================================================================
            4. PLATFORM FEATURES
        ========================================================================== */}
        <section id="features" className="border-b border-editorial-border py-24 bg-editorial-ivory">
          <div className="mx-auto max-w-7xl px-6 lg:px-12">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              
              <div className="lg:col-span-5 space-y-6">
                <span className="text-xs font-mono uppercase tracking-widest text-editorial-mocha font-semibold">
                  Built For Quality
                </span>
                <h2 className="font-serif text-4xl sm:text-5xl font-normal text-editorial-charcoal leading-tight">
                  A modern studio suite, built with zero compromises.
                </h2>
                <p className="text-base text-editorial-charcoal/80 leading-relaxed font-sans">
                  Designed like an editorial magazine rather than a template machine. Every typography scale, card margin, and button border is meticulously calibrated.
                </p>

                <div className="space-y-4 pt-4">
                  <div className="flex items-start space-x-3.5">
                    <div className="p-2 border border-editorial-border bg-white text-editorial-charcoal mt-1">
                      <Palette className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-base text-editorial-charcoal">Dynamic Theme Engine</h4>
                      <p className="text-sm text-editorial-charcoal/70">Swap aesthetics at any time without ever losing or retyping your project data.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3.5">
                    <div className="p-2 border border-editorial-border bg-white text-editorial-charcoal mt-1">
                      <Layers className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-base text-editorial-charcoal">Split-Screen Live Editor</h4>
                      <p className="text-sm text-editorial-charcoal/70">Watch every keystroke, color tweak, and section reordering update in real-time.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3.5">
                    <div className="p-2 border border-editorial-border bg-white text-editorial-charcoal mt-1">
                      <Globe className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-base text-editorial-charcoal">Multi-Tenant Subdomains</h4>
                      <p className="text-sm text-editorial-charcoal/70">One unified platform powers thousands of independent, lightning-fast personal sites.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3.5">
                    <div className="p-2 border border-editorial-border bg-white text-editorial-charcoal mt-1">
                      <UploadCloud className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-base text-editorial-charcoal">Asset & Resume Storage</h4>
                      <p className="text-sm text-editorial-charcoal/70">Upload high-res project imagery and downloadable PDF resumes safely with CDN delivery.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right decorative visual composition */}
              <div className="lg:col-span-7 bg-white border border-editorial-border p-8 lg:p-12 shadow-editorial">
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-editorial-border pb-4">
                    <span className="font-serif text-xl font-normal">Split-Screen Architecture</span>
                    <div className="flex items-center space-x-3 text-xs font-mono text-editorial-muted">
                      <span className="flex items-center space-x-1"><Laptop className="h-3.5 w-3.5" /><span>Desktop</span></span>
                      <span className="flex items-center space-x-1"><Smartphone className="h-3.5 w-3.5" /><span>Mobile</span></span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border border-editorial-border bg-editorial-ivory/60 p-4 space-y-3">
                      <div className="text-xs font-mono uppercase text-editorial-mocha font-semibold">Controls (Left)</div>
                      <div className="h-2 w-24 bg-editorial-sand rounded" />
                      <div className="h-2 w-32 bg-editorial-border rounded" />
                      <div className="h-8 border border-editorial-border bg-white rounded flex items-center px-2 text-xs font-mono text-editorial-muted">
                        Full Name: Alex Morgan
                      </div>
                      <div className="h-8 border border-editorial-border bg-white rounded flex items-center px-2 text-xs font-mono text-editorial-muted">
                        Theme: Minimal Editorial
                      </div>
                      <div className="h-8 bg-editorial-charcoal text-editorial-ivory text-xs flex items-center justify-center font-mono">
                        Auto-Saved 1s ago
                      </div>
                    </div>

                    <div className="border border-editorial-charcoal/30 bg-editorial-ivory p-4 space-y-3 shadow-sm">
                      <div className="text-xs font-mono uppercase text-editorial-charcoal font-semibold">Live Canvas (Right)</div>
                      <div className="border-b border-editorial-border pb-2">
                        <span className="font-serif text-sm font-bold">ALEX MORGAN</span>
                      </div>
                      <p className="font-serif text-xs italic text-editorial-mocha leading-relaxed">
                        “Designing products where visual elegance meets rigorous architecture.”
                      </p>
                      <div className="h-16 border border-editorial-border bg-white flex items-center justify-center text-[10px] font-mono text-editorial-muted">
                        [Interactive Project Frame]
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-editorial-border pt-4 flex items-center justify-between text-xs font-mono text-editorial-muted">
                    <span>Synchronous in-memory state engine</span>
                    <span className="text-emerald-700">60 FPS Render</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* =========================================================================
            5. FINAL CALL TO ACTION
        ========================================================================== */}
        <section className="py-24 bg-editorial-charcoal text-editorial-ivory relative overflow-hidden">
          <div className="mx-auto max-w-5xl px-6 text-center space-y-8 relative z-10">
            <span className="inline-block border border-editorial-mocha/40 px-3.5 py-1 text-xs font-mono uppercase tracking-widest text-editorial-sand">
              Claim Your Unique Portfolio URL
            </span>

            <h2 className="font-serif text-4xl sm:text-6xl font-normal tracking-tight leading-tight">
              Publish a portfolio that stands apart from the ordinary.
            </h2>

            <p className="max-w-2xl mx-auto text-base sm:text-lg text-editorial-ivory/80 font-sans font-light leading-relaxed">
              Join creatives, designers, engineers, and independent thinkers who share their work with confidence. Free to build, customize, and publish.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                href="/signup"
                className="group inline-flex items-center space-x-2.5 bg-editorial-ivory text-editorial-charcoal px-8 py-4 text-sm font-semibold transition-all hover:bg-white hover:shadow-editorial"
              >
                <span>Get Started in 10 Minutes</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center space-x-2 border border-editorial-ivory/30 px-6 py-4 text-sm font-medium text-editorial-ivory hover:bg-white/10 transition-colors"
              >
                <span>Existing User? Sign In</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
