module.exports = function override(config, env) {
  // Add polyfills for Node.js core modules for Harmony.js and blockchain libraries compatibility
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: require.resolve('crypto-browserify'),
    assert: require.resolve('assert/'),
    stream: require.resolve('stream-browserify'),
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    os: require.resolve('os-browserify'),
  };

  return config;
};
