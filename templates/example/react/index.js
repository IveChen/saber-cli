import './index.less';

import ReactDom from 'react-dom';
import React from 'react';

class HelloWorld extends React.Component{
    render (){
        return <h1>hello world ,i'm react components</h1>
    }
}

ReactDom.render(<div>
    <HelloWorld></HelloWorld>
</div>,document.getElementById('app'));