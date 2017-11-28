/**
 * Created by junhui on 2017/5/16.
 */
(function () {
    'use strict';
    let React = require('react');
    let { Card,Col, Row,Switch} = require('antd');
    let BankAcc = require('./BankAcc');
    class BankAccount extends React.Component{
        render() {
            return (
                <div className="gen-certificate">
                    <Card title={<h1 className="certificate-title">银行账户</h1>}
                          bordered={true}>
                        <BankAcc/>
                    </Card>
                </div>
            );
        }

    }
    module.exports = BankAccount;
})();