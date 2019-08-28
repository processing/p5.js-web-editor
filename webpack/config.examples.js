const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = [{
  entry: path.resolve(__dirname, '../server/scripts/fetch-examples.js'),
  mode: 'production',
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
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          babelrc: true
        }
      }
    ],
  },
},
{
  entry: path.resolve(__dirname, '../server/scripts/fetch-examples-gg.js'),
  mode: 'production',
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
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          babelrc: true
        }
      }
    ],
  },
},
{
  entry: path.resolve(__dirname, '../server/scripts/fetch-examples-ml5.js'),
  mode: 'production',
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
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          babelrc: true
        }
      }
    ],
  },
}];