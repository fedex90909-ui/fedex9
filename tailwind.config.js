/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cloud: '#F6F5FA',
        ink: '#17131F',
        'fx-purple': {
          50: '#F5F1FB',
          100: '#EDE6F8',
          200: '#D9C9F0',
          300: '#B79BE3',
          400: '#8F5FD0',
          500: '#6A30B8',
          600: '#4D148C',
          700: '#3F1072',
          800: '#2E0B57',
          900: '#1F0740',
          DEFAULT: '#4D148C',
        },
        'fx-orange': {
          50: '#FFF3EB',
          100: '#FFE3D1',
          200: '#FFC39E',
          300: '#FF9E63',
          400: '#FF8536',
          500: '#FF6600',
          600: '#EF5D00',
          700: '#C24E00',
          800: '#9A3D00',
          DEFAULT: '#FF6600',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 1px 2px rgba(23,19,31,.05), 0 10px 30px -12px rgba(76,29,149,.14)',
        lift: '0 4px 10px rgba(23,19,31,.06), 0 24px 48px -16px rgba(76,29,149,.25)',
        'btn-orange': '0 8px 20px -8px rgba(255,102,0,.55)',
        'btn-purple': '0 8px 20px -8px rgba(77,20,140,.55)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(18px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(24px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'page-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-9px)' },
        },
        dash: {
          to: { 'stroke-dashoffset': '-48' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(.6)', opacity: '.7' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        shimmer: {
          to: { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up .7s cubic-bezier(.22,.61,.36,1) both',
        'fade-in': 'fade-in .5s ease both',
        'scale-in': 'scale-in .3s cubic-bezier(.22,.61,.36,1) both',
        'slide-in-right': 'slide-in-right .35s cubic-bezier(.22,.61,.36,1) both',
        'page-in': 'page-in .45s cubic-bezier(.22,.61,.36,1) both',
        float: 'float 5s ease-in-out infinite',
        'float-slow': 'float 7s ease-in-out infinite',
        dash: 'dash 1.6s linear infinite',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
}
