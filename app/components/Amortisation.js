/**
 * Created by junhui on 2017/5/10.
 */
(function () {
    'use strict';
    let React = require('react');
    let moment = require('moment');
    let {Request,} = require('../request');
    let {toThousands,printVoucher,GetLocalStorage} = require('../tool');
    let {Table, Row,Col,Button,Checkbox,message,Modal} = require('antd');
    class Amortisation extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                table:[],
                depreciation_type:this.props.depreciation_type,
                done_:false,
                refs:[],
                combine:false,
                date_:moment().format('YYYY-MM-D'),
                vnum:'',
                checkInfo:{},
                confirmLoading:false,
                visible:false
            }
        }

        componentWillMount() {
            this.setState({
                table:this.resetTab(this.props.info.deal),
                date_:this.props.date_,
                vnum:this.props.vnum,
                done_:!this.props.info.is_amortisation,
                refs:this.props.info.refs,
            })
        }

        componentWillReceiveProps(nextProps, nextContext) {
            this.setState({
                table:this.resetTab(nextProps.info.deal),
                date_:nextProps.date_,
                vnum:nextProps.vnum,
                done_:!nextProps.info.is_amortisation,
                refs:nextProps.info.refs,
            })
        }
        changeCombine(e){
            let value = e.target.checked;
            this.setState({combine:value})
        }
        submitForm(){
            const url = {
                type:'assets/amortisation-save',
                method:'FormData',
                Method:'POST'
            };
            let cb = (data)=>{
                message.success(this.state.depreciation_type==1?'已完成摊销':'已完成折旧');
                this.props.searchData();
            };
            let par = {
                date_:this.state.date_,
                vnum:this.state.vnum,
                depreciation_type:this.state.depreciation_type,
                combine:this.state.combine?1:0,
            };
            Request(par,cb,url);
        }
        resetTab(list){
            list.map((item,index)=>{
                if(item.identity == 1){
                    item.debit = item.amount;
                }else if(item.identity == 2){
                    item.lender = item.amount;
                }
            });
            return list;
        }
        changeType(item,type){
            console.log(item);
            let ty = {
                type: 'refs/view',
                method: 'GET',
            };
            let params = {
                id:item.id,
            };
            let cb = (data) => {
                if(data.code == 0){
                    switch (type){
                        case 'edit':
                            this.props.initCertificate(data.info,false,true);
                            break;
                        case  'red':
                            this.props.initCertificate(data.info,true);
                            break;
                        case  'copy':
                            this.props.initCertificate(data.info);
                            break;
                    }
                }else {
                    message.error(data.message);
                }
            };
            Request(params,cb,ty);
        }

        searchTable(id){
            console.log(id);
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
                {
                    title:'编辑',
                    dataIndex: 'edit',
                    render:(text, record, index)=>{
                        return<Button shape="circle" icon="edit" onClick={this.changeType.bind(this,record,'edit')}/>
                    }
                },
                {
                    title:'红冲',
                    dataIndex: 'red',
                    render:(text, record, index)=>{
                        return<Button icon="close-circle" type="danger" shape="circle" onClick={this.changeType.bind(this,record,'red')}/>
                    }
                },
                {
                    title:'复制',
                    dataIndex: 'copy',
                    render:(text, record, index)=>{
                        return<Button shape="circle" icon="copy" onClick={this.changeType.bind(this,record,'copy')}/>
                    }
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
            let listTable = [];
            let type = {
                type: 'refs/view',
                method: 'GET',
            };
            let params = {
                id:id,
            };
            let cb = (data) => {
                if (data.code == 0) {
                    console.log(data.info);
                }
                checkTable.push(data.info.Refs);
                let showUsd = false;
                let showQty = false;
                let Usd = other[0];
                let Rate = other[1];
                let Qty = other[2];
                let Price = other[3];
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
                    visible:true,
                    printId:id,
                    checkInfo:{
                        topLabel:checkLabel,
                        topTable:checkTable,
                        contentLabel:listLabel,
                        contentTable:listTable
                    }
                });
            };
            Request(params,cb,type);

        }
        clearRecord(){
            const url = {
                type:'assets/amortisation-delete',
                method:'FormData',
                Method:'POST'
            };
            let cb = (data)=>{
                message.success(this.state.depreciation_type==1?'已清除摊销':'已清除折旧');
                this.props.searchData();
            };
            let par = {
                date_:this.state.date_,
                depreciation_type:this.state.depreciation_type,
            };
            Request(par,cb,url);
        }
        hideModal(type){
            if(type == 'print'){
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
            }else {
                this.setState({
                    visible:false,
                    confirmLoading:false
                })
            }
        }
        render() {
            const colCer = [
                {
                    title:'科目编码',
                    dataIndex:'account_code',
                    key:'account_code'
                },
                {
                    title:'科目名称',
                    dataIndex:'account_name',
                    key:'account_name'
                },
                {
                    title:'借方',
                    dataIndex:'debit',
                    key:'debit',
                    render:(text)=>{
                        return <div className="right">{toThousands(text)}</div>
                    }
                },
                {
                    title:'借方',
                    dataIndex:'lender',
                    key:'lender',
                    render:(text)=>{
                        return <div className="right">{toThousands(text)}</div>
                    }
                },
                {
                    title:'摘要',
                    dataIndex:'memo_',
                    key:'memo_'
                },
            ];
            return (
                <div>
                    <h2 style={{marginTop:'1rem'}} className="center">记账凭证</h2>
                    <div style={{display:this.state.done_?'block':'none'}}>
                        <h3 className="center genson-margin-top">
                            {
                                this.state.depreciation_type==1?'没有费用或资产需要摊销，或者所有的费用或资产本月已摊销。':
                                    '没有资产需要计提折旧，或者所有的资产本月已提折旧。'
                            }
                        </h3>
                        <Row className="genson-margin-top" style={{display:this.state.refs.length>0?'block':'none'}}>
                            记账凭证：
                            {this.state.refs.map((item)=>{
                                return <Button onClick={this.searchTable.bind(this,item.id)}
                                               style={{marginRight:'1rem'}}
                                               title="点击查看详情">
                                    {item.name}
                                    </Button>
                            })}
                        </Row>
                        <Button className="genson-block-center"
                                style={{marginTop:'1rem',display:this.state.refs.length>0?'block':'none'}}
                                icon="delete"
                                onClick={this.clearRecord.bind(this)}>
                            {this.state.depreciation_type==1?'清除本月折旧记录':'清除本月摊销记录'}
                        </Button>
                    </div>
                    <div style={{display:!this.state.done_?'block':'none'}}>
                        <Table className="certificate-table" size="small"
                               bordered pagination={false}
                               dataSource={this.state.table} columns={colCer}/>
                        <Row className="genson-margin-top">
                            <Col lg={6} offset={7}>
                                <Checkbox checked={this.state.combine} onChange={this.changeCombine.bind(this)}>
                                    {this.state.depreciation_type==1?'合并所有折旧分录为一笔分录':'合并所有摊销分录为一笔分录'}
                                </Checkbox>
                            </Col>
                            <Col lg={4} >
                                <Button type="primary" onClick={this.submitForm.bind(this)}>{this.state.depreciation_type==1?'计提折旧':'执行摊销'}</Button>
                            </Col>
                        </Row>
                    </div>
                    <Modal visible={this.state.visible}
                           width="960"
                           title="记账凭证"
                           okText="打印"
                           confirmLoading={this.state.confirmLoading}
                           cancelText="关闭"
                           onOk={this.hideModal.bind(this,'print')}
                           onCancel={this.hideModal.bind(this)}>
                        <div id="section-to-print" className="certificate-table">
                            <Table bordered pagination={false} size="small"
                                   dataSource={this.state.checkInfo.topTable}
                                   columns={this.state.checkInfo.topLabel} />
                            <Table className="genson-margin-top" bordered pagination={false}
                                   dataSource={this.state.checkInfo.contentTable} size="small"
                                   columns={this.state.checkInfo.contentLabel} />
                        </div>
                    </Modal>
                </div>
            );
        }
    }
    module.exports = Amortisation;
})();