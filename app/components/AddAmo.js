/**
 * Created by junhui on 2017/5/16.
 */
(function () {
    'use strict';
    let React = require('react');
    let moment = require('moment');
    let {Request, } = require('../request');
    let Global = require('../Global');
    let { Col, Row ,Button,Table,Input,Form ,DatePicker,Popconfirm,Select,Checkbox,message,Modal} = require('antd');
    const FormItem = Form.Item;
    const Option = Select.Option;
    let {toThousands} = require('../tool');
    const rqNum = Global.reqConst.defend.type;
    class Amo extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                table:[],
                edit:{},
                check:{},
                select:[],
                modal:{},
                list:[],
                visible:false,
                loading:false,
            }
        }
        componentWillMount() {
            this.initContent();
            this.getSelect();
        }
        initContent(){
            const type = {
                type: 'assets/index',
                method: 'GET',
            };
            let par = {depreciation_type:rqNum};
            let cb = (data)=>{
                if(data.code==0){
                    let edit = {};
                    let check = {};
                    data.info.list.map((item)=>{
                        edit[item.asset_id] = false;
                        check[item.asset_id] = item.inactive==1;
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
        getSelect(){
            const type = {
                type:'asset-types/index',
                method:'GET',
            };
            let callback = (data)=>{
                let list = data.info.list;//对象类型转为数组
                this.setState({list:list});
            };
            Request({},callback,type);
        }

        delDefendFixed(item){
            const type = {
                type:'asset/delete',
                method:'FormData',
                Method:'POST'
            };
            let par = {
                asset_id:item.asset_id,
            };
            let cb = (data)=>{
                if(data.code == 0){
                    this.initContent();
                    message.sucess('删除成功');
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
            };
            if(item.asset_id){//传入参数含有类型
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
                type: 'assets/update',
                method:'FormData',
                Method:'POST',
            };
            let par = item;//其他数据不变
            par.inactive = ok?'1':'0';//传入启用状态参数
            let cb = (data)=>{
                if(data.code==0){
                    check[item.asset_id] = ok;//设置checkbox选中状态
                    this.setState({
                        check:check,
                    },()=>{
                        if(ok){
                            message.warning(item.asset_name+`已成功停用`);
                        }else {
                            message.success(item.asset_name+`已成功启用`);
                        }
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
                    par.purchase_date = moment(par.purchase_date).format('YYYY-MM-D');//日期格式转换
                    // par.depreciation_type = rqNum;//类型指定为100
                    if(this.state.isAdd){//判断模板是否为新增类型
                        type.type = 'assets/create';
                    }else {
                        type.type = 'assets/update';
                        par.asset_id = this.state.modal.asset_id;//修改类型需要传入id
                    }
                    console.log('Received values of form: ', par);
                    Request(par,cb,type);
                }else {
                    message.error('请填写相应内容');//错误提示
                }
            });
        }
        render() {
            const { getFieldDecorator } = this.props.form;
            const title = [
                {
                    title:'摊销类型',
                    dataIndex:'asset_type_name',
                    key:'asset_type_name',
                },
                {
                    title:'摊销项目名称',
                    dataIndex:'asset_name',
                    key:'asset_name',
                },
                {
                    title:'备注',
                    dataIndex:'asset_serial',
                    key:'asset_serial'
                },
                {
                    title:'入账日期',
                    dataIndex:'purchase_date',
                    key:'purchase_date'
                },
                {
                    title:'金额',
                    dataIndex:'purchase_value',
                    key:'purchase_value',
                    render:(text)=>{
                        return <div className="right">{toThousands(text)}</div>
                    }
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
                        return<Checkbox checked={this.state.check[item.asset_id]} onChange={this.changeCheck.bind(this,item)}/>
                    }
                },
                {
                    title:'删除',
                    dataIndex:'delete',
                    key:'delete',
                    render:(text,item,index)=>{
                        return<Popconfirm placement="leftTop" title="是否删除该资产"
                                          onConfirm={this.delDefendFixed.bind(this,item)}
                                          okText="确定"
                                          cancelText="取消">
                            <Button icon="delete" shape="circle"/>
                        </Popconfirm>
                    }
                },
            ];
            const det = [
                {
                    title: '年份',
                    dataIndex: 'amortisation_year',
                    key: 'amortisation_year',
                },
                {
                    title: '月份',
                    dataIndex: 'amortisation_month',
                    key: 'amortisation_month',
                },
                {
                    title: '摊销额度',
                    dataIndex: 'amount',
                    key: 'amount',
                },
                {
                    title: '净值',
                    dataIndex: 'value',
                    key: 'value',
                },
                {
                    title: '记账凭证',
                    dataIndex: 'edit',
                    key: 'edit',
                    render:(text,item,index)=>{
                        if(item.posted!='0'){
                            return<Button onClick={this.showDetailed.bind(this,item)} shape="circle" icon="search"/>
                        }else {
                            return '';
                        }
                    }
                },
            ];
            return (
                <div>
                    <Row className="genson-margin-top">
                        <Col xs={4}>
                            <Button type="primary" icon="plus-circle-o" onClick={this.showModal.bind(this)}>新增摊销项目</Button>
                        </Col>
                        <Col xs={4} offset={6}>
                            <h2 className="center">摊销项目明细</h2>
                        </Col>
                    </Row>
                    <Row className="certificate-table">
                        <Table bordered size="small"
                               pagination={true}
                               columns={title}
                               dataSource={this.state.table}/>
                    </Row>
                    <Modal visible={this.state.visible}
                           title={this.state.isAdd?"新增摊销项目":"修改摊销项目"}
                           onOk={this.submitModal.bind(this)}
                           onCancel={this.hideModal.bind(this)}>
                        <FormItem
                            {...Global.formItemLayout}
                            label="摊销类型"
                        >
                            {getFieldDecorator('asset_type_id', {
                                rules: [{
                                    required: true, message: '请选择摊销类型',
                                }],
                                initialValue:this.state.modal.asset_type_id
                            })(
                                <Select
                                    allowClear
                                    optionLabelProp="children"
                                    optionFilterProp="children"
                                    style={{ width: '100%'}}
                                    notFoundContent="没有匹配的选项"
                                >
                                    {this.state.list.map((item)=>{
                                        return<Option value={item.asset_type_id} key={item.asset_type_id}>{item.asset_type_name}</Option>
                                    })}
                                </Select>
                            )}
                        </FormItem>
                        <FormItem
                            {...Global.formItemLayout}
                            label="摊销项目名称"
                        >
                            {getFieldDecorator('asset_name', {
                                rules: [{
                                    required: true, message: '请输入摊销项目名称',
                                }],
                                initialValue:this.state.modal.asset_name
                            })(
                                <Input style={{width:'100%'}} />
                            )}
                        </FormItem>
                        <FormItem
                            {...Global.formItemLayout}
                            label="备注"
                        >
                            {getFieldDecorator('asset_serial', {
                                rules: [{
                                    required: false, message: '请输入备注',
                                }],
                                initialValue:this.state.modal.asset_serial
                            })(
                                <Input style={{width:'100%'}} />
                            )}
                        </FormItem>
                        <FormItem
                            {...Global.formItemLayout}
                            label="入账日期"
                        >
                            {getFieldDecorator('purchase_date', {
                                rules: [{
                                    required: true, message: '请选择固定资产科目',
                                }],
                                initialValue:moment(this.state.modal.purchase_date)
                            })(
                                <DatePicker style={{width:'100%'}}/>
                            )}
                        </FormItem>
                        <FormItem
                            {...Global.formItemLayout}
                            label="金额"
                        >
                            {getFieldDecorator('purchase_value', {
                                rules: [{
                                    required: true, message: '请输入金额',
                                }],
                                initialValue:this.state.modal.purchase_value
                            })(
                                <Input style={{width:'100%'}} />
                            )}
                        </FormItem>
                        <FormItem
                            {...Global.formItemLayout}
                            label="已摊销金额"
                        >
                            {getFieldDecorator('amount', {
                                rules: [{
                                    required: true, message: '请输入已摊销金额',
                                }],
                                initialValue:this.state.modal.amount
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
    const AddAmo = Form.create({})(Amo);
    module.exports = AddAmo;
})();