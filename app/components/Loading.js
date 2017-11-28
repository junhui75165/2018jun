/**
 * Created by junhui on 2017/4/14.
 */
(function () {
    'use strict';
    let React = require('react');
    let { Card, Spin    } = require('antd');
    class Loading extends React.Component{
        constructor(props){
            super(props);
        }

        render() {
            return (
                <div className="gen-certificate">
                    <Card title={<h1 className="certificate-title">{this.props.title}</h1>}
                          bordered={true}>
                        {/*<Spin tip="Loading..."/>*/}
                        <h2>欢迎使用谨信云会计系统。</h2>
                        <h3>{this.props.title}，功能暂未开放！</h3>
                    </Card>
                </div>
            );
        }
    }
    module.exports = Loading;

})();