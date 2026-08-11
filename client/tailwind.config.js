/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef7ff',
          100: '#d9edff',
          200: '#bce0ff',
          300: '#8ecdff',
          400: '#59b0ff',
          500: '#338dff',
          600: '#1d6bf5',
          700: '#1554e1',
          800: '#1845b6',
          900: '#1a3e8f',
        },
        accent: {
          50: '#f1fcf4',
          100: '#ddf8e5',
          200: '#bdefcf',
          300: '#8fe1ad',
          400: '#5bcb82',
          500: '#35b061',
          600: '#26904d',
          700: '#217240',
          800: '#1f5b37',
          900: '#1b4b2f',
        },
      },
      fontFamily: {
        sans: ['Tajawal', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 12px rgba(16, 42, 94, 0.08)',
        'card-hover': '0 8px 24px rgba(16, 42, 94, 0.14)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.4s ease-out',
        slideIn: 'slideIn 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
