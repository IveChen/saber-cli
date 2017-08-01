module.exports = {
    /**
     * 定义资源的标签和属性
     * 配置细节参考 https://github.com/webpack-contrib/html-loader#advanced-options
     */
    htmlAssets: ['script:src', 'img:src', 'link:href'],
    postCss: {
        /**
         * autoprefixer 浏览器配置
         * 配置细节参考 https://github.com/postcss/autoprefixer#browsers 和 https://github.com/ai/browserslist#queries
         */
        browsers: ["last 4 version","ie > 8"],
        //是否将px转换成rem.适用于ie9+的项目
        rem: true,
    },
    /**
     *  配置vendors
     *  [project] 将会替换为实际的目录路径.
     **/
    vendors: [
        {
            name:'base_vendors',
            dependencies: {{baseCommonChunks}}//['axios','[project]/src/assets/scripts/base.js','[project]/src/assets/scripts/util.js']
        },
{% if vue==true %}
        {
            name:'vue_vendors',
            dependencies:{{vueCommonChunks}}
        },
{% endif %}
{% if react== true %}
        {
            name:'react_vendors',
            dependencies:{{reactCommonChunks}}
        },
{% endif %}
    ]
};