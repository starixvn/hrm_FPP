const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const pathConfig = require('../config/path');
const sass = require('sass');

exports.setDefinePlugin = function (key, value) {
    const env = {};
    env[key] = JSON.stringify(value);

    return {
        plugins: [
            new webpack.DefinePlugin(env)
        ]
    };
};

exports.extractCSS = function (isProduction) {
    const env = isProduction ? 'pro' : 'dev';
    const jsPath = `${pathConfig.scriptPaths.build}/${env}/lib`;
    return {
        plugins: [
            new MiniCssExtractPlugin({ 
                filename: '[name].chunk.css', 
                chunkFilename: jsPath + '/[name].chunk.css' 
            })
        ],
        module: {
            rules: [
                {
                    test: /\.(sc|c)ss$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                url: false,
                                importLoaders: 2
                            }
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                implementation: sass,
                                sassOptions: {
                                    outputStyle: 'compressed',
                                    fiber: false,
                                    includePaths: [pathConfig.projectRoot]
                                },
                                sourceMap: !isProduction,
                                webpackImporter: false,
                                api: 'modern'
                            }
                        }
                    ]
                }
            ]
        }
    };
};