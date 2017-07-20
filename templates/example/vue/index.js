/**
 * @author chenjiancai
 * @time 2017-07-18
 */
import './index.less';

import App from './index.vue';
import Vue from 'vue';

new Vue({
    el:'#example',
    render (h){
        return h(App)
    }
})