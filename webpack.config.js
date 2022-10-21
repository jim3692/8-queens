const path = require('path')

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: {
    scan: './src/scan.js',
    main: './src/main.js'
  },
  output: {
    filename: '[name]-bundle.js',
    path: path.resolve(__dirname, 'docs')
  }
}
