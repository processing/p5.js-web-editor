const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

if (process.env.NODE_ENV === 'development') {
  require('dotenv').config();
}

module.exports = {
  mode: 'development',
  devtool: 'eval-cheap-module-source-map',
  entry: {
    app: ['@gatsbyjs/webpack-hot-middleware/client', './client/index.jsx'],
    previewApp: [
      '@gatsbyjs/webpack-hot-middleware/client',
      './client/modules/Preview/previewIndex.jsx'
    ],
    previewScripts: [
      '@gatsbyjs/webpack-hot-middleware/client',
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
    modules: ['client', 'node_modules'],
    fallback: {
      os: require.resolve('os-browserify/browser')
    }
  },
  plugins: [
    new ESLintPlugin({
      extensions: ['js', 'jsx']
    }),
    new webpack.HotModuleReplacementPlugin(),
    new ReactRefreshPlugin({
      overlay: {
        sockIntegration: 'whm',
      }
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development')
      }
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, '../translations/locales'),
          to: path.resolve(__dirname, 'locales')
        }
      ]
    })
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: [/node_modules/, /.+\.config.js/],
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true
            }
          }
        ]
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
                  plugins: [
                    {
                      name: 'removeViewBox',
                      active: false
                    }
                  ]
                }
              }
            }
          }
        ]
      }
    ]
  }
};
