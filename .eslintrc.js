module.exports = {
  env: {
    browser: true,
  },
  extends: ['airbnb'],
  rules: {
    'max-len': ['error', { code: 400 }],
  },
};
