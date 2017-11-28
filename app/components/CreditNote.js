/**
 * Created by junhui on 2017/5/3.
 */
(function () {
    'use strict';
    let React = require('react');
    let moment = require('moment');
    let {Request} = require('../request');
    let { Card, Col, Row ,Button,Table,Input ,
        DatePicker,Pagination,Modal,Icon,Select } = require('antd');
    const {Option} = Select;
    const RangePicker = DatePicker.RangePicker;
    let {getDateVnum,toThousands,printVoucher,GetLocalStorage} = require('../tool');
    class CreditNote extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                dateForm:moment().startOf('year').format('YYYY-MM-D'),
                dateTo:moment().endOf('year').format('YYYY-MM-D'),
                memo_:'',
                vnum:'',
                table:[],
                checkModal:false,
                checkInfo:{},
                pageNum:1,
                page:this.props.page,
                loading:false,
                confirmLoading:false,
                dateVnum:{vnum:'',date_:moment().format('YYYY-MM-D')},
                openIndex:'',
                openDate:false,
                page_site:'',
                user:'',
            };
        }

        componentWillMount() {
            // console.log(this.props.data)
            this.setTable(this.props)
        }

        componentDidMount() {
            let cb = (data)=>{
                this.setState({
                    dateForm:moment(data.date_).startOf('year').format('YYYY-MM-D'),
                    dateTo:moment(data.date_).endOf('year').format('YYYY-MM-D'),
                    dateVnum:data
                })
            };
            getDateVnum(cb);
        }


        componentWillReceiveProps(nextProps, nextContext) {
            if(nextProps){
                this.setTable(nextProps)
            }
        }

        setTable(props){
            this.setState({
                table:props.data,
                page:props.page,
                loading:false
            })
        }

        changeDate(date,dateString){
            this.setState({
                dateForm:moment(date[0]).format('YYYY-MM-D'),
                dateTo:moment(date[1]).format('YYYY-MM-D'),
                openDate:false
            })
        }
        setPage(page){
            this.setState({
                pageNum:page,
                loading:true,
            },()=>{
                this.search(page);
            })
        }
        search(){
            let par = {
                date_:this.state.dateForm+'_'+this.state.dateTo,
                memo_:this.state.memo_,
                vnum:this.state.vnum,
                page:this.state.pageNum-1
            };
            if(this.state.page_site){
                par.page_site = this.state.page_site;
            }
            this.props.searchData(par);
        }
        changeMemo(e){
            let value = e.target.value;
            this.setState({
                memo_:value
            })
        }
        changeNum(e){
            let value = e.target.value;
            this.setState({
                vnum:value
            })
        }
        hideModal(){
            this.setState({
                checkModal:false,
                confirmLoading:false
            })
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
        showModal(item,index){
            this.setState({
                checkModal:true
            });
            let type = {
                type: 'refs/view',
                method: 'GET',
            };
            let params = {
                id:item.id,
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
                            return value;
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
                let user = data.info.audit.op_info;
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
                    user,
                    printId:item.id,
                    checkModal:true,
                    openIndex:index,
                    checkInfo:{topLabel:checkLabel,topTable:checkTable,contentLabel:listLabel,contentTable:listTable}
                });
            };
            Request(params,cb,type);
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
        clearRed(item){
            let type = {
                type: 'refs/view',
                method: 'GET',
            };
            let params = {
                id:item.id,
            };
            let cb = (data) => {
                this.props.initCertificate(data.info,true);
            };
            Request(params,cb,type);
        }
        onOpenChange(openDate){
            this.setState({openDate})
        }
        changeSize(page_site) {
            this.setState({page_site},()=>{
                this.setPage.bind(this,1)();
            });
        }
        render() {
            const columns = [
                {
                title: '日期',
                dataIndex: 'tran_date',
                key: 'tran_date',
            }, {
                title: '类型',
                dataIndex: 'gl_trans_memo',
                key: 'gl_trans_memo',
            }, {
                title: '业务',
                dataIndex: 'id',
                key: 'id',
            }, {
                title: '凭证号',
                dataIndex: 'reference',
                key: 'reference',
            }, {
                title: '金额',
                dataIndex: 'gl_amount',
                key: 'gl_amount',
                    render:(text)=>{
                        return <div className="right">{toThousands(text)}</div>
                    }
            }, {
                title: '摘要',
                dataIndex: 'memo_',
                key: 'memo_',
            }, {
                title: '查看',
                dataIndex: 'check',
                key: 'check',
                render: (text, record, index) => {
                    return<Button icon="search" shape="circle" onClick={this.showModal.bind(this,record,index)}/>
                }
            }, {
                title: '红冲',
                dataIndex: 'red',
                key: 'red',
                render: (text, record, index) => {
                    return<Button icon="close-circle" type="danger" shape="circle" onClick={this.clearRed.bind(this,record)}/>
                }
            }
            ];
            const month = GetLocalStorage('Const').fiscal_year_end_month;
            let startYear = moment(this.state.dateVnum.date_).year()+'-'+(month==12?1:Number(month)+1);
            let endYear = (month==12?moment(this.state.dateVnum.date_):moment(this.state.dateVnum.date_).add(1,'year')).year()+'-'+(month);
            const ranges = [
                {
                    from:{
                        title:'当前会计月份',
                        date:[moment(this.state.dateVnum.date_).startOf('month'), moment(this.state.dateVnum.date_).endOf('month')]
                    },
                    to:{
                        title:'上一会计月份',
                        date:[moment(this.state.dateVnum.date_).subtract(1,'month').startOf('month'), moment(this.state.dateVnum.date_).subtract(1,'month').endOf('month')]
                    }
                },
                {
                    from:{
                        title:'当前会计年度',
                        date:[moment(startYear).startOf('month'), moment(endYear).endOf('month')]
                    },
                    to:{
                        title:'上一会计年度',
                        date:[moment(startYear).subtract(1,'year'), moment(endYear).subtract(1,'year')],
                    }
                },
                {
                    from:{
                        title:'往前一个月',
                        icon:'left',
                        date:[moment(this.state.dateForm).subtract(1, 'month').startOf('month'), moment(this.state.dateTo).subtract(1, 'month').endOf('month')],
                    },
                    to:{
                        title:'往后一个月',
                        icon:'right',
                        date:[moment(this.state.dateForm).add(1, 'month').startOf('month'), moment(this.state.dateTo).add(1, 'month').endOf('month')],
                    }
                },
                {
                    from:{
                        title:'往前一年',
                        icon:'double-left',
                        date:[moment(this.state.dateForm).subtract(1, 'year').startOf('year'), moment(this.state.dateTo).subtract(1, 'year').endOf('year')],
                    },
                    to:{
                        title:'往后一年',
                        icon:'double-right',
                        date:[moment(this.state.dateForm).add(1, 'year').startOf('year'), moment(this.state.dateTo).add(1, 'year').endOf('year')],
                    }
                },
            ];
            return (
                <div className="gen-certificate">
                    <Card title={<h1 className="certificate-title">红冲账凭证输入</h1>}
                          bordered={true}>
                        <Row type="flex" justify="space-between">
                            <Col xs={6}>
                                日期：<RangePicker onChange={this.changeDate.bind(this)}
                                                value={[moment(this.state.dateForm), moment(this.state.dateTo)]}
                                                format="YYYY-MM-D"
                                                open={this.state.openDate}
                                                onOpenChange={this.onOpenChange.bind(this)}
                                                renderExtraFooter={
                                                    ()=>{
                                                        return <div>
                                                            {
                                                                ranges.map((item,key)=>{
                                                                    return<Row key={key} type="flex" justify="space-around">
                                                                        <Col xs={8}>
                                                                            <Button icon={item.from.icon?item.from.icon:null} onClick={this.changeDate.bind(this,item.from.date)} style={{width:'100%'}}>
                                                                                {item.from.title}
                                                                            </Button>
                                                                        </Col>
                                                                        <Col xs={8}>
                                                                            <Button  onClick={this.changeDate.bind(this,item.to.date)} style={{width:'100%'}}>
                                                                                {item.to.title}
                                                                                <Icon type={item.to.icon?item.to.icon:null} />
                                                                            </Button>
                                                                        </Col>
                                                                    </Row>
                                                                })
                                                            }
                                                        </div>
                                                    }
                                                }/>
                            </Col>
                            <Col xs={4}>
                                凭证号：<Input onChange={this.changeNum.bind(this)} style={{width:"60%"}}/>
                            </Col>
                            <Col xs={4}>
                                摘要：<Input onChange={this.changeMemo.bind(this)} value={this.state.memo_} style={{width:"60%"}}/>
                            </Col>
                            <Col xs={4}>
                                <Button type="primary" icon="search" onClick={this.setPage.bind(this,1)}>搜索</Button>
                            </Col>
                            <Col xs={4}>
                                每页显示条数：
                                <Select defaultValue={this.state.page_site}
                                        style={{width:"6rem"}} allowClear
                                        onChange={this.changeSize.bind(this)}>
                                    <Option value={50}>50</Option>
                                    <Option value={100}>100</Option>
                                    <Option value={200}>200</Option>
                                    <Option value={500}>500</Option>
                                </Select>
                            </Col>
                        </Row>
                        <Row className="certificate-table">
                            <Table bordered dataSource={this.state.table}
                                   columns={columns} size="small"
                                   loading={this.state.loading}
                                   pagination={false}/>
                            <Pagination onChange={this.setPage.bind(this)}
                                        className="genson-pagination"
                                        current={this.state.pageNum}
                                        pageSize={this.state.page.PageSize}
                                        total={Number(this.state.page.totalCount)} />
                        </Row>
                        <Modal visible={this.state.checkModal}
                               width="960"
                               title="记账凭证"
                               okText="打印"
                               cancelText="关闭"
                               confirmLoading={this.state.confirmLoading}
                               onOk={this.printTable.bind(this)}
                               onCancel={this.hideModal.bind(this)}>
                            <div id="section-to-print" className="certificate-table">
                                <Table bordered pagination={false} dataSource={this.state.checkInfo.topTable} size="small"
                                       columns={this.state.checkInfo.topLabel} />
                                <Table style={{marginTop:'1rem'}} bordered pagination={false} size="small"
                                       dataSource={this.state.checkInfo.contentTable}
                                       columns={this.state.checkInfo.contentLabel} />
                                <h3 className="genson-margin-top center">用户：{this.state.user||'无'}</h3>
                            </div>
                            <Row className="genson-margin-top" type="flex" justify="space-around">
                                <Button className="genson-block-center"
                                        onClick={this.showModal.bind(this,this.state.table[this.state.openIndex-1],this.state.openIndex-1)}
                                        disabled={this.state.openIndex==0}>
                                    上一条
                                </Button>
                                <Button className="genson-block-center"
                                        onClick={this.showModal.bind(this,this.state.table[this.state.openIndex+1],this.state.openIndex+1)}
                                        disabled={this.state.openIndex==(this.state.table.length-1)}>
                                    下一条
                                </Button>
                            </Row>
                        </Modal>
                    </Card>
                </div>
            );
        }

    }
    module.exports = CreditNote;
    })();