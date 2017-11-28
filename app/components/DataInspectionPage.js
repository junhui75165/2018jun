/**
 * Created by junhui on 2017/6/6.
 */
(function () {
    'use strict';
    let React = require('react');
    let { Card,} = require('antd');
    let DataInspection = require('./DataInspection');
    class DataInspectionPage extends React.Component{
        render() {
            return (
                <div className="gen-certificate">
                    <Card title={<h1 className="certificate-title">账务数据检验</h1>}
                          bordered={true}>
                        <DataInspection/>
                    </Card>
                </div>
            );
        }
    }
    module.exports = DataInspectionPage;

})();