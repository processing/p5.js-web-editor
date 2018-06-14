require('babel-register');
require('babel-polyfill');
if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}
require('./examples.js');
