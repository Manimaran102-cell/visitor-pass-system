/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0B1220',
          900: '#111A2E',
          800: '#1B2740',
          700: '#28375A',
          600: '#374A73',
        },
        brass: {
          400: '#D9A441',
          500: '#C6902E',
          600: '#A9761F',
        },
        mist: {
          50: '#F6F7F9',
          100: '#EEF1F5',
          200: '#DFE4EC',
        },
        signal: {
          green: '#2E8B57',
          amber: '#C6902E',
          red: '#C0392B',
          blue: '#2C6E9E',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(11,18,32,0.06), 0 8px 24px -12px rgba(11,18,32,0.18)',
      },
      borderRadius: {
        xl2: '14px',
      },
    },
  },
  plugins: [],
};
