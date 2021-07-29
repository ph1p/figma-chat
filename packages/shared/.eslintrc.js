const base = require ('../../.eslintrc.base.js');

module.exports = {
  ...base,
  env: {
    browser: true,
    es6: true,
  },
  extends: ['prettier'],
  parser: '@typescript-eslint/parser',
};
