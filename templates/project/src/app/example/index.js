import './index.less';

import '../../assets/third-party/bootstrap/css/bootstrap.css'


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