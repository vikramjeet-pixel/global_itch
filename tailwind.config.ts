import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "surface": "#ffffff",
        "on-surface": "#1a1c1e",
        "on-surface-variant": "#44474e",
        "outline-variant": "#c4c6cf",
        "primary": "#0049e6",
        "on-primary": "#ffffff",
        "secondary-container": "#f0f0f3",
        "surface-container-low": "#f7f9fc",
        "error": "#ba1a1a"
      },
      fontFamily: {
        "headline": ["Newsreader", "serif"],
        "body": ["Inter", "sans-serif"],
        "label": ["Inter", "sans-serif"]
      }
    },
  },
  plugins: [],
};
export default config;
