/**
 * Created by junhui on 2017/5/18.
 */
(function () {
    'use strict';
    let React = require('react');
    let { Card,} = require('antd');
    let MergeVoucher = require('./MergeVoucher');
    class MergeVoucherPage extends React.Component{
        render() {
            return (
                <div className="gen-certificate">
                    <Card title={<h1 className="certificate-title">合并凭证</h1>}
                          bordered={true}>
                        <MergeVoucher/>
                    </Card>
                </div>
            );
        }

    }
    module.exports = MergeVoucherPage;
})();