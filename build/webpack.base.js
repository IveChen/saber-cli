let path = require('path');
// let CssEntryWebpackPlugin = require('css-entry-webpack-plugin');
let ExtractTextPlugin = require('extract-text-webpack-plugin');
let webpack = require('webpack');

let util = require('./util');

module.exports = function (userConfig, options) {
    let {entries, plugins} = util.buildEntriesAndPlugins(options.projectPath, userConfig);
    return {
        output: {
            path: util.getPath(options.projectPath, 'dist', userConfig.assetPath || ''),
            filename: 'scripts/[name].[hash:8].js',
        },
        resolve: {
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
                'ie-loader': path.join(options.cliPath, 'loaders', 'ie-loader', 'index.js'),
                'inline-loader': path.join(options.cliPath, 'loaders', 'inline-loader', 'index.js'),
                'sprite-loader': path.join(options.cliPath, 'loaders', 'sprite-loader', 'index.js'),
                'test-loader': path.join(options.cliPath, 'loaders', 'test-loader', 'index.js')
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
                ...util.getStyleLoaders('css', options, userConfig),
                ...util.getStyleLoaders('less', options, userConfig),
                {
                    test: /\.vue/,
                    use: [{
                        loader: 'vue-loader'
                    }]
                },
                {
                    test: /(png|jpe?g|gif)$/,
                    use: [{
                        loader: 'url-loader',
                        options: {
                            limit: 8 * 1024,
                            name: util.fixFileLoaderPath('images/[name].[hash:8].[ext]')
                        }
                    }]
                },
                {
                    test: /\.(woff2?|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                    use: [{
                        loader: 'file-loader',
                        options: {
                            name: util.fixFileLoaderPath('fonts/[name].[hash:8].[ext]')
                        }
                    }]
                },
                {
                    test: /\.html$/,
                    use: [
                        {
                            loader: 'underscore-template-loader',
                            query: {
                                attributes: userConfig.htmlAssets || ['script:src', 'img:src', 'link:href']
                            }
                        }, {
                            loader: "inline-loader",
                            query: {
                                attributes: userConfig.htmlAssets || ['script:src', 'img:src', 'link:href']
                            }
                        }, {
                            loader: 'ie-loader',
                            query: {
                                attributes: userConfig.htmlAssets || ['script:src', 'img:src', 'link:href']
                            }
                        }
                    ]
                }, {
                    test: /\.tpl$/,
                    use: [{
                        loader: 'underscore-template-loader',
                        query: {
                            attributes: userConfig.htmlAssets || ['script:src', 'img:src', 'link:href']
                        }
                    }, {
                        loader: 'ie-loader',
                        query: {
                            attributes: userConfig.htmlAssets || ['script:src', 'img:src', 'link:href']
                        }
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