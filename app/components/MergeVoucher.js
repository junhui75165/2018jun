/**
 * Created by junhui on 2017/5/18.
 */
(function () {
    'use strict';
    let React = require('react');
    let moment = require('moment');
    let {Request, } = require('../request');
    let Global = require('../Global');
    let {  Col, Row ,Button,Table,message,DatePicker,Transfer,Icon} = require('antd');
    let {getDateVnum,toThousands,GetLocalStorage} = require('../tool');
    const {RangePicker } = DatePicker;
    const columns = [
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
    class MergeVoucher extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                date:[moment().startOf('month'),moment().endOf('month')],
                targetKeys:[],
                dataSource:[],
                table:[],
                display:false,
                columns:columns,
                dateVnum:{vnum:'',date_:moment().format('YYYY-MM-D')},
                openDate:false
            }
        }

        componentDidMount() {
            let cb = (data)=>{
                this.setState({
                    date:[moment(data.date_).startOf('month'),moment(data.date_).endOf('month')],
                    dateVnum:data
                },()=>{
                    this.getDataSource();
                })
            };
            getDateVnum(cb);
        }

        getDataSource(){
            let par = {
                date_:moment(this.state.date[0]).format('YYYY-MM-D')+'_'+moment(this.state.date[1]).format('YYYY-MM-D'),
                memo_:'',
                vnum:'',
                page:0,
                is_page:false
            };
            const type = {
                type:'refs/index',
                method:'GET'
            };
            let cb = (data)=>{
                let list = data.info.list;
                list.map((item)=>{
                    item.key = item.id;
                    item.amount = Number(item.amount).toFixed(2);
                });
                this.setState({
                    dataSource:this.state.dataSource.concat(list),
                    targetKeys:[]
                })
            };
            this.setState({
                dataSource:[]
            },()=>{
                Request(par,cb,type);
            });
        }
        searchView(id){
            const type = {
                type:'refs/view',
                method:'GET'
            };
            let label = [
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
            let par = {id:id};
            let cb = (data)=>{
                let showUsd = false;
                let showQty = false;
                let Usd = other[0];
                let Rate = other[1];
                let Qty = other[2];
                let Price = other[3];
                let list = data.info.GlTrans;
                list.map((con)=>{
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
                    con.key = con.counter;
                });
                if(showQty){
                    label.splice(3,0,Qty,Price);
                }
                if(showUsd){
                    label.splice(3,0,Usd,Rate);
                }
                let table = this.state.table;
                this.setState({
                    table:table.concat(list),
                    columns:label
                })
            };
            Request(par,cb,type);
        }

        showTable(){
            const type = {
                type:'refs/merge-voucher',
                method:'FormData',
                Method:'POST'
            };
            let cb = (data)=>{
                message.success('已合并凭证');
                this.setState({
                    targetKeys:[],
                },()=>{
                    this.preview(false);
                    this.getDataSource();
                });
            };
            let par = {};
            this.state.targetKeys.map((id,index)=>{
                par[`refs[${index}]`] = id;
            });
            console.log(par);
            Request(par,cb,type);
        }

        changeDate(date){
            this.setState({
                date:date,
                openDate:false
            })
        }
        handleChange (nextTargetKeys, direction, moveKeys){
            this.setState({ targetKeys: nextTargetKeys });
            console.log('targetKeys: ', nextTargetKeys);
            console.log('direction: ', direction);
            console.log('moveKeys: ', moveKeys);
        }
        preview(type){
            this.setState({
                display:type,
                table:[]
            },()=>{
                if(type){
                    let list = this.state.targetKeys;
                    list.map((id)=>{
                        this.searchView(id)
                    })
                }
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
            let tableSource = this.state.table;
            let itemTotal = {
                account:'总计',
                debit:0,
                lender:0
            };
            tableSource.map((con)=>{
                // let amount = con.amount;
                if(con.debit){
                    itemTotal.debit += Number(con.debit);
                }else {
                    itemTotal.lender += Number(con.lender);
                }
            });
            itemTotal.debit = itemTotal.debit.toFixed(2);
            itemTotal.lender = itemTotal.lender.toFixed(2);
            tableSource = tableSource.concat(itemTotal);
            return (
                <div>
                    <Row>
                        <Col xs={8}>
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
                        <Col xs={3}>
                            <Button icon="search" type="primary" onClick={this.getDataSource.bind(this)}>搜索</Button>
                        </Col>
                        <Col xs={3}>
                            <Button type="primary" onClick={this.preview.bind(this,true)}>预览合并凭证</Button>
                        </Col>
                    </Row>
                    <Row className="genson-margin-top">
                        <Transfer
                            dataSource={this.state.dataSource}
                            titles={['凭证列表', '合并凭证']}
                            listStyle={{
                                width: 450,
                                height: 350,
                            }}
                            operations={['添加合并', '取消合并']}
                            notFoundContent="列表为空"
                            targetKeys={this.state.targetKeys}
                            onChange={this.handleChange.bind(this)}
                            onScroll={this.handleScroll}
                            render={item => item.reference+`：${item.type} 费用：${item.amount}元`}
                        />
                    </Row>
                    <div className="genson-margin-top" style={{display:this.state.display?'block':'none'}}>
                        <Row>
                            <Col xs={3}>
                                <Button type="primary" icon="sync" onClick={this.showTable.bind(this)}>合并凭证</Button>
                            </Col>
                        </Row>
                        <Row className="certificate-table">
                            <Table dataSource={tableSource} columns={this.state.columns} size="small"
                                   bordered pagination={false}/>
                        </Row>
                    </div>
                </div>
            );
        }

    }
    module.exports = MergeVoucher;
})();