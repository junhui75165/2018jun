/**
 * Created by junhui on 2017/5/17.
 */
(function () {
    'use strict';
    let React = require('react');
    let moment = require('moment');
    let {Request} = require('../request');
    let Global = require('../Global');
    let { Transfer, Col, Row ,Button,Table,Input,Form ,
        Select,Checkbox,message,Modal} = require('antd');
    const Option = Select.Option;
    let {GetLocalStorage,objToArr} = require('../tool');
    class RootContent extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                check:false,
                role:[],
                isNew:false,
                defaultRole:'',
                userInfo:{},
                title:[],
                userPermission:[],
                permissionList:[],
                dataSource:[],
                targetKeys:[],
                defaultTarget:[],
                hideUser:true//隐藏角色功能
            }
        }

        componentWillMount() {
            this.getAllPermission();

        }
        getRoleList(){
            const type = {
                type:'auth/get-roles',
                method:'FormData',
                Method:'POST',
            };
            let cb = (data)=>{
                this.setState({
                    role:data.info.roles_grop,
                    defaultRole:this.state.defaultRole||data.info.roles_own[0],
                },()=>{
                    if(this.state.role.length == 0){
                        message.error('角色列表为空！');
                    }else {
                        this.getUserInfo();
                    }
                });
            };
            Request({},cb,type);
        }
        getAllPermission(){
            const type = {
                type:'auth/get-all-permission',
                method:'GET'
            };
            let cb = (data)=>{
                let list = data.info;
                let permission = [];
                let title = [];
                let k = 0;
                let dataSource = [];
                for(let i in list){
                    title.push(i);
                    permission[k] = list[i];
                    dataSource[k] = [];
                    for(let j in list[i]){
                        const data = {
                            key: `${k}-${j}`,
                            title: `${i}`,
                            list:k,
                            name:j,
                            description: `${list[i][j]}`,
                        };
                        dataSource[k].push(data);
                    }
                    k++;
                }
                console.log(dataSource);
                this.setState({
                    permissionList:permission,
                    title:title,
                    dataSource:dataSource,
                },()=>{
                    this.getRoleList();
                })
            };
            Request({},cb,type);
        }
        getUserInfo(){
            const type = {
                type:'auth/get-permission',
                method:'FormData',
                Method:'POST',
            };
            let par = {
                role_name:this.state.defaultRole
            };
            let cb = (data)=>{
                let list = data.info.permission;
                let permission = [];
                let targetKeys = [];
                let defaultTarget = new Array();
                for(let i in list){
                    let index = this.state.title.indexOf(i);
                    permission[i] = list[i];
                    targetKeys[index] = [];
                    defaultTarget[index] = [];
                    for(let j in list[i]){
                        let key = this.state.permissionList[index].indexOf(list[i][j]);
                        let item = this.state.dataSource[index][key];
                        targetKeys[index].push(item.key);
                        defaultTarget[index].push(item.key);
                    }
                }
                this.setState({
                    userInfo:data.info.info,
                    userPermission:permission,
                    targetKeys:this.state.copyTargetKeys?this.state.copyTargetKeys:targetKeys,
                    defaultTarget:defaultTarget,
                    isNew:this.state.defaultRole=='新的角色',
                    copyTargetKeys:null
                })
            };
            Request(par,cb,type);
        }
        changeSelect(value){
            this.setState({
                defaultRole:value
            },()=>{
                this.getUserInfo();
            })
        }
        changeCheck(e){
            let value = e.target.checked;
            this.setState({
                check:value
            })
        }
        renderFooter () {
            return (
                <Button size="small" style={{ float: 'right', margin: 5 }}
                        onClick={this.getRoleList.bind(this)}>
                    重置
                </Button>
            );
        }
        handleChange (index,item,targetKeys) {
            let list = this.state.targetKeys;
            list[index] = targetKeys;
            this.setState({targetKeys:list});
        }
        submitPermission(){
            let delList = [];
            let addList = [];
            let length = this.state.dataSource.length;
            const permission = this.state.permissionList;
            for(let index=0;index<length;index++){
                let def = this.state.defaultTarget[index]?this.state.defaultTarget[index]:[];
                let sel = this.state.targetKeys[index]?this.state.targetKeys[index]:[];
                def.map((item)=>{
                    if(sel.indexOf(item)==-1){
                        let i = item.split('-')[0];
                        let j = item.split('-')[1];
                        delList.push(permission[i][j]);
                    }
                });
                sel.map((item)=>{
                    if(def.indexOf(item)==-1){
                        let i = item.split('-')[0];
                        let j = item.split('-')[1];
                        addList.push(permission[i][j]);
                    }
                });
            }
            let par = {
                role_name:this.state.defaultRole,
            };
            addList.map((item,index)=>{
                par[`permission_items[assign][${index}]`] = item;
            });
            delList.map((item,index)=>{
                par[`permission_items[remove][${index}]`] = item;
            });
            this.setPermission(par);
        }
        setPermission(par){
            const type = {
                method:'FormData',
                Method:'POST',
                type:'auth/set-permission'
            };
            let cb = (data)=>{
                message.success('权限更新成功');
                this.getRoleList();
            };
            Request(par,cb,type);
        }
        changeContent(type,e){
            let value;
            let userInfo = this.state.userInfo;
            switch (type){
                case 'name':
                    value = e.target.value;
                    userInfo.name = value;
                    break;
                case 'description':
                    value = e.target.value;
                    userInfo.description = value;
                    break;
                case 'status':
                    value = e;
                    userInfo.status = value;
                    break;
            }
            this.setState({
                userInfo:userInfo,
            });

        }
        saveInfo(){
            let par = {
                role_description:this.state.userInfo.description,
                role_status:this.state.userInfo.status=='有效'?'1':'0',
                role_name_new:this.state.userInfo.name,
                role_name_old:this.state.defaultRole,
            };
            const type = {
                type:'auth/edit-roles',
                method:'FormData',
                Method:'POST',
            };
            let cb = (data)=>{
                message.success(`${par.role_name_old}修改成功`);
                this.getRoleList();
            };
            Request(par,cb,type);
        }
        AddRole(){
            let par = {
                role_name:this.state.userInfo.name,
                role_description:this.state.userInfo.description,
                role_status:this.state.userInfo.status=='有效'?'1':'0',
            };
            const type = {
                type:'auth/add-roles',
                method:'FormData',
                Method:'POST',
            };
            let cb = (data)=>{
                message.success(`${par.role_name}添加成功`);
                this.getRoleList();
            };
            Request(par,cb,type);
        }
        delRole(){

        }
        copyRole(){
            this.setState({
                copyTargetKeys:this.state.targetKeys
            },()=>{
                this.changeSelect('新的角色')
            })
        }

        render() {
            return (
                <div>
                    <h2>角色信息：</h2>
                    <Row className="genson-margin-top">
                        <Col xs={6}>
                            角色：<Select style={{width:'60%'}} className="genson-input"
                                       value={this.state.defaultRole}
                                       onChange={this.changeSelect.bind(this)}>
                                {this.state.role.map((item,index)=>{
                                    return<Option value={item} key={index}>{item}</Option>
                                })}
                            </Select>
                        </Col>
                        <Col xs={3}>
                            显示停用角色：<Checkbox checked={this.state.check} onChange={this.changeCheck.bind(this)}/>
                        </Col>
                        <Col xs={6} style={{display:this.state.hideUser?'none':'block'}}>
                            <Row className="genson-margin-top">
                                <Col className="right" xs={8}>角色名：</Col>
                                <Col xs={16}>
                                    <Input onChange={this.changeContent.bind(this,'name')}
                                           className="genson-input"
                                           value={this.state.userInfo.name}/>
                                </Col>
                            </Row>
                            <Row className="genson-margin-top">
                                <Col className="right" xs={8}>角色描述：</Col>
                                <Col xs={16}>
                                    <Input onChange={this.changeContent.bind(this,'description')}
                                           className="genson-input"
                                           value={this.state.userInfo.description}/>
                                </Col>
                            </Row>
                            <Row className="genson-margin-top">
                                <Col className="right" xs={8}>当前状态：</Col>
                                <Col xs={16}>
                                    <Select style={{width:'100%'}} className="genson-input"
                                            onChange={this.changeContent.bind(this,'status')}
                                            value={this.state.userInfo.status}>
                                        <Option value="有效">有效</Option>
                                        <Option value="停用">停用</Option>
                                    </Select>
                                    {/*<Input value={this.state.userInfo.status}/>*/}
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <h2 className="genson-margin-top">权限操作：</h2>
                    <Row className="genson-margin-top">
                        <Col xs={2} offset={1}>
                            <Button icon="save" onClick={this.submitPermission.bind(this)}>更改权限</Button>
                        </Col>
                        <Col xs={2} offset={1}>
                            <Button icon="reload" onClick={this.getRoleList.bind(this)}>重置权限</Button>
                        </Col>
                        <Col style={{display:this.state.isNew?'block':'none'}} xs={2} offset={1}>
                            <Button icon="plus-circle-o" onClick={this.AddRole.bind(this)}>添加角色</Button>
                        </Col>
                        <Col style={{display:!this.state.isNew?'block':'none'}} xs={2} offset={1}>
                            <Button icon="copy" onClick={this.copyRole.bind(this)}>复制角色</Button>
                        </Col>
                        <Col style={{display:!this.state.isNew?'block':'none'}} xs={2} offset={1}>
                            <Button icon="delete" disabled onClick={this.delRole.bind(this)}>删除角色</Button>
                        </Col>
                        <Col style={{display:!this.state.isNew?'block':'none'}} xs={2} offset={1}>
                            <Button style={{display:this.state.hideUser?'none':'block'}} onClick={this.saveInfo.bind(this)}>保存角色信息</Button>
                        </Col>
                    </Row>
                    <h2 className="genson-margin-top">角色权限：</h2>
                    {
                        this.state.permissionList.map((item,index)=>{
                            return<Col xs={12} style={{padding:'1rem'}} key={index}>
                                <h2 className="genson-margin-top">{this.state.title[index]}</h2>
                                <Transfer className="genson-margin-top"
                                    style={{margin:'0 auto'}}
                                    dataSource={this.state.dataSource[index]}
                                    showSearch
                                    listStyle={{
                                        width: 200,
                                        height: 300,
                                    }}
                                    notFoundContent="列表为空"
                                    operations={['添加', '删除']}
                                    targetKeys={this.state.targetKeys[index]}
                                    onChange={this.handleChange.bind(this,index,item)}
                                    render={item => `${item.description}`}/>
                            </Col>
                        })
                    }
                    <Row>

                    </Row>
                </div>
            );
        }

    }
    module.exports = RootContent;
})();