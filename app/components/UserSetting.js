/**
 * Created by junhui on 2017/4/19.
 */
(function () {
    'use strict';
    let React = require('react');
    let { Card, Col, Row ,Modal,Checkbox,Input ,
        message,Button,Form,Select,Table,Icon,
        Popconfirm,Tooltip,Popover  } = require('antd');
    let {Request} = require('../request');
    let {GetLocalStorage,objToArr} = require('../tool');
    const FormItem = Form.Item;
    const Option = Select.Option;
    class Setting extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                data : [],
                modal:false,
                isAdd:false,
                check:{},
                Modal:{},
                inputPsw:false,
                psw:'',
                userList:[]
            }
        }

        componentWillMount() {
            console.log('UserSetting WillMount',this.props.data);
            let userModal = {};
            let check = {};
            this.props.data.map((item)=>{
                userModal[item.user_id] = false;
                check[item.user_id] = item.inactive==1;
            });
            userModal.data = this.props.data;
            userModal.check = check;
            this.setState(userModal,()=>{
                this.getUserList();
            });
        };

        componentWillReceiveProps(nextProps, nextContext) {
            // console.log('UserSetting WillMount',nextProps.data);
            let userModal = {};
            let check = {};
            nextProps.data.map((item)=>{
                userModal[item.user_id] = false;
                check[item.user_id] = item.inactive==1;
            });
            userModal.data = nextProps.data;
            userModal.check = check;
            this.setState(userModal);
        }

        onConfirm(item){
            console.log('删除用户信息',item);
            const type = {
                type:'users/delete',
                method:'GET',
            };
            let par = {id:item.id};
            let callback = (data)=>{
                this.setState({subject:data.info},()=>{
                    message.success(item.user_id+'删除成功');
                },()=>{
                    this.props.search();
                });
            };
            Request(par,callback,type);
        };
        AddModal(state){
            this.setState({
                modal:state,
                isAdd:state,
                Modal:{}
            },()=>{
                if(!state){
                    this.props.form.resetFields();
                }
            })
        }
        handleSubmit (e) {
            e.preventDefault();
            this.setState({
                modal:false
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
                        this.props.search();//重新更新表格内容
                    });
                }else {
                    message.error(data.message);//错误提示
                }
            };
            this.props.form.validateFieldsAndScroll((err, values) => {
                if(err){
                    message.error('输入有误，提交失败！')
                }else {
                    let par = values;
                    if(this.state.isAdd){//判断模板是否为新增类型
                        type.type = 'users/create';
                    }else {
                        type.type = 'users/update';
                        par.id = this.state.Modal.id;//修改类型需要传入id
                        // par.role_id = this.state.Modal.role_id;//修改类型需要传入id
                    }
                    par.rep_popup = par.rep_popup?1:0;
                    console.log('Received values of form: ', values);
                    Request(par,cb,type);
                }
            });
        };
        handleConfirmBlur(e) {
            const value = e.target.value;
            this.setState({ confirmDirty: this.state.confirmDirty || !!value });
        };
        checkConfirm(rule, value, callback){
            const form = this.props.form;
            if (value && this.state.confirmDirty) {
                form.validateFields(['confirm'], { force: true });
            }
            callback();
        };
        checkPassword (rule, value, callback){
            const form = this.props.form;
            if (value && value !== form.getFieldValue('password')) {
                callback('两次输入的密码不一致!');
            } else {
                callback();
            }
        };
        editModal(record,type,option,e){
            let set = {};
            set[record.user_id] = type;
            set.isAdd = false;
            set.modal = true;
            set.Modal = record;
            this.setState(set);
        };
        changeCheck(item,e){
            let check = this.state.check;
            let ok = e.target.checked;
            let par = item;//其他数据不变
            const type = {
                type: 'users/update',
                method:'FormData',
                Method:'POST',
            };
            par.inactive = ok?'1':'0';//传入启用状态参数
            let cb = (data)=>{
                if(data.code==0){
                    check[item.user_id] = ok;//设置checkbox选中状态
                    this.setState({
                        check:check,
                    },()=>{
                        if(ok){
                            message.warning(item.real_name+`已成功停用`);
                        }else {
                            message.success(item.real_name+`已成功启用`);
                        }
                    })
                }else {
                    message.error(data.message)
                }
            };
            Request(par,cb,type);
        }
        getUserList(){
            const url = {
                type:'permission/get-all-roles',
                method:"GET",
            };
            let cb = (data)=>{
                let userList = objToArr(data.info);
                this.setState({
                    userList,
                })
            };
            Request({},cb,url);
        }
        render() {
            const { getFieldDecorator } = this.props.form;
            const formItemLayout = {
                labelCol: {
                    xs: { span: 24 },
                    sm: { span: 6 },
                },
                wrapperCol: {
                    xs: { span: 24 },
                    sm: { span: 14 },
                },
            };
            const tailFormItemLayout = {
                wrapperCol: {
                    xs: {
                        span: 24,
                        offset: 0,
                    },
                    sm: {
                        span: 14,
                        offset: 8,
                    },
                },
            };
            const columns = [
                {
                title: '登录用户名',
                dataIndex: 'user_id',
                key: 'user_id',
            }, {
                title: '姓名',
                dataIndex: 'real_name',
                key: 'real_name',
            }, {
                title: '电话',
                dataIndex: 'phone',
                key: 'phone',
            }, {
                title: '电子邮箱',
                key: 'email',
                dataIndex:'email'
            }, {
                title: '上次访问',
                key: 'lastVisit',
                dataIndex:'lastVisit'
            }, {
                title: '权限级别',
                key: 'role_info',
                dataIndex:'role_info'
            }, {
                title: '语言',
                key: 'language',
                dataIndex:'language'
            }, {
                title: '停用',
                key: 'inactive',
                dataIndex:'inactive',
                render:(text,item)=>{
                    return <Checkbox checked={this.state.check[item.user_id]} onChange={this.changeCheck.bind(this,item)}/>
                }
            }, {
                title: '编辑',
                key: 'edit',
                dataIndex:'edit',
                render:(text,record)=> <div>
                    <Button icon="edit" shape="circle" onClick={this.editModal.bind(this,record,true,'open')}/>
                    </div>
                }, {
                    title: '删除',
                    key: 'delete',
                    dataIndex:'delete',
                    render:(text,record)=> <Popconfirm title="确认删除账户？"
                                                       okText="是"
                                                       cancelText="否"
                                                       placement="leftTop"
                                                       onConfirm={this.onConfirm.bind(this,record)}>
                        <Button icon="delete" shape="circle"/>
                    </Popconfirm>
                },];
            return (
                <div className="gen-certificate">
                    <Card title={<h1 className="certificate-title">用户帐户设置</h1>}
                          bordered={true}>
                        <Row>
                            <Col xs={4}>
                                <Button type="primary" icon="user-add" onClick={this.AddModal.bind(this,true)}>新增用户</Button>
                            </Col>
                            <Modal title={`${this.state.isAdd?'新增用户':'修改用户'}`} visible={this.state.modal}
                                   onOk={this.handleSubmit.bind(this)} onCancel={this.AddModal.bind(this,false)} >
                                <Form>
                                    <FormItem
                                        {...formItemLayout}
                                        label={(
                                            <span>
                                                登录用户名&nbsp;
                                                <Tooltip title="登陆时使用的用户名">
                                                    <Icon type="question-circle-o" />
                                                </Tooltip>
                                            </span>
                                        )}
                                        hasFeedback
                                    >
                                        {getFieldDecorator('user_id', {
                                            rules: [{ required: true, message: '请输入用户名!', whitespace: true }],
                                            initialValue:this.state.Modal.user_id
                                        })(
                                            <Input disabled={!this.state.isAdd}/>
                                        )}
                                    </FormItem>
                                    {/*<FormItem*/}
                                        {/*{...formItemLayout}*/}
                                        {/*label="密码"*/}
                                        {/*hasFeedback*/}
                                    {/*>*/}
                                        {/*{getFieldDecorator('password', {*/}
                                            {/*rules: [{*/}
                                                {/*required: true, message: '请输入你的登陆密码!',*/}
                                            {/*}, {*/}
                                                {/*validator: this.checkConfirm.bind(this),*/}
                                            {/*}],*/}
                                        {/*})(*/}
                                            {/*<Input type="password" />*/}
                                        {/*)}*/}
                                    {/*</FormItem>*/}
                                    {/*<FormItem*/}
                                        {/*{...formItemLayout}*/}
                                        {/*label="确认密码"*/}
                                        {/*hasFeedback*/}
                                    {/*>*/}
                                        {/*{getFieldDecorator('confirm', {*/}
                                            {/*rules: [{*/}
                                                {/*required: true, message: '请再次确认你的登陆密码!',*/}
                                            {/*}, {*/}
                                                {/*validator: this.checkPassword.bind(this),*/}
                                            {/*}],*/}
                                        {/*})(*/}
                                            {/*<Input type="password" onBlur={this.handleConfirmBlur.bind(this)} />*/}
                                        {/*)}*/}
                                    {/*</FormItem>*/}
                                    <FormItem
                                        {...formItemLayout}
                                        label="邮箱"
                                        hasFeedback
                                    >
                                        {getFieldDecorator('email', {
                                            rules: [{
                                                type: 'email', message: '这不是一个邮箱地址!',
                                            }, {
                                                required: false, message: '请输入你的邮箱地址!',
                                            }],
                                            initialValue:this.state.Modal.email
                                        })(
                                            <Input />
                                        )}
                                    </FormItem>
                                    <FormItem
                                        {...formItemLayout}
                                        label="用户真实姓名"
                                    >
                                        {getFieldDecorator('real_name', {
                                            rules: [{
                                                required: false, message: '请输入用户真实姓名!',
                                            }],
                                            initialValue:this.state.Modal.real_name
                                        })(
                                            <Input />
                                        )}
                                    </FormItem>
                                    <FormItem
                                        {...formItemLayout}
                                        label="电话号码"
                                    >
                                        {getFieldDecorator('phone', {
                                            rules: [{ required: false, message: '请输入你的电话号码!' }],
                                            initialValue:this.state.Modal.phone
                                        })(
                                            <Input />
                                        )}
                                    </FormItem>
                                    <FormItem
                                        {...formItemLayout}
                                        label="权限级别"
                                    >
                                        {getFieldDecorator('role_id', {
                                            rules: [
                                                { required: true, message: '选择你的身份!' },
                                            ],
                                            initialValue:this.state.Modal.role_id
                                        })(
                                            <Select placeholder="选择你的身份">
                                                {
                                                    this.state.userList.map((item)=>{
                                                        return <Option key={item.id} value={item.id}>
                                                            {item.role_name}({item.description})
                                                        </Option>
                                                    })
                                                }
                                            </Select>
                                        )}
                                    </FormItem>
                                    <FormItem
                                        {...formItemLayout}
                                        label="语言"
                                    >
                                        {getFieldDecorator('language', {
                                            rules: [
                                                { required: true, message: '选择你使用的语言!' },
                                            ],
                                            initialValue:this.state.Modal.language
                                        })(
                                            <Select placeholder="选择你使用的语言">
                                                <Option value="C">English</Option>
                                                <Option value="zh_CN">Chinese (Simplified)</Option>
                                                <Option value="zh_TW">Chinese (Traditional)</Option>
                                            </Select>
                                        )}
                                    </FormItem>
                                    <FormItem
                                        {...tailFormItemLayout}
                                    >
                                        {getFieldDecorator('rep_popup', {
                                            valuePropName: 'checked',
                                            initialValue:this.state.Modal.rep_popup
                                        })(
                                            <div>
                                                <Checkbox />
                                                <span>显示报表使用弹出窗口</span>
                                            </div>
                                        )}
                                    </FormItem>
                                </Form>
                            </Modal>
                        </Row>
                        <div className="certificate-table">
                            <Table columns={columns} dataSource={this.state.data}
                                   bordered pagination={false} size="small"/>
                        </div>
                    </Card>
                </div>
            );
        }
    }
    const UserSetting = Form.create()(Setting);
    module.exports = UserSetting;
})();