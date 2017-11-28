/**
 * Created by junhui on 2017/6/20.
 */
(function () {
    'use strict';
    let React = require('react');
    let { Card, } = require('antd');
    let UserInfo = require('./UserInfo');
    class UserInfoPage extends React.Component{
        render() {
            return (
                <div className="gen-certificate">
                    <Card title={<h1 className="certificate-title">角色信息</h1>}
                          bordered={true}>
                        <UserInfo/>
                    </Card>
                </div>
            );
        }

    }
    module.exports = UserInfoPage;
})();