if (process.env.NODE_ENV === 'production') {
  process.env.webpackAssets = JSON.stringify(require('./static/dist/manifest.json'));
  process.env.webpackChunkAssets = JSON.stringify(require('./static/dist/chunk-manifest.json'));
}
require('babel-register');
require('babel-polyfill');
require('dotenv').config();
require('./server/examples.js');