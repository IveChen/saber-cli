let inquirer = require('inquirer');
module.exports = function (defaultOptions) {
    return inquirer.prompt([{
        name: 'pageTitle',
        message: `page title`,
        default: defaultOptions.pageTitle
    }]);
};