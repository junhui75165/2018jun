/**
 * Created by junhui on 2017/5/9.
 */
(function () {
    'use strict';
    let React = require('react');
    let moment = require('moment');
    let {Request, Ajax} = require('../request');
    let Global = require('../Global');
    let {Col, Row ,Button,Table,Input,Form ,InputNumber,DatePicker,Popconfirm,Select,message,Modal   } = require('antd');
    const FormItem = Form.Item;
    const Option = Select.Option;
    let {GetLocalStorage} = require('../tool');
    let curr = [];
    class Exchange extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                date:moment(),
                curr_list:[],
                exchangeTable:{exchange:[],table:[]},
                modal:false,
                edit:{},
                input:{},
                modalItem:{},
            }
        }

        componentWillMount() {
            this.requestTable();
            GetLocalStorage('currency').map((item)=>{
                if(item.inactive == 0){
                    curr.push(item);
                }
            });
        }
        requestTable(){
            let type = {
                type:'exchange-rate/get-codes',
                method:'GET'
            };
            let cb = (data)=>{
                if(data.code == 0){
                    this.setState({
                        curr_list:data.info,
                    },()=>{
                        this.initTable()
                    })
                }else {
                    message.error(data.message);
                }
            };
            Request({},cb,type);
        }
        initTable(){
            let table = [];
            let filterList = [];
            let input = this.state.input;
            GetLocalStorage('currency').map((item)=>{
               let filterItem = {};
               filterItem.text = item.curr_abrev;
               filterItem.value = item.curr_abrev;
               filterItem.key = item.curr_abrev;
               filterList.push(filterItem);
            });
            for(let i in this.state.curr_list){
                this.state.curr_list[i].map((item,index)=>{
                    let tab = {};
                    // table[index].type = item.currency;
                    tab.symbol = item.curr_code;
                    tab.date = item.date_;
                    tab.single = item.rate_buy+GetLocalStorage('Const').curr_default;
                    tab.convert = 1+item.curr_code;
                    tab.key = item.id;
                    tab.list = item;
                    table.push(tab);
                    input[item.id] = item.rate_buy;
                })
            }

            let exchange = [
                {
                    title:'货币简称',
                    dataIndex: 'symbol',
                    key: 'symbol',
                    filters:filterList,
                    onFilter: (value, record) => {
                        return record.symbol.indexOf(value) === 0;
                    },
                },
                {
                    title:'开始使用日期',
                    dataIndex: 'date',
                    key: 'date',
                },
                {
                    title:'单位货币',
                    dataIndex: 'convert',
                    key: 'convert',
                },
                {
                    title:'兑换货币',
                    dataIndex: 'single',
                    key: 'single',
                    render:(text, record, index)=>{
                        return this.editInput(text,record);
                    }
                },
                {
                    title: '修改汇率',
                    dataIndex: 'edit',
                    key: 'edit',
                    render:(text, record, index)=>{
                        // this.editInput(record.list,record);
                        let isEdit = this.state.edit[record.list.id];
                        let edit = <Button onClick={this.editItem.bind(this,record,true)} shape="circle" icon="edit"/>;
                        let save = <Popconfirm placement="leftTop" title="是否保存汇率"
                                               onConfirm={this.editItem.bind(this,record,false)}
                                               onCancel={this.editCancel.bind(this,record)}
                                               okText="确定"
                                               cancelText="取消">
                            <Button shape="circle" icon="save"/>
                        </Popconfirm>;
                        return !isEdit?edit:save;
                    }
                },
                {
                    title: '删除货币',
                    dataIndex: 'delete',
                    key: 'delete',
                    render:(text, record, index)=>(<Popconfirm placement="leftTop" title="是否删除汇率"
                                                               onConfirm={this.deleteItem.bind(this,record)}
                                                               okText="确定"
                                                               cancelText="取消">
                        <Button shape="circle" icon="delete"/>
                    </Popconfirm>)
                }
            ];
            this.setState({
                exchangeTable:{
                    exchange:exchange,
                    table:table,
                    input:input
                }
            })
        }
        editInput(text,record){
            // this.setState({input:input});
            let value = this.state.input[record.key];
            let str = <span>{text}</span>;
            let input = <InputNumber min={0} style={{width:'8rem'}} value={value} onChange={this.handleChange.bind(this,record.key,record)}/>;
            return this.state.edit[record.key]?input:str;
        }
        editCancel(item){
            let edit = this.state.edit;
            edit[item.key] = false;
            this.setState({
                edit:edit,
            });
        }
        editItem(item,type){
            let edit = this.state.edit;
            edit[item.key] = type;
            this.setState({
                edit:edit,
                modalItem:item
            });
            if(!type){
                let tp = {
                    type:'exchange-rate/save-code',
                    method:'FormData',
                    Method:'POST'
                };
                let par = {
                    rate_buy:this.state.input[item.key],
                    curr_code:item.symbol,
                    date:item.date,
                    id:item.key
                };
                let cb = (data)=>{
                    if(data.code == 0){
                        message.success('修改成功!');
                        this.requestTable();
                        if(this.props.reSearch){
                            this.props.reSearch();
                        }
                    }else {
                        message.error(data.message);
                    }
                };
                Request(par,cb,tp)
            }
        }
        deleteItem(item){
            let tp = {
                type:'exchange-rate/delete',
                method:'FormData',
                Method:'POST'
            };
            let par = {
                id:item.key
            };
            let cb = (data)=>{
                if(data.code == 0){
                    message.success('删除成功!');
                    this.requestTable();
                }else {
                    message.error(data.message);
                }
            };
            Request(par,cb,tp)
        }
        handleChange(type,item,value){
            let input = this.state.input;
            input[type] = value;
            this.setState({
                input:input,
            })
        }
        showModal(item){
            this.setState({
                modal:true,
            })
        }
        hideModal(){
            this.setState({
                modal:false,
            },()=>{
                this.props.form.resetFields();
            })
        }
        submitModal(e){
            e.preventDefault();
            const type = {
                type:'exchange-rate/save-code',
                method:'FormData',
                Method:'POST'
            };
            let cb = (data)=>{
                if(data.code == 0){
                    this.setState({
                        modal:false,
                    },()=>{
                        message.success('新增成功!');
                        this.requestTable();
                    })
                }else {
                    message.error(data.message)
                }
            };

            this.props.form.validateFields((err, values) => {
                if (!err) {
                    values.date = moment(values.date).format('YYYY-MM-D');
                    console.log('Received values of form: ', values);
                    Request(values,cb,type);
                }else {
                    message.error('请填充缺少的内容！')
                }
            });
        }
        render() {
            const { getFieldDecorator } = this.props.form;
            return (
            <div style={{minHeight:'500'}}>
                <Row className="genson-margin-top">
                    <Col xs={4}>
                        <Button type="primary" icon="plus-circle-o" onClick={this.showModal.bind(this)}>新增外汇</Button>
                    </Col>
                    <Col xs={4} offset={6}>
                        <h2 className="center">外汇兑换明细</h2>
                    </Col>
                </Row>
                <Row className="certificate-table">
                    <Table size="small" bordered
                           pagination={false}
                           columns={this.state.exchangeTable.exchange}
                           dataSource={this.state.exchangeTable.table}/>
                    <Modal  visible={this.state.modal}
                            title="新增汇率"
                            onOk={this.submitModal.bind(this)}
                            onCancel={this.hideModal.bind(this)}>
                        <Form >
                            <FormItem
                                {...Global.formItemLayout}
                                label="开始使用日期"
                            >
                                {getFieldDecorator('date', {
                                    rules: [{
                                        required: true, message: '请选择日期',
                                    }],
                                    initialValue:moment()
                                })(
                                    <DatePicker style={{width:'100%'}} format="YYYY-MM-D"/>
                                )}
                            </FormItem>
                            <FormItem
                                {...Global.formItemLayout}
                                label="选择一种货币"
                            >
                                {getFieldDecorator('curr_code', {
                                    rules: [{
                                        required: true, message: '你需要选择一种货币!',
                                    }],
                                    initialValue:this.state.modalItem.symbol
                                })(
                                    <Select style={{width:'100%'}}>
                                        {curr.map((item)=>{
                                            return <Option key={item.curr_abrev} value={item.curr_abrev}>{item.currency}</Option>
                                        })}
                                    </Select>
                                )}
                            </FormItem>
                            <FormItem
                                {...Global.formItemLayout}
                                label="汇率"
                            >
                                {getFieldDecorator('rate_buy', {
                                    rules: [{
                                        required: true, message: '请输入汇率',
                                    }],
                                    initialValue:1
                                })(
                                    <InputNumber min={0} style={{width:'100%'}}/>
                                )}
                            </FormItem>
                        </Form>
                    </Modal>
                </Row>
            </div>

            );
        }
    }
    const ChangeExchange = Form.create({})(Exchange);
    module.exports = ChangeExchange;
})();
