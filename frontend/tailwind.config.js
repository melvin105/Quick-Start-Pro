/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    darkMode: 'class',
    theme: {
      extend: {
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
        },
        colors: {
          brand: {
            50:  '#EBF0FA',
            100: '#C9D6F0',
            200: '#A6BCE6',
            300: '#83A2DC',
            400: '#4D78C8',
            500: '#2D5282',
            600: '#1B3A6B',  // primary
            700: '#12294F',  // dark
            800: '#0D1E3A',
            900: '#081325',
          },
          gray: {
            50:  '#F8F9FA',
            100: '#F1F3F5',
            200: '#E9ECEF',
            300: '#DEE2E6',
            400: '#CED4DA',
            500: '#ADB5BD',
            600: '#6C757D',
            700: '#495057',
            800: '#343A40',
            900: '#212529',
          },
          success: {
            DEFAULT: '#27AE60',
            bg: '#E8F8EE',
          },
          warning: {
            DEFAULT: '#F39C12',
            bg: '#FEF9EC',
          },
          danger: {
            DEFAULT: '#E74C3C',
            bg: '#FDEDEC',
          },
        },
        borderRadius: {
          DEFAULT: '8px',
        },
        boxShadow: {
          card: '0 12px 32px -8px rgba(16,24,40,0.18)',
          modal: '0 20px 60px -10px rgba(16,24,40,0.18)',
        },
      },
    },
    plugins: [],
  }