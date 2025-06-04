/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        tennis: {
          green: "#228B22",
          "green-light": "#32CD32",
          "green-dark": "#006400",
        },
        clay: {
          orange: "#CD853F",
          "orange-light": "#DEB887",
          "orange-dark": "#A0522D",
        },
        championship: {
          gold: "#FFD700",
          "gold-light": "#FFFFE0",
          "gold-dark": "#B8860B",
        },
        court: {
          white: "#FFFFFF",
          "gray-light": "#F9FAFB",
          "gray-medium": "#6B7280",
          "gray-dark": "#374151",
        },
        match: {
          win: "#10B981",
          lose: "#EF4444",
          pending: "#F59E0B",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["Fira Code", "monospace"],
      },
      animation: {
        "score-update": "pulse 0.5s ease-in-out",
        "match-highlight": "bounce 0.5s ease-in-out",
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
      },
      maxWidth: {
        "8xl": "88rem",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
