/**
 * Created by junhui on 2017/5/10.
 */
(function () {
    'use strict';
    let React = require('react');
    let moment = require('moment');
    let {Request,} = require('../request');
    let { Card, Col, Row ,Button,Table,Input ,DatePicker,Modal   } = require('antd');
    let {getDateVnum,toThousands,printVoucher,GetLocalStorage} = require('../tool');
    const Global = require('../Global');
    let Amortisation = require('./Amortisation');
    class PerformAmortization extends React.Component{
        constructor(props) {
            super(props);
            this.state = {
                date:moment().format('YYYY-MM-D'),
                vnum:'',
                visible:false,
                confirmLoading:false,
                table:[],
                modal:{},
                detailed:[],
                checkModal:false,
                checkInfo:{},
                info:{}
            }
        }

        componentDidMount() {
            this.getVnum();
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
            this.setState({
                table:this.props.data.list,
                info:this.props.data
            });
        }

        componentWillReceiveProps(nextProps, nextContext) {
            if(nextProps.data){
                this.setState({
                    table:nextProps.data.list,
                    info:nextProps.data
                });
            }
        }
        setVisible(type,item){
            if(item.asset_type_name){
                console.log(item);
                this.setState({
                    visible:type,
                    modal:item
                });
                this.getDetailed(item.asset_id,item.purchase_value);
            }else {
                this.setState({
                    visible:type
                })
            }

        }
        getDetailed(id,value){
            const type = {
                type:'assets/asset-info',
                method:'GET'
            };
            let par = {id:id};
            let cb = (data)=>{
                let num = value;
                let list = data.info.amortisation;
                list.map((item)=>{
                    item.value = num-item.amount;
                    num = item.value;
                });
                this.setState({
                    detailed:data.info.amortisation,
                })
            };
            Request(par,cb,type);
        }
        hideModal(){
            this.setState({
                checkModal:false,
                confirmLoading:false
            })
        }
        printTable(){
            const _this = this;
            let promise = new Promise((success,error)=>{
                _this.setState({confirmLoading:true},()=>{
                    printVoucher(this.state.printId,success,error);
                });
            });
            promise.then(function(value) {
                // success
                _this.setState({confirmLoading:false},()=>{
                    window.open(value,"","width=1024,height=860")
                })
            }, function(value) {
                // failure
                _this.setState({confirmLoading:false})
            });
        }
        showDetailed(item){
            console.log('showDetailed....',item);
            this.setState({
                checkModal:true,
            },()=>{
                this.showModal(item.posted)
            })
        }
        showModal(id){
            this.setState({
                checkModal:true
            });
            let type = {
                type: 'refs/view',
                method: 'GET',
            };
            let params = {
                id:id,
            };
            let checkLabel = [
                {
                    title: '业务号',
                    dataIndex: 'id',
                    key: 'id',
                },
                {
                    title: '凭证号',
                    dataIndex: 'reference',
                    key: 'reference',
                },
                {
                    title: '日期',
                    dataIndex: 'date_',
                    key: 'date_',
                },
            ];
            let checkTable = [];
            let listLabel = [
                {
                    title:'科目编号',
                    dataIndex: 'account',
                    key: 'account',
                },
                {
                    title:'科目名称',
                    dataIndex: 'account_name',
                    key: 'account_name',
                },
                {
                    title:'币别',
                    dataIndex: 'curr_code',
                    key: 'curr_code',
                },
                {
                    title:'借方',
                    dataIndex: 'debit',
                    key: 'debit',
                    render:(text)=>{
                        return <div className="right">{toThousands(text)}</div>
                    }
                },
                {
                    title:'贷方',
                    dataIndex: 'lender',
                    key: 'lender',
                    render:(text)=>{
                        return <div className="right">{toThousands(text)}</div>
                    }
                },
                {
                    title:'摘要',
                    dataIndex: 'memo_',
                    key: 'memo_',
                },
            ];
            let listTable = [];
            let other =[
                {
                    title:'原币',
                    dataIndex: 'usd',
                    key: 'usd',
                    render:(text,item)=>{
                        let value = Math.abs(item.amount/item.rate);
                        if(String(value).indexOf('.')>-1){
                            value = value.toFixed(2);
                        }
                        if(item.rate==0){
                            return '';
                        }else {
                            return <div className="right">{toThousands(value)}</div>;
                        }
                    }
                },
                {
                    title:'汇率',
                    dataIndex: 'rate',
                    key: 'rate',
                    render:(text)=>{
                        if(text == 0){
                            return ''
                        }else {
                            return text;
                        }
                    }
                },
                {
                    title:'数量',
                    dataIndex: 'qty',
                    key: 'qty',
                    render:(text)=>{
                        if(text == 0){
                            return ''
                        }else {
                            return text;
                        }
                    }
                },
                {
                    title:'单价',
                    dataIndex: 'price',
                    key: 'price',
                    render:(text)=>{
                        return <div className="right">{toThousands(text)}</div>
                    }
                },];
            let cb = (data) => {
                let showUsd = false;
                let showQty = false;
                let Usd = other[0];
                let Rate = other[1];
                let Qty = other[2];
                let Price = other[3];
                checkTable.push(data.info.Refs);
                data.info.GlTrans.map((con,i)=>{
                    let rate = con.rate==0?1:con.rate;
                    let negative = con.negative;
                    if(negative==0){
                        con.debit = con.amount>0?con.amount:'';
                        con.lender = con.amount<0?-1*con.amount:'';
                    }else {
                        con.debit = con.amount<0?con.amount:'';
                        con.lender = con.amount>0?-1*con.amount:'';
                    }
                    con.amount = con.amount<0?-con.amount:con.amount;
                    if(con.price>0){
                        showQty = true;
                    }
                    if(GetLocalStorage('Const').curr_default&&con.curr_code&&GetLocalStorage('Const').curr_default!=con.curr_code){
                        showUsd = true;
                    }
                });
                if(showQty){
                    listLabel.splice(3,0,Qty,Price);
                }
                if(showUsd){
                    listLabel.splice(3,0,Usd,Rate);
                }
                listTable = data.info.GlTrans;
                this.setState({
                    printId:id,
                    checkModal:true,
                    checkInfo:{topLabel:checkLabel,topTable:checkTable,contentLabel:listLabel,contentTable:listTable}
                });
            };
            Request(params,cb,type);
        }
        setDate(date){
            this.setState({
                date:date.format('YYYY-MM-D')
            },()=>{
                this.getVnum(this.state.date)
            })
        }

        changeNum(e){
            let value = e.target.value;
            this.setState({
                vnum:value
            })
        }
        searchData(){
            let params = {
                date_:this.state.date,
                depreciation_type:100
            };
            this.props.searchData(params);
        }

        render() {
            const columns = [
                {
                    title: '摊销类型',
                    dataIndex: 'asset_type_name',
                    key: 'asset_type_name',
                }, {
                    title: '摊销项目名称',
                    dataIndex: 'asset_name',
                    key: 'asset_name',
                }, {
                    title: '型号(系列号)',
                    dataIndex: 'asset_serial',
                    key: 'asset_serial',
                }, {
                    title: '入账日期',
                    dataIndex: 'purchase_date',
                    key: 'purchase_date',
                }, {
                    title: '金额',
                    dataIndex: 'purchase_value',
                    key: 'purchase_value',
                    render:(text)=>{
                        return <div className="right">{toThousands(text)}</div>
                    }
                }, {
                    title: '摊销年限',
                    dataIndex: 'amortisation_year',
                    key: 'amortisation_year',
                    render:(text)=>{
                        let value = '';
                        if(String(text).indexOf('.')>-1){
                            value = Number(text).toFixed(2);
                        }else {
                            value = text;
                        }
                        return <div className="right">{value}</div>
                    }
                }, {
                    title: '本月摊销',
                    dataIndex: 'amortisation_month',
                    key: 'amortisation_month',
                    render:(text)=>{
                        return <div className="right">{toThousands(text)}</div>
                    }
                }, {
                    title: '本月已摊销',
                    dataIndex: 'month_acc_dep',
                    key: 'month_acc_dep',
                    render:(text)=>{
                        return <div className="right">{toThousands(text)}</div>
                    }
                }, {
                    title: '累计摊销',
                    dataIndex: 'accumulated_dep',
                    key: 'accumulated_dep',
                    render:(text)=>{
                        return <div className="right">{toThousands(text)}</div>
                    }
                }, {
                    title: '净值',
                    dataIndex: 'net_worth',
                    key: 'net_worth',
                    render:(text)=>{
                        return <div className="right">{toThousands(text)}</div>
                    }
                }, {
                    title: '备注',
                    dataIndex: 'details',
                    key: 'details',
                }, {
                    title: '摊销明细',
                    dataIndex: 'memo_',
                    key: 'memo_',
                    render:(text, record, index)=>(<Button onClick={this.setVisible.bind(this,true,record)}>摊销详情</Button>)
                }
            ];
            const det = [
                {
                    title: '年份',
                    dataIndex: 'amortisation_year',
                    key: 'amortisation_year',
                },
                {
                    title: '月份',
                    dataIndex: 'amortisation_month',
                    key: 'amortisation_month',
                },
                {
                    title: '摊销额度',
                    dataIndex: 'amount',
                    key: 'amount',
                    render:(text)=>{
                        return <div className="right">{toThousands(text)}</div>
                    }
                },
                {
                    title: '净值',
                    dataIndex: 'value',
                    key: 'value',
                    render:(text)=>{
                        return <div className="right">{toThousands(text)}</div>
                    }
                },
                {
                    title: '记账凭证',
                    dataIndex: 'edit',
                    key: 'edit',
                    render:(text,item,index)=>{
                        if(item.posted!='0'){
                            return<Button onClick={this.showDetailed.bind(this,item)} shape="circle" icon="search"/>
                        }else {
                            return '';
                        }
                    }
                },
            ];
            return (
                <div className="gen-certificate">
                    <Card title={<h1 className="certificate-title">执行摊销</h1>}
                          bordered={true}>
                        <Row>
                            <Col xs={6}>
                                日期：<DatePicker style={{width:'60%'}} onChange={this.setDate.bind(this)} value={moment(this.state.date)}/>
                            </Col>
                            <Col xs={6}>
                                凭证号：<Input style={{width:'60%'}} value={this.state.vnum} onChange={this.changeNum.bind(this)}/>
                            </Col>
                            <Col xs={2}>
                                <Button type="primary" icon="search" onClick={this.searchData.bind(this)}>查询</Button>
                            </Col>
                        </Row>
                        <Row className="certificate-table">
                            <Table bordered pagination={false} dataSource={this.state.table}
                                   columns={columns} size="small"/>
                            <Amortisation vnum={this.state.vnum} date_={this.state.date} searchData={this.searchData.bind(this)}
                                          initCertificate={this.props.initCertificate.bind(this)}
                                          depreciation_type={Global.reqConst.defend.type} info={this.state.info}/>
                        </Row>
                        <Modal visible={this.state.visible}
                               width="960"
                               title={`${this.state.modal.asset_type_name}：摊销明细`}
                               onOk={this.setVisible.bind(this,false)}
                               onCancel={this.setVisible.bind(this,false)}>
                            <div className="certificate-table">
                                <Table bordered pagination={false} dataSource={[].concat(this.state.modal)}
                                       size="small"
                                       columns={columns}/>
                                <Table bordered pagination={false} className="genson-margin-top" size="small"
                                       dataSource={this.state.detailed} columns={det}/>
                            </div>
                        </Modal>
                        <Modal visible={this.state.checkModal}
                               width="960"
                               title="记账凭证"
                               confirmLoading={this.state.confirmLoading}
                               okText="打印"
                               cancelText="关闭"
                               onOk={this.printTable.bind(this)}
                               onCancel={this.hideModal.bind(this)}>
                            <div id="section-to-print" className="certificate-table">
                                <Table bordered pagination={false} size="small"
                                       dataSource={this.state.checkInfo.topTable}
                                       columns={this.state.checkInfo.topLabel} />
                                <Table className="genson-margin-top" bordered
                                       pagination={false} size="small"
                                       dataSource={this.state.checkInfo.contentTable}
                                       columns={this.state.checkInfo.contentLabel} />
                            </div>
                        </Modal>
                    </Card>
                </div>
            );
        }

    }
    module.exports = PerformAmortization;

})();