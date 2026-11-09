"use client";

import React, { useMemo } from "react";
import { PortfolioData } from "./types";
import { MinimalEditorialTheme } from "./components/MinimalEditorialTheme";
import { CreativeExperimentalTheme } from "./components/CreativeExperimentalTheme";
import { ModernDeveloperTheme } from "./components/ModernDeveloperTheme";
import { ElegantLuxuryTheme } from "./components/ElegantLuxuryTheme";
import { PlayfulColorfulTheme } from "./components/PlayfulColorfulTheme";
import { CorporateProfessionalTheme } from "./components/CorporateProfessionalTheme";

interface ThemeRendererProps {
  data: PortfolioData;
  previewMode?: boolean;
}

export function ThemeRenderer({ data, previewMode }: ThemeRendererProps) {
  const { themeId, themeSettings } = data;
  const palette = themeSettings?.palette;

  // Compute CSS custom properties to scope variables dynamically
  const styleVars = useMemo(() => {
    if (!palette) return {};
    return {
      "--theme-primary": palette.primary,
      "--theme-secondary": palette.secondary,
      "--theme-background": palette.background,
      "--theme-surface": palette.surface,
      "--theme-text": palette.text,
      "--theme-text-muted": palette.textMuted,
      "--theme-accent": palette.accent,
      "--theme-border": palette.border,
      "--theme-radius":
        themeSettings.appearance?.borderRadius === "full"
          ? "9999px"
          : themeSettings.appearance?.borderRadius === "lg"
          ? "1rem"
          : themeSettings.appearance?.borderRadius === "md"
          ? "0.5rem"
          : themeSettings.appearance?.borderRadius === "sm"
          ? "0.25rem"
          : "0px",
    } as React.CSSProperties;
  }, [palette, themeSettings]);

  // Dispatch to the matching theme component
  const renderTheme = () => {
    switch (themeId) {
      case "creative-experimental":
        return <CreativeExperimentalTheme data={data} previewMode={previewMode} />;
      case "modern-developer":
        return <ModernDeveloperTheme data={data} previewMode={previewMode} />;
      case "elegant-luxury":
        return <ElegantLuxuryTheme data={data} previewMode={previewMode} />;
      case "playful-colorful":
        return <PlayfulColorfulTheme data={data} previewMode={previewMode} />;
      case "corporate-professional":
        return <CorporateProfessionalTheme data={data} previewMode={previewMode} />;
      case "minimal-editorial":
      default:
        return <MinimalEditorialTheme data={data} previewMode={previewMode} />;
    }
  };

  return (
    <div
      className="theme-container w-full min-h-screen transition-colors duration-200"
      style={styleVars}
    >
      {renderTheme()}
    </div>
  );
}
