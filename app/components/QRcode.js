/**
 * Created by junhui on 2017/11/6.
 */
(()=>{
    "use strict";
    let React = require('react');
    let { Card, Col, Row ,Button,Modal,message,Alert} = require('antd');
    let {GetLocalStorage} = require('../tool');
    let {cmpUrl} = require('../Global');
    class QRcode extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                content:cmpUrl+"/scan-code/validate?",
                loading:false,
                step:1,
            };
        }

        componentDidMount() {
            this.getQRcode();
        }
        getQRcode(){

            // 设置参数方式
            let e = document.getElementById('qrcode');
            e.innerHTML ='';
            this.setState({loading:true},()=>{
                // 使用 API
                let fid = GetLocalStorage('Const').fid;
                let token = GetLocalStorage('token');
                let content = this.state.content+'token='+token+'&fid='+fid;
                console.log(content);
                let qrcode = new QRCode('qrcode', {
                    text: content,
                    width: 256,
                    height: 256,
                    colorDark : '#000000',
                    colorLight : '#ffffff',
                    // correctLevel : QRCode.CorrectLevel.H
                });
                e.className='block-center animated fadeIn';
                setTimeout(()=>{
                    this.setState({loading:false});
                    e.className='block-center';
                },1000)
            });
        };
        nextGo(){
            let step = this.state.step+1;
            this.setState({step});
        }
        render() {
            return (
                <div className="gen-certificate">
                    <Card title={<h1 className="certificate-title">{this.props.title}</h1>}
                          bordered={true}>
                        <h2>使用条件说明：</h2>
                        <ul type="1" start="1">
                            <li className="genson-margin-top">打开微信扫一扫</li>
                            <li className="genson-margin-top">关注<a>谨信云会计</a>微信公众号</li>
                            <li className="genson-margin-top">使用手机号绑定微信号</li>
                            <li className="genson-margin-top">
                                <Button onClick={this.nextGo.bind(this)}>继续</Button>
                            </li>
                        </ul>
                        <div style={{display:this.state.step==1?'block':'none'}}>
                            <div className="block-center" id="qrcode" style={{width:'256px'}}>
                            </div>
                            <Row type="flex" justify="center">
                                <Button className="am-padding genson-margin-top"
                                        type="primary" loading={this.state.loading}
                                        onClick={this.getQRcode.bind(this)}>刷新</Button>
                            </Row>
                        </div>
                        <div style={{display:this.state.step==2?'block':'none'}}>
                            <Alert
                                message="手机端已登录"
                                description="请在手机端录入凭证"
                                type="success"
                                showIcon
                            />
                        </div>
                    </Card>
                </div>
            );
        }

    }
    module.exports = QRcode;
})();