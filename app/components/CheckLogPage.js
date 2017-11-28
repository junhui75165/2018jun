/**
 * Created by junhui on 2017/6/6.
 */
(function () {
    'use strict';
    let React = require('react');
    let { Card,} = require('antd');
    let CheckLog = require('./CheckLog');
    class CheckLogPage extends React.Component{
        render() {
            return (
                <div className="gen-certificate">
                    <Card title={<h1 className="certificate-title">审查日志</h1>}
                          bordered={true}>
                        <CheckLog/>
                    </Card>
                </div>
            );
        }

    }
    module.exports = CheckLogPage;
})();