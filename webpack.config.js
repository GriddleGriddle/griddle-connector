var webpack = require('webpack');

module.exports = {
  devtool: 'eval',
  entry: './index',
  output: {
    path: __dirname + '/build/',
    filename: 'griddle-connector.js',
    publicPath: '/build/',
    libraryTarget: 'commonjs2'
  },
  plugins: [
  ],
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['babel'],
      exclude: /node_modules/,
    } ]
  }
};
