/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Deep slate/navy backgrounds
        slate: {
          900: '#0f1623',
          800: '#182030',
          700: '#1f2d44',
          600: '#2a3d58',
        },
        // Warm gold accent — primary action color
        gold: {
          DEFAULT: '#d4a853',
          light: '#e4be7a',
          dark: '#b8883a',
        },
        // Sage green — on-track / positive state
        sage: {
          DEFAULT: '#7aab8a',
          light: '#9ec4ac',
          dark: '#5a8c6a',
        },
        // Muted coral — gentle warning (never alarm-red)
        coral: {
          DEFAULT: '#c4806a',
          light: '#d9a090',
          dark: '#a6604a',
        },
        // Warm off-white text
        cream: {
          DEFAULT: '#f0e8da',
          muted: '#c8bcac',
          faint: '#8a7e70',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}
