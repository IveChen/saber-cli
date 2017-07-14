let ora = require('ora');
let rm = require('rimraf');
let path = require('path');
let webpack = require('webpack');
let merge = require('webpack-merge');
let OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')

let getBaseConfig = require('../webpack.base');


let spinner = null;
module.exports = function (prodConfig, options) {
    process.env.NODE_ENV = 'production';
    spinner = ora('building');
    spinner.start('remove old dist files');
    rm(path.join(options.projectPath, 'dist'), function (error) {
        if (error) {
            spinner.fail('remove files error,build stopped');
            throw error;
        } else {
            spinner.succeed('remove old dist files.');
            spinner.start('building');

            webpack(generateProdConfig(prodConfig, options), function (error, stats) {
                if (error) {
                    spinner.fail('built');
                    throw error
                } else {
                    spinner.succeed('built')
                }
            })
        }
    })
};

function generateProdConfig(prodConfig, options) {
    return merge(getBaseConfig(options), {
        output: {
            publicPath: prodConfig.publicPath || '/'
        },
        resolve: {
            alias: {
                vue: 'vue/dist/vue.min.js'
            }
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env': 'production'
            }),
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                },
                sourceMap: false
            }),
            new OptimizeCSSPlugin({
                cssProcessorOptions: {
                    safe: true
                },
                canPrint: false
            })
        ]
    })
}