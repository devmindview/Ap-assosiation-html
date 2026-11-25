/* Tailwind (CDN) theme – loaded after cdn.tailwindcss.com on every page */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#0a1020', 800: '#111a2e', 700: '#1a2540' },
        accent: { DEFAULT: '#2dd4bf', dark: '#0f766e', light: '#5eead4' },
        mist: '#eef1f5',
        wa: { DEFAULT: '#1fa855', dark: '#188a46' }
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', '"Noto Sans Malayalam"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['Archivo', '"Noto Sans Malayalam"', 'system-ui', 'sans-serif']
      },
      keyframes: {
        pingsoft: { '0%': { transform: 'scale(1)', opacity: '.45' }, '100%': { transform: 'scale(1.6)', opacity: '0' } }
      },
      animation: {
        pingsoft: 'pingsoft 2.4s cubic-bezier(0,0,.2,1) infinite'
      }
    }
  }
};
