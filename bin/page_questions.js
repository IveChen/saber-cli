let inquirer = require('inquirer');
module.exports = function (defaultOptions) {
    return inquirer.prompt([{
        name: 'title',
        message: `page title`,
        default: defaultOptions.pageTitle
    }]);
};