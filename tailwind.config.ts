import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand color: a warm, lively coral orange (brighter and more playful than Poki's purple)
        brand: {
          50: "#fff1ed",
          100: "#ffe0d6",
          200: "#ffc2ad",
          300: "#ff9a73",
          400: "#ff703d",
          500: "#ff4d12",
          600: "#ed3703",
          700: "#c42803",
          800: "#9c240a",
          900: "#7e220d",
        },
        ink: {
          900: "#16131a",
          700: "#2c2733",
          500: "#574f63",
          400: "#7a7287",
          300: "#a59eb2",
        },
        surface: {
          DEFAULT: "#ffffff",
          muted: "#f6f5f8",
          sunken: "#efedf2",
        },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(22,19,26,0.04), 0 8px 24px -12px rgba(22,19,26,0.18)",
        "card-hover": "0 2px 4px rgba(22,19,26,0.06), 0 20px 40px -16px rgba(255,77,18,0.28)",
        float: "0 12px 32px -12px rgba(22,19,26,0.22)",
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
