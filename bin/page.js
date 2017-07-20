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
                message: `page <${pageName}> is already exist,continue will remove it. continue?`,
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
        console.log(chalk.red(`it's not in a saber project,create page <${pageName}> stopped`));
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
            console.log(chalk.red(`please run 'sbr run' again.`))
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