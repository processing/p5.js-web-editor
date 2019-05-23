require('babel-register');
require('babel-polyfill');
const dotenv = require('dotenv');

if (process.env.NODE_ENV === 'development') {
  dotenv.config();
}
require('./examples-ml5.js');
