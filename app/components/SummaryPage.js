/**
 * Created by junhui on 2017/5/22.
 */
(function () {
    'use strict';
    let React = require('react');
    let { Card, } = require('antd');
    let Summary = require('./Summary');
    class SummaryPage extends React.Component{
        render() {
            return (
                <div className="gen-certificate">
                    <Card title={<h1 className="certificate-title">常用摘要维护</h1>}
                          bordered={true}>
                        <Summary/>
                    </Card>
                </div>
            );
        }

    }
    module.exports = SummaryPage;
})();