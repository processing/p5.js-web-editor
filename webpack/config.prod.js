const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const ChunkManifestPlugin = require('chunk-manifest-webpack-plugin');
const cssnext = require('postcss-cssnext');
const postcssFocus = require('postcss-focus');
const postcssReporter = require('postcss-reporter');
const cssnano = require('cssnano');
if (process.env.NODE_ENV === "development") {
  require('dotenv').config();
}

module.exports = [{
  devtool: 'source-map',

  entry: {
    app: [
      '@babel/polyfill',
      'core-js/modules/es6.promise',
      'core-js/modules/es6.array.iterator',
      path.resolve(__dirname, '../client/index.jsx')
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
    path: path.resolve(__dirname, '../dist/static'),
    filename: '[name].[chunkhash].js',
    publicPath: '/'
  },

  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [
      'client',
      'node_modules',
    ]
  },

  module: {
    rules: [
      {
        test: /main\.scss$/,
        exclude: /node_modules/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader!sass-loader!postcss-loader'
        })
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader'
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
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
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
      inlineManifest: false
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false,
        drop_console :true
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

},
{
  entry: {
    app: [
      path.resolve(__dirname, '../client/utils/previewEntry.js')
    ]
  },
  target: 'web',
  output: {
    path: path.resolve(__dirname, '../dist/static'),
    filename: 'previewScripts.js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['*', '.js', '.jsx'],
    modules: [
      'client',
      'node_modules',
    ],
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          babelrc: true
        }
      }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ]
}];
