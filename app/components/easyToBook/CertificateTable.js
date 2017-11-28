/**
 * Created by junhui on 2017/8/14.
 */
(()=>{
    'use strict';
    let React = require('react');
    let moment = require('moment');
    let {Col, Row ,Button,Table,Input,Alert,Modal,message} = require('antd');
    let {getDateVnum,toThousands,objToArr,GetLocalStorage} = require('../../tool');
    let {Request} = require('../../request');
    let BindFile = require('../BindFile');
    class CertificateTable extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                isExchange:this.props.exchange,
                isUsd:this.props.usd,
                dataSource:[],
                columns:[],
                merge:this.props.merge,
                showError:false,
                error:'',
                times:this.props.times,
                type:this.props.type,
                vnum:this.props.vnum,
                date:this.props.date,
                memo_:'',
                att_id:[],
                isNum:false
            }
        }

        componentDidMount() {
            this.setState({columns:[
                {
                    title: '科目编码',
                    dataIndex: 'id',
                    key: 'id',
                }, {
                    title: '科目说明',
                    dataIndex: 'des',
                    key: 'des',
                }, {
                    title: '借方',
                    dataIndex: 'debit',
                    key: 'debit',
                    render:(text)=>{
                        return <div className="right">{toThousands(text)}</div>
                    }
                }, {
                    title: '贷方',
                    dataIndex: 'lender',
                    key: 'lender',
                    render:(text)=>{
                        return <div className="right">{toThousands(text)}</div>
                    }
                }, {
                    title: '摘要',
                    dataIndex: 'summary',
                    key: 'summary',
                }, {
                    title: '删除',
                    dataIndex: 'delete',
                    key: 'delete',
                    render:(text,item,index)=>{
                        return <div className="center">
                            <Button icon="delete" shape="circle" onClick={this.deleteItem.bind(this,index)}/>
                        </div>
                    }
                }
            ]})
        }

        componentWillReceiveProps(nextProps, nextContext) {
            let {table,merge,times,type,vnum,date} = nextProps;
            const _this = this;
            if(type!=_this.state.type){
                _this.setState({
                    type,dataSource:[],isNum:false
                })
            }
            let promise = new Promise((resolve, reject)=>{
                if(table.length>0)
                    _this.testZero(table,times,type,resolve,reject);
            });
            promise.then(function(value) {
                // 赋值table数据
                _this.setState({
                    dataSource:_this.state.times<times?
                        _this.state.dataSource.concat(table):_this.state.dataSource,
                    merge,vnum,date,
                    times:times,
                    showError:value
                },()=>{
                    if(merge){
                        _this.setMerge();
                    }
                });
            }, function(value) {
                // 展示错误提示
                _this.setState({showError:value})
            });
        }
        setMerge(){
            console.log('合并贷方...');
            let data = this.state.dataSource;
            let idList = [];//贷方id列表
            let lenderList = [];
            let splitId = [];//记录需要切割data的值，贷方
            let spKey = 0;//每次切割后data长度发生变化，需要变更对应切割的key值
            data.map((item,index)=>{
                if(item.lender){//遍历贷方数据
                    // data.splice(index,1);
                    splitId.push(index);
                    if(idList.indexOf(item.id)==-1){//不在贷方id列表中...
                        idList.push(item.id);
                        lenderList.push(item);
                    }else {
                        lenderList.map((LItem)=>{
                            if(LItem.id == item.id){
                                LItem.lender += item.lender;
                                LItem.num += item.num;
                                LItem.price = Number((item.debit||item.lender)/item.num).toFixed(2);
                            }
                        })
                    }
                }
            });
            splitId.map((key)=>{
                //切割后，data仅包含借方数据
                data.splice(key-spKey,1);
                spKey++;
            });
            data = data.concat(lenderList);//连接组合后的贷方数据
            this.setState({dataSource:data});
        }
        testZero(data,times,type,resolve,reject){//验证错误
            let isError = false;
            let content = '';
            let columns = this.state.columns;
            let isNum = this.state.isNum;
            data.map((item)=>{
                if(item.debit == 0){
                    isError = true;
                    content = '录入数据不能为0.';
                }
                if(item.lender == 0){
                    isError = true;
                    content = '录入数据不能为0.';
                }
                if(item.num!=undefined){
                    item.num = item.num||1;
                    item.price = Number((item.debit||item.lender)/item.num).toFixed(2);
                    let Num = {
                        title:'数量',
                        dataIndex:'num',
                        key:'num',
                        render:(text)=>{
                            return <div className="right">{text}</div>
                        }
                    };
                    let Price = {
                        title:'单价',
                        dataIndex:'price',
                        key:'price',
                        render:(text)=>{
                            return <div className="right">{text}</div>
                        }
                    };
                    if(!isNum){
                        columns.splice(4,0,Num,Price);
                        isNum = true;
                    }
                }
                if(!item.id){
                    isError = true;
                    content = '没有指定科目.';
                }

                if(times>this.state.times){
                    this.getDetail(item);
                }
            });
            if(type == 204 && data[0]){
                isError = data[0].id == data[1].id;
                content = '转出银行和转入银行的账户不能相同。';
            }
            this.setState({error:content,columns,isNum});
            if(resolve){
                isError?reject(isError):resolve(isError);
            }
        }
        getDetail(item){
            const url = {
                type:'chart-master/info',
                method:'GET'
            };
            let cb = (data)=>{
                if(!data.info){
                    return ;
                }
                const curr_default = GetLocalStorage('Const').curr_default;//默认币种
                let {curr_code,sb_type,account_name} = data.info;
                let {isExchange,isUsd} = this.state;
                item.des = account_name;
                if(curr_code&&(curr_code != curr_default)){
                    /*********默认币种不等于科目币种，属于外汇科目**********/
                    isExchange = true;
                    console.log('这是一个外汇科目...')
                }
                if(sb_type == 1){
                    /**********科目为数量科目**********/
                    isUsd = true;
                    console.log('这是一个数量科目...')
                }
                this.setState({isExchange,isUsd});
            };
            let par = {id:item.id};
            if(par.id){
                Request(par,cb,url);
            }
        }
        setMemo(e){
            let value = e.target?e.target.value:e;
            this.setState({memo_:value})
        }
        save(){
            let data = this.state.dataSource;
            let attId = this.state.att_id;
            const url = {
                type:'refs/save',
                method:'FormData',
                Method:'POST'
            };
            let cb = (rcData)=>{
                console.log(rcData);
                this.props.getVnum();
                let id = rcData.info;
                // this.getIdDetail(id)
            };
            let par = {
                vnum:this.state.vnum,
                date_:moment(this.state.date).format('YYYY-MM-D'),
                memo_:this.state.memo_,
            };
            attId.map((id,index)=>{
                par[`att_id[${index}]`]  = id;
            });
            data.map((item,key)=>{
                par['detail['+key+'][memo_]'] = item.summary;
                par['detail['+key+'][account]'] = item.id;
                if(item.debit){
                    /******借方******/
                    par['detail['+key+'][identity]'] = '1';
                    par['detail['+key+'][amount]'] = item.debit;
                }else {
                    /******贷方******/
                    par['detail['+key+'][identity]'] = '2';
                    par['detail['+key+'][amount]'] = item.lender;
                }
            });
            Request(par,cb,url);
        }
        getIdDetail(id){
            const url = {
                type:'refs/view',
                method:'GET',
            };
            let cb = (data)=>{
                console.log(data);
                let info = data.info.Refs;
                this.setState({
                   dataSource:[],
                    att_id:[],
                    memo_:''
                });
                const modal = Modal.confirm({
                    title: '凭证保存成功，是否查看凭证？',
                    onOk:()=>{
                        this.props.initCertificate(data.info,false,true);
                    },
                    okText:'查看凭证',
                    cancelText:'关闭',
                    content: <div>
                        <div>{'凭证号：'+info.reference}</div>
                        <div className="genson-margin-top">{'业务号：'+info.id}</div>
                    </div>,
                });
            };
            let par = {id};
            Request(par,cb,url);
        }
        setAttId(att_id){
            this.setState({
                att_id:att_id
            },()=>{
                console.info('return attid is',att_id);
            })
        }
        deleteItem(index){
            let dataSource = this.state.dataSource;
            dataSource.splice(index,1);
            this.setState({dataSource});
        }
        goEdit(){
            let state = this.state;
            let dataSource = state.dataSource;
            let init = {};
            init.Refs = {
                date_: moment(state.date).format('YYYY-MM-D'),
                memo_:state.memo_,
                vnum:state.vnum,
                att_id:state.att_id,
                reference:'',
            };
            init.GlTrans = [];
            dataSource.map((item)=>{
                let con = {};
                con.memo_ = item.summary;
                con.account = item.id;
                // con.account = item.des;
                con.negative = 0;
                if(item.num){
                    con.price = item.price;
                    con.qty = item.num;
                }
                con.amount = item.debit?item.debit:item.lender*-1;
                init.GlTrans.push(con);
            });
            if(dataSource.length>=2){
                this.props.initCertificate(init,false,false);
            }else {
                message.warning('至少保留二条分录')
            }
        }
        render() {
            return (
                <div>
                    <Alert message="数据有误" type="error" showIcon className="genson-margin-top"
                           style={{display:this.state.showError?'block':'none'}}
                           description={this.state.error}/>
                    <Row className="genson-margin-top">
                        <Col span={4}>
                            <Button icon="edit" type="primary" onClick={this.goEdit.bind(this)}>编辑凭证</Button>
                        </Col>
                    </Row>
                    <Table className="certificate-table" dataSource={this.state.dataSource} bordered
                           columns={this.state.columns} pagination={false} size="small"/>
                    <Row className="genson-margin-top">
                        <Col xs={2} offset={8} className="right">备注：</Col>
                        <Col xs={6}>
                            <Input type="textarea"  style={{width:'100%'}} value={this.state.memo_}
                                   onChange={this.setMemo.bind(this)}
                                   autosize={{ minRows: 2, maxRows: 6 }}/>
                        </Col>
                    </Row>
                    <Row className="genson-margin-top">
                        <Col xs={4} offset={10}>
                            <Button type="primary" style={{width:'100%'}}
                                    onClick={this.save.bind(this)}>保存凭证</Button>
                        </Col>
                    </Row>
                    <BindFile defaultAttId={this.state.att_id}
                              switchSetType={this.props.switchSetType.bind(this)}
                              setAttId={this.setAttId.bind(this)}/>
                </div>
            );
        }

    }
    module.exports = CertificateTable;
})();