//source core https://github.com/eoin/entry-loader
//modify to change some error.

let SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin');
let utils = require('loader-utils');
let path = require('path');
let slash = require('slash');

module.exports = function () {
    // ...
};

module.exports.pitch = function (request) {
    this.addDependency(request);
    var query = utils.getOptions(this);
    var compiler = createCompiler(this, request, {
        filename: query.name,
        projectPath: query.projectPath
    });
    runCompiler(compiler, this.async());
};

function runCompiler(compiler, callback) {
    compiler.runAsChild(function (error, entries) {
        if (error) {
            callback(error);
        } else if (entries[0]) {
            var url = entries[0].files[0];
            callback(null, getSource(url));
        } else {
            callback(null, null);
        }
    });
}

function createCompiler(loader, request, options) {
    var entryName = loader.resourcePath.replace(path.join(options.projectPath, 'src', 'app',), '').replace(/\.js/, '');
    entryName = slash(entryName).replace('/','').replace(/\//g, '_');
    var compiler = getCompilation(loader).createChildCompiler('entry', options);
    var plugin = new SingleEntryPlugin(loader.context, '!!' + request, entryName);
    compiler.apply(plugin);
    var subCache = 'subcache ' + __dirname + ' ' + request;
    compiler.plugin('compilation', function (compilation) {
        if (!compilation.cache) {
            return;
        }
        if (!compilation.cache[subCache]) {
            compilation.cache[subCache] = {};
        }
        compilation.cache = compilation.cache[subCache];
    });
    return compiler;
}

function getSource(url) {
    return 'module.exports = __webpack_public_path__ + ' + JSON.stringify(url);
}

function getCompilation(loader) {
    return loader._compilation;
}
