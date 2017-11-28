/**
 * Created by junhui on 2017/5/18.
 */
(function () {
    'use strict';
    let React = require('react');
    let moment = require('moment');
    let {Request, } = require('../request');
    let Global = require('../Global');
    let {  Col, Row ,Button,Tabs,Input,Form ,Popconfirm,message,Switch} = require('antd');
    const TabPane = Tabs.TabPane;
    class FinancialNotes extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                content:[{title:'创建备忘',key:'-1',top:0,id:'-1'}],
                tabKey:"",
                display:{title:'',id:'',value:'',top:0},
            }
        }

        componentDidMount() {
            this.initContent();
        }

        initContent(){
            const type = {
                type:'sys-tips/get-tips',
                method:'GET'
            };
            let cb = (data)=>{
                let {content,tabKey,display} = this.state;
                let index = 0;
                content = [{title:'创建备忘',key:'-1',top:0,id:'-1'}];
                content = content.concat(data.info);
                content.map((item)=>{
                    item.key = item.id;
                    item.title = item.title||'财务备忘'+item.id;
                    if(index==0){
                        if(item.id == -1){
                            index = 0;
                        }else {
                            index = item.id;
                        }
                        tabKey = item.id;
                        display = new Object();
                        for (let key in item) {
                            display[key] = item[key];
                        }
                    }
                });

                this.setState({content,tabKey,display})
            };
            Request({},cb,type);
        }
        update(){
            const type = {
                type:'sys-tips/save-tips',
                method:'FormData',
                Method:'POST',
            };
            let display = this.state.display;
            let par = {
                note:display.value,
                title:display.title,
            };
            if(display.key != -1){
                //财务备忘创建
                par.tips_id = display.key;
            }else {
                par.top = display.top;
            }
            let cb = (data)=>{
                if(display.key==-1){
                    message.success('财务备忘已创建');
                }else {
                    message.success('财务备忘已更新');
                }
                this.setState({
                    content:[{title:'创建备忘',key:'-1',top:0,id:'-1'}],
                },()=>{
                    this.initContent();
                });
            };
            Request(par,cb,type);
        }
        delete(){
            const url = {
                type:'sys-tips/del-tips',
                method:'FormData',
                Method:'POST'
            };
            let cb = (data)=>{
                this.setState({
                    content:[{title:'创建备忘',key:'-1'}],
                },()=>{
                    message.success('删除成功！');
                    this.initContent();
                });
            };
            let par = {tips_id:this.state.display.id};
            Request(par,cb,url);
        }
        changeContent(e){
            let value = e.target.value;
            let display = this.state.display;
            display.value = value;
            this.setState({display})
        }
        changeKey(tabKey){
            let {display,content} = this.state;
            content.map((item)=>{
                if(item.id == tabKey){
                    display = new Object();
                    for (let key in item) {
                        display[key] = item[key];
                    }
                }
            });
            this.setState({ tabKey ,display});
        }
        setTop(value){
            let display = this.state.display;
            const url = {
                type:'sys-tips/tips-top',
                method:'FormData',
                Method:'POST'
            };
            let par = {
                tips_id:display.id,
                top:value?1:0
            };
            display.top = value?1:0;
            let cb = (data)=>{
                if(value){
                    message.success('备忘已置顶！');
                }else {
                    message.success('备忘已取消置顶！');
                }
                this.initContent();
            };
            if(display.id == -1){
                this.setState({display});
            }else {
                Request(par,cb,url)
            }
        }
        setTitle(e){
            let value = e.target.value;
            let display = this.state.display;
            display.title = value;
            this.setState({display});
        }
        render() {
            return (
                <div>
                    <Tabs tabPosition="left" activeKey={this.state.tabKey} style={{ height: '500px' }}
                          onChange={this.changeKey.bind(this)}>
                        {
                            this.state.content.map((item,index)=>{
                                return<TabPane tab={<div className="genson-note-overflow"
                                                         style={{backgroundColor:item.top!=0?'#eee':''}}>
                                    {item.title}
                                    </div>}  key={item.key}>
                                    <Row style={{display:item.key!=-1?'none':'block'}}>
                                        <Col xs={7} md={5} lg={3}>
                                             <Button icon="plus-circle" type="primary" onClick={this.update.bind(this,item,index)}>创建备忘</Button>
                                        </Col>
                                        <Col xs={8} md={8} lg={8}  offset={1}>
                                            置顶备忘：<Switch defaultChecked={this.state.display.top!=0}
                                                         onChange={this.setTop.bind(this)} />
                                        </Col>
                                    </Row>
                                    <Row style={{display:item.key==-1?'none':'block'}}>
                                        <Col xs={7} md={5} lg={4}>
                                            <Button icon="sync" type="primary" onClick={this.update.bind(this,item,index)}>更新备忘</Button>
                                        </Col>
                                        <Col xs={7} md={5} lg={4} offset={1}>
                                            <Popconfirm title="你确认要删除该账务备忘内容吗？"
                                                        okText="确认" cancelText="取消"
                                                        placement="bottomRight"
                                                        onConfirm={this.delete.bind(this,item)}>
                                                <Button icon="delete">删除备忘</Button>
                                            </Popconfirm>
                                        </Col>
                                        <Col xs={8} md={8} lg={8}  offset={1}>
                                            置顶备忘：<Switch defaultChecked={this.state.display.top!=0}
                                                         onChange={this.setTop.bind(this)} />
                                        </Col>
                                    </Row>
                                    <Row className="genson-margin-top">
                                        <Input defaultValue={this.state.display.title}
                                               placeholder="备忘标题"
                                               onChange={this.setTitle.bind(this)}/>
                                    </Row>
                                    <Row className="genson-margin-top">
                                        <Input type="textarea" value={this.state.display.value}
                                               placeholder="备忘内容"
                                               onChange={this.changeContent.bind(this)} autosize={{ minRows: 10 }}/>
                                    </Row>
                                </TabPane>
                            })
                        }
                    </Tabs>
                </div>
            );
        }

    }
    module.exports = FinancialNotes;
})();