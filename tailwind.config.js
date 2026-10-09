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
          muted: '#64748b',
          text: '#0f172a',
          subtext: '#475569'
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
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
