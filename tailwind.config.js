/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        aurora: {
          bg: '#050714',
          surface: 'rgba(15, 23, 42, 0.65)',
          border: 'rgba(255, 255, 255, 0.12)',
          emerald: '#10b981',
          cyan: '#06b6d4',
          sky: '#38bdf8',
          violet: '#8b5cf6',
          indigo: '#6366f1',
          rose: '#f43f5e'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'aurora-slow': 'aurora 20s ease infinite alternate',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        aurora: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-hover': '0 12px 40px 0 rgba(16, 185, 129, 0.25)',
        'neon-cyan': '0 0 25px rgba(6, 182, 212, 0.4)',
        'neon-emerald': '0 0 25px rgba(16, 185, 129, 0.4)',
        'neon-violet': '0 0 25px rgba(139, 92, 246, 0.4)',
      },
      backdropBlur: {
        'xs': '2px',
        '2xl': '24px',
        '3xl': '40px',
      }
    },
  },
  plugins: [],
}
