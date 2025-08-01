/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cosmic: {
          black: '#000000',
          darkpurple: '#1a0033',
          nightblue: '#0f1419',
          glass: 'rgba(255, 255, 255, 0.1)',
          glassborder: 'rgba(255, 255, 255, 0.2)',
        },
        neon: {
          pink: '#FF006E',
          cyan: '#00F5FF',
          pinkglow: 'rgba(255, 0, 110, 0.5)',
          cyanglow: 'rgba(0, 245, 255, 0.5)',
        },
        text: {
          white: '#ffffff',
          gray: 'rgba(255, 255, 255, 0.8)',
          muted: 'rgba(255, 255, 255, 0.6)',
        },
      },
      backgroundImage: {
        'cosmic-gradient': 'linear-gradient(135deg, #000000 0%, #1a0033 50%, #0f1419 100%)',
        'cosmic-radial': 'radial-gradient(circle at 50% 50%, rgba(255, 0, 110, 0.3) 0%, transparent 50%)',
        'glow-pink': 'radial-gradient(circle, rgba(255, 0, 110, 0.4) 0%, transparent 70%)',
        'glow-cyan': 'radial-gradient(circle, rgba(0, 245, 255, 0.4) 0%, transparent 70%)',
      },
      boxShadow: {
        'neon-pink': '0 0 20px rgba(255, 0, 110, 0.5)',
        'neon-cyan': '0 0 20px rgba(0, 245, 255, 0.5)',
        'glass': '0 8px 32px rgba(31, 38, 135, 0.37)',
      },
      backdropBlur: {
        'glass': '10px',
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'pulse-neon': {
          '0%': { boxShadow: '0 0 20px rgba(255, 0, 110, 0.5)' },
          '100%': { boxShadow: '0 0 30px rgba(255, 0, 110, 0.8), 0 0 40px rgba(0, 245, 255, 0.3)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow': {
          '0%': { textShadow: '0 0 10px rgba(255, 255, 255, 0.8)' },
          '100%': { textShadow: '0 0 20px rgba(255, 255, 255, 1), 0 0 30px rgba(0, 245, 255, 0.5)' },
        },
      },
    },
  },
  plugins: [],
}