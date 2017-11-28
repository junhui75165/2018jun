/**
 * Created by junhui on 2017/9/4.
 */
(()=>{
    "use strict";
    let React = require('react');
    class LinkIframe extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                url:this.props.url,
            }
        }

        componentWillReceiveProps(nextProps, nextContext) {
            this.setState({
                url:nextProps.url
            })
        }

        render() {
            return (
                <div style={{width:'100%',height:'100%',overflow:'hidden'}}>
                    <iframe width='100%' height='100%'
                            src={this.state.url} >
                    </iframe>
                </div>
            );
        }

    }
    module.exports = LinkIframe;
})();