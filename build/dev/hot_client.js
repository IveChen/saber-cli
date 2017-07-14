/* eslint-disable */
require('eventsource-polyfill');
let hotClient = require('webpack-hot-middleware/client?reload=true&noInfo=true');
hotClient.subscribe(function (event) {
    if (event.action === 'reload') {
        window.location.reload()
    }
});