let inquirer = require('inquirer');
let os = require('os');
module.exports = function (defaultOptions) {
    return inquirer.prompt([{
        name: 'appName',
        message: `project name`,
        default: defaultOptions.projectName
    }, {
        name: 'version',
        message: `project version`,
        default: defaultOptions.version
    }, {
        name: 'description',
        message: `project descrition`,
        default: defaultOptions.description
    }, {
        name: 'author',
        message: `project author`,
        default: os.userInfo().username
    }, {
        name: 'frameworks',
        message: 'project main frameworks.(key space to choose)',
        type: 'checkbox',
        choices: [{
            value: 'vue',
            checked: true
        }, {
            value: 'react'
        }]
    }]);
};