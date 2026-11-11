"use client";

import React from "react";
import { PortfolioData } from "../types";
import { DynamicSectionRenderer } from "@/components/sections/DynamicSectionRenderer";
import {
  Terminal,
  Code2,
  GitBranch,
  Github,
  ExternalLink,
  Download,
  CheckCircle2,
  Cpu,
  FolderGit2,
} from "lucide-react";

interface ThemeProps {
  data: PortfolioData;
  previewMode?: boolean;
}

export function ModernDeveloperTheme({ data, previewMode }: ThemeProps) {
  const { personalInfo, about, projects, experience, education, skills, achievements, socialLinks, resumeUrl } = data;

  return (
    <div className="min-h-screen bg-theme-background text-theme-text font-mono selection:bg-theme-primary selection:text-black">
      {/* Code Terminal Top Header */}
      <nav className="border-b border-theme-border bg-theme-surface/80 backdrop-blur sticky top-0 z-30 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Terminal className="h-5 w-5 text-theme-primary" />
            <span className="font-bold text-sm tracking-tight">
              ~/{personalInfo.fullName.toLowerCase().replace(/\s+/g, "-")}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-theme-border text-theme-muted hidden sm:inline">
              main*
            </span>
          </div>

          <div className="hidden sm:flex items-center space-x-6 text-xs text-theme-muted">
            <a href="#about" className="hover:text-theme-primary transition-colors">&gt; about()</a>
            <a href="#repos" className="hover:text-theme-primary transition-colors">&gt; projects()</a>
            <a href="#experience" className="hover:text-theme-primary transition-colors">&gt; experience()</a>
            <a href="#contact" className="hover:text-theme-primary transition-colors">&gt; contact()</a>
          </div>

          {resumeUrl && (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded border border-theme-primary text-theme-primary text-xs hover:bg-theme-primary hover:text-black transition-colors"
            >
              <Download className="h-3 w-3" />
              <span>resume.pdf</span>
            </a>
          )}
        </div>
      </nav>

      {/* Terminal Hero Prompt */}
      <section className="py-20 px-6 border-b border-theme-border">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center space-x-2 text-xs text-theme-muted">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>system_status: {personalInfo.statusBadge || "ready_for_production"}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {personalInfo.avatarUrl && (
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden border-2 border-theme-primary/60 bg-theme-surface flex-shrink-0">
                <img
                  src={personalInfo.avatarUrl}
                  alt={personalInfo.fullName}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="space-y-2">
              <div className="text-theme-primary text-sm font-semibold">
                $ whoami --verbose
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white font-mono">
                {personalInfo.fullName}
              </h1>
              <p className="text-base sm:text-xl text-theme-secondary font-medium">
                {personalInfo.professionalTitle}
              </p>
            </div>
          </div>

          <p className="text-sm text-theme-muted max-w-2xl leading-relaxed pt-2">
            {personalInfo.heroHeadline || personalInfo.tagline}
          </p>

          <div className="flex flex-wrap gap-4 pt-4 text-xs">
            {personalInfo.location && (
              <span className="px-3 py-1.5 rounded border border-theme-border bg-theme-surface text-theme-muted">
                📍 {personalInfo.location}
              </span>
            )}
            {about.yearsOfExperience && (
              <span className="px-3 py-1.5 rounded border border-theme-border bg-theme-surface text-theme-muted">
                ⚡ {about.yearsOfExperience}+ Years Production Experience
              </span>
            )}
            <span className="px-3 py-1.5 rounded border border-theme-border bg-theme-surface text-theme-primary">
              ✓ Open Source Contributor
            </span>
          </div>
        </div>
      </section>

      {/* About Shell */}
      {about.bioLong && (
        <section id="about" className="py-16 px-6 border-b border-theme-border bg-theme-surface/40">
          <div className="max-w-6xl mx-auto space-y-4">
            <div className="flex items-center space-x-2 text-xs text-theme-primary">
              <Code2 className="h-4 w-4" />
              <span>// ABOUT_CONTRIBUTOR</span>
            </div>
            <div className="p-6 rounded border border-theme-border bg-theme-surface font-mono text-sm leading-relaxed text-theme-muted">
              {about.bioLong}
            </div>
          </div>
        </section>
      )}

      {/* Projects: Technical Repository Cards */}
      {projects && projects.length > 0 && (
        <section id="repos" className="py-20 px-6 border-b border-theme-border">
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FolderGit2 className="h-5 w-5 text-theme-primary" />
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  repositories / featured_projects
                </h2>
              </div>
              <span className="text-xs text-theme-muted">total: {projects.length}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="rounded border border-theme-border bg-theme-surface p-6 flex flex-col justify-between space-y-4 hover:border-theme-primary transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <GitBranch className="h-4 w-4 text-theme-primary" />
                        <h3 className="font-bold text-lg text-white group-hover:text-theme-primary transition-colors">
                          {proj.title}
                        </h3>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded border border-theme-border text-theme-muted">
                        {proj.category || "Public"}
                      </span>
                    </div>

                    <p className="text-xs text-theme-muted leading-relaxed">
                      {proj.description}
                    </p>
                  </div>

                  {proj.coverImageUrl && (
                    <div className="h-40 rounded overflow-hidden border border-theme-border/60">
                      <img
                        src={proj.coverImageUrl}
                        alt={proj.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}

                  <div className="space-y-3 pt-2">
                    {proj.technologies && (
                      <div className="flex flex-wrap gap-1.5">
                        {proj.technologies.map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] px-2 py-0.5 rounded bg-theme-background border border-theme-border text-theme-secondary"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center space-x-4 pt-2 text-xs">
                      {proj.demoUrl && (
                        <a
                          href={proj.demoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-theme-primary hover:underline"
                        >
                          <span>Live Deployment</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {proj.githubUrl && (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-theme-muted hover:text-white"
                        >
                          <Github className="h-3 w-3" />
                          <span>Source</span>
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

      {/* Experience / Git Commit Log */}
      {experience && experience.length > 0 && (
        <section id="experience" className="py-20 px-6 border-b border-theme-border bg-theme-surface/30">
          <div className="max-w-6xl mx-auto space-y-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
              <Cpu className="h-5 w-5 text-theme-primary" />
              <span>commit_history / engineering_roles</span>
            </h2>

            <div className="space-y-6">
              {experience.map((exp) => (
                <div
                  key={exp.id}
                  className="p-5 rounded border border-theme-border bg-theme-surface space-y-2 border-l-4 border-l-theme-primary"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-theme-muted">
                    <span className="text-theme-primary font-bold">{exp.startDate}</span>
                    <span>{exp.location || "Remote"}</span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {exp.position} @ <span className="text-theme-secondary">{exp.company}</span>
                  </h3>
                  <p className="text-xs text-theme-muted leading-relaxed">
                    {exp.description}
                  </p>
                  {exp.skillsUsed && exp.skillsUsed.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2">
                      {exp.skillsUsed.map((sk, idx) => (
                        <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-theme-muted">
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Skills Matrix */}
      {skills && skills.length > 0 && (
        <section className="py-16 px-6 border-b border-theme-border">
          <div className="max-w-6xl mx-auto space-y-6">
            <h3 className="text-sm uppercase tracking-widest text-theme-muted font-bold">
              // TECH_STACK_MATRIX
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {skills.map((s) => (
                <div
                  key={s.id}
                  className="p-3 rounded border border-theme-border bg-theme-surface flex items-center justify-between text-xs"
                >
                  <span className="font-bold text-white">{s.name}</span>
                  <span className="text-[10px] text-theme-primary">OK</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Dynamic Custom Sections */}
      {data.dynamicSections && data.dynamicSections.length > 0 && (
        <>
          {data.dynamicSections
            .filter((sec) => sec.isVisible)
            .sort((a, b) => a.order - b.order)
            .map((sec) => (
              <DynamicSectionRenderer key={sec.id} section={sec} previewMode={previewMode} />
            ))}
        </>
      )}

      {/* Footer */}
      <footer id="contact" className="py-20 px-6 text-center space-y-6 bg-theme-surface">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Ready to deploy together?
          </h2>
          {personalInfo.email && (
            <p className="text-sm text-theme-primary">
              <a href={`mailto:${personalInfo.email}`} className="hover:underline">
                {personalInfo.email}
              </a>
            </p>
          )}
          <div className="flex justify-center space-x-6 text-xs text-theme-muted pt-4">
            {socialLinks.github && <a href={socialLinks.github} target="_blank" rel="noreferrer" className="hover:text-white">GitHub</a>}
            {socialLinks.linkedin && <a href={socialLinks.linkedin} target="_blank" rel="noreferrer" className="hover:text-white">LinkedIn</a>}
            {socialLinks.twitter && <a href={socialLinks.twitter} target="_blank" rel="noreferrer" className="hover:text-white">X / Twitter</a>}
          </div>
        </div>
      </footer>
    </div>
  );
}
