/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Reference image signature copper/terracotta atmospheric palette
        terracotta: {
          50: '#FDF6F4',
          100: '#F9ECE8',
          200: '#F3D6CE',
          300: '#EBB9AC',
          400: '#DF937F',
          500: '#CE6C53',
          600: '#B84E34',
          700: '#9A3A21',
          800: '#7B2C17',
          900: '#581C0E',
          950: '#340E06',
        },
        // Reference image glowing waveform cyan/teal
        glowTeal: {
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
        },
        // Reference image circular play button orange/copper
        glowOrange: {
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
        },
        // Warm off-white light mode base
        warm: {
          50: '#FDFCFB',
          100: '#FAF8F5',
          200: '#F4EFEA',
          300: '#EAE2D9',
          400: '#D5C7B8',
          500: '#B8A490',
        },
        // Dark surfaces
        dark: {
          bg: '#0C0C10',
          surface: '#14141B',
          card: '#1B1B26',
          cardHover: '#232332',
          border: '#272738',
          muted: '#8E8EA8',
        },
        // Dark Charcoal text palette
        charcoal: {
          50: '#F6F6F7',
          100: '#E7E7E9',
          200: '#D0D0D4',
          300: '#AFAFB6',
          400: '#858591',
          500: '#646470',
          600: '#4E4E58',
          700: '#3D3D45',
          800: '#2A2A30',
          900: '#18181C',
          950: '#0E0E11',
        },
        // Brand Primary: Soft vibrant purple & terracotta synergy
        brand: {
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D8B4FE',
          400: '#C084FC',
          500: '#A855F7',
          600: '#9333EA',
          700: '#7E22CE',
          800: '#6B21A8',
          900: '#581C87',
          950: '#3B0764',
        },
        // Brand Secondary: Soft pastel pink
        mivoPink: {
          50: '#FDF2F8',
          100: '#FCE7F3',
          200: '#FBCFE8',
          300: '#F9A8D4',
          400: '#F472B6',
          500: '#EC4899',
          600: '#DB2777',
        },
        // Highlight: Soft pastel yellow
        mivoYellow: {
          50: '#FEFCE8',
          100: '#FEF9C3',
          200: '#FEF08A',
          300: '#FDE047',
          400: '#FACC15',
          500: '#EAB308',
        },
        // Success: Soft pastel green / mint
        mivoGreen: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft-sm': '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'soft-md': '0 4px 14px rgba(0, 0, 0, 0.06), 0 2px 5px rgba(0, 0, 0, 0.03)',
        'soft-lg': '0 12px 28px -4px rgba(0, 0, 0, 0.08), 0 6px 12px -3px rgba(0, 0, 0, 0.04)',
        'soft-xl': '0 24px 38px -6px rgba(0, 0, 0, 0.12), 0 10px 16px -6px rgba(0, 0, 0, 0.05)',
        'glow-purple': '0 0 24px -4px rgba(168, 85, 247, 0.35)',
        'glow-terracotta': '0 0 30px -4px rgba(206, 108, 83, 0.45)',
        'glow-orange': '0 0 25px 0px rgba(249, 115, 22, 0.4)',
        'glow-teal': '0 0 25px 0px rgba(45, 212, 191, 0.4)',
        'glass-card': '0 20px 40px -15px rgba(0, 0, 0, 0.25), inset 0 1px 1px 0 rgba(255, 255, 255, 0.4)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.06)', opacity: '1' },
        },
        soundWave: {
          '0%, 100%': { height: '8px' },
          '50%': { height: '32px' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        floatDelay: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(8px)' },
        },
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'sound-wave': 'soundWave 1.2s ease-in-out infinite',
        'float-slow': 'floatSlow 6s ease-in-out infinite',
        'float-delay': 'floatDelay 7s ease-in-out infinite 1s',
      },
    },
  },
  plugins: [],
}
