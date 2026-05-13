/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        // Background layers
        dark: "#09090b",
        surface: {
          DEFAULT: "#0f0f12",
          1: "#111116",
          2: "#18181d",
          3: "#1f1f26",
        },
        border: {
          DEFAULT: "rgba(255,255,255,0.06)",
          strong: "rgba(255,255,255,0.12)",
        },
        // Accent palette — restrained and intentional
        accent: {
          blue:   "#3b82f6",
          cyan:   "#22d3ee",
          green:  "#22c55e",
          amber:  "#f59e0b",
          red:    "#f43f5e",
          purple: "#a78bfa",
        },
        // Text scale
        text: {
          primary:   "#f1f1f3",
          secondary: "#8b8d98",
          muted:     "#4b4d59",
        },
      },
      fontSize: {
        "2xs": ["0.65rem", { lineHeight: "1rem" }],
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
}
