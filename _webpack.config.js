var webpack = require('webpack')

var ignore = new webpack.IgnorePlugin(/^(lodash|react)$/)

module.exports = {
  //other options goes here
//   plugins: [ignore]
    externals: {
        // Use external version of React
        "react": "React",
        "lodash": "lodash"
    }
}