/**
 * Created by junhui on 2017/4/10.
 */
(function () {
    'use strict';
    let React = require('react');
    let moment = require('moment');
    let {Request} = require('./../request');
    let {objToArr,getDateVnum,toThousands,printVoucher,GetLocalStorage,urlParam} = require('../tool');
    let { Card, Col, Row ,Button,Table,Input ,Pagination,
        DatePicker,Select,message,Modal,Icon,Switch} = require('antd');
    const RangePicker = DatePicker.RangePicker;
    const { Option, } = Select;
    let ContentState = {
        data : [],
        searchDate: [moment().startOf('month'), moment().endOf('month')],
        searchNum:'',
        summary:'',
    };

    class AccountBook extends React.Component{
        constructor(props){
            super(props);
            const columns = [
                {
                    title: '日期',
                    dataIndex: 'date',
                    key: 'date',
                    sorter:(a,b)=> moment(a.date)-moment(b.date),
                    render:(text,item)=>{
                        return <span className={item.is_bold?'genson-font-bold':''}>{text}</span>
                    }
                }, {
                    title: '附注(字号)',
                    dataIndex: 'number',
                    key: 'number',
                    render:(text,item,index)=>{
                        if(item.business){
                            return <a className={item.is_bold?'genson-font-bold':''}
                                      onClick={this.showModal.bind(this,item)}>{text}</a>
                        }else {
                            return <span className={item.is_bold?'genson-font-bold':''}>{text}</span>;
                        }
                    }
                }, {
                    title: '业务',
                    dataIndex: 'business',
                    key: 'business',
                    render:(text,item)=>{
                        return <span className={item.is_bold?'genson-font-bold':''}>{text}</span>
                    }
                },{
                    title: '摘要',
                    dataIndex: 'summary',
                    key: 'summary',
                    render:(text,item)=>{
                        return <span className={item.is_bold?'genson-font-bold':''}>{text}</span>
                    }
                },{
                    title: '查看',
                    dataIndex: 'watch',
                    key: 'watch',
                    render:(text, record, index)=>{
                        if(record.business){
                            return <Button onClick={this.showModal.bind(this,record)}
                                           shape="circle" icon="search"
                                           className={record.is_bold?' genson-font-bold':''}/>;
                        }
                    }
                }, {
                    title: '科目',
                    dataIndex: 'subject',
                    key: 'subject',
                    render:(text,item)=>{
                        return <span className={item.is_bold?' genson-font-bold':''}>{text}</span>
                    }
                }, {
                    title: '借方',
                    dataIndex: 'debit',
                    key: 'debit',
                    render:(text)=>{
                        return <div className={'right'+(item.is_bold?' genson-font-bold':'')}>{text}</div>
                    }
                },{
                    title: '贷方',
                    dataIndex: 'Lender',
                    key: 'Lender',
                    render:(text,item)=>{
                        return <div className={'right'+(item.is_bold?' genson-font-bold':'')}>{text}</div>
                    }
                }
            ];
            this.state = {
                max_money:0,
                min_money:0,
                searchDate: [moment().startOf('month'), moment().endOf('month')],
                account_code:this.props.account_code?this.props.account_code:'-1',
                pageNum:1,
                page:{PageSize:10,totalCount:0},
                loading:false,
                confirmLoading:false,
                columns:columns,
                title_currency:'',
                dateVnum:{vnum:'',date_:moment().format('YYYY-MM-D')},
                visible:false,
                checkInfo:{},
                data:[],
                openIndex:'',
                dataId:[],
                dataList:[],
                openDate:false,
                query_size:'',
                user:"",
                inactive:0,//1为显示全部科目(包含隐藏科目)，0只显示非停用科目
                off_count:0,
            }
        }

        componentDidMount() {
            let cb = (data)=>{
                let par = urlParam();
                console.log(par);
                if(par.account_code){
                    this.setState({
                        searchDate: [moment(par.dateForm).startOf('month'),moment(par.dateTo).endOf('month')],
                        dateVnum:data,
                        account_code:par.account_code
                    },()=>{
                        this.setPage(1);
                    });
                }else {
                    this.setState({
                        searchDate: [moment(data.date_).startOf('month'),moment(data.date_).endOf('month')],
                        dateVnum:data
                    });
                }
            };
            getDateVnum(cb);
        }

        componentWillMount() {
            this.getTree();
        }
        componentWillReceiveProps(nextProps, nextContext) {
            this.props = nextProps;
            this.initTable(nextProps);
            if(nextProps.page){
                this.setState({
                    page:nextProps.page,
                })
            }
        }
        getTree(){
            let _this = this;
            let type = {
                // type:'report-form/get-cash-specail-account',
                type:'tree/get-type-master-tree',
                method:'GET',
                // Method:'FormData',
            };
            let callback = function (data) {
                let off_count = data.message.off_count;
                _this.setState({off_count},()=>{
                    let list = objToArr(data.info);
                    let ren = _this.renOption(list,-1);
                    _this.setState({children:ren,});
                });
            };
            let par = {};
            if(_this.state.inactive == 0){
                par.inactive = 0;
            }
            Request(par,callback,type);
        }
        initTable(props){
            // props.other.is_show_currency
            let show_currency = [
                {
                    title:'币别',
                    dataIndex:'curr_code',
                    key:'curr_code',
                    render:(text,item)=>{
                        return <span className={item.is_bold?" genson-font-bold":""}>{text}</span>
                    }
                },
                {
                    title:'汇率',
                    dataIndex:'rate',
                    key:'rate',
                    render:(text,item)=>{
                        if(text == 0){
                            return ''
                        }else {
                            return <span className={item.is_bold?" genson-font-bold":""}>{text}</span>;
                        }
                    }
                },
                {
                    title:'原币',
                    dataIndex:'usd',
                    key:'usd',
                    render:(text,item)=>{
                        return <div className={'right '+(item.is_bold?" genson-font-bold":"")}>{item.usd}</div>
                    }
                },
                {
                    title:'原币*',
                    dataIndex:'usd_',
                    key:'usd_',
                    render:(text,item)=>{
                        return <div className={'right '+(item.is_bold?" genson-font-bold":"")}>{text}</div>
                    }
                },
            ];

            if(props.data){
                ContentState.data = [];
                let account = 0;
                let Num = 0;
                let Usd = 0;
                let dataId = [];
                let dataList = [];
                let title_currency = props.other.title_currency||'';
                const columns = [
                    {
                        title: '日期',
                        dataIndex: 'date',
                        key: 'date',
                        sorter:(a,b)=> moment(a.date)-moment(b.date),
                        render:(text,item)=>{
                            return <span className={item.is_bold?" genson-font-bold":""}>{text}</span>
                        }
                    }, {
                        title: '附注(字号)',
                        dataIndex: 'number',
                        key: 'number',
                        render:(text,item,index)=>{
                            if(item.business){
                                return <a className={item.is_bold?" genson-font-bold":""}
                                          onClick={this.showModal.bind(this,item,index)}>{text}</a>
                            }else {
                                return <span className={item.is_bold?" genson-font-bold":""}>{text}</span>;
                            }
                        }
                    }, {
                        title: '业务',
                        dataIndex: 'business',
                        key: 'business',
                        render:(text,item)=>{
                            return <span className={item.is_bold?" genson-font-bold":""}>{text}</span>
                        }
                    } ,{
                        title: '摘要',
                        dataIndex: 'summary',
                        key: 'summary',
                        render:(text,item)=>{
                            return <span className={item.is_bold?" genson-font-bold":""}>{text}</span>
                        }
                    },{
                        title: '科目',
                        dataIndex: 'subject',
                        key: 'subject',
                        render:(text,item)=>{
                            return <span className={item.is_bold?" genson-font-bold":""}>{text}</span>
                        }
                    }, {
                        title: '借方',
                        dataIndex: 'debit',
                        key: 'debit',
                        render:(text,item)=>{
                            return <div className={'right'+(item.is_bold?" genson-font-bold":"")}>{text}</div>
                        }
                    },{
                        title: '贷方',
                        dataIndex: 'Lender',
                        key: 'Lender',
                        render:(text,item)=>{
                            return <div className={'right'+(item.is_bold?" genson-font-bold":"")}>{text}</div>
                        }
                    }
                ];
                let columns2 = [
                    {
                        title: '日期',
                        dataIndex: 'date',
                        key: 'date',
                        sorter:(a,b)=> moment(a.date)-moment(b.date),
                        render:(text,item)=>{
                            return <span className={item.is_bold?" genson-font-bold":""}>{text}</span>
                        }
                    }, {
                        title: '附注(字号)',
                        dataIndex: 'number',
                        key: 'number',
                        render:(text,item,index)=>{
                            if(item.business){
                                return <a className={item.is_bold?" genson-font-bold":""}
                                          onClick={this.showModal.bind(this,item,index)}>{text}</a>
                            }else {
                                return <span className={item.is_bold?" genson-font-bold":""}>{text}</span>;
                            }
                        }
                    }, {
                        title: '业务',
                        dataIndex: 'business',
                        key: 'business',
                        render:(text,item)=>{
                            return <span className={item.is_bold?" genson-font-bold":""}>{text}</span>
                        }
                    }, {
                        title: '摘要',
                        dataIndex: 'summary',
                        key: 'summary',
                        render:(text,item)=>{
                            return <span className={item.is_bold?" genson-font-bold":""}>{text}</span>
                        }
                    }, {
                        title: '科目',
                        dataIndex: 'subject',
                        key: 'subject',
                        render:(text,item)=>{
                            return <span className={item.is_bold?" genson-font-bold":""}>{text}</span>
                        }
                    }, {
                        title: '借方',
                        dataIndex: 'debit',
                        key: 'debit',
                        render:(text,item)=>{
                            return <div className={'right'+(item.is_bold?" genson-font-bold":"")}>{text}</div>
                        }
                    },{
                        title: '贷方',
                        dataIndex: 'Lender',
                        key: 'Lender',
                        render:(text,item)=>{
                            return <div className={'right'+(item.is_bold?" genson-font-bold":"")}>{text}</div>
                        }
                    },{
                        title: '',
                        dataIndex: 'balance_info',
                        key: 'balance_info',
                        render:(text,item)=>{
                            return <div className={item.is_bold?"genson-font-bold":""}>{text}</div>
                        }
                    },{
                        title: '余额',
                        dataIndex: 'balance',
                        key: 'balance',
                        render:(text,item)=>{
                            return <div className={'right'+(item.is_bold?" genson-font-bold":"")}>{text}</div>
                        }
                    },
                ];
                if(props.other.is_show_currency){
                    columns2.splice(5,0,show_currency[0],show_currency[1],show_currency[2]);
                    if(!props.other.is_show_qty){
                        columns2.splice(columns2.length-1,0,show_currency[3])
                    }
                }
                if(props.other.is_show_qty){
                    columns2.map((item)=>{
                        if(item.key == 'debit'){
                            item.children = [
                                {
                                    title:'数量',
                                    dataIndex:'qtyD',
                                    key:'qtyD',
                                    render:(text,item)=>{
                                        return <div className={'right'+(item.is_bold?" genson-font-bold":"")}>{text}</div>
                                    }
                                },
                                {
                                    title:'价格(原币)',
                                    dataIndex:'priceD',
                                    key:'priceD',
                                    render:(text,item)=>{
                                        if(item.qtyD){
                                            // item.priceD = item.debit/item.qtyD;
                                            return <div className={'right '+(item.is_bold?" genson-font-bold":"")}>{text}</div>
                                        }else {
                                            return '';
                                        }
                                    }
                                },
                                {
                                    title:'金额(本位币)',
                                    dataIndex:'debit',
                                    key:'debit',
                                    render:(text,item)=>{
                                        return <div className={'right'+(item.is_bold?" genson-font-bold":"")}>{text}</div>
                                    }
                                },
                            ];
                        }else if(item.key == 'Lender'){
                            item.children = [
                                {
                                    title:'数量',
                                    dataIndex:'qtyL',
                                    key:'qtyL',
                                    render:(text,item)=>{
                                        return <div className={'right '+(item.is_bold?" genson-font-bold":"")}>{text}</div>
                                    }
                                },
                                {
                                    title:'价格(原币)',
                                    dataIndex:'priceL',
                                    key:'priceL',
                                    render:(text,item)=>{
                                        if(item.qtyL){
                                            // item.priceL = item.Lender/item.qtyL;
                                            return <div className={'right'+(item.is_bold?" genson-font-bold":"")}>{text}</div>
                                        }else {
                                            return '';
                                        }
                                    }
                                },
                                {
                                    title:'金额(本位币)',
                                    dataIndex:'Lender',
                                    key:'Lender',
                                    render:(text,item)=>{
                                        return <div className={'right'+(item.is_bold?" genson-font-bold":"")}>{text}</div>
                                    }
                                },
                            ];
                        }else if(item.key == 'balance'){
                            item.children = [
                                {
                                    title:'数量',
                                    dataIndex:'qtyB',
                                    key:'qtyB',
                                    render:(text,item)=>{
                                        return <div className={'right'+(item.is_bold?" genson-font-bold":"")}>{text}</div>
                                    }
                                },
                                {
                                    title:'价格(原币)',
                                    dataIndex:'priceB',
                                    key:'priceB',
                                    render:(text,item)=>{
                                        if(item.qtyB){
                                            // item.priceL = item.balance/Math.abs(item.qtyB);
                                            return <div className={'right'+(item.is_bold?" genson-font-bold":"")}>{text}</div>
                                        }
                                    }
                                },
                                {
                                    title:'金额(本位币)',
                                    dataIndex:'balance',
                                    key:'balance',
                                    render:(text,item)=>{
                                        return <div className={'right'+(item.is_bold?" genson-font-bold":"")}>{text}</div>
                                    }
                                },
                            ];
                        }
                    })
                }
                if(this.state.account_code&&this.state.account_code!="-1"&&this.state.pageNum==1&&props.other.account_balance){
                    let balance = props.other.account_balance;
                    balance.key = -1;
                    // balance.date = '期初余额 - '+moment(this.state.searchDate[0]).format('YYYY-MM-D');
                    balance.date = balance.type;
                    balance.qtyB = balance.begin_balance_qty;
                    balance.priceB = balance.begin_balance_price;
                    balance.type = "";
                    balance.usd_ = balance.begin_balance_currency;
                    account = Number(balance.balance).toFixed(2);
                    ContentState.data.push(balance);
                }
                for(let date in props.data){
                    let resetDate = moment(date).endOf('month').format('YYYY-MM-D');
                    props.data[date].map((con,i)=>{
                        let item = con;
                        if(con.type_no&&dataId.indexOf(con.type_no)== -1){
                            dataId.push(con.type_no);
                            dataList.push(con)
                        }
                        item.dataId = dataId.length-1;
                        // item.balance = Number(account)+Number(con.amount);
                        // if(con.qty){
                        //     Num = (Number(Num)+Number(con.amount>0?con.qty:con.qty*-1)).toFixed(2);
                        // }
                        // item.qtyB = Num;
                        item.qtyB = con.balance_qty||'';
                        item.priceB = con.balance_price||'';
                        // account = Number((Number(account)+Number(con.amount)).toFixed(2));

                        // item.balance = account;
                        item.balance = con.balance;
                        item.date = con.tran_date;
                        item.key = date+i;
                        item.business = con.type_no;
                        item.number = con.reference;
                        item.type = con.type;
                        item.summary = con.memo_;
                        item.subject = con.account_name;
                        item.is_bold = con.is_bold;
                        if(typeof (con.debit)!='undefined'){
                            /*******本期合计*******/
                            item.debit = con.debit;
                            item.Lender = con.credit;
                            item.qtyD = con.debit_qty||'';
                            item.priceD = con.org_debit_price||'';
                            item.qtyL = con.credit_qty||'';
                            item.priceL = con.org_credit_price||'';
                            item.number = item.type;
                        }else if(typeof (con.yeardebit)!='undefined'){
                            /******本年累计*******/
                            item.debit = con.yeardebit;
                            item.Lender = con.yearcredit;
                            item.qtyD = con.year_debit_qty||'';
                            item.priceD = con.year_org_debit_price||'';
                            item.qtyL = con.year_credit_qty||'';
                            item.priceL = con.year_org_credit_price||'';
                            item.number = item.type;
                        }else {
                            item.debit = con.debit_amount||'';
                            item.Lender = con.credit_amount||'';
                            item.qtyD = con.debit_qty||'';
                            item.priceD = con.debit_price||'';
                            item.qtyL = con.credit_qty||'';
                            item.priceL = con.credit_price||'';
                            // item.usd = item.rate==0?'':(Math.abs(item.amount/item.rate));
                            item.usd = item.original_currency;
                            // if(con.rate&&con.rate!=0){
                            //     Usd = (Number(Usd)+Number(con.amount>0?item.usd:item.usd*-1)).toFixed(2);
                            //     item.usd_ = Usd;
                            // }
                        }
                        // item.content = con;
                        // item.type = '总账凭证输入';
                        item.usd_ = item.balance_original_currency;
                        item.balance_info = con.balance_info;

                        ContentState.data.push(item);
                    });
                    // if(this.state.account_code&&this.state.account_code!="-1"&&props.other.accumulate)
                    // {
                    //     let accumulate = {
                    //         date:resetDate,
                    //         key:resetDate+'accumulate',
                    //         number:'本期合计',
                    //         debit:props.other.accumulate[resetDate][0].debit,
                    //         Lender:props.other.accumulate[resetDate][0].credit,
                    //     };
                    //     if(accumulate.debit||accumulate.Lender){
                    //         ContentState.data.push(accumulate);
                    //     }
                    //     let accyear = {
                    //         date:resetDate,
                    //         key:resetDate+'accyear',
                    //         number:'本年累计',
                    //         debit:props.other.accyear[resetDate][0].yeardebit,
                    //         Lender:props.other.accyear[resetDate][0].yearcredit,
                    //     };
                    //     if(accumulate.debit||accumulate.Lender){
                    //         ContentState.data.push(accyear);
                    //     }
                    // }
                }
                this.setState({
                    data:ContentState.data,
                    page:props.page,
                    loading:false,
                    columns:this.state.account_code&&this.state.account_code=='-1'?columns:columns2,
                    searchNum:ContentState.searchNum,
                    summary:ContentState.summary,
                    title_currency,
                    dataId,dataList
                });
                // console.log(props.data,ContentState)
            }
        }
        changeInv(value){
            let inactive = value?0:1;
            this.setState({inactive},()=>{
                console.log(this.state.inactive);
                this.getTree();
            })
        }
        renOption(list,level){
            level++;
            if(level==0){
                let all = {
                    "name": "全部科目",
                    "id": "-1",
                    "curr_code": "",
                    "sb_type": "",
                    "inactive": "",
                    "open": false
                };
                let changeInv = {
                    "name": "隐藏科目",
                    "id": "-2",
                    "curr_code": "",
                    "sb_type": "",
                    "inactive": "",
                    "open": false,
                    "disabled":true,
                };
                list.unshift(all,changeInv);
            }
            let ren = list.map((data1)=>{
                if(data1.open){
                    let optGroup = [];
                    let optChild = [];
                    let optParent = <Option key={data1.id} title={data1.id+" - "+data1.name} value={data1.id} disabled={data1.disabled}>
                        <div style={{textIndent:(level)*0.75+'rem'}}>{data1.id+" - "+data1.name}</div>
                    </Option>;
                    optGroup.push(optParent);
                    data1.children.map((data2)=>{
                        if(data2.open){
                            let item = <Option key={data2.id} title={data2.id+" - "+data2.name} value={data2.id} disabled={data1.disabled}>
                                <div style={{textIndent:(level+1)*0.75+'rem'}}>{data2.id+" - "+data2.name}</div>
                            </Option>;
                            optChild.push(item);
                            let children = this.renOption(data2.children,level+1);
                            optChild = optChild.concat(children);
                        }else {
                            let item =  <Option title={data2.id+" - "+data2.name} value={data2.id} key={data2.id} disabled={data1.disabled}>
                                <div style={{textIndent:(level+1)*0.75+'rem'}}>{data2.id+' - '+data2.name}</div>
                            </Option>;
                            optChild.push(item);
                        }
                    });
                    optGroup = optGroup.concat(optChild);
                    return optGroup;
                }else {
                    if(data1.id==-1){
                        return <Option title={data1.name} value={data1.id} key={data1.id} disabled={data1.disabled}>
                            <div style={{textIndent:level*0.75+'rem'}}>{data1.name}</div>
                        </Option>
                    }else if(data1.id==-2){
                        return <Option title={data1.name} value={data1.id} key={data1.id} disabled={data1.disabled}>
                            <div style={{textIndent:level*0.75+'rem'}}>
                                {data1.name}：<Switch checked={this.state.inactive==0}
                                        onChange={this.changeInv.bind(this)}
                                        checkedChildren={<Icon type="check" />}
                                        unCheckedChildren={<Icon type="cross" />} />
                                {this.state.inactive==0?this.state.off_count+'个隐藏科目':''}
                            </div>
                        </Option>
                    }else {
                        return <Option title={data1.id+" - "+data1.name} value={data1.id} key={data1.id} disabled={data1.disabled}>
                            <div style={{textIndent:level*0.75+'rem'}}>{data1.id+' - '+data1.name}</div>
                        </Option>
                    }
                }
            });
            return ren;
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
        changeSummary(type,e){
            let value = e.target.value;
            let state = {};
            if(type == 'min'){
                state.min_money = value;
            }else if(type == 'max'){
                state.max_money = Number(value);
            }
            this.setState(state)
        }
        getSelect(value,e){
            this.setState({
                account_code:value
            },()=>{
                this.setPage(1);
                // this.initTable(this.props)
            });
        }
        goSearch(pageNum){
            // console.log(this.props);
            let search = {
                searchDate: [moment(this.state.searchDate[0]).format('YYYY-MM-D'),moment(this.state.searchDate[1]).format('YYYY-MM-D')],
                searchNum:this.state.searchNum,
                max_money:this.state.max_money,
                min_money:this.state.min_money,
                account_code:this.state.account_code=='-1'?"":this.state.account_code,
                page:pageNum
            };
            if(this.state.query_size){
                search.page_site = this.state.query_size;
            }
            if(!search.searchDate[0]){
                message.warning('请选择搜索的时间段');
                return ;
            }
            this.props.searchDate(search);
        }
        setPage(page){
            this.setState({
                pageNum:page,
                loading:true,
            },()=>{
                this.goSearch(page);
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
                        return <div className="right">{text}</div>
                    }
                },
                {
                    title:'贷方',
                    dataIndex: 'lender',
                    key: 'lender',
                    render:(text)=>{
                        return <div className="right">{text}</div>
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
                            return <div className="right">{value}</div>;
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
                            return <div className="right">{text}</div>;
                        }
                    }
                },
                {
                    title:'单价',
                    dataIndex: 'price',
                    key: 'price',
                    render:(text)=>{
                        return <div className="right">{text}</div>
                    }
                },];
            let listTable = [];
            let type = {
                type: 'refs/view',
                method: 'GET',
            };
            if(!item.type_no){
                if(type=='reduce'){

                }else if(type=='add'){

                }
            }
            let params = {
                id:item.type_no,
            };
            let cb = (data) => {
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
                    printId:item.type_no,
                    visible:true,
                    openIndex:item.dataId,
                    checkInfo:{topLabel:checkLabel,topTable:checkTable,contentLabel:listLabel,contentTable:listTable}
                });
            };
            Request(params,cb,type);
        }
        hideModal(type){
            if(type == 'print'){
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
                    visible:false,
                    confirmLoading:false
                })
            }
        }
        select(value,key){
            console.log('select',value,key)
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
                    <Card title={<h1 className="certificate-title">账簿查询</h1>}
                          bordered={true}>
                        <Row>
                            <Col xs={5}>
                                日期：<RangePicker value={this.state.searchDate} style={{ width: '80%'}}
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
                            <Col xs={5}>
                                科目：
                                <Select
                                    showSearch
                                    allowClear
                                    optionLabelProp="title"
                                    optionFilterProp="title"
                                    style={{ width: '80%'}}
                                    notFoundContent="没有匹配的选项"
                                    value={this.state.account_code}
                                    onSelect={this.select.bind(this)}
                                    onChange={this.getSelect.bind(this)}
                                >
                                    {this.state.children}
                                </Select>
                            </Col>
                            <Col xs={4}>
                                最小金额：<Input type="number" defaultValue={this.state.min_money} onBlur={this.changeSummary.bind(this,'min')} style={{width:"60%"}}/>
                            </Col>
                            <Col xs={4}>
                                最大金额：<Input type="number" defaultValue={this.state.max_money} onBlur={this.changeSummary.bind(this,'max')} style={{width:"60%"}}/>
                            </Col>
                            <Col xs={2}>
                                <Button type="primary" icon="search" onClick={this.setPage.bind(this,1)}>查询</Button>
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
                        <h2 className="center genson-margin-top">{this.state.title_currency}</h2>
                        <div className="certificate-table">
                            <Table bordered dataSource={this.state.data}
                                   columns={this.state.columns} size="small"
                                   loading={this.state.loading}
                                   pagination={false}/>
                        </div>
                        <Pagination onChange={this.setPage.bind(this)}
                                    className="genson-pagination"
                                    current={Number(this.state.pageNum)}
                                    pageSize={Number(this.state.page.PageSize)}
                                    total={Number(this.state.page.totalCount)} />
                    </Card>
                    <Modal visible={this.state.visible}
                           width="960"
                           title="记账凭证"
                           okText="打印"
                           cancelText="关闭"
                           confirmLoading={this.state.confirmLoading}
                           onOk={this.hideModal.bind(this,'print')}
                           onCancel={this.hideModal.bind(this)}>
                        <div id="section-to-print" className="certificate-table">
                            <Table bordered pagination={false} dataSource={this.state.checkInfo.topTable} size="small"
                                   columns={this.state.checkInfo.topLabel} />
                            <Table className="genson-margin-top" bordered pagination={false} size="small"
                                   dataSource={this.state.checkInfo.contentTable}
                                   columns={this.state.checkInfo.contentLabel} />
                            <h3 className="genson-margin-top center">用户：{this.state.user||'无'}</h3>
                        </div>
                        <Row className="genson-margin-top" type="flex" justify="space-around">
                            <Button className="genson-block-center"
                                    onClick={this.showModal.bind(this,this.state.dataList[this.state.openIndex-1],this.state.openIndex-1,'reduce')}
                                    disabled={this.state.openIndex==0}>
                                上一条
                            </Button>
                            <Button className="genson-block-center"
                                    onClick={this.showModal.bind(this,this.state.dataList[this.state.openIndex+1],this.state.openIndex+1,'add')}
                                    disabled={this.state.openIndex==(this.state.dataList.length-1)}>
                                下一条
                            </Button>
                        </Row>
                    </Modal>
                </div>
            );
        }
    }
    module.exports = AccountBook;
})();