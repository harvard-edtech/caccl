const config = {
  extends: [
    'airbnb',
    'airbnb/hooks',
    'react-app',
    'react-app/jest',
  ],
  overrides: [
    {
      files: [
        '*.ts',
        '*.tsx',
      ],
      extends: [
        'airbnb-typescript',
      ],
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
      },
      rules: {
        '@typescript-eslint/lines-between-class-members': 'off',
      },
    },
  ],
  rules: {
    'arrow-body-style': [
      'warn',
      'always',
    ],
    'react/function-component-definition': [
      2,
      {
        namedComponents: 'arrow-function',
      },
    ],
    'no-spaced-func': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'lines-between-class-members': 'off',
    'no-case-declarations': 'off',
    'react/require-default-props': 'off',
    'react/react-in-jsx-scope': 'off',
    'arrow-parens': [
      'warn',
      'always',
    ],
    'comma-dangle': [
      'error',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'always-multiline',
      },
    ],
    'consistent-return': 'off',
    'id-length': 'off',
    'max-len': [
      'error',
      {
        code: 80,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreUrls: true,
      },
    ],
    'newline-per-chained-call': [
      'error',
      {
        ignoreChainWithDepth: 2,
      },
    ],
    'no-plusplus': [
      'warn',
      {
        allowForLoopAfterthoughts: true,
      },
    ],
    'prefer-template': 1,
    radix: 'error',
    'no-await-in-loop': 'off',
    'max-params': [
      'warn',
      {
        max: 3,
      },
    ],
  },
};

module.exports = config;
