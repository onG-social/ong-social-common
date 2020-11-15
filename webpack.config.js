const path = require('path');
const webpack = require('webpack');

const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  plugins: [new webpack.ProgressPlugin()],

  externals: {
    // Use external version of React
    "react": "React",
    "lodash": "lodash"
  },

  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      include: [],
      loader: 'babel-loader'
    }]
  },

  optimization: {
    minimizer: [new TerserPlugin()],

    splitChunks: {
      cacheGroups: {
        vendors: {
          priority: -10,
          test: /[\\/]node_modules[\\/]/
        }
      },

      chunks: 'async',
      minChunks: 1,
      minSize: 30000,
      name: false
    }
  }
}