let path = require('path');
// let CssEntryWebpackPlugin = require('css-entry-webpack-plugin');
let ExtractTextPlugin = require('extract-text-webpack-plugin');
let webpack = require('webpack');

let util = require('./util');

module.exports = function (options) {
    let {entries, plugins} = util.buildEntriesAndHtmlWebpackPlugins(options.projectPath);
    return {
        output: {
            path: util.getPath(options.projectPath, 'dist'),
            filename: 'script/[name].[hash:8].js',
        },
        resolve: {
            alias:{
              'vue':'vue/dist/vue.js'
            },
            modules: [
                path.join(options.projectPath, 'node_modules'),
                path.join(options.cliPath, 'node_modules'),
                path.join(options.projectPath)
            ]
        },
        resolveLoader: {
            modules: [
                path.join(options.projectPath, 'node_modules'),
                path.join(options.cliPath, 'node_modules')
            ]
        },
        entry: Object.assign({
            'baseJS': util.getPath(options.projectPath, 'src', 'assets', 'scripts', 'base.js')
        }, entries),
        module: {
            rules: [
                // {
                //     test: /\.js$/,
                //     enforce: 'pre',
                //     exclude: [path.join(options.cliPath, 'node_modules'), path.join(options.projectPath, 'node_modules')],
                //     use: [{
                //         loader: 'eslint-loader'
                //     }]
                // },
                {
                    test: /\.js$/,
                    include: [path.join(options.projectPath, 'src')],
                    use: [{
                        loader: 'babel-loader',
                        options: {
                            presets: [require('babel-preset-env'), require('babel-preset-stage-2')],
                            plugins: [
                                require('babel-plugin-transform-runtime'),
                                require('babel-plugin-add-module-exports')
                            ],
                            comments: false,
                            // extends: path.join(options.projectPath, '.babelrc')
                        }
                    }]
                },
                {
                    test: /\.less/,
                    include: [path.join(options.projectPath, 'src')],
                    use: ExtractTextPlugin.extract(['css-loader', 'less-loader'])
                },
                {
                    test: /\.css/,
                    include: [path.join(options.projectPath, 'src')],
                    use: ExtractTextPlugin.extract(['css-loader'])
                },
                {
                    test: /\.vue/,
                    use: [{
                        loader: 'vue-loader',
                        options: {

                        }
                    }]
                }
            ]
        },
        plugins: [
            new webpack.optimize.ModuleConcatenationPlugin(),
            new ExtractTextPlugin('styles/[name].[hash:8].css'),
            // new CssEntryWebpackPlugin({
            //     output: {
            //         filename: path.join('styles', '[name].[contenthash:8].css')
            //     },
            //     test: function (file) {
            //         return file.indexOf('.css') > -1 || file.indexOf('.less') > -1;
            //     }
            // }),
            //not support webpack3
            ...plugins
        ]
    };
}