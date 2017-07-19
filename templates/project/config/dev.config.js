let baseConfig = require('./base.js');

module.exports = Object.assign(baseConfig, {
    proxyTables: [
        // {
        //     '/api': {
        //         target: 'http://api.example.com'
        //     }
        // }
    ],
    //the page which load when saber-cli open the browser
    home: 'example',
    //the port when saber-cli run devServer
    port: 9091
});