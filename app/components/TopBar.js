/**
 * Created by junhui on 2017/3/9.
 */
(function () {
    'use strict';
    let React = require('react');
    let {Topbar,Nav,CollapsibleNav,NavItem,} = require('amazeui-react');
    let {hashHistory} = require('react-router');
    let Global = require('../Global');
    let { Menu, Icon ,Dropdown} = require('antd') ;
    let {SetLocalStorage,GetLocalStorage} = require('../tool');
    const SubMenu = Menu.SubMenu;
    const logo = require('../img/title-logo.png');
    class TopBar extends React.Component{
        constructor(props) {
            super(props);
            this.state = {
                active: GetLocalStorage('topIndex')||0,
            };
        }

        componentWillReceiveProps(nextProps, nextContext) {
            // console.log(nextProps);
            this.setState({active:nextProps.topIndex})
        }


        handleClick(list,e) {
            let nav = list;
            let head,item;
            if(e.key.indexOf('-')>-1){
                head = e.key.split('-')[0];
                item = e.key.split('-')[1];
                SetLocalStorage('urlType',nav[head].list[item].type);
                this.props.setUrl(nav[head].list[item]);
            }else {
                head = e.key;
                item = list[head];
                window.open(item.url);
            }
        }
        setNav(index,event){
            this.setState({
                active:index
            },()=>{
                let name = Global.topList[index].type;
                if(name!='login_out'){
                    SetLocalStorage('topIndex',index);
                    this.props.setTop(index,Global[name][0].type||Global[name][0].list[0].type);
                }else {
                    localStorage.clear();
                }
            });
        }
        getNavList(type){
            let list;
            switch (type){
                case 'contentList':
                    list = Global.contentList;
                    break;
                case 'keepAccount':
                    list = Global.keepAccount;
                    break;
                case 'checkAccount':
                    list = Global.checkAccount;
                    break;
                case 'reimbursed':
                    list = Global.reimbursed;
                    break;
                case 'setting':
                    list = Global.setting;
                    break;
                case 'help':
                    list = Global.help;
                    break;
                default:
                    list = [];
            }
            const menu = (
                <Menu className="menuItem" onClick={this.handleClick.bind(this,list)}>
                    {list.map((data,index)=>{
                        if(data.list&&data.list.length>0){
                            return <SubMenu key={index} title={data.title} >
                                {data.list.map((con,i)=>{
                                    return <Menu.Item disabled={!!con.disabled} key={`${index}-${i}`}>{con.title}</Menu.Item>
                                })}
                            </SubMenu>
                        }else {
                            return <Menu.Item disabled={!!data.disabled} key={index}>{data.title}</Menu.Item>
                        }
                    })}
                </Menu>
            );
            // return menu;
            return '';
        }
        setUrl(url){
            if(url){
                if(url == '/login'){
                    // SetLocalStorage('token','');
                    localStorage.clear();
                    hashHistory.push(url);
                }else {
                    hashHistory.push('/mainPage/'+type);
                }
            }
        }
        render() {
            return (
                <Topbar
                    className="ask-header topTitle"
                    brand={
                        <div>
                            <img src={logo} alt="谨信云会计"/>
                            <a href="/">
                                <h3>谨信云会计</h3>
                            </a>
                        </div>
                    }
                    brandLink="/"
                    inverse
                    toggleNavKey="nav"
                    collapsible={true}
                >
                    <CollapsibleNav >
                        <Nav topbar className="topList">
                            {
                                Global.topList.map((data,index)=>
                                <NavItem key={index} active={index == this.state.active}
                                         disabled={data.disabled}
                                         onClick={this.setNav.bind(this,index)}>
                                    {/*<Dropdown overlay={this.getNavList(data.type)} placement="bottomLeft">*/}
                                        <a className="ant-dropdown-link"
                                           onClick={this.setUrl.bind(this,data.url)}>
                                            {data.title}
                                            {/*{data.type?<Icon type="down" />:''}*/}
                                        </a>
                                    {/*</Dropdown>*/}
                                </NavItem>)
                            }
                        </Nav>
                    </CollapsibleNav>
                </Topbar>
            );
        }
    }

    module.exports = TopBar;

})();