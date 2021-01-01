const colors = require('tailwindcss/colors');

module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      emerald: colors.emerald,
      indigo: colors.indigo,
      white: colors.white,
      gray: colors.trueGray,
      red: colors.rose,
      yellow: colors.amber,
    },
    extend: {
      outline: {
        default: '3px solid #6EE7B7',
      },
    },
    maxWidth: {
      '1/4': '25%',
      '1/3': '33%',
      '1/2': '50%',
      '3/4': '75%',
      30: '30rem',
    },
    fontFamily: {
      default: ['Poppins'],
    },
  },
  variants: {
    extend: {},
    backgroundColor: ['active'],
  },
  plugins: [],
};
