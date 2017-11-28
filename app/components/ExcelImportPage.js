/**
 * Created by junhui on 2017/6/7.
 */
(function () {
    'use strict';
    let React = require('react');
    let { Card,} = require('antd');
    let ExcelImport = require('./ExcelImport');
    class ExcelImportPage extends React.Component{
        render() {
            return (
                <div className="gen-certificate">
                    <Card title={<h1 className="certificate-title">Excel文件导入科目开账余额</h1>}
                          bordered={true}>
                        <ExcelImport init={this.props.init}/>
                    </Card>
                </div>
            );
        }

    }
    module.exports = ExcelImportPage;
})();