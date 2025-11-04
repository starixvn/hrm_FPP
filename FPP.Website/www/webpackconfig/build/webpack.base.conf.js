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
            extensions: ['.js', '.jsx'],
        },
        entry: {
            /*js*/
            [`${jsPath}/lib/lang-vi-VN`]: pathConfig.scriptPaths.language,
            [`${jsPath}/pages/login`]: pathConfig.scriptPaths.login,
            [`${jsPath}/pages/dashboard/index`]: pathConfig.scriptPaths.dashboard_index,
            [`${jsPath}/pages/costExpense/upload/index`]:
                pathConfig.scriptPaths.costExpense_upload_index,
            [`${jsPath}/pages/costExpense/report/index`]:
                pathConfig.scriptPaths.costExpense_report_index,
            [`${jsPath}/pages/interCharging/upload/index`]:
                pathConfig.scriptPaths.interCharging_upload_index,
            [`${jsPath}/pages/interCharging/report/index`]:
                pathConfig.scriptPaths.interCharging_report_index,
            [`${jsPath}/pages/interInvoice/create/index`]:
                pathConfig.scriptPaths.interInvoice_create_index,
            [`${jsPath}/pages/interInvoice/listing/index`]:
                pathConfig.scriptPaths.interInvoice_listing_index,
            [`${jsPath}/pages/interInvoice/detail/index`]:
                pathConfig.scriptPaths.interInvoice_detail_index,
            [`${jsPath}/pages/interInvoice/edit/index`]:
                pathConfig.scriptPaths.interInvoice_edit_index,
            [`${jsPath}/pages/interInvoice/report/index`]:
                pathConfig.scriptPaths.interInvoice_report_index,
            [`${jsPath}/pages/bu/invoice/index`]: pathConfig.scriptPaths.bu_index,
            /*css*/
            [`${cssPath}/pages/login`]: pathConfig.cssPaths.login,
            [`${cssPath}/pages/error`]: pathConfig.cssPaths.error,
            [`${cssPath}/pages/dashboard/index`]: pathConfig.cssPaths.dashboard_index,
            [`${cssPath}/pages/costExpense/upload/index`]:
                pathConfig.cssPaths.costExpense_upload_index,
            [`${cssPath}/pages/costExpense/report/index`]:
                pathConfig.cssPaths.costExpense_report_index,
            [`${cssPath}/pages/interCharging/upload/index`]:
                pathConfig.cssPaths.interCharging_upload_index,
            [`${cssPath}/pages/interCharging/report/index`]:
                pathConfig.cssPaths.interCharging_report_index,
            [`${cssPath}/pages/interInvoice/create/index`]:
                pathConfig.cssPaths.interInvoice_create_index,
            [`${cssPath}/pages/interInvoice/listing/index`]:
                pathConfig.cssPaths.interInvoice_listing_index,
            [`${cssPath}/pages/interInvoice/detail/index`]:
                pathConfig.cssPaths.interInvoice_detail_index,
            [`${cssPath}/pages/interInvoice/report/index`]:
                pathConfig.cssPaths.interInvoice_report_index,
            [`${cssPath}/pages/bu/invoice/index`]: pathConfig.cssPaths.bu_index,
        },
        output: {
            path: pathConfig.projectRoot,
            filename: '[name].chunk.js',
            chunkFilename: `${jsPath}/lib/[name].chunk.js`,
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
                                '@babel/plugin-syntax-dynamic-import',
                            ],
                        },
                    },
                    exclude: /node_modules/,
                },
            ],
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
            children: true,
        },
        optimization: {
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        output: {
                            comments: false,
                        },
                    },
                }),
                new CssMinimizerPlugin(),
            ],
            splitChunks: false,
        },
    };
}

module.exports = generateConfig;
