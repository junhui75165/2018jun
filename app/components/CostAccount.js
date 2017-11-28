/**
 * Created by junhui on 2017/5/3.
 */
(function () {
    'use strict';
    let React = require('react');
    let moment = require('moment');
    let {Request, } = require('../request');
    let {objToArr,getDateVnum} = require('../tool');
    let { Card, Col, Row ,Button,Input ,Select,DatePicker,Alert,message,   } = require('antd');
    const { Option, OptGroup } = Select;
    class CostAccount extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                date:moment().format('YYYY-MM-D'),
                vnum:'',
                subject:[],
                subjectList:[],
                memo_:'',
                classId:'',
                subjectId:'',
                disabled:true,
                alert:{
                    type:'warning',
                    content:['请选择一个结转科目！']
                }
            }
        }

        componentWillReceiveProps(nextProps, nextContext) {
            if(nextProps.data){
                this.initContent(nextProps)
            }
        }

        componentWillMount() {
            console.log(this.props);
            this.initContent(this.props)
        }
        getVnum(date){
            let cb = (data)=>{
              this.setState({
                  vnum:data.vnum,
                  date:data.date_
              },()=>{
                  console.log(this.state.vnum)
              })
            };
            getDateVnum(cb,date);
        }
        initContent(props){
            let subject = props.data.chart.out;
            let subjectList = objToArr(props.data.chart.to);
            this.setState({
                subject:subject,
                subjectList:subjectList,
                vnum:props.data.vnum,
                date:props.data.date,
                memo_:props.data.memo_
            })
        }
        setDate(date){
            this.setState({
                date:moment(date).format('YYYY-MM-D')
            },()=>{
                this.getVnum(this.state.date);
                this.checkSpecify();
            })
        }
        setNum(e){
            let num = e.target.value;
            this.setState({
                vnum:num
            })
        }
        changeMemo(e){
            let value = e.target.value;
            this.setState({
                memo_:value
            })
        }
        selectId(value){
            this.setState({
                classId:value
            },()=>{
                this.checkSpecify();
            });
        }
        selectSubject(value){
            this.setState({
                subjectId:value
            },()=>{
                this.checkSpecify();
            });
        }
        checkSpecify(){
            let errorMsg = [];
            let par = {
                cost_acct:this.state.classId,
                date_:this.state.date,
                forward_acct:this.state.subjectId
            };
            let type = {
                type:'forward/specify',
                method:'GET'
            };
            let cb = (data)=>{
                this.setState({
                    disabled:!data.info.add_forward,
                    alert:{
                        type:data.info.add_forward?'success':'error',
                        content:data.info.message
                    }
                },()=>{console.log(this.state.alert)})
            };
            if(!par.cost_acct){
                errorMsg = errorMsg.concat(['未选择转出余额科目']);
            }
            if(!par.date_){
                errorMsg = errorMsg.concat(['未选择日期'])
            }
            if(!par.forward_acct){
                errorMsg = errorMsg.concat(['未选择转入科目'])
            }
            if(errorMsg.length == 0){
                Request(par,cb,type);
            }else {
                this.setState({
                    alert:{
                        type:'error',
                        content:errorMsg
                    }
                })
            }
        }
        jiezhuan(){
            let par = {
                forward_acct:this.state.subjectId,
                date_:this.state.date,
                vnum:this.state.vnum,
                memo_:this.state.memo_,
                cost_acct:this.state.classId
            };
            let type = {
                type:'forward/add-specify-loss-balance',
                method:'FormData',
                Method:'POST'
            };
            let cb = (data)=>{
                if(data.code == 0){
                    message.success('结转成功！');
                    this.setState({disabled:true})
                }else {
                    message.error(data.message);
                }
            };
            if(!par.cost_acct){
                message.warning('未选择转出余额科目')
            }else if(!par.forward_acct){
                message.warning('未选择转入科目')
            }else {
                Request(par,cb,type);
            }
        }
        render() {
            return (
                <div className="gen-certificate">
                    <Card title={<h1 className="certificate-title">结转指定成本科目余额</h1>}
                          bordered={true}>
                        <Alert message="损益/成本" showIcon className="genson-max-width"
                               description={
                                   this.state.alert.content.map((item)=>{
                                       return<Row>{item}</Row>;
                                   })}
                               type={this.state.alert.type}/>
                        <Row className="genson-margin-top">
                            <Col xs={6} md={4} lg={2} offset={2} className="right">转出余额科目：</Col>
                            <Col xs={10} md={8} lg={6}>
                                <Select style={{width:"100%"}} value={this.state.classId} className="genson-input"
                                        onSelect={this.selectId.bind(this)}>
                                    {this.state.subject.map((data)=>{
                                        return<Option key={data.id} value={data.id}>{data.id+" "+data.name}</Option>
                                    })}
                                </Select>
                            </Col>
                        </Row>
                        <Row className="genson-margin-top">
                            <Col xs={6} md={4} lg={2} offset={2} className="right">转入科目：</Col>
                            <Col xs={10} md={8} lg={6}>
                                <Select style={{width:"100%"}} showSearch value={this.state.subjectId} className="genson-input"
                                        optionFilterProp="children" onSelect={this.selectSubject.bind(this)}>
                                    {
                                        this.state.subjectList.map((data)=>{
                                            return<OptGroup laber={data.account_name} key={data.account_name}>
                                                {data.children?data.children.map((item)=>{
                                                        return<Option key={item.account_code} value={item.account_code}>
                                                            {item.account_code+" "+item.account_name}
                                                        </Option>
                                                    }):''}
                                            </OptGroup>
                                        })
                                    }
                                </Select>
                            </Col>
                        </Row>
                        <Row className="genson-margin-top">
                            <Col xs={6} md={4} lg={2} offset={2} className="right">日期：</Col>
                            <Col xs={10} md={8} lg={6} className="genson-input">
                                <DatePicker style={{width:"100%"}}
                                            onChange={this.setDate.bind(this)}
                                            defaultValue={moment(this.state.date)}/>
                            </Col>
                        </Row>
                        <Row className="genson-margin-top">
                            <Col xs={6} md={4} lg={2} offset={2} className="right">凭证号：</Col>
                            <Col xs={10} md={8} lg={6}>
                                <Input onChange={this.setNum.bind(this)}
                                       value={this.state.vnum} className="genson-input"
                                       style={{width:"100%"}}/>
                            </Col>
                        </Row>
                        <Row className="genson-margin-top">
                            <Col xs={6} md={4} lg={2} offset={2} className="right">摘要：</Col>
                            <Col xs={10} md={8} lg={6}>
                                <Input value={this.state.memo_} type="textarea" autosize={{minRows: 4} }
                                       onChange={this.changeMemo.bind(this)} className="genson-input"
                                       style={{width:"100%"}}/>
                                <div>
                                    <Button type="primary" icon="retweet" className="genson-margin-top"
                                            disabled={this.state.disabled}
                                            onClick={this.jiezhuan.bind(this)}>
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
    module.exports = CostAccount;
})();