let chalk = require('chalk');
let Metalsmith = require('metalsmith');
let path = require('path');
let ora = require('ora');
let shell = require('shelljs');
let moment = require('moment');
let Promise = require('bluebird');

let util = require('./util');
let ask = require('./init_questions');


let initConfigs = {};
let spinner = null;

//generate project with template
module.exports = function (projectPath, cliPath, projectName) {
    spinner = ora(`creating <${projectName}> project`);
    Metalsmith(path.join(cliPath, 'templates/project'))
        .source('.') //默认是src，需要设置为template
        .use(askQuestions({
            projectName,
            version: '1.0.0',
            description: `this is ${projectName} project`,
            author: ''
        }, function (answers) {
            initConfigs = answers;
            initConfigs.create_time = moment().format('YYYY-MM-DD');
        }))
        .use(util.renderTemplateFile(function () {
            return initConfigs;
        })) //渲染模板
        .use(function (files, metalsmith, done) {
            spinner.start();
            done();
        })
        .destination(projectPath)
        .build(function (error) {
            if (error) {
                spinner.fail(`copy template to <${projectName}> project`);
                throw error;
            }
            spinner.succeed(`copy template to <${projectName}> project`);
            installDependencies(projectPath, projectName);
        });
};

//install npm package method

function installNpmPackage(packName, flag = '') {
    return new Promise((resolve, reject) => {
        spinner.start(`installing ${packName}`);
        shell.exec(`npm install ${packName} ${flag}`, {silent: true}, function (code, stdout, stderror) {
            if (code === 0) {
                spinner.succeed(`install ${packName} ${flag}`);
                resolve();
            } else {
                spinner.fail(`install ${packName} ${flag}`);
                reject(packName, stdout, stderror);
            }
        })
    })
}

//install some npm dependencies
function installDependencies(projectPath, projectName) {
    const packages = [{
        name: 'vue',
        flag: '--save'
    }, {
        name: 'vue-template-compiler',
        flag: '--save-dev'
    }];
    if (packages.length) {
        spinner.start(chalk.grey('install npm packages'));
        spinner.stopAndPersist();
        Promise.reduce(packages, (currentPackage, nextPackage, index) => {
            return new Promise((resolve, reject) => {
                currentPackage = packages[index];
                nextPackage = packages[index + 1];
                installNpmPackage(currentPackage.name, currentPackage.flag).then(function () {
                    resolve(nextPackage);
                }, function () {
                    reject(nextPackage);
                })
            }).then(package => {
                return package;
            });
        }, 0).then(function () {
                spinner.succeed(`create <${projectName}> project at ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
                spinner.stop();
                showHelpMessage(projectName);
            }, function (packName, code, stderror) {
                let runInfo = packages.map(function (package) {
                    return `npm install ${package.name} ${package.flag}`
                }).join(',');
                spinner.fail(`create <${projectName}> project ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
                spinner.stop();
                console.log(chalk.red('install error.'))
                console.log(chalk.red('you can run command below with terminal:'));
                console.log(chalk.grey(`\tcd ${projectPath}`));
                console.log(chalk.grey(`\t${runInfo}`));
                console.log('')
            }
        )
    } else {
        spinner.succeed(`create <${projectName}> project at ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
        spinner.stop();
        showHelpMessage(projectName);
    }
}

//create done and show help message

function showHelpMessage(projectName) {
    console.log(``)
    console.log(chalk.green(`DONE!`));
    console.log(chalk.green(`run `), chalk.grey('sbr run'), chalk.green('to start this project'));
    console.log(chalk.green(`run `), chalk.grey('sbr -h'), chalk.green('for more commands'));
}
//questions for project info
function askQuestions(defaultOptions, callback) {
    return function (files, metalsmith, done) {
        ask(defaultOptions).then(function (answers) {
            callback(answers);
            done();
        })
    }
}