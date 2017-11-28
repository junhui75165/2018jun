/**
 * Created by junhui on 2017/8/15.
 */
(()=>{
    'use strict';
    let React = require('react');
    let moment = require('moment');
    let {Card,Col, Row ,Table,DatePicker,Alert,InputNumber,Button} = require('antd');
    let {getDateVnum,toThousands} = require('../../tool');
    let {Request} = require('../../request');
    class AutomaticProvision extends React.Component{
        constructor(props){
            super(props);
            this.state ={
                date:moment(),
                vnum:'',
                expenses:[],//开支
                taxes:[],//计提税额
                vouchers:[],//记账凭证
                error:[],//错误提示
            }
        }

        componentDidMount() {
            this.getVnum();
        }

        getVnum(date){
            let cb = (data)=>{
                this.setState({
                    date:data.date_,
                    vnum:data.vnum
                },()=>{
                    //获取表格数据
                    this.getTable();
                })
            };
            getDateVnum(cb,date)
        }
        getTable(){
            const url = {
                type:'simple-bookkeeping/accrued-tax',
                method:'GET'
            };
            let par = {date:moment(this.state.date).format('YYYY-MM-D')};
            let cb = (data)=>{
                let expenses = data.info.expense||[];
                let taxes = data.info.tax||[];
                let vouchers = data.info.gl||[];
                let error = data.info.error||[];
                this.setState({expenses,taxes,vouchers,error})
            };
            Request(par,cb,url);
        }

        setDate(date){
            this.setState({date},()=>{
                if(date){
                    this.getVnum(moment(date).format('YYYY-MM-D'))
                }
            })
        }
        setVnum(vnum){
            this.setState({vnum});
        }
        tax_save(){
            const url = {
                type:'simple-bookkeeping/accrued-tax-save',
                method:'FormData',
                Method:'POST'
            };
            let cb = (data)=>{
                message.success('结转成功！');
                this.getVnum();
            };
            let par = {
                date:moment(this.state.date).format('YYYY-MM-D'),
                vnum:this.state.vnum
            };
            Request(par,cb,url);
        }
        render() {
            /*****开支******/
            const expenses = [
                {
                    title:'类型',
                    dataIndex:'str',
                    key:'str',
                    width:'60%',
                },
                {
                    title:'金额',
                    dataIndex:'amount',
                    key:'amount',
                    width:'40%',
                    render:(text)=>{
                        return <div className="right">{toThousands(text)}</div>
                    }
                },
            ];
            /*****计提税额******/
            const taxes = [
                {
                    title:'类型',
                    dataIndex:'str',
                    key:'str',
                    width:'60%'
                },
                {
                    title:'金额',
                    dataIndex:'amount',
                    key:'amount',
                    width:'40%',
                    render:(text)=>{
                        return <div className="right">{toThousands(text)}</div>
                    }
                },
            ];
            /*****记账凭证******/
            const vouchers = [
                {
                    title:'科目',
                    dataIndex:'account_name',
                    key:'account_name',
                    width:'30%'
                },
                {
                    title:'借方',
                    dataIndex:'debit',
                    key:'debit',
                    width:'20%',
                    render:(text,item)=>{
                        let value = item.amount>0?item.amount:'';
                        return <div className="right">{toThousands(value)}</div>
                    }
                },
                {
                    title:'贷方',
                    dataIndex:'lender',
                    key:'lender',
                    width:'20%',
                    render:(text,item)=>{
                        let value = item.amount<0?item.amount*-1:'';
                        return <div className="right">{toThousands(value)}</div>
                    }
                },
                {
                    title:'摘要',
                    dataIndex:'memo',
                    key:'memo',
                    width:'30%',
                },
            ];
            return (
                <div className="gen-certificate">
                    <Card title={<h1 className="certificate-title">{this.props.title}</h1>}
                          bordered={true}>
                        <Alert className="genson-margin-top"
                               message="错误提示" showIcon style={{display:this.state.error.length==0?'none':'block'}}
                               description={
                                   <div>
                                       {
                                           this.state.error.map((item,index)=>{
                                               return <div>
                                                   {index+1}:{item}
                                               </div>
                                           })
                                       }
                                   </div>
                               }
                               type="error"/>
                        <Row className="genson-margin-top">
                            <Col xs={2} className="right">
                                日期：
                            </Col>
                            <Col xs={4}>
                                <DatePicker value={moment(this.state.date)} onChange={this.setDate.bind(this)}/>
                            </Col>
                            <Col xs={2} className="right">
                                凭证号：
                            </Col>
                            <Col xs={4}>
                                <InputNumber value={this.state.vnum} onChange={this.setVnum.bind(this)}/>
                            </Col>
                            <Col xs={4}>
                                <Button type="primary" icon="search" onClick={this.getTable.bind(this)}>查找</Button>
                            </Col>
                            <Col xs={4}>
                                <Button type="primary" disabled={this.state.error.length!=0} onClick={this.tax_save.bind(this)}>结转</Button>
                            </Col>
                        </Row>
                        <Row className="genson-margin-top">
                            <Col xs={11}>
                                <h2 className="center">开支</h2>
                                <Table className="certificate-table" dataSource={this.state.expenses} bordered
                                       columns={expenses} pagination={false} size="small"/>
                            </Col>
                            <Col xs={11} offset={2}>
                                <h2 className="center">计提税额</h2>
                                <Table className="certificate-table" dataSource={this.state.taxes} bordered
                                       columns={taxes} pagination={false} size="small"/>
                            </Col>
                        </Row>
                        <h2 className="center genson-margin-top">记账凭证</h2>
                        <Table className="certificate-table" dataSource={this.state.vouchers} bordered
                               columns={vouchers} pagination={false} size="small"/>
                    </Card>
                </div>
            );
        }

    }
    module.exports = AutomaticProvision;
})();