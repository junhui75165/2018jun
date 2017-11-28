/**
 * Created by junhui on 2017/4/25.
 */
(function () {
    'use strict';
    let React = require('react');
    let Global = require('../Global');
    let moment = require('moment');
    let { Card, Col, Row ,Button,Table,Input ,Icon,Modal,Checkbox,Select,DatePicker  } = require('antd');
    const { Option, OptGroup } = Select;
    const {  RangePicker } = DatePicker;
    let {hashHistory} =require('react-router');
    let {getDateVnum,GetLocalStorage} = require('../tool');

    let {columns,AColumns} = {};
    class TrialBalance extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                columns:columns,
                table:[],
                date:[moment().startOf('month'), moment().endOf('month')],
                level:0,
                loading:false,
                displayNum:false,
                displayAccount:false,
                dateVnum:{vnum:'',date_:moment().format('YYYY-MM-D')},
                openDate:false
            };
        }

        componentWillMount() {
            columns = [
                {
                    title: '科目',
                    dataIndex: 'subject',
                    key: 'subject',
                    sorter: (a, b) => a.subject - b.subject,
                    width:'8%',
                    render:(text,item)=>{
                        if(item.is_detail_account){
                            return <div className="left" onClick={this.goAccountBook.bind(this,text)}><a>{(text)}</a></div>
                        }else if(item.end){
                            return <h3 className="left genson-font-bold">{text}</h3>
                        }else {
                            return <h3 className="left genson-font-bold" onClick={this.goAccountBook.bind(this,text)}><a>{text}</a></h3>
                        }
                    }
                },
                {
                    title: '科目名称',
                    dataIndex: 'name',
                    key: 'name',
                    width:'20%',
                    render:(text,item)=>{
                        if(item.is_detail_account){
                            return <div className="left" style={{textIndent:item.level+'rem'}}>{(text)}</div>
                        }else {
                            return <h3 className="left genson-font-bold" style={{textIndent:item.level+'rem'}}>{text}</h3>
                        }
                    }
                },
                {
                    title: '期初余额',
                    children:[
                        {
                            title: '借方',
                            dataIndex: 'ObDebit',
                            key: 'ObDebit',
                            width:'12%',
                            render:(text,item)=>{
                                return <div className='right'>{(text)}</div>
                            }
                        },
                        {
                            title: '贷方',
                            dataIndex: 'ObLender',
                            key: 'ObLender',
                            width:'12%',
                            render:(text,item)=>{
                                return <div className='right'>{(text)}</div>
                            }
                        },
                    ]
                },
                {
                    title: '本期发生额',
                    children:[
                        {
                            title: '借方',
                            dataIndex: 'TbDebit',
                            key: 'TbDebit',
                            width:'12%',
                            render:(text,item)=>{
                                return <div className='right'>{(text)}</div>
                            }
                        },
                        {
                            title: '贷方',
                            dataIndex: 'TbLender',
                            key: 'TbLender',
                            width:'12%',
                            render:(text,item)=>{
                                return <div className='right'>{(text)}</div>
                            }
                        },
                    ]
                },
                {
                    title: '期末余额',
                    children:[
                        {
                            title: '借方',
                            dataIndex: 'EbDebit',
                            key: 'EbDebit',
                            width:'12%',
                            render:(text,item)=>{
                                return <div className='right'>{(text)}</div>
                            }
                        },
                        {
                            title: '贷方',
                            dataIndex: 'EbLender',
                            key: 'EbLender',
                            width:'12%',
                            render:(text,item)=>{
                                return <div className='right'>{(text)}</div>
                            }
                        },
                    ]
                },
            ];
            AColumns = [
                {
                    title: '科目',
                    dataIndex: 'subject',
                    key: 'subject',
                    width:'8%',
                    sorter: (a, b) => a.subject - b.subject,
                    render:(text,item)=>{
                        if(item.is_detail_account){
                            return <div className="left" onClick={this.goAccountBook.bind(this,text)}><a>{(text)}</a></div>
                        }else if(item.end){
                            return <h3 className="left genson-font-bold">{text}</h3>
                        }else {
                            return <h3 className="left genson-font-bold" onClick={this.goAccountBook.bind(this,text)}><a>{text}</a></h3>
                        }
                    }
                },
                {
                    title: '科目名称',
                    dataIndex: 'name',
                    key: 'name',
                    width:'19%',
                    render:(text,item)=>{
                        if(item.is_detail_account){
                            return <div className="left" style={{textIndent:item.level+'rem'}}>{(text)}</div>
                        }else {
                            return <h3 className="left genson-font-bold" style={{textIndent:item.level+'rem'}}>{text}</h3>
                        }
                    }
                },
                {
                    title: '期初余额',
                    children:[
                        {
                            title: '借方',
                            dataIndex: 'ObDebit',
                            key: 'ObDebit',
                            width:'8%',
                            render:(text,item)=>{
                                return <div className='right'>{(text)}</div>
                            }
                        },
                        {
                            title: '贷方',
                            dataIndex: 'ObLender',
                            key: 'ObLender',
                            width:'8%',
                            render:(text,item)=>{
                                return <div className='right'>{(text)}</div>
                            }
                        },
                    ]
                },
                {
                    title: '本期发生额',
                    children:[
                        {
                            title: '借方',
                            dataIndex: 'TbDebit',
                            key: 'TbDebit',
                            width:'8%',
                            render:(text,item)=>{
                                return <div className='right'>{(text)}</div>
                            }
                        },
                        {
                            title: '贷方',
                            dataIndex: 'TbLender',
                            key: 'TbLender',
                            width:'8%',
                            render:(text,item)=>{
                                return <div className='right'>{(text)}</div>
                            }
                        },
                    ]
                },
                {
                    title: '本年累计',
                    children:[
                        {
                            title: '借方',
                            dataIndex: 'YbDebit',
                            key: 'YbDebit',
                            width:'8%',
                            render:(text,item)=>{
                                return <div className='right'>{(text)}</div>
                            }
                        },
                        {
                            title: '贷方',
                            dataIndex: 'YbLender',
                            key: 'YbLender',
                            width:'8%',
                            render:(text,item)=>{
                                return <div className='right'>{(text)}</div>
                            }
                        },
                    ]
                },
                {
                    title: '期末余额',
                    children:[
                        {
                            title: '借方',
                            dataIndex: 'EbDebit',
                            key: 'EbDebit',
                            width:'8%',
                            render:(text,item)=>{
                                return <div className='right'>{(text)}</div>
                            }
                        },
                        {
                            title: '贷方',
                            dataIndex: 'EbLender',
                            key: 'EbLender',
                            width:'8%',
                            render:(text,item)=>{
                                return <div className='right'>{(text)}</div>
                            }
                        },
                    ]
                },
            ];
            this.setState({columns})
        }

        componentWillReceiveProps(nextProps, nextContext) {
            console.log(nextProps);
            this.setTable(nextProps.data);
        }
        goAccountBook(account){
            let url = '/mainPage/103?'+
                'dateForm='+moment(this.state.date[0]).format('YYYY-MM-DD')+
                '&dateTo='+moment(this.state.date[1]).format('YYYY-MM-DD')+
                '&account_code='+account;
            console.log(url);
            hashHistory.push(url)
        }
        componentDidMount() {
            this.setTable(this.props.data);
            let cb = (data)=>{
                this.setState({
                    date: [moment(data.date_).startOf('month'),
                        moment(data.date_).endOf('month')],
                    dateVnum:data
                },()=>{
                    this.searchData();
                    // console.log(this.state.dateVnum)
                });
            };
            getDateVnum(cb);
        }

        setTable(source){
            let table = [];
            for(let i in source){
                table[table.length] = {};
                table[table.length-1].is_detail_account = !!source[i].is_detail_account;
                table[table.length-1].level = source[i].level;
                if(source[i].code){
                    table[table.length-1].key = source[i].code;
                    table[table.length-1].subject = source[i].code;
                    table[table.length-1].name = source[i].name;
                    table[table.length-1].ObDebit = source[i]['pbal-debit'];
                    table[table.length-1].ObLender = source[i]['pbal-credit'];

                    table[table.length-1].TbDebit = source[i]['cdebit'];
                    table[table.length-1].TbLender = source[i]['ccredit'];

                    table[table.length-1].YbDebit = source[i]['ydebit'];
                    table[table.length-1].YbLender = source[i]['ycredit'];

                    table[table.length-1].EbDebit = source[i]['tbal-debit'];
                    table[table.length-1].EbLender = source[i]['tbal-credit'];
                }else {
                    table[table.length-1].key = i;
                    table[table.length-1].end = true;
                    table[table.length-1].subject = source[i].name;
                    // table[table.length-1].name = source[i].name;
                    table[table.length-1].ObDebit = source[i]['pdeb'];
                    table[table.length-1].ObLender = source[i]['pcre'];

                    table[table.length-1].TbDebit = source[i]['cdeb'];
                    table[table.length-1].TbLender = source[i]['ccre'];

                    table[table.length-1].YbDebit = source[i]['ydeb'];
                    table[table.length-1].YbLender = source[i]['ycre'];

                    table[table.length-1].EbDebit = source[i]['tdeb'];
                    table[table.length-1].EbLender = source[i]['tcre'];
                }
            }
            this.setState({
                table:table,
                loading:false
            });
        }
        searchData(){
            let par = {
                trans_from_date:moment(this.state.date[0]).format('YYYY-MM-D'),
                trans_to_date:moment(this.state.date[1]).format('YYYY-MM-D'),
                grade:this.state.level,
                no_zero:this.state.displayNum,
                year_acc:this.state.displayAccount,
            };
            let table = [];
            if(this.state.displayAccount){
                table = AColumns;
            }else {
                table = columns;
            }
            this.setState({
                columns:table,
                loading:true
            },()=>{
                this.props.search(par);
            });
        }
        changeSelect(value){
            this.setState({
                level:value
            })
        }
        changeDate(date,dateString){
            this.setState({
                date:date,
                openDate:false
            });
        }
        changNum(e){
            let value = e.target.checked;
            this.setState({
                displayNum:value
            });
        }
        changeAccount(e){
            let value = e.target.checked;
            this.setState({
                displayAccount:value,
            });
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
            return (
                <div className="gen-certificate">
                    <Card title={<h1 className="certificate-title">试算平衡</h1>}
                          bordered={true}>
                        <Row>
                            <Col xs={6}>
                                日期：<RangePicker value={this.state.date} style={{ width: '80%'}}
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
                                                format="YYYY/MM/DD"
                                                onChange={this.changeDate.bind(this)}/>
                            </Col>
                            <Col xs={6}>
                                科目级别：
                                <Select style={{width:"60%"}} defaultValue="0" onSelect={this.changeSelect.bind(this)}>
                                    <Option value="0">1</Option>
                                    <Option value="1">2</Option>
                                    <Option value="2">3</Option>
                                    <Option value="3">全部</Option>
                                </Select>
                            </Col>
                            <Col xs={3}>
                                <Checkbox checked={this.state.displayNum} onChange={this.changNum.bind(this)}>显示无数值</Checkbox>
                            </Col>
                            <Col xs={6}>
                                <Checkbox checked={this.state.displayAccount} onChange={this.changeAccount.bind(this)}>显示终止日期的本年累计数	</Checkbox>
                            </Col>
                            <Col xs={2}>
                                <Button style={{width:"100%"}} onClick={this.searchData.bind(this)}>查看</Button>
                            </Col>
                        </Row>
                        <Row className="certificate-table" style={{marginTop:'10px'}}>
                            <Table columns={this.state.columns} pagination={false} size="small" loading={this.state.loading}
                                   bordered dataSource={this.state.table}/>
                        </Row>
                    </Card>
                </div>
            );
        }
    }
    module.exports = TrialBalance;
})();