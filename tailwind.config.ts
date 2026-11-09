import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/themes/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Platform Editorial Palette
        editorial: {
          ivory: "#F5F1E9",
          sand: "#D9CBB8",
          mocha: "#927A65",
          charcoal: "#292724",
          softdark: "#1E1C1A",
          muted: "#78716C",
          border: "#E5DEC9",
          card: "#FCFAF6",
        },
        // Dynamic Theme Tokens
        theme: {
          primary: "var(--theme-primary)",
          secondary: "var(--theme-secondary)",
          background: "var(--theme-background)",
          surface: "var(--theme-surface)",
          text: "var(--theme-text)",
          muted: "var(--theme-text-muted)",
          accent: "var(--theme-accent)",
          border: "var(--theme-border)",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Cormorant Garamond", "Georgia", "serif"],
        display: ["var(--font-cormorant)", "Playfair Display", "serif"],
        sans: ["var(--font-dm-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-space-grotesk)", "JetBrains Mono", "monospace"],
      },
      borderRadius: {
        theme: "var(--theme-radius, 0.5rem)",
      },
      boxShadow: {
        editorial: "0 10px 30px -10px rgba(41, 39, 36, 0.08)",
        "editorial-lg": "0 20px 40px -15px rgba(41, 39, 36, 0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
