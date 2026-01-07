/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        solar: {
          // Light Mode
          primary: 'var(--solar-primary)',
          yellow: 'var(--solar-yellow)',
          orange: 'var(--solar-orange)',
          muted: 'var(--solar-muted)',
          bg: 'var(--solar-bg)',
          card: 'var(--solar-card)',
          border: 'var(--solar-border)',
          night: 'var(--solar-night)',

          // Functional
          success: 'var(--solar-success)',
          warning: 'var(--solar-warning)',
          danger: 'var(--solar-danger)',
          panel: 'var(--solar-panel)',
        },
      },
      backgroundImage: {
        "solar-gradient":
          "linear-gradient(135deg, #FFD166 0%, #F4A261 50%, #2ECC71 100%)",
      },
    },
  },
  plugins: [],
}