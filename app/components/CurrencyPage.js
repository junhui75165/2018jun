/**
 * Created by junhui on 2017/5/18.
 */
(function () {
    'use strict';
    let React = require('react');
    let { Card,} = require('antd');
    let Currency = require('./Currency');
    class BankAccount extends React.Component{
        render() {
            return (
                <div className="gen-certificate">
                    <Card title={<h1 className="certificate-title">货币</h1>}
                          bordered={true}>
                        <Currency/>
                    </Card>
                </div>
            );
        }

    }
    module.exports = BankAccount;
})();