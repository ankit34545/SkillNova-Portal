import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        midnight: {
          950: "#050711",
          900: "#070a16",
          850: "#0b0f20",
          800: "#0f162e",
          700: "#172142",
          600: "#22305e",
        },
        nova: {
          violet: "#8b5cf6",
          cyan: "#06b6d4",
          magenta: "#ec4899",
          glow: "#6366f1",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-glow": "radial-gradient(circle at 50% 30%, rgba(139, 92, 246, 0.18), rgba(6, 182, 212, 0.12), transparent 70%)",
      },
      boxShadow: {
        "glass": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        "glass-sm": "0 4px 16px 0 rgba(0, 0, 0, 0.25)",
        "glow-violet": "0 0 35px -5px rgba(139, 92, 246, 0.4)",
        "glow-cyan": "0 0 35px -5px rgba(6, 182, 212, 0.4)",
        "glow-magenta": "0 0 35px -5px rgba(236, 72, 153, 0.4)",
      },
      animation: {
        "pulse-slow": "pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
