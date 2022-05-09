const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

if (process.env.NODE_ENV === 'development') {
  require('dotenv').config();
}

module.exports = {
  mode: 'development',
  devtool: 'eval-cheap-module-source-map',
  entry: {
    app: [
      'webpack-hot-middleware/client',
      'react-hot-loader/patch',
      './client/index.jsx',
    ],
    'previewApp': [
      'webpack-hot-middleware/client',
      'react-hot-loader/patch',
      './client/modules/Preview/previewIndex.jsx',
    ],
    previewScripts: [
      'regenerator-runtime/runtime',
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
    ],
    fallback: {
      "os": require.resolve("os-browserify/browser")
    }
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
        type: 'asset/resource'
      },
      {
        test: /\.(png)$/,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name].[ext]',
        }
      },
      {
        test: /fonts\/.*\.(eot|ttf|woff|woff2)$/,
        type: 'asset/resource'
      },
      {
        test: /\.svg$/,
        oneOf: [
          {
            resourceQuery: /byContent/,
            type: 'asset/source',
          },
          {
            resourceQuery: /byUrl/,
            type: 'asset/resource',
          },
          {
            use: {
              loader: '@svgr/webpack',
              options: {
                svgoConfig: {
                  plugins: [
                    {
                      name: 'removeViewBox',
                      active: false
                    },
                  ],
                }
              }
            }
          }
        ]
      }
    ],
  },
};
