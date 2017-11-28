/**
 * Created by junhui on 2017/5/12.
 */
(function () {
    'use strict';
    let React = require('react');
    let { Card, Col, Row ,Button,} = require('antd');
    let Assets = require('./Assets');
    class FixedAssets extends React.Component{
        render() {
            return (
                <div className="gen-certificate">
                    <Card title={<h1 className="certificate-title">固定资产录入</h1>}
                          bordered={true}>
                        <Assets/>
                    </Card>
                </div>
            );
        }
    }
    module.exports = FixedAssets;
})();