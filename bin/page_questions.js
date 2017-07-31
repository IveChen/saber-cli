let inquirer = require('inquirer');
module.exports = function (defaultOptions) {
    return inquirer.prompt([{
        name: 'pageTitle',
        message: `页面标题`,
        default: defaultOptions.pageTitle
    }]);
};