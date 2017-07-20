let baseConfig = require('./base.js');

module.exports = Object.assign(baseConfig, {
    //https://github.com/chimurai/http-proxy-middleware#http-proxy-options
    //proxy
    proxyTables: {
        // '/api.php': {
        //     target: 'http://www.example.com',
        //     changeOrigin: true
        // }
    },
    //the page which load when saber-cli open the browser
    home: 'example',
    //the port when saber-cli run devServer
    port: 9091
});