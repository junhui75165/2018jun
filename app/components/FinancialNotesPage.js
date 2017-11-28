/**
 * Created by junhui on 2017/5/18.
 */
(function () {
    'use strict';
    let React = require('react');
    let { Card,} = require('antd');
    let FinancialNotes = require('./FinancialNotes');
    class FinancialNotesPage extends React.Component{
        render() {
            return (
                <div className="gen-certificate">
                    <Card title={<h1 className="certificate-title">财务备忘</h1>}
                          bordered={true}>
                        <FinancialNotes/>
                    </Card>
                </div>
            );
        }

    }
    module.exports = FinancialNotesPage;
})();