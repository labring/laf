module.exports = {
  extends: ['react-app', 'plugin:prettier/recommended'],
  ignorePatterns: ['dist', 'public'],
  rules: {
    'no-alert': 'error',
    'react/no-children-prop': 0,
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    '@next/next/no-img-element': 0,
    'no-unused-vars': 'error',
    'no-console': 'warn',
    'prettier/prettier': [
      'error',
      {
        printWidth: 100,
        tabWidth: 2,
        trailingComma: 'all',
        semi: true,
        plugins: [require('prettier-plugin-tailwindcss')],
      },
    ],
  },
  plugins: ['simple-import-sort'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'simple-import-sort/imports': [
          'error',
          {
            groups: [
              // Packages `react` related packages come first.
              ['^react', '^@?\\w'],
              ['^(@chakra-ui)/(/.*|$/)'],
              // Internal packages.
              [
                '^(@/components|@/constants|@/utils|/@/services|/@/pages)(/.*|$)',
              ],
              // Side effect imports.
              ['^\\u0000'],
              // Parent imports. Put `..` last.
              ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
              // Other relative imports. Put same-folder imports and `.` last.
              ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
              ['^(./store)(/.*|$)'],
              // Style imports.
              ['^.+\\.?(css|scss)$'],
            ],
          },
        ],
      },
    },
  ],
}
