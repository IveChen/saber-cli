let path = require('path');
// let CssEntryWebpackPlugin = require('css-entry-webpack-plugin');
let ExtractTextPlugin = require('extract-text-webpack-plugin');
let webpack = require('webpack');

let util = require('./util');

module.exports = function (userConfig, options) {
    let {entries, plugins} = util.buildEntriesAndHtmlWebpackPlugins(options.projectPath);
    return {
        output: {
            path: util.getPath(options.projectPath, 'dist'),
            filename: 'scripts/[name].[hash:8].js',
        },
        resolve: {
            alias: {
                'vue': 'vue/dist/vue.js'
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
            ],
            alias: {
                'entry-loader': path.join(options.cliPath, 'loaders', 'entry-loader', 'index.js'),
                'ie-loader': path.join(options.cliPath, 'loaders', 'ie-loader', 'index.js')
            }
        },
        entry: Object.assign({
            'baseJS': util.getPath(options.projectPath, 'src', 'assets', 'scripts', 'base.js')
        }, entries),
        module: {
            rules: [
                {
                    test: /\.js$/,
                    enforce: 'pre',
                    include: [path.join(options.projectPath, 'src')],
                    exclude: [path.join(options.cliPath, 'node_modules'), path.join(options.projectPath, 'node_modules')],
                    use: [{
                        loader: 'eslint-loader',
                        options: {
                            emitError: true,
                            emitWarning: true,
                            configFile: path.join(options.projectPath, '.eslintrc')
                        }
                    }]
                },
                ...util.getScriptLoaders(options),
                ...util.getStyleLoaders('css', options),
                ...util.getStyleLoaders('less', options),
                {
                    test: /\.vue/,
                    use: [{
                        loader: 'vue-loader',
                        options: {}
                    }]
                },
                {
                    test: /(png|jpe?g|gif)$/,
                    loader: [{
                        loader: 'url-loader',
                        options: {
                            limit: 1024 * 8,
                            name: 'images/[name].[hash:8].[ext]'
                        }
                    }]
                },
                {
                    test: /\.(woff2?|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                    loader: [{
                        loader: 'file-loader',
                        options: {
                            name: 'fonts/[name].[hash:8].[ext]'
                        }
                    }]
                },
                {
                    test: /\.html$/,
                    loader: [{
                        loader: 'html-loader',
                        options: {
                            attrs: userConfig.htmlAssets || ['script:src', 'img:src', 'link:href']
                        }
                    }, {
                        loader: 'ie-loader'
                    }]
                }

            ]
        },
        plugins: [
            new webpack.optimize.ModuleConcatenationPlugin(),
            new ExtractTextPlugin('styles/[name].[hash:8].css'),
            ...plugins
        ]
    };
}