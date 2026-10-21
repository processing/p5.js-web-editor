if (process.env.NODE_ENV === 'production') {
  process.env.webpackAssets = JSON.stringify(
    require('./dist/static/manifest.json')
  );
  require('./dist/server.bundle.js');
  require('./dist/previewServer.bundle.js');
} else {
  require('./loadEnv')();
  require('@babel/register')({
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    presets: ['@babel/preset-env', '@babel/preset-typescript']
  });
  require('regenerator-runtime/runtime');
  require('./server/server');
  require('./server/previewServer');
}
