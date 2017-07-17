module.exports = {
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
    port: 9091,
    //the tag and attribute which asset defined. see https://github.com/webpack-contrib/html-loader#advanced-options
    //should sync update to prod.config.js
    htmlAssets: ['script:src', 'img:src', 'link:href']
};