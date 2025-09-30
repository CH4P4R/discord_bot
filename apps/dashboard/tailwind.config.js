/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#020617",
        foreground: "#f8fafc"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};
