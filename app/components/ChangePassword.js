/**
 * Created by junhui on 2017/4/24.
 */
(function () {
    'use strict';
    let React = require('react');
    let { Card, Col, Row,Input ,message,Button,Form } = require('antd');
    let {Request} = require('./../request');
    let { hashHistory} =require('react-router');
    const FormItem = Form.Item;
    class Password extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                confirmDirty: false,
            };
        }
        submit(e){
            let type={
                // type:'sign-in/reset-password',
                type:'users/reset-password',
                method:'FormData',
                Method:'POST'
            };
            let callback =  (data)=> {
                if(data.code == 0){
                    message.success('修改成功，请重新登陆！');
                    setTimeout(()=>{
                        hashHistory.push('/login');
                    },2000);
                }else{
                    message.error(data.message)
                }
            };
            this.props.form.validateFieldsAndScroll((err, values) => {
                if (!err) {
                    Request(values,callback,type);
                    console.log('Received values of form: ', values);
                }else {
                    message.error('修改失败！')
                }
            });
        }
        handleConfirmBlur (e) {
            const value = e.target.value;
            this.setState({ confirmDirty: this.state.confirmDirty || !!value });
        }
        checkPassword (rule, value, callback) {
            const form = this.props.form;
            if (value && value !== form.getFieldValue('new_password')) {
                callback('两次密码验证不一致!');
            } else {
                callback();
            }
        }
        checkConfirm(rule, value, callback) {
            const form = this.props.form;
            if (value && this.state.confirmDirty) {
                form.validateFields(['re_password'], { force: true });
            }
            callback();
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
                    <Card title={<h1 className="certificate-title">更改密码</h1>}
                          bordered={true}>
                        <Row>
                            <Col xs={8} offset={8}>
                                <Form >
                                    <FormItem
                                        {...formItemLayout}
                                        label="旧密码"

                                    >
                                        {getFieldDecorator('password', {
                                            rules: [{
                                                required: true, message: '输入你当前的密码!',
                                            }],
                                        })(
                                            <Input type="password" />
                                        )}
                                    </FormItem>
                                    <FormItem
                                        {...formItemLayout}
                                        label="新密码"

                                    >
                                        {getFieldDecorator('new_password', {
                                            rules: [{
                                                required: true, message: '输入你的密码!',
                                            }, {
                                                validator: this.checkConfirm.bind(this),
                                            }],
                                        })(
                                            <Input type="password" />
                                        )}
                                    </FormItem>
                                    <FormItem
                                        {...formItemLayout}
                                        label="重复密码"

                                    >
                                        {getFieldDecorator('re_password', {
                                            rules: [{
                                                required: true, message: '请再次输入你的密码!',
                                            }, {
                                                validator: this.checkPassword.bind(this),
                                            }],
                                        })(
                                            <Input type="password" onBlur={this.handleConfirmBlur.bind(this)} />
                                        )}
                                    </FormItem>

                                </Form>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={8} offset={8}>
                                <Col offset={6}>
                                    <Button onClick={this.submit.bind(this)}>更改密码</Button>
                                </Col>

                            </Col>
                        </Row>
                    </Card>
                </div>
            );
        }
    }
    const ChangePassword = Form.create()(Password);
    module.exports = ChangePassword;
})();