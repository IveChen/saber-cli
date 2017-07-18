let express = require('express');
let webpack = require('webpack');
let chalk = require('chalk');
let path = require('path');
let ora = require('ora');
let merge = require('webpack-merge');
let moment = require('moment');

let util = require('../util');
let getBaseConfig = require('../webpack.base');

function start(devConfig, options) {
    let spinner = ora();
    process.env.NODE_ENV = 'development';
    spinner.start('starting server');
    let app = express();
    let compiler = webpack(generateDevConfig(devConfig, options));
    let devMiddleware = require('webpack-dev-middleware')(compiler, {
        publicPath: '/',
        noInfo: true
    });

    let hotMiddleware = require('webpack-hot-middleware')(compiler, {
        log (message){
            if (message.indexOf('built') > -1) {
                //build success
                spinner.succeed(`${chalk.red(moment().format('hh:mm:ss:SSS'))}: ${message}`);
                hotMiddleware.publish({action: 'reload'});
            } else {
                spinner.start(message);
            }
        }
    });


    devConfig.port = devConfig.port || 8081;

    app.use(require('connect-history-api-fallback')());

    spinner.start('enable webpack dev server');

    app.use(devMiddleware);
    spinner.succeed('enable webpack dev server');

    spinner.start('enable webpack hot reload module');

    app.use(hotMiddleware);
    spinner.succeed('enable webpack hot reload module');

    spinner.start('starting express server');

    compiler.plugin('compilation', function (compilation) {
        compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
            // hotMiddleware.publish({action: 'reload'});
            cb();
        });
    });

    devMiddleware.waitUntilValid(() => {
        spinner.succeed('webpack bundle first time.');
        spinner.start('opening browser');
        let homePage = options.pageName ? options.pageName : devConfig.home;
        if (homePage) {
            let uri = `http://localhost:${devConfig.port}/${homePage}.html`
            require('opn')(uri);
            spinner.succeed('auto open browser with page ' + chalk.grey(uri));
        } else {
            spinner.fail(`attribute "home"  in ${chalk.red(path.join(options.projectPath, 'config', 'dev.config.js'))} is undefined`);
            console.log(`please manually run `, chalk.grey(`http://localhost:${devConfig.port}`));
        }
    });
    app.listen(devConfig.port, function () {
        spinner.succeed('start express server at port ' + chalk.grey(devConfig.port) + '');
        spinner.start('webpack bundle first time');
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