/**
 * Created by junhui on 2017/5/15.
 */
(function () {
    'use strict';
    let React = require('react');
    let moment = require('moment');
    let {Request} = require('../request');
    let Global = require('../Global');
    let { Col, Row ,Button,Table,Input,Form ,InputNumber,Popconfirm,Select,Checkbox,Icon,message,Modal} = require('antd');
    const FormItem = Form.Item;
    const Option = Select.Option;
    const OptGroup = Select.OptGroup;
    let {GetLocalStorage,objToArr} = require('../tool');
    const rqNum = Global.reqConst.defend.type;
    class Def extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                table:[],
                edit:{},
                check:{},
                select:[],
                modal:{},
                visible:false,
                loading:false,
            }
        }
        componentWillMount() {
            this.initContent();
            this.getTree();
        }
        initContent(){
            const type = {
                type: 'asset-types/index',
                method: 'GET',
            };
            let cb = (data)=>{
                if(data.code==0){
                    let edit = {};
                    let check = {};
                    data.info.list.map((item)=>{
                        edit[item.asset_type_id] = false;
                        check[item.asset_type_id] = item.inactive==1;
                    });
                    this.setState({
                        table:data.info.list,
                        edit:edit,
                        check:check,
                    });
                }
            };
            Request({},cb,type);
        }
        hideModal(){
            this.setState({
                visible:false,
            },()=>{
                this.props.form.resetFields();
            })
        }
        showModal(item){
            let reSet = {
                modal:{},
                isAdd:true,//标记为新增类型
            };
            if(item.asset_type_id){//传入参数含有类型
                reSet.isAdd = false;//设置为修改（非添加）
                reSet.modal = item;//初始化modal内容
            }
            this.setState(reSet,()=>{
                this.setState({
                    visible:true,//显示模板,需要先更新数据后再显示内容
                });
                console.log(this.state.modal)
            });
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
                }  else {
                    message.error('请填写相应内容');//错误提示
                }
            };
            this.props.form.validateFields((err, values) => {
                if (!err) {//没有错误内容
                    let par = values;
                    par.purchase_date = moment(par.purchase_date).format('YYYY-MM-DD');//日期格式转换
                    par.depreciation_type = rqNum;//类型指定为100
                    if(this.state.isAdd){//判断模板是否为新增类型
                        type.type = 'asset-types/create';
                    }else {
                        type.type = 'asset-types/update';
                        par.asset_type_id = this.state.modal.asset_type_id;//修改类型需要传入id
                    }
                    console.log('Received values of form: ', par);
                    Request(par,cb,type);
                }else {
                    message.error(err);
                }
            });
        }
        changeCheck(item,e){//更改类型启用状态
            let check = this.state.check;
            let ok = e.target.checked;
            const type = {
                type: 'asset-types/update',
                method:'FormData',
                Method:'POST',
            };
            let par = item;//其他数据不变
            par.inactive = ok?'1':'0';//传入启用状态参数
            let cb = (data)=>{
                if(data.code==0){
                    check[item.asset_type_id] = ok;//设置checkbox选中状态
                    this.setState({
                        check:check,
                    },()=>{
                        if(ok){
                            message.warning(item.asset_type_name+`已成功停用`);

                        }else {
                            message.success(item.asset_type_name+`已成功启用`);
                        }
                    });
                }else {
                    message.error(data.message)
                }
            };
            Request(par,cb,type);
        }
        delDefend(item){
            const type = {
                type:'asset-types/delete',
                method:'FormData',
                Method:'POST'
            };
            let par = {asset_type_id:item.asset_type_id};//传入删除类型id
            let cb = (data)=>{
                if(data.code == 0){
                    message.success('删除成功');
                    this.initContent();//更新表格内容
                }else {
                    message.error(data.message)
                }
            };
            Request(par,cb,type);
        }
        getTree(){
            const type = {
                type:'tree/get-type-master-tree',
                method:'GET',
            };
            let callback = (data)=>{
                let list = objToArr(data.info);//对象类型转为数组
                let ren = this.renOption(list,-1);//转换成option
                console.log(list);
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
        render() {
            //表格结构设置
            const { getFieldDecorator } = this.props.form;
            const title = [
                {
                    title:'摊销类型名称',
                    dataIndex:'asset_type_name',
                    key:'asset_type_name',
                },
                {
                    title:'年摊销比率(%)',
                    dataIndex:'depreciation_rate',
                    key:'depreciation_rate'
                },
                {
                    title:'残值率(%)',
                    dataIndex:'residual_rate',
                    key:'residual_rate'
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
                        return<Checkbox checked={this.state.check[item.asset_type_id]} onChange={this.changeCheck.bind(this,item)}/>
                    }
                },
                {
                    title:'删除',
                    dataIndex:'delete',
                    key:'delete',
                    render:(text,item,index)=>{
                        return<Popconfirm placement="leftTop" title="是否删除该摊销类型"
                                          onConfirm={this.delDefend.bind(this,item)}
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
                            <Button type="primary" icon="plus-circle-o" onClick={this.showModal.bind(this)}>新增摊销类型</Button>
                        </Col>
                        <Col xs={4} offset={6}>
                            <h2 className="center">资产明细</h2>
                        </Col>
                    </Row>
                    <Row className="certificate-table">
                        <Table bordered size="small"
                               pagination={true}
                               columns={title}
                               dataSource={this.state.table}/>
                    </Row>
                    <Modal visible={this.state.visible}
                           title={this.state.isAdd?"新增摊销类型":"修改摊销类型"}
                           onOk={this.submitModal.bind(this)}
                           onCancel={this.hideModal.bind(this)}>
                        <FormItem
                            {...Global.formItemLayout}
                            label="摊销类型名称"
                        >
                            {getFieldDecorator('asset_type_name', {
                                rules: [{
                                    required: true, message: '请输入摊销类型名称',
                                }],
                                initialValue:this.state.modal.asset_type_name
                            })(
                                <Input style={{width:'100%'}}/>
                            )}
                        </FormItem>
                        <FormItem
                            {...Global.formItemLayout}
                            label="年摊销比率(%)"
                        >
                            {getFieldDecorator('depreciation_rate', {
                                rules: [{
                                    required: true, message: '请输入年摊销比率',
                                }],
                                initialValue:this.state.modal.depreciation_rate
                            })(
                                <InputNumber style={{width:'100%'}} min={0} max={100}/>
                            )}
                        </FormItem>
                        <FormItem
                            {...Global.formItemLayout}
                            label="残值率(%)"
                        >
                            {getFieldDecorator('residual_rate', {
                                rules: [{
                                    required: true, message: '请输入残值率',
                                }],
                                initialValue:this.state.modal.residual_rate
                            })(
                                <InputNumber style={{width:'100%'}} min={0} max={100}/>
                            )}
                        </FormItem>
                        <FormItem
                            {...Global.formItemLayout}
                            label="费用科目"
                        >
                            {getFieldDecorator('depreciation_account', {
                                rules: [{
                                    required: true, message: '请选择费用科目',
                                }],
                                initialValue:this.state.modal.depreciation_account
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
                            label="摊销科目"
                        >
                            {getFieldDecorator('accumulated_account', {
                                rules: [{
                                    required: true, message: '请选择摊销科目',
                                }],
                                initialValue:this.state.modal.accumulated_account
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
                    </Modal>
                </div>
            );
        }

    }
    const Defend = Form.create({})(Def);
    module.exports = Defend;
})();