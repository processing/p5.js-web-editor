const fs = require('fs');
const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {

  entry: path.resolve(__dirname, '../server/server.js'),

  output: {
    path: path.resolve(__dirname, '../dist/'),
    filename: 'server.bundle.js',
  },

  target: 'node',

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
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: [
            'react',
            'env',
            'stage-0',
          ],
          plugins: [
            [
              'babel-plugin-webpack-loaders', {
                'config': path.resolve(__dirname, './config.babel.js'),
                "verbose": false
              }
            ]
          ]
        },
      }, {
        test: /\.json$/,
        loader: 'json-loader',
      },
    ],
  },
};