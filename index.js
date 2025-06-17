// index.js

if (process.env.NODE_ENV === 'production') {
  // In production: use pre-built bundles
  process.env.webpackAssets = JSON.stringify(
    require('./dist/static/manifest.json')
  );
  require('./dist/server.bundle.js');
  require('./dist/previewServer.bundle.js');
} else {
  // In development: load environment, enable Babel on the fly

  // Load .env file (development mode)
  const parsed = require('dotenv').config();

  // Transpile on the fly with Babel
  require('@babel/register')({
    presets: ['@babel/preset-env'],
  });

  // Enable async/await support
  require('regenerator-runtime/runtime');


  // Start development servers
  require('./server/server');
  require('./server/previewServer');
}
