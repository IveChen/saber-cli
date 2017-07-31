let inquirer = require('inquirer');
let os = require('os');
module.exports = function (defaultOptions) {
    return inquirer.prompt([{
        name: 'appName',
        message: `工程名`,
        default: defaultOptions.projectName
    }, {
        name: 'version',
        message: `工程版本`,
        default: defaultOptions.version
    }, {
        name: 'description',
        message: `工程描述`,
        default: defaultOptions.description
    }, {
        name: 'author',
        message: `开发人员`,
        default: os.userInfo().username
    }, {
        name: 'frameworks',
        message: '工程主框架',
        type: 'checkbox',
        choices: [{
            value: 'vue',
            checked: true
        }, {
            value: 'react'
        }]
    }]);
};