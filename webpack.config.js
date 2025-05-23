const path = require('path');

const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');


// =============================================================================

const mode = (process.env.NODE_ENV || 'production');
const mini = !(process.env.DISABLE_MINI); // disable minification if env DISABLE_MINI is set

const kProjectDir = __dirname;
const kSourceDir = path.join(kProjectDir, 'src');
const kBuildDir = path.join(kProjectDir, 'build');
const kModulesDir = path.join(kProjectDir, 'node_modules');


// -----------------------------------------------------------------------------

const browsers = ['chrome', 'firefox'];
const configs = browsers.map(browser => {
  const mver = browser === 'chrome' ? 'v3' : 'v2';
  const buildDir = path.join(kBuildDir, browser);
  return {
    mode: mode,
    devtool: !mini ? 'inline-source-map' : false,
    optimization: {
      minimize: mini
    },

    entry: {
      iqalert: path.join(kSourceDir, 'iqalert.js'),
      wsproxy: path.join(kSourceDir, 'wsproxy.js'),
      options: path.join(kSourceDir, 'options.js'),
    },
    output: {
      path: buildDir,
      filename: '[name].min.js',
    },

    plugins: [
      new CleanWebpackPlugin(),
      new CopyWebpackPlugin({
        patterns: [
        {
          from: path.join(kSourceDir, `manifest-${mver}.json`),
          to: "manifest.json",
          transform: (iqalert, path) => Buffer.from(JSON.stringify({
            short_name: process.env.npm_package_name,
            description: process.env.npm_package_description,
            version: process.env.npm_package_version,
            ...JSON.parse(iqalert.toString('utf-8'))
          }, null, '\t')),
        },
        {
          from: path.join(kSourceDir, "*.+(html|png|css|mp3)").replace(/\\/g, "/"),
          to: "[name][ext]",
        }]
      }),
      new webpack.DefinePlugin({
        VERSION: JSON.stringify(process.env.npm_package_version),
        BROWSER: JSON.stringify(browser),
        DEBUG: process.env.DISABLE_MINI
      }),
    ],
  };
});

module.exports = configs;
