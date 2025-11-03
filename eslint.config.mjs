

// import { dirname } from 'path';
// import { fileURLToPath } from 'url';
// import { FlatCompat } from '@eslint/eslintrc';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
// const compat = new FlatCompat({
//   baseDirectory: __dirname
// });
// const eslintConfig = [
//   ...compat.extends('next/core-web-vitals', 'next/typescript'),
//   {
//     languageOptions: {
//       globals: {
//         module: 'readonly',
//         console: 'readonly',
//         process: 'readonly'
//       }
//     },
//     ignores: [
//       'node_modules/**',
//       '.next/**',
//       'out/**',
//       'build/**',
//       'next-env.d.ts'
//     ],
//     rules: {
//       semi: 'error',
//       'no-console': 'error',
//       'prefer-const': 'error',
//       'comma-dangle': ['error', 'never'],
//       quotes: ['error', 'single'],
//       'import/no-named-as-default': 0,
//       'import/no-named-as-default-member': 0,
//       'import/extensions': 0,
//       'no-await-in-loop': 0,
//       'no-useless-escape': 0,
//       eqeqeq: 'warn',
//       'no-console': 0,
//       'no-plusplus': 0,
//       'no-unused-vars': 'error',
//       'no-underscore-dangle': 0,
//       'no-restricted-syntax': 0,
//       'no-loop-func': 0,
//       'import/prefer-default-export': 0,
//       'no-undef': 'error'
//     }
//   }
// ];
// export default eslintConfig;


import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import react from 'eslint-plugin-react';
import unusedImports from 'eslint-plugin-unused-imports';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettierPlugin from 'eslint-plugin-prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

const eslintConfig = [
  ...compat.extends(
    'next/core-web-vitals',
    'next/typescript',
    'plugin:import/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:prettier/recommended',
    'eslint:recommended',
    'prettier'
  ),
  {
    ignores: ['node_modules/**', '.next/**', 'out/**', 'build/**', 'next-env.d.ts'],

    plugins: {
      react,
      'unused-imports': unusedImports,
      import: importPlugin,
      'jsx-a11y': jsxA11y,
      prettier: prettierPlugin
    },

    languageOptions: {
      globals: {
        zE: 'readonly'
      }
    },

    rules: {
      // ---------- 🔍 General Rules ----------
      semi: ['error', 'always'],
      quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: false }],
      'object-curly-spacing': ['error', 'always'],
      'no-console': 'warn',
      'no-unused-vars': 'off',
      'unused-imports/no-unused-vars': 'warn',
      'unused-imports/no-unused-imports': 'warn',
      'newline-before-return': 'error',

      'lines-around-comment': [
        'error',
        {
          beforeBlockComment: true,
          beforeLineComment: true,
          allowBlockStart: true,
          allowObjectStart: true,
          allowArrayStart: true
        }
      ],

      'padding-line-between-statements': [
        'warn',
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] }
      ],

      'import/newline-after-import': ['error', { count: 1 }],
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object'],
          pathGroups: [
            { pattern: 'react', group: 'builtin', position: 'before' },
            { pattern: 'next/**', group: 'external', position: 'before' },
            { pattern: '~/**', group: 'internal' },
            { pattern: '@/**', group: 'internal' }
          ],
          pathGroupsExcludedImportTypes: ['react'],
          'newlines-between': 'always-and-inside-groups'
        }
      ],

      // ---------- ⚛️ React Rules ----------
      'react/prefer-stateless-function': 'error',
      'react/button-has-type': 'error',
      'react/no-unused-prop-types': 'error',
      'react/jsx-pascal-case': 'error',
      'react/jsx-no-script-url': 'error',
      'react/no-danger': 'error',
      'react/no-danger-with-children': 'error',
      'react/no-unstable-nested-components': ['error', { allowAsProps: true }],
      'react/jsx-fragments': 'error',
      'react/destructuring-assignment': ['error', 'always', { destructureInSignature: 'always' }],
      'react/jsx-no-leaked-render': ['error', { validStrategies: ['ternary'] }],
      'react/jsx-max-depth': ['error', { max: 10 }],
      'react/jsx-no-constructed-context-values': 'warn',
      'react/function-component-definition': [
        'warn',
        { namedComponents: 'arrow-function', unnamedComponents: 'arrow-function' }
      ],
      'react/jsx-key': [
        'error',
        {
          checkFragmentShorthand: true,
          checkKeyMustBeforeSpread: true,
          warnOnDuplicates: true
        }
      ],
      'react/jsx-no-useless-fragment': 'warn',
      'react/jsx-curly-brace-presence': ['warn', { props: 'always', children: 'ignore' }],
      'react/self-closing-comp': 'warn',
      'react/jsx-sort-props': [
        'warn',
        {
          callbacksLast: true,
          shorthandFirst: true,
          noSortAlphabetically: false,
          reservedFirst: true
        }
      ],
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',

      // ---------- ♿ Accessibility ----------
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/interactive-supports-focus': 'warn',
      'jsx-a11y/alt-text': 'off',

      // ---------- 🧩 Next.js Overrides ----------
      '@next/next/no-img-element': 'off',
      '@next/next/no-page-custom-font': 'off',

      // ---------- 🎨 Prettier ----------
      'prettier/prettier': [
        'warn',
        {
          singleQuote: true,
          semi: true,
          trailingComma: 'none',
          printWidth: 100,
          tabWidth: 2,
          bracketSpacing: true
        }
      ]
    },

    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
        typescript: { project: './jsconfig.json' }
      }
    }
  }
];

export default eslintConfig;


// import { dirname } from 'path';
// import { fileURLToPath } from 'url';
// import { FlatCompat } from '@eslint/eslintrc';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
// const compat = new FlatCompat({
//   baseDirectory: __dirname
// });

// const eslintConfig = [
//   ...compat.extends('next/core-web-vitals', 'next/typescript'),
//   {
//     languageOptions: {
//       globals: {
//         module: 'readonly',
//         console: 'readonly',
//         process: 'readonly',
//         jest: 'readonly',
//         describe: 'readonly',
//         it: 'readonly',
//         test: 'readonly',
//         expect: 'readonly',
//         beforeAll: 'readonly',
//         afterAll: 'readonly',
//         beforeEach: 'readonly',
//         afterEach: 'readonly'
//       }
//     },
//     ignores: [
//       'node_modules/**',
//       '.next/**',
//       'out/**',
//       'build/**',
//       'next-env.d.ts'
//     ],
//     rules: {
//       semi: 'error',
//       'no-console': 'error',
//       'prefer-const': 'error',
//       'comma-dangle': ['error', 'never'],
//       quotes: ['error', 'single'],
//       'import/no-named-as-default': 0,
//       'import/no-named-as-default-member': 0,
//       'import/extensions': 0,
//       'no-await-in-loop': 0,
//       'no-useless-escape': 0,
//       eqeqeq: 'warn',
//       'no-console': 0,
//       'no-plusplus': 0,
//       'no-unused-vars': 'error',
//       'no-underscore-dangle': 0,
//       'no-restricted-syntax': 0,
//       'no-loop-func': 0,
//       'import/prefer-default-export': 0,
//       'no-undef': 'error'
//     }
//   }
// ];

// export default eslintConfig;
