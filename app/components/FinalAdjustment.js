/**
 * Created by junhui on 2017/5/8.
 */
(function () {
    'use strict';
    let React = require('react');
    let moment = require('moment');
    let {Request} = require('../request');
    let Global = require('../Global');
    let { Card, Col, Row ,Button,Table,Input,DatePicker,message,Modal   } = require('antd');
    let {GetLocalStorage,getDateVnum,toThousands} = require('../tool');
    let ChangeExchange = require('./ChangeExchange');

    class FinalAdjustment extends React.Component{
        constructor(props){
            let localData = GetLocalStorage('Const');
            super(props);
            this.state = {
                date:moment().format('YYYY-MM-D'),
                vnum:localData.vnum,
                memo_:'',
                chart:[],
                table:{},
                eTitle:[],
                curr_list:[],
                loading:false,
                visible:false
            }
        }

        getVnum(date){
            let cb = (data)=>{
                this.setState({
                    vnum:data.vnum,
                    date:data.date_
                })
            };
            getDateVnum(cb,date);
        }
        componentWillMount() {
            console.log(this.props);
            this.setState({
                date:this.props.data.date_,
                memo_:this.props.data.memo_,
                vnum:this.props.data.vnum,
                chart:this.props.data.chart,
                curr_list:this.props.data.curr_list,
                loading:true
            },()=>{
                this.initTable();
            });
        }

        componentWillReceiveProps(nextProps, nextContext) {
            console.log(nextProps);
            this.setState({
                date:nextProps.data.date_,
                memo_:nextProps.data.memo_,
                vnum:nextProps.data.vnum,
                chart:nextProps.data.chart,
                curr_list:nextProps.data.curr_list,
            },()=>{
                this.initTable();
            });
        }
        initTable(){
            let title = [
                {
                    title:'科目编码',
                    key:'account',
                    dataIndex:'account',
                    width:'15%'
                },
                {
                    title:'科目名称',
                    key:'account_name',
                    dataIndex:'account_name',
                    width:'25%'
                },
                {
                    title:'摘要',
                    key:'memo_',
                    dataIndex:'memo_',
                    width:'20%'
                },
                {
                    title:'借方',
                    key:'debit',
                    dataIndex:'debit',
                    width:'20%',
                    render:(text)=>{
                        return <div className="right">{toThousands(text)}</div>
                    }
                },
                {
                    title:'贷方',
                    key:'lender',
                    dataIndex:'lender',
                    width:'20%',
                    render:(text)=>{
                        return <div className="right">{toThousands(text)}</div>
                    }
                },
            ];
            let eTitle = [
                {
                    title:"货币",
                    dataIndex:"currency",
                    key:"currency"
                },
                {
                    title:"货币简称",
                    dataIndex:"curr_code",
                    key:"curr_code"
                },
                {
                    title:"国家/地区",
                    dataIndex:"country",
                    key:"country"
                },
                {
                    title:"开始使用日期",
                    dataIndex:"date_",
                    key:"date_"
                },
                {
                    title:"汇率",
                    dataIndex:"rate_buy",
                    key:"rate_buy"
                },
            ];
            let table = this.state.chart;
            table.map((item,index)=>{
                if(item.identity == 1){
                    item.debit = item.amount;
                }else {
                    item.lender = item.amount;
                }
            });
            this.setState({
                table:{title,table},
                loading:false,
                eTitle
            })
        }
        changeDate(date,dateString){
            this.setState({
                date:date
            },()=>{
                this.getVnum(dateString)
            })
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
        currencyExchange(){
            let par = {
                date_:this.state.date,
                vnum:this.state.vnum,
                memo_:this.state.memo_
            };
            let type = {
                type:'revaluate-currencies/add-revaluate-currencies',
                method:'FormData',
                Method:'POST'
            };
            let cb = (data)=>{
                if(data.code==0){
                    message.success('调汇成功');
                    this.goSearch();
                }else {
                    message.error(data.message);
                }
            };
            Request(par,cb,type);
        }
        goSearch(){
            let par = {
                date_:moment(this.state.date).format('YYYY-MM-D')
            };
            this.setState({loading:true},()=>{
                this.props.search(par);
            });
        }
        showModal(value){
            this.setState({visible:value},()=>{
                if(!value){
                    this.goSearch();
                }
            })
        }
        render() {
            return (
                <div className="gen-certificate">
                    <Card title={<h1 className="certificate-title">期末调汇</h1>}
                          bordered={true}>
                        <Row>
                            <Col xs={6}>
                                调汇日期：<DatePicker style={{width:'60%'}} value={moment(this.state.date)}
                                                 onChange={this.changeDate.bind(this)}/>
                            </Col>
                            <Col xs={2} offset={1}>
                                <Button type="primary" icon="search" onClick={this.goSearch.bind(this)}>搜索</Button>
                            </Col>
                        </Row>
                        <Row className="genson-margin-top">
                            <Col xs={4}>
                                凭证号：<Input style={{width:'60%'}} value={this.state.vnum} onChange={this.changeNum.bind(this)}/>
                            </Col>
                            <Col xs={6} offset={1}>
                                摘要：<Input style={{width:'60%'}} value={this.state.memo_} onChange={this.changeMemo.bind(this)}/>
                            </Col>
                            <Col xs={2} offset={1}>
                                <Button type="primary" onClick={this.currencyExchange.bind(this)}>调汇</Button>
                            </Col>
                        </Row>
                        <Row className="certificate-table">
                            <Table bordered size="small"
                                   loading={this.state.loading}
                                   pagination={false}
                                   columns={this.state.table.title}
                                   dataSource={this.state.table.table}/>
                        </Row>

                        <Row className="genson-margin-top">
                            <Col xs={4}>
                                <Button type="primary" icon="edit" onClick={this.showModal.bind(this,true)}>编辑外汇</Button>
                            </Col>
                            <Col xs={4} offset={6}>
                                <h2 className="center">汇率明细</h2>
                            </Col>
                        </Row>
                        <Table className="certificate-table" bordered size="small"
                               loading={this.state.loading} pagination={false}
                               columns={this.state.eTitle}
                               dataSource={this.state.curr_list}/>
                        <Modal visible={this.state.visible} title="汇率" okText="关闭" width="960" footer={null}
                               onOk={this.showModal.bind(this,false)} onCancel={this.showModal.bind(this,false)}>
                            <ChangeExchange reSearch={this.goSearch.bind(this)}/>
                        </Modal>
                    </Card>
                </div>
            );
        }

    }

    module.exports = FinalAdjustment;
})();