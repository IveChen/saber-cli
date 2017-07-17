let path = require('path');
let glob = require('glob');
let fs = require('fs');
let HtmlWebpackPlugin = require('html-webpack-plugin');
let ExtractTextPlugin = require('extract-text-webpack-plugin');

function getPath(projectPath, ...otherPath) {
    return path.join(projectPath, ...otherPath);
}

function addEntry(directory, ext, entries, chunks, entryName) {
    let entry = path.join(directory, `index.${ext}`);
    if (fs.existsSync(entry)) {
        // entryName = `${entryName}_${ext}`;
        entries[entryName] = entry;
        chunks.push(entryName)
    }
}

function buildEntriesAndHtmlWebpackPlugins(projectPath) {
    let entries = {};
    let plugins = [];
    glob.sync(getPath(projectPath, 'src', 'app', '**', '*.html')).forEach(function (file) {
        let fileParser = path.parse(file);
        let entryName = path.relative(getPath(projectPath, 'src', 'app'), fileParser.dir);
        let chunks = [];
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
    return {
        entries,
        plugins
    }
}

function getStyleLoaders(ext, options) {
    let loaderConfig = {
        test: new RegExp(`.${ext}$`),
        include: [
            path.join(options.projectPath, 'src')
        ]
    };


    let loaders = [];
    //fuck extract text plugin loaders/loader bug.
    if (ext === 'css') {
        loaders.push(Object.assign({}, loaderConfig, {
            issuer: /\.js$/,
            loader: ExtractTextPlugin.extract('css-loader')
        }));
    } else {
        loaders.push(Object.assign({}, loaderConfig, {
            issuer: /\.js$/,
            loaders: ExtractTextPlugin.extract(['css-loader', `${ext}-loader`])
        }))
    }

    let htmlAsssetsLoaderList = [{
        loader: 'file-loader',
        options: {
            name: `styles/[name]_${ext}.[hash:8].css`
        }
    }, {
        loader: 'extract-loader'
    }];
    if (ext !== 'css') {
        htmlAsssetsLoaderList.push({
            loader: 'css-loader'
        })
    }
    htmlAsssetsLoaderList.push({
        loader: `${ext}-loader`
    });
    loaders.push(Object.assign({}, loaderConfig, {
        issuer: /\.html$/,
        loaders: htmlAsssetsLoaderList
    }));
    return loaders;
}

module.exports = {
    getPath,
    buildEntriesAndHtmlWebpackPlugins,
    getStyleLoaders
};