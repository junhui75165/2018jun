/**
 * Created by junhui on 2017/5/15.
 */
(function () {
    'use strict';
    let React = require('react');
    let { Card, Col, Row ,Button,} = require('antd');
    let Defend = require('./Defend');
    class DefendAmortization extends React.Component{
        render() {
            return (
                <div className="gen-certificate">
                    <Card title={<h1 className="certificate-title">摊销类型维护</h1>}
                          bordered={true}>
                        <Defend/>
                    </Card>
                </div>
            );
        }

    }
    module.exports = DefendAmortization;
})();