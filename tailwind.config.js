module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      spacing: {
        "22rem": "22rem",
        "23rem": "23.5rem"
      },
      maxWidth: {
        '1/4': '25%',
        '1/2': '50%',
        '3/4': '75%',
      },
      colors: {
        'primary': '#CE5A27',
        'red-dark': '#7F2421',
        'dark-blue': '#FFB621',
        'lightBlue-500': '#0EA5E9'
      },
      fontSize: {
        'xt': '0.5rem'
      },
      screens: {
        'desktop-min': {
          'max': '1024px'
        },
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}