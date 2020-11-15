const path = require('path');
module.exports = {
    entry: {
      useForm: './src/useForm/index.js',
      main: './src/index.js'
    },
    output: {
      path:path.resolve(__dirname, "lib"),
      libraryTarget: 'commonjs2',
      filename: '[name]/index.js'
  },
  
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader"
          }
        }
      ]
    },
    externals: {
        react: 'react',
        lodash: 'lodash'
      }
  };