/**
 * Created by junhui on 2017/3/7.
 */

(function () {
    'use strict';
    let React = require('react');
    let Amazeui = require('amazeui-react');
    let { browserHistory ,hashHistory} =require('react-router');
    let {GetLocalStorage,SetLocalStorage,GetCurrency,urlParam} = require('../tool');
    let {Request} = require('../request');
    let Form = Amazeui.Form;
    let {Button,Icon} = require('amazeui-react');
    let {message,Row,Col,Input} = require('antd');
    const cmpPNG = require('../img/cmp.png');
    const humanPNG = require('../img/human.png');
    const pswPNG = require('../img/password.png');
    let $this;
    class Login extends React.Component{
        constructor(props){
            super(props);
            $this = this;
            this.state = {
                loading:false,
                user_id:'',
                fid:'',
                password:'',
            }
        }

        componentDidMount() {
            document.title = '谨信云会计';
            let param = urlParam();
            if(param.token){
                console.log(param);
                SetLocalStorage('token',param.token);
                this.getConst();
            }else if(GetLocalStorage('token')){
                this.getConst();
            }
            let e = document.getElementById('loginForm');
            e.addEventListener('keydown',(e)=>{
                if(e.keyCode === 13){
                    this.getToken();
                }
            });
            this.onReset();
            window.onresize = ()=>{
                this.onReset();
            }
        }
        onReset(){
            let loginForm = this.refs.loginForm;
            if(!loginForm){
                return '';
            }
            let other = 60+150;
            let top = document.body.clientHeight-other-150;
            loginForm.style.marginTop = (top/2-147)<-150?-150+'px':(top/2-147)+'px';
        }
        getToken() {
            const _this = this;
            let error = false;
            this.setState({
                loading:true
            });
            let timeout = setTimeout(()=>{
                message.error('连接超时,请重试');
                this.setState({
                    loading:false
                });
            },5000);
            let param = {
                user_id:this.state.user_id,
                fid:this.state.fid,
                password:this.state.password,
            };
            if(!param.user_id){
                message.error('请输入用户名');
                error = true;
            }else if(!param.fid){
                message.error('请输入公司id');
                error = true;
            }else if(!param.password){
                message.error('请输入密码');
                error = true;
            }
            let type = {
                type:'sign-in/get-token',
                method:'FormData',
                Method:'POST'
            };
            let cb = function (data) {
                clearTimeout(timeout);
                if(data.code == 0){
                    _this.setState({
                        loading:false
                    });
                    if(data.info){
                        SetLocalStorage('token',data.info);
                        setTimeout(()=>{
                            $this.getConst();
                        })
                    }else {
                        /****密码或账号有误,闪烁提示*****/
                        message.error(data.message);
                        const dom = _this.refs.loginForm;
                        dom.className = 'login-form animated shake';
                        setTimeout(()=>{
                            dom.className = 'login-form';
                        },1000)
                    }
                }else {
                    message.error(data.message);
                }
            };
            if(!error){
                Request(param,cb,type);
            }else {
                this.setState({
                    loading:false
                },()=>{
                    clearTimeout(timeout);
                });
                const dom = _this.refs.loginForm;
                dom.className = 'login-form animated shake';
                setTimeout(()=>{
                    dom.className = 'login-form';
                },1000)
            }
        }
        getConst() {
            const _this = this;
            let type = {
                type:'default/default-data',
                method:'POST',
            };
            let cb = function (data) {
                const dom = _this.refs.loginForm;
                dom.className = 'login-form animated bounceOutRight';
                SetLocalStorage('Const',data.info);
                GetCurrency();
                setTimeout(()=>{
                    hashHistory.push('/mainPage');
                },1000)
            };
            if(GetLocalStorage('token')){
                Request({},cb,type);
            }else {
                setTimeout(this.getConst.bind(this),100)
            }
        }
        changeValue(type,e){
            let value = e.target.value;
            let content = {};
            content[type] = value;
            this.setState(content)
        }

        createFid(){
            const dom = this.refs.loginForm;
            dom.className = 'login-form animated bounceOutRight';
            setTimeout(()=>{
                // hashHistory.push('/create');
            },1000);
        }
        render(){
            return(
                <div>
                    <div className="logo">
                    </div>
                    <form className="login-form animated bounceInRight" id="loginForm" ref="loginForm">
                        <div className="login-input">
                            <img src={cmpPNG}/>
                            <Input type="text" placeholder="公司" value={this.state.fid}
                                   onChange={this.changeValue.bind(this,'fid')}/>
                        </div>
                        <div className="login-input">
                            <img src={humanPNG}/>
                            <Input type="text" placeholder="用户名" value={this.state.user_id}
                                   onChange={this.changeValue.bind(this,'user_id')}/>
                        </div>
                        <div className="login-input">
                            <img src={pswPNG}/>
                            <Input type="password" placeholder="登录密码" value={this.state.password}
                                   onChange={this.changeValue.bind(this,'password')}/>
                        </div>
                        <div className="login-bt">
                            <Button radius
                                    amStyle="success"
                                    className="login"
                                    onClick={this.getToken.bind(this)} >
                                {this.state.loading?<Icon icon="spinner" spin />:''}
                                登陆
                            </Button>
                            <Button className="forgot" amStyle="link">忘记密码?</Button>
                        </div>
                    </form>
                </div>
            )
        }
    }
    module.exports = Login;
})();