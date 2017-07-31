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


let initProjectConfig = {};
let spinner = null;


const packages = [{
    name: 'axios',
    flag: '--save'
}, {
    name: 'css-loader',
    flag: '--save-dev'
}, {
    name: 'mockjs',
    flag: '--save-dev'
}, {
    name: 'underscore-template-loader',
    flag: '--save-dev'
}, {
    name: 'lodash',
    flag: '--save-dev'
}];
const vuePackages = [{
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

const reactPackages = [{
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

function getCommonChunks(packages) {
    return packages.filter(function (pkg) {
        return pkg.flag === '--save';
    }).map(function (pkg) {
        return pkg.name
    });
}

//generate project with template
module.exports = function (projectPath, cliPath, projectName) {
    let initAnswers = {};
    spinner = ora(`正在创建 <${projectName}> 工程`);
    del(path.join(projectPath, '**'), {dryRun: true, force: true}).then((paths) => {
        Metalsmith(path.join(cliPath, 'templates/project'))
            .source('.') //默认是src，需要设置为template
            .use(askQuestions({
                projectName,
                version: '1.0.0',
                description: `这是${projectName}工程`,
                author: ''
            }, function (answers) {
                initProjectConfig = Object.assign({}, answers, {
                    create_time: moment().format('YYYY-MM-DD')
                });
                initAnswers = Object.assign({}, answers);
                initProjectConfig.vue = answers.frameworks.indexOf('vue') > -1;
                initProjectConfig.react = answers.frameworks.indexOf('react') > -1;
                if (initProjectConfig.vue) {
                    initProjectConfig.vueCommonChunks = JSON.stringify(getCommonChunks(vuePackages));
                }
                if (initProjectConfig.react) {
                    initProjectConfig.reactCommonChunks = JSON.stringify(getCommonChunks(reactPackages));
                }
                initProjectConfig.baseCommonChunks = JSON.stringify(getCommonChunks(packages));
            }))
            .use(util.renderTemplateFile(function () {
                return initProjectConfig;
            })) //渲染模板
            .use(function (files, metalsmith, done) {
                spinner.start();
                done();
            })
            .destination(projectPath)
            .build(function (error) {
                if (error) {
                    spinner.fail(`复制模板到 <${projectName}> 工程`);
                    throw error;
                }
                spinner.succeed(`复制模板到 <${projectName}> 工程`);
                spinner.start(`正在复制examples`);
                copyExamples(projectPath, cliPath).then(function () {
                    spinner.succeed(`复制examples`);
                    installDependencies(projectPath, projectName, initAnswers);
                });
            });
    })
};

//install npm package method

function installNpmPackage(packName, flag = '') {
    return new Promise((resolve, reject) => {
        spinner.start(`npm正在安装${packName}包`);
        shell.exec(`npm install ${packName} ${flag}`, {silent: true}, function (code, stdout, stderror) {
            if (code === 0) {
                spinner.succeed(`npm install ${packName} ${flag}`);
                resolve();
            } else {
                spinner.fail(`npm install ${packName} ${flag}`);
                reject(packName, stdout, stderror);
            }
        })
    })
}

//install some npm dependencies
function installDependencies(projectPath, projectName, answers) {
    let finalPackages = [...packages];
    if (initProjectConfig.vue) {
        finalPackages = [...finalPackages, ...vuePackages];
    }
    if (initProjectConfig.react) {
        finalPackages = [...finalPackages, ...reactPackages];
    }
    if (finalPackages.length) {
        spinner.start(chalk.grey(`为工程${answers.frameworks.length ? '和框架' + answers.frameworks : '' } 安装依赖`));
        spinner.stopAndPersist();
        Promise.reduce(finalPackages, (currentPackage, nextPackage, index) => {
            return new Promise((resolve, reject) => {
                currentPackage = finalPackages[index];
                nextPackage = finalPackages[index + 1];
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
                console.log(chalk.grey('如果需要更多的依赖包，请到工程目录手动使用npm安装'));
                showHelpMessage(projectName);
            }, function (packName, code, stderror) {
                let runInfo = finalPackages.map(function (package) {
                    return `npm install ${package.name} ${package.flag}`
                }).join(',');
                spinner.fail(`create <${projectName}> project ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
                spinner.stop();
                console.log(chalk.red('安装错误.'));
                console.log(chalk.red('你可以在终端运行一下命令手动安装:'));
                console.log(chalk.grey(`\tcd ${projectPath}`));
                console.log(chalk.grey(`\t${runInfo}`));
                console.log('')
            }
        )
    } else {
        console.log(chalk.grey('0依赖包需要安装，更多的依赖包请前往工程目录手动使用npm进行安装'))
        spinner.succeed(`create <${projectName}> project at ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
        spinner.stop();
        showHelpMessage(projectName);
    }
}

//create done and show help message

function showHelpMessage(projectName) {
    console.log(``);
    console.log(chalk.green(`完成!`));
    console.log(chalk.green(`运行 `), chalk.grey('sbr run'), chalk.green('进行开发'));
    console.log(chalk.green(`运行 `), chalk.grey('sbr build'), chalk.green('进行编译'));
    console.log(chalk.green(`运行 `), chalk.grey('sbr -h'), chalk.green('查看更多命令'));
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

function copyExamples(projectPath, cliPath) {
    return new Promise((resolve, reject) => {
        Metalsmith(path.join(cliPath, 'templates/example'))
            .source(".")
            .use(util.renderTemplateFile(function () {
                return initProjectConfig;
            }))
            .ignore(function (path) {
                let ignoreFlag = false;
                if (!initProjectConfig.vue) {
                    ignoreFlag = ignoreFlag || path.indexOf('vue') > -1;
                }
                if (!initProjectConfig.react) {
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