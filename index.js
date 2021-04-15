if (process.env.NODE_ENV === 'production') {
  process.env.webpackAssets = JSON.stringify(require('./dist/static/manifest.json'));
  require('./dist/server.bundle.js');
  require('./dist/previewServer.bundle.js');
} else {
  let parsed = require('dotenv').config();
  require('@babel/register')({
    presets: ["@babel/preset-env"]
  });
  require('@babel/polyfill');
  //// in development, let .env values override those in the environment already (i.e. in docker-compose.yml)
  // so commenting this out makes the docker container work.
  // if (process.env.NODE_ENV === 'development') {
  //   for (let key in parsed) {
  //     process.env[key] = parsed[key];
  //   }
  // }
  require('./server/server');
  require('./server/previewServer');
}
