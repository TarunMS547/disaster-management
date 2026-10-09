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
          bg: '#070a11',
          surface: '#0d131f',
          card: '#121b2b',
          border: '#1e293b',
          hover: '#19253d',
          accent: '#00e5ff',
          accentMuted: 'rgba(0, 229, 255, 0.15)',
          blue: '#38bdf8',
          amber: '#fbbf24',
          critical: '#f43f5e',
          success: '#10b981',
          muted: '#64748b',
          text: '#f1f5f9',
          subtext: '#94a3b8'
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -3px rgba(0, 229, 255, 0.25)',
        'glow-red': '0 0 20px -3px rgba(244, 63, 94, 0.3)',
        'glow-amber': '0 0 20px -3px rgba(251, 191, 36, 0.3)',
        'glow-green': '0 0 20px -3px rgba(16, 185, 129, 0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}
