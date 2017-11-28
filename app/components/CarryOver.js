/**
 * Created by junhui on 2017/5/3.
 */
(function () {
    'use strict';
    let React = require('react');
    let moment = require('moment');
    let {Request, Ajax} = require('../request');
    let { Card, Col, Row ,Button,Input ,message,DatePicker,Alert} = require('antd');
    const MonthPicker  = DatePicker.MonthPicker ;
    class CarryOver extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                date:moment().format('YYYY-MM-D'),
                vnum:'',
                memo_:'',
                disabled:false,
                loading:true,
                alert:{
                    type:'success',
                    content:['成本科目可以结转！']
                }
            }
        }

        componentWillMount() {
            this.initValue(this.props.data);
        }

        componentWillReceiveProps(nextProps, nextContext) {
            this.initValue(nextProps.data);
        }

        initValue(info){
            let receive = info;
            this.setState({
                date:receive.date,
                vnum:receive.vnum,
                memo_:receive.memo_,
                add_forward:receive.add_forward,
                disabled:!receive.add_forward,
                alert:{
                    type:receive.add_forward?'success':'error',
                    content:receive.message
                },
                loading:false
            });
        }

        changeNum(e){
            let value = e.target.value;
            this.setState({
                vnum:value
            })
        }
        changeMemo(e){
            let value = e.target.value;
            this.setState({
                memo_:value
            })
        }

        setDate(date,dateString){
            console.log(date);
            //自动结转本期损益--判断是否可以结转
            this.setState({
                date:dateString
            },()=>{
                let par = {date_:this.state.date};
                this.props.search(par);
            })
        }
        carryOver(){
            const type = {
                type:'forward/add-loss-balance',
                method:'FormData',
                Method:'POST',
            };
            let par = {
                date_:this.state.date,
                vnum:this.state.vnum,
                memo_:this.state.memo_
            };
            let cb = (data)=>{
                message.success('结转成功');
                this.setState({disabled:true})
            };
            Request(par,cb,type);
        }
        render() {
            return (
                <div className="gen-certificate">
                    <Card title={<h1 className="certificate-title">自动结转本期损益</h1>}
                          bordered={true}>
                        <Alert message="损益/成本" showIcon className="genson-max-width"
                               description={
                                   this.state.alert.content.map((item)=>{
                                   return<Row>{item}</Row>;
                               })}
                               type={this.state.alert.type}/>
                        <Row className="genson-margin-top">
                            <Col xs={6} md={4} lg={2} offset={2} className="right">选择日期：</Col>
                            <Col xs={10} md={8} lg={6} className="genson-input">
                                <DatePicker style={{width:'100%'}}
                                            onChange={this.setDate.bind(this)}
                                            value={moment(this.state.date)}/>
                            </Col>
                        </Row>
                        <Row className="genson-margin-top">
                            <Col xs={6} md={4} lg={2} offset={2} className="right">凭证号：</Col>
                            <Col xs={10} md={8} lg={6} className="genson-input">
                                <Input value={this.state.vnum}
                                       onChange={this.changeNum.bind(this)}
                                       style={{width:"100%"}}/>
                            </Col>
                        </Row>
                        <Row className="genson-margin-top">
                            <Col xs={6} md={4} lg={2} offset={2} className="right">摘要：</Col>
                            <Col xs={10} md={8} lg={6} className="genson-input">
                                <Input value={this.state.memo_} type="textarea" autosize={{minRows: 4} }
                                       onChange={this.changeMemo.bind(this)}
                                       style={{width:"100%"}}/>
                                <div>
                                    <Button type="primary" className="genson-margin-top"
                                            icon={this.state.loading?'loading':'retweet'} disabled={this.state.disabled}
                                            onClick={this.carryOver.bind(this)}>
                                        结转
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </Card>
                </div>
            );
        }
    }
    module.exports = CarryOver;

})();