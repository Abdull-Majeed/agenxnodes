/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 10px 30px rgba(15, 23, 42, 0.08)",
        glass: "0 18px 40px rgba(15, 23, 42, 0.12)"
      }
    }
  },
  plugins: []
};
