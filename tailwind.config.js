/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./app.js",
    "./components/**/*.tsx", // Include React components if they were ever used or might be in the future
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
