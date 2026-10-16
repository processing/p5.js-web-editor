require('@babel/register');
require('regenerator-runtime/runtime');
const loadEnv = require('../../loadEnv');

if (process.env.NODE_ENV === 'development') {
  loadEnv();
}
require('./examples-gg-latest');
