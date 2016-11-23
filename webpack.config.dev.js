var webpack = require('webpack');
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
		path: __dirname + '/dist/',
		filename: 'app.js',
		publicPath: '/dist/'
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
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
        CLIENT: JSON.stringify(true),
        'NODE_ENV': JSON.stringify('development'),
        'S3_BUCKET': '"' + process.env.S3_BUCKET + '"'
      }
    })
  ],
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: [/node_modules/, /.+\.config.js/],
        loaders: ['babel', 'eslint-loader']
      },
      {
        test: /\.scss$/,
        loaders: ['style', 'css', 'sass']
      },
      {
        test: /\.(svg|mp3)$/,
        loader: 'file'
      },
      {
          test: /fonts\/.*\.(eot|svg|ttf|woff|woff2)$/,
          loader: 'file'
      }
    ],
  },
};
