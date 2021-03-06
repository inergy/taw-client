import Path from 'path'

import Webpack from 'webpack'

module.exports = {
  devtool: 'cheap-module-source-map',
  entry: {
    vendor: ['babel-polyfill', Path.join(__dirname, 'src', 'vendors.js')],
  },
  output: {
    path: Path.join(__dirname, 'build', 'dll'),
    filename: 'dll.[name].js',
    library: '[name]',
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          cacheDirectory: true, // important for performance
          plugins: ['transform-regenerator'],
          presets: [
            'react',
            ['env', { modules: false }],
            'stage-0',
          ],
        },
      },
    ],
  },
  plugins: [
    new Webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production'),
      },
    }),
    new Webpack.DllPlugin({
      path: Path.join(__dirname, 'dll', '[name]-manifest.json'),
      name: '[name]',
      context: Path.resolve(__dirname, 'src'),
    }),
    new (Webpack.optimize.OccurenceOrderPlugin || Webpack.optimize.OccurrenceOrderPlugin)(),
    new Webpack.optimize.UglifyJsPlugin({
      beautify: false,
      comments: false,
      compress: {
        warnings: false,
        drop_console: true,
        screw_ie8: true,
      },
      mangle: {
        except: ['webpackJsonp'],
        screw_ie8: true,
      },
    }),
    new Webpack.HashedModuleIdsPlugin(),
    new Webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false,
    }),
  ],
  resolve: {
    modules: [Path.resolve(__dirname, 'src'), 'node_modules'],
  },
}
