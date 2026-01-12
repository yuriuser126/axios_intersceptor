import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f8f6f2",
          100: "#efe8dd",
          200: "#e2d3bf",
          300: "#cfb596",
          400: "#b48d64",
          500: "#9a6d3d",
          600: "#82552e",
          700: "#6a4326",
          800: "#563824",
          900: "#3c271c"
        }
      }
    }
  },
  plugins: []
};

export default config;
