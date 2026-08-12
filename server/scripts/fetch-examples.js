require('@babel/register')({
  extensions: ['.js', '.ts'],
  presets: ['@babel/preset-env', '@babel/preset-typescript']
});
require('regenerator-runtime/runtime');
const loadEnv = require('../../loadEnv');

if (process.env.NODE_ENV === 'development') {
  loadEnv();
}
require('./examples');
