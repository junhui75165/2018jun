/**
 * Created by junhui on 2017/6/6.
 */
(function () {
    'use strict';
    let React = require('react');
    let moment = require('moment');
    let {Request, } = require('../request');
    let {  Col, Row ,Button,Alert,DatePicker,message} = require('antd');
    let {getDateVnum} = require('../tool');
    class DataInspection extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                date:moment(),
                message:{
                    type:'success',
                    content:[]
                }
            };
        }

        componentDidMount() {
            this.getVnum();
        }

        getVnum(){
            let cb = (data)=>{
              this.setState({
                  date:moment(data.date_)
              },()=>{
                  this.CheckData();
              })
            };
            getDateVnum(cb);
        }

        CheckData(){
            const type = {
                type:'verify/verify',
                method:'GET'
            };
            let cb = (data)=>{
                let error = data.info;
                let message = this.state.message;
                message.content = error;
                if(error.length == 0){
                    let content = '数据检查无误';
                    message.content.push(content);
                }else {
                    message.type = 'error';
                    // message.content.push('shabiniyingle')
                }
                console.log(message);
                this.setState(message);
            };
            let par = {date_:moment(this.state.date).format('YYYY-MM-D')};
            Request(par,cb,type);
        }
        changeDate(date){
            this.setState({
                date:date
            });
        }
        render() {
            return (
                <div>
                    <div style={{maxWidth:'860px'}}>
                        <Alert message="数据校验出错" showIcon type={this.state.message.type}
                               description={
                                   <div>
                                       {this.state.message.content.map((item,index)=>{
                                           return<Row>{index+1}：{item}</Row>
                                       })}
                                   </div>
                               }/>
                    </div>

                    <Row className="genson-margin-top">
                        <Col lg={4} md={6} xs={10}>
                            <DatePicker value={this.state.date} onChange={this.changeDate.bind(this)}/>
                        </Col>
                        <Col xs={4} offset={1}>
                            <Button icon="search" type="primary" onClick={this.CheckData.bind(this)}>财务数据检查</Button>
                        </Col>
                    </Row>
                </div>
            );
        }
    }
    module.exports = DataInspection;

})();