module.exports = {
    entry: {
      useForm: './src/validation/index.js'
    },
    output: {
      libraryTarget: 'commonjs2',
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
      }
  };