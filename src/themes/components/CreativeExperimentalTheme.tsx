"use client";

import React from "react";
import { PortfolioData } from "../types";
import { ArrowUpRight, Github, Download, Globe, Terminal, MapPin } from "lucide-react";

interface ThemeProps {
  data: PortfolioData;
  previewMode?: boolean;
}

export function CreativeExperimentalTheme({ data }: ThemeProps) {
  const { personalInfo, about, projects, experience, education, skills, achievements, socialLinks, resumeUrl } = data;

  return (
    <div className="min-h-screen bg-theme-background text-theme-text font-mono selection:bg-theme-primary selection:text-black">
      {/* Brutalist Header Strip */}
      <header className="border-b-2 border-theme-border p-6 flex flex-wrap items-center justify-between gap-4 sticky top-0 bg-theme-background/95 z-30 backdrop-blur">
        <div className="flex items-center space-x-3">
          <span className="h-3 w-3 bg-theme-primary animate-ping" />
          <span className="font-black text-lg tracking-wider uppercase">
            {personalInfo.fullName}
          </span>
          <span className="text-xs px-2 py-0.5 border border-theme-border uppercase tracking-widest text-theme-muted hidden sm:inline">
            EXP / 2026
          </span>
        </div>

        <div className="flex items-center space-x-6 text-xs uppercase tracking-widest">
          <a href="#work" className="hover:text-theme-primary transition-colors underline decoration-2">
            Work ({projects.length})
          </a>
          <a href="#bio" className="hover:text-theme-primary transition-colors">
            Bio
          </a>
          <a href="#contact" className="hover:text-theme-primary transition-colors">
            Contact
          </a>
          {resumeUrl && (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-theme-primary text-black px-3 py-1 font-bold hover:opacity-90"
            >
              PDF RESUME
            </a>
          )}
        </div>
      </header>

      {/* Hero Marquee & Big Headline */}
      <section className="border-b-2 border-theme-border py-16 lg:py-24 px-6 lg:px-12 bg-theme-surface">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="inline-block border-2 border-theme-border px-3 py-1 text-xs uppercase tracking-widest text-theme-primary bg-theme-background">
            {personalInfo.statusBadge || "System Active // Open for Collaboration"}
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[1.02]">
            {personalInfo.heroHeadline || personalInfo.tagline || personalInfo.professionalTitle}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-8 border-t-2 border-theme-border/60">
            <div className="md:col-span-8">
              <p className="text-sm sm:text-base leading-relaxed text-theme-muted font-mono">
                {personalInfo.heroSubheadline || about.bioLong || personalInfo.tagline}
              </p>
            </div>
            <div className="md:col-span-4 flex flex-col justify-end text-xs space-y-2 uppercase text-theme-muted">
              {personalInfo.location && <div>LOC: {personalInfo.location}</div>}
              {personalInfo.professionalTitle && <div>ROLE: {personalInfo.professionalTitle}</div>}
            </div>
          </div>
        </div>
      </section>

      {/* Selected Works: Brutalist Poster Cards */}
      {projects && projects.length > 0 && (
        <section id="work" className="border-b-2 border-theme-border py-20 px-6 lg:px-12">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="flex items-center justify-between border-b-2 border-theme-border pb-4">
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider">
                // Selected Works
              </h2>
              <span className="text-xs text-theme-primary font-bold">INDEX [01—0{projects.length}]</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {projects.map((proj, idx) => (
                <div
                  key={proj.id}
                  className="border-2 border-theme-border bg-theme-surface flex flex-col justify-between group hover:border-theme-primary transition-colors"
                >
                  <div className="p-4 border-b-2 border-theme-border flex items-center justify-between text-xs uppercase font-bold">
                    <span>#0{idx + 1} {proj.category}</span>
                    <span className="text-theme-primary group-hover:translate-x-1 transition-transform">
                      &gt;&gt;
                    </span>
                  </div>

                  {proj.coverImageUrl && (
                    <div className="overflow-hidden border-b-2 border-theme-border h-64 bg-black">
                      <img
                        src={proj.coverImageUrl}
                        alt={proj.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter contrast-125"
                      />
                    </div>
                  )}

                  <div className="p-6 space-y-4">
                    <h3 className="text-2xl font-black uppercase tracking-tight">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-theme-muted leading-relaxed">
                      {proj.description}
                    </p>

                    {proj.technologies && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {proj.technologies.map((t, i) => (
                          <span
                            key={i}
                            className="text-[10px] uppercase border border-theme-border px-2 py-0.5 text-theme-muted"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="pt-4 flex items-center space-x-4 text-xs font-bold uppercase">
                      {proj.demoUrl && (
                        <a
                          href={proj.demoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 bg-theme-primary text-black px-3 py-1 hover:opacity-90"
                        >
                          <span>Launch</span>
                          <ArrowUpRight className="h-3 w-3" />
                        </a>
                      )}
                      {proj.githubUrl && (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 border border-theme-border px-3 py-1 hover:border-theme-primary"
                        >
                          <Github className="h-3 w-3" />
                          <span>Code</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Career Matrix & Skills in Asymmetrical Layout */}
      <section id="bio" className="border-b-2 border-theme-border py-20 px-6 lg:px-12 bg-theme-surface">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-6 space-y-8">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider border-b-2 border-theme-border pb-3">
              // Trajectory
            </h2>
            <div className="space-y-6">
              {experience.map((exp) => (
                <div key={exp.id} className="border-2 border-theme-border p-4 bg-theme-background space-y-2">
                  <div className="flex items-center justify-between text-xs text-theme-primary font-bold">
                    <span>{exp.startDate}</span>
                    <span>{exp.company}</span>
                  </div>
                  <h4 className="text-lg font-black uppercase">{exp.position}</h4>
                  <p className="text-xs text-theme-muted leading-relaxed">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 space-y-8">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider border-b-2 border-theme-border pb-3">
              // Skill Stack
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <span
                  key={s.id}
                  className="px-3 py-2 border-2 border-theme-border bg-theme-background text-xs uppercase font-bold hover:bg-theme-primary hover:text-black hover:border-theme-primary transition-colors cursor-default"
                >
                  {s.name}
                </span>
              ))}
            </div>

            {achievements && achievements.length > 0 && (
              <div className="pt-6 space-y-4">
                <h3 className="text-sm uppercase font-black tracking-widest text-theme-primary">
                  RECOGNITION & AWARDS
                </h3>
                <div className="space-y-3">
                  {achievements.map((ach) => (
                    <div key={ach.id} className="text-xs border-l-2 border-theme-primary pl-3 py-1">
                      <div className="font-bold uppercase text-theme-text">{ach.title}</div>
                      <div className="text-theme-muted">{ach.organization} ({ach.date})</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-20 px-6 lg:px-12 text-center space-y-6">
        <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight">
          CONNECT // REACH OUT
        </h2>
        {personalInfo.email && (
          <div>
            <a
              href={`mailto:${personalInfo.email}`}
              className="text-xl sm:text-2xl font-bold uppercase text-theme-primary hover:underline"
            >
              {personalInfo.email}
            </a>
          </div>
        )}
        <div className="flex justify-center space-x-6 text-xs uppercase font-bold pt-4">
          {socialLinks.github && <a href={socialLinks.github} target="_blank" rel="noreferrer">GitHub</a>}
          {socialLinks.linkedin && <a href={socialLinks.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
          {socialLinks.twitter && <a href={socialLinks.twitter} target="_blank" rel="noreferrer">Twitter</a>}
        </div>
      </footer>
    </div>
  );
}
