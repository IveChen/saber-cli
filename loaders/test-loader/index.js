module.exports = function (source, map) {
    console.log('test-loader', this.resourcePath, source);
    return source;
};