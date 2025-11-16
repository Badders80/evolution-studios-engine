import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
        mono: ["var(--font-mono)", ...defaultTheme.fontFamily.mono],
      },
      fontSize: {
        'h1': ['3.25rem', { lineHeight: '1.1', letterSpacing: '0.02%', fontWeight: '300' }],
        'h2': ['2rem', { lineHeight: '1.3', letterSpacing: '0.01%', fontWeight: '400' }],
        'h3': ['1.5rem', { lineHeight: '1.5', letterSpacing: '0.01%', fontWeight: '600' }],
        'body': ['1rem', { lineHeight: '1.7', letterSpacing: '0', fontWeight: '400' }],
        'label': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.25em', fontWeight: '500' }],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "20px",
      },
      colors: {
        brand: {
          gold: 'var(--brand-gold)',
          gray: 'var(--brand-gray)',
          white: 'var(--brand-white)',
          black: 'var(--brand-black)',
        },
        primary: {
          DEFAULT: 'var(--color-primary)',
          foreground: 'var(--color-primary-foreground)',
        },
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        foreground: 'var(--color-foreground)',
        muted: {
          DEFAULT: 'var(--color-muted)',
          foreground: 'var(--color-muted-foreground)',
        },
        border: 'var(--color-border)',
      },
    },
  },
  plugins: [],
} satisfies Config;
