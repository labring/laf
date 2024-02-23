module.exports = {
  extends: './package.js',
  rules: {
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        trailingComma: 'all',
        semi: false,
        printWidth: 120,
        tabWidth: 2,
      },
    ],
  },
}
