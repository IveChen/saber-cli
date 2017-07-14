let path = require('path');
let glob = require('glob');
let fs = require('fs');
let HtmlWebpackPlugin = require('html-webpack-plugin');

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
            filename: `${entryName}.html`
        }))
    });
    return {
        entries,
        plugins
    }
}

module.exports = {
    getPath,
    buildEntriesAndHtmlWebpackPlugins
};