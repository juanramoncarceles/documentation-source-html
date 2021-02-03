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
      width: {
        "80-screen": "80vw",
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
      outline: {
        subtle: "1px solid #6f6f6f",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
