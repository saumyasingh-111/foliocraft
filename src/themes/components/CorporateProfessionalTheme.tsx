"use client";

import React from "react";
import { PortfolioData } from "../types";
import { DynamicSectionRenderer } from "@/components/sections/DynamicSectionRenderer";
import {
  Briefcase,
  GraduationCap,
  Building,
  ArrowUpRight,
  Download,
  Mail,
  MapPin,
  CheckCircle,
  Award,
} from "lucide-react";

interface ThemeProps {
  data: PortfolioData;
  previewMode?: boolean;
}

export function CorporateProfessionalTheme({ data, previewMode }: ThemeProps) {
  const { personalInfo, about, projects, experience, education, skills, achievements, socialLinks, resumeUrl } = data;

  return (
    <div className="min-h-screen bg-theme-background text-theme-text font-sans selection:bg-theme-secondary selection:text-white">
      {/* Corporate Header */}
      <header className="border-b border-theme-border bg-white sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-theme-primary text-white flex items-center justify-center font-bold text-sm rounded">
              {personalInfo.fullName.charAt(0)}
            </div>
            <div>
              <span className="font-bold text-base text-gray-900 tracking-tight block">
                {personalInfo.fullName}
              </span>
              <span className="text-xs text-gray-500 block -mt-0.5">
                {personalInfo.professionalTitle}
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-8 text-xs font-semibold uppercase tracking-wider text-gray-600">
            <a href="#about" className="hover:text-theme-secondary">Executive Bio</a>
            <a href="#experience" className="hover:text-theme-secondary">Experience</a>
            <a href="#portfolio" className="hover:text-theme-secondary">Case Studies</a>
            <a href="#contact" className="hover:text-theme-secondary">Contact</a>
          </div>

          {resumeUrl && (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 bg-theme-primary text-white px-4 py-2 text-xs font-semibold rounded hover:bg-black transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download CV</span>
            </a>
          )}
        </div>
      </header>

      {/* Hero: Executive Leadership Introduction */}
      <section className="py-20 px-6 bg-white border-b border-theme-border">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-8 space-y-6">
            {personalInfo.statusBadge && (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded bg-blue-50 text-blue-800 text-xs font-semibold border border-blue-200">
                <CheckCircle className="h-3.5 w-3.5" />
                <span>{personalInfo.statusBadge}</span>
              </span>
            )}

            <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
              {personalInfo.heroHeadline || personalInfo.tagline}
            </h1>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-normal">
              {personalInfo.heroSubheadline || about.bioLong || personalInfo.tagline}
            </p>

            <div className="flex flex-wrap gap-6 pt-4 text-xs font-medium text-gray-600">
              {personalInfo.location && (
                <span className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4 text-theme-secondary" />
                  <span>{personalInfo.location}</span>
                </span>
              )}
              {about.yearsOfExperience && (
                <span className="flex items-center space-x-1">
                  <Briefcase className="h-4 w-4 text-theme-secondary" />
                  <span>{about.yearsOfExperience}+ Years Experience</span>
                </span>
              )}
            </div>
          </div>

          {personalInfo.avatarUrl && (
            <div className="md:col-span-4 flex justify-center">
              <div className="h-64 w-64 rounded-xl overflow-hidden border border-gray-200 shadow-md">
                <img
                  src={personalInfo.avatarUrl}
                  alt={personalInfo.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Executive Experience Timeline */}
      {experience && experience.length > 0 && (
        <section id="experience" className="py-20 px-6 max-w-6xl mx-auto space-y-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-theme-secondary">
              Track Record
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
              Professional Experience
            </h2>
          </div>

          <div className="space-y-6">
            {experience.map((exp) => (
              <div
                key={exp.id}
                className="bg-white p-6 rounded-lg border border-theme-border shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-gray-100 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{exp.position}</h3>
                    <div className="text-sm font-semibold text-theme-secondary">
                      {exp.company} {exp.location ? `— ${exp.location}` : ""}
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded border border-gray-200 self-start sm:self-auto">
                    {exp.startDate}
                  </span>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed">
                  {exp.description}
                </p>

                {exp.skillsUsed && exp.skillsUsed.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {exp.skillsUsed.map((sk, idx) => (
                      <span key={idx} className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                        {sk}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Key Case Studies / Projects */}
      {projects && projects.length > 0 && (
        <section id="portfolio" className="py-20 px-6 bg-white border-t border-theme-border">
          <div className="max-w-6xl mx-auto space-y-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-theme-secondary">
                Deliverables
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                Featured Strategic Projects
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="rounded-lg border border-theme-border overflow-hidden bg-theme-background flex flex-col justify-between"
                >
                  {proj.coverImageUrl && (
                    <div className="h-56 bg-gray-100 overflow-hidden">
                      <img
                        src={proj.coverImageUrl}
                        alt={proj.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-6 space-y-3 flex-grow flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="text-[11px] font-semibold uppercase text-theme-secondary">
                        {proj.category}
                      </span>
                      <h3 className="text-xl font-bold text-gray-900">{proj.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{proj.description}</p>
                    </div>

                    <div className="pt-4 border-t border-gray-200 flex items-center justify-between text-xs">
                      {proj.demoUrl && (
                        <a
                          href={proj.demoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-theme-secondary hover:underline inline-flex items-center space-x-1"
                        >
                          <span>Review Study</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
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

      {/* Education & Honors */}
      <section className="py-16 px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
        {education && education.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <GraduationCap className="h-5 w-5 text-theme-secondary" />
              <span>Education</span>
            </h3>
            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu.id} className="p-4 rounded border border-theme-border bg-white">
                  <div className="font-bold text-sm text-gray-900">{edu.degree}</div>
                  <div className="text-xs text-gray-600">{edu.institution} — {edu.startDate}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {skills && skills.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <Award className="h-5 w-5 text-theme-secondary" />
              <span>Core Competencies</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <span
                  key={s.id}
                  className="px-3 py-1.5 rounded border border-theme-border bg-white text-xs font-medium text-gray-800"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

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

      {/* Executive Footer */}
      <footer id="contact" className="py-16 px-6 border-t border-theme-border bg-white text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Initiate Dialogue</h2>
        {personalInfo.email && (
          <p className="text-sm font-semibold text-theme-secondary">
            <a href={`mailto:${personalInfo.email}`}>{personalInfo.email}</a>
          </p>
        )}
        <div className="flex justify-center space-x-6 text-xs text-gray-500 pt-2">
          {socialLinks.linkedin && <a href={socialLinks.linkedin} target="_blank" rel="noreferrer" className="hover:text-gray-900">LinkedIn</a>}
          {socialLinks.github && <a href={socialLinks.github} target="_blank" rel="noreferrer" className="hover:text-gray-900">GitHub</a>}
          {socialLinks.twitter && <a href={socialLinks.twitter} target="_blank" rel="noreferrer" className="hover:text-gray-900">X / Twitter</a>}
        </div>
      </footer>
    </div>
  );
}
