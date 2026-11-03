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
        primary: {
          DEFAULT: '#176B53', // Institutional Green
          hover: '#135944',
          light: '#EAF3F0',
          dark: '#0E4434',
        },
        navy: {
          DEFAULT: '#172B3A', // Dark Navy
          hover: '#11212D',
          light: '#233F54',
          900: '#0E1C27',
        },
        canvas: '#F4F6F5',
        surface: '#FFFFFF',
        ink: {
          primary: '#26352E',
          secondary: '#64716A',
          muted: '#8A9790',
        },
        stroke: {
          DEFAULT: '#D9E0DC',
          subtle: '#E8ECE9',
        },
        civic: {
          50: '#EAF3F0',
          100: '#D5E7E1',
          200: '#ABCFC3',
          500: '#176B53',
          600: '#135944',
          700: '#0E4434',
        },
        statutory: {
          success: '#176B53',
          warning: '#A96C16',
          danger: '#B42318',
          info: '#1A618F',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Noto Sans Bengali', 'system-ui', '-apple-system', 'sans-serif'],
        bengali: ['Noto Sans Bengali', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'sm': '4px',
        'DEFAULT': '6px',
        'md': '6px',
        'lg': '8px',
        'xl': '10px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(23, 43, 58, 0.04)',
        'DEFAULT': '0 1px 3px 0 rgba(23, 43, 58, 0.06), 0 1px 2px -1px rgba(23, 43, 58, 0.04)',
        'md': '0 4px 6px -1px rgba(23, 43, 58, 0.06), 0 2px 4px -2px rgba(23, 43, 58, 0.04)',
        'dropdown': '0 10px 15px -3px rgba(23, 43, 58, 0.08), 0 4px 6px -4px rgba(23, 43, 58, 0.04)',
      },
    },
  },
  plugins: [],
}
