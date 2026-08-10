import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        medrush: {
          accent: "#0f766e",
          amber: "#d97706",
          coral: "#dc5b4f",
          ink: "#111827",
          muted: "#667085",
          page: "#f7f9fa",
          stable: "#0f766e",
          surface: "#ffffff",
        },
        xdc: {
          cyan: "#36f1d4",
          deep: "#06131f",
          ink: "#08111c",
          line: "#203245",
          mist: "#eaf4f3",
          navy: "#0a1b2d",
          sky: "#80e7ff",
          slate: "#10243a",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "IBM Plex Sans",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 24, 40, 0.06), 0 8px 24px rgba(16, 24, 40, 0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
