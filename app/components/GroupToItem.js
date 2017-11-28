/**
 * Created by junhui on 2017/5/19.
 */
(function () {
    'use strict';
    let React = require('react');
    let moment = require('moment');
    let {Request, } = require('../request');
    let Global = require('../Global');
    let {  Col, Row ,Button,Select,Alert,message} = require('antd');
    const Option = Select.Option;

    class GroupToItem extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                tree:[],
                value:'',
                chartType:[],
                showErrors:false
            }
        }
        componentWillMount() {
            this.getList();
        }

        getList(){
            const type = {
                type:'chart-type/get-trans',
                method:'GET',
            };
            let cb = (data)=>{
                this.setLevel(data.info);
            };
            Request({},cb,type);
        }
        setLevel(list){
            list.map((item)=>{
                let parent = item.parent;
                if(!parent){
                    item.level = 0;
                }else {
                    list.map((con)=>{
                        if(parent == con.id){
                            item.level = con.level+1;
                        }
                    })
                }
            });
            this.setState({
                tree:list
            });
        }
        setSelect(value){
            this.setState({
                value:value
            },()=>{
                this.chartType(value);
            })
        }
        chartType(id){
            const type = {
                type:'chart-type/type-to-master-verify',
                method:'GET',
            };
            let par = {id:id};
            let cb = (data)=>{
                this.setState({
                    chartType:data.info.list,
                    showErrors:!data.info.is_to_master
                });
            };
            if(id){
                Request(par,cb,type);
            }
        }
        submitItem(){
            let value = this.state.value;
            let par = {id:value};
            const type = {
                type:'chart-type/trans-to-master',
                method:'FormData',
                Method:'POST',
            };
            let cb = (data)=>{
                this.setState({
                    value:''
                },()=>{
                    message.success('转换成功！');
                    this.getList();
                })
            };
            if(value&&!this.state.showErrors){
                Request(par,cb,type);
            }else if(this.state.showErrors){
                message.error('该科目组不可结转')
            }else {
                message.error('请选择一个科目组')
            }
        }
        render() {
            return (
                <div>
                    <Row>
                        <Col xs={10}>
                            选择一个科目：
                            <Select
                                showSearch
                                allowClear
                                optionLabelProp="title"
                                optionFilterProp="title"
                                style={{ width: '60%'}}
                                notFoundContent="没有匹配的选项"
                                onChange={this.setSelect.bind(this)}
                                value={this.state.value}>
                                {this.state.tree.map((item)=>{
                                    return<Option key={item.id} value={item.id} title={`${item.id}--${item.name}`}>
                                        <div style={{textIndent:(item.level||0)*0.75+'rem'}}>
                                            {`${item.id}--${item.name}`}
                                        </div>
                                        </Option>
                                })}
                            </Select>
                        </Col>
                        <Col xs={3}>
                            <Button type="primary" icon="sync" onClick={this.submitItem.bind(this)}>科目组转换为科目</Button>
                        </Col>
                    </Row>
                    <div className="am-margin-top" style={{display:this.state.value?'block':'none'}}>
                        <Row>
                            <Col xs={12}>
                                <h2 className="center">将被合并的科目</h2>
                            </Col>
                        </Row>
                        <Alert style={{display:this.state.showErrors?'block':'none'}} className="genson-max-width"
                            message="科目组转换"
                            description="该科目组已定义了下属的科目组，不能进行转换！"
                            type="error"
                            closable
                            showIcon/>
                        {this.state.chartType.map((item)=>{
                            return<div key={item.account_code} style={{fontWeight:'bold'}}>
                                <span >{item.account_code}</span>
                                <span >--{item.account_name}</span>
                            </div>
                        })}
                        {
                            !this.state.showErrors&&this.state.chartType.length==0?
                            <div style={{fontWeight:'bold'}}>该科目下没有科目组</div>:''
                        }
                        <div className="am-margin-top genson-max-width">
                            本次操作将把本科目组下属的所有科目合并为一个新科目（编码为本科目组编码ID）,
                            所有本科目组下属科目的发生数将合并到新科目中.
                            本操作不可逆转，请谨慎使用.
                        </div>
                    </div>
                </div>
            );
        }

    }
    module.exports = GroupToItem;
})();