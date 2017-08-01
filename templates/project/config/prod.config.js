let baseConfig = require('./base.js');

module.exports = Object.assign(baseConfig, {
    //打包目录默认在dist下面
    //pagePath表示页面打包的dist下面的什么目录，
    //如果需要直接打包到dist下面，则为空
    pagePath: 'views',
    //assetPath 表示资源打包到dist下面的什么目录
    //如果需要直接打包到dist下面，则为空
    assetPath: 'assets',
    //在产品环境，页面如何访问静态资源，正常情况下为 '/'+assetPath 但不排除某些服务器放置静态资源的位置跟打包路径没有什么必然联系。
    publicPath: '/assets'
});