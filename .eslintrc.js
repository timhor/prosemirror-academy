// // This is only basic styles for typescript for react need to extend this
// module.exports = {
//   parser: '@typescript-eslint/parser', // Specifies the ESLint parser
//   extends: [
//   ],
//   parserOptions: {
//     ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
//     sourceType: 'module', // Allows for the use of imports
//     ecmaFeatures: {
//       jsx: true, // Allows for the parsing of JSX
//     },
//   },
//   rules: {
//     // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
//     // e.g. "@typescript-eslint/explicit-function-return-type": "off",
//     '@typescript-eslint/explicit-function-return-type': 'off', // Revisit this rule oin the future right now is a pain in the...
//     '@typescript-eslint/no-var-requires': 'off',
//     '@typescript-eslint/camelcase': 'off',
//   },
//   overrides: [
//     {
//       // enable the rule specifically for TypeScript files
//       files: ['*.ts', '*.tsx'],
//       rules: {
//         '@typescript-eslint/no-var-requires': ['error'],
//       },
//     },
//   ],
// };

module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    ecmaFeatures: {
      jsx: true, // Allows for the parsing of JSX
      modules: true,
    },
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: ['airbnb-base', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
  rules: {
    indent: 'off',
    '@typescript-eslint/indent': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'import/prefer-default-export': 'off',
    '@typescript-eslint/camelcase': 'off',
    'prettier/prettier': 'error',
  },
  extends: ['plugin:prettier/recommended'],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts', '.tsx'],
      },
    },
  },
};
