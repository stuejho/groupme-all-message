const path = require('path');
var glob = require("glob");

module.exports = {
  entry: {
    main: path.resolve(__dirname, 'src/js/main.js'),
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist/js')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  'useBuiltIns': 'usage',
                  'corejs': 3,
                  'targets': '> 1%, not dead'
                }
              ]
            ]
          }
        }
      }
    ]
  }
}
