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
          DEFAULT: '#176B53', // Brand Green
          hover: '#135944',
          deep: '#124A3B',   // Deep Forest
          light: '#EAF3EE',  // Soft Green
          pale: '#F2F7F4',   // Light interactive hover
        },
        navy: {
          DEFAULT: '#172B3A', // Dark Navy
          deep: '#102431',    // Navy Deep (Dark utility & footer)
          hover: '#11212D',
          light: '#233F54',
          900: '#0E1C27',
        },
        canvas: '#F5F7F5',    // Soft neutral canvas
        surface: {
          DEFAULT: '#FFFFFF',
          soft: '#EAF3EE',
          pale: '#F2F7F4',
        },
        ink: {
          primary: '#26352E',   // High-contrast primary text (WCAG AAA)
          secondary: '#526359', // Supporting info (WCAG AA ≥ 4.5:1)
          muted: '#65736B',     // Less prominent text
        },
        border: {
          DEFAULT: '#DDE4DF',
          subtle: '#E5ECE7',
          strong: '#C2CDC6',
        },
        statutory: {
          success: '#176B53',
          warning: '#945607',
          danger: '#B42318',
          info: '#172B3A',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'Noto Sans Bengali', 'system-ui', '-apple-system', 'sans-serif'],
        bengali: ['Noto Sans Bengali', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'sm': '4px',
        'DEFAULT': '6px',
        'md': '6px',
        'lg': '8px',
        'xl': '12px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(23, 43, 58, 0.04)',
        'DEFAULT': '0 1px 3px 0 rgba(23, 43, 58, 0.06), 0 1px 2px -1px rgba(23, 43, 58, 0.04)',
        'md': '0 4px 12px -2px rgba(23, 43, 58, 0.08)',
        'dropdown': '0 12px 24px -4px rgba(23, 43, 58, 0.12)',
        'elevation': '0 4px 16px -2px rgba(18, 74, 59, 0.15)',
      },
      transitionDuration: {
        'fast': '160ms',
        'standard': '200ms',
        'emphasis': '280ms',
      },
      transitionTimingFunction: {
        'standard': 'cubic-bezier(0.2, 0, 0, 1)',
        'enter': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
