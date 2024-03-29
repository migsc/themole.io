/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        incosolata: ["Inconsolata", "sans-serif"],
      },
    },
  },
  plugins: [],
};

module.exports = config;
