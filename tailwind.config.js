module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        green: {
          DEFAULT: "#82ab3f",
          dark: "#618030",
        },
      },
      height: {
        "(screen-20)": "calc(100vh - 5rem)",
      },
      minWidth: {
        64: "16rem",
      },
      minHeight: {
        "(screen-20)": "calc(100vh - 5rem)",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
