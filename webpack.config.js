var webpack = require('webpack');

module.exports = {
	devtool: 'cheap-module-eval-source-map',
	entry: ['webpack-hot-middleware/client',
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
      }
    })
  ],
  module: {
    loaders: [
      {
        test: /\.jsx*$/,
        exclude: [/node_modules/, /.+\.config.js/],
        loader: 'babel',
        query: {
          presets: ['react-hmre'],
        },
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