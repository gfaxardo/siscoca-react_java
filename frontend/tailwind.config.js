/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e3f2fd',
          100: '#bbdefb',
          200: '#90caf9',
          300: '#64b5f6',
          400: '#42a5f5',
          500: '#2196f3',
          600: '#1e88e5',
          700: '#1976d2',
          800: '#1565c0',
          900: '#0d47a1',
        },
        success: {
          500: '#34a853',
          600: '#2d8e47',
        },
        warning: {
          500: '#ff9800',
          600: '#f57c00',
        },
        danger: {
          500: '#ea4335',
          600: '#d32f2f',
        }
      }
    },
  },
  plugins: [],
}


