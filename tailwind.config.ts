import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        surface: "#111111",
        border: "#1f1f1f",
        accent: "#c8f060",
        muted: "#6b6b6b",
        subtle: "#2a2a2a",
      },
      fontFamily: {
        sans: ["Syne", "sans-serif"],
        mono: ["DM Mono", "monospace"],
      },
      fontSize: {
        "2xs": "0.625rem",
      },
    },
  },
  plugins: [],
};

export default config;
