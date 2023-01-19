/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    boxShadow: {
      DEFAULT: '0px 4px 10px rgba(191, 202, 213, 0.25)',
    },
    fontSize: {
      base: "12px",
      lg: "14px",
      xl: "16px",
      "2xl": "18px",
      "3xl": "22px",
    },
    extend: {
      colors: {
        primary: {
          100: "#E6F6F5",
          200: "#CCEEEB",
          300: "#99DDD8",
          400: "#66CBC4",
          500: "#33BAB1",
          600: "#00A99D",
          700: "#00877E",
          800: "#00655E",
          900: "#00443F",
          1000: "#00221F"
        },
        second: "#717D8A",
        third: {
          500: "#EC892D",
          100: "#EC892D26"
        },
        lafWhite: {
          100: "#FEFEFE",
          200: "#FDFDFE",
          300: "#FBFBFC",
          400: "#F8FAFB",
          500: "#F6F8F9",
          600: "#F4F6F8",
          700: "#C3C5C6",
          800: "#929495",
          900: "#626263",
          1000: "#313132"
        },
        grayModern: {
          100: "#EFF0F1",
          200: "#DEE0E2",
          300: "#BDC1C5",
          400: "#9CA2A8",
          500: "#7B838B",
          600: "#5A646E",
          700: "#485058",
          800: "#363C42",
          900: "#24282C",
          1000: "#121416"
        },
        grayIron: {
          100: "#F3F3F3",
          200: "#E6E6E7",
          300: "#CDCDD0",
          400: "#B4B4B8",
          500: "#9B9BA1",
          600: "#828289",
          700: "#68686E",
          800: "#4E4E52",
          900: "#343437",
          1000: "#1A1A1B"
        },
        error: {
          500: "#F16979"
        },
        warn: {
          400: "#FDB08A",
          700: "#C96330"
        },
        rose: {
          100: "#FDEAF1"
        },
        purple: {
          300: "#DBBDE9",
          400: "#C99CDF",
          600: "#A55AC9",
          700: "#7167AA",
        },
        blue: {
          400: "#86CEF5",
          500: "#5EBDF2",
          700: "#2B8ABF"
        },
        frostyNightfall: {
          200: "#EAEBF0"
        }
      },
    },
  },
  plugins: [],
};
