const { merge } = require('webpack-merge');
const utils = require('./utils');
const baseWebpackConfigGenerator = require('./webpack.base.conf');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const environment = 'dev';
const pathConfig = require('../config/path');
const baseConfigs = baseWebpackConfigGenerator(environment);

const cssRootPath = `${pathConfig.cssPaths.build}/${environment}`;
const jsRootPath = `${pathConfig.scriptPaths.build}/${environment}`;

const devConfig = {
    mode: 'development',
    devtool: 'source-map',
    watch: true,
    plugins: [
        new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: [
                `${jsRootPath}/`,
                `${cssRootPath}/*.css`,
                `${cssRootPath}/*.map`,
                `${cssRootPath}/*.js`,
                `${cssRootPath}/pages/*/*.css`,
                `${cssRootPath}/pages/*/*.js`,
                `${cssRootPath}/pages/*/*.map`
            ]
        })
    ]
};

const definePlugin = utils.setDefinePlugin('process.env.NODE_ENV', 'development');
const cssConfig = utils.extractCSS(false);

module.exports = merge(baseConfigs, devConfig, definePlugin, cssConfig);