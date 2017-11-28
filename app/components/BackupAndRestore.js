/**
 * 备份和恢复内容
 * Created by junhui on 2017/7/3.
 */
(function () {
    'use strict';
    let React = require('react');
    let moment = require('moment');
    let { Tabs, Col, Row ,Popconfirm,Table,Input ,message,Button, } = require('antd');
    let {Request} = require('./../request');
    const TabPane = Tabs.TabPane;
    class BackupAndRestore extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                activeKey:"2",
                textarea:"",
                dataSource:[],
                loading:false,
            }
        }

        componentDidMount() {
            this.setState({
                loading:true,
            },()=>{
                this.getBackList();
            });
        }

        changeArea(e){
            let value = e.target.value;
            this.setState({
                textarea:value
            })
        }
        getBackList(){
            const url = {
                type:'backup/get-back-list',
                method:'FormData',
                Method:'POST'
            };
            let cb = (data)=>{
                this.setState({
                    loading:false,
                    dataSource:data.info
                })
            };
            this.setState({
                loading:true,
            },()=>{
                Request({},cb,url);
            });
        }
        createBackup(){
            const url = {
                type:'backup/back-up',
                method:'FormData',
                Method:'POST'
            };
            let par = {back_info:this.state.textarea};
            let cb = (data)=>{
                this.setState({
                   textarea:''
                },()=>{
                    message.success('创建成功');
                });
            };
            if(par.back_info.length<10){
                message.warning('备注信息至少需要10个字符。')
            }else if(this.state.dataSource.length==10){
                message.warning('备份数量已达到十条。')
            }else {
                Request(par,cb,url);
            }
        }
        deleteItem(item){
            const url = {
                type:'backup/back-clear',
                method:'FormData',
                Method:'POST'
            };
            let par = {back_id:item.id};
            console.info(item);
            let cb = ()=>{
                message.success('备份删除成功！');
                this.getBackList();
            };
            Request(par,cb,url);
        }
        restore(item){
            const url = {
                type:'backup/back-restore',
                method:'FormData',
                Method:'POST'
            };
            let par = {back_id:item.id};
            console.info(item);
            let cb = ()=>{
                message.success('备份恢复成功！');
            };
            Request(par,cb,url);
        }
        changeActiveKey(activeKey){
            this.setState({activeKey},()=>{
                if(activeKey == "2"){
                    this.getBackList();
                }
            })
        }
        render() {
            const columns = [
                {
                    title:'备份编号',
                    key:'id',
                    dataIndex:'id'
                },
                {
                    title:'备份日期',
                    key:'date',
                    dataIndex:'date'
                },
                {
                    title:'备份描述',
                    key:'note',
                    dataIndex:'note'
                },
                {
                    title:'备份删除',
                    key:'delete',
                    dataIndex:'delete',
                    render:(text,item)=>{
                        return <Popconfirm placement="leftTop" title="是否删除该备份？"
                                           onConfirm={this.deleteItem.bind(this,item)} okText="是" cancelText="否">
                            <Button icon="delete" shape="circle" type="danger"/>
                        </Popconfirm>
                    }
                },
                {
                    title:'备份恢复',
                    key:'restore',
                    dataIndex:'restore',
                    render:(text,item)=>{
                        return<Popconfirm placement="leftTop" title="是否恢复该备份？"
                                          onConfirm={this.restore.bind(this,item)} okText="是" cancelText="否">
                            <Button icon="reload" shape="circle" type="primary"/>
                        </Popconfirm>
                    }
                },
            ];
            return (
                <div>
                    <Tabs activeKey={this.state.activeKey} onChange={this.changeActiveKey.bind(this)}
                          tabPosition="left">
                        <TabPane tab="创建备份" key="1">
                            <Row>
                                <Col xs={24} md={16} lg={10}>
                                    <Input type="textarea" autosize={{minRows:2}}
                                           placeholder="请输入备注信息，长度至少10个字符。"
                                           value={this.state.textarea}
                                           onChange={this.changeArea.bind(this)}/>
                                </Col>
                            </Row>
                            <Row><span className="gen-font-grey" style={{fontSize:'13px'}}>备份最多可创建10个。</span></Row>
                            <Row className="genson-margin-top">
                                <Col xs={4}>
                                    <Button onClick={this.createBackup.bind(this)}>创建备份</Button>
                                </Col>
                            </Row>
                        </TabPane>
                        <TabPane tab="备份管理" key="2" className="certificate-table">
                            <Table bordered loading={this.state.loading} size="small"
                                   dataSource={this.state.dataSource} columns={columns} pagination={false}/>
                        </TabPane>
                    </Tabs>
                </div>
            );
        }

    }
    module.exports = BackupAndRestore;

})();