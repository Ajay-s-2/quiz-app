/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        accent: '#ec4899',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        ink: '#0f172a',
        mist: '#e2e8f0',
      },
      boxShadow: {
        soft: '0 18px 45px -18px rgba(15, 23, 42, 0.35)',
        glow: '0 18px 45px -12px rgba(99, 102, 241, 0.35)',
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
