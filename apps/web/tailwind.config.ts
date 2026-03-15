import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
        heading: ['var(--font-heading)', 'Georgia', 'serif'],
      },
      fontSize: {
        // tighter, more purposeful scale
        'display': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.04em', fontWeight: '700' }],
        'display-sm': ['3rem', { lineHeight: '1.08', letterSpacing: '-0.035em', fontWeight: '700' }],
      },
      colors: {
        bg: '#0a0908',
        surface: '#111110',
        border: 'rgba(255,255,255,0.08)',
        muted: '#858585',
      },
    },
  },
  plugins: [],
}

export default config
