const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  ...compat.extends('eslint-config-expo'),
  {
    rules: {
      'import/no-unresolved': 'off',
      'import/extensions': 'off',
      'react-hooks/refs': 'off',
    },
  },
];
