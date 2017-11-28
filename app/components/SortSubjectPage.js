/**
 * Created by junhui on 2017/5/22.
 */
(function () {
    'use strict';
    let React = require('react');
    let { Card, } = require('antd');
    let SortSubject = require('./SortSubject');
    class SortSubjectPage extends React.Component{
        render() {
            return (
                <div className="gen-certificate">
                    <Card title={<h1 className="certificate-title">精简会计科目</h1>}
                          bordered={true}>
                        <SortSubject/>
                    </Card>
                </div>
            );
        }

    }
    module.exports = SortSubjectPage;
})();