/**
 * Created by junhui on 2017/9/18.
 */
(()=>{
    'use strict';
    let React = require('react');
    let {Card,Col, Row ,Button,DatePicker,Input,
        InputNumber,message,Modal ,Select} = require('antd');
    const GroupList = require('../../Global').contentList[3].content.list;
    let {hashHistory} = require('react-router');
    class RouterPage extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                title:this.props.title,
                type:this.props.type,
                active:'',
                list:[],
                top:['轻松记账','查询和报表','维护'],
            };
        }

        componentWillMount() {
            let list = [];
            let groupList = [];
            let index = 0;
            GroupList.map((item)=>{
                if(item.group == index){
                    groupList.push(item);
                }else {
                    list.push(groupList);
                    groupList = [];
                    index = item.group;
                    groupList.push(item);
                }
            });
            list.push(groupList);
            this.setState({list})
        }

        componentWillReceiveProps(nextProps, nextContext) {
            this.setState({
                title:nextProps.title,
                type:nextProps.type,
            });
        }
        setUrl(type){
            console.log(type);
            hashHistory.push('/mainPage/'+type)
        }
        onMouseOver(type,e){
            const old = this.refs['Ref'+type].className;
            const desc = this.refs['desc'+type].className;
            this.refs['Ref'+type].className = old+' pulse';
            this.refs['desc'+type].className = desc+' fadeInRight';
            this.setState({
                active:type
            })
        }
        onMouseOut(type,e){
            this.refs['Ref'+type].className = 'line animated';
            this.refs['desc'+type].className = 'desc animated';
            this.setState({
                active:''
            })
        }
        render() {
            return (
                <Card className="genson-easy-book" title={<h1>轻松记账</h1>}>
                    <div>
                        {
                            this.state.list.map((con,index)=>{
                                return <div>
                                    <h2 className="genson-margin-top">{this.state.top[index]}</h2>
                                    {
                                        con.map((item)=>{
                                            return <div className="line animated"
                                                        ref={'Ref'+item.type}>
                                                <Button type="primary" icon={item.Icon||'file-text'}
                                                        onMouseOut={this.onMouseOut.bind(this,item.type)}
                                                        onMouseOver={this.onMouseOver.bind(this,item.type)}
                                                        onClick={this.setUrl.bind(this,item.type)}>{item.title}</Button>
                                                <div className="desc animated" ref={'desc'+item.type}
                                                     style={{display:this.state.active==item.type?'block':'none'}}>
                                                    {item.desc}
                                                </div>
                                            </div>
                                        })
                                    }
                                </div>
                            })
                        }
                    </div>
                </Card>
            );
        }

    }
    module.exports = RouterPage;
})();