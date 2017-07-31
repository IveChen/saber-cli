let chalk = require('chalk');
let path = require("path");
let fs = require("fs");

let util = require('./util');
let build = require('../build/prod/build');

module.exports = function (projectPath, cliPath) {
    util.checkIsSbrProject(projectPath).then(function () {
        readProdConfig(projectPath).then(function (prodConfig) {
            build(prodConfig, {
                projectPath,
                cliPath
            });
        }, function () {
            console.log(chalk.red(`未能找到配置文件${projectPath}/config/prod.config.js.停止build`));
        })
    }, function () {
        console.log(chalk.red(`当前目录不是saber工程，停止build`));

    });
};


//read <project>/config/dev.config.js

function readProdConfig(projectPath) {
    return new Promise((resolve, reject) => {
        let configPath = path.join(projectPath, 'config', 'prod.config.js');
        fs.stat(configPath, function (error, data) {
            if (error) {
                reject();
            } else {
                resolve(require(configPath));
            }
        })
    })
}