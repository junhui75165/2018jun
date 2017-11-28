/**
 * Created by junhui on 2017/5/10.
 */
(function () {
    'use strict';
    let React = require('react');
    let moment = require('moment');
    let {Request,} = require('../request');
    let { hashHistory} = require('react-router');
    let {objToArr,getDateVnum,rtTableHeight,toThousands,GetLocalStorage}=require('../tool');
    let { Card, Col, Row ,Button,Switch,Table,Input,InputNumber ,
        Select,DatePicker,Transfer ,message,Modal} = require('antd');
    const Option = Select.Option;
    class CarryOverCost extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                chartList:[],
                defaultSelect:'',
                list:[],
                table:[],
                date:moment().format('YYYY-MM-D'),
                openDate:false,
                vnum:'',
                mockData: [],
                targetKeys: [],
                modal:false,
                loading:false,
                tableNum:[],
                load:false,
                jumpUrl:[]
            }
        }

        componentDidMount() {
            this.resVnum();
        }

        resVnum(date,isp){
            let cb = (data)=>{
                this.setState({
                    vnum:data.vnum,
                    date:data.date_
                },()=>{
                    if(!isp){
                        this.initProps(this.props);
                    }
                })
            };
            getDateVnum(cb,date);
        }

        initProps(props) {
            if(props.data.length>0){
                this.setState({
                    list:props.data,
                    defaultSelect:props.data[0].account_code
                },()=>{
                    this.getChartList();
                    this.changeSel();
                });
            }else {
                this.setState({
                    list:props.data,
                },()=>{
                    this.getChartList();
                    this.changeSel();
                } )
            }
        }

        componentWillReceiveProps(nextProps, nextContext) {
            this.initProps(nextProps);
        }
        exchange(){
            const url = {
                type:'material-consumption/add-material-consumption',
                method:'FormData',
                Method:'POST',
            };
            let cb = (data)=>{
                console.log(data);
                message.success('已成功结转！');
                this.setState({
                    tableNum:[],
                    jumpUrl:data.url
                },()=>{
                    this.changeSel();
                    this.setState({jumpUrl:[]})
                });
            };
            let par = {
                account:this.state.defaultSelect,
                date_:this.state.date,
                vnum:this.state.vnum,
                due_date:this.state.openDate?1:0
            };
            let index = 0;
            this.state.table.map((item,key)=>{
                if(this.state.tableNum[key]>0){
                    par[`detail[${this.state.table[key].account}][qty]`] = this.state.tableNum[key];
                    index++;
                }
            });
            if(index>0){
                Request(par,cb,url);
            }else {
                message.error('没有输入领取数量')
            }
        }
        changeSel(){
            let type = {
                type: 'material-consumption/index',
                method: 'GET',
            };
            let par={
                date_:this.state.date,
                due_date:this.state.openDate?1:0,
                account:this.state.defaultSelect
            };
            let cb = (data)=>{
                if(data.code==0){
                    let getArr = objToArr(data.info.list);
                    this.setState({
                        table:getArr,
                        footer:'领料金额总计：0.00',
                        date:data.info.date_,
                        vnum:data.info.vnum,
                        load:false
                    });
                }
            };
            this.setState({load:true},()=>{
                Request(par,cb,type);
            });
        }

        getChartList(){
            const targetKeys = [];
            const mockData = [];
            this.state.list.map((item,index)=>{
                targetKeys[index] = item.account_code;
            });
            const type = {
                type:'inventory/chart-list',
                method:'GET'
            };
            let cb = (data)=>{
                if(data.code == 0&& data.info.length>0){
                    data.info.map((item,index)=>{
                        mockData[index] = {};
                        mockData[index].key = item.account_code;
                        mockData[index].title = item.account_code;
                        mockData[index].description = item.account_name;
                    });
                    this.setState({
                        chartList:data.info,
                        mockData: mockData,
                        targetKeys: targetKeys,
                        defaultTarget:targetKeys,
                    })
                }else {
                    message.error(data.message);
                }
            };
            Request({},cb,type);
        }
        changeSelect(value){
            console.log(value);
            this.setState({
                defaultSelect:value,
            },()=>{
                // this.changeSel();
            })
        }
        changeDate(date,dateString){
            this.setState({
                date:dateString
            },()=>{
                this.resVnum(dateString,true);
            })
        }
        changeOpen(value){
            this.setState({
                openDate:value
            })
        }
        changeNum(e){
            let value = e.target.value;
            this.setState({
                vnum:value
            })
        }
        handleChange(targetKeys) {
            this.setState({ targetKeys });
        }
        setModal(type){
            this.setState({
                modal:type,
                loading:false
            })
        }
        submitModal(){
            this.setState({
                loading:true
            });
            let def = this.state.defaultTarget;
            let sel = this.state.targetKeys;
            let delList = [];
            let addList = [];
            def.map((item)=>{
                if(sel.indexOf(item)==-1){
                    delList.push(item);
                }
            });
            sel.map((item)=>{
                if(def.indexOf(item)==-1){
                    addList.push(item);
                }
            });
            if(addList.length>0){
                this.inventoryAdd(addList);
            }
            if(delList.length>0){
                this.inventoryDelete(delList);
            }
            if(addList.length==0&&addList.length==0){
                this.setState({
                    loading:false,
                    modal:false
                })
            }
        }
        inventoryAdd(list){
            const type = {
                type:'inventory/inventory-add',
                method:'FormData',
                Method:'POST',
            };
            let par = {};
            list.map((item,index)=>{
                par[`account_code[${index}]`] = item;
            });
            let cb = (data)=>{
                if(data.code==0){
                    this.setState({
                        loading:false,
                        modal:false
                    },()=>{
                        this.props.searchData()
                    })
                }else {
                    message.error(data.error);
                }
            };
            Request(par,cb,type);
        }
        inventoryDelete(list){
            const type = {
                type:'inventory/inventory-delete',
                method:'FormData',
                Method:'POST',
            };
            let par = {};
            list.map((item,index)=>{
                par[`account_code[${index}]`] = item;
            });
            let cb = (data)=>{
                if(data.code==0){
                    this.setState({
                        loading:false,
                        modal:false
                    },()=>{
                        this.props.searchData()
                    })
                }else {
                    message.error(data.error);
                }
            };
            Request(par,cb,type);
        }
        changeTableNum(index,value){
            let tableNum = this.state.tableNum;
            tableNum[index] = value.target?value.target.value:value;
            let table = this.state.table;
            let pay = 0;
            table.map((item,key)=>{
                if(tableNum[key]>0){
                    pay += tableNum[key]*item.price;
                }
            });
            this.setState({
                tableNum,
                footer:'领料金额总计：'+(toThousands(pay)||"0.00"),
            })
        }
        goAccount(account){
            let year = moment(this.state.date).year();
            let month = GetLocalStorage('Const').fiscal_year_end_month==12?1:GetLocalStorage('Const').fiscal_year_end_month+1;
            let par = {
                dateForm:year+'-'+month+'-01',
                dateTo:this.state.date,
                account_code:account
            };
            hashHistory.push({
                pathname: '/mainPage/103',
                query: par
            });
        }
        render() {

            const title = [
                {
                    title:'科目编号',
                    dataIndex:'account',
                    key:'account',
                    width:'10%',
                    render:(account)=>{
                        return <a onClick={this.goAccount.bind(this,account)}>{account}</a>
                    }
                },
                {
                    title:'类别',
                    dataIndex:'account_name',
                    key:'account_name',
                    width:'15%',
                },
                {
                    title:'单位',
                    dataIndex:'account_code2',
                    key:'account_code2',
                    width:'15%',
                },
                {
                    title:'数量',
                    dataIndex:'qty',
                    key:'qty',
                    width:'10%',
                    render:(text)=>{
                        return <div className="right">{text}</div>
                    }
                },
                {
                    title:'单位成本',
                    dataIndex:'price',
                    key:'price',
                    width:'10%',
                    render:(text,item)=>{
                        let value = Number(item.amount)/Number(item.qty);
                        if(item.qty>0){
                            item.price = value;
                        }else {
                            item.price = 0;
                        }
                        return <div className="right">{toThousands(item.price)}</div>;
                    }
                },
                {
                    title:'价值',
                    dataIndex:'amount',
                    key:'amount',
                    width:'10%',
                    render:(text,item)=>{
                        text = Number(text).toFixed(2);
                        item.amount = text;
                        return <div className="right">{toThousands(text)}</div>;
                    }
                },
                {
                    title:'领取数量',
                    dataIndex:'num',
                    key:'num',
                    width:'10%',
                    render:(text,item,index)=>{
                        return<InputNumber defaultValue={item.num} onChange={this.changeTableNum.bind(this,index)}
                                           onBlur={this.changeTableNum.bind(this,index)} style={{width:'100%'}}
                                           min={0} max={Number(item.qty)}/>
                    }
                },
                {
                    title:'领料价值',
                    dataIndex:'pay',
                    key:'pay',
                    width:'10%',
                    render:(text,item,index)=>{
                        let value = Number(item.price)*Number(this.state.tableNum[index]||0);
                        return<div className="right">{toThousands(value)}</div>
                    }
                },
            ];
            return (
                <div className="gen-certificate">
                    <Card title={<h1 className="certificate-title">出库结转成本</h1>}
                          bordered={true}>
                        <Row>
                            <Col lg={8} md={10} xs={12}>
                                库存列表：
                                <Select style={{width:"60%"}} value={this.state.defaultSelect}
                                        onChange={this.changeSelect.bind(this)}>
                                    {this.state.list.map((item)=>{
                                        return<Option key={item.account_code}>{item.account_code+'--'+item.account_name}</Option>
                                    })}
                                </Select>
                            </Col>
                            <Col lg={4} md={6} xs={8}>
                                结转日期：<DatePicker style={{width:"60%"}}
                                                 value={moment(this.state.date)}
                                                 onChange={this.changeDate.bind(this)}/>
                            </Col>
                            <Col xs={4}>
                                <Button icon="search" onClick={this.changeSel.bind(this)} type="primary">查询</Button>
                            </Col>
                        </Row>
                        <Row className="genson-margin-top">
                            <Col xs={12} md={10} lg={8}>
                                库存统计截止至结转日期：
                                <Switch checkedChildren={'开'}
                                        unCheckedChildren={'关'}
                                        defaultChecked={false}
                                        onChange={this.changeOpen.bind(this)}/>
                            </Col>
                            <Col xs={8} md={6} lg={4}>
                                凭证号：<Input onChange={this.changeNum.bind(this)} value={this.state.vnum} style={{width:"6rem"}}/>
                            </Col>
                            <Col xs={2} offset={1}>
                                <Button onClick={this.exchange.bind(this)} type="primary">结转</Button>
                            </Col>
                            <Col xs={2} offset={1}>
                                <Button onClick={this.setModal.bind(this,true)} type="primary">库存定义</Button>
                            </Col>
                        </Row>
                        <Row className="certificate-table">
                            <Table footer={() => <div className="right genson-footer" style={{lineHeight:'2.5rem',padding:'4px 8px'}}>
                                {this.state.footer}
                                </div>}
                                   scroll={{y:rtTableHeight(40)}}
                                   size="small" loading={this.state.load}
                                   dataSource={this.state.table} pagination={false} columns={title} bordered/>
                        </Row>
                        <Modal visible={this.state.modal}
                               title="库存定义"
                               width="900"
                               onOk={this.submitModal.bind(this)}
                               okText="提交"
                               cancelText="取消"
                               confirmLoading={this.state.loading}
                               onCancel={this.setModal.bind(this,false)}>
                            <Transfer className="block-center"
                                dataSource={this.state.mockData}
                                showSearch
                                listStyle={{
                                    width: 350,
                                    height: 450,
                                }}
                                searchPlaceholder="请输入搜索内容"
                                titles={['未添加科目','已添加科目']}
                                operations={['添加库存', '删除库存']}
                                targetKeys={this.state.targetKeys}
                                onChange={this.handleChange.bind(this)}
                                render={item => `${item.title}-${item.description}`}
                            />
                        </Modal>
                    </Card>
                </div>
            );
        }
    }
    module.exports = CarryOverCost;

})();