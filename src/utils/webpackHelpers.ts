import path from 'path';
import interpret from 'interpret';
import rechoir from 'rechoir';
import findup from 'findup-sync';
import webpack from 'webpack';

export const defaultWebpackConfigPath = (cwd: string) => {
  const extensions = Object.keys(interpret.extensions);
  const defaultConfigFileNames = ['webpack.config', 'webpackfile'];
  const configFileRegExp = `(${defaultConfigFileNames.join(
    '|',
  )})(${extensions.join('|')})`;
  const configPath =
    findup(configFileRegExp, {
      cwd,
    }) || path.join(cwd, 'webpack.config.js');

  return configPath;
};

export const webpackConfig = (cwd: string, configPath?: string) => {
  const resolvedConfigPath = (() => {
    if (!configPath) {
      return defaultWebpackConfigPath(cwd);
    }
    if (path.isAbsolute(configPath)) {
      return path.resolve(configPath);
    }
    return path.resolve(cwd, configPath);
  })();

  console.log(resolvedConfigPath);
  // register module loaders
  rechoir.prepare(interpret.extensions, resolvedConfigPath);

  const config: {
    default: webpack.Configuration;
    // eslint-disable-next-line global-require, import/no-dynamic-require
  } = require(resolvedConfigPath);

  return config.default || config;
};
