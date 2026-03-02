/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#0a0f1a",
          surface: "#12192b",
          card: "#161f33",
          border: "#26314a",
          text: "#e6ecff",
          muted: "#93a4c8",
          accent: "#4f8cff",
          accentSoft: "#2f6de0",
        },
      },
    },
  },
  plugins: [],
}