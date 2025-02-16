const path = require('path');

module.exports = {
  mode: 'production', // Use 'development' for debugging
  entry: {
    background: './src/background.js',
    content: './src/content.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  // Add loaders or plugins if needed (e.g., for CSS)
};