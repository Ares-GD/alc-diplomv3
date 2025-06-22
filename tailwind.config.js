/**
 * tailwind.config.js
 */
module.exports = {
  theme: {
    extend: {
      colors: {
        accent: 'C09D6A',
        dark: 'var(--color-dark)',
        error: 'var(--color-error)',
        customGray: 'var(--color-gray)',
        white: 'var(--color-white)',
        black: 'var(--color-black)'
      },
      backgroundColor: {
        accent: 'C09D6A',
        dark: 'var(--color-dark)',
        error: 'var(--color-error)',
        gray: 'var(--color-gray)'
      },
      textColor: {
        accent: 'C09D6A',
        dark: 'var(--color-dark)',
        error: 'var(--color-error)',
        gray: 'var(--color-gray)'
      }
    }
  },
  variants: {
    extend: {
      backgroundColor: ['hover', 'focus'],
      textColor: ['hover', 'focus']
    }
  }
}