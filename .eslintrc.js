module.exports = {
  extends: [
    require.resolve('@umijs/fabric/dist/eslint'),
    // 'plugin:prettier/recommended',
  ],
  rules: {
    'import/no-extraneous-dependencies': 0,
    'import/no-unresolved': 0,
    'consistent-return': 0,
    'no-underscore-dangle': 0,
    'prefer-const': 0,
    'no-return-assign': 0,
    '@typescript-eslint/consistent-type-imports': 'off',
    '@typescript-eslint/consistent-type-definitions': 'off',
  },
};
