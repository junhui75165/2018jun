/**
 * Created by junhui on 2017/5/19.
 */
(function () {
    'use strict';
    let React = require('react');
    let moment = require('moment');
    let {Request, } = require('../request');
    let Global = require('../Global');
    let {  Col, Row ,Button,Table,Input,Form ,Select,Popconfirm,Checkbox,Icon,message,Modal} = require('antd');
    const FormItem = Form.Item;
    const Option = Select.Option;
    const OptGroup = Select.OptGroup;
    let {GetLocalStorage,objToArr} = require('../tool');
    let curr = [];
    class ToGroup extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                tree:[],
                value:'',
                Form:[],
                trans:[],
                classList:[],
                sb_type:[{title:'普通科目',value:'0'},{title:'数量单价科目',value:'1'},],
                inactive:[{title:'激活',value:'0'},{title:'无效',value:'1'},],
            }
        }
        componentWillMount() {
            this.getTree();
            this.getTrans();
            this.getChartClass();
            GetLocalStorage('currency').map((item)=>{
                if(item.inactive == 0){
                    curr.push(item);
                }
            });
        }
        getTrans(){
            const type = {
                type:'chart-type/get-trans',
                method:'GET'
            };
            let cb = (data)=>{
                this.setState({
                    trans:data.info,
                })
            };
            Request({},cb,type);
        }
        getChartClass(){
            const type = {
                type:'chart-class/get-all-for-select',
                method:'GET'
            };
            let cb =(data)=>{
                let value = data.info;
                let con = [];
                for(let i in value){
                    let item = {key:i,value:value[i]};
                    con.push(item)
                }
                this.setState({
                    classList:con,
                })
            };
            Request({},cb,type);
        }
        getTree(){
            const type = {
                type:'tree/get-type-master-tree',
                method:'GET'
            };
            let cb = (data)=>{
                let list = objToArr(data.info);
                let ren = this.renOption(list,-1);
                this.setState({
                    tree:ren
                })
            };
            Request({},cb,type);
        }
        setSelect(value){

            this.setState({
                value:value,
            },()=>{
                if(value){
                    this.getContent(value);
                }else {
                    this.props.form.resetFields();//重置表格内容
                }
            })
        }
        getContent(id){
            const type = {
                type:'chart-master/master-to-type-list',
                method:'GET'
            };
            let par = {account_code:id};
            let cb = (data)=>{
                console.log(data.info);
                let con = data.info;
                let Form = {};
                con.master = con.master||{};
                Form['account_code'] = con.master.account_code;
                Form['new_master[account_code]'] = con.master.account_code+'01';
                Form['new_master[account_name]'] = con.master.account_name;
                Form['new_type[name]'] = con.master.account_name;
                Form['new_type[parent]'] = con.master.account_type;
                Form['new_type[class_id]'] = con.type.class_id;
                Form['new_account_code'] = con.master.account_code;

                Form['new_master[curr_code]'] = GetLocalStorage('Const').curr_default||curr[0].curr_abrev;
                Form['new_master[account_code2]'] = '';
                Form['new_master[sb_type]'] = this.state.sb_type[0].value;
                Form['new_master[inactive]'] = this.state.inactive[0].value;
                this.setState({
                    Form:Form
                })
            };
            Request(par,cb,type);
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
        submitItem(){
            const type = {
                type:'chart-master/trans-to-type',
                method:'FormData',
                Method:'POST',
            };
            let cb = ()=>{
                this.props.form.resetFields();//重置表格内容
                message.success('转换成功！');
                this.getTree();
            };
            this.props.form.validateFields((err, values) => {
                if (!err) {
                    let rq = {};
                    rq['account_code'] = values.account_code;
                    rq['new_type[name]'] = values.new_type.name;
                    rq['new_type[parent]'] = values.new_type.parent;
                    rq['new_type[class_id]'] = values.new_type.class_id;
                    rq['new_master[account_code]'] = values.new_master.account_code;
                    rq['new_master[account_name]'] = values.new_master.account_name;

                    rq['new_master[inactive]'] = values.new_master.inactive;
                    rq['new_master[sb_type]'] = values.new_master.sb_type;
                    rq['new_master[account_code2]'] = values.new_master.account_code2;
                    rq['new_master[curr_code]'] = values.new_master.curr_code;
                    console.log('Received values of form: ', rq);
                    if(this.state.value){
                        Request(rq,cb,type);
                    }
                }else {
                    message.error('数据有误，请查正。')
                }
            });
        }
        render() {
            const { getFieldDecorator } = this.props.form;
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
                                {this.state.tree}
                            </Select>
                        </Col>
                        <Col xs={3}>
                            <Button type="primary" icon="sync" onClick={this.submitItem.bind(this)}>科目转换为科目组</Button>
                        </Col>
                    </Row>
                    <div className="am-margin-top" style={{color:'#888888'}}>
                        本次操作将增加一个新科目组（在“新科目组”栏目定义）,
                        并将本科目变换为新科目（在“新科目”栏目定义）.
                        所有本科目的发生数将转换到新科目中.
                    </div>

                    <Row className="am-margin-top" style={{display:this.state.value?'none':'block'}}>
                        <Col xs={12}>
                            <h2>请选择一个科目</h2>
                        </Col>
                    </Row>

                    <Row style={{display:!this.state.value?'none':'block'}}>
                        <Col xs={12}>
                            <Form layout='horizontal'>
                                <h2 className="center">新科目</h2>
                                <FormItem
                                    {...Global.formItemLayout}
                                    label="原科目代码">
                                    {getFieldDecorator('account_code', {
                                        rules: [{
                                            required: false, message: '请输入货币的缩写',
                                        }],
                                        initialValue:this.state.Form.account_code
                                    })(
                                        <Input disabled style={{width:'100%'}}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...Global.formItemLayout}
                                    label="新科目代码">
                                    {getFieldDecorator('new_master[account_code]', {
                                        rules: [{
                                            required: true, message: '输入新科目代码',
                                        }],
                                        initialValue:this.state.Form['new_master[account_code]']
                                    })(
                                        <Input placeholder="输入新科目代码" style={{width:'100%'}}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...Global.formItemLayout}
                                    label="新科目名称">
                                    {getFieldDecorator('new_master[account_name]', {
                                        rules: [{
                                            required: false, message: '输入新科目名称',
                                        }],
                                        initialValue:this.state.Form['new_master[account_name]']
                                    })(
                                        <Input placeholder="输入新科目名称" style={{width:'100%'}}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...Global.formItemLayout}
                                    label="新计量单位">
                                    {getFieldDecorator('new_master[account_code2]', {
                                        rules: [{
                                            required: false, message: '请输入计量单位',
                                        }],
                                        initialValue:this.state.Form['new_master[account_code2]']
                                    })(
                                        <Input placeholder="输入计量单位" style={{width:'100%'}}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...Global.formItemLayout}
                                    label="新币别"
                                >
                                    {getFieldDecorator('new_master[curr_code]', {
                                        rules: [{
                                            required: true, message: '请选择币别',
                                        }],
                                        initialValue:this.state.Form['new_master[curr_code]']
                                    })(
                                        <Select placeholder="选择币别">
                                            {curr.map((data)=>{
                                                return  <Option value={data.curr_abrev}
                                                                key={data.curr_abrev}>{data.currency}</Option>
                                            })}
                                        </Select>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...Global.formItemLayout}
                                    label="新属性"
                                >
                                    {getFieldDecorator('new_master[sb_type]', {
                                        rules: [{
                                            required: true, message: '请选择科目属性',
                                        }],
                                        initialValue:this.state.Form['new_master[sb_type]']
                                    })(
                                        <Select placeholder="选择科目属性">
                                            {this.state.sb_type.map((data)=>{
                                                return  <Option value={data.value} key={data.value}>{data.title}</Option>
                                            })}
                                        </Select>
                                    )}

                                </FormItem>
                                <FormItem
                                    {...Global.formItemLayout}
                                    label="新科目状态"
                                    required={true}
                                    validateStatus="success"
                                >
                                    {getFieldDecorator('new_master[inactive]', {
                                        rules: [{
                                            required: true, message: '请选择科目状态',
                                        }],
                                        initialValue:this.state.Form['new_master[inactive]']
                                    })(
                                        <Select placeholder="选择科目状态">
                                            {this.state.inactive.map((data,index)=>{
                                                return  <Option value={data.value} key={data.value}>{data.title}</Option>
                                            })}
                                        </Select>
                                    )}
                                </FormItem>
                                <h2 className="center">新科目组</h2>
                                <FormItem
                                    {...Global.formItemLayout}
                                    label="组编码(ID)"
                                >
                                    {getFieldDecorator('new_account_code', {
                                        rules: [{
                                            required: false, message: '输入新科目组编号',
                                        }],
                                        initialValue:this.state.Form['new_account_code']
                                    })(
                                        <Input disabled style={{width:'100%'}}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...Global.formItemLayout}
                                    label="组名"
                                >
                                    {getFieldDecorator('new_type[name]', {
                                        rules: [{
                                            required: false, message: '输入新科目组名',
                                        }],
                                        initialValue:this.state.Form['new_type[name]']
                                    })(
                                        <Input placeholder="输入新科目组名" style={{width:'100%'}}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...Global.formItemLayout}
                                    label="上级组"
                                >
                                    {getFieldDecorator('new_type[parent]', {
                                        rules: [{
                                            required: false, message: '选择上级组',
                                        }],
                                        initialValue:this.state.Form['new_type[parent]']
                                    })(
                                        <Select placeholder="选择上级科目组">
                                            {this.state.trans.map((data,index)=>{
                                                return  <Option value={data.id} key={data.id}>{`${data.id}--${data.name}`}</Option>
                                            })}
                                        </Select>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...Global.formItemLayout}
                                    label="科目组类别"
                                >
                                    {getFieldDecorator('new_type[class_id]', {
                                        rules: [{
                                            required: false, message: '选择科目组类别',
                                        }],
                                        initialValue:this.state.Form['new_type[class_id]']
                                    })(
                                        <Select placeholder="选择科目组类别">
                                            {this.state.classList.map((data)=>{
                                                return  <Option value={data.key} key={data.key}>{`${data.key}--${data.value}`}</Option>
                                            })}
                                        </Select>
                                    )}
                                </FormItem>
                            </Form>
                        </Col>
                    </Row>
                </div>
            );
        }

    }
    const ItemToGroup = Form.create({})(ToGroup);
    module.exports = ItemToGroup;
})();