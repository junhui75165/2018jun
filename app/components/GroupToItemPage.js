/**
 * Created by junhui on 2017/5/19.
 */
(function () {
    'use strict';
    let React = require('react');
    let { Card,} = require('antd');
    let GroupToItem = require('./GroupToItem');
    class GroupToItemPage extends React.Component{
        render() {
            return (
                <div className="gen-certificate">
                    <Card title={<h1 className="certificate-title">整个科目组转换为一个科目</h1>}
                          bordered={true}>
                        <GroupToItem/>
                    </Card>
                </div>
            );
        }

    }
    module.exports = GroupToItemPage;
})();