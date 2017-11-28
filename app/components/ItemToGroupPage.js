/**
 * Created by junhui on 2017/5/19.
 */
(function () {
    'use strict';
    let React = require('react');
    let { Card,} = require('antd');
    let ItemToGroup = require('./ItemToGroup');
    class ItemToGroupPage extends React.Component{
        render() {
            return (
                <div className="gen-certificate">
                    <Card title={<h1 className="certificate-title">科目转换为科目组</h1>}
                          bordered={true}>
                        <ItemToGroup/>
                    </Card>
                </div>
            );
        }

    }
    module.exports = ItemToGroupPage;
})();