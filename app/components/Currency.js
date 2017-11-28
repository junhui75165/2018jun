/**
 * Created by junhui on 2017/5/18.
 */
(function () {
    'use strict';
    let React = require('react');
    let moment = require('moment');
    let {Request, } = require('../request');
    let Global = require('../Global');
    let {  Col, Row ,Button,Table,Input,Form ,Popconfirm,Checkbox,Icon,message,Modal} = require('antd');
    const FormItem = Form.Item;
    let {SetLocalStorage} = require('../tool');

    class Curr extends React.Component{

        constructor(props){
            super(props);
            this.state = {
                display:false,
                Table:{},
                isAdd:false,
                modal:{},
                check:{},
                loading:false,
            }
        }

        componentWillMount() {
            this.initTable();
        }

        initTable(){
            this.setState({ loading: true });
            const type = {
                type:'currencies/index',
                method:'GET'
            };
            let cb = (data)=>{
                if(data.code == 0){
                    let list = data.info.list;
                    console.log('list is...',list);
                    let table = {};
                    let check = {};
                    table.title = [
                        {
                            title:'缩写',
                            key:'curr_abrev',
                            dataIndex:'curr_abrev'
                        },
                        {
                            title:'符号',
                            key:'curr_symbol',
                            dataIndex:'curr_symbol'
                        },
                        {
                            title:'货币名',
                            key:'currency',
                            dataIndex:'currency'
                        },
                        {
                            title:'百分之一元的称谓',
                            key:'hundreds_name',
                            dataIndex:'hundreds_name'
                        },
                        {
                            title:'国家/地区',
                            key:'country',
                            dataIndex:'country'
                        },
                        {
                            title:'编辑',
                            dataIndex:'edit',
                            key:'edit',
                            render:(text,item,index)=>{
                                return<Button icon="edit" shape="circle" onClick={this.showModal.bind(this,item)}/>
                            }
                        },
                        {
                            title:'停用',
                            dataIndex:'stop',
                            key:'stop',
                            render:(text,item,index)=>{
                                return<Checkbox checked={this.state.check[item.curr_abrev]} onChange={this.changeCheck.bind(this,item)}/>
                            }
                        },
                        {
                            title:'删除',
                            dataIndex:'delete',
                            key:'delete',
                            render:(text,item,index)=>{
                                return<Popconfirm placement="leftTop" title="是否删除该货币"
                                                  onConfirm={this.delCurrency.bind(this,item)}
                                                  okText="确定"
                                                  cancelText="取消">
                                    <Button icon="delete" shape="circle"/>
                                </Popconfirm>
                            }
                        },
                    ];
                    table.data = list;
                    list.map((item)=>{
                        check[item.curr_abrev] = item.inactive==1;
                    });
                    this.setState({
                        check:check,
                        Table:table,
                        loading:false
                    },()=>{
                        SetLocalStorage('currency',list);
                    })
                }
            };
            Request({},cb,type);
        }
        delCurrency(item){
            console.log('del the item is',item.curr_abrev);
            const type = {
                type:'currencies/delete',
                method:'FormData',
                Method:'POST',
            };
            let par = {curr_abrev:item.curr_abrev};
            let cb = (data)=>{
              if(data.code==0){
                  message.success(item.curr_abrev+`删除成功！`);
                  this.initTable();
              }else {
                  message.error(data.message);
              }
            };
            Request(par,cb,type);
        }
        changeCheck(item,e){
            let value = e.target.checked;
            let checkList = this.state.check;
            checkList[item.curr_abrev] = value;
            const type = {
                type:value?'currencies/inactive':'currencies/active',
                method:'FormData',
                Method:'POST',
            };
            let par = {curr_abrev:item.curr_abrev};
            let cb = (data)=>{
                if(data.code == 0){
                    this.setState(checkList,()=>{
                        this.initTable();
                        message[value?'warning':'success'](`${item.curr_abrev}已经${value?'停用':'开启'}！`);
                    });
                }else {
                    message.error(data.message);
                }
            };
            Request(par,cb,type);


        }
        showModal(item){
            this.setState({
                display:true,
                isAdd:false,
                modal:item?item:{}
            })
        }
        addCurrency(){
            this.setState({
                display:true,
                isAdd:true,
                modal:{}
            })
        }
        submitModal(){
            const type = {
                type:this.state.isAdd?'currencies/create':'currencies/update',
                method:'FormData',
                Method:'POST',
            };
            let cb = (data)=>{
                if(data.code == 0){
                    this.props.form.resetFields();//重置表格内容
                    this.setState({
                        display:false,
                    },()=>{
                        message.success(`${this.state.isAdd?'创建':'修改'}成功！`);
                        this.initTable();
                    });
                }else {
                    message.error(data.message);
                }
            };
            this.props.form.validateFields((err, values) => {
                if (!err) {
                    console.log('Received values of form: ', values);
                    Request(values,cb,type);
                }else {
                    message.error('请补充缺少的内容')
                }
            });
        }
        hideModal(){
            this.setState({
                display:false,
            },()=>{
                this.props.form.resetFields();
            })
        }
        render() {
            const { getFieldDecorator } = this.props.form;
            return (
                <div>
                    <Row className="genson-margin-top">
                        <Col xs={4}>
                            <Button type="primary" icon="plus-circle-o" onClick={this.addCurrency.bind(this)}>新增货币</Button>
                        </Col>
                        <Col xs={4} offset={6}>
                            <h2 className="center">货币列表明细</h2>
                        </Col>
                    </Row>
                    <Row className="certificate-table">
                        <Table size="small"
                               loading={this.state.loading}
                               bordered
                               pagination={false}
                               columns={this.state.Table.title}
                               dataSource={this.state.Table.data}/>
                    </Row>
                    <Modal  visible={this.state.display}
                            title={`${this.state.isAdd?'新增':'修改'}货币`}
                            onOk={this.submitModal.bind(this)}
                            onCancel={this.hideModal.bind(this)}>
                        <Form >
                            <FormItem
                                {...Global.formItemLayout}
                                label="货币缩写"
                            >
                                {getFieldDecorator('curr_abrev', {
                                    rules: [{
                                        required: true, message: '请输入货币的缩写',
                                    }],
                                    initialValue:this.state.modal.curr_abrev
                                })(
                                    <Input style={{width:'100%'}}/>
                                )}
                            </FormItem>
                            <FormItem
                                {...Global.formItemLayout}
                                label="货币符号"
                            >
                                {getFieldDecorator('curr_symbol', {
                                    rules: [{
                                        required: true, message: '你输入货币的符号',
                                    }],
                                    initialValue:this.state.modal.curr_symbol
                                })(
                                    <Input style={{width:'100%'}}/>
                                )}
                            </FormItem>
                            <FormItem
                                {...Global.formItemLayout}
                                label="货币名"
                            >
                                {getFieldDecorator('currency', {
                                    rules: [{
                                        required: true, message: '请输入货币的名称',
                                    }],
                                    initialValue:this.state.modal.currency
                                })(
                                    <Input style={{width:'100%'}}/>
                                )}
                            </FormItem>
                            <FormItem
                                {...Global.formItemLayout}
                                label="百分之一元的称谓"
                            >
                                {getFieldDecorator('hundreds_name', {
                                    rules: [{
                                        required: true, message: '请输入货币百分之一元的称谓',
                                    }],
                                    initialValue:this.state.modal.hundreds_name
                                })(
                                    <Input style={{width:'100%'}}/>
                                )}
                            </FormItem>
                            <FormItem
                                {...Global.formItemLayout}
                                label="国家/地区"
                            >
                                {getFieldDecorator('country', {
                                    rules: [{
                                        required: true, message: '请输入货币的国家/地区',
                                    }],
                                    initialValue:this.state.modal.country
                                })(
                                    <Input style={{width:'100%'}}/>
                                )}
                            </FormItem>
                        </Form>
                    </Modal>
                </div>
            );
        }
    }
    const Currency = Form.create({})(Curr);
    module.exports = Currency;
})();