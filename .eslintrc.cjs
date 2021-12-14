const tsRules = {
  // TypeScript would check it on its own
  'no-unused-vars': 'off',
  '@typescript-eslint/no-unused-vars': 'off',
};

module.exports = {
  root: true,
  ignorePatterns: ['node_modules/', 'lib/', '*.d.ts'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  extends: ['eslint:recommended', 'prettier'],
  overrides: [
    {
      files: ['*.js', '*.cjs', '*.mjs'],
      env: {
        node: true,
      },
    },
    {
      files: ['*.ts'],
      parser: '@typescript-eslint/parser',
      extends: [
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'prettier',
      ],
      parserOptions: {
        project: './tsconfig.json',
      },
      env: {
        node: true,
      },
      rules: tsRules,
    },
    {
      files: ['*.spec.ts', '*.test.ts', '*.try.ts'],
      extends: [
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:jest/recommended',
        'plugin:jest/style',
        'prettier',
      ],
      parserOptions: {
        project: './tsconfig.spec.json',
      },
      rules: tsRules,
    },
  ],
};
