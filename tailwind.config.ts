import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary': '#0a1128',
        'secondary': '#00d4ff',
        'tertiary': '#12c2e9',
        'on-primary': '#ffffff',
        'background': '#020617',
        'surface': '#0f172a',
        'surface-variant': '#1e293b',
        'outline': '#334155',
        'outline-variant': '#1e293b',
        'on-background': '#f1f5f9',
        'on-surface': '#f1f5f9',
        'on-surface-variant': '#94a3b8',
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.5rem',
        xl: '1rem',
        full: '9999px',
      },
      spacing: {
        xl: '48px',
        xxl: '80px',
        unit: '4px',
        sm: '8px',
        md: '16px',
        gutter: '24px',
        lg: '24px',
        margin: '32px',
        xs: '4px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'h2': ['24px', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        'body-md': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'label-sm': ['12px', { lineHeight: '1.2', letterSpacing: '0.05em', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'display': ['56px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
        'h1': ['36px', { lineHeight: '1.2', letterSpacing: '-0.015em', fontWeight: '700' }],
        'label-md': ['14px', { lineHeight: '1.4', letterSpacing: '0.01em', fontWeight: '500' }],
        'h3': ['20px', { lineHeight: '1.4', letterSpacing: '-0.01em', fontWeight: '600' }],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 8s infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { opacity: '0.3' },
          '100%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
}

export default config
