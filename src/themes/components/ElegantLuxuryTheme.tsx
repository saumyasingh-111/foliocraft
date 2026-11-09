"use client";

import React from "react";
import { PortfolioData } from "../types";
import { ArrowUpRight, Download, Sparkles, MapPin } from "lucide-react";

interface ThemeProps {
  data: PortfolioData;
  previewMode?: boolean;
}

export function ElegantLuxuryTheme({ data }: ThemeProps) {
  const { personalInfo, about, projects, experience, skills, achievements, socialLinks, resumeUrl } = data;

  return (
    <div className="min-h-screen bg-theme-background text-theme-text font-serif selection:bg-theme-secondary selection:text-white">
      {/* Luxury Nav Header */}
      <header className="py-8 px-8 border-b border-theme-border/60">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="text-center sm:text-left">
            <span className="text-2xl sm:text-3xl font-light tracking-wide uppercase">
              {personalInfo.fullName}
            </span>
            <span className="block text-[11px] tracking-widest uppercase text-theme-secondary mt-0.5 font-sans">
              Atelier & Advisory
            </span>
          </div>

          <div className="hidden sm:flex items-center space-x-8 text-xs tracking-widest uppercase font-sans text-theme-muted">
            <a href="#oeuvre" className="hover:text-theme-text transition-colors">Œuvre</a>
            <a href="#about" className="hover:text-theme-text transition-colors">Monograph</a>
            <a href="#contact" className="hover:text-theme-text transition-colors">Salon</a>
            {resumeUrl && (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="border-b border-theme-secondary text-theme-secondary pb-0.5"
              >
                Curriculum Vitae
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Hero: Luxury Haute Editorial */}
      <section className="py-24 sm:py-32 px-8 text-center border-b border-theme-border/60">
        <div className="max-w-3xl mx-auto space-y-8">
          {personalInfo.statusBadge && (
            <div className="inline-flex items-center space-x-2 text-xs font-sans tracking-widest uppercase text-theme-secondary">
              <Sparkles className="h-3 w-3" />
              <span>{personalInfo.statusBadge}</span>
            </div>
          )}

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight leading-[1.12] italic">
            {personalInfo.heroHeadline || personalInfo.tagline}
          </h1>

          <p className="font-sans text-sm sm:text-base text-theme-muted font-light max-w-xl mx-auto leading-relaxed">
            {personalInfo.heroSubheadline || personalInfo.professionalTitle}
          </p>

          {personalInfo.location && (
            <div className="text-xs font-sans uppercase tracking-widest text-theme-secondary pt-4">
              {personalInfo.location}
            </div>
          )}
        </div>
      </section>

      {/* Narrative Monograph */}
      {about.bioLong && (
        <section id="about" className="py-24 px-8 border-b border-theme-border/60 bg-theme-surface/50">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-5 text-center md:text-left">
              <span className="text-xs font-sans uppercase tracking-widest text-theme-secondary block mb-2">
                The Philosophy
              </span>
              <h2 className="text-3xl font-light italic">Artisanal Dedication</h2>
            </div>
            <div className="md:col-span-7 space-y-4 font-sans text-sm sm:text-base text-theme-muted leading-relaxed font-light">
              <p>{about.bioLong}</p>
            </div>
          </div>
        </section>
      )}

      {/* Featured Works: Arched Gallery */}
      {projects && projects.length > 0 && (
        <section id="oeuvre" className="py-24 px-8 border-b border-theme-border/60">
          <div className="max-w-5xl mx-auto space-y-16">
            <div className="text-center space-y-2">
              <span className="text-xs font-sans uppercase tracking-widest text-theme-secondary">
                Selected Portfolio
              </span>
              <h2 className="text-3xl sm:text-4xl font-light italic">The Curated Works</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {projects.map((proj) => (
                <div key={proj.id} className="space-y-4 group">
                  {proj.coverImageUrl && (
                    <div className="overflow-hidden rounded-t-[100px] border border-theme-border bg-theme-surface h-80 sm:h-96">
                      <img
                        src={proj.coverImageUrl}
                        alt={proj.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                  )}

                  <div className="text-center space-y-2 pt-2">
                    <span className="text-[11px] font-sans uppercase tracking-widest text-theme-secondary">
                      {proj.category}
                    </span>
                    <h3 className="text-2xl font-light">{proj.title}</h3>
                    <p className="font-sans text-xs text-theme-muted leading-relaxed max-w-sm mx-auto font-light">
                      {proj.description}
                    </p>
                    {proj.demoUrl && (
                      <div className="pt-2">
                        <a
                          href={proj.demoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 font-sans text-xs uppercase tracking-widest text-theme-text border-b border-theme-text pb-0.5 hover:text-theme-secondary"
                        >
                          <span>Examine Study</span>
                          <ArrowUpRight className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Experience History */}
      {experience && experience.length > 0 && (
        <section className="py-20 px-8 border-b border-theme-border/60 bg-theme-surface/30">
          <div className="max-w-4xl mx-auto space-y-12">
            <h2 className="text-center text-3xl font-light italic">Tenure & Engagements</h2>
            <div className="space-y-8">
              {experience.map((exp) => (
                <div key={exp.id} className="border-b border-theme-border/60 pb-6 flex flex-col sm:flex-row justify-between sm:items-baseline gap-2">
                  <div>
                    <h3 className="text-xl font-light">{exp.position}</h3>
                    <span className="font-sans text-xs text-theme-secondary uppercase tracking-widest">{exp.company}</span>
                  </div>
                  <span className="font-sans text-xs text-theme-muted">{exp.startDate}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer / Salon */}
      <footer id="contact" className="py-24 px-8 text-center space-y-8">
        <h2 className="text-3xl sm:text-4xl font-light italic">Private Inquiries & Commissions</h2>
        {personalInfo.email && (
          <p className="font-sans text-sm tracking-wider uppercase">
            <a href={`mailto:${personalInfo.email}`} className="text-theme-secondary hover:underline">
              {personalInfo.email}
            </a>
          </p>
        )}
        <div className="flex justify-center space-x-6 text-xs font-sans tracking-widest uppercase text-theme-muted pt-4">
          {socialLinks.linkedin && <a href={socialLinks.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
          {socialLinks.dribbble && <a href={socialLinks.dribbble} target="_blank" rel="noreferrer">Dribbble</a>}
          {socialLinks.twitter && <a href={socialLinks.twitter} target="_blank" rel="noreferrer">Twitter</a>}
        </div>
      </footer>
    </div>
  );
}
