const PnpWebpackPlugin = require('pnp-webpack-plugin');
const path = require('path');

module.exports = function override(webpackConfig, env) {
  // const tsRule = webpackConfig.module.rules[1].oneOf[2];
  // tsRule.include = undefined;
  // tsRule.exclude = /node_modules/;

  webpackConfig.module.rules.push({
    test: /\.tsx?$/,
    loader: require.resolve('ts-loader'),
    options: {
      transpileOnly: true,
    },
  });

  webpackConfig.resolve.plugins = webpackConfig.resolve.plugins.filter(
    ({ constructor }) => {
      if (!constructor) return true;
      return constructor.name !== 'ModuleScopePlugin';
    }
  );

  webpackConfig.resolve.plugins.unshift(PnpWebpackPlugin);
  webpackConfig.resolve.plugins.unshift(PnpWebpackPlugin.moduleLoader(module));

  return webpackConfig;
};
