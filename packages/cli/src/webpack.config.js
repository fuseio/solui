import path from 'path'
import webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'

const BASE_FOLDER = path.resolve(path.join(__dirname, '..'))
export const FRONTEND_FOLDER = path.join(__dirname, 'frontend')
export const BUILD_FOLDER = path.join(BASE_FOLDER, 'build')

export const createConfig = ({ virtualModules }) => {
  const NPM_FOLDER = path.dirname(path.dirname(require.resolve('react')))

  return {
    mode: 'none',
    entry: [
      path.join(FRONTEND_FOLDER, 'index.js'),
    ],
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
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
                '@babel/plugin-proposal-class-properties',
                'react-hot-loader/babel',
              ]
            }
          }
        }
      ]
    },
    resolve: {
      extensions: ['*', '.js', '.jsx'],
      alias: {
        /* BEGIN: ignore @pinata/sdk node deps */
        fs: path.join(NPM_FOLDER, 'react'),
        /* END: ignore @pinata/sdk node deps */
        react: path.join(NPM_FOLDER, 'react'),
        'react-dom': path.join(NPM_FOLDER, '@hot-loader', 'react-dom'),
      },
    },
    devtool: 'inline-source-map',
    plugins: [
      virtualModules,
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: path.join(FRONTEND_FOLDER, 'index.html')
      }),
      new webpack.HotModuleReplacementPlugin(),
    ],
    output: {
      filename: 'bundle.js',
      publicPath: '/',
      path: BUILD_FOLDER
    }
  }
}
