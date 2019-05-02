const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = [{
  entry: path.resolve(__dirname, '../server/scripts/fetch-examples.js'),

  output: {
    path: path.resolve(__dirname, '../dist/'),
    filename: 'fetch-examples.bundle.js'
  },

  target: 'node',

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
      }
    ],
  },
},
{
  entry: path.resolve(__dirname, '../server/scripts/fetch-examples-gg.js'),

  output: {
    path: path.resolve(__dirname, '../dist/'),
    filename: 'fetch-examples-gg.bundle.js'
  },

  target: 'node',

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
      }
    ],
  },
},
{
  entry: path.resolve(__dirname, '../server/scripts/fetch-examples-ml5.js'),

  output: {
    path: path.resolve(__dirname, '../dist/'),
    filename: 'fetch-examples-ml5.bundle.js'
  },

  target: 'node',

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
      }
    ],
  },
}];