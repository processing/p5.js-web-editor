require('@babel/register')({
  extensions: ['.js', '.ts'],
  presets: ['@babel/preset-env', '@babel/preset-typescript']
});
require('regenerator-runtime/runtime');
const dotenv = require('dotenv');

if (process.env.NODE_ENV === 'development') {
  dotenv.config();
}
require('./examples');
