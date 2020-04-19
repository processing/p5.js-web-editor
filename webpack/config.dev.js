const webpack = require('webpack');
const path = require('path');

if (process.env.NODE_ENV === 'development') {
  require('dotenv').config();
}


// react hmr being fucked up has to do with the multiple entries!!! cool.
module.exports = {
  mode: 'development',
  devtool: 'cheap-module-eval-source-map',
  entry: {
    app: [
      'core-js/modules/es6.promise',
      'core-js/modules/es6.array.iterator',
      'webpack-hot-middleware/client',
      'react-hot-loader/patch',
      './client/index.jsx',
    ],
    previewScripts: [
       path.resolve(__dirname, '../client/utils/previewEntry.js')
    ]
  },
  output: {
    path: `${__dirname}`,
    filename: '[name].js',
    publicPath: '/'
  },
  devServer: {
    contentBase: './dist',
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
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development')
      }
    })
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: [/node_modules/, /.+\.config.js/],
        use: [{
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            plugins: ['react-hot-loader/babel'],
          }
        }, {
          loader: 'eslint-loader'
        }]
        // use: {
        //   loader: 'babel-loader',
        //   options: {
        //     cacheDirectory: true,
        //     plugins: ['react-hot-loader/babel'],
        //   }
        // }
      },
      {
        test: /main\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.(svg|mp3)$/,
        use: 'file-loader'
      },
      {
        test: /\.(png)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'images/'
          }
         }
      },
      {
        test: /fonts\/.*\.(eot|svg|ttf|woff|woff2)$/,
        use: 'file-loader'
      },
      {
        test: /_console-feed.scss/,
        use: {
          loader: 'sass-extract-loader',
          options: {
            plugins: [{ plugin: 'sass-extract-js', options: { camelCase: false } }]
          }
        }
      }
    ],
  },
};
