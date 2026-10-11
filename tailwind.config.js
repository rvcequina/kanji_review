/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', '"Zen Maru Gothic"', 'system-ui', 'sans-serif'],
        jp: ['"Zen Maru Gothic"', '"Noto Sans JP"', 'sans-serif'],
      },
      colors: {
        ink: { 900: '#1b1730', 800: '#262040', 700: '#352d58' },
        kanji: { 50: '#fff0f8', 100: '#ffd9ee', 200: '#ffb3dc', 400: '#f55bb5', 500: '#e5239c', 600: '#c0167f' },
        vocab: { 50: '#f6f0ff', 100: '#e9d9ff', 200: '#d2b3ff', 400: '#a35cf0', 500: '#8a2be2', 600: '#7019c0' },
        grammar: { 50: '#effaf9', 100: '#d3f1ee', 200: '#a5e3dd', 400: '#2fb3a8', 500: '#0f9488', 600: '#0b756c', slate: '#475a78' },
        stage: { apprentice: '#ff5fa2', guru: '#9b5de5', master: '#4d7cff', enlightened: '#00b4d8', burned: '#5b6475' },
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        shake: {
          '0%,100%': { transform: 'translateX(0)' },
          '20%,60%': { transform: 'translateX(-8px)' },
          '40%,80%': { transform: 'translateX(8px)' },
        },
        pop: { '0%': { transform: 'scale(0.96)' }, '60%': { transform: 'scale(1.03)' }, '100%': { transform: 'scale(1)' } },
      },
      animation: {
        fadeIn: 'fadeIn .25s ease-out both',
        slideUp: 'slideUp .35s ease-out both',
        shake: 'shake .4s ease-in-out',
        pop: 'pop .25s ease-out',
      },
    },
  },
  plugins: [],
};
