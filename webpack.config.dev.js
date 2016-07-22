var webpack = require('webpack');
require('dotenv').config();

module.exports = {
	devtool: 'cheap-module-eval-source-map',
	entry: ['babel-polyfill', 'webpack-hot-middleware/client',
          './client/index.js',
  ],
  output: {
		path: __dirname + '/dist/',
		filename: 'bundle.js',
		publicPath: '/dist/'
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
	plugins: [
    new webpack.HotModuleReplacementPlugin(),
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
        test: /\.svg$/,
        loader: 'file'
      }
    ],
  },
};