/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-bg-solid)',
        surface: 'var(--color-surface)',
        'surface-light': 'var(--color-surface-raised)',
        'surface-hover': 'var(--color-surface-hover)',
        border: 'var(--color-border)',
        'border-light': 'var(--color-border-strong)',
        // Бренд-цвета одинаковы в обеих темах, поэтому заданы литералами:
        // Tailwind не умеет применять модификатор прозрачности (bg-x/70)
        // к цвету, объявленному через var() с готовым hex, и молча его теряет.
        primary: {
          DEFAULT: '#3BA8B8',
          hover: '#5BC4F7',
          active: '#1A8A9C',
        },
        text: 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted': 'var(--color-text-muted)',
        accent: {
          DEFAULT: '#6B5BFF',
          soft: '#8B7CFF',
        },
        warning: 'var(--color-warning)',
        error: 'var(--color-danger)',
        success: 'var(--color-success)',
        teal: {
          300: '#7ED3E0',
          400: '#5BC4F7',
          500: '#3BA8B8',
          600: '#1A8A9C',
          700: '#146B7A',
        },
        ink: {
          850: '#1B1F27',
          900: '#14171D',
          950: '#0E1015',
        },
        // Поверхности поверх стекла. Меняются по теме: белый тинт на светлом фоне
        // невидим, поэтому там тонируем чернилами.
        header: 'var(--header-bg)',
        link: 'var(--color-link)',
        panel: {
          DEFAULT: 'var(--panel-1)',
          2: 'var(--panel-2)',
          3: 'var(--panel-3)',
        },
        hairline: {
          DEFAULT: 'var(--hairline-1)',
          2: 'var(--hairline-2)',
          3: 'var(--hairline-3)',
        },
        violet: {
          600: '#2E2650',
          700: '#241D3D',
          800: '#1C1730',
        },
      },
      fontFamily: {
        sans: ['Golos Text', 'Golos UI', '-apple-system', 'system-ui', 'sans-serif'],
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        accent: ['Old Standard TT', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        glass: 'var(--glass-shadow)',
        glow: 'var(--glow-ring)',
      },
      backdropBlur: {
        glass: 'var(--glass-blur)',
        'glass-reduced': 'var(--glass-blur-reduced)',
      },
      transitionTimingFunction: {
        standard: 'var(--ease-standard)',
        out: 'var(--ease-out)',
        bounce: 'var(--ease-bounce)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
        slow: '250ms',
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'typing': 'typing 1.5s ease-in-out infinite',
        'fog-pulse': 'fog-pulse 2400ms ease-in-out infinite',
        'bounce-in': 'bounce-in 500ms var(--ease-bounce)',
      },
      keyframes: {
        typing: {
          '0%, 100%': { opacity: 0.3 },
          '50%': { opacity: 1 },
        },
        'fog-pulse': {
          '0%, 100%': { opacity: 0.55 },
          '50%': { opacity: 0.85 },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0.85)', opacity: 0 },
          '60%': { transform: 'scale(1.04)' },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
      },
    },
  },
  plugins: [],
}
