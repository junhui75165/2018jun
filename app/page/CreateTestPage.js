/**
 * Created by junhui on 2017/7/7.
 */
(function () {
    'use strict';
    let React = require('react');
    let {Input,Steps,Button,Row,Col,message,Card,Form } = require('antd');
    let {Request} = require('../request');
    let {hashHistory} =require('react-router');
    let {urlParam,SetLocalStorage,getConst} = require('../tool');
    const fidPNG = require('../img/fid.png');
    const client_namePNG = require('../img/client_name.png');
    const aliasPNG = require('../img/alias.png');
    const account_typePNG = require('../img/account_type.png');
    const passwordPNG = require('../img/password2.png');
    class CreateTestPage extends React.Component{
        constructor(props){
            super(props);
            const language = require('../Language');
            this.state = {
                fid:'',
                client_name:'',
                alias:'',
                account_type:'',
                password:'',
                step:0,
                icon:'loading',
                info:[
                    [{key:'fid',placeholder:language.AccountSupport,warning:language.MissingAccountNumber}],
                    [
                        {key:'client_name',placeholder:language.EnterAccountName,warning:language.MissingAccountName},
                        {key:'alias',placeholder:language.EnterAbbreviation,warning:language.MissingAbbreviation},
                        {key:'account_type',placeholder:language.EnterAccountType,warning:language.MissingAccountType},
                    ],
                    [{key:'password',placeholder:language.AccountPassword,warning:language.MissingAccountPassword}],
                ],
                language:language
            }
        }

        componentWillMount() {
            document.title = this.state.language.RegisteredAccount;
        }

        componentDidMount() {
            let param = urlParam();
            this.setState({
                fid:param.fid,
                client_name:decodeURIComponent(param.client_name),
                account_type:decodeURIComponent(param.account_type),
                token:param.token
            },()=>{
                console.log(this.state)
            });
            this.onReset();
            window.onresize = ()=>{
                this.onReset();
            }
        }
        onReset(){
            let loginForm = this.refs.create;
            if(!loginForm){
                return '';
            }
            let other = 150;
            let top = document.body.clientHeight-other-150;
            loginForm.style.marginTop = (top/2-229)<-150?-150+'px':(top/2-229)+'px';
        }
        changeValue(type,e){
            let value = e.target.value;
            let state = this.state;
            if(isNaN(value)&&type=='fid'){
                value = '';
            }
            state[type] = value;
            this.setState(state)
        }
        setStep(type){
            let step = this.state.step;
            let info = this.state.info;
            let state = this.state;
            switch (type){
                case 'add':
                    if(step<2){
                        let error = [];
                        info[step].map((item)=>{
                            if(!state[item.key]){
                                error.push(item.warning)
                            }
                        });
                        if(error.length==0){
                            step++;
                        }else {
                            message.warning(error.toString());
                        }
                    }else {
                        par.fid = this.state.fid;
                        par.client_name = this.state.client_name;
                        par.alias = this.state.alias;
                        par.account_type = this.state.account_type;
                        par.password = this.state.password;
                        console.log('submit is',par);
                        Request(par,cb,url);
                    }
                    break;
                case 'reduce':
                    step--;
                    break;
            }
            this.setState({step})
        }
        submit(){
            let par = {};
            let error = [];
            const url = {
                type:'client/create-client',
                method:'FormData',
                Method:'POST'
            };
            par.fid = this.state.fid;
            par.client_name = this.state.client_name;
            par.alias = this.state.alias;
            par.account_type = this.state.account_type;
            par.password = this.state.password;
            par.token = this.state.token;
            console.log('submit is',par);
            let cb = (data)=>{
                message.success(this.state.language.CreateSuccess+'...');
                SetLocalStorage('token',data.info);
                getConst();
                setTimeout(()=>{
                    hashHistory.push('/mainPage');
                },2000)
            };
            if(!par.fid){
                message.warning(this.state.language.MissingAccountNumber)
            }else if(!par.client_name){
                message.warning(this.state.language.MissingAccountName)
            }else if(!par.alias){
                message.warning(this.state.language.MissingAbbreviation)
            }else if(!par.account_type){
                message.warning(this.state.language.MissingAccountSystem)
            }else if(!par.password){
                message.warning(this.state.language.MissingAccountPassword)
            }else {
                Request(par,cb,url);
            }
        }
        backLogin(){
            const dom = this.refs.create;
            dom.className = 'genson-register animated bounceOutRight';
            setTimeout(()=>{
                hashHistory.push('/login');
            },1000);
        }
        render() {
            return (
                <div className="ask-page login-color">
                    <div className="logo">
                    </div>
                    <form className="genson-register animated bounceInRight" ref="create">
                        <Button className="register-bt" size="large" type="primary">{this.state.language.RegisteredAccount}</Button>
                        <div className="register-input">
                            <img src={fidPNG} />
                            <Input type="text" placeholder={this.state.language.AccountCode}
                                   value={this.state.fid}
                                  onChange={this.changeValue.bind(this,'fid')}/>
                        </div>
                        <div className="register-input">
                            <img src={aliasPNG}/>
                            <Input type="text" placeholder={this.state.language.AccountName} value={this.state.client_name}
                                   onChange={this.changeValue.bind(this,'client_name')}/>
                        </div>
                        <div className="register-input">
                            <img src={client_namePNG}/>
                            <Input type="text" placeholder={this.state.language.AccountAlias} value={this.state.alias}
                                   onChange={this.changeValue.bind(this,'alias')}/>
                        </div>
                        <div className="register-input">
                            <img src={account_typePNG}/>
                            <Input type="text" placeholder={this.state.language.AccountSystem}
                                   value={this.state.account_type}
                                   onChange={this.changeValue.bind(this,'account_type')}/>
                        </div>
                        <div className="register-input">
                            <img src={passwordPNG}/>
                            <Input type="password" placeholder={this.state.language.AdministratorPassword} value={this.state.password}
                                   onChange={this.changeValue.bind(this,'password')}/>
                        </div>
                        <div className="bottom-content" style={{marginTop:'1rem'}}>
                            <Button className="register-submit" size="large"
                                    type="primary" onClick={this.submit.bind(this)}>
                                {this.state.language.Register}
                            </Button>
                            <a className="register-back" onClick={this.backLogin.bind(this)}>{this.state.language.ReturnLogin}</a>
                        </div>
                    </form>
                </div>
            );
        }

    }
    CreateTestPage = Form.create({})(CreateTestPage);
    module.exports = CreateTestPage;
})();