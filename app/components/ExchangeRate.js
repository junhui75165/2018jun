/**
 * Created by junhui on 2017/5/10.
 */
(function () {
    'use strict';
    let React = require('react');
    let { Card} = require('antd');
    let ChangeExchange = require('./ChangeExchange');
    class ExchangeRate extends React.Component{
        render() {
            return (
                <div className="gen-certificate">
                    <Card title={<h1 className="certificate-title">汇率</h1>}
                          bordered={true}>
                        <ChangeExchange/>
                    </Card>
                </div>
            );
        }
    }
    module.exports = ExchangeRate;
})();
