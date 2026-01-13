import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        // Core brand colors - sky blue spectrum
        pace: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
          950: "#082f49",
        },
        // Accent colors for different task types
        work: {
          light: "#818cf8",
          DEFAULT: "#6366f1",
          dark: "#4f46e5",
        },
        rest: {
          light: "#a78bfa",
          DEFAULT: "#8b5cf6",
          dark: "#7c3aed",
        },
        social: {
          light: "#fb923c",
          DEFAULT: "#f97316",
          dark: "#ea580c",
        },
        movement: {
          light: "#34d399",
          DEFAULT: "#10b981",
          dark: "#059669",
        },
      },
      backgroundImage: {
        // Ambient gradient backgrounds
        "gradient-morning":
          "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
        "gradient-day":
          "linear-gradient(135deg, #4facfe 0%, #00f2fe 50%, #43e97b 100%)",
        "gradient-evening":
          "linear-gradient(135deg, #fa709a 0%, #fee140 50%, #f093fb 100%)",
        "gradient-night":
          "linear-gradient(135deg, #0c1445 0%, #302b63 50%, #24243e 100%)",
        // Mesh gradients for futuristic effect
        "mesh-gradient":
          "radial-gradient(at 40% 20%, hsla(280,100%,70%,0.3) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,0.3) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,0.2) 0px, transparent 50%), radial-gradient(at 80% 50%, hsla(240,100%,70%,0.2) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(22,100%,77%,0.2) 0px, transparent 50%)",
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "gradient-shift": "gradient-shift 8s ease infinite",
        "float": "float 6s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "slide-up": "slide-up 0.5s ease-out",
        "slide-down": "slide-down 0.5s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
      },
      keyframes: {
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "glow": {
          "0%": { boxShadow: "0 0 5px rgba(56, 189, 248, 0.3)" },
          "100%": { boxShadow: "0 0 20px rgba(56, 189, 248, 0.6)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-down": {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        "glass-sm": "0 4px 16px 0 rgba(31, 38, 135, 0.2)",
        "glow-sm": "0 0 10px rgba(56, 189, 248, 0.3)",
        "glow-md": "0 0 20px rgba(56, 189, 248, 0.4)",
        "glow-lg": "0 0 30px rgba(56, 189, 248, 0.5)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        display: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
