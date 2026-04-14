import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Manrope", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        navy: { DEFAULT: "#2b3896", light: "#4551af", dim: "#1e2870" },
        surface: { DEFAULT: "#f9f9fb", low: "#f3f3f5", lowest: "#ffffff", high: "#e8e8ea", highest: "#e2e2e4" },
        onsurface: { DEFAULT: "#1a1c1d", variant: "#6b6e7a" },
        success: { DEFAULT: "#004f11", chip: "#a3f69c", "chip-text": "#002204", light: "#d4f5d0" },
      },
      borderRadius: { md: "0.75rem", lg: "1rem" },
      boxShadow: {
        ambient: "0px 12px 32px rgba(26,28,29,0.08)",
        "ambient-lg": "0px 20px 48px rgba(26,28,29,0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
