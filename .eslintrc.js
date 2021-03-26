module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'react',
    '@typescript-eslint',
  ],
  rules: {
    "react/jsx-filename-extension": [1, { "extensions": [".tsx", ".jsx"] }],
    "react/react-in-jsx-scope": [0],
    "react/prop-types": [0],
    "react/jsx-props-no-spreading": [0],
    "import/no-unresolved": [0],
    "import/extensions": [0],
    "no-nested-ternary": [0],
    "no-console": [1, {"allow": ["warn", "error"]}],
    "no-await-in-loop": [0],
    "react/no-array-index-key": [0]
  },
};
