let util = require('./util');
let fs = require('fs');
let path = require('path');
let Metalsmith = require('metalsmith');
let ask = require('./page_questions');
let chalk = require('chalk');
let ora = require('ora');
let os = require('os');
let moment = require('moment');
let inquirer = require('inquirer');

let spinner = null;
let initConfigs = {};

//create page
module.exports = function (projectPath, cliPath, pageName) {
    util.checkIsSbrProject(projectPath).then(function () {
        let pagePath = path.join(projectPath, 'src', 'app', pageName);
        let projectName = path.basename(projectPath);
        pageExist(pagePath).then(function () {
            createPage(pagePath, cliPath, projectName, pageName);
        }, function () {
            inquirer.prompt([{
                type: 'confirm',
                name: 'ok',
                message: `目录 <${pageName}> 已经存在，确认后将清空目录，是否继续?`,
                default: true
            }]).then(function (answers) {
                if (answers.ok) {
                    createPage(pagePath, cliPath, projectName, pageName);
                } else {
                    console.log(chalk.red(`create page <${pageName}> stopped`))
                }
            })
        })
    }, function () {
        console.log(chalk.red(`当前目录不是saber工程，停止创建页面 <${pageName}>`));
    })
};

//check page exist

function pageExist(pagePath) {
    return new Promise(function (resolve, reject) {
        fs.stat(pagePath, function (error) {
            if (error) {
                resolve();
            } else {
                reject();
            }
        })
    })
}

// create page
function createPage(pagePath, cliPath, projectName, pageName) {
    spinner = ora(`creating <${pageName}> project`);
    Metalsmith(path.join(cliPath, 'templates/page'))
        .source('.') //默认是src，需要设置为template
        .use(askQuestions({
            pageTitle: pageName,
        }, function (answers) {
            initConfigs = Object.assign({}, answers, {
                create_time: moment().format('YYYY-MM-DD'),
                author: os.userInfo().username,
                pageName
            });

        }))
        .use(util.renderTemplateFile(function () {
            return initConfigs
        }))
        .use(function (files, metalsmith, done) {
            spinner.start();
            done();
        })
        .destination(pagePath)
        .build(function (error) {
            if (error) {
                spinner.fail(`create page <${pageName}>`);
                spinner.stop();
                throw error;
            }
            spinner.succeed(`create page <${pageName}>`);
            console.log(chalk.red(`请停止已经运行的服务器(如果有运行的话),在终端执行'sbr run ${pageName}'`))
            spinner.stop()
        });
}


//questions for page info
function askQuestions(defaultOptions, callback) {
    return function (files, metalsmith, done) {
        ask(defaultOptions).then(function (answers) {
            callback(answers);
            done();
        })
    }
}