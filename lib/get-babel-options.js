const {
  _getAddonProvidedConfig,
  _shouldCompileModules,
  _shouldIncludeHelpers,
  _getHelpersPlugin,
  _getDebugMacroPlugins,
  _getEmberModulesAPIPolyfill,
  _getEmberDataPackagesPolyfill,
  _getModulesPlugin,
} = require("./babel-options-util");

module.exports = function getBabelOptions(config, appInstance) {
  let { parent, project } = appInstance;
  let addonProvidedConfig = _getAddonProvidedConfig(config);
  let shouldIncludeHelpers = _shouldIncludeHelpers(config, appInstance);
  let userPostTransformPlugins = addonProvidedConfig.postTransformPlugins;

  let babelOptions = {
    presets: [require.resolve('@babel/preset-env', {
      loose: true,
      exclude: [
        '@babel/plugin-transform-classes',
        '@babel/plugin-proposal-private-methods',
        '@babel/plugin-proposal-class-properties',
      ]
    })],
    plugins: [].concat(
      shouldIncludeHelpers && _getHelpersPlugin(project),
      addonProvidedConfig.plugins,
      [
        [require.resolve('@babel/plugin-transform-typescript'), { allowDeclareFields: true }],
        [require.resolve('@babel/plugin-proposal-decorators'), { legacy: true }],
      ],
      _getDebugMacroPlugins(config, project),
      _getEmberModulesAPIPolyfill(config, parent, project),
      _getEmberDataPackagesPolyfill(config, parent),
      (_shouldCompileModules(config, project) && _getModulesPlugin()),
      userPostTransformPlugins
    ).filter(Boolean).filter((item) => {
      if (!Array.isArray(item)) return true;

      // Scrub invalid plugin configs, because we rely on preset-env now
      if (item[0] === '@babel/plugin-proposal-private-methods') return false;

      return true;
    }),
  };

  console.log('|||||||||||||||||||||||||||||||||')
  console.log(babelOptions);//JSON.stringify(babelOptions, null, 2));

  return babelOptions;

};
