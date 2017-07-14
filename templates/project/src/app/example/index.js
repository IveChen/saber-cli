import './index.less';

import Vue from 'vue';
import HelloWorld from './index.vue';

// vue loader test
new Vue({
    el: "#app",
    components: {
        HelloWorld
    }
});

//babel-loader test
const text = 'example';
console.log(text);