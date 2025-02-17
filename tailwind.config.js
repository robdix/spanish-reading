/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Merriweather', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        background: '#FAF9F6',
      },
      maxWidth: {
        'prose': '680px',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '680px',
            color: '#2D3748',
          },
        },
      },
    },
  },
  plugins: [],
} 