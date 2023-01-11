/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    fontSize: {
      base: "12px",
      lg: "14px",
      xl: "16px",
      "2xl": "18px",
      "3xl": "22px",
    },
    extend: {
      colors: {
        primary: "#00A99D",
        second: "#717D8A",
        third: {
          500: "#EC892D",
          100: "#EC892D26"
        }
      },
    },
  },
  plugins: [],
};
