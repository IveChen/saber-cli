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
    .description('init project in current folder')
    .action(function () {
        let projectPath = process.cwd();
        let projectName = path.basename(projectPath);
        fs.readdir(projectPath, function (error, files) {
            if (error) throw error;
            if (files.length) {
                inquirer.prompt([{
                    type: 'confirm',
                    name: 'ok',
                    message: `folder <${projectName}> is not empty,continue will clean files and folders. continue?`,
                    default: true
                }]).then(function (answers) {
                    if (answers.ok) {
                        cmdInit(projectPath, __dirname, projectName);
                    } else {
                        console.log(chalk.red(`create <${projectName}> project stopped`))
                    }
                })
            } else {
                cmdInit(projectPath, __dirname, projectName);
            }
        });
    })
    .on('--help', function () {
        console.log('');
        console.log('Example :');
        console.log(chalk.grey('sbr init'));
    });

//create project command
program.command('create <projectName>')
    .description('create <projectName> project in current folder')
    .action(function (projectName) {
        let projectPath = path.join(process.cwd(), projectName);
        fs.stat(projectPath, function (error, stats) {
            if (error) {
                cmdInit(projectPath, __dirname, projectName)
            } else {
                inquirer.prompt([{
                    type: 'confirm',
                    name: 'ok',
                    message: `folder <${projectName}> is not empty,continue will clean files and folders. continue?`,
                    default: true
                }]).then(function (answers) {
                    if (answers.ok) {
                        cmdInit(projectPath, __dirname, projectName);
                    } else {
                        console.log(chalk.red(`create <${projectName}> project stopped`))
                    }
                })
            }
        });
    })
    .on('--help', function () {
        console.log('');
        console.log('Example :');
        console.log(chalk.grey('sbr create testProject'));
    });

//add page command
program.command('add-page <pageName>')
    .description('add <pageName> page to src/app/<pageName>')
    .alias('page')
    .action(function (pageName) {
        cmdPage(process.cwd(), __dirname, pageName)
    })
    .on('--help', function () {
        console.log('');
        console.log('Example :');
        console.log(chalk.grey('sbr page user/list'));
    });

// run page

program.command('run [pageName]')
    .description('run project with [pageName] page')
    .action(function (pageName) {
        cmdRun(process.cwd(), __dirname, pageName)
    })
    .on('--help', function () {
        console.log('');
        console.log('Example :');
        console.log(chalk.grey('sbr run user/list'));
        console.log(chalk.grey('sbr run'))
    });

program.command('build')
    .description('build project')
    .action(function () {
        cmdBuild(process.cwd(), __dirname)
    })
    .on('--help', function () {
        console.log('');
        console.log('Example :');
        console.log(chalk.grey('sbr build'));
    });

//show help message when run sbr -h
program.on('--help', function () {
    console.log('');
    console.log('  Version:');
    console.log(chalk.green(`    ${config.version}`));
    console.log('');
    console.log('  Helps:');
    console.log(chalk.green('    for more details run'), chalk.grey('sbr [command] --help'));
    console.log(chalk.green('    eg:'), chalk.grey('sbr init --help'));
    console.log('')
});

program.parse(process.argv);
