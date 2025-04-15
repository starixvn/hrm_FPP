const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const WebpackBuildNotifierPlugin = require('webpack-build-notifier');
const pathConfig = require('./path');
const cssRootPath = pathConfig.cssPaths.build;

let _buildNumber = 1;
function generatePlugins(environment) {
    const commonPlugins = [
        new CleanWebpackPlugin([cssRootPath], {
            root: process.cwd(),
            exclude: ['fonts', 'images', 'dev', 'pro']
        }),
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        new WebpackBuildNotifierPlugin({
            title: "React Webpack Build",
            suppressSuccess: true
        }),
        function () {
            this.plugin('done', function (stats) {
                setTimeout(function () {
                    console.log('\n ////////// Build version: #' + (_buildNumber++) + ' (' + new Date().toLocaleString() + ').//////////\n');
                }, 150);
            });
        }
    ];

    return commonPlugins;
}

module.exports = generatePlugins;