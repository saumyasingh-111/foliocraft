"use client";

import React from "react";
import { PortfolioData } from "../types";
import {
  ArrowUpRight,
  Download,
  Mail,
  MapPin,
  ExternalLink,
  Github,
  Linkedin,
  Twitter,
  Dribbble,
} from "lucide-react";

interface ThemeProps {
  data: PortfolioData;
  previewMode?: boolean;
}

export function MinimalEditorialTheme({ data, previewMode }: ThemeProps) {
  const { personalInfo, about, projects, experience, education, skills, achievements, socialLinks, resumeUrl } = data;

  return (
    <div className="min-h-screen bg-theme-background text-theme-text font-serif selection:bg-theme-primary selection:text-theme-background">
      {/* Editorial Top Navigation */}
      <nav className="border-b border-theme-border/70 py-6 px-6 lg:px-16">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="text-xl font-normal tracking-tight font-serif uppercase">
            {personalInfo.fullName}
          </div>

          <div className="hidden sm:flex items-center space-x-8 text-xs font-mono tracking-widest uppercase text-theme-muted">
            <a href="#about" className="hover:text-theme-text transition-colors">About</a>
            <a href="#projects" className="hover:text-theme-text transition-colors">Works</a>
            <a href="#experience" className="hover:text-theme-text transition-colors">Experience</a>
            <a href="#contact" className="hover:text-theme-text transition-colors">Contact</a>
          </div>

          {resumeUrl && (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 text-xs font-mono uppercase tracking-wider border-b border-theme-text pb-0.5 hover:text-theme-secondary transition-colors"
            >
              <span>Resume</span>
              <Download className="h-3 w-3" />
            </a>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 lg:py-32 px-6 lg:px-16 border-b border-theme-border/60">
        <div className="mx-auto max-w-6xl">
          <div className="space-y-6 max-w-4xl">
            {personalInfo.statusBadge && (
              <div className="inline-block text-xs font-mono uppercase tracking-widest text-theme-secondary">
                — {personalInfo.statusBadge}
              </div>
            )}

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight leading-[1.1]">
              {personalInfo.heroHeadline || personalInfo.tagline || personalInfo.professionalTitle}
            </h1>

            <p className="font-sans text-base sm:text-lg text-theme-muted font-light leading-relaxed max-w-2xl pt-2">
              {personalInfo.heroSubheadline || personalInfo.tagline}
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-6 text-xs font-mono uppercase tracking-wider text-theme-muted">
              {personalInfo.location && (
                <span className="flex items-center space-x-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{personalInfo.location}</span>
                </span>
              )}
              {personalInfo.professionalTitle && (
                <span>{personalInfo.professionalTitle}</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      {about.bioLong && (
        <section id="about" className="py-20 px-6 lg:px-16 border-b border-theme-border/60">
          <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-4">
              <span className="text-xs font-mono uppercase tracking-widest text-theme-muted">
                01 / Narrative
              </span>
              <h2 className="text-2xl font-normal mt-2">Biography</h2>
            </div>
            <div className="md:col-span-8 space-y-6">
              <p className="font-serif text-xl sm:text-2xl text-theme-text leading-relaxed font-light italic">
                “{about.bioLong}”
              </p>

              {about.areasOfExpertise && about.areasOfExpertise.length > 0 && (
                <div className="pt-4">
                  <span className="text-xs font-mono uppercase tracking-widest text-theme-muted block mb-3">
                    Areas of Expertise
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {about.areasOfExpertise.map((area, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 border border-theme-border text-xs font-mono text-theme-text bg-theme-surface"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Selected Works / Projects */}
      {projects && projects.length > 0 && (
        <section id="projects" className="py-24 px-6 lg:px-16 border-b border-theme-border/60">
          <div className="mx-auto max-w-6xl space-y-16">
            <div className="flex items-end justify-between border-b border-theme-border pb-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-theme-muted">
                  02 / Portfolio
                </span>
                <h2 className="text-3xl sm:text-4xl font-normal mt-1">Selected Works</h2>
              </div>
              <span className="text-xs font-mono text-theme-muted">({projects.length} Works)</span>
            </div>

            <div className="space-y-24">
              {projects.map((proj, idx) => (
                <article key={proj.id} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                  <div className={`lg:col-span-7 ${idx % 2 === 1 ? "lg:order-2" : ""}`}>
                    {proj.coverImageUrl && (
                      <div className="overflow-hidden border border-theme-border bg-theme-surface">
                        <img
                          src={proj.coverImageUrl}
                          alt={proj.title}
                          className="w-full h-80 sm:h-96 object-cover filter grayscale hover:grayscale-0 transition-all duration-700"
                        />
                      </div>
                    )}
                  </div>

                  <div className={`lg:col-span-5 space-y-4 ${idx % 2 === 1 ? "lg:order-1" : ""}`}>
                    <span className="text-xs font-mono uppercase tracking-widest text-theme-secondary">
                      {proj.category || "Case Study"}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-light tracking-tight">{proj.title}</h3>
                    <p className="font-sans text-sm text-theme-muted leading-relaxed font-light">
                      {proj.description}
                    </p>

                    {proj.technologies && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {proj.technologies.map((t, i) => (
                          <span key={i} className="text-[11px] font-mono text-theme-muted">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="pt-4 flex items-center space-x-6 text-xs font-mono uppercase tracking-wider">
                      {proj.demoUrl && (
                        <a
                          href={proj.demoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1.5 border-b border-theme-text pb-0.5 hover:text-theme-secondary"
                        >
                          <span>Live Site</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </a>
                      )}
                      {proj.githubUrl && (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1.5 text-theme-muted hover:text-theme-text"
                        >
                          <Github className="h-3.5 w-3.5" />
                          <span>Code</span>
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Experience Timeline */}
      {experience && experience.length > 0 && (
        <section id="experience" className="py-20 px-6 lg:px-16 border-b border-theme-border/60">
          <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-4">
              <span className="text-xs font-mono uppercase tracking-widest text-theme-muted">
                03 / Trajectory
              </span>
              <h2 className="text-2xl font-normal mt-2">Career History</h2>
            </div>
            <div className="md:col-span-8 space-y-10">
              {experience.map((exp) => (
                <div key={exp.id} className="border-b border-theme-border pb-8 last:border-b-0 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <h3 className="text-xl font-normal">{exp.position}</h3>
                    <span className="text-xs font-mono text-theme-muted">{exp.startDate}</span>
                  </div>
                  <div className="text-sm font-sans text-theme-secondary font-medium">
                    {exp.company} {exp.location ? `— ${exp.location}` : ""}
                  </div>
                  <p className="font-sans text-sm text-theme-muted leading-relaxed font-light pt-1">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Skills Matrix */}
      {skills && skills.length > 0 && (
        <section className="py-16 px-6 lg:px-16 border-b border-theme-border/60">
          <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-4">
              <span className="text-xs font-mono uppercase tracking-widest text-theme-muted">
                04 / Competencies
              </span>
              <h3 className="text-xl font-normal mt-1">Disciplines</h3>
            </div>
            <div className="md:col-span-8 flex flex-wrap gap-2.5">
              {skills.map((s) => (
                <span
                  key={s.id}
                  className="px-3.5 py-1.5 border border-theme-border bg-theme-surface text-xs font-mono tracking-wide"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer / Contact */}
      <footer id="contact" className="py-24 px-6 lg:px-16 bg-theme-background">
        <div className="mx-auto max-w-6xl text-center space-y-8">
          <span className="text-xs font-mono uppercase tracking-widest text-theme-muted">
            05 / Dialogue
          </span>
          <h2 className="text-4xl sm:text-5xl font-light tracking-tight max-w-xl mx-auto">
            Let’s craft something meaningful together.
          </h2>

          {personalInfo.email && (
            <div>
              <a
                href={`mailto:${personalInfo.email}`}
                className="font-serif text-2xl sm:text-3xl italic text-theme-text border-b border-theme-text pb-1 hover:text-theme-secondary transition-colors"
              >
                {personalInfo.email}
              </a>
            </div>
          )}

          {/* Socials */}
          <div className="flex items-center justify-center space-x-6 pt-6 text-xs font-mono uppercase tracking-widest text-theme-muted">
            {socialLinks.linkedin && (
              <a href={socialLinks.linkedin} target="_blank" rel="noreferrer" className="hover:text-theme-text">
                LinkedIn
              </a>
            )}
            {socialLinks.github && (
              <a href={socialLinks.github} target="_blank" rel="noreferrer" className="hover:text-theme-text">
                GitHub
              </a>
            )}
            {socialLinks.twitter && (
              <a href={socialLinks.twitter} target="_blank" rel="noreferrer" className="hover:text-theme-text">
                Twitter
              </a>
            )}
            {socialLinks.dribbble && (
              <a href={socialLinks.dribbble} target="_blank" rel="noreferrer" className="hover:text-theme-text">
                Dribbble
              </a>
            )}
          </div>

          <div className="pt-12 text-[11px] font-mono text-theme-muted">
            Designed & published via FolioCraft Studio.
          </div>
        </div>
      </footer>
    </div>
  );
}
