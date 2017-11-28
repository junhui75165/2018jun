/**
 * Created by junhui on 2017/5/12.
 */
(function () {
    'use strict';
    let React = require('react');
    let moment = require('moment');
    let {Request} = require('../request');
    let Global = require('../Global');
    let {toThousands} = require('../tool');
    let {  Col, Row ,Button,Table,Input,Form ,InputNumber,DatePicker,Popconfirm,Select,Checkbox,message,Modal} = require('antd');
    const FormItem = Form.Item;
    const Option = Select.Option;
    const reqNum = Global.reqConst.fixed.type;
    class Asset extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                table:[],
                edit:{},
                check:{},
                select:[],
                modal:{},
                detailed:[],
                detailVisible:false,
                visible:false,
                loading:false,
            }
        }

        componentWillMount() {
            this.initContent();
            this.getSelectList();
        }

        initContent(){
            const type = {
                type: 'assets/index',
                method: 'GET',
            };
            let par = {depreciation_type:reqNum};
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
        getSelectList(){
            const type = {
                type: 'asset-types/index',
                method: 'GET',
            };
            let par = {depreciation_type:reqNum};
            let cb = (data)=>{
                if(data.code==0){
                    this.setState({
                        select:data.info.list
                    })
                }
            };
            Request(par,cb,type);
        }

        changeCheck(item,e){
            let check = this.state.check;
            let ok = e.target.checked;
            const type = {
                type: 'assets/update-inactive',
                method:'FormData',
                Method:'POST',
            };
            let par = {asset_id:item.asset_id,inactive:ok?'1':'0'};
            let cb = (data)=>{
                if(data.code==0){
                    check[item.asset_id] = ok;
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
                loading:true,
            });
            let type = {
                method:'FormData',
                Method:'POST',
            };
            let cb = (data)=>{
              if(data.code == 0){
                  this.props.form.resetFields();
                  this.setState({
                      visible:false,
                      loading:false,
                  },()=>{
                      message.success(`${this.state.isAdd?'新增':'修改'}成功`);
                      this.initContent();
                  });
              }  else {
                  message.error('请填写相应内容');//错误提示
              }
            };
            this.props.form.validateFields((err, values) => {
                if (!err) {
                    let par = values;
                    par.purchase_date = moment(par.purchase_date).format('YYYY-MM-D');
                    // par.asset_type_id = reqNum;//固定资产类型指定为1
                    if(this.state.isAdd){
                        type.type = 'assets/create';
                    }else {
                        type.type = 'assets/update';
                        par.asset_id = this.state.modal.asset_id;
                    }
                    console.log('Received values of form: ', par);
                    Request(par,cb,type);
                }else {
                    message.error('请填写相应内容');
                }
            });
        }
        hideModal(){
            this.setState({
                modal:{},
                visible:false,
            },()=>{
                this.props.form.resetFields();
            })
        }
        showModal(item){
            let reSet = {
                modal:{},
                isAdd:true,
            };
            if(item.asset_id){
                reSet.isAdd = false;
                reSet.modal = item;
            }
            this.setState(reSet,()=>{
                this.setState({
                    visible:true,//显示模板,需要先更新数据后再显示内容
                });
                console.log(this.state.modal)
            });
        }
        delAssets(item){
            const type = {
                type:'assets/delete',
                method:'FormData',
                Method:'POST'
            };
            let par = {
                asset_id:item.asset_id,
            };
            let cb = (data)=>{
                if(data.code == 0){
                    message.success('删除成功');
                    this.initContent();
                }else {
                    message.error(data.message)
                }
            };
            Request(par,cb,type);
        }
        showDetail(item){
            const type = {
                type:'assets/asset-info',
                method:'GET'
            };
            let par = {id:item.asset_id};
            let cb = (data)=>{
                let num = item.purchase_value;
                let list = data.info.amortisation;
                list.map((item)=>{
                    item.value = num-item.amount;
                    num = item.value;
                });
                this.setState({
                    detailed:data.info.amortisation,
                    detailVisible:true
                })
            };
            Request(par,cb,type);
        }
        setVisible(type){
            this.setState({
                detailVisible:type
            })
        }
        render() {
            const { getFieldDecorator } = this.props.form;
            const title = [
                {
                    title:'资产类型',
                    dataIndex:'asset_type_name',
                    key:'asset_type_name',
                },
                {
                    title:'资产名称',
                    dataIndex:'asset_name',
                    key:'asset_name'
                },
                {
                    title:'型号(系列号)',
                    dataIndex:'asset_serial',
                    key:'asset_serial'
                },
                {
                    title:'购入日期',
                    dataIndex:'purchase_date',
                    key:'purchase_date'
                },
                {
                    title:'购入价格',
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
                                          onConfirm={this.delAssets.bind(this,item)}
                                          okText="确定"
                                          cancelText="取消">
                            <Button icon="delete" shape="circle"/>
                        </Popconfirm>
                    }
                },
                // {
                //     title:'折旧明细',
                //     dataIndex:'detailed',
                //     key:'detailed',
                //     render:(text,item)=>{
                //         return <Button onClick={this.showDetail.bind(this,item)}>折旧明细</Button>
                //     }
                // }
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
                    title: '折旧额度',
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
                            <Button type="primary" icon="plus-circle-o" onClick={this.showModal.bind(this)}>新增资产</Button>
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
                           title={this.state.isAdd?"新增资产":"修改资产"}
                           onOk={this.submitModal.bind(this)}
                           onCancel={this.hideModal.bind(this)}>
                        <Form >
                            <FormItem
                                {...Global.formItemLayout}
                                label="资产类型"
                            >
                                {getFieldDecorator('asset_type_id', {
                                    rules: [{
                                        required: true, message: '请选择资产类型',
                                    }],
                                    initialValue:this.state.modal.asset_type_id
                                })(
                                    <Select>
                                        {this.state.select.map((item)=>{
                                            return<Option value={item.asset_type_id} key={item.asset_type_id}>{item.asset_type_name}</Option>
                                        })}
                                    </Select>
                                )}
                            </FormItem>
                            <FormItem
                                {...Global.formItemLayout}
                                label="资产名称"
                            >
                                {getFieldDecorator('asset_name', {
                                    rules: [{
                                        required: true, message: '请输入资产名称',
                                    }],
                                    initialValue:this.state.modal.asset_name
                                })(
                                    <Input/>
                                )}
                            </FormItem>
                            <FormItem
                                {...Global.formItemLayout}
                                label="型号(系列号)"
                            >
                                {getFieldDecorator('asset_serial', {
                                    rules: [{
                                        required: false, message: '请输入资产型号',
                                    }],
                                    initialValue:this.state.modal.asset_serial
                                })(
                                    <Input/>
                                )}
                            </FormItem>
                            <FormItem
                                {...Global.formItemLayout}
                                label="标签号"
                            >
                                {getFieldDecorator('tag_number', {
                                    rules: [{
                                        required: false, message: '请输入标签号',
                                    }],
                                    initialValue:this.state.modal.tag_number
                                })(
                                    <Input/>
                                )}
                            </FormItem>
                            <FormItem
                                {...Global.formItemLayout}
                                label="购入日期"
                            >
                                {getFieldDecorator('purchase_date', {
                                    rules: [{
                                        required: true, message: '请选择购入日期',
                                    }],
                                    initialValue:moment(this.state.modal.purchase_date)
                                })(
                                    <DatePicker style={{width:'100%'}}/>
                                )}
                            </FormItem>
                            <FormItem
                                {...Global.formItemLayout}
                                label="购入价格"
                            >
                                {getFieldDecorator('purchase_value', {
                                    rules: [{
                                        required: true, message: '请输入购入价格',
                                    }],
                                    initialValue:Number(this.state.modal.purchase_value?this.state.modal.purchase_value:0)
                                })(
                                    <InputNumber style={{width:'100%'}}/>
                                )}
                            </FormItem>
                            <FormItem
                                {...Global.formItemLayout}
                                label="地点"
                            >
                                {getFieldDecorator('asset_location', {
                                    rules: [{
                                        required: false, message: '请输入购入地点',
                                    }],
                                    initialValue:this.state.modal.asset_location
                                })(
                                    <Input style={{width:'100%'}}/>
                                )}
                            </FormItem>
                            <FormItem
                                {...Global.formItemLayout}
                                label="状况"
                            >
                                {getFieldDecorator('asset_condition', {
                                    rules: [{
                                        required: true, message: '请输入购入状况',
                                    }],
                                    initialValue:this.state.modal.asset_condition
                                })(
                                    <Input style={{width:'100%'}}/>
                                )}
                            </FormItem>
                            <FormItem
                                {...Global.formItemLayout}
                                label="领用"
                            >
                                {getFieldDecorator('asset_acquisition', {
                                    rules: [{
                                        required: false, message: '请输入领用人',
                                    }],
                                    initialValue:this.state.modal.asset_acquisition
                                })(
                                    <Input style={{width:'100%'}}/>
                                )}
                            </FormItem>
                            <FormItem
                                {...Global.formItemLayout}
                                label="已计提折旧金额"
                            >
                                {getFieldDecorator('amount', {
                                    rules: [{
                                        required: true, message: '请输入已计提折旧金额',
                                    }],
                                    initialValue:Number(this.state.modal.amount?this.state.modal.amount:0)
                                })(
                                    <InputNumber style={{width:'100%'}}/>
                                )}
                            </FormItem>
                        </Form>
                    </Modal>
                    <Modal visible={this.state.detailVisible}
                           width="960"
                           title={`${this.state.modal.asset_type_name}：折旧明细`}
                           onOk={this.setVisible.bind(this,false)}
                           onCancel={this.setVisible.bind(this,false)}>
                        <div className="certificate-table">
                            <Table bordered size="small"
                                   pagination={false}
                                   columns={title}
                                   dataSource={[].concat(this.state.modal)}/>
                            <Table bordered pagination={false} className="genson-margin-top" size="small"
                                   dataSource={this.state.detailed} columns={det}/>
                        </div>
                    </Modal>
                </div>
            );
        }

    }
    const Assets = Form.create({})(Asset);
    module.exports = Assets;
})();