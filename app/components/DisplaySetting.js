/**
 * Created by junhui on 2017/4/21.
 */
(function () {
    'use strict';
    let　React = require('react');
    let { Card, Col, Row ,Button,Table,Input ,Select,Tooltip,
        Checkbox,message,Form   } = require('antd');
    let {Request} = require('../request');
    let {getConst} = require('../tool');
    const FormItem = Form.Item;
    const { Option, OptGroup } = Select;

    class Setting extends React.Component{
        constructor(props){
            super(props);
            console.log(this.props)
            let data = this.props.data;
            this.state = {
                left:[
                    {title:'价格/金额',key:'prices_dec',initialValue:data.prices_dec},
                    {title:'数量',key:'qty_dec',initialValue:data.qty_dec},
                    {title:'汇率',key:'rates_dec',initialValue:data.rates_dec},
                    {title:'百分比',key:'percent_dec',initialValue:data.percent_dec},
                ],
                middle:[
                    {title:'启动模块',key:'startup_tab',type:'select',initialValue:data.startup_tab},
                    {title:'使用弹出窗口显示账簿报表',key:'rep_popup',type:'checkbox',initialValue:Boolean(data.rep_popup)},
                    {title:'查询页显示行数',key:'query_size',type:'input',initialValue:data.query_size},
                    {title:'记住上个凭证日期',key:'sticky_doc_date',type:'checkbox',initialValue:Boolean(data.sticky_doc_date)},
                ],
                right:[{title:'语言',key:'language',initialValue:data.language}],
                language:[
                    {title:'English',value:'C'},
                    {title:'Chinese (Simplified)',value:'zh_CN'},
                    {title:'Chinese (Traditional)',value:'zh_TW'},
                ]
            }
        }

        submit(e){
            e.preventDefault();
            let type= {
                type:'users/save-display-prefs',
                method:'FormData',
                Method:'POST'
            };
            let cb = (data)=>{
                if(data.code == 0){
                    message.success('设置成功！');
                    getConst();
                }else {
                    message.error(data.message)
                }
            };
            this.props.form.validateFieldsAndScroll((err, values) => {
                if (!err) {
                    values.rep_popup = Number(values.rep_popup);
                    values.sticky_doc_date = Number(values.sticky_doc_date);
                    Request(values,cb,type);
                    console.log('Received values of form: ', values);
                }else {
                    message.error('未选择项，设置失败！')
                }
            });
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
            const tailFormItemLayout = {
                labelCol: {
                    xs: { span: 24 },
                    sm: { span: 14,offset:2 },
                },
                wrapperCol: {
                    xs: { span: 24 },
                    sm: { span: 6 },
                },
            };

            return (
                <div className="gen-certificate">
                    <Card title={<h1 className="certificate-title">显示设置</h1>}
                          bordered={true}>
                        <Row>
                            <Form>
                                <Col xs={8}>
                                    <h2 className="center">小数点后位数</h2>
                                    {this.state.left.map((item)=>{
                                        return<FormItem key={item.key} {...formItemLayout}
                                                        label={(<span>{item.title}</span>)}>
                                                {getFieldDecorator(item.key, {
                                                    rules: [
                                                        { required: false, message: '选择'+item.title},
                                                    ],
                                                    initialValue:Number(item.initialValue)
                                                })(
                                                  <Input type="number"/>
                                                )}
                                        </FormItem>
                                    })}
                                </Col>
                                <Col xs={8}>
                                    <h2 className="center">杂项</h2>
                                    <FormItem key={this.state.middle[0].key} {...formItemLayout}
                                              label={(<span>{this.state.middle[0].title}</span>)}>
                                        {getFieldDecorator(this.state.middle[0].key, {
                                            rules: [
                                                { required: false, message: '选择'+this.state.middle[0].title},
                                            ], initialValue:this.state.middle[0].initialValue
                                        })(
                                            <Select>
                                                <Option value="GL">总账</Option>
                                                <Option value="SB">轻松记账</Option>
                                                <Option value="EV">轻松看账</Option>
                                                <Option value="RPT">报表</Option>
                                                <Option value="system">设置</Option>
                                            </Select>
                                        )}
                                    </FormItem>
                                    <FormItem key={this.state.middle[2].key} {...formItemLayout}
                                              label={(<span>{this.state.middle[2].title}</span>)}>
                                        {getFieldDecorator(this.state.middle[2].key, {
                                            rules: [
                                                { required: false, message: '选择'+this.state.middle[2].title},
                                            ], initialValue:this.state.middle[2].initialValue
                                        })(
                                            <Input type="number"/>
                                        )}
                                    </FormItem>
                                    <FormItem key={this.state.middle[1].key} {...tailFormItemLayout}
                                                label={<span>{this.state.middle[1].title}</span>}>
                                        {getFieldDecorator(this.state.middle[1].key, {
                                            valuePropName: 'checked', initialValue:this.state.middle[1].initialValue
                                        })(
                                            <Checkbox />
                                        )}
                                    </FormItem>
                                    <FormItem key={this.state.middle[3].key} {...tailFormItemLayout}
                                              label={<span>{this.state.middle[3].title}</span>}>
                                        {getFieldDecorator(this.state.middle[3].key, {
                                            valuePropName: 'checked', initialValue:this.state.middle[3].initialValue
                                        })(
                                            <Checkbox />
                                        )}
                                    </FormItem>
                                </Col>
                                <Col xs={8}>
                                    <h2 className="center">语言</h2>
                                    {this.state.right.map((item)=>{
                                        return<FormItem key={item.key} {...formItemLayout}
                                                        label={(<span>{item.title}</span>)}>
                                            {getFieldDecorator(item.key, {
                                                rules: [
                                                    { required: false, message: '选择'+item.title},
                                                ],
                                                initialValue:item.initialValue
                                            })(
                                                <Select >
                                                    {this.state.language.map((item)=>{
                                                        return <Option value={item.value}>{item.title}</Option>
                                                    })}
                                                </Select>
                                            )}
                                        </FormItem>
                                    })}
                                </Col>
                            </Form>
                        </Row>
                        <Col className="center">
                            <Button onClick={this.submit.bind(this)}>更新</Button>
                        </Col>

                    </Card>
                </div>
            );
        }
    }
    const DisplaySetting = Form.create()(Setting);
    module.exports = DisplaySetting;
})();