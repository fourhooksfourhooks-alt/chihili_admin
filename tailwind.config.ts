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
        brand: {
          light: "#93c5fd",
          DEFAULT: "#3b82f6",
          dark: "#1e40af",
        },
        primary: "#CB0342",
        primary1: "#830A0C",
        primary2: "#540608",
        secondary: "#FAF8F0",
        secondary1: "#F0EAD2",
      },
    },
  },
  plugins: [],
};

export default config;