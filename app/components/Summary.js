/**
 * Created by junhui on 2017/5/22.
 */
(function () {
    'use strict';
    let React = require('react');
    let moment = require('moment');
    let {Request, } = require('../request');
    let Global = require('../Global');
    let {rtTableHeight} = require('./../tool');
    let { Row ,Button,Table,Input,Form ,Popconfirm,Select,message,Modal} = require('antd');
    const FormItem = Form.Item;
    class Summ extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                Table:{},
                loading:false,
                summaryList:[],
                visible:false,
                isAdd:false,
                modal:{}
            };
        }

        componentWillMount() {
            this.getSummaryList();
        }

        getSummaryList(){
            this.setState({loading:true});
            const type = {
                type:'tags/get-tags-list',
                method:'GET'
            };
            let cb = (data)=>{
                this.setState({
                    summaryList:data.info,
                    loading:false
                })
            };
            Request({},cb,type);
        }
        addSummary(){
            this.setState({
                visible:true,
                isAdd:true,
                modal:{}
            })
        }
        delItem(item){
            console.log('del item',item);
            let par = {id:item.id};
            const type = {
                method:'GET',
                type:'tags/delete-tags'
            };
            let cb = (data)=>{
                this.getSummaryList();
                message.success(`${item.description}已删除`)
            };
            Request(par,cb,type);
        }
        editItem(item){
            console.log('edit item',item);
            this.setState({
                visible:true,
                isAdd:false,
                modal:item
            })
        }
        submitModal(){
            const type = {
                type:this.state.isAdd?'tags/save-tags':'tags/update-tags',
                method:'FormData',
                Method:'POST',
            };
            let cb = (data)=>{
                message.success(`${this.state.isAdd?'新增':'修改'}成功`);
                this.setState({
                    visible:false,
                },()=>{
                    this.props.form.resetFields();//重置表格内容
                    this.getSummaryList();
                })
            };
            this.props.form.validateFields((err, values) => {
                if (!err) {
                    if(!this.state.isAdd){
                        values.id = this.state.modal.id;
                    }
                    console.log('Received values of form: ', values);
                    Request(values,cb,type);
                }else {
                    message.error(err)
                }
            });
        }
        hideModal(){
            this.setState({
                visible:false,
            },()=>{
                this.props.form.resetFields();
            })
        }
        render() {
            const { getFieldDecorator } = this.props.form;
            let columns = [
                {
                    title:'编号',
                    dataIndex: 'name',
                    key: 'name',
                    sorter: (a, b) => a.name - b.name,
                    width:'20%'
                },
                {
                    title:'摘要',
                    dataIndex: 'description',
                    key: 'description',
                    width:'40%'
                },
                {
                    title:'编辑',
                    dataIndex: 'edit',
                    key: 'edit',
                    width:'20%',
                    render:(text,item,index)=>{
                        return<Button icon="edit" shape="circle" onClick={this.editItem.bind(this,item)}/>
                    }
                },
                {
                    title:'删除',
                    dataIndex: 'delete',
                    key: 'delete',
                    width:'20%',
                    render:(text,item,index)=>{
                        return<Popconfirm placement="leftTop" title="是否删除该摘要"
                                          onConfirm={this.delItem.bind(this,item)}
                                          okText="确定"
                                          cancelText="取消">
                            <Button icon="delete" shape="circle"/>
                        </Popconfirm>
                    }
                },
            ];
            return (
                <div >
                    <Row className="genson-margin-top">
                        <Button type="primary" icon="plus-circle-o" onClick={this.addSummary.bind(this)}>新增摘要</Button>
                    </Row>
                    <Table className="certificate-table"
                           loading={this.state.loading}
                           size="small"
                           bordered
                           scroll={{y:rtTableHeight()}}
                           pagination={false}
                           columns={columns}
                           dataSource={this.state.summaryList}/>
                    <Modal  visible={this.state.visible}
                            title={`${this.state.isAdd?'新增':'修改'}摘要`}
                            onOk={this.submitModal.bind(this)}
                            onCancel={this.hideModal.bind(this)}>
                        <Form >
                            <FormItem
                                {...Global.formItemLayout}
                                label="摘要编号"
                            >
                                {getFieldDecorator('name', {
                                    rules: [{
                                        required: true, message: `请输入要${this.state.isAdd?'新增':'修改'}的编号`,
                                    }],
                                    initialValue:this.state.modal.name
                                })(
                                    <Input style={{width:'100%'}}/>
                                )}
                            </FormItem>
                            <FormItem
                                {...Global.formItemLayout}
                                label="摘要内容"
                            >
                                {getFieldDecorator('description', {
                                    rules: [{
                                        required: true, message: `请输入要${this.state.isAdd?'新增':'修改'}的摘要内容`,
                                    }],
                                    initialValue:this.state.modal.description
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
    const Summary = Form.create({})(Summ);
    module.exports = Summary;
})();

