/**
 * Created by junhui on 2017/5/27.
 */
(function () {
    'use strict';
    let React = require('react');
    let { Card,} = require('antd');
    let AccountInit = require('./AccountInit');
    class AccountInitPage extends React.Component{
        render() {
            return (
                <div className="gen-certificate">
                    <Card title={<h1 className="certificate-title">{this.props.title}</h1>}
                          bordered={true}>
                        <AccountInit/>
                    </Card>
                </div>
            );
        }

    }
    module.exports = AccountInitPage;
})();