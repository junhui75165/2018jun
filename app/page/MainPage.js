/**
 * Created by junhui on 2017/3/9.
 */
(function () {
    'use strict';
    let React = require('react');
    let SiteFooter = require('../components/Footer');
    let TopBar = require('../components/TopBar');
    let SliderBar = require('../components/SliderBar');
    let {hashHistory} = require('react-router');
    let {GetCurrency,GetLocalStorage,SetLocalStorage,urlParam,getConst} = require('../tool');
    const Global = require('../Global');
    class MainPage extends React.Component{
        constructor(props, context) {
            super(props, context);
            this.state = {
                url : this.props.params.type,
                topIndex:GetLocalStorage('topIndex')||0,
            };
        }

        componentWillMount() {
            let param = urlParam();
            if(param.token){
                console.log(param);
                SetLocalStorage('token',param.token);
                GetCurrency();
                let promise = new Promise((resolve)=>{
                    getConst(resolve);
                });
                promise.then(()=>{
                    this.goPage.bind(this)();
                },()=>{
                    //出错
                });
                // setTimeout(,1000)
            }else {
                this.goPage.bind(this)();
            }
        }

        goPage(){
            const type = GetLocalStorage('urlType');
            if(this.props.params&&!this.props.params.type && GetLocalStorage('urlType')){
                hashHistory.push('/mainPage/'+type);
            }
        }

        componentWillReceiveProps(nextProps, nextContext) {
            // console.log(nextProps);
            const type = nextProps.params.type;
            if(type!=GetLocalStorage('urlType')){
                this.setState({
                    url:type,
                    topIndex:this.getTopIndex(type),
                })
            }
        }
        getTopIndex(type){
            const list = [
                Global.contentList,
                Global.keepAccount,
                // Global.checkAccount,
                // Global.reimbursed,
                // Global.setting,
                Global.help
            ];
            let topIndex;
            for(let i in list){
                list[i].map((item)=>{
                    if(item.list){
                        item.list.map((con)=>{
                            if(con.type == type){
                                topIndex = i ;
                            }
                        })
                    }else {
                        if(item.type == type){
                            topIndex = i;
                        }
                    }
                })
            }
            // console.log(topIndex);
            return topIndex||0;
        }

        seturl(content){
            this.setState({
                url:content
            })
        }
        setTop(topIndex,type){
            // this.setState({topIndex,url:type},()=>{
            //
            // })
            hashHistory.push('/mainPage/'+type);
        }
        setIndex(){

        }
        render() {
            return (
                <div>
                    {/*<TopBar topIndex={this.state.topIndex} setTop={this.setTop.bind(this)} setUrl={this.seturl.bind(this)}/>*/}
                    <SliderBar topIndex={this.state.topIndex} list="" type={this.state.url}/>
                    {/*<SiteFooter/>*/}
                </div>
            );
        }
    }
    module.exports = MainPage;
})();

