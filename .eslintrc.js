module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2017,
  },
  extends: 'eslint:recommended',
  rules: {
    'prefer-const': 'error',
    'no-var': 'error',
    indent: ['error', 2],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'never'],
    indent: 'off',
  },
}
