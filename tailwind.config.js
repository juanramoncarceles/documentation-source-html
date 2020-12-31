module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      height: {
        "(screen-20)": "calc(100vh - 5rem)",
      },
      minWidth: {
        64: "16rem",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
