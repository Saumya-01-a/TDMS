/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: "#0b0f14",
        "dark-card": "rgba(18, 22, 28, 0.72)",
        "glass-border": "rgba(255, 255, 255, 0.10)",
      },
      animation: {
        'pulse-glow-green': 'pulse-glow-green 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-glow-red': 'pulse-glow-red 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-glow-green': {
          '0%, 100%': { opacity: 1, boxShadow: '0 0 5px rgba(34, 197, 94, 0.5)' },
          '50%': { opacity: .7, boxShadow: '0 0 15px rgba(34, 197, 94, 0.8)' },
        },
        'pulse-glow-red': {
          '0%, 100%': { opacity: 1, boxShadow: '0 0 5px rgba(239, 68, 68, 0.5)' },
          '50%': { opacity: .7, boxShadow: '0 0 15px rgba(239, 68, 68, 0.8)' },
        }
      }
    },
  },
  plugins: [],
}
