import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/pages/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Geist", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
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
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "0.6rem",
        md: "calc(0.6rem - 2px)",
        sm: "calc(0.6rem - 4px)",
      },
      keyframes: {
        "grid-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-2px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 rgba(0,0,0,0)" },
          "50%": { boxShadow: "0 0 24px rgba(180, 255, 120, 0.25)" },
        },
      },
      animation: {
        "grid-float": "grid-float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
      },
      backgroundImage: {
        "cyber-grid":
          "radial-gradient(circle at 20% 20%, rgba(148, 163, 184, 0.08) 0, transparent 40%), radial-gradient(circle at 80% 0%, rgba(56, 189, 248, 0.08) 0, transparent 35%), linear-gradient(180deg, rgba(12,12,12,0.2), rgba(12,12,12,0.2))",
      },
    },
  },
  plugins: [animate],
};

export default config;
