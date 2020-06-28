const path = require('path')

module.exports = {
  mode: 'development',
  entry: {
    scan: './src/scan.js',
    main: './src/main.js'
  },
  output: {
    filename: '[name]-bundle.js',
    path: path.resolve(__dirname, 'docs')
  }
}
