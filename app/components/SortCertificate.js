/**
 * Created by junhui on 2017/5/8.
 */
(function () {
    'use strict';
    let React = require('react');
    let moment = require('moment');
    let {Request, } = require('../request');
    let { Card, Col, Row ,Button,Table,DatePicker,message,Modal,Icon,Select  } = require('antd');
    const {Option} = Select;
    const RangePicker = DatePicker.RangePicker;
    let {getDateVnum,toThousands,printVoucher,GetLocalStorage} = require('../tool');
    class SortCertificate extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                searchDate:[moment().startOf('month'),moment().endOf('month')],
                table:[],
                page:{
                    "totalCount": "1",
                    "PageSize": 9,
                    current:1
                },
                visible:false,
                confirmLoading:false,
                loading:true,
                checkInfo:{},
                dateVnum:{vnum:'',date_:moment().format('YYYY-MM-D')},
                openIndex:'',
                openDate:false,
                page_site:'',
                user:'',
            }
        }

        componentDidMount() {
            let cb = (data)=>{
                this.setState({
                    searchDate: [moment(data.date_).startOf('month'),
                        moment(data.date_).endOf('month')],
                    dateVnum:data
                },()=>{
                    console.log(this.state.dateVnum)
                });
            };
            getDateVnum(cb);
        }

        componentWillMount() {
            console.log(this.props.data);
            this.setTable(this.props.data,this.props.page)
        }

        componentWillReceiveProps(nextProps, nextContext) {
            console.log(nextProps.data);
            this.setTable(nextProps.data,nextProps.page)
        }

        setTable(data,nPage){
            let page = this.state.page;
            page.PageSize = nPage.PageSize;
            page.totalCount = nPage.totalCount;
            this.setState({
                table:data,
                page:page,
                loading:false
            })
        }
        changeDate(date,dateString){
            console.log(date);
            this.setState({
                searchDate:date,
                openDate:false
            })
        }
        goSearch(){
            let par = {
                page:this.state.page.current-1,
                date_:this.state.searchDate[0].format('YYYY-MM-D')+'_'+this.state.searchDate[1].format('YYYY-MM-D'),
            };
            if(this.state.page_site){
                par.page_site = this.state.page_site;
            }
            this.props.search(par);
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
        sortTable(){
            const url = {
                type:'refs/sort',
                method:'GET'
            };
            let par = {
                date_:this.state.searchDate[0].format('YYYY-MM-DD')+'_'+this.state.searchDate[1].format('YYYY-MM-D'),
            };
            let cb = (data)=>{
                message.success('重新排序成功！');
                this.changePage(1);
            };
            Request(par,cb,url);
        }
        showModal(item,index){
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
            let type = {
                type: 'refs/view',
                method: 'GET',
            };
            let params = {
                id:item.id,
            };
            let cb = (data) => {
                let showUsd = false;
                let showQty = false;
                let Usd = other[0];
                let Rate = other[1];
                let Qty = other[2];
                let Price = other[3];
                if (data.code == 0) {
                    console.log(data.info);
                }
                checkTable.push(data.info.Refs);
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
                    printId:item.id,
                    visible:true,
                    openIndex:index,
                    checkInfo:{topLabel:checkLabel,topTable:checkTable,contentLabel:listLabel,contentTable:listTable}
                });
            };
            Request(params,cb,type);
        }
        hideModal(type){
            if(type=='print'){
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
        changePage(page, pageSize){
            let pages = this.state.page;
            pages.current = page;
            this.setState({
                page:pages,
                loading:true
            },()=>{
                this.goSearch();
            })
        }
        onOpenChange(openDate){
            this.setState({openDate})
        }
        changeSize(page_site) {
            this.setState({page_site},()=>{
                this.changePage.bind(this,1)();
            });
        }
        render() {
            let columns = [
                {
                    title:'日期',
                    key:'tran_date',
                    dataIndex:'tran_date'
                },
                {
                    title:'类型',
                    key:'type',
                    dataIndex:'type'
                },
                {
                    title:'业务',
                    key:'id',
                    dataIndex:'id'
                },
                {
                    title:'凭证号',
                    key:'reference',
                    dataIndex:'reference',
                    render:(text,item,index)=>{
                        return <a onClick={this.showModal.bind(this,item,index)}>{text}</a>
                    }
                },
                {
                    title:'字号',
                    key:'vnum',
                    dataIndex:'vnum',
                    sorter: (a, b) => a.vnum - b.vnum,
                },
                {
                    title:'金额',
                    key:'amount',
                    dataIndex:'amount',
                    render:(text)=>{
                        return <div className="right">{toThousands(text)}</div>
                    }
                },
                {
                    title:'摘要',
                    key:'memo_',
                    dataIndex:'memo_',
                },
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
                    <Card title={<h1 className="certificate-title">凭证字号整理排序</h1>}
                          bordered={true}>
                        <Row type="flex" justify="space-between">
                            <Col xs={9}>
                                日期：<RangePicker value={this.state.searchDate}
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
                                                }
                                                format="YYYY-MM-DD"
                                                onChange={this.changeDate.bind(this)}/>
                            </Col>
                            <Col xs={2}>
                                <Button type="primary" icon="search" onClick={this.changePage.bind(this,1)}>搜索</Button>
                            </Col>
                            <Col xs={4}>
                                <Button onClick={this.sortTable.bind(this)}>凭证号重新排序</Button>
                            </Col>
                            <Col xs={6}>
                                每页显示条数：
                                <Select value={this.state.page_site}
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
                            <Table bordered dataSource={this.state.table} size="small"
                                   loading={this.state.loading}
                                   pagination={
                                       {
                                           current:this.state.page.current,
                                           total:Number(this.state.page.totalCount),
                                           pageSize:this.state.page.PageSize,
                                           onChange:this.changePage.bind(this)
                                       }
                                   }
                                   columns={columns}/>
                        </Row>
                        <Modal visible={this.state.visible}
                               width="960"
                               confirmLoading={this.state.confirmLoading}
                               title="记账凭证"
                               okText="打印"
                               cancelText="关闭"
                               onOk={this.hideModal.bind(this,'print')}
                               onCancel={this.hideModal.bind(this)}>
                            <div id="section-to-print" className="certificate-table">
                                <Table bordered pagination={false} size="small"
                                       dataSource={this.state.checkInfo.topTable}
                                       columns={this.state.checkInfo.topLabel} />
                                <Table style={{marginTop:'1rem'}} bordered pagination={false}
                                       dataSource={this.state.checkInfo.contentTable} size="small"
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
    module.exports = SortCertificate;
})();