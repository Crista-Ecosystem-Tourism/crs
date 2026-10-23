import js from '@eslint/js'
import globals from 'globals'
import tseslint from '@typescript-eslint/eslint-plugin'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist', 'coverage', 'playwright-report', 'test-results', '.agents'] },
  js.configs.recommended,
  ...tseslint.configs['flat/recommended'],
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // A context hook and shadcn-style variants live next to their component by convention.
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true, allowExportNames: ['useApp', 'buttonVariants'] }],
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
    },
  },
  {
    files: ['*.config.{js,ts}', 'e2e/**/*.ts', 'e2e-live/**/*.ts', 'playwright*.ts'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
]
