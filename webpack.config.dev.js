const webpack = require('webpack');
require('dotenv').config();

module.exports = {
  devtool: 'cheap-module-eval-source-map',
  entry: {
    app: ['babel-polyfill',
      'webpack-hot-middleware/client',
      './client/index.jsx',
    ],
    vendor: [
      'react',
      'react-dom'
    ]
  },
  output: {
    path: `${__dirname}/dist/`,
    filename: 'app.js',
    publicPath: '/dist/'
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [
      'client',
      'node_modules'
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: Infinity,
      filename: 'vendor.js',
    }),
    new webpack.DefinePlugin({
      'process.env': {
        API_URL: process.env.API_URL ? `"${process.env.API_URL}"` : undefined,
        CLIENT: JSON.stringify(true),
        FORCE_TO_HTTPS: process.env.FORCE_TO_HTTPS === 'true' ?
          JSON.stringify(true) :
          JSON.stringify(false),
        NODE_ENV: JSON.stringify('development'),
        S3_BUCKET: process.env.S3_BUCKET ? `"${process.env.S3_BUCKET}"` : undefined,
        S3_BUCKET_URL_BASE: process.env.S3_BUCKET_URL_BASE ? `"${process.env.S3_BUCKET_URL_BASE}"` : undefined,
        AWS_REGION: process.env.AWS_REGION ? `"${process.env.AWS_REGION}"` : undefined
      }
    })
  ],
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: [/node_modules/, /.+\.config.js/],
        loaders: ['babel-loader', 'eslint-loader']
      },
      {
        test: /\.scss$/,
        loaders: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.(svg|mp3)$/,
        loader: 'file-loader'
      },
      {
        test: /fonts\/.*\.(eot|svg|ttf|woff|woff2)$/,
        loader: 'file-loader'
      }
    ],
  },
};
