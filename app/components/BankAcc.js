/**
 * Created by junhui on 2017/5/16.
 */
(function () {
    'use strict';
    let React = require('react');
    let moment = require('moment');
    let {Request} = require('../request');
    let Global = require('../Global');
    let { Switch, Col, Row ,Button,Table,Input,Form ,Popconfirm,Select,Checkbox,Icon,message,Modal} = require('antd');
    const FormItem = Form.Item;
    const Option = Select.Option;
    const OptGroup = Select.OptGroup;
    let curr = [];
    let {GetLocalStorage,objToArr} = require('../tool');
    class Acc extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                table:[],
                edit:{},
                check:{},
                select:[],
                modal:{},
                subject:[],
                list:[],
                children:[],
                visible:false,
                loading:false,
                inactive:false,
            }
        }
        componentWillMount() {
            GetLocalStorage('currency').map((item)=>{
                if(item.inactive == 0){
                    curr.push(item);
                }
            });
            this.initContent();
            this.getTree();
            this.getSubject();
        }
        initContent(){
            const type = {
                type: 'bank-accounts/index',
                method: 'GET',
            };
            let par = {inactive:this.state.inactive?'1':'0'};
            let cb = (data)=>{
                if(data.code==0){
                    let edit = {};
                    let check = {};
                    data.info.list.map((item)=>{
                        edit[item.id] = false;
                        check[item.id] = item.inactive==1;
                    });
                    this.setState({
                        table:data.info.list,
                        edit:edit,
                        check:check,
                    });
                }
            };
            Request(par,cb,type);
        }
        getSubject(){
            const type = {
                type:'bank-accounts/account-type',
                method:'GET',
            };
            let callback = (data)=>{
                this.setState({subject:data.info});
            };
            Request({},callback,type);
        }
        getTree(){
            const type = {
                type:'tree/get-type-master-tree',
                method:'GET',
            };
            let callback = (data)=>{
                let list = objToArr(data.info);//对象类型转为数组
                let ren = this.renOption(list,-1);//转换成option
                this.setState({children:ren});
            };
            Request({},callback,type);
        }
        renOption(list,level){
            level++;
            let ren = list.map((data1)=>{
                if(data1.open){
                    return <OptGroup key={data1.id} label={<div style={{textIndent:(level)*0.75+'rem'}}>
                        {data1.id+' - '+data1.name}</div>}>
                        {
                            data1.children.map((data2)=>{
                                if(data2.open){
                                    return <OptGroup key={data2.id} label={<div style={{textIndent:(level+1)*0.75+'rem'}}>
                                        {data2.id+' - '+data2.name}</div>}>
                                        {this.renOption(data2.children,level+1)}
                                    </OptGroup>
                                }else {
                                    return <Option title={data2.id+" - "+data2.name} value={data2.id} key={data2.id}>
                                        <div style={{textIndent:level*0.75+'rem'}}>{data2.id+' - '+data2.name}</div>
                                    </Option>
                                }
                            })
                        }
                    </OptGroup>
                }else {
                    return <Option title={data1.id+" - "+data1.name} value={data1.id} key={data1.id}>
                        <div style={{textIndent:level*0.75+'rem'}}>{data1.id+' - '+data1.name}</div>
                    </Option>
                }
            });
            return ren;
        }

        delDefendFixed(item){
            const type = {
                type:'bank-accounts/delete',
                method:'FormData',
                Method:'POST'
            };
            let par = {
                id:item.id,
            };
            let cb = (data)=>{
                if(data.code == 0){
                    this.initContent();
                    message.success('删除成功');
                }else {
                    message.error(data.message)
                }
            };
            Request(par,cb,type);
        }
        showModal(item){
            let reSet = {
                modal:{},
                isAdd:true,//标记为新增类型
                visible:true,//显示模板
            };
            if(item.id){//传入参数含有类型
                reSet.isAdd = false;//设置为修改（非添加）
                reSet.modal = item;//初始化modal内容
            }
            this.setState(reSet,()=>{
                console.log(this.state.modal)
            });
        }
        hideModal(){
            this.setState({
                visible:false,
            },()=>{
                this.props.form.resetFields();
            })
        }
        changeCheck(item,e){//更改类型启用状态
            let check = this.state.check;
            let ok = e.target.checked;
            const type = {
                type: 'bank-accounts/update',
                method:'FormData',
                Method:'POST',
            };
            let par = item;//其他数据不变
            par.inactive = ok?'1':'0';//传入启用状态参数
            let cb = (data)=>{
                if(data.code==0){
                    check[item.id] = ok;//设置checkbox选中状态
                    this.setState({
                        check:check,
                    },()=>{
                        if(ok){
                            message.warning(item.bank_account_name+`已成功停用`);
                        }else {
                            message.success(item.bank_account_name+`已成功启用`);
                        }
                        // this.initContent();
                    });
                }else {
                    message.error(data.message)
                }
            };
            Request(par,cb,type);
        }
        submitModal(){
            this.setState({
                loading:true,//显示提交按钮加载中...
            });
            let type = {
                method:'FormData',
                Method:'POST',
            };
            let cb = (data)=>{//回调函数
                if(data.code == 0){
                    this.props.form.resetFields();//重置表格内容
                    this.setState({
                        visible:false,//隐藏模块
                        loading:false,//取消loading
                    },()=>{
                        message.success(`${this.state.isAdd?'新增':'修改'}成功`);
                        this.initContent();//重新更新表格内容
                    });
                }else {
                    message.error(data.message);//错误提示
                }
            };
            this.props.form.validateFields((err, values) => {
                if (!err) {//没有错误内容
                    let par = values;
                    if(this.state.isAdd){//判断模板是否为新增类型
                        type.type = 'bank-accounts/create';
                    }else {
                        type.type = 'bank-accounts/update';
                        par.id = this.state.modal.id;//修改类型需要传入id
                    }
                    console.log('Received values of form: ', par);
                    Request(par,cb,type);
                }else {
                    message.error('请填写相应内容');//错误提示
                }
            });
        }
        changeInactive(checked){
            this.setState({
                inactive:checked
            },()=>{
                this.initContent();
            })
        }
        render() {
            const { getFieldDecorator } = this.props.form;
            const title = [
                {
                    title:'科目名称',
                    dataIndex:'bank_account_name',
                    key:'bank_account_name',
                },
                {
                    title:'类型',
                    dataIndex:'account_type',
                    key:'account_type',
                    render:(text)=>{
                        return<span>{this.state.subject[text]}</span>
                    }
                },
                {
                    title:'币别',
                    dataIndex:'bank_curr_code',
                    key:'bank_curr_code'
                },
                {
                    title:'总账科目',
                    dataIndex:'account_code',
                    key:'account_code',
                },
                {
                    title:'银行',
                    dataIndex:'bank_name',
                    key:'bank_name'
                },
                {
                    title:'帐号',
                    dataIndex:'bank_account_number',
                    key:'bank_account_number'
                },
                {
                    title:'银行地址',
                    dataIndex:'bank_address',
                    key:'bank_address'
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
                        return<Checkbox checked={this.state.check[item.id]} onChange={this.changeCheck.bind(this,item)}/>
                    }
                },
                {
                    title:'删除',
                    dataIndex:'delete',
                    key:'delete',
                    render:(text,item,index)=>{
                        return<Popconfirm placement="leftTop" title="是否删除该银行账户"
                                          onConfirm={this.delDefendFixed.bind(this,item)}
                                          okText="确定"
                                          cancelText="取消">
                            <Button icon="delete" shape="circle"/>
                        </Popconfirm>
                    }
                },
            ];
            return (
                <div>
                    <Row className="genson-margin-top">
                        <Col xs={4}>
                            <Button type="primary" icon="plus-circle-o" onClick={this.showModal.bind(this)}>新增银行账户</Button>
                        </Col>
                        <Col xs={4}>
                            显示停用项目：
                            <Switch value={this.state.inactive} onChange={this.changeInactive.bind(this)}/>
                        </Col>
                        <Col xs={4} offset={2}>
                            <h2 className="center">银行账户列表</h2>
                        </Col>
                    </Row>
                    <Row className="certificate-table">
                        <Table bordered size="small"
                               pagination={true}
                               columns={title}
                               dataSource={this.state.table}/>
                    </Row>
                    <Modal visible={this.state.visible}
                           title={this.state.isAdd?"新增银行账户":"修改银行账户"}
                           onOk={this.submitModal.bind(this)}
                           onCancel={this.hideModal.bind(this)}>
                        <FormItem
                            {...Global.formItemLayout}
                            label="银行账户名"
                        >
                            {getFieldDecorator('bank_account_name', {
                                rules: [{
                                    required: true, message: '请输入银行账户名',
                                }],
                                initialValue:this.state.modal.bank_account_name
                            })(
                                <Input style={{width:'100%'}} />
                            )}
                        </FormItem>
                        <FormItem
                            {...Global.formItemLayout}
                            label="科目类型"
                        >
                            {getFieldDecorator('account_type', {
                                rules: [{
                                    required: true, message: '请选择科目类型',
                                }],
                                initialValue:this.state.modal.account_type
                            })(
                                <Select
                                    style={{ width: '100%'}}
                                    notFoundContent="没有匹配的选项"
                                >
                                    {this.state.subject.map((item,index)=>{
                                        return<Option value={String(index)} key={index}>{item}</Option>
                                    })}
                                </Select>
                            )}
                        </FormItem>
                        <FormItem
                            {...Global.formItemLayout}
                            label="银行账户货币"
                        >
                            {getFieldDecorator('bank_curr_code', {
                                rules: [{
                                    required: true, message: '请选择银行账户货币',
                                }],
                                initialValue:this.state.modal.bank_curr_code
                            })(
                                <Select style={{width:'100%'}}>
                                    {curr.map((item)=>{
                                        return<Option value={item.curr_abrev} key={item.curr_abrev}>
                                            {item.currency}
                                            </Option>
                                    })}
                                </Select>

                            )}
                        </FormItem>
                        <FormItem
                            {...Global.formItemLayout}
                            label="默认货币账户"
                        >
                            {getFieldDecorator('dflt_curr_act', {
                                rules: [{
                                    required: true, message: '每一种货币只允许设置一个默认银行账户',
                                }],
                                initialValue:0
                            })(
                                <Select style={{width:'100%'}}>
                                    <Option value={1}>是</Option>
                                    <Option value={0}>否</Option>
                                </Select>
                            )}
                        </FormItem>
                        <FormItem
                            {...Global.formItemLayout}
                            label="银行账户总账代码"
                        >
                            {getFieldDecorator('account_code', {
                                rules: [{
                                    required: true, message: '请选择银行账户总账代码',
                                }],
                                initialValue:this.state.modal.account_code
                            })(
                                <Select
                                    showSearch
                                    allowClear
                                    optionLabelProp="title"
                                    optionFilterProp="title"
                                    style={{ width: '100%'}}
                                    notFoundContent="没有匹配的选项"
                                >
                                    {this.state.children}
                                </Select>
                            )}
                        </FormItem>
                        <FormItem
                            {...Global.formItemLayout}
                            label="银行名"
                        >
                            {getFieldDecorator('bank_name', {
                                rules: [{
                                    required: true, message: '请输入银行名',
                                }],
                                initialValue:this.state.modal.bank_name
                            })(
                                <Input style={{width:'100%'}} />
                            )}
                        </FormItem>
                        <FormItem
                            {...Global.formItemLayout}
                            label="银行账户号码"
                        >
                            {getFieldDecorator('bank_account_number', {
                                rules: [{
                                    required: true, message: '请输入银行账户号码',
                                }],
                                initialValue:this.state.modal.bank_account_number
                            })(
                                <Input style={{width:'100%'}} />
                            )}
                        </FormItem>
                        <FormItem
                            {...Global.formItemLayout}
                            label="银行地址"
                        >
                            {getFieldDecorator('bank_address', {
                                rules: [{
                                    required: true, message: '请输入银行地址',
                                }],
                                initialValue:this.state.modal.bank_address
                            })(
                                <Input style={{width:'100%'}} />
                            )}
                        </FormItem>
                        <div>已摊销金额:在费用或资产录入到系统之前，已经摊销的总金额.</div>
                    </Modal>
                </div>
            );
        }

    }
    const BankAcc = Form.create({})(Acc);
    module.exports = BankAcc;
})();