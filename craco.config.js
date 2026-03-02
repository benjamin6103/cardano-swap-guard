/* eslint-disable */  // Ignores ESLint for this config file

const { useBabelRc, override } = require('customize-cra');

module.exports = override(
  useBabelRc(),
  (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      stream: require.resolve('stream-browserify'),
      crypto: require.resolve('crypto-browserify'),
    };
    return config;
  }
);