/**
 * Created by junhui on 2017/4/6.
 */
(function () {
    'use strict';
    let React = require('react');
    let moment = require('moment');
    let {Request,} = require('../request');
    let {getDateVnum,toThousands,printVoucher,GetLocalStorage,urlParam} = require('../tool');
    let { Card, Col, Row ,Button,Table,Input ,
        DatePicker,Popconfirm,message,Modal,Icon,Select   } = require('antd');
    const {Option} = Select;
    const RangePicker = DatePicker.RangePicker;
    class Query_Certificate extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                editModal:false,
                checkModal:false,
                data : [],
                searchDate: [moment().startOf('month'), moment().endOf('month')],
                searchNum:'',
                summary:'',
                pageNum:1,
                page:{},
                loading:false,
                confirmLoading: false,
                checkInfo:{},
                editInfo:{},
                dateVnum:{vnum:'',date_:moment().format('YYYY-MM-D')},
                openIndex:'',
                openDate:false,
                query_size:'',
                user:''
            };
        }

        componentDidMount() {
            this.initContent(this.props);
            let cb = (data)=>{
                let par = urlParam();
                let date_ = [];
                if(par.date_){
                    console.log('has get param',par.date_);
                    date_ = par.date_.split('_');
                }else {
                    date_[0] = moment(data.date_).startOf('month');
                    date_[1] = moment(data.date_).endOf('month');
                }
                this.setState({
                    searchDate: [moment(date_[0]),moment(date_[1])],
                    dateVnum:data
                },()=>{
                    this.setPage(1);
                    console.log(this.state.dateVnum)
                });
            };
            getDateVnum(cb);
        }

        componentWillReceiveProps(nextProps, nextContext){
            if(nextProps.data){
                this.initContent(nextProps);
            }
        }
        initContent(props){
            let data = [];
            props.data.map((con,i)=>{
                data[i] = {};
                data[i].date = con.tran_date;
                data[i].index = con.id;
                data[i].type = con.type;
                data[i].key = i+1;
                data[i].account = con.amount;
                data[i].summary = con.gl_trans_memo;
                data[i].user = con.person_type_id;
                data[i].number = con.reference;
            });
            this.setState({
                data:data,
                page:props.page,
                loading:false,
            })
        }

        changeDate(dates,dateStrings){
            this.setState({
                searchDate: dates,
                openDate:false
            })
        }
        changeNum(e){
            this.setState({
                searchNum: e.target.value
            })
        }
        changeSummary(e){
            this.setState({
                summary: e.target.value
            })
        }
        setPage(page){
            this.setState({
                pageNum:page,
                loading:true,
            },()=>{
                this.goSearch(page);
            })
        }
        goSearch(){
            // console.log(this.props);
            let search = {
                searchDate: moment(this.state.searchDate[0]).format('YYYY-MM-D')+'_'+moment(this.state.searchDate[1]).format('YYYY-MM-D'),
                searchNum:this.state.searchNum,
                summary:this.state.summary,
                page:this.state.pageNum
            };
            if(this.state.query_size){
                search.page_site = this.state.query_size;
            }
            if(!search.searchDate[0]){
                message.warning('请选择搜索的时间段');
                return ;
            }else if(this.state.searchDate.length == 0){
                search.searchDate = '';
            }
            this.props.searchDate(search);
        }
        deleteItem(item){
            console.log(item);
            let type = {
                type: 'refs/delete',
                method: 'FormData',
                Method: 'POST'
            };
            let params = {
                id:item.index,
                type:item.type,
                description:item.summary
            };
            let cb = (data) => {
                if (data.code == 0) {
                    this.goSearch();
                }
            };
            Request(params,cb,type);
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
        showModal(modal,item,index){
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
                id:item.index,
            };
            let cb = (data) => {
                if (data.code == 0) {
                    console.log(data.info);
                }
                if(modal == 'edit'){
                    this.props.initCertificate(data.info,false,true);
                }else if(modal == 'check'){
                    checkTable.push(data.info.Refs);
                    let showUsd = false;
                    let showQty = false;
                    let Usd = other[0];
                    let Rate = other[1];
                    let Qty = other[2];
                    let Price = other[3];
                    let user = data.info.audit.op_info;
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
                        printId:item.index,
                        checkModal:true,
                        openIndex:index,
                        checkInfo:{topLabel:checkLabel,topTable:checkTable,contentLabel:listLabel,contentTable:listTable}
                    });
                }
            };
            Request(params,cb,type);
        }
        hideModal(modal,dosomething){
            if(modal == 'edit'){
                this.setState({
                    editModal:false,
                })
            }else if(modal == 'check'){
                if(dosomething == 'print'){
                    // window.print();
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
                        confirmLoading:false,
                        checkModal:false,
                    })
                }
            }
        }
        onOpenChange(openDate){
            this.setState({openDate})
        }
        changeSize(query_size) {
            this.setState({query_size},()=>{
                this.setPage(1)
            });
        }
        render() {
            const columns = [
                {
                    title: '日期',
                    dataIndex: 'date',
                    key: 'date',
                    sorter:(a,b)=> moment(a.date)-moment(b.date)
                }, {
                    title: '类型',
                    dataIndex: 'type',
                    key: 'type',
                }, {
                    title: '业务',
                    dataIndex: 'index',
                    key: 'index',
                }, {
                    title: '凭证号',
                    dataIndex: 'number',
                    key: 'number',
                }, {
                    title: '字号',
                    dataIndex: 'key',
                    key: 'key',
                    sorter:(a,b)=> a.key-b.key,
                }, {
                    title: '金额',
                    dataIndex: 'account',
                    key: 'account',
                    render:(text,item)=>{
                        item.account = Number(item.account).toFixed(2);
                        return <div className="right">{toThousands(item.account)}</div>;
                    },
                    sorter:(a,b)=> a.account-b.account,
                }, {
                    title: '摘要',
                    dataIndex: 'summary',
                    key: 'summary',
                    render:(text)=>{
                        return <div style={{minWidth:'150px'}}>{text}</div>
                    }
                },{
                    title: '操作',
                    dataIndex: 'option',
                    key: 'option',
                    render:(text, record, index)=>{
                        return <div className="center">
                            <Button onClick={this.showModal.bind(this,'check',record,index)} shape="circle" icon="search"/>
                            <Button onClick={this.showModal.bind(this,'edit',record)} shape="circle" icon="edit"/>
                            <Popconfirm placement="leftTop" title="是否删除凭证"
                                        onConfirm={this.deleteItem.bind(this,record)}
                                        okText="确定" cancelText="取消">
                                <Button shape="circle" icon="delete"/>
                            </Popconfirm>
                        </div>
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
                        date:[moment(this.state.searchDate[0]).subtract(1, 'month').startOf('month'), moment(this.state.searchDate[1]).subtract(1, 'month').endOf('month')],
                    },
                    to:{
                        title:'往后一个月',
                        icon:'right',
                        date:[moment(this.state.searchDate[0]).add(1, 'month').startOf('month'), moment(this.state.searchDate[1]).add(1, 'month').endOf('month')],
                    }
                },
                {
                    from:{
                        title:'往前一年',
                        icon:'double-left',
                        date:[moment(this.state.searchDate[0]).subtract(1, 'year').startOf('year'), moment(this.state.searchDate[1]).subtract(1, 'year').endOf('year')],
                    },
                    to:{
                        title:'往后一年',
                        icon:'double-right',
                        date:[moment(this.state.searchDate[0]).add(1, 'year').startOf('year'), moment(this.state.searchDate[1]).add(1, 'year').endOf('year')],
                    }
                },
            ];
            return (
                <div className="gen-certificate">
                    <Card title={<h1 className="certificate-title">凭证查询</h1>}
                          bordered={true} style={{minHeight:'100%'}}>
                        <Row type="flex" justify="space-between">
                            <Col xs={6}>
                                日期：<RangePicker value={this.state.searchDate}
                                                open={this.state.openDate} mode="month"
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
                                                }
                                                format="YYYY-MM-D"
                                                onChange={this.changeDate.bind(this)}/>
                            </Col>
                            <Col xs={4}>
                                凭证号：<Input defaultValue={this.state.searchNum} onBlur={this.changeNum.bind(this)} style={{width:"6rem"}}/>
                            </Col>
                            <Col xs={4}>
                                摘要：<Input defaultValue={this.state.summary} onBlur={this.changeSummary.bind(this)} style={{width:"10rem"}}/>
                            </Col>
                            <Col xs={4}>
                                <Button type="primary" icon="search" onClick={this.setPage.bind(this,1)}>显示</Button>
                            </Col>
                            <Col xs={4}>
                                每页显示条数：
                                <Select defaultValue={this.state.query_size}
                                        style={{width:"6rem"}} allowClear
                                        onChange={this.changeSize.bind(this)}>
                                    <Option value={50}>50</Option>
                                    <Option value={100}>100</Option>
                                    <Option value={200}>200</Option>
                                    <Option value={500}>500</Option>
                                </Select>
                            </Col>
                        </Row>
                        <div className="certificate-table">
                            <Table bordered size="small"
                                   loading={this.state.loading}
                                   dataSource={this.state.data}
                                   columns={columns}
                                   pagination={{
                                       onChange:this.setPage.bind(this),
                                       current:this.state.pageNum,
                                       pageSize:this.state.page.PageSize,
                                       total:this.state.page.totalCount
                                   }}/>
                        </div>
                        <Modal visible={this.state.checkModal}
                               width="960"
                               title="记账凭证"
                               okText="打印"
                               cancelText="关闭"
                               confirmLoading={this.state.confirmLoading}
                               onOk={this.hideModal.bind(this,'check','print')}
                               onCancel={this.hideModal.bind(this,'check')}>
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
                                        onClick={this.showModal.bind(this,'check',this.state.data[this.state.openIndex-1],this.state.openIndex-1)}
                                        disabled={this.state.openIndex==0}>
                                    上一条
                                </Button>
                                <Button className="genson-block-center"
                                        onClick={this.showModal.bind(this,'check',this.state.data[this.state.openIndex+1],this.state.openIndex+1)}
                                        disabled={this.state.openIndex==(this.state.data.length-1)}>
                                    下一条
                                </Button>
                            </Row>
                        </Modal>
                    </Card>
                </div>
            );
        }
    }

    module.exports = Query_Certificate;
})();