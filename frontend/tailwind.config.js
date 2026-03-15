/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
      },
      fontFamily: {
        display: ['"DM Sans"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 16px 0 rgba(6,182,212,0.07), 0 1px 4px 0 rgba(0,0,0,0.06)',
        'card-hover': '0 8px 32px 0 rgba(6,182,212,0.13), 0 2px 8px 0 rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}
