/**
 * Created by junhui on 2017/5/22.
 */
(function () {
    'use strict';
    let React = require('react');
    let moment = require('moment');
    let {Request, } = require('../request');
    let {rtTableHeight} = require('../tool');
    let { Row ,Button,Table,Checkbox,message} = require('antd');
    class SortSubject extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                simplifyList:[],
                loading:false,
                check:{},
            };
        }

        componentWillMount() {
            this.getSubject();
        }
        getSubject(){
            this.setState({loading:true});
            const type = {
                type:'chart-master/acc-simplify-list',
                method:'GET'
            };
            let cb = (data)=>{
                let list = [];
                let check = {};``
                for(let i in data.info){
                    check[i] = false;
                    data.info[i].key = i;
                    list.push(data.info[i]);
                }
                this.setState({
                    simplifyList:list,
                    loading:false,
                    check:check,
                });
            };
            Request({},cb,type);
        }
        sync(){
            const type = {
                type:'chart-master/acc-simplify',
                method:'FormData',
                Method:'POST',
            };
            let check = this.state.check;
            let k = 0;
            let par = {};
            for(let i in check){
                if(check[i]){
                    par[`account_code[${k}]`] =  i;
                    k++;
                }
            }
            let cb = (data)=>{
                message.success('精简成功');
                this.getSubject();
            };
            console.log(par);
            Request(par,cb,type);
        }
        changeCheck(item,e){
            let value = e.target.checked;
            let check = this.state.check;
            check[item.account_code] = value;
            this.setState({
                check:check
            })
        }
        render() {
            let columns = [
                {
                    title:'组编码(ID)',
                    dataIndex:'account_code',
                    key:'account_code',
                    width:'15%',
                    sorter: (a, b) => a.account_code - b.account_code,
                },
                {
                    title:'组名称',
                    dataIndex:'account_name',
                    key:'account_name',
                    width:'40%',
                },
                {
                    title:'上级组名',
                    dataIndex:'name',
                    key:'name',
                    width:'30%',
                },
                {
                    title:'停用',
                    dataIndex:'stop',
                    key:'stop',
                    width:'15%',
                    render:(text,item,index)=>{
                        return<Checkbox checked={this.state.check[item.account_code]} onChange={this.changeCheck.bind(this,item)}/>
                    }
                },
            ];
            return (
                <div>
                    <Row className="genson-margin-top">
                        <Button type="primary" icon="sync" onClick={this.sync.bind(this)}>精简科目</Button>
                    </Row>
                    <div className="genson-margin-top" style={{color:'grey'}}>
                        以下为未使用且无余额的科目。
                        系统将把打勾的科目设为停用。
                        之后在“总账科目”中仍然可以将停用科目重新设置为有效。
                    </div>
                    <Table className="certificate-table"
                           loading={this.state.loading}
                           bordered
                           scroll={{y:rtTableHeight(30)}}
                           size="small"
                           pagination={false}
                           columns={columns}
                           dataSource={this.state.simplifyList}/>
                </div>
            );
        }
    }
    module.exports = SortSubject;
})();
