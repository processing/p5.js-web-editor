const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const ChunkManifestPlugin = require('chunk-manifest-webpack-plugin');
const cssnext = require('postcss-cssnext');
const postcssFocus = require('postcss-focus');
const postcssReporter = require('postcss-reporter');
const cssnano = require('cssnano');
require('dotenv').config();

module.exports = {
  devtool: 'source-map',

  entry: {
    app: [
      'babel-polyfill',
      './client/index.jsx'
    ],
    vendor: [
      'axios',
      'classnames',
      'codemirror',
      'csslint',
      'dropzone',
      'htmlhint',
      'js-beautify',
      'jshint',
      'moment',
      'react-dom',
      'react-inlinesvg',
      'react-redux',
      'react-router',
      'react',
      'redux-form',
      'redux-thunk',
      'redux',
    ]
  },
  output: {
    path: `${__dirname}/static/dist`,
    filename: '[name].[chunkhash].js',
    publicPath: '/dist/'
  },

  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [
      'client',
      'node_modules',
    ]
  },

  module: {
    loaders: [
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader!sass-loader!postcss-loader'
        })
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.(svg|mp3)$/,
        loader: 'file-loader'
      },
      {
        test: /fonts\/.*\.(eot|svg|ttf|woff|woff2)$/,
        loader: 'file-loader'
      }
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        API_URL: process.env.API_URL ? `"${process.env.API_URL}"` : undefined,
        NODE_ENV: JSON.stringify('production'),
        S3_BUCKET: process.env.S3_BUCKET ? `"${process.env.S3_BUCKET}"` : undefined,
        S3_BUCKET_URL_BASE: process.env.S3_BUCKET_URL_BASE ? `"${process.env.S3_BUCKET_URL_BASE}"` : undefined,
        AWS_REGION: process.env.AWS_REGION ? `"${process.env.AWS_REGION}"` : undefined
      }
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: Infinity,
      filename: '[name].[chunkhash].js',
    }),
    new ExtractTextPlugin({ filename: 'app.[chunkhash].css', allChunks: true }),
    new ManifestPlugin({
      basePath: '/',
    }),
    new ChunkManifestPlugin({
      filename: 'chunk-manifest.json',
      manifestVariable: 'webpackManifest',
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new webpack.LoaderOptionsPlugin({
      options: {
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
      }
    })
  ],

};
