module.exports = function override(config, env) {
  // Add crypto polyfill for Harmony.js compatibility
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: require.resolve('crypto-browserify'),
  };

  return config;
};
