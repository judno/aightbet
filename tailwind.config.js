module.exports = {
  purge: {
    mode: "all",
    enabled: false,
    content: ["./views/**/*.handlebars"],
    options: {
      keyframes: true,
    },
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
