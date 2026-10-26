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
        brand: {
          50: "#eef7ff",
          100: "#d9ecff",
          200: "#bcdfff",
          300: "#8eccff",
          400: "#58b0fa",
          500: "#3092f3",
          600: "#1874e4",
          700: "#125cc6",
          800: "#144ca0",
          900: "#16417f",
          950: "#102850",
        },
      },
    },
  },
  plugins: [],
};
export default config;
