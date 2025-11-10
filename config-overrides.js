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
    url: require.resolve('url/'),
  };

  // Configure SVGR to allow SVG namespace tags
  const babelRule = config.module.rules.find(rule => 
    rule.oneOf && Array.isArray(rule.oneOf)
  );

  if (babelRule && babelRule.oneOf) {
    babelRule.oneOf.forEach(rule => {
      if (rule.test && rule.test.toString().includes('svg') && rule.use) {
        rule.use.forEach(use => {
          if (use.loader && use.loader.includes('@svgr/webpack')) {
            if (!use.options) use.options = {};
            // Configure SVGR babelOptions to allow namespace tags
            use.options.babelOptions = {
              ...use.options.babelOptions,
              plugins: [
                ...(use.options.babelOptions?.plugins || []),
                [require.resolve('@babel/plugin-transform-react-jsx'), { throwIfNamespace: false }]
              ]
            };
          }
        });
      }
    });
  }

  return config;
};
