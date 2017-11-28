/**
 * Created by junhui on 2017/6/21.
 */
(function () {
    'use strict';
    let React = require('react');
    let { Card, } = require('antd');
    let ManageAnnex = require('./ManageAnnex');
    class ManageAnnexPage extends React.Component{
        render() {
            return (
                <div className="gen-certificate">
                    <Card title={<h1 className="certificate-title">附件管理</h1>}
                          bordered={true}>
                        <ManageAnnex/>
                    </Card>
                </div>
            );
        }

    }
    module.exports = ManageAnnexPage;
})();