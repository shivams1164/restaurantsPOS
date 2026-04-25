// FILE: web/tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./store/**/*.{ts,tsx}"
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1440px"
      }
    },
    extend: {
      colors: {
        sidebar: {
          DEFAULT: "#0F0F0F",
          foreground: "#FFFFFF"
        },
        app: {
          background: "#FAFAF8",
          border: "#E5E3DF",
          accent: "#C97B2F"
        },
        status: {
          pending: "#C97B2F",
          preparing: "#2F80ED",
          ready: "#2E7D32",
          delivered: "#6B7280",
          cancelled: "#DC2626"
        }
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"]
      },
      borderRadius: {
        xl: "0.75rem"
      },
      boxShadow: {
        lift: "0 2px 10px rgba(0,0,0,0.05)"
      },
      keyframes: {
        "slide-up": {
          "0%": { transform: "translateY(16px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        },
        pulsebadge: {
          "0%": { transform: "scale(1)", opacity: "0.75" },
          "50%": { transform: "scale(1.04)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "0.75" }
        }
      },
      animation: {
        "slide-up": "slide-up 180ms ease-out",
        pulsebadge: "pulsebadge 900ms ease-in-out"
      }
    }
  },
  plugins: []
};

export default config;
