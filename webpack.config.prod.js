var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var cssnext = require('postcss-cssnext');
var postcssFocus = require('postcss-focus');
var postcssReporter = require('postcss-reporter');
var cssnano = require('cssnano');
require('dotenv').config();

module.exports = {
  devtool: 'hidden-source-map',

  entry: [
    'babel-polyfill',
    './client/index.js'
  ],

  output: {
    path: __dirname + '/static/dist',
    filename: 'bundle.js',
    publicPath: '/dist/'
  },

  resolve: {
    extensions: ['', '.js', '.jsx'],
  },

  module: {
    loaders: [
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        loaders: ['style', 'css', 'sass', 'postcss']
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel'
      },
      {
        test: /\.svg$/,
        loader: 'file'
      }
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production'),
        'S3_BUCKET': '"' + process.env.S3_BUCKET + '"'
      }
    }),
    // new webpack.optimize.UglifyJsPlugin({
    //   compressor: {
    //     warnings: false
    //   }
    // })
  ],

  postcss: () => [
    postcssFocus(),
    cssnext({
      browsers: ['last 2 versions', 'IE > 9']
    }),
    cssnano({
      autoprefixer: false
    }),
    postcssReporter({
      clearMessages: true
    })
  ]
};