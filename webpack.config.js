const webpack = require('webpack');

module.exports = {
  resolve: {
    fallback: {
      stream: require.resolve('stream-browserify'), // polyfill Node stream
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser.js', // polyfill process
    }),
  ],
};