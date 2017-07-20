/**
 * @author chenjiancai
 * @time 2017-07-20
 */
import './index.less';

import axios from 'axios';

axios.post('/api.php', {
    service: 'login',
    username: 'chenjiancai',
    password: ''
}).then(function () {
}, function () {
});