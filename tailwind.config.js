import defaultTheme from "tailwindcss/defaultTheme";
import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
    "./components/**/*.{ts,tsx,js,jsx}"
  ],
  theme: {
    container: { 
      center: true, 
      padding: "1.5rem",
      screens: {
        "2xl": "1400px"
      }
    },

    extend: {
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
        mono: ["Fira Code", ...defaultTheme.fontFamily.mono],
      },

      colors: {
        background: "oklch(var(--background))",
        foreground: "oklch(var(--foreground))",
        border: "oklch(var(--border))",
        input: "oklch(var(--input))",
        ring: "oklch(var(--ring))",
        card: {
          DEFAULT: "oklch(var(--card))",
          foreground: "oklch(var(--card-foreground))",
        },
        accent: {
          DEFAULT: "oklch(var(--accent))",
          foreground: "oklch(var(--accent-foreground))",
        },
        brand: {
          DEFAULT: "oklch(var(--brand))",
          light: "oklch(var(--brand-light))",
          dark: "oklch(var(--brand-dark))",
        },
        muted: {
          DEFAULT: "oklch(var(--muted))",
          foreground: "oklch(var(--muted-foreground))",
        },
        sidebar: {
          DEFAULT: "oklch(var(--sidebar))",
          foreground: "oklch(var(--sidebar-foreground))"
        },
        primary: {
          DEFAULT: "oklch(var(--primary))",
          foreground: "oklch(var(--primary-foreground))",
          50: "color-mix(in oklch, oklch(var(--primary)), transparent 90%)",
          100: "color-mix(in oklch, oklch(var(--primary)), transparent 80%)",
          200: "color-mix(in oklch, oklch(var(--primary)), transparent 60%)",
          300: "color-mix(in oklch, oklch(var(--primary)), transparent 40%)",
          400: "color-mix(in oklch, oklch(var(--primary)), transparent 20%)",
          500: "oklch(var(--primary))",
          600: "color-mix(in oklch, oklch(var(--primary)), black 20%)",
          700: "color-mix(in oklch, oklch(var(--primary)), black 40%)",
          800: "color-mix(in oklch, oklch(var(--primary)), black 60%)",
          900: "color-mix(in oklch, oklch(var(--primary)), black 80%)",
        },
        secondary: {
          DEFAULT: "oklch(var(--secondary))",
          foreground: "oklch(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "oklch(var(--destructive))",
          foreground: "oklch(var(--destructive-foreground))",
          50: "color-mix(in oklch, oklch(var(--destructive)), transparent 90%)",
          100: "color-mix(in oklch, oklch(var(--destructive)), transparent 80%)",
          500: "oklch(var(--destructive))",
        },
        popover: {
          DEFAULT: "oklch(var(--popover))",
          foreground: "oklch(var(--popover-foreground))",
        },
      },

      borderRadius: {
        lg: "1rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },

      boxShadow: {
        soft: "0 4px 30px -10px rgba(0,0,0,.15)",
        medium: "0 8px 40px -15px rgba(0,0,0,.2)",
        glow: "0 0 30px rgba(90, 125, 255, .3)",
        "glow-lg": "0 0 50px rgba(90, 125, 255, .4)",
        inner: "inset 0 2px 4px 0 rgba(0,0,0,0.05)",
      },

      animation: {
        "fade-in": "fade-in 0.6s ease-out",
        "fade-out": "fade-out 0.6s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "slide-out": "slide-out 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "scale-out": "scale-out 0.2s ease-out",
        "shimmer": "shimmer 2s infinite linear",
        "pulse-soft": "pulse 3s infinite",
        "bounce-soft": "bounce 2s infinite",
        "spin-slow": "spin 3s linear infinite",
      },

      backdropBlur: {
        xs: "2px",
      },

      scale: {
        "102": "1.02",
      },

      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },

      transitionProperty: {
        "height": "height",
        "spacing": "margin, padding",
      },

      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-out": {
          from: { opacity: "1", transform: "translateY(0)" },
          to: { opacity: "0", transform: "translateY(10px)" },
        },
        "slide-in": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-out": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-100%)" },
        },
        "scale-in": {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        "scale-out": {
          from: { transform: "scale(1)", opacity: "1" },
          to: { transform: "scale(0.95)", opacity: "0" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200px 0" },
          "100%": { backgroundPosition: "calc(200px + 100%) 0" },
        },
      },

      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-br": "linear-gradient(135deg, var(--tw-gradient-stops))",
        "gradient-hero": "linear-gradient(135deg, #1A73E8 0%, #59B8FF 45%, #2DE3FF 100%)",
        "gradient-accent": "linear-gradient(85deg, #7CE03A, #FFB703, #FF7A00)",
        "chevron-down": "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e\")",
      },

      ringColor: {
        brand: {
          50: "color-mix(in oklch, oklch(var(--brand)), transparent 50%)",
        }
      },
    }
  },
  plugins: [tailwindcssAnimate],
};