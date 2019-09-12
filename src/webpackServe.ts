import 'source-map-support/register';
import path from 'path';
import fs from 'fs';
import glob from 'glob';
import yargs from 'yargs/yargs';
import yargsUnparser from 'yargs-unparser';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import devServerYargsOptions from 'webpack-dev-server/bin/options';
import configYargs from 'webpack-cli/bin/config/config-yargs';
import convertArgv from 'webpack-cli/bin/utils/convert-argv';
import WebpackInjectPlugin from 'webpack-inject-plugin';
import express from 'express';
import createHTML from 'create-html';
import { choosePort, prepareUrls } from 'react-dev-utils/WebpackDevServerUtils';
import {
  defaultHost,
  defaultPort,
  createConfig,
  getVersion as getWebpackVersion,
} from './utils/webpackHelpers';
import {
  options as pluginYargsOptions,
  createArguments,
} from './utils/yargsHelpers';
import CordovaConfigParser from './utils/CordovaConfigParser';

module.exports = async (ctx: any) => {
  const platforms = ['browser', 'android', 'ios'] as const;
  const targetPlatforms = platforms.filter(platform =>
    ctx.opts.platforms.includes(platform),
  );
  if (!platforms.some(platform => ctx.opts.platforms.includes(platform))) {
    return;
  }

  if (!ctx.opts.options || !ctx.opts.options.argv) {
    return;
  }

  const pluginYargs = yargs(ctx.opts.options.argv);
  // set cordova-plugin-webpack options
  const pluginArgv = pluginYargs
    .options(pluginYargsOptions)
    .version(
      `${ctx.opts.plugin.pluginInfo.id} ${ctx.opts.plugin.pluginInfo.version}`,
    ).argv;

  if (!pluginArgv.livereload) {
    return;
  }

  const webpackYargs = yargs(
    yargsUnparser(
      createArguments(
        typeof pluginArgv.webpack === 'object' ? pluginArgv.webpack! : {},
      ),
    ),
  );
  // set webpack yargs options
  configYargs(webpackYargs);
  // set webpack-dev-server yargs options
  const webpackArgv = webpackYargs
    .options(devServerYargsOptions)
    .version(getWebpackVersion()).argv;

  const [customWebpackConfig, customDevServerConfig] = await createConfig(
    convertArgv(webpackArgv), // create webpack configuration from yargs.argv and webpack.config.js
    webpackArgv,
  );

  const protocol = customDevServerConfig.https ? 'https' : 'http';
  const host =
    !customDevServerConfig.host || customDevServerConfig.host === 'localhost'
      ? defaultHost
      : customDevServerConfig.host;
  const port = await choosePort(
    host,
    customDevServerConfig.port || defaultPort,
  );
  if (!port) {
    return;
  }
  const urls = prepareUrls(protocol, host, port);
  const defaultAccessHost = {
    android: `10.0.2.2`,
    ios: `localhost`,
  };

  const webpackConfig: webpack.Configuration = {
    ...customWebpackConfig,
    mode: 'development',
    plugins: [
      ...(customWebpackConfig.plugins || []),
      new WebpackInjectPlugin(() =>
        fs.readFileSync(path.join(__dirname, 'www/injectCSP.js'), 'utf8'),
      ),
      new WebpackInjectPlugin(() =>
        fs.readFileSync(
          path.join(__dirname, 'www/injectCordovaScript.js'),
          'utf8',
        ),
      ),
    ],
  };
  const devServerConfig: WebpackDevServer.Configuration = {
    contentBase: path.join(ctx.opts.projectRoot, 'www'),
    historyApiFallback: true,
    watchContentBase: true,
    hot: true,
    ...customDevServerConfig,
    host,
    port,
    before: (app, server) => {
      if (customDevServerConfig.before) {
        customDevServerConfig.before(app, server);
      }
      targetPlatforms.forEach(platform => {
        app.use(
          `/${platform}`,
          express.static(
            path.join(
              ctx.opts.projectRoot,
              'platforms',
              platform,
              'platform_www',
            ),
          ),
        );
      });
    },
  };

  // HMR
  if (devServerConfig.hot)
    WebpackDevServer.addDevServerEntrypoints(webpackConfig, devServerConfig);

  targetPlatforms.forEach(platform => {
    if (platform === 'browser') {
      const html = createHTML({
        head: `<meta http-equiv="refresh" content="0;URL=${urls.localUrlForBrowser}">`,
      });
      fs.writeFileSync(
        path.join(
          ctx.opts.projectRoot,
          'platforms',
          platform,
          'www/index.html',
        ),
        html,
      );
      return;
    }
    glob
      .sync(
        path.join(ctx.opts.projectRoot, 'platforms', platform, '**/config.xml'),
      )
      .forEach(configXmlPath => {
        const configXml = new CordovaConfigParser(configXmlPath);
        configXml.setContent(
          `${protocol}://${urls.lanUrlForConfig ||
            defaultAccessHost[platform]}:${port}`,
        );
        if (platform === 'ios') {
          configXml.setElement('allow-navigation', { href: '*' });
        }
        configXml.write();
      });
  });

  const compiler = webpack(webpackConfig);
  const server = new WebpackDevServer(compiler, devServerConfig);
  server.listen(port, host, err => {
    if (err) {
      throw err;
    }
    console.log('Starting the development server...\n');
  });
};
