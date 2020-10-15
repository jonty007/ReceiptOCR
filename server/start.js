// Transpile all code following this line with babel and use '@babel/preset-env' (aka ES6) preset.
// eslint-disable-next-line no-undef
require('@babel/register')({
  presets: ['@babel/preset-env']
});

// Import the rest of our application.
// eslint-disable-next-line no-undef
module.exports = require('./.bin/server.js');
