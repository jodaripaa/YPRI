/** @type {import('tailwindcss').Config} */

// Colores semánticos de la app móvil del cliente (paleta del prototipo de v0).
// Se definen como canales RGB en app/globals.css para que funcionen los
// modificadores de opacidad de Tailwind 3 (por ejemplo bg-card/95).
const token = (nombre) => `rgb(var(--${nombre}) / <alpha-value>)`;

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ypri: {
          sidebar: "#0F172A",
          sidebarHover: "#1E293B",
          primary: "#2563EB",
          primaryHover: "#1D4ED8",
          bg: "#F1F5F9",
          card: "#FFFFFF",
          border: "#E2E8F0",
          text: "#0F172A",
          muted: "#64748B",
          success: "#059669",
          warning: "#D97706",
          danger: "#DC2626",
        },
        background: token("background"),
        foreground: token("foreground"),
        card: token("card"),
        primary: { DEFAULT: token("primary"), foreground: token("primary-foreground") },
        accent: { DEFAULT: token("accent"), foreground: token("accent-foreground"), strong: token("accent-strong") },
        muted: { DEFAULT: token("muted"), foreground: token("muted-foreground") },
        border: token("border"),
        destructive: token("destructive"),
      },
    },
  },
  plugins: [],
};
