module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ds: {
          bg:          '#0a0a0f',
          surface:     '#111118',
          card:        '#16161f',
          border:      '#252535',
          accent:      '#6c63ff',
          accentHover: '#7c74ff',
          pink:        '#e94560',
          cyan:        '#00d4ff',
          green:       '#00e676',
          amber:       '#ffb300',
          red:         '#ff5252',
          text:        '#e2e2f0',
          muted:       '#8888a4',
          faint:       '#3a3a55',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-up':   'slideUp 0.5s ease-out',
        'shimmer':    'shimmer 2s linear infinite',
        'glow':       'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        glow:    { from: { boxShadow: '0 0 10px #6c63ff33' }, to: { boxShadow: '0 0 24px #6c63ff66' } },
      },
      boxShadow: {
        card:     '0 4px 24px rgba(0,0,0,0.4)',
        accent:   '0 0 30px rgba(108,99,255,0.3)',
        'glow-sm': '0 0 12px rgba(108,99,255,0.4)',
      },
    },
  },
  plugins: [],
};