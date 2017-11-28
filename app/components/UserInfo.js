/**
 * Created by junhui on 2017/6/20.
 */
(function () {
    'use strict';
    let React = require('react');
    let moment = require('moment');
    let {Request, } = require('../request');
    let Global = require('../Global');
    let {GetLocalStorage,objToArr} = require('../tool');
    let { Row ,Col,Button,Table,Input,Select,
        message,Modal,Form,Popconfirm} = require('antd');
    const Option = Select.Option;
    const FormItem = Form.Item;
    class User extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                userList:[],
                modal:{},
                visible:false,
                loading:true,
                permission:[],
                isAdd:false
            };
        }

        componentWillMount() {
            this.getPermission();
            this.getUserList();
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
                    loading:false,
                    isAdd:false
                })
            };
            Request({},cb,url);
        }
        getPermission(){
            const url = {
                type:'permission/get-permission',
                method:'GET'
            };
            let cb = (data)=>{
                let content = [];
                for(let i in data.info){
                    let item = {};
                    item.key = i;
                    item.value = data.info[i];
                    content.push(item);
                }
                this.setState({permission:content})
            };
            Request({},cb,url);
        }
        showModal(item){
            this.setState({
                modal:item,
                visible:true,
                isAdd:false
            })
        }
        hideModal(){
            this.setState({
                modal:{},
                visible:false
            })
        }
        submitModal(){
            let list = this.props.form.getFieldsValue();
            list.role_id = this.state.modal.id;
            console.log(list);
            const url = {
                type:this.state.isAdd?'permission/add-role':'permission/update-role',
                method:'FormData',
                Method:'POST'
            };
            let cb = (data)=>{
                this.setState({
                    visible:false,
                    loading:true
                },()=>{
                    message.success(this.state.isAdd?'添加成功！':'修改成功！');
                    this.props.form.resetFields();
                    this.getUserList.bind(this)();
                })
            };
            Request(list,cb,url);
        }
        deleteItem(item){
            console.log(item);
            let par = {role_id:item.id};
            const url = {
                type:'permission/del-role',
                method:'FormData',
                Method:'POST'
            };
            let cb = (data)=>{
                message.success('删除成功！');
                this.setState({
                    loading:true,
                },()=>{
                    this.getUserList.bind(this)();
                });
            };
            Request(par,cb,url);
        }
        addItem(){
            this.setState({
                modal:{},
                visible:true,
                isAdd:true,
            });
        }
        render() {
            const { getFieldDecorator } = this.props.form;
            const columns = [
                {
                    title:"角色名称",
                    key:"role_name",
                    dataIndex:"role_name"
                },
                {
                    title:"角色描述",
                    key:"description",
                    dataIndex:"description"
                },
                {
                    title:"角色类型",
                    key:"permission_info",
                    dataIndex:"permission_info",
                    render:(text)=>{
                        let value = '';
                        this.state.permission.map((item)=>{
                            if(item.key == text){
                                value = item.value;
                            }
                        });
                        return value;
                    }
                },
                {
                    title:"状态",
                    key:"status",
                    dataIndex:"status",
                    render:(text)=>{
                        return text == 1?'有效':'无效';
                    }
                },
                {
                    title:"操作",
                    key:"edit",
                    dataIndex:"edit",
                    render:(text,item)=>{
                        return <div className="center">
                            <Button icon="edit" shape="circle" onClick={this.showModal.bind(this,item)}/>
                            <Popconfirm title={"确认删除"+item.role_name+"?"} placement="bottomLeft"
                                        onConfirm={this.deleteItem.bind(this,item)}
                                        okText="删除" cancelText="取消">
                                <Button icon="delete" shape="circle"/>
                            </Popconfirm>
                        </div>
                    }
                }
            ];
            return (
                <div>
                    <div>
                        <Button type="primary" icon="plus-circle-o" onClick={this.addItem.bind(this)}>添加角色</Button>
                    </div>
                    <Table size="small" bordered className="certificate-table"
                           pagination={false} loading={this.state.loading}
                           columns={columns} dataSource={this.state.userList}/>
                    <Modal title={this.state.isAdd?'新增角色':("角色名称："+this.state.modal.role_name)}
                           visible={this.state.visible}
                           onOk={this.submitModal.bind(this)}
                           onCancel={this.hideModal.bind(this)}>
                        <FormItem
                            {...Global.formItemLayout}
                            label="角色名称"
                        >
                            {getFieldDecorator('role_name', {
                                rules: [{
                                    required: true, message: '请输入角色名称',
                                }],
                                initialValue:this.state.modal.role_name
                            })(
                                <Input style={{width:'100%'}} disabled={!this.state.isAdd}/>
                            )}
                        </FormItem>
                        <FormItem
                            {...Global.formItemLayout}
                            label="角色描述"
                        >
                            {getFieldDecorator('description', {
                                rules: [{
                                    required: true, message: '请输入角色描述',
                                }],
                                initialValue:this.state.modal.description
                            })(
                                <Input style={{width:'100%'}} disabled={!this.state.isAdd}/>
                            )}
                        </FormItem>
                        <FormItem
                            {...Global.formItemLayout}
                            label="角色类型"
                        >
                            {getFieldDecorator('permission_info', {
                                rules: [{
                                    required: true, message: '请选择角色类型',
                                }],
                                initialValue:String(this.state.modal.permission_info||'')
                            })(
                                <Select style={{width:"100%"}}>
                                    {this.state.permission.map((item)=>{
                                        return <Option value={item.key}>{item.value}</Option>
                                    })}
                                </Select>
                            )}
                        </FormItem>
                        <FormItem
                            {...Global.formItemLayout}
                            label="角色描述"
                        >
                            {getFieldDecorator('status', {
                                rules: [{
                                    required: true, message: '请选择有效性',
                                }],
                                initialValue:this.state.modal.status
                            })(
                                <Select style={{width:"100%"}}>
                                    <Option value="1">有效</Option>
                                    <Option value="0">无效</Option>
                                </Select>
                            )}
                        </FormItem>
                    </Modal>
                </div>
            );
        }

    }
    const UserInfo = Form.create({})(User);
    module.exports = UserInfo;
})();