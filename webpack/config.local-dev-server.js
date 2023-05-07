// Configures a dev server so for editor development without running a backend.

const baseWebpack = require('./config.dev');
const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Gets absolute paths to files
const rootPath = fs.realpathSync(process.cwd());
const resolveAppPath = relPath => path.resolve(rootPath, relPath);

// The webpack dev server serve both the preview and the editor pages on the same port, but from different HTML files.
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 8000;

module.exports = {
  ...baseWebpack,
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
      serveIndex: true,
    },
    // TODO: If backend developers end up using this test server more frequently.
    // we can ask the webpack dev server to proxy requests to elsewhere.
    // https://webpack.js.org/configuration/dev-server/#devserverproxy
    compress: true,
    host: HOST,
    port: PORT,
  },
  plugins: [
    ...baseWebpack.plugins,

    // https://stackoverflow.com/a/48599489/5129731
    new HtmlWebpackPlugin({
      inject: true,
      chunks: ['app'], // name of chunk(s) corresponds to entry in config.dev.js
      template: resolveAppPath('public/index.html'), // templated using lodash.template
      filename: 'index.html',
      templateParameters: {
        ENV_FROM_WEBPACK: JSON.stringify({
          API_URL: process.env.API_URL,
          LOGIN_ENABLED: process.env.LOGIN_ENABLED === 'true',
          EXAMPLES_ENABLED: process.env.EXAMPLES_ENABLED === 'true',
          UI_ACCESS_TOKEN_ENABLED: process.env.UI_ACCESS_TOKEN_ENABLED === 'true',
          UI_COLLECTIONS_ENABLED: process.env.UI_COLLECTIONS_ENABLED === 'true',
          UPLOAD_LIMIT: parseInt(process.env.UPLOAD_LIMIT),
          MOBILE_ENABLED: process.env.MOBILE_ENABLED === 'true',
          PREVIEW_URL: `http://localhost:${PORT}/preview.html`,
          TRANSLATIONS_ENABLED: process.env.TRANSLATIONS_ENABLED === 'true',
          // NODE_ENV controls the presence of the debug tool. Let's make it always visible for local testing.
          NODE_ENV: 'development',
          CLIENT: true // This is always true in the browser!
        })
      }
    }),
    new HtmlWebpackPlugin({
      inject: true,
      chunks: ['previewApp'],
      template: resolveAppPath('public/preview.html'), // templated using lodash.template
      filename: 'preview.html',
      // Variables
      EDITOR_URL: `http://localhost:${PORT}`
    }),
  ],
}
