/**
 * Created by junhui on 2017/5/16.
 */
(function () {
    'use strict';
    let React = require('react');
    let { Card, Col, Row ,Button,} = require('antd');
    let AddAmo = require('./AddAmo');
    class AddAmortization extends React.Component{
        render() {
            return (
                <div className="gen-certificate">
                    <Card title={<h1 className="certificate-title">摊销项目录入</h1>}
                          bordered={true}>
                        <AddAmo/>
                    </Card>
                </div>
            );
        }

    }
    module.exports = AddAmortization;
})();