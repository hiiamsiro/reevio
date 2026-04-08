import tsEslintPlugin from '@typescript-eslint/eslint-plugin';
import tsEslintParser from '@typescript-eslint/parser';

const TYPESCRIPT_FILES = ['apps/**/*.ts', 'apps/**/*.tsx', 'packages/**/*.ts'];

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/coverage/**',
      '**/*.d.ts',
      '.codex/**',
    ],
  },
  {
    files: TYPESCRIPT_FILES,
    languageOptions: {
      parser: tsEslintParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': tsEslintPlugin,
    },
    rules: {
      'no-console': 'off',
      'no-debugger': 'error',
    },
  },
];
