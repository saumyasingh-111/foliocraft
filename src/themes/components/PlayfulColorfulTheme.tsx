"use client";

import React from "react";
import { PortfolioData } from "../types";
import { DynamicSectionRenderer } from "@/components/sections/DynamicSectionRenderer";
import { Sparkles, ArrowUpRight, Heart, Smile, Star, Download } from "lucide-react";

interface ThemeProps {
  data: PortfolioData;
  previewMode?: boolean;
}

export function PlayfulColorfulTheme({ data, previewMode }: ThemeProps) {
  const { personalInfo, about, projects, experience, skills, socialLinks, resumeUrl } = data;

  return (
    <div className="min-h-screen bg-theme-background text-theme-text font-sans selection:bg-theme-secondary selection:text-white">
      {/* Friendly Rounded Header */}
      <header className="p-6 max-w-6xl mx-auto">
        <div className="bg-white/80 backdrop-blur rounded-full px-6 py-3 border border-theme-border flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <span className="h-4 w-4 rounded-full bg-theme-secondary flex items-center justify-center text-[10px] text-white font-bold">
              ★
            </span>
            <span className="font-bold text-base tracking-tight text-gray-900">
              {personalInfo.fullName}
            </span>
          </div>

          <div className="hidden sm:flex items-center space-x-6 text-xs font-semibold text-gray-600">
            <a href="#work" className="hover:text-theme-primary">Projects</a>
            <a href="#about" className="hover:text-theme-primary">Story</a>
            <a href="#skills" className="hover:text-theme-primary">Magic Tools</a>
            <a href="#contact" className="hover:text-theme-primary">Say Hi!</a>
          </div>

          {resumeUrl && (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-theme-primary text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm hover:opacity-90"
            >
              Resume 📄
            </a>
          )}
        </div>
      </header>

      {/* Hero: Joyful Bubble & Playful Typography */}
      <section className="py-16 sm:py-24 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center space-x-2 bg-theme-secondary/15 text-theme-secondary px-4 py-1.5 rounded-full text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{personalInfo.statusBadge || "Making great things happen"}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
            {personalInfo.heroHeadline || personalInfo.tagline}
          </h1>

          <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {personalInfo.heroSubheadline || personalInfo.professionalTitle}
          </p>

          <div className="pt-4 flex justify-center items-center space-x-4">
            <a
              href="#contact"
              className="bg-theme-secondary text-white px-6 py-3 rounded-full text-sm font-bold shadow-md hover:scale-105 transition-transform"
            >
              Let’s Connect ✨
            </a>
            <a
              href="#work"
              className="bg-white text-gray-800 border border-theme-border px-6 py-3 rounded-full text-sm font-bold hover:bg-gray-50 transition-colors"
            >
              See My Works 👇
            </a>
          </div>
        </div>
      </section>

      {/* Projects Grid: Soft Pastel Cards */}
      {projects && projects.length > 0 && (
        <section id="work" className="py-20 px-6 max-w-6xl mx-auto space-y-12">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-theme-secondary">
                Portfolio Fun
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-1">
                Selected Creations 🎨
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="bg-white rounded-3xl p-6 border border-theme-border shadow-sm hover:shadow-lg transition-all space-y-5 flex flex-col justify-between"
              >
                {proj.coverImageUrl && (
                  <div className="rounded-2xl overflow-hidden h-60 bg-purple-50">
                    <img
                      src={proj.coverImageUrl}
                      alt={proj.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-theme-primary px-3 py-1 rounded-full bg-purple-50">
                      {proj.category}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900">{proj.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{proj.description}</p>
                </div>

                {proj.technologies && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {proj.technologies.map((t, i) => (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {proj.demoUrl && (
                  <div className="pt-2">
                    <a
                      href={proj.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1 text-sm font-bold text-theme-secondary hover:underline"
                    >
                      <span>Check it out live</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills Pill Cloud */}
      {skills && skills.length > 0 && (
        <section id="skills" className="py-16 px-6 max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Skills & Superpowers ⚡
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {skills.map((s) => (
              <span
                key={s.id}
                className="bg-white border border-theme-border px-4 py-2 rounded-2xl text-sm font-bold text-gray-800 shadow-sm hover:scale-105 transition-transform"
              >
                {s.name}
              </span>
            ))}
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
      <footer id="contact" className="py-20 px-6 text-center space-y-6 bg-white border-t border-theme-border">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
          Want to start something awesome?
        </h2>
        {personalInfo.email && (
          <p className="text-lg font-bold text-theme-secondary">
            <a href={`mailto:${personalInfo.email}`}>{personalInfo.email}</a>
          </p>
        )}
        <div className="flex justify-center space-x-6 text-sm font-bold text-gray-600 pt-2">
          {socialLinks.twitter && <a href={socialLinks.twitter} target="_blank" rel="noreferrer">Twitter</a>}
          {socialLinks.linkedin && <a href={socialLinks.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
          {socialLinks.github && <a href={socialLinks.github} target="_blank" rel="noreferrer">GitHub</a>}
        </div>
      </footer>
    </div>
  );
}
