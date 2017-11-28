/**
 * 备份和恢复路由页面
 * Created by junhui on 2017/7/3.
 */
(function () {
    'use strict';
    let React = require('react');
    let { Card,} = require('antd');
    let BackupAndRestore = require('./BackupAndRestore');
    class BackupAndRestorePage extends React.Component{
        render() {
            return (
                <div className="gen-certificate">
                    <Card title={<h1 className="certificate-title">备份和恢复</h1>}
                          bordered={true}>
                        <BackupAndRestore/>
                    </Card>
                </div>
            );
        }

    }
    module.exports = BackupAndRestorePage;
})();