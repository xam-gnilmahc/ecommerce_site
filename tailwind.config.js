/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        main: ['Inter', '-apple-system', 'BlinkMacSystemFont', "'SF Pro Display'", "'SF Pro Text'", "'Helvetica Neue'", 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        black: '#1d1d1f',
        primary: { DEFAULT: '#1d1d1f', hover: '#3a3a3c' },
        accent: '#0071e3',
        success: '#34c759',
        danger: '#ff3b30',
        warning: '#ff9f0a',
        gray: {
          50: '#f5f5f7',
          100: '#f2f2f5',
          200: '#e5e5ea',
          300: '#d1dcc0d1d5',
          400: '#a1a1a6',
          500: '#8e8e93',
          600: '#6d6d70',
          700: '#48484a',
          800: '#1d1d1f',
          900: '#1d1d1f',
        },
        apple: {
          blue: '#0071e3',
          purple: '#bf5af2',
          pink: '#ff2d55',
          green: '#34c759',
          orange: '#ff9500',
          red: '#ff3b30',
          yellow: '#ffcc00',
        },
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '20px',
      },
      fontSize: {
        xs: ['11px', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
        sm: ['13px', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
        base: ['17px', { lineHeight: '1.47059', letterSpacing: '-0.022em' }],
        md: ['19px', { lineHeight: '1.47368', letterSpacing: '-0.022em' }],
        lg: ['21px', { lineHeight: '1.38095', letterSpacing: '-0.02em' }],
        xl: ['25px', { lineHeight: '1.3', letterSpacing: '-0.02em' }],
        '2xl': ['31px', { lineHeight: '1.22581', letterSpacing: '-0.022em' }],
        '3xl': ['40px', { lineHeight: '1.15', letterSpacing: '-0.022em' }],
        '4xl': ['48px', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        '5xl': ['60px', { lineHeight: '1.08333', letterSpacing: '-0.03em' }],
      },
      maxWidth: {
        container: '1200px',
      },
      height: {
        nav: '64px',
      },
    },
  },
  plugins: [],
};
