import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        synthemesc: ['Synthemesc W00 Regular', 'Synthemesc', 'sans-serif'],
      },
      colors: {
        'spotify-black':   '#121212',
        'spotify-surface': '#181818',
        'spotify-hover':   '#282828',
        'spotify-green':   '#F97316',
        'spotify-dim':     '#535353',
      },
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-in',
      },
    },
  },
  plugins: [],
};

export default config;
