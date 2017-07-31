let path = require('path');
let chalk = require('chalk');
let fs = require('fs');

let server = require('../build/dev/server');


let util = require('./util');

module.exports = function (projectPath, cliPath, pageName) {
    util.checkIsSbrProject(projectPath).then(function () {
        let projectName = path.basename(projectPath);
        readDevConfig(projectPath).then(function (devConfig) {
            server.start(devConfig, {
                projectName,
                projectPath,
                cliPath,
                pageName
            });
        }, function () {
            console.log(chalk.red(`未能找到配置文件 ${projectPath}/config/dev.config.js.停止运行开发服务器`))
        })
    }, function () {
        console.log(chalk.red(`当前目录不是saber工程，停止运行开发服务器`));
    })
};

//read <project>/config/dev.config.js

function readDevConfig(projectPath) {
    return new Promise((resolve, reject) => {
        let configPath = path.join(projectPath, 'config', 'dev.config.js');
        fs.stat(configPath, function (error, data) {
            if (error) {
                reject();
            } else {
                resolve(require(configPath));
            }
        })
    })
}