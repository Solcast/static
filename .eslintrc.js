module.exports = {
  env: {
    browser: true,
  },
  extends: ['airbnb'],
  rules: {
    'max-len': ['error', { code: 400 }],
    quotes: ['off'],
    'no-useless-return': ['off'],
    'prefer-destructuring': ['off'],
    'dot-notation': ['off'],
  },
};
