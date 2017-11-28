/**
 * Created by junhui on 2017/4/20.
 */
(function () {
    'use strict';
    let React = require('react');
    let { Card, Col, Row ,Button,Select,
        message,Form } = require('antd');
    const FormItem = Form.Item;
    const { Option, OptGroup } = Select;
    let {Request} = require('../request');
    let {GetLocalStorage,SetLocalStorage,objToArr,getConst} = require('./../tool');

    class Setting extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                item:[
                    {title:'未分配利润',key:'retained_earnings_act',value:GetLocalStorage('Const')['retained_earnings_act']},
                    {title:'本年利润',key:'profit_loss_year_act',value:GetLocalStorage('Const')['profit_loss_year_act']},
                    {title:'外汇差异帐户',key:'exchange_diff_act',value:GetLocalStorage('Const')['exchange_diff_act']},
                    {title:'银行费用科目',key:'bank_charge_act',value:GetLocalStorage('Const')['bank_charge_act']},
                    {title:'销售成本科目',key:'default_cogs_act',value:GetLocalStorage('Const')['default_cogs_act']},
                ]
            }
        }
        componentWillMount() {
            let list = objToArr(this.props.data);
            list = this.renOption(list,-1);
            this.setState({
                list:list
            });
        }
        resetConst(){
            const type = {
                type:'refs/get-date-vnum',
                method:'FormData',
                Method:'POST'
            };
            let cb = (data)=>{
                SetLocalStorage('Const',data.info);
                let con = this.state.item;
                con.map((item,index)=>{
                    con[index].value = data.info[item.key];
                });
                console.log('new item',con);
                this.setState({
                    item:con
                })
            };
            Request({},cb,type);
        }
        submit(e){
            e.preventDefault();
            let type= {
                type:'sys-prefs/update',
                method:'FormData',
                Method:'POST'
            };
            let cb = (data)=>{
                if(data.code == 0){
                    message.success('设置成功！');
                    this.resetConst();
                    getConst();
                }else {
                    message.error(data.message)
                }
            };
            this.props.form.validateFieldsAndScroll((err, values) => {
                if (!err) {
                    Request(values,cb,type);
                    console.log('Received values of form: ', values);
                }else {
                    message.error('未选择项，设置失败！')
                }
            });
        }
        renOption(list,level){
            level++;
            let ren = list.map((data1)=>{
                if(data1.open){
                    return <OptGroup key={data1.account_code} label={<div style={{textIndent:(level)*0.75+'rem'}}>
                        {data1.account_code+' - '+data1.account_name}
                        </div>}>
                        {
                            data1.children.map((data2)=>{
                                if(data2.open){
                                    return <OptGroup key={data2.account_code}
                                                     label={<div style={{textIndent:(level)*0.75+'rem'}}>
                                        {data2.account_code+' - '+data2.account_name}
                                    </div>}>
                                        {this.renOption(data2.children,level+1)}
                                    </OptGroup>
                                }else {
                                    return <Option title={data2.account_code+"  "+data2.account_name}
                                                   value={data2.account_code} key={data2.account_code}>
                                        <div style={{textIndent:level*0.75+'rem'}}>
                                            {data2.account_code+' - '+data2.account_name}
                                            </div>
                                        </Option>
                                }
                            })
                        }
                    </OptGroup>
                }else {
                    return <Option title={data1.account_code+"  "+data1.account_name}
                                   value={data1.account_code} key={data1.account_code}>
                        <div style={{textIndent:level*0.75+'rem'}}>{data1.account_code+' - '+data1.account_name}</div>
                        </Option>
                }
            });
            return ren;
        }
        render() {
            const { getFieldDecorator } = this.props.form;
            const formItemLayout = {
                labelCol: {
                    xs: { span: 24 },
                    sm: { span: 6 },
                },
                wrapperCol: {
                    xs: { span: 24 },
                    sm: { span: 14 },
                },
            };
            return (
                <div className="gen-certificate">
                    <Card title={<h1 className="certificate-title">系统总账设置</h1>}
                          bordered={true}>
                        <Row>
                            <Col lg={10} md={16} xs={24} offset={7} xsOffset={5}>
                                <Form>
                                    {this.state.item.map((item)=>{
                                        return <FormItem key={item.key} {...formItemLayout}
                                                         label={(<span>{item.title}</span>
                                                         )}>
                                            {getFieldDecorator(item.key, {
                                                rules: [
                                                    { required: true, message: '选择'+item.title},
                                                ],
                                                initialValue:GetLocalStorage('Const')[item.key]
                                            })(
                                                <Select
                                                    showSearch
                                                    allowClear
                                                    optionLabelProp="title"
                                                    optionFilterProp="title"
                                                    style={{ width: '80%'}}
                                                    notFoundContent="没有匹配的选项">
                                                    {this.state.list}
                                                </Select>
                                            )}
                                        </FormItem>
                                    })}
                                </Form>
                                <Button style={{marginLeft:'25%'}} onClick={this.submit.bind(this)}>提交</Button>
                            </Col>
                        </Row>
                    </Card>
                </div>
            );
        }
    }
    const AccountSetting = Form.create()(Setting);
    module.exports = AccountSetting;

})();