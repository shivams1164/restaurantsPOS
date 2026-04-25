// FILE: mobile/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./hooks/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        appbg: "#F7F5F2",
        card: "#FFFFFF",
        border: "#E8E5E0",
        primary: "#1A1A1A",
        accent: "#E8A020",
        status: {
          pending: "#C97B2F",
          preparing: "#2F80ED",
          ready: "#2E7D32",
          delivered: "#6B7280",
          cancelled: "#DC2626",
          picked: "#4B5563"
        }
      },
      fontFamily: {
        inter: ["Inter_400Regular", "sans-serif"],
        interSemi: ["Inter_600SemiBold", "sans-serif"]
      }
    }
  },
  plugins: []
};
