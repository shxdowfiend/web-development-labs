/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./lab2/**/*.html', './lab3/**/*.{html,js}'],
  theme: {
    extend: {
      colors: {
        paper: '#f7f3ec',
        ink: '#2b2620',
        leather: {
          light: '#b98552',
          DEFAULT: '#8a5a2b',
          dark: '#6e4720',
        },
        sage: '#5f7f63',
      },
      fontFamily: {
        sans: ['"Segoe UI"', '-apple-system', 'Arial', 'sans-serif'],
        serif: ['Georgia', '"Times New Roman"', 'serif'],
      },
      screens: {
        xs: '420px',
        '3xl': '1680px',
      },
      spacing: {
        13: '3.25rem',
        30: '7.5rem',
      },
      borderRadius: {
        book: '0.4rem 1.2rem 1.2rem 0.4rem',
      },
      boxShadow: {
        shelf: '0 6px 0 -2px #d9c9ae, 0 10px 24px -12px rgba(43, 38, 32, .35)',
      },
    },
  },
  plugins: [],
};
