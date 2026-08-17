/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0B0F19',
          800: '#111827',
          700: '#1F2937',
          600: '#374151'
        },
        priority: {
          low: '#10B981',      // 🟢 Green
          moderate: '#F59E0B', // 🟡 Yellow
          high: '#F97316',     // 🟠 Orange
          critical: '#EF4444'  // 🔴 Red
        }
      }
    },
  },
  plugins: [],
}
