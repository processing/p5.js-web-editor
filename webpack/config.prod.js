const webpack = require('webpack');
const path = require('path');
const TerserJSPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const postcssPresetEnv = require('postcss-preset-env');
const postcssFocus = require('postcss-focus');
const CopyWebpackPlugin = require('copy-webpack-plugin')
if (process.env.NODE_ENV === "development") {
  require('dotenv').config();
}

module.exports = {
  devtool: 'source-map',
  mode: 'production',
  entry: {
    app: [
      'regenerator-runtime/runtime',
      path.resolve(__dirname, '../client/index.jsx')
    ],
    'previewApp': [
      'regenerator-runtime/runtime',
      path.resolve(__dirname, '../client/modules/Preview/previewIndex.jsx')
    ],
    previewScripts: [
      'regenerator-runtime/runtime',
      path.resolve(__dirname, '../client/utils/previewEntry.js')
    ]
  },
  output: {
    path: path.resolve(__dirname, '../dist/static'),
    filename: '[name].[contenthash].js',
    publicPath: '/'
  },

  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [
      'client',
      'node_modules',
    ],
    fallback: {
      "os": require.resolve("os-browserify/browser")
    }
  },
  module: {
    rules: [{
      test: /main\.scss$/,
      exclude: /node_modules/,
      use: [
        MiniCssExtractPlugin.loader,
        {
          loader: 'css-loader',
          options: {
            importLoaders: 2,
            sourceMap: true
          }
        },
        {
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              plugins: () => [
                postcssPresetEnv({
                  browsers: ['last 2 versions', 'IE > 9']
                }),
                postcssFocus()
              ]
              // plugins: () => [
              //   postcssFocus(),
              //   cssnext({
              //     browsers: ['last 2 versions', 'IE > 9']
              //   }),
              //   cssnano({
              //     autoprefixer: false
              //   }),
              //   postcssReporter({
              //     clearMessages: true
              //   })
              // ],
            },
            sourceMap: true
          }
        },
        {
          loader: 'sass-loader',
          options: {
            sourceMap: true
          }
        }
      ]
    },
    {
      test: /\.jsx?$/,
      exclude: /node_modules/,
      use: 'babel-loader'
    },
    {
      test: /\.(png)$/,
      type: 'asset/resource',
      generator: {
         filename: 'images/[name].[ext]'
       }
    },
    {
      test: /\.mp3$/,
      type: 'asset/resource',
    },
    {
      test: /fonts\/.*\.(eot|ttf|woff|woff2)$/,
      type: 'asset/resource',
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
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserJSPlugin({
      terserOptions: {
        sourceMap: true
      },
      parallel: true
    }), new CssMinimizerPlugin()],
  },
  plugins: [
    new WebpackManifestPlugin({
      basePath: '/',
      filename: 'manifest.json'
    }),
    new MiniCssExtractPlugin({
      filename: 'app.[contenthash].css',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: path.resolve(__dirname, '../translations/locales'), to: path.resolve(__dirname, '../dist/static/locales') },
        { from: path.resolve(__dirname, '../public'), to: path.resolve(__dirname, '../dist/static') }
      ]
    }
    )
  ]
};
