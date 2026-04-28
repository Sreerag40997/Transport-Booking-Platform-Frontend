/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        headline: ['var(--font-noto-serif)', 'serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        label: ['var(--font-inter)', 'sans-serif'],
      },
      colors: {
        "primary": "#04152b",
        "outline-variant": "#c4c6cd",
        "outline": "#75777d",
        "on-secondary-container": "#785a1a",
        "tertiary-container": "#232a32",
        "surface-tint": "#505f78",
        "on-surface-variant": "#44474d",
        "secondary-fixed-dim": "#e9c176",
        "primary-container": "#1a2a40",
        "surface-bright": "#f9f9f9",
        "secondary-container": "#fed488",
        "tertiary": "#0f161d",
        "on-secondary": "#ffffff",
        "secondary-fixed": "#ffdea5",
        "inverse-primary": "#b7c7e4",
        "tertiary-fixed": "#dce3ee",
        "primary-fixed": "#d4e3ff",
        "on-secondary-fixed-variant": "#5d4201",
        "surface": "#f9f9f9",
        "on-tertiary": "#ffffff",
        "surface-variant": "#e2e2e2",
        "surface-container": "#eeeeee",
        "tertiary-fixed-dim": "#c0c7d2",
        "surface-container-low": "#f3f3f3",
        "on-primary": "#ffffff",
        "background": "#f9f9f9",
        "surface-dim": "#dadada",
        "inverse-surface": "#2f3131",
        "error-container": "#ffdad6",
        "surface-container-high": "#e8e8e8",
        "error": "#ba1a1a",
        "on-tertiary-container": "#8a919b",
        "on-background": "#1a1c1c",
        "primary-fixed-dim": "#b7c7e4",
        "on-primary-fixed": "#0b1c31",
        "surface-container-lowest": "#ffffff",
        "on-surface": "#1a1c1c",
        "on-primary-fixed-variant": "#38485f",
        "on-error-container": "#93000a",
        "on-secondary-fixed": "#261900",
        "inverse-on-surface": "#f1f1f1",
        "surface-container-highest": "#e2e2e2",
        "on-tertiary-fixed": "#151c24",
        "on-primary-container": "#8191ac",
        "secondary": "#775a19",
        "on-error": "#ffffff",
        "on-tertiary-fixed-variant": "#404750"
      },
      boxShadow: {
        'editorial': '0 20px 50px -12px rgba(26, 28, 28, 0.08)',
        'editorial-sm': '0 12px 40px 0 rgba(26, 28, 28, 0.04)',
      },
      animation: {
        'pulse-slow': 'pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'subtle-pulse': 'subtle-pulse 2s ease-in-out infinite',
        'radar': 'radar-pulse 3s infinite ease-out',
        'blink': 'blink 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 },
        },
        'subtle-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
        'radar-pulse': {
          '0%': { width: '40px', height: '40px', opacity: 1 },
          '100%': { width: '120px', height: '120px', opacity: 0 },
        },
        'blink': {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.4, transform: 'scale(0.85)' },
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
};