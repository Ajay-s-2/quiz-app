/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        'primary-dark': '#1d4ed8',
        secondary: '#0f766e',
        accent: '#7c3aed',
        success: '#059669',
        danger: '#dc2626',
        warning: '#d97706',
        ink: '#0f172a',
        mist: '#f1f5f9',
      },
      boxShadow: {
        soft: '0 18px 45px -28px rgba(15, 23, 42, 0.35)',
        glow: '0 16px 30px -18px rgba(37, 99, 235, 0.45)',
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-in',
        slideDown: 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
