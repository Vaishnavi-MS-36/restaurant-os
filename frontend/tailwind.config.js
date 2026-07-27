/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: '#0f0d0c',
          900: '#1a1614',
          800: '#25201d',
          700: '#332b26',
        },
        terracotta: {
          400: '#e8916b',
          500: '#d9754a',
          600: '#c15f38',
        },
        cream: '#f5efe6',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
