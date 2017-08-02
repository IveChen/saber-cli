let fs = require('fs');
let path = require('path');
let consolidate = require('consolidate');
let async = require('async');
let net = require("net");

//check process folder is saber project
function checkIsSbrProject(projectPath) {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(projectPath, 'package.json'), function (error, data) {
            if (!error) {
                data = data.toString();
                try {
                    data = JSON.parse(data);
                    if (data.saber) {
                        resolve();
                        return;
                    }
                } catch (error) {

                }
            }
            reject();
        });
    })
}

function renderTemplateFile(getConfig) {
    return function (files, metalsmith, done) {
        let keys = Object.keys(files);
        async.each(keys, function (file, next) {
            let str = files[file].contents.toString();
            if (!/{{([^{}]+)}}/g.test(str)) {
                return next()
            }
            consolidate.twig.render(str, getConfig(), function (error, res) {
                if (error) {
                    error.message = `[${file}] ${error.message}`;
                    return next(error);
                }
                files[file].contents = res;
                next();
            });
        }, done);
    }
}


function checkPortValid(port) {
    return new Promise((resolve, reject) => {
        let server = net.createServer().listen(port)

        server.on('listening', function () {
            server.close();
            resolve();
        });

        server.on('error', function (err) {
            if (err.code === 'EADDRINUSE') {
                reject();
            }
        });
    });
}

module.exports = {
    checkIsSbrProject,
    renderTemplateFile,
    checkPortValid
};