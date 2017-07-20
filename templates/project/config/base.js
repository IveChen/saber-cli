module.exports = {
    //the tag and attribute which asset defined. see https://github.com/webpack-contrib/html-loader#advanced-options
    htmlAssets: ['script:src', 'img:src', 'link:href'],
    //post-css
    postCss: {
        //see https://github.com/postcss/autoprefixer#browsers and https://github.com/ai/browserslist#queries
        browsers: ["ie >= 9", "last 2 versions"],
        rem: true,
    }
};