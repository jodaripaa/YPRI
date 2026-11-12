/** @type {import('tailwindcss').Config} */

// Sistema visual de YPRI (basado en el prototipo de v0). Los colores son
// semánticos y se definen como canales RGB en app/globals.css para que
// funcionen los modificadores de opacidad de Tailwind 3 (por ejemplo bg-card/95).
const token = (nombre) => `rgb(var(--${nombre}) / <alpha-value>)`;

module.exports = {
  // El tema oscuro se activa con la clase "dark" en <html> (ver app/layout.tsx).
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      colors: {
        background: token("background"),
        foreground: token("foreground"),
        card: token("card"),
        primary: { DEFAULT: token("primary"), foreground: token("primary-foreground"), soft: token("primary-soft") },
        accent: { DEFAULT: token("accent"), foreground: token("accent-foreground"), strong: token("accent-strong") },
        muted: { DEFAULT: token("muted"), foreground: token("muted-foreground") },
        border: token("border"),
        // Texto de énfasis (precios, enlaces activos): azul marino en claro y celeste en oscuro.
        enfasis: token("enfasis"),
        grafica: token("grafica"),
        serie: { 1: token("serie-1"), 2: token("serie-2"), 3: token("serie-3") },
        destructive: token("destructive"),
      },
      boxShadow: {
        suave: "0 1px 2px rgb(0 49 81 / 0.04), 0 4px 16px -4px rgb(0 49 81 / 0.08)",
        elevada: "0 8px 30px -8px rgb(0 49 81 / 0.25)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "fade-up": { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "scale-in": { from: { opacity: "0", transform: "scale(0.96)" }, to: { opacity: "1", transform: "scale(1)" } },
        "slide-up": { from: { transform: "translateY(100%)" }, to: { transform: "translateY(0)" } },
        "slide-in-right": { from: { opacity: "0", transform: "translateX(24px)" }, to: { opacity: "1", transform: "translateX(0)" } },
        "crecer-x": { from: { transform: "scaleX(0)" }, to: { transform: "scaleX(1)" } },
        "crecer-y": { from: { transform: "scaleY(0)" }, to: { transform: "scaleY(1)" } },
        pop: { "0%": { transform: "scale(0.6)", opacity: "0" }, "60%": { transform: "scale(1.08)", opacity: "1" }, "100%": { transform: "scale(1)" } },
        "pulso-suave": { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0.55" } },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out both",
        "fade-up": "fade-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
        "scale-in": "scale-in 0.2s cubic-bezier(0.22, 1, 0.36, 1) both",
        "slide-up": "slide-up 0.3s cubic-bezier(0.22, 1, 0.36, 1) both",
        "slide-in-right": "slide-in-right 0.3s cubic-bezier(0.22, 1, 0.36, 1) both",
        "crecer-x": "crecer-x 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "crecer-y": "crecer-y 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        pop: "pop 0.45s cubic-bezier(0.22, 1, 0.36, 1) both",
        "pulso-suave": "pulso-suave 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
