/**
 * Created by junhui on 2017/11/16.
 */
(()=>{
    "use strict";
    let React = require('react');
    let {Button,Modal,Alert,Input,message,Table,Select,Row,Col } = require('antd');
    const Option = Select.Option;
    let {Request} = require('../request');
    let {GetLocalStorage} = require('../tool');
    class ScanCode extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                step:1,//1.初始化  2.扫描发票  3.扫描暂停，点击继续  4.扫描成功 5.扫描失败 6.退出
                code:'',
                trans:[],
                selectId:'1243',
                accountType:'',//科目类型
                accountList:[],
                note:[
                    {
                        text:'正在初始化，请稍后...',
                        type:'info'
                    },
                    {
                        text:'请使用扫描枪扫码发票',
                        type:'info'
                    },
                    {
                        text:'扫描已暂停',
                        type:'warning',
                        next:this.goingStep.bind(this),
                        warningText:'点击继续'
                    },
                    {
                        text:'扫描成功，正在获取数据...',
                        type:'success',
                        next:this.goingStep.bind(this),
                        warningText:'点击继续',
                    },
                    {
                        text:'扫描有误，请验证发票真伪',
                        type:'error',
                        next:this.goingStep.bind(this),
                        warningText:'点击继续'
                    },
                    {
                        text:'扫码结束',
                        type:'info',
                    },
                ],
                time:3,
                invoiceList:[],
                dataSource:[]
            };
        }

        componentDidMount() {
            this.getTrans();
        }

        componentWillReceiveProps(nextProps, nextContext) {
            this.setState({
                step:nextProps.step,//
            },()=>{
                if(this.state.step == 2){
                    this.getFocus();
                }
                console.log(this.state.step)
            });
        }
        getTrans(){
            const type = {
                type:'chart-type/get-trans',
                method:'GET'
            };
            let cb = (data)=>{
                this.setLevel(data.info);
            };
            Request({},cb,type);
        }
        setLevel(list){
            list.map((item)=>{
                let parent = item.parent;
                if(!parent){
                    item.level = 0;
                }else {
                    list.map((con)=>{
                        if(parent == con.id){
                            item.level = con.level+1;
                        }
                    })
                }
            });
            this.setState({
                trans:list
            });
        }
        goingStep(){
            // setTimeout(()=>{
                this.getFocus();
            // },200)
        }
        closeModal(){
            if(this.state.step==2){
                this.setState({step:3})
            }
            // this.setState({step:3});
        }
        testCode(){
            let code = this.state.code;
            let list = code.split(',');
            return list.length == 9;
        }
        blueInput(e){
            // setTimeout(()=>{
            //     console.log('blur...',this.state.step);
                if(this.state.step==2){
                    this.setState({step:3})
                }
            // },200);
        }
        getFocus(){
            let e = this.refs.code;
            if(e){
                this.setState({step:2},()=>{
                    e.refs.input.focus();
                });
            }
        }
        doneScan(){
            this.setState({code:'',step:6,accountList:[],accountType:''},()=>{
                this.props.changeStep(6);
            });
        }
        getInfo(){
            let url = {
                type:'scan-code/save-invoice',
                method:'FormData',
                Method:'POST',
            };
            let par = {
                scanStr:this.state.code,
                accessfid:GetLocalStorage('Const').fid,
            };
            let note = this.state.note;
            note[3] = {
                text:'扫描成功，正在获取数据...',
                type:'success',
                // next:this.goingStep.bind(this),
                // warningText:'点击继续',
            };
            let cb = (data)=>{
                if(data.code == 0){
                    let list = data.info.gl_trans;
                    let not_find_account_name = data.info.not_find_account_name;
                    let buyer = data.info.buyer;
                    let seller = data.info.seller;
                    let st = {};
                    st.step = 4;
                    if(not_find_account_name&&not_find_account_name.account_name.length>0){
                        //存在需要新增的科目
                        st.accountList = not_find_account_name.account_name;
                        st.selectId = not_find_account_name.default_account_type;
                        st.accountType = 'not_find_account_name';
                    }else if (buyer){
                        st.accountType = 'buyer';
                        st.selectId = buyer.default_account_type;
                        st.accountList = [...(buyer.account_name)];
                    }else if (seller){
                        st.accountType = 'seller';
                        st.selectId = seller.default_account_type;
                        st.accountList = [...(seller.account_name)];
                    }else if(not_find_account_name&&not_find_account_name.length == 0){
                        //不存在需要新增科目
                        list.map((item)=>{
                            item.name = item.account+'--'+item.account_name;
                            if(item.identity == 1){
                                item.debit = item.amount;
                            }else if(item.identity == 2){
                                item.lender = item.amount;
                            }
                        });
                        st.data = list;
                    }
                    st.note = note;
                    this.setState(st,()=>{
                        if(not_find_account_name||seller||buyer){
                            note[3].text = '需要添加不存在的科目，请查看下列添加的科目';
                            note[3].type = 'warning';
                            this.setState({warningCode:par.scanStr,note})
                        }else {
                            this.timeReduce('数据获取成功',3)
                        }
                    });
                }else {
                    this.setState({
                        // note,
                        step:5
                    },()=>{
                        this.timeReduce(data.message,4);
                    });
                }
            };
            if(this.state.step == 2){
                this.setState({note},()=>{
                    Request(par,cb,url);
                });
            }
        }
        accountWaring(accountType,list){
            let url = {
                type:'scan-code/master-create',
                method:'FormData',
                Method:'POST',
            };
            let par = {
                type:accountType,
            };
            list.map((item,index)=>{
                par[`account_name[${index}]`] = item;
            });
            let cb = (data)=>{
                let code = this.state.warningCode;
                this.setState({accountList:[],accountType:"",code,step:2},()=>{
                    message.success('科目添加成功！');
                    setTimeout(this.getInfo.bind(this),1000);
                });
            };
            Request(par,cb,url);
        }
        timeReduce(text,index){
            let time = this.state.time;
            let note = this.state.note;
            note[index].text = text;
            note[index].warningText = time+'秒后继续';
            time = time-1;
            if(time > -1){
                this.setState({time,note},()=>{
                    setTimeout(()=>{
                        this.timeReduce(text,index);
                    },1000);
                });
            }else {
                this.setState({time:3},()=>{
                    if(this.state.step!=2){
                        this.getFocus();
                    }
                })
            }
        }
        setCode(e){
            let value = e.target.value;
            console.log(value);
            this.setState({
                code:value,
            },()=>{
                if(this.testCode()){
                    this.getInfo();
                }else {
                    setTimeout(()=>{
                        this.setState({code:''});
                    },1000)
                }
            })
        }
        enter(){
            console.log('enter cord',this.state.code)
        }
        changeSelect(selectId){
            // let selectId = this.state.selectId;
            // selectId[index] = value;
            this.setState({selectId});
        }
        render() {
            let content = {
                text:this.state.note[this.state.step-1].text,
                type:this.state.note[this.state.step-1].type,
                next:this.state.note[this.state.step-1].next,
                warningText:this.state.note[this.state.step-1].warningText
            };
            let column = [
                {
                    title:'会计科目',
                    key:'name',
                    dataIndex:'name',
                },
                {
                    title:'借方金额',
                    key:'debit',
                    dataIndex:'debit',
                },
                {
                    title:'贷方金额',
                    key:'lender',
                    dataIndex:'lender',
                },
                {
                    title:'摘要',
                    key:'memo_',
                    dataIndex:'memo_',
                },
            ];
            /***********
             * 设置input为隐藏，通过focus使得输入内容填充到input内，获取input的值来达到扫码取值
             * 扫码枪原理是利用键盘输入，扫码的结果会通过模拟键盘输入添加，所以进入后需要focus输入框
             * ************/
            return (
                <div>
                    <Modal title="扫描枪扫码发票"
                           style={{ top: 10 }} width={980}
                           visible={this.state.step<6&&this.state.step>1}
                           closable={false} footer={null}
                           onCancel={this.closeModal.bind(this)}>
                        <Input value={this.state.code} ref="code" onBlur={this.blueInput.bind(this)}
                               onChange={this.setCode.bind(this)} onPressEnter={this.enter.bind(this)}
                               style={{opacity:0,width:'1px',height:'1px',position:'absolute'}}
                               type="password" className="genson-margin-top"/>
                        <Alert message={content.text}
                               type={content.type}
                               description={
                                   <a onClick={content.next} className="genson-margin-top">
                                       {content.warningText}
                                   </a>
                               }>
                        </Alert>
                        <h2 style={{display:this.state.step==4?'block':'none'}}>{String(this.state.invoiceList)}</h2>
                        <div className="genson-margin-top">
                            <Button onClick={this.doneScan.bind(this)}
                                    className="genson-block-center"
                                    icon="done">
                                扫码完成
                            </Button>
                        </div>
                        <div className="genson-margin-top" style={{display:this.state.accountType?'block':'none'}}>
                            <Row type="flex" justify="space-between">
                                <Col className="center" xs={8}>
                                    <h3>会计科目组</h3>
                                </Col>
                                <Col className="center" xs={14}>
                                    <h3>科目名称</h3>
                                </Col>
                            </Row>
                            <Row type="flex" justify="space-between">
                                <Col className="center genson-margin-top" xs={8}>
                                    <Select onChange={this.changeSelect.bind(this)}
                                            defaultValue={this.state.selectId} style={{width:'100%'}}
                                            placeholder="选择上级科目组" optionLabelProp="title">
                                        {this.state.trans.map((data,index)=>{
                                            return  <Option value={data.id} key={data.id} title={`${data.id}--${data.name}`}>
                                                <div style={{textIndent:(data.level||0)*0.75+'rem'}}>
                                                    {`${data.id}--${data.name}`}
                                                </div>
                                            </Option>
                                        })}
                                    </Select>
                                </Col>
                                <Col xs={14}>
                                    {this.state.accountList.map((item,i)=>{
                                        return <div className="genson-margin-top">{item}</div>
                                    })}
                                </Col>
                            </Row>

                            <div className="genson-margin-top">
                                <Button className="genson-block-center"
                                        onClick={this.accountWaring.bind(this,this.state.accountType,this.state.accountList)}>
                                    一键添加科目
                                </Button>
                            </div>
                        </div>
                        <div className="genson-margin-top"
                             style={{display:this.state.not_find_account_name?'block':'none'}}>
                            <Table className="certificate-table" columns={column} dataSource={this.state.dataSource}/>
                        </div>
                    </Modal>
                </div>
            );
        }
    }
    module.exports = ScanCode;
})();