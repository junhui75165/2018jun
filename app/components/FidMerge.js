/**
 * Created by junhui on 2017/6/15.
 */
(function () {
    'use strict';
    let React = require('react');
    let {Request,} = require('../request');
    let {formItemLayout} = require('../Global');
    let {objToArr,GetLocalStorage,SetLocalStorage,getConst} = require('../tool');
    let { Button,Input ,Modal,Form,message } = require('antd');
    const FormItem = Form.Item;
    class Fid extends React.Component{
        constructor(props){
            super(props);

            this.state = {
                controlsValue:{},
                cmpKey:[1,2],
                formItem:[],
                visible:false,
                content:'',
                fidList:[],
            }
        }

        componentDidMount() {
            this.setState({
                content:this.props.content,
            },()=>{
                this.setCmp();
            })
        }

        componentWillReceiveProps(nextProps, nextContext) {
            this.setState({
                content:nextProps.content,
            })
        }
        setCmp(){
            let fid = String(GetLocalStorage('Const').fid);//当前账户fid
            let list = GetLocalStorage('Const').rpt_combination||'';//数据库记录合并值
            let record = list.split('^');
            if(record.indexOf(fid)>-1 && record.indexOf(fid)!=0){
                let index = record.indexOf(fid);
                let tem = record[record.indexOf(fid)];
                record.splice(index, 1);
                record.unshift(tem);
            }
            let fidList = record.indexOf(fid)>-1?record:[fid].concat(record);
            let cmpKey = [];
            fidList.map((item,i)=>{
                cmpKey.push(i+1);
            });
            this.setState({cmpKey,fidList});
        }
        addModalUser(){
            let keyList = this.state.cmpKey;
            const key = keyList[keyList.length-1];
            this.setState({
                cmpKey:keyList.concat(key+1),
            });
        }
        delKey(key){
            let keyList = this.state.cmpKey;
            let fidList = this.state.fidList;
            let i = keyList.indexOf(key);
            keyList.splice(i,1);
            fidList.splice(i,1);
            this.setState({
                cmpKey:keyList,
                fidList
            });
        }
        validateToken(par,cb){
            const type = {
                type:'sign-in/get-token',
                method:'FormData',
                Method:'POST'
            };
            Request(par,cb,type);
        }
        companyMerge(list){
            const url = {
                type:'sys-prefs/company-merge',
                method:'FormData',
                Method:'POST'
            };
            let cb = (data)=>{
                const _this = this;
                let promise = new Promise((resolve, reject)=>{
                    getConst(resolve);
                });
                promise.then(function(value) {
                    // success
                    _this.setCmp.bind(_this)();
                    message.success('合并成功');
                }, function(value) {
                    // failure
                    message.success('合并失败');
                });

            };
            Request(list,cb,url);
        }
        handleSubmit(){
            this.props.form.validateFields((errors, values)=>{
                let keyList = this.state.cmpKey;
                let Right = 0;
                let cmpIndex = 0;
                let error = [];
                let merge = [];
                let companyList = {};
                let cb = (data)=>{
                    cmpIndex++;
                    if(data.info){
                        Right++;
                    }else {
                        error.push(values[`cmpId${cmpIndex}`]);
                    }
                    if(cmpIndex == keyList.length &&error.length>0){
                        message.error('账号'+error.join('、')+'验证出错！')
                    }
                    if(Right == keyList.length){
                        this.setState({
                            visible:false
                        },()=>{
                            this.companyMerge(companyList);
                            this.props.form.resetFields();
                            SetLocalStorage('fidList',merge);
                            this.props.initTabsContent();
                        })
                    }
                };
                keyList.map((key,index)=>{
                    let par = {};
                    par.user_id = values[`cmpName${key}`];
                    par.fid = values[`cmpId${key}`];
                    par.password = values[`cmpPsw${key}`];

                    companyList[`company[${index}][fid]`] = values[`cmpId${key}`];
                    companyList[`company[${index}][user_id]`] = values[`cmpName${key}`];
                    companyList[`company[${index}][password]`] = values[`cmpPsw${key}`];
                    if(par.user_id&&par.fid&&par.password){
                        merge.push(par.fid);
                        this.validateToken(par,cb);
                    }
                });
            });
        }
        hideModal(){
            this.setState({
                visible:false,
            },()=>{
                this.setCmp.bind(this)();
            })
        }
        showModal(){
            this.setState({
                visible:true
            },()=>{
                this.setCmp.bind(this)();
            })
        }
        render() {
            const { getFieldDecorator } = this.props.form;

            let {fidList} = this.state;

            const formItem = this.state.cmpKey.map((key,i)=>{
                return <Form key={key} autoComplete="off">
                    <h3 className="genson-margin-top">
                        {`合并企业${key}`}
                        <Button style={{marginLeft:'2rem'}} onClick={this.delKey.bind(this,key)}
                                disabled={this.state.cmpKey.length<=2}
                                shape="circle" type="danger" icon="delete"/>
                    </h3>
                    <FormItem
                        {...formItemLayout}
                        label={(<span>公司</span>)}
                    >
                        {getFieldDecorator(`cmpId${key}`, {
                            rules: [{ required: true, message: '请输入公司id!', whitespace: true }],
                            initialValue:fidList[i],
                        })(
                            <Input autoComplete="off" disabled={fidList[i] == GetLocalStorage('Const').fid && i==0}/>
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label={(<span>用户名</span>)}
                    >
                        {getFieldDecorator(`cmpName${key}`, {
                            rules: [{ required: true, message: '请输入用户名!', whitespace: true }],
                            initialValue:'admin'
                        })(
                            <Input disabled/>
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label={(<span>密码</span>)}
                    >
                        {getFieldDecorator(`cmpPsw${key}`, {
                            rules: [{ required: true, message: '请输入用户密码!', whitespace: true }],
                            initialValue:''
                        })(
                            <Input type="password" autoComplete="off"/>
                        )}
                    </FormItem>
                </Form>
            });
            return (
                <div style={{display:'inline'}}>
                    <a onClick={this.showModal.bind(this)}>{this.state.content+`${!!fidList?`(${fidList.join(',')})`:''}`}</a>
                    <Modal title={"报表合并定义"} visible={this.state.visible}
                           onOk={this.handleSubmit.bind(this)}
                           onCancel={this.hideModal.bind(this)} >
                        <Button icon="user-add" type="primary" onClick={this.addModalUser.bind(this)}>添加企业</Button>
                        {formItem}
                    </Modal>
                </div>
            );
        }
    }
    const FidMerge = Form.create()(Fid);
    module.exports = FidMerge;
})();