# cordova-plugin-webpack

[![npm version](https://badge.fury.io/js/cordova-plugin-webpack.svg)](https://badge.fury.io/js/cordova-plugin-webpack)
[![Downloads](https://img.shields.io/npm/dm/cordova-plugin-webpack.svg)](https://www.npmjs.com/package/cordova-plugin-webpack)
[![dependencies Status](https://david-dm.org/kotarella1110/cordova-plugin-webpack/status.svg)](https://david-dm.org/kotarella1110/cordova-plugin-webpack)
[![devDependencies Status](https://david-dm.org/kotarella1110/cordova-plugin-webpack/dev-status.svg)](https://david-dm.org/kotarella1110/cordova-plugin-webpack?type=dev)
[![Maintainability](https://api.codeclimate.com/v1/badges/f51fd5b6e3c7f43649c2/maintainability)](https://codeclimate.com/github/kotarella1110/cordova-plugin-webpack/maintainability)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/kotarella1110/cordova-plugin-webpack/issues)

This plugin integrates [webpack](https://webpack.js.org "webpack") into your Cordova workflow.

## Motivation

Module bundlers such as webpack are essential for SPA (Single Page Application) development. Unfortunately, the Cordova workflow does not integrate webpack as a standard feature.
This plugin makes webpack easy to integrate into Cordova workflow.

## Features

* Simply install this plugin and create a webpack configuration file in your project root folder to easily integrate integrate webpack into your Cordova workflow
* Modifications made to HTML/CSS/JS in the source code results in an instant Cordova WebView update by LiveReloaad ([Hot Module Replacement](https://webpack.js.org/concepts/hot-module-replacement "Hot Module Replacement | webpack"))
* Supports devices and emulators for Android and iOS platforms

## Installation

```shell
$ cordova plugin add cordova-plugin-webpack
```

## CLI Reference

### Syntax

```shell
$ cordova { prepare | platform add | build | run } [<platform> [...]]
    [-- [--webpackConfig <webpackConfig> | --livereload]]
```

| Option | Description | Default | Aliases |
|--------|-------------|---------|---------|
| `--webpackConfig` | Path to a webpack configuration file | `webpack.config.js` or `webpackfile.js` in your project root directory. | `-w` |
| `--livereload` | Enables LiveReload (HMR) | `false` | `-l` |

### Examples

#### Build

To be compiled by webpack **before preparing** your Cordova app.

```shell
$ cordova prepare
$ cordova build -- --webpackConfig path/to/dir/webpack.config.js
```

#### Live Reload (HMR)

To be ran by Webpack Dev Server **after preparing** your Cordova app.

```shell
$ cordova prepare -- --livereload
$ cordova run -- -w path/to/dir/webpack.config.babel.js -l
```

## Usage

1. [Add this plugin](#Installation)

2. Create a webpack configuration file (`webpack.config.js`) in your project root folder

    ```js
    const path = require('path');

    module.exports = {
      mode: 'development',
      entry: './src/index.js',
      output: {
        path: path.resolve(__dirname, 'www'),
        filename: 'index.bundle.js',
      },
      devtool: 'inline-source-map',
    };
    ```

3. Execute the commands

    ```shell
    $ cordova build
    $ cordova run -- --livereload
    ```

<details>
<summary>Click here for details：</summary>

1. Create a Cordova app

    ```shell
    $ cordova create cordova-plugin-webpack-example cordova.plugin.webpack.example CordovaPluginWebpackExample
    ```

2. Add platforms

    ```shell
    $ cd cordova-plugin-webpack-example
    $ cordova platform add android ios
    ```

3. [Add this plugin](#Installation)

4. Create a JavaScript file ([entry point](https://webpack.js.org/concepts/entry-points/ "entry points"))

    ```shell
    $ mkdir src
    $ mv www/js/index.js src/index.js
    ```

5. Create a webpack configuration file (`webpack.config.js`) in your project root folder


    ```js
    const path = require('path');

    module.exports = {
      mode: 'development',
      entry: './src/index.js',
      output: {
        path: path.resolve(__dirname, 'www'),
        filename: 'index.bundle.js',
      },
      devtool: 'inline-source-map',
    };
    ```

6. Fix a HTML file (`www/index.html`)

    ```diff
    -         <script type="text/javascript" src="js/index.js"></script>
    +         <script type="text/javascript" src="index.bundle.js"></script>
    ```

7. Execute the commands

    ```shell
    $ cordova build
    $ cordova run -- --livereload
    ```

</details>

### Custome webpack configuration

If you want to custom webpack configuration, modify your `webpack.config.js` file.


```js
...
module.exports = {
  ...
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'www'),
    filename: 'bundle.js',
  },
  plugins: [
    new HtmlWebpackPlugin(),
  ],
  ...
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    host: 'localhost',
    port: '8000',
    hot: false,
  },
  ...
};
```

| Option | Default |
|--------|---------|
| `devServer.contentBase`  | `www` |
| `devServer.historyApiFallBack` | `true` |
| `devServer.host` | `0.0.0.0` |
| `devServer.port` | `8080` |
| `devServer.watchContentBase` | `true` |
| `devServer.hot` | `true` |

For example, if you want page reloading (LiveReload) instead of hot module reloading (HMR), specify the `devServer.hot` option as `false`.

```js
...
module.exports = {
  ...
  devServer: {
    hot: false,
  },
  ...
};
```

## Contribute

Contributions are always welcome! Please read the [contributing](./CONTRIBUTING.md) first.

## License

[Apache-2.0](./LICENSE) © [Kotaro Sugawara](https://twitter.com/kotarella1110)
