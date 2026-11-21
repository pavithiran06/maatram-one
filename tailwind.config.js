/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        maatram: {
          primary: "#174B38",
          dark: "#18332A",
          hover: "#123b2c",
          surface: "#FFFFFF",
          ivory: "#FAF4E8",
          gold: "#D5A03E",
          "gold-light": "#F6ECDB",
          "gold-dark": "#B88326",
          soft: "#F8FAF9",
          border: "#E2E8F0",
          muted: "#64748B",
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 4px 6px -1px rgba(23, 75, 56, 0.06), 0 2px 4px -1px rgba(23, 75, 56, 0.04)',
        'elevated': '0 10px 15px -3px rgba(23, 75, 56, 0.08), 0 4px 6px -2px rgba(23, 75, 56, 0.04)',
      }
    },
  },
  plugins: [],
}
