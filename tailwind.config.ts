import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        klix: {
          "dark-blue": "#0F172A",
          orange: "#FF5825",
          white: "#FFFFFF",
          "light-gray": "#F1F5F9",
          "dark-gray": "#334155",
          "medium-gray": "#64748B",
          card: "#1E293B",
          surface: "#1E293B",
          divider: "#334155",
        },
        status: {
          new: "#94A3B8",
          calling: "#FBBF24",
          "hot-lead": "#22C55E",
          callback: "#F97316",
          "not-interested": "#EF4444",
          signed: "#3B82F6",
        },
      },
      animation: {
        pulse: "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "recording-pulse": "recording-pulse 1s ease-in-out infinite",
      },
      keyframes: {
        "recording-pulse": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.15)", opacity: "0.8" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
