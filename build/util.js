let path = require('path');
let glob = require('glob');
let fs = require('fs');
let webpack = require('webpack');
let HtmlWebpackPlugin = require('html-webpack-plugin');
let ExtractTextPlugin = require('extract-text-webpack-plugin');
let slash = require('slash');

function getPath(projectPath, ...otherPath) {
    return path.join(projectPath, ...otherPath);
}

function addEntry(directory, ext, entries, chunks, entryName) {
    let entry = path.join(directory, `index.${ext}`);
    if (fs.existsSync(entry)) {
        entryName = slash(entryName).replace(/\//g, '_')
        entries[entryName] = `${entry}?__webpack__`;
        chunks.push(entryName)
    }
}

function buildEntriesAndPlugins(projectPath, userConfig) {
    let commonChunks = {};
    let vendors = [];
    let plugins = [];
    (userConfig.vendors || []).forEach((vendor, key) => {
        let row = vendor.dependencies;
        if (row instanceof Array) {
            row.forEach(function (value, key) {
                row[key] = value.replace(/\[project\]/gi, projectPath);
            });
        } else if (row instanceof String) {
            row = row.replace(/\[project\]/gi, projectPath);
        }
        commonChunks[vendor.name] = row;
        vendors.push(vendor.name);
    });
    let entries = Object.assign({}, commonChunks);
    //html webpack plugin
    glob.sync(getPath(projectPath, 'src', 'app', '**', '*.html')).forEach(function (file) {
        let fileParser = path.parse(file);
        let entryName = path.relative(getPath(projectPath, 'src', 'app'), fileParser.dir);
        let chunks = [...vendors];
        addEntry(fileParser.dir, 'js', entries, chunks, entryName);
        // addEntry(fileParser.dir, 'less', entries, chunks, entryName);
        plugins.push(new HtmlWebpackPlugin({
            template: file,
            inject: true,
            chunks: chunks,
            filename: `${entryName}.html`,
            favicon: path.join(projectPath, 'src', 'assets', 'images', 'favorite.ico')
        }))
    });
    //common chunks plugin
    plugins.push(new webpack.optimize.CommonsChunkPlugin({
        names: vendors,
        minChunks: Infinity
    }));
    return {
        entries,
        plugins
    }
}

function getStyleLoaders(ext, options) {
    let issuerJSLoader = ext === 'css' ? {
        issuer: /\.js$/,
        loader: ExtractTextPlugin.extract('css-loader')
    } : {
        issuer: /\.js$/,
        loaders: ExtractTextPlugin.extract(['css-loader', `${ext}-loader`])
    };
    return [{
        test: new RegExp(`\.${ext}$`),
        include: [
            path.join(options.projectPath, 'src')
        ],
        exclude: [
            path.join(options.projectPath, 'node_modules'),
            path.join(options.cliPath, 'node_modules')
        ],
        oneOf: [issuerJSLoader, {
            issuer: /\.(html|tpl)$/,
            use: [{
                loader: 'file-loader',
                options: {
                    name: `styles/[name]_${ext}.[hash:8].css`
                }
            }, {
                loader: 'extract-loader'
            }, {
                loader: 'css-loader'
            }].concat(ext === 'css' ? [] : [{
                loader: `${ext}-loader`
            }])
        }]
    }];
}

function getScriptLoaders(options) {

    let babelLoaderConfig = {
        loader: 'babel-loader',
        options: {
            presets: [require('babel-preset-env'), require('babel-preset-stage-2'), require('babel-preset-react')],
            plugins: [
                require('babel-plugin-transform-runtime'),
                require('babel-plugin-add-module-exports')
            ],
            comments: false,
        }
    };

    return [{
        test: /\.js/,
        include: [path.join(options.projectPath, 'src')],
        exclude: [path.join(options.projectPath, 'node_modules'), path.join(options.cliPath, 'node_modules')],
        oneOf: [{
            resourceQuery: /__webpack__/,
            use: [babelLoaderConfig]
        }, {
            issuer: /\.(html|tpl)$/,
            oneOf: [{
                resourceQuery: /source/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: 'scripts/[name].[hash:8].js'
                    }
                }]
            }, {
                use: [{
                    loader: 'entry-loader',
                    options: {
                        name: 'scripts/[name].[hash:8].js',
                        projectPath: options.projectPath
                    }
                }, babelLoaderConfig]
            }]
        }, {
            issuer: /js$/,
            use: [babelLoaderConfig]
        }]
    }, {
        test: /\.jsx$/,
        use: [babelLoaderConfig]
    }];
}

function getCommonChunksPlugins(userConfig) {
    let commonChunks = userConfig.commonChunks;
    let plugins = [];
    let names = Object.keys(commonChunks);
    names.forEach(function (name) {
        plugins.push(new webpack.optimize.CommonsChunkPlugin({
            name: name,
            chunks: commonChunks[name],
            minChunks: 1
        }));
    });
    console.log(plugins)
    return plugins;
}

module.exports = {
    getPath,
    buildEntriesAndPlugins,
    getStyleLoaders,
    getScriptLoaders,
    getCommonChunksPlugins
};