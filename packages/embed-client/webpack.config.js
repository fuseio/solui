const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

const BASE_FOLDER = __dirname
const SRC_FOLDER = path.join(BASE_FOLDER, 'src')
const BUILD_FOLDER = path.join(BASE_FOLDER, 'build')
const STATS_FOLDER = path.join(BASE_FOLDER, 'build-stats')

const NPM_FOLDER = path.dirname(path.dirname(require.resolve('react')))

module.exports = {
  mode: 'production',
  entry: [
    path.join(SRC_FOLDER, 'index.js'),
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [ 'style-loader', 'css-loader' ],
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  useBuiltIns: 'entry',
                  corejs: 3,
                  targets: {
                    chrome: '58',
                    node: 'current'
                  }
                }
              ],
              '@babel/preset-react'
            ],
            plugins: [
              '@babel/plugin-proposal-export-default-from',
              '@babel/plugin-proposal-class-properties'
            ]
          }
        }
      }
    ]
  },
  resolve: {
    extensions: [ '*', '.js', '.jsx' ],
    alias: {
      /* BEGIN: ignore @pinata/sdk node deps */
      fs: path.join(NPM_FOLDER, 'react'),
      /* END: ignore @pinata/sdk node deps */
      react: path.join(NPM_FOLDER, 'react'),
      'react-dom': path.join(NPM_FOLDER, 'react-dom'),
    }
  },
  devtool: 'false',
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: 'solUI',
      template: path.join(SRC_FOLDER, 'index.html')
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: path.join(STATS_FOLDER, 'report.html'),
    }),
  ],
  output: {
    filename: 'index.js',
    publicPath: '',
    path: BUILD_FOLDER
  }
}
