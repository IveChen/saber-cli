let chalk = require('chalk');
let Metalsmith = require('metalsmith');
let path = require('path');
let ora = require('ora');
let shell = require('shelljs');
let moment = require('moment');
let Promise = require('bluebird');
let del = require('del');

let util = require('./util');
let ask = require('./init_questions');


let initConfigs = {};
let spinner = null;

//generate project with template
module.exports = function (projectPath, cliPath, projectName) {
    let initAnswers = {};
    let frameworkConfig = {};
    spinner = ora(`creating <${projectName}> project`);
    del(path.join(projectPath, '**'), {dryRun: true, force: true}).then((paths) => {
        Metalsmith(path.join(cliPath, 'templates/project'))
            .source('.') //默认是src，需要设置为template
            .use(askQuestions({
                projectName,
                version: '1.0.0',
                description: `this is ${projectName} project`,
                author: ''
            }, function (answers) {
                initConfigs = Object.assign({}, answers, {
                    create_time: moment().format('YYYY-MM-DD')
                });
                initAnswers = Object.assign({}, answers);
                frameworkConfig.vue = answers.frameworks.indexOf('vue') > -1;
                frameworkConfig.react = answers.frameworks.indexOf('react') > -1;
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
                spinner.start(`copy examples`);
                copyExamples(projectPath, cliPath, frameworkConfig).then(function () {
                    spinner.succeed(`copy examples`);
                    installDependencies(projectPath, projectName, initAnswers, frameworkConfig);
                });
            });
    })
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
function installDependencies(projectPath, projectName, answers, frameworkConfig) {
    let packages = [{
        name: 'axios',
        flag: '--save'
    }, {
        name: 'css-loader',
        flag: '--save-dev'
    }, {
        name: 'mockjs',
        flag: '--save'
    }, {
        name: 'underscore-template-loader',
        flag: '--save-dev'
    }, {
        name: 'lodash',
        flag: '--save-dev'
    }];
    let vuePackages = [{
        name: 'vue',
        flag: '--save'
    }, {
        name: 'vue-loader',
        flag: '--save-dev'
    }, {
        name: 'vue-template-compiler',
        flag: '--save-dev'
    }, {
        name: 'vue-router',
        flag: '--save'
    }, {
        name: 'vuex',
        flag: '--save'
    }];

    let reactPackages = [{
        name: 'react',
        flag: '--save'
    }, {
        name: 'redux',
        flag: '--save'
    }, {
        name: 'react-router',
        flag: '--save'
    }, {
        name: 'react-dom',
        flag: '--save'
    }];
    if (frameworkConfig.vue) {
        packages = [...packages, ...vuePackages];
    }
    if (frameworkConfig.react) {
        packages = [...packages, ...reactPackages];
    }
    if (packages.length) {
        spinner.start(chalk.grey(`install npm packages for ${answers.frameworks} frameworks`));
        spinner.stopAndPersist();
        Promise.reduce(packages, (currentPackage, nextPackage, index) => {
            return new Promise((resolve, reject) => {
                currentPackage = packages[index];
                nextPackage = packages[index + 1];
                shell.cd(projectPath);
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
                console.log(chalk.grey('more packages should manually install by npm yourself'));
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
        console.log(chalk.grey('0 package need to install.should manually install by npm yourself'))
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

function copyExamples(projectPath, cliPath, config) {
    return new Promise((resolve, reject) => {
        Metalsmith(path.join(cliPath, 'templates/example'))
            .source(".")
            .use(util.renderTemplateFile(function () {
                return config;
            }))
            .ignore(function (path) {
                let ignoreFlag = false;
                if (!config.vue) {
                    ignoreFlag = ignoreFlag || path.indexOf('vue') > -1;
                }
                if (!config.react) {
                    ignoreFlag = ignoreFlag || path.indexOf('react') > -1;
                }
                return ignoreFlag;
            })
            .destination(path.join(projectPath, 'src', 'app', 'example'))
            .build(function (error) {
                if (error) {
                    reject();
                    throw error
                }
                resolve();
            })
    })
}