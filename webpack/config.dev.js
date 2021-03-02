const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

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
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [
      'client',
      'node_modules'
    ]
  },
  plugins: [
    new ESLintPlugin({
      extensions: ['js', 'jsx']
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development')
      }
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: path.resolve(__dirname, '../translations/locales'), to: path.resolve(__dirname, 'locales') }
      ]
    }
    )
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
        }]
      },
      {
        test: /main\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.(mp3)$/,
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
        test: /fonts\/.*\.(eot|ttf|woff|woff2)$/,
        use: 'file-loader'
      },
      {
        test: /\.svg$/,
        oneOf: [
          {
            resourceQuery: /byContent/,
            use: 'raw-loader'
          },
          {
            resourceQuery: /byUrl/,
            use: 'file-loader'
          },
          {
            use: {
              loader: '@svgr/webpack',
              options: {
                svgoConfig: {
                  plugins: {
                    removeViewBox: false
                  }
                }
              }
            }
          }
        ]
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
