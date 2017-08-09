let express = require('express');
let webpack = require('webpack');
let chalk = require('chalk');
let path = require('path');
let ora = require('ora');
let fs = require('fs');
let merge = require('webpack-merge');
let moment = require('moment');

let util = require('../util');
let getBaseConfig = require('../webpack.base');

function start(devConfig, options) {
    let spinner = ora();
    process.env.NODE_ENV = 'development';
    spinner.start('准备运行开发服务器');
    let app = express();
    let compiler = webpack(generateDevConfig(devConfig, options));
    let devMiddleware = require('webpack-dev-middleware')(compiler, {
        publicPath: '/',
        noInfo: true
    });

    let throttleReloadEvent = util.throttle(function () {
        hotMiddleware.publish({action: 'reload'});
    }, 3000);

    let hotMiddleware = require('webpack-hot-middleware')(compiler, {
        log(message) {
            if (message.indexOf('built') > -1) {
                spinner.succeed(`${chalk.red(moment().format('hh:mm:ss:SSS'))}: ${message}`);
                throttleReloadEvent();
            } else {
                spinner.start(message);
            }
        }
    });


    devConfig.port = devConfig.port || 8081;

    app.use(require('connect-history-api-fallback')());

    spinner.start('加载webpack开发服务器模块');

    app.use(devMiddleware);
    spinner.succeed('加载webpack开发服务器模块');

    spinner.start('加载webpack热替换模块');

    app.use(hotMiddleware);
    spinner.succeed('加载webpack热替换模块');

    let proxyMiddleware = require('http-proxy-middleware');
    Object.keys(devConfig.proxyTables).forEach(function (target) {
        app.use(target, proxyMiddleware(target, devConfig.proxyTables[target]))
    });

    spinner.succeed('加载代理服务器模块');

    spinner.start('准备启动express服务器');

    compiler.plugin('compilation', function (compilation) {
        compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
            cb();
        });
    });

    devMiddleware.waitUntilValid(() => {
        spinner.succeed('执行webpack首次编译');
        spinner.start('opening browser');
        let homePage = options.pageName ? options.pageName : devConfig.home;
        if (homePage) {
            let uri = `http://localhost:${devConfig.port}/${homePage}.html`
            require('opn')(uri);
            spinner.succeed('已自动在浏览器打开页面 ' + chalk.grey(uri));
        } else {
            spinner.fail(` ${chalk.red(path.join(options.projectPath, 'config', 'dev.config.js'))} 文件中的属性'home'没有定义`);
            console.log(`请手动在浏览器运行页面 `, chalk.grey(`http://localhost:${devConfig.port}`));
        }
    });
    app.listen(devConfig.port, function () {
        spinner.succeed('在 ' + chalk.grey(devConfig.port) + ' 端口启动express服务器');
        spinner.start('正在执行webpack首次编译');
    });
}

function stop() {

}

function generateDevConfig(devConfig, options) {
    let webpackConfig = merge(getBaseConfig(devConfig, options), {
        devtool: '#cheap-module-eval-source-map',
        output: {
            publicPath: '/'
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': '"development"'
            }),
            new webpack.HotModuleReplacementPlugin()
        ]
    });

    // add hot-reload related code to entry chunks
    Object.keys(webpackConfig.entry).forEach(function (name) {
        webpackConfig.entry[name] = [path.join(options.cliPath, 'build', 'dev', 'hot_client.js')].concat(webpackConfig.entry[name])
    });

    return webpackConfig
}

module.exports = {
    start,
    stop
};