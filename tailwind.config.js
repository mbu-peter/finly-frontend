/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090b',
        primary: {
          DEFAULT: '#ffffff',
          foreground: '#09090b',
        },
        secondary: {
          DEFAULT: '#27272a',
          foreground: '#fafafa',
        },
        accent: {
          DEFAULT: '#3b82f6',
          foreground: '#ffffff',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
