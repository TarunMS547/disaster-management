/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ares: {
          bg: '#f8fafc',
          surface: '#ffffff',
          card: '#f1f5f9',
          border: '#e2e8f0',
          hover: '#e2e8f0',
          accent: '#0284c7',
          accentMuted: 'rgba(2, 132, 199, 0.12)',
          blue: '#0284c7',
          amber: '#d97706',
          critical: '#e11d48',
          success: '#059669',
          muted: '#1f2937',
          text: '#000000',
          subtext: '#111827'
        }
      },
      fontSize: {
        '2xs': ['0.75rem', { lineHeight: '1.05rem' }],
        'xs': ['0.825rem', { lineHeight: '1.25rem' }],
        'sm': ['0.95rem', { lineHeight: '1.4rem' }],
        'base': ['1.075rem', { lineHeight: '1.65rem' }],
        'lg': ['1.22rem', { lineHeight: '1.75rem' }],
        'xl': ['1.38rem', { lineHeight: '1.875rem' }],
        '2xl': ['1.68rem', { lineHeight: '2.15rem' }],
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['DM Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 4px 14px 0 rgba(2, 132, 199, 0.25)',
        'glow-red': '0 4px 14px 0 rgba(225, 29, 72, 0.25)',
        'glow-amber': '0 4px 14px 0 rgba(217, 119, 6, 0.25)',
        'glow-green': '0 4px 14px 0 rgba(5, 150, 105, 0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}
