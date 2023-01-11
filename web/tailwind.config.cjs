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
        error: "#F48888",
        third: {
          500: "#EC892D",
          100: "#EC892D26"
        },
        gray: {
          100: "#F6F8FA"
        },
        purper: {
          500: "#B17DDA"
        }
      },
    },
  },
  plugins: [],
};
