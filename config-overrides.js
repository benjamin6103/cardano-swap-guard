const webpack = require('webpack');
const path = require('path');

module.exports = function override(config) {
  // Ensure resolve exists
  config.resolve = config.resolve || {};
  config.resolve.alias = config.resolve.alias || {};

  // Run our shims before any other modules execute.
  const polyfillsPath = path.resolve(__dirname, 'src/polyfills.ts');
  if (typeof config.entry === 'string') {
    config.entry = [polyfillsPath, config.entry];
  } else if (Array.isArray(config.entry)) {
    config.entry = config.entry.includes(polyfillsPath)
      ? config.entry
      : [polyfillsPath, ...config.entry];
  } else if (config.entry && typeof config.entry === 'object') {
    for (const key of Object.keys(config.entry)) {
      const entry = config.entry[key];
      if (typeof entry === 'string') {
        config.entry[key] = [polyfillsPath, entry];
      } else if (Array.isArray(entry) && !entry.includes(polyfillsPath)) {
        config.entry[key] = [polyfillsPath, ...entry];
      }
    }
  }

  // Polyfills and fallbacks for Node.js core modules we actually need.
  config.resolve.fallback = {
    ...(config.resolve.fallback || {}),
    stream: require.resolve('stream-browserify'),
    crypto: require.resolve('crypto-browserify'),
    process: require.resolve('process/browser.js'),
    buffer: require.resolve('buffer/'),
  };

  // Some ESM dependencies import this deep path without an extension.
  config.resolve.alias['process/browser'] = require.resolve('process/browser.js');

  // Provide global shims so dependencies that expect a Node-like
  // environment (e.g. readable-stream used by ripemd160) can access
  // `process` safely in the browser bundle.
  config.plugins = config.plugins || [];
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser.js',
      Buffer: ['buffer', 'Buffer'],
    })
  );

  // Suppress noisy source-map warnings from external Cardano SDK deps
  // so the terminal output is clean for production/hackathon use.
  const ignoreCardanoSourceMapWarnings = (warning) =>
    warning.module &&
    warning.module.resource &&
    /node_modules[\\/](?:@utxos|@cardano-sdk)[\\/]/.test(warning.module.resource);

  config.ignoreWarnings = [...(config.ignoreWarnings || []), ignoreCardanoSourceMapWarnings];

  return config;
};