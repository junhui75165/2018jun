/**
 * Created by junhui on 2017/3/20.
 */
(function () {
    'use strict';
    let React = require('react');
    let { Link ,hashHistory} = require('react-router');
    let Global = require('../Global');
    let Content = require('./Content');
    let {SetLocalStorage,GetLocalStorage} = require('../tool');
    let { Menu, Switch,Tooltip,Button,Row,Col,Icon } =  require('antd');
    const SubMenu = Menu.SubMenu;
    const language = require('../Language');
    const logo = require('../img/slider-logo.png');
    const fold = require('../img/menu-fold.png');
    const unfold = require('../img/menu-unfold.png');
    class Siderbar extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                nav: [],
                item:{},
                title:'',
                url:'',
                type:this.props.type||'',
                openKeys:[],
                selectedKeys:[],
                theme:false,//false:dark,true:light
                hide:false,//隐藏导航栏
                cmpName:'',
                fid:'',
            };
        }

        componentWillMount() {
            if(GetLocalStorage('Const')){
                this.setState({
                    cmpName:GetLocalStorage('Const').coy_name,
                    fid:GetLocalStorage('Const').fid,
                })
            }
            let topIndex = this.props.topIndex;
            // let topIndex = GetLocalStorage('topIndex')||0;
            let type = this.props.type;
            // this.initSlider(topIndex);
            this.initSlider(topIndex,true,this.props.type);
        }

        componentWillReceiveProps(nextProps, nextContext) {
            let topIndex = nextProps.topIndex;
            let type = nextProps.type;
            if(topIndex>-1){
                this.setState({
                    type,
                    cmpName:GetLocalStorage('Const').coy_name,
                    fid:GetLocalStorage('Const').fid,
                });
                if(type!=GetLocalStorage('urlType')){
                    this.initSlider(topIndex,true,type);
                    SetLocalStorage('topIndex',topIndex);
                }
                // if(topIndex == GetLocalStorage('topIndex')){
                //     this.initSlider(topIndex,true,type);
                // }else {
                //     SetLocalStorage('topIndex',topIndex);
                //     this.initSlider(topIndex,true);
                // }
            }
        }

        initSlider(topIndex,reset,urlType){
            const topList = Global.topList;
            let nav = Global[topList[topIndex].type];
            let {title,url,type,openKeys,selectedKeys} = this.state;
            let content = {};
            // let key = reset?'':GetLocalStorage('urlType');
            let key = urlType||'';
            // let key = reset?'':urlType;
            if(key){
                let index = 0;
                nav.map((item,dex)=>{
                    if(item.type&&key==item.type){
                        content = item;
                        index = dex;
                        openKeys = [String(dex)];
                    }else if(item.list){
                        item.list.map((con,i)=>{
                            if(con.type&&key==con.type){
                                content = con;
                                index = i;
                                openKeys = [String(dex)];
                            }
                        })
                    }else if(item.content){
                        if(key == item.content.type){
                            content = {
                                title:item.title,
                                url:item.url,
                                type:item.content.type,
                            };
                            index = dex;
                            openKeys = [String(dex)];
                        }else {
                            item.content.list.map((con,i)=>{
                                if(con.type&&key==con.type){
                                    content = con;
                                    index = i;
                                    openKeys = [String(dex)];
                                }
                            })
                        }
                    }
                });
                title = content.title;
                url = content.url;
                type = content.type;
            }else {
                content = nav[0];
                if(content.list){
                    if(content.list[0].list){
                        title = content.list[0].title;
                        url = content.list[0].url;
                        type = content.list[0].type;
                        openKeys = ['0'];
                    }else {
                        title = content.list[0].title;
                        url = content.list[0].url;
                        type = content.list[0].type;
                        openKeys = ['0'];
                    }
                }else {
                    title = content.title;
                    url = content.url;
                    type = content.type;
                }
            }
            selectedKeys = [String(type)];
            if(type>=200&&type<=224){
                selectedKeys = '200';
            }
            this.setState({nav,title,url,type,openKeys,selectedKeys},()=>{
            })
        }
        handleClick(e){
            let {key,title,url,type} = {};
            key = e.key;
            this.state.nav.map((item)=>{
                if(item.type&&key==item.type){
                    title = item.title;
                    url = item.url;
                    type = item.type;
                }else if(item.list){
                    item.list.map((con)=>{
                        if(con.type&&key==con.type){
                            title = con.title;
                            url = con.url;
                            type = con.type;
                        }
                    })
                }else if(item.content&&key==item.content.type){
                    title = item.title;
                    url = item.url;
                    type = item.content.type;
                }
            });
            if(type){
                hashHistory.push('/mainPage/'+type);
            }
            // this.setState({title,url,type,selectedKeys:[String(type)]},()=>{
            //     console.log(title,url,type);
            //     hashHistory.push('/mainPage/'+type);
            // })
        }
        initList(list){
            let thisList = list||this.state.nav;
            let content = thisList.map((data,index)=>{
                if(data.list&&data.list.length>0){
                    return <SubMenu key={index}
                                    title={
                                        <span>
                                            {data.icon?<i style={{marginRight:'10px'}} className={"iconfont icon-"+data.icon}/>:''}
                                            {data.Icon?<Icon style={{marginRight:'10px',fontSize:'16px'}} type={data.Icon}/>:''}
                                            <span>
                                                {this.state.hide?'':data.title}
                                            </span>
                                        </span>} >
                        {data.list.map((con)=>{
                            if(con.list){
                                this.initList(con.list);
                            }else {
                                return <Menu.Item disabled={!!con.disabled} key={con.type}>
                                    <div className="genson-text-overflow">{con.title}</div>
                                </Menu.Item>
                            }
                        })}
                    </SubMenu>
                }else {
                    return <Menu.Item disabled={!!data.disabled} key={data.type||data.content.type}>
                        {data.icon?<i style={{marginRight:'10px'}} className={"iconfont icon-"+data.icon}/>:''}
                        {data.Icon?<Icon style={{marginRight:'10px',fontSize:'16px'}} type={data.Icon}/>:''}
                        {<span className="hide-title" >{data.title}</span>}
                        </Menu.Item>
                }
            });
            return content;
        }
        onOpenChange(openKeys){
            let key = openKeys[openKeys.length-1];
            this.setState({openKeys:[key]})
        }
        changeTheme(value){
            this.setState({theme:value})
        }
        changeHide(){
            this.setState({
                hide:!this.state.hide
            },()=>{
                let dom = this.refs.hideBt;
                // if(this.state.hide){
                //     dom.className = 'animated bounceInRight hide-button-hide';
                //     // setTimeout(()=>{
                //     //     dom.className = 'hide-button-hide';
                //     // },500)
                // }else {
                //     dom.className = ' animated bounceOutRight hide-button-show';
                //     // setTimeout(()=>{
                //     //     dom.className = 'hide-button-show';
                //     // },500)
                // }
            })
        }
        logout(){
            localStorage.clear();
            hashHistory.push('/login');
        }
        goHome(){
            hashHistory.push('/mainPage/100');
        }
        render() {
            return (
                <div>
                    <div className="genson-left" style={{width:this.state.hide?'66px':'200px'}}>
                        <Row className="gen-slider-top">
                            <Col xs={16} style={{display:this.state.hide?'none':''}}>
                                <a>
                                    <img width="100%" src={logo} alt="谨信云会计" onClick={this.goHome.bind(this)}/>
                                </a>
                            </Col>
                            <Col xs={this.state.hide?24:8} className="center">
                                <a onClick={this.changeHide.bind(this)}>
                                    <img width="25px" src={this.state.hide?unfold:fold} alt=""/>
                                </a>
                            </Col>
                        </Row>
                        <div className={this.state.hide?"gen-slider-hide":'gen-slider-left'}>
                            <Menu
                                mode="inline" theme={this.state.theme?'light':'dark'}
                                inlineCollapsed={this.state.hide}
                                openKeys={this.state.openKeys}
                                selectedKeys={this.state.selectedKeys}
                                onOpenChange={this.onOpenChange.bind(this)}
                                onClick={this.handleClick.bind(this)} >
                                {
                                    this.initList()
                                }
                            </Menu>
                        </div>
                        <div className="gen-slider-bottom">
                            <Row className="gen-avatar">
                                {
                                    this.state.hide?<Tooltip placement="right" title={this.state.fid+' '+this.state.cmpName}>
                                            <Col xs={24} className="bottom-avatar">
                                                <img className="avatar"
                                                     src="http://acc-new.oss-cn-shenzhen.aliyuncs.com/company-info/ico/favicon.ico"
                                                     width='35px' alt="公司logo"/>
                                            </Col>
                                        </Tooltip>:
                                        <Col xs={6} className="bottom-avatar">
                                            <img className="avatar"
                                                 src="http://acc-new.oss-cn-shenzhen.aliyuncs.com/company-info/ico/favicon.ico"
                                                 width="100%" alt="公司logo"/>
                                        </Col>
                                }
                                <Col xs={18} style={{display:this.state.hide?'none':''}} className="cmp">
                                    <Row >{this.state.fid}</Row>
                                    <Row >{this.state.cmpName}</Row>
                                </Col>
                            </Row>
                            <Row className="logout">
                                <Tooltip placement="right" title={this.state.hide?language.SignOut:""}>
                                    <Col xs={24} style={{height:'100%'}}>
                                        <Button size="large" className="logout-button"
                                                type="primary" icon="logout"
                                                onClick={this.logout.bind(this)}>
                                            {this.state.hide?'':language.Quit}
                                        </Button>
                                    </Col>
                                </Tooltip>
                            </Row>
                        </div>
                    </div>
                    <Content item={this.state.item} title={this.state.title} hide={this.state.hide}
                             url={this.state.url} type={this.state.type}/>
                </div>
            );
        }

    }
    module.exports = Siderbar;
})();