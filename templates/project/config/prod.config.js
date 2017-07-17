module.exports = {
    publicPath: './',
    pageDist: '/dist',
    assetsPath: '/dist',
    //the tag and attribute which assets path defined. see https://github.com/webpack-contrib/html-loader#advanced-options
    //should sync update to prod.config.js
    htmlAssets: ['script:src', 'img:src', 'link:href']
};