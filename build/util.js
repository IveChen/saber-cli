let path = require('path');
let glob = require('glob');
let fs = require('fs');
let net = require('net');
let webpack = require('webpack');
let HtmlWebpackPlugin = require('html-webpack-plugin');
let ExtractTextPlugin = require('extract-text-webpack-plugin');
let slash = require('slash');
let autoprefixer = require("autoprefixer");

function getPath(projectPath, ...otherPath) {
    return path.join(projectPath, ...otherPath);
}

function fixFileLoaderPath(path) {
    return process.env.NODE_ENV === 'development' ? path : '/' + path;
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
            filename: getPath(projectPath, 'dist', userConfig.pagePath || '', `${entryName}.html`),
            favicon: path.join(projectPath, 'src', 'assets', 'images', 'favorite.ico')
        }))
    });
    //common chunks plugin
    plugins.push(new webpack.optimize.CommonsChunkPlugin({
        names: vendors
    }));
    return {
        entries,
        plugins
    }
}

function getStyleLoaders(ext, options, userConfig) {
    const cssLoaders = {
        loader: 'css-loader',
        options: {
            importLoaders: 1
        }
    };
    const postCssLoader = {
        loader: 'postcss-loader',
        options: {
            plugins: [
                autoprefixer({
                    browsers: userConfig.postCss.browsers,
                    add: true,
                    remove: true
                })
            ]
        }
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
        oneOf: [{
            issuer: /\.js$/,
            use: ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: [cssLoaders, {
                    loader: 'sprite-loader'
                }, postCssLoader].concat(ext === 'css' ? [] : [{
                    loader: `${ext}-loader`
                }])
            })
        }, {
            issuer: /\.(html|tpl)$/,
            oneOf: [
                {
                    resourceQuery: /inline/,
                    use: [{
                        loader: 'style-loader'
                    }, cssLoaders, {
                        loader: 'sprite-loader'
                    }, postCssLoader].concat(ext === 'css' ? [] : [{
                        loader: `${ext}-loader`
                    }])
                },
                {
                    use: [{
                        loader: 'file-loader',
                        options: {
                            name: fixFileLoaderPath(`styles/[name]_${ext}.[hash:8].css`)
                        }
                    }, {
                        loader: 'extract-loader'
                    }, cssLoaders, {
                        loader: 'sprite-loader'
                    }, postCssLoader].concat(ext === 'css' ? [] : [{
                        loader: `${ext}-loader`
                    }])
                }
            ]
        }]
    }];
}

function getScriptLoaders(options) {

    let babelLoaderConfig = {
        loader: 'babel-loader',
        options: {
            presets: [
                require('babel-preset-react')
            ]
        }
    };

    return [{
        test: /\.js/,
        include: [path.join(options.projectPath, 'src')],
        exclude: [path.join(options.projectPath, 'node_modules'), path.join(options.cliPath, 'node_modules')],
        oneOf: [{
            issuer: /\.(html|tpl)$/,
            oneOf: [{
                resourceQuery: /source/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: fixFileLoaderPath('scripts/[name].[hash:8].js')
                    }
                }]
            }, {
                use: [{
                    loader: 'entry-loader',
                    options: {
                        name: fixFileLoaderPath('scripts/[name].[hash:8].js'),
                        projectPath: options.projectPath
                    }
                }, babelLoaderConfig]
            }]
        }, {
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
    return plugins;
}

function throttle(fn, interval = 300) {
    let canRun = true;
    return function () {
        if (!canRun) return;
        canRun = false;
        setTimeout(() => {
            fn.apply(this, arguments);
            canRun = true;
        }, interval);
    };
}


module.exports = {
    getPath,
    buildEntriesAndPlugins,
    getStyleLoaders,
    getScriptLoaders,
    getCommonChunksPlugins,
    fixFileLoaderPath,
    throttle
};