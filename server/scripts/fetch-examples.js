require('@babel/register');
require('regenerator-runtime/runtime');
const dotenv = require('dotenv');

if (process.env.NODE_ENV === 'development') {
  dotenv.config();
}
require('./examples');
