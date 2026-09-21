/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        bg: 'var(--bg-main)',
        ink: 'var(--text-main)',
        secondary: 'var(--text-secondary)',
        border: 'var(--border-main)',
        card: 'var(--bg-card)',
        accent: {
          DEFAULT: '#443CFF',
          hover: '#332BDB',
        },
        lime: '#B4FF2E',
      },
      fontSize: {
        'display': ['clamp(2.5rem, 8vw, 6.5rem)', { lineHeight: '0.95', letterSpacing: '-0.03em', fontWeight: '800' }],
        'heading': ['clamp(1.75rem, 5vw, 3.5rem)', { lineHeight: '1.05', letterSpacing: '-0.025em', fontWeight: '800' }],
      },
      animation: {
        'ticker': 'ticker 35s linear infinite',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
