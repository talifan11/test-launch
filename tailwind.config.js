/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        abyss: '#0a0e14',
        panel: '#0f141c',
        steel: '#1a2333',
        gold: '#ffc24b',
        blizzard: '#0e9cff',
        emerald: '#2fbf71',
        blood: '#ff5566',
      },
      borderColor: {
        edge: 'rgba(255, 255, 255, 0.08)',
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        glowGold: '0 0 24px rgba(255, 194, 75, 0.25)',
        glowBlue: '0 0 20px rgba(14, 156, 255, 0.2)',
      },
    },
  },
  plugins: [],
};
