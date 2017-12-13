if (process.env.NODE_ENV === 'production') {
  process.env.webpackAssets = JSON.stringify(require('./static/dist/manifest.json'));
  process.env.webpackChunkAssets = JSON.stringify(require('./static/dist/chunk-manifest.json'));
}
require('babel-register');
require('babel-polyfill');
let parsed = require('dotenv').config();
//// in development, let .env values override those in the environment already (i.e. in docker-compose.yml)
if (process.env.NODE_ENV === 'development') {
  for (let key in parsed) {
    process.env[key] = parsed[key];
  }
}
require('./server/server');
