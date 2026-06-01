/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app.vue",
    "./components/**/*.{vue,js,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./composables/**/*.{js,ts}",
    "./plugins/**/*.{js,ts}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Tajawal', 'Noto Sans Arabic', 'system-ui', 'sans-serif'],
        arabic: ['Tajawal', 'Noto Sans Arabic', 'system-ui', 'sans-serif'],
      },
      colors: {
        sand: "#efe4cf",
        ink: "#0f172a",
        clay: "#8a5a3b",
        palm: "#2f6b4f",
        sea: "#0e7490"
      }
    }
  },
  plugins: []
};
