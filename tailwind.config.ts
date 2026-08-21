import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Deep archive-navy: evokes an official case-record system, not a consumer app
        ink: {
          950: "#0B1220",
          900: "#111C31",
          800: "#1B2A45",
          700: "#27395A",
          600: "#3A4F78",
        },
        paper: {
          50: "#FAF9F6",
          100: "#F3F1EA",
          200: "#E7E3D6",
        },
        // Amber-flare: reserved strictly for case status / urgency, never decoration
        flare: {
          500: "#C97A2B",
          600: "#A8611E",
        },
        signal: {
          found: "#2F6F4E",
          open: "#A8611E",
          closed: "#5B6472",
        },
      },
      fontFamily: {
        display: ["'Source Serif 4'", "Georgia", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
