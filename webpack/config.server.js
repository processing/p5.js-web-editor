const fs = require('fs');
const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {

  entry: {
    server:
      ['@babel/polyfill', path.resolve(__dirname, '../server/server.js')],
    previewServer:
      ['@babel/polyfill', path.resolve(__dirname, '../server/previewServer.js')],
  },
  output: {
    path: path.resolve(__dirname, '../dist/'),
    filename: '[name].bundle.js',
  },

  target: 'node',
  mode: 'production',

  node: {
    __filename: true,
    __dirname: true,
  },
  externals: [nodeExternals()],

  resolve: {
    extensions: ['*', '.js', '.jsx'],
    modules: [
      'client',
      'node_modules',
    ],
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          babelrc: true
        }
      }, {
        test: /\.json$/,
        loader: 'json-loader',
      },
    ],
  },
};