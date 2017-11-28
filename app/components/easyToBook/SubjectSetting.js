/**
 * Created by junhui on 2017/8/11.
 */
(()=>{
    'use strict';
    let React = require('react');
    let {Card,Col, Row ,Button,message,Modal,Select} = require('antd');
    const { Option, OptGroup } = Select;
    let {objToArr,GetLocalStorage,getConst} = require('../../tool');
    let {Request} = require('../../request');
    class SubjectSetting extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                left:[],
                right:[],
                children:[],
                value:[],
                tree:[]
            }
        }

        componentDidMount() {
            const left = [
                {
                    title:'费用开支',
                    list:
                        [
                            {title:'营业费用',type:'parent',key:'0',name:'sb_operating_expenses_act'},
                            {title:'管理费用',type:'parent',key:'1',name:'sb_administrative_expenses_act'},
                            {title:'工资（费用）',type:'detail',key:'2',name:'sb_expense_of_wages_act'},
                            {title:'社保费（管理费用）',type:'detail',key:'3',name:'sb_expense_of_social_insurance_act'},
                            {title:'住房公积金（管理费用）',type:'detail',key:'4',name:'sb_expense_of_house_fund_act'},
                        ]
                },
                {
                    title:'缴纳税款',
                    list:
                        [
                            {title:'缴纳税款-应交税金',type:'parent',key:'5',name:'sb_tax_payable_act'},
                            {title:'缴纳税款-其它应交款',type:'parent',key:'6',name:'sb_other_fees_act'},
                            {title:'缴纳税款-增值税-已交税金',type:'detail',key:'7',name:'sb_vat_act'},
                        ]
                },
                {
                    title:'营业外收入/营业外支出',
                    list:
                        [
                            {title:'营业外收入',type:'detail',key:'8',name:'sb_nonoperation_income_act'},
                            {title:'营业外支出',type:'detail',key:'9',name:'sb_nonoperation_expense_act'},
                        ]
                },
            ];
            const right = [
                {
                    title:'利息',
                    list:
                        [
                            {title:'利息',type:'detail',key:'10',name:'sb_bank_interest_act'},
                        ]
                },
                {
                    title:'工资及相关个税、社保、公积金',
                    list:
                        [
                            {title:'应付工资',type:'detail',key:'11',name:'sb_accrued_wages_act'},
                            {title:'应交个人所得税',type:'detail',key:'12',name:'sb_personal_income_tax_payable_act'},
                            {title:'社保费个人部分',type:'detail',key:'13',name:'sb_personal_social_insurance_act'},
                            {title:'住房公积金个人部分',type:'detail',key:'14',name:'sb_personal_house_fund_act'},
                        ]
                },
                {
                    title:'低值易耗品',
                    list:
                        [
                            {title:'低值易耗品',type:'detail',key:'15',name:'sb_low_value_act'},
                            {title:'低值易耗品费用',type:'detail',key:'16',name:'sb_low_value_expense_act'},
                        ]
                },
            ];
            this.setState({left,right},()=>{
                this.getValue(left,right);
            });
            this.getDetailTree();
            this.getList();
        }
        getValue(left,right){
            const Const = GetLocalStorage('Const');
            let value = [];
            left.map((item)=>{
                item.list.map((con)=>{
                    value[con.key] = Const[con.name];
                })
            });
            right.map((item)=>{
                item.list.map((con)=>{
                    value[con.key] = Const[con.name];
                })
            });
            this.setState({value});
        }
        saveConst(){
            const {left,right,value} = this.state;
            const url = {
                type:'sys-prefs/update',
                method:'FormData',
                Method:"POST"
            };
            let cb = ()=>{
                getConst();
                message.success('更改成功！')
            };
            let par = {};
            left.map((item)=>{
                item.list.map((con)=>{
                    par[con.name] = value[con.key];
                })
            });
            right.map((item)=>{
                item.list.map((con)=>{
                    par[con.name] = value[con.key];
                })
            });
            console.log(par);
            Request(par,cb,url);
        }
        getDetailTree(){
            /******详细科目*******/
            const _this = this;
            let type = {
                type:'tree/get-type-master-tree',
                method:'GET',
            };
            let callback = function (data) {
                let list = objToArr(data.info);
                let ren = _this.renOption(list,-1);
                _this.setState({children:ren});
            };
            Request({},callback,type);
        }
        /*********科目下拉内容排布**********/
        renOption(list,level){
            level++;
            let ren = list.map((data1)=>{
                if(data1.open){
                    return <OptGroup key={data1.id} label={<div style={{textIndent:(level)*0.75+'rem'}}>
                        {data1.id+' - '+data1.name}</div>}>
                        {
                            data1.children.map((data2)=>{
                                if(data2.open){
                                    return <OptGroup key={data2.id} label={<div style={{textIndent:(level+1)*0.75+'rem'}}>
                                        {data2.id+' - '+data2.name}</div>}>
                                        {this.renOption(data2.children,level+1)}
                                    </OptGroup>
                                }else {
                                    return <Option title={data2.id+" - "+data2.name} curr_code={data2.curr_code} sb_type={data2.sb_type} value={data2.id} key={data2.id}>
                                        <div style={{textIndent:level*0.75+'rem'}}>{data2.id+' - '+data2.name}</div>
                                    </Option>
                                }
                            })
                        }
                    </OptGroup>
                }else {
                    return <Option title={data1.id+" - "+data1.name} curr_code={data1.curr_code} sb_type={data1.sb_type} value={data1.id} key={data1.id}>
                        <div style={{textIndent:level*0.75+'rem'}}>{data1.id+' - '+data1.name}</div>
                    </Option>
                }
            });
            return ren;
        };
        getList(){
            /***********科目组***********/
            const type = {
                type:'chart-type/get-trans',
                method:'GET',
            };
            const _this = this;
            let cb = (data)=>{
                _this.setLevel(data.info);
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
                tree:list
            });
        }

        setSelect(key,value){
            console.log(key,value);
            let list = this.state.value;
            list[key] = value;
            this.setState({
                value:list
            })
        }
        render() {
            const Const = GetLocalStorage('Const');
            return (
                <div className="gen-certificate">
                    <Card title={<h1 className="certificate-title">{this.props.title}</h1>}
                          bordered={true}>
                        <Row>
                            <Col xs={11}>
                                {
                                    this.state.left.map((item,index)=>{
                                        return<div key={index}>
                                            <h3 className="center genson-margin-top">{item.title}</h3>
                                            {
                                                item.list.map((list)=>{
                                                    return <Row key={list.key} className="genson-margin-top">
                                                        <Col xs={8} className="right" style={{paddingRight:'1rem'}}>{list.title}</Col>
                                                        <Col xs={16} >
                                                            {
                                                                list.type=='detail'?
                                                                    (
                                                                        <Select showSearch className="genson-input"
                                                                                allowClear
                                                                                optionLabelProp="title"
                                                                                optionFilterProp="title"
                                                                                style={{ width: '100%'}}
                                                                                notFoundContent="没有匹配的选项"
                                                                                onChange={this.setSelect.bind(this,list.key)}
                                                                                value={this.state.value[list.key]}>
                                                                            {this.state.children}
                                                                        </Select>
                                                                    ):
                                                                    (<Select showSearch className="genson-input"
                                                                             allowClear
                                                                             optionLabelProp="title"
                                                                             optionFilterProp="title"
                                                                             style={{ width: '100%'}}
                                                                             notFoundContent="没有匹配的选项"
                                                                             onChange={this.setSelect.bind(this,list.key)}
                                                                             value={this.state.value[list.key]}>
                                                                        {this.state.tree.map((item)=>{
                                                                            return<Option key={item.id} value={item.id}
                                                                                          title={`${item.id}--${item.name}`}>
                                                                                <div style={{textIndent:(item.level||0)*0.75+'rem'}}>
                                                                                    {`${item.id}--${item.name}`}
                                                                                </div>
                                                                            </Option>
                                                                        })}
                                                                    </Select>)
                                                            }
                                                        </Col>
                                                    </Row>
                                                })
                                            }
                                        </div>;
                                    })
                                }
                            </Col>
                            <Col xs={11} offset={2}>
                                {
                                    this.state.right.map((item,index)=>{
                                        return<div key={index}>
                                            <h3 className="center genson-margin-top">{item.title}</h3>
                                            {
                                                item.list.map((list)=>{
                                                    return <Row key={list.key} className="genson-margin-top">
                                                        <Col xs={8} className="right" style={{paddingRight:'1rem'}}>{list.title}</Col>
                                                        <Col xs={16}>
                                                            {
                                                                list.type=='detail'?
                                                                    (
                                                                        <Select showSearch className="genson-input"
                                                                                allowClear
                                                                                optionLabelProp="title"
                                                                                optionFilterProp="title"
                                                                                style={{ width: '100%'}}
                                                                                notFoundContent="没有匹配的选项"
                                                                                onChange={this.setSelect.bind(this,list.key)}
                                                                                value={this.state.value[list.key]}>
                                                                            {this.state.children}
                                                                        </Select>
                                                                    ):
                                                                    (<Select showSearch className="genson-input"
                                                                             allowClear
                                                                             optionLabelProp="title"
                                                                             optionFilterProp="title"
                                                                             style={{ width: '100%'}}
                                                                             notFoundContent="没有匹配的选项"
                                                                             onChange={this.setSelect.bind(this,list.key)}
                                                                             value={this.state.value[list.key]}>
                                                                        {this.state.tree.map((item)=>{
                                                                            return<Option key={item.id} value={item.id}
                                                                                          title={`${item.id}--${item.name}`}>
                                                                                <div style={{textIndent:(item.level||0)*0.75+'rem'}}>
                                                                                    {`${item.id}--${item.name}`}
                                                                                </div>
                                                                            </Option>
                                                                        })}
                                                                    </Select>)
                                                            }
                                                        </Col>
                                                    </Row>
                                                })
                                            }
                                        </div>;
                                    })
                                }
                            </Col>
                        </Row>
                        <Row className="genson-margin-top">
                            <Button className="genson-block-center" onClick={this.saveConst.bind(this)}>
                                保存设置
                            </Button>
                        </Row>
                    </Card>
                </div>
            );
        }


    }
    module.exports = SubjectSetting;
})();