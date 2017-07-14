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
            console.log(chalk.red(`config file ${projectPath}/config/prod.config.js not found. build stopped.`));
        })
    }, function () {
        console.log(chalk.red(`it's not in a saber project,build command stopped`));

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