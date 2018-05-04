if (process.env.NODE_ENV === 'production') {
  process.env.webpackAssets = JSON.stringify(require('./dist/static/manifest.json'));
  process.env.webpackChunkAssets = JSON.stringify(require('./dist/static/chunk-manifest.json'));
  require('./dist/server.bundle.js');
} else {
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
}
