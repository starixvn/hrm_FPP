const alias = require('../config/alias');
const pathConfig = require('../config/path');
const pluginGenerator = require('../config/plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

function generateConfig(environment) {
    const jsPath = `${pathConfig.scriptPaths.build}/${environment}`;
    const cssPath = `${pathConfig.cssPaths.build}/${environment}`;
    return {
        resolve: {
            alias: alias,
            extensions: ['.js', '.jsx']
        },
        entry: {
            /*js*/
            [`${jsPath}/lib/lang-vi-VN`]: pathConfig.scriptPaths.language,
            [`${jsPath}/pages/login`]: pathConfig.scriptPaths.login,
            [`${jsPath}/pages/dashboard/index`]: pathConfig.scriptPaths.dashboard_index,
            [`${jsPath}/pages/report/index`]: pathConfig.scriptPaths.report_index,
            /*css*/
            [`${cssPath}/pages/login`]: pathConfig.cssPaths.login,
            [`${cssPath}/pages/dashboard/index`]: pathConfig.cssPaths.dashboard_index,
            [`${cssPath}/pages/report/index`]: pathConfig.cssPaths.report_index
        },
        output: {
            path: pathConfig.projectRoot,
            filename: '[name].chunk.js',
            chunkFilename: `${jsPath}/lib/[name].chunk.js`
        },
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env', '@babel/preset-react'],
                            plugins: [
                                '@babel/plugin-proposal-class-properties',
                                '@babel/plugin-proposal-object-rest-spread',
                                '@babel/plugin-syntax-dynamic-import'
                            ]
                        }
                    },
                    exclude: /node_modules/
                }
            ]
        },
        plugins: pluginGenerator(environment),
        stats: {
            assets: false,
            colors: true,
            version: false,
            hash: false,
            timings: true,
            chunks: false,
            chunkModules: false,
            children: true
        },
        optimization: {
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        output: {
                            comments: false
                        }
                    }
                }),
                new CssMinimizerPlugin()
            ],
            splitChunks: false
        }
    };
}

module.exports = generateConfig;
