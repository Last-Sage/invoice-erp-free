// eslint.config.mjs (flat config)
import next from 'eslint-config-next'
import tseslint from 'typescript-eslint'
import js from '@eslint/js'
import globals from 'globals'

export default [
  // Ignore build artifacts
  {
    ignores: ['.next/**', 'node_modules/**', 'dist/**', 'build/**'],
  },

  // Base JS recommended
  js.configs.recommended,

  // Next.js Core Web Vitals rules
  ...next(),

  // TypeScript recommended (no type-checking, faster and simpler)
  ...tseslint.configs.recommended,

  // Project-wide rule overrides
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // Relax strict rules so builds don't fail
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-unused-expressions': 'warn',

      // Next image rule is noisy if you're intentionally using <img>
      '@next/next/no-img-element': 'off',
    },
  },
]