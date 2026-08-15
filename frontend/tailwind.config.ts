import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./hooks/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#f7f8fa",
        ink: "#172026",
        muted: "#64717d",
        line: "#d9e0e7",
        accent: "#2563eb",
        danger: "#dc2626",
        success: "#15803d"
      }
    }
  },
  plugins: []
};

export default config;
