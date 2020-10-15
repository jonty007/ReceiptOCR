module.exports = {
  'env': {
    'browser': true,
    'es6': true,
    'amd': true,
    'node': true
  },
  'extends': ['eslint:recommended', 'prettier', 'plugin:import/recommended', 'plugin:es-beautifier/standard', 'plugin:prettier/recommended'],
  'globals': {
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly',
    _: 'readonly'
  },
  'parserOptions': {
    'ecmaVersion': 2018,
    'sourceType': 'module'
  },
  'plugins': ['import', 'prettier', 'es-beautifier'],
  'rules': {
    'quotes': ['error', 'single', { "avoidEscape": true }],
    'semi': ['error', 'always'],
    'no-console': ['error', { 'allow': ['warn', 'error'] }],
    'indent': ['error', 2],
    'prettier/prettier': ['error', { 'endOfLine': 'auto', 'parser': 'babel' }],
    'curly': ['error', 'all'],
    'no-confusing-arrow': 'error',
    'lines-around-comment': [
      'error',
      {
        'beforeBlockComment': false,
        'afterBlockComment': false,
        'beforeLineComment': false,
        'afterLineComment': false,
        'allowBlockStart': true,
        'allowBlockEnd': true,
        'allowObjectStart': true,
        'allowObjectEnd': true,
        'allowArrayStart': true,
        'allowArrayEnd': true
      }
    ],
    'no-unused-vars': [
      'error',
      {
        'vars': 'all',
        'args': 'none',
        'ignoreRestSiblings': false
      }
    ],
    'no-unused-expressions': 'off',
    'camelcase': 'off',
    'prefer-arrow-callback': ['off'],
    'func-names': 'off',
    'no-use-before-define': 'warn',
    // 'one-var': ['warn', 'consecutive'],
    'no-underscore-dangle': 'warn',
    'no-param-reassign': ['warn', { 'props': false }],
    'no-plusplus': 'off',
    'no-restricted-globals': 'warn',
    'no-shadow': 'warn',
    'no-restricted-syntax': ['warn', 'LabeledStatement', 'WithStatement'],
    'prefer-destructuring': 'warn',
    'class-methods-use-this': 'warn',
    'import/unambiguous': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/no-unresolved': 'warn',
    'import/named': 'off',
    'global-require': 'off',
    'spaced-comment': 'off',
    'no-await-in-loop': 'off',
    'no-prototype-builtins': 'off',
    'space-before-function-paren': 'off',
    'comma-dangle': 'off',
    'arrow-parens': 'off',
    'one-var-declaration-per-line': 'off',
    'es-beautifier/multiline-array-elements': 'off',
    'es-beautifier/multiline-import-specifiers': 'off',
    'es-beautifier/multiline-object-properties': 'off',
    'no-var': 'warn'
  }
};
