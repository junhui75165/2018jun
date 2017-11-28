/**
 * Created by junhui on 2017/5/17.
 */
(function () {
    'use strict';
    let React = require('react');
    let { Card,Col, Row,Switch} = require('antd');
    let RootContent = require('./RootContent');
    class RootSetting extends React.Component{
        render() {
            return (
                <div className="gen-certificate">
                    <Card title={<h1 className="certificate-title">权限设置</h1>}
                          bordered={true}>
                        <RootContent/>
                    </Card>
                </div>
            );
        }

    }
    module.exports = RootSetting;

})();