/**
 * Created by junhui on 2017/5/15.
 */
(function () {
    'use strict';
    let React = require('react');
    let { Card, Col, Row ,Button,} = require('antd');
    let DefendFixed = require('./DefendFixed');

    class DefendFixedAssets extends React.Component{
        render() {
            return (
                <div className="gen-certificate">
                    <Card title={<h1 className="certificate-title">固定资产类型维护</h1>}
                          bordered={true}>
                        <DefendFixed/>
                    </Card>
                </div>
            );
        }

    }
    module.exports = DefendFixedAssets;
})();