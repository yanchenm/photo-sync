module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
    maxWidth: {
      '3/4': '75%',
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
