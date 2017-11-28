/**
 * Created by junhui on 2017/3/8.
 */
let React = require('react');
let SiteFooter = require('../components/Footer');
let Login = require('../components/Login');
let {SetLocalStorage,GetLocalStorage} = require('../tool');
let {
    Topbar,
    Nav,
    CollapsibleNav,
} = require('amazeui-react');
class LoginPage extends React.Component{
    constructor(props) {
        super(props);
        this.state = {example: 'example'}
    }

    componentDidMount() {
        //初始化localstorage值
        if(!GetLocalStorage('Const')){
            SetLocalStorage('Const',{});
        }
        if(!GetLocalStorage('currency')){
            SetLocalStorage('currency',[{}]);
        }
        if(!GetLocalStorage('fidList')){
            SetLocalStorage('fidList',[]);
        }
        if(!GetLocalStorage('dateVnum')){
            SetLocalStorage('dateVnum',{});
        }
        if(!GetLocalStorage('token')){
            SetLocalStorage('token','');
        }
        if(!GetLocalStorage('urlType')){
            SetLocalStorage('urlType','');
        }
    }







    render() {
        return (
            <div className="ask-page login-color">
                {/*<Topbar*/}
                    {/*className="ask-header"*/}
                    {/*brand="谨信云会计"*/}
                    {/*brandLink="/"*/}
                    {/*inverse*/}
                {/*>*/}
                {/*</Topbar>*/}
                <Login/>
                <SiteFooter/>
            </div>
        );
    }
}
module.exports = LoginPage;