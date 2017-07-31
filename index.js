#! /usr/bin/env node

let program = require('commander');
let path = require('path');
let fs = require('fs');
let inquirer = require('inquirer');
let chalk = require('chalk');

let config = require('./package.json');
let cmdInit = require('./bin/init');
let cmdPage = require('./bin/page');
let cmdRun = require('./bin/run');
let cmdBuild = require('./bin/build');

program.allowUnknownOption();
program.version(config.version);

//init project command
program.command('init')
    .description('在当前目录初始化创建工程')
    .action(function () {
        let projectPath = process.cwd();
        let projectName = path.basename(projectPath);
        fs.readdir(projectPath, function (error, files) {
            if (error) throw error;
            if (files.length) {
                inquirer.prompt([{
                    type: 'confirm',
                    name: 'ok',
                    message: `目录 <${projectName}> 不为空，继续将清空目录，是否继续?`,
                    default: true
                }]).then(function (answers) {
                    if (answers.ok) {
                        cmdInit(projectPath, __dirname, projectName);
                    } else {
                        console.log(chalk.red(`停止创建工程 <${projectName}>`))
                    }
                })
            } else {
                cmdInit(projectPath, __dirname, projectName);
            }
        });
    })
    .on('--help', function () {
        console.log('');
        console.log('示例 :');
        console.log(chalk.grey('sbr init'));
    });

//create project command
program.command('create <projectName>')
    .description('在当前目录创建子目录 <projectName> 并初始化工程')
    .action(function (projectName) {
        let projectPath = path.join(process.cwd(), projectName);
        fs.stat(projectPath, function (error, stats) {
            if (error) {
                cmdInit(projectPath, __dirname, projectName)
            } else {
                inquirer.prompt([{
                    type: 'confirm',
                    name: 'ok',
                    message: `目录 <${projectName}> 不为空，继续将清空目录，是否继续?`,
                    default: true
                }]).then(function (answers) {
                    if (answers.ok) {
                        cmdInit(projectPath, __dirname, projectName);
                    } else {
                        console.log(chalk.red(`停止创建工程 <${projectName}>`))
                    }
                })
            }
        });
    })
    .on('--help', function () {
        console.log('');
        console.log('示例 :');
        console.log(chalk.grey('sbr create hello-world'));
    });

//add page command
program.command('add-page <pageName>')
    .description('添加页面<pageName>到工程目录下的 src/app/<pageName>')
    .alias('page')
    .action(function (pageName) {
        cmdPage(process.cwd(), __dirname, pageName)
    })
    .on('--help', function () {
        console.log('');
        console.log('示例 :');
        console.log(chalk.grey('sbr page user/list'));
    });

// run page

program.command('run [pageName]')
    .description('运行服务器，并启动打开页面 [pageName]')
    .action(function (pageName) {
        cmdRun(process.cwd(), __dirname, pageName)
    })
    .on('--help', function () {
        console.log('');
        console.log('示例 :');
        console.log(chalk.grey('sbr run user/list'));
        console.log(chalk.grey('sbr run'))
    });

program.command('build')
    .description('build 工程')
    .action(function () {
        cmdBuild(process.cwd(), __dirname)
    })
    .on('--help', function () {
        console.log('');
        console.log('示例 :');
        console.log(chalk.grey('sbr build'));
    });

//show help message when run sbr -h
program.on('--help', function () {
    console.log('');
    console.log('  Version:');
    console.log(chalk.green(`    ${config.version}`));
    console.log('');
    console.log('  Helps:');
    console.log(chalk.green('    想知道命令的具体详情请运行'), chalk.grey('sbr [command] --help'));
    console.log(chalk.green('    例如:'), chalk.grey('sbr init --help'));
    console.log('')
});

program.parse(process.argv);
