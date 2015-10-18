var webpack = require('webpack');

var reactExternal = {
  root: 'React',
  commonjs2: 'react',
  commonjs: 'react',
  amd: 'react'
};

module.exports = {
  devtool: 'eval',
  entry: './index',
  output: {
    path: __dirname + '/build/',
    filename: 'griddle-connector.js',
    publicPath: '/build/',
    libraryTarget: 'umd'
  },
  externals: {
    'react': reactExternal,
    'griddle-core': 'griddle-core'
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
