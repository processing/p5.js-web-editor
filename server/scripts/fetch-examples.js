require('babel-register');
require('babel-polyfill');
if (process.env.NODE_ENV === "development") {
  require('dotenv').config();
}
require('./examples.js');
