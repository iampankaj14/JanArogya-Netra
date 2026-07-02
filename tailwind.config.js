/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./features/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0B1D3A',
          navyLight: '#14253D',
          royalBlue: '#144B8C',
          teal: '#17B6C4',
          orange: '#FFBC00',
          green: '#2BA745',
          gray: '#6C757D',
        }
      },
      fontFamily: {
        sans: ['Geist-Regular'],
        regular: ['Geist-Regular'],
        medium: ['Geist-Medium'],
        semibold: ['Geist-SemiBold'],
        bold: ['Geist-Bold'],
        extrabold: ['Geist-Bold'],
        black: ['Geist-Bold'],
      }
    },
  },
  plugins: [],
}
