import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3B82F6",
          50: "#EBF2FE",
          100: "#D7E6FD",
          200: "#AFCDFB",
          300: "#87B4F9",
          400: "#5F9BF7",
          500: "#3B82F6",
          600: "#0B61EE",
          700: "#084BB8",
          800: "#063583",
          900: "#1E3A8A",
          950: "#031D4D",
        },
        secondary: {
          DEFAULT: "#1E3A8A",
          light: "#3B82F6",
          dark: "#1E3A8A",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #3B82F6 0%, #1E3A8A 100%)",
        "gradient-hero": "linear-gradient(135deg, #0f172a 0%, #1E3A8A 50%, #0f172a 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
