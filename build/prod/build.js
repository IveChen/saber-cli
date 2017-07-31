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
    spinner = ora('编译中...');
    spinner.start('删除旧的编译目录...');
    rm(path.join(options.projectPath, 'dist'), function (error) {
        if (error) {
            spinner.fail('移除旧的编译目录失败，停止编译');
            throw error;
        } else {
            spinner.succeed('移除旧的编译目录');
            spinner.start('编译中...');

            webpack(generateProdConfig(prodConfig, options), function (error, stats) {
                if (error) {
                    spinner.fail('编译失败');
                    throw error
                } else {
                    spinner.succeed('编译成功')
                }
            })
        }
    })
};

function generateProdConfig(prodConfig, options) {
    return merge(getBaseConfig(prodConfig, options), {
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