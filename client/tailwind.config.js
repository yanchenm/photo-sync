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
      black: colors.black,
      gray: colors.trueGray,
      red: colors.rose,
      yellow: colors.amber,
    },
    extend: {
      outline: {
        default: '3px solid #6EE7B7',
      },
      padding: {
        n7: '-1.75rem',
        n2: '-0.5rem',
      },
      maxWidth: {
        '1/4': '25%',
        '1/3': '33%',
        '1/2': '50%',
        '3/4': '75%',
      },
      fontFamily: {
        default: ['Poppins'],
      },
      opacity: {
        6: '60%',
      },
    },
  },
  variants: {
    extend: {},
    backgroundColor: ['active', 'hover'],
  },
  plugins: [],
};
