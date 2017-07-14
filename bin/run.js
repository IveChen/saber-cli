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
            console.log(chalk.red(`config file ${projectPath}/config/dev.config.js not found. run stopped.`))
        })
    }, function () {
        console.log(chalk.red(`it's not in a saber project,run command stopped`));
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