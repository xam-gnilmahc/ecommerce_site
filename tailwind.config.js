/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        bg: '#ffffff',
        surface: '#ffffff',
        'surface-tint': '#fafafb',
        text: '#0f1115',
        'text-secondary': '#3f4550',
        muted: '#878d99',
        primary: '#2563eb',
        'primary-600': '#1d4ed8',
        'primary-soft': '#eff4ff',
        accent: '#00b894',
        danger: '#dc2626',
        success: '#16a34a',
        warning: '#f59e0b',
        border: '#e6e8ee',
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Helvetica Neue"',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      maxWidth: {
        container: '1200px',
      },
      fontSize: {
        xs: '12px',
        sm: '14px',
        md: '16px',
        lg: '18px',
        xl: '22px',
        '2xl': '28px',
      },
      spacing: {
        sm: '8px',
        md: '16px',
        lg: '24px',
      },
    },
  },
  plugins: [],
};
