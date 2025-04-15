const { merge } = require('webpack-merge');
const utils = require('./utils');
const baseWebpackConfigGenerator = require('./webpack.base.conf');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const pathConfig = require('../config/path');
const environment = 'pro';
const baseConfigs = baseWebpackConfigGenerator(environment);

const cssRootPath = `${pathConfig.cssPaths.build}/${environment}`;
const jsRootPath = `${pathConfig.scriptPaths.build}/${environment}`;
module.exports = merge(baseConfigs,
    utils.setDefinePlugin('process.env.NODE_ENV', 'production'),
    {
        mode: 'production',
        watch: false,
        devtool: false,
        performance: {
            maxEntrypointSize: 512000,
            maxAssetSize: 512000
        },
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
                ],
                root: process.cwd(),
                dangerouslyAllowCleanPatternsOutsideProject: true
            })
        ]
    },
    utils.extractCSS(true)
);