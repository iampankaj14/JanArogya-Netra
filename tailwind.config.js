/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./features/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  safelist: [
    'bg-emerald-50', 'bg-emerald-100', 'bg-emerald-500', 'text-emerald-500', 'text-emerald-600', 'border-emerald-100', 'border-emerald-200', 'border-emerald-500',
    'bg-amber-50', 'bg-amber-100', 'bg-amber-500', 'text-amber-500', 'text-amber-600', 'border-amber-100', 'border-amber-200', 'border-amber-500',
    'bg-red-50', 'bg-red-100', 'bg-red-500', 'text-red-500', 'text-red-600', 'border-red-100', 'border-red-200', 'border-red-500',
    'bg-blue-50', 'bg-blue-100', 'bg-blue-500', 'text-blue-500', 'text-blue-600', 'border-blue-100', 'border-blue-200', 'border-blue-500',
    'bg-purple-50', 'bg-purple-100', 'bg-purple-500', 'text-purple-500', 'text-purple-600', 'border-purple-100', 'border-purple-200', 'border-purple-500',
    'bg-orange-50', 'bg-orange-100', 'bg-orange-500', 'text-orange-500', 'text-orange-600', 'border-orange-100', 'border-orange-200', 'border-orange-500',
  ],
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
