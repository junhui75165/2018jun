/**
 * Created by junhui on 2017/6/6.
 */
(function () {
    'use strict';
    let React = require('react');
    let moment = require('moment');
    let {Request, } = require('../request');
    let Global = require('../Global');
    let {  Col, Row ,Button,Table,DatePicker,message,Modal,Icon} = require('antd');
    let {getDateVnum,toThousands,GetLocalStorage} = require('../tool');
    const RangePicker  = DatePicker.RangePicker ;
    class CheckLog extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                date:[moment().startOf('month'),moment().endOf('month')],
                page:{totalCount:0,PageSize:9},
                list:[],
                isDel:false,
                modList:[],
                pageNum:1,
                item:[],
                visible:false,
                loading:false,
                content:[],
                dateVnum:{vnum:'',date_:moment().format('YYYY-MM-D')},
                openIndex:'',
                openDate:false
            }
        }

        componentDidMount() {
            let cb = (data)=>{
                this.setState({
                    date: [moment(data.date_).startOf('month'),
                        moment(data.date_).endOf('month')],
                    dateVnum:data
                },()=>{
                    this.getList();
                    console.log(this.state.dateVnum)
                });
            };
            getDateVnum(cb);
        }
        getList(){
            const type = {
                type:'audit-trail/index',
                method:'GET'
            };
            let cb = (data)=>{
                let content = data.info;
                this.setState({
                    list:content.list,
                    page:content.pages,
                    loading:false
                })
            };
            let par = {
                date_:moment(this.state.date[0]).format('YYYY-MM-D')+'_'+moment(this.state.date[1]).format('YYYY-MM-D'),
                page:this.state.pageNum-1
            };
            this.setState({
                loading:true,
            },()=>{
                Request(par,cb,type);
            });
        }

        changeDate(date){
            this.setState({
                date:date,
                openDate:false
            });
        }

        changePage(page, pageSize){
            this.setState({
                pageNum:page
            },()=>{
                this.getList();
            })
        }
        setModal(item,index){
            let con = [];
            con.push(item);
            this.setState({
                item:con,
                openIndex:index
                },()=>{
                this.getDetail(item.id);
                console.log(item)
            })
        }
        getDetail(id){
            const type = {
                type:'audit-trail/view',
                method:'GET'
            };
            let cb = (data)=>{
                let list = data.info.gl_trans;
                let isDel = false;
                let modList = [];
                if(list.length == 0){
                    list = data.info.void_gl_trans;
                    isDel = true;
                }
                if(data.info.void_gl_trans.length>0){
                    modList = data.info.void_gl_trans;
                }
                this.setState({
                    visible:true,
                    content:list,
                    isDel,
                    modList
                },()=>{
                    console.log('content',this.state.content,'\n modList',modList)
                })
            };
            let par = {id:id};
            Request(par,cb,type);
        }
        handleOk(){
            this.setState({
                visible:false
            })
        }
        handleCancel(){
            this.setState({
                visible:false
            })
        }
        onOpenChange(openDate){
            this.setState({openDate})
        }
        render() {
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
                        date:[moment(this.state.date[0]).subtract(1, 'month').startOf('month'), moment(this.state.date[1]).subtract(1, 'month').endOf('month')],
                    },
                    to:{
                        title:'往后一个月',
                        icon:'right',
                        date:[moment(this.state.date[0]).add(1, 'month').startOf('month'), moment(this.state.date[1]).add(1, 'month').endOf('month')],
                    }
                },
                {
                    from:{
                        title:'往前一年',
                        icon:'double-left',
                        date:[moment(this.state.date[0]).subtract(1, 'year').startOf('year'), moment(this.state.date[1]).subtract(1, 'year').endOf('year')],
                    },
                    to:{
                        title:'往后一年',
                        icon:'double-right',
                        date:[moment(this.state.date[0]).add(1, 'year').startOf('year'), moment(this.state.date[1]).add(1, 'year').endOf('year')],
                    }
                },
            ];
            const title = [
                {
                    title:'业务编号',
                    dataIndex:'trans_no',
                    key:'trans_no',
                    render:(text,item)=>{
                        return item.audit_type == 1?text:'';
                    }
                },
                {
                    title:'总账日期',
                    dataIndex:'gl_date',
                    key:'gl_date'
                },
                {
                    title:'用户',
                    dataIndex:'op_info',
                    key:'op_info',
                    render:(text,item)=>{
                        return `${item.user_id}@${text}`
                    }
                },
                {
                    title:'描述',
                    dataIndex:'description',
                    key:'description',
                },
                {
                    title:'记账日期',
                    dataIndex:'stamp',
                    key:'stamp',
                    render:(text,item)=>{
                        return item.audit_type == 1?text:'';
                    }
                },
                {
                    title:'凭证号',
                    dataIndex:'reference',
                    key:'reference',
                    render:(text,item)=>{
                        return item.audit_type == 1?text:'';
                    }
                },
                {
                    title:'详情',
                    dataIndex:'detail',
                    key:'detail',
                    render:(text,item,index)=>{
                        return item.audit_type == 1?
                            <Button icon="search" shape="circle" onClick={this.setModal.bind(this,item,index)}/>:'';
                    }
                },
            ];
            const modalTop = [
                {
                    title:'业务号',
                    dataIndex:'id',
                    key:'id'
                },
                {
                    title:'凭证号',
                    dataIndex:'reference',
                    key:'reference'
                },
                {
                    title:'日期',
                    dataIndex:'gl_date',
                    key:'gl_date'
                },
                {
                    title:'操作说明',
                    dataIndex:'description',
                    key:'description'
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
                },
            ];
            const modalContent = [
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
            let table = this.state.content;
            let modList = this.state.modList;
            let showUsd = false;
            let showQty = false;
            let Usd = other[0];
            let Rate = other[1];
            let Qty = other[2];
            let Price = other[3];
            table.map((con,i)=>{
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
            modList.map((con,i)=>{
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
                modalContent.splice(3,0,Qty,Price);
            }
            if(showUsd){
                modalContent.splice(3,0,Usd,Rate);
            }
            return (
                <div>
                    <Row>
                        <Col xs={16} md={12} lg={9}>
                            日期：<RangePicker value={this.state.date}
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
                                            onChange={this.changeDate.bind(this)}/>
                        </Col>
                        <Col>
                            <Button icon="search" type="primary" onClick={this.getList.bind(this)}>搜索</Button>
                        </Col>
                    </Row>
                    <Row className="certificate-table">
                        <Table columns={title} dataSource={this.state.list}
                               bordered loading={this.state.loading} size="small"
                               pagination={{
                                   total:Number(this.state.page.totalCount),
                                   pageSize:this.state.page.PageSize,
                                   onChange:this.changePage.bind(this)
                               }}/>
                    </Row>
                    <Modal visible={this.state.visible} title="记账凭证"
                           onOk={this.handleOk.bind(this)}
                           width="960"
                           onCancel={this.handleCancel.bind(this)}>
                        <Table columns={modalTop} dataSource={this.state.item} bordered size="small"
                               pagination={false} className="certificate-table"/>
                        <h2 className="genson-margin-top">详细列表：</h2>
                        <Table className="certificate-table" columns={modalContent} size="small"
                                dataSource={this.state.content} bordered pagination={false}/>
                        <h3 className="genson-margin-top" style={{display:this.state.isDel&&this.state.content.length>0?'block':'none'}}>
                            该个业务已被作废。作废日期：{this.state.content[0]?this.state.content[0].void_time:''}
                        </h3>
                        <div className="genson-margin-top" style={{display:this.state.modList.length>0&&!this.state.isDel?'block':'none'}}>
                            <h3>
                                该个业务已被修改。修改日期：{this.state.modList[0]?this.state.modList[0].void_time:''}
                            </h3>
                            <Table className="certificate-table" columns={modalContent} size="small"
                                   dataSource={this.state.modList} bordered pagination={false}/>
                        </div>
                        <Row className="genson-margin-top" type="flex" justify="space-around">
                            <Button className="genson-block-center"
                                    onClick={this.setModal.bind(this,this.state.list[this.state.openIndex-1],this.state.openIndex-1)}
                                    disabled={this.state.openIndex==0}>
                                上一条
                            </Button>
                            <Button className="genson-block-center"
                                    onClick={this.setModal.bind(this,this.state.list[this.state.openIndex+1],this.state.openIndex+1)}
                                    disabled={this.state.openIndex==(this.state.list.length-1)}>
                                下一条
                            </Button>
                        </Row>
                    </Modal>
                </div>
            );
        }

    }
    module.exports = CheckLog;
})();