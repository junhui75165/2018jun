/**
 * Created by junhui on 2017/6/12.
 */
(function () {
    'use strict';
    let React = require('react');
    let { Card,} = require('antd');
    let CustomizeReport = require('./CustomizeReport');
    class CustomizeReportPage extends React.Component{
        render() {
            return (
                <div className="gen-certificate">
                    <Card title={<h1 className="certificate-title">自定义报表</h1>}
                          bordered={true}>
                        <CustomizeReport getAB={this.props.getAB.bind(this)}/>
                    </Card>
                </div>
            );
        }
    }
    module.exports = CustomizeReportPage;

})();