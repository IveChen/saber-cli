let baseConfig = require('./base.js');

module.exports = Object.assign(baseConfig, {
    //代理服务器配置
    //更多配置细节参考 https://github.com/chimurai/http-proxy-middleware#http-proxy-options
    proxyTables: {
        // '/login': {
        //     target: 'http://www.example.com',
        //     changeOrigin: true
        // }
    },
    //开发服务器运行时默认打开的浏览器页面
    home: 'example',
    //开发服务器运行时的端口号
    port: 9091
});