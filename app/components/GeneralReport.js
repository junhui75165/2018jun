/**
 * Created by junhui on 2017/5/3.
 */
(function () {
    'use strict';
    let React = require('react');
    let moment = require('moment');
    let {Request,} = require('../request');
    let FidMerge = require('./FidMerge');
    let { Card, Col, Row ,Button,InputNumber,Switch,Input ,
        Select,DatePicker,Tabs,message,Icon } = require('antd');
    const RangePicker = DatePicker.RangePicker;
    const TabPane = Tabs.TabPane;
    const Option = Select.Option;
    const OptGroup = Select.OptGroup;
    let {objToArr,GetLocalStorage,getDateVnum} = require('../tool');
    class GeneralReport extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                trans_from_date: moment().startOf('month'),
                trans_to_date:moment().endOf('month'),
                date:moment().format('YYYY-MM-D'),
                list:[],
                defaultTabs:'',
                renDom:[],
                controlsValue:{},
                tree:[],
                cmpKey:[1,2],
                formItem:[],
                OutputList:{},
                inventory:[],
                visible:false,
                iconLoading:false,
                modal:[],
                dateVnum:{vnum:'',date_:moment().format('YYYY-MM-D')},
                title:this.props.title,
                render:1,
                openDate:false
            }
        }

        componentDidMount() {
            let cb = (data)=>{
                this.setState({
                    trans_from_date:moment(data.date_).startOf('month'),
                    trans_to_date:moment(data.date_).endOf('month'),
                    date:data.date_,
                    dateVnum:data
                },()=>{
                    this.getInventory();
                });
            };
            getDateVnum(cb);
        }

        componentWillReceiveProps(nextProps, nextContext) {
            this.setState({title:nextProps.title,modal:[] },()=>{
                this.getList();
            })
        }
        getInventory(){
            /********库存结余列表*******/
            const url = {
                // type:'inventory/inventory-list',
                type:'chart-type/inventory-list',
                method:'GET'
            };
            let cb = (data)=>{
                this.setState({inventory:data.info},()=>{
                    this.getOutputList();
                })
            };
            Request({},cb,url);
        }
        getOutputList(){
            const url = {
                type:'report/get-output-type',
                method:'FormData',
                Method:'POST'
            };
            let cb = (data)=>{
                this.setState({
                    OutputList:data.info
                },()=>{
                    this.getTree();
                })
            };
            Request({},cb,url);
        }
        getTree(){
            const type = {
                type:'tree/get-type-master-tree',
                method:'GET',
            };
            let cb = (data)=>{
                this.setState({
                    tree:objToArr(data.info),
                },()=>{
                    this.getList();
                })
            };
            Request({},cb,type);
        }
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
                                    return <Option title={data2.id+" - "+data2.name} value={data2.id} key={data2.id}>
                                        <div style={{textIndent:level*0.75+'rem'}}>{data2.id+' - '+data2.name}</div>
                                    </Option>
                                }
                            })
                        }
                    </OptGroup>
                }else {
                    return <Option title={data1.id+" - "+data1.name} value={data1.id} key={data1.id}>
                        <div style={{textIndent:level*0.75+'rem'}}>{data1.id+' - '+data1.name}</div>
                    </Option>
                }
            });
            return ren;
        }
        getList(){
            const type = {
                type:'report/get-all',
                method:'FormData',
                Method:'POST'
            };
            let cb = (data)=>{
                let id = data.info.RC_GL[0].id;
                data.info.RC_GL.map((item)=>{
                    if(item.name == this.props.title){
                        id = item.id;
                    }
                });
                this.setState({
                    list:data.info.RC_GL,
                    defaultTabs:String(id)
                },()=>{
                    this.initTabsContent(this.state.render);
                })
            };
            Request({},cb,type);
        }
        handleChange(value,item){
            // let value = e.target.value;
            this.setState({
                type:value
            })
        }
        changeDate(date){
            this.setState({
                trans_from_date:date[0],
                trans_to_date:date[1],
                openDate:false
            },()=>{
                this.initTabsContent(this.state.render);
            })
        }
        changeTabs(defaultTabs){
            this.setState({
                defaultTabs:defaultTabs,
                formItem:[],
                cmpKey:[1,2],
                modal:[],
                trans_to_date:moment(this.state.dateVnum.date_).endOf('month'),
                trans_from_date:moment(this.state.dateVnum.date_).startOf('month'),
            },()=>{
                this.initTabsContent(this.state.render);
            });
        }
        rtChildren(list){
            if(list[0].children){
                return this.rtChildren(list[0].children)
            }else {
                return list[0].id
            }
        }
        onOpenChange(openDate){
            this.setState({openDate})
        }
        initTabsContent(i){
            let dom = [];
            this.state.list.map((item)=>{
                if(item.id == this.state.defaultTabs){
                    // console.log(item.controls);
                    let key = 0;
                    for(let content in item.controls){
                        // console.log(content,item.controls[content]);
                        let hasModal = content.indexOf('编辑')>-1;
                        let showCon;
                        if(hasModal){
                            showCon = <FidMerge content={content} initTabsContent={this.initTabsContent.bind(this,this.state.render)}/>
                        }
                        let ren = <Row className="genson-margin-top" key={content}>
                            <Col xs={8} md={6} lg={3}>
                                <span>{hasModal?showCon:content}：</span>
                            </Col>
                            <Col xs={16} md={12} lg={6}>
                                {this.switchType(content,item.controls,key)}
                            </Col>
                        </Row>;
                        key++;
                        dom.push(ren);
                    }
                }
            });
            this.setState({
                renDom:dom
            },()=>{
                if(i>0){
                    /*********
                     * 为什么加i?
                     * 问得好！
                     * 调试发现切换tab时如果有时间则日期会在默认选中的值，不然并不是显示选中的值
                     * 估计是并不是在render中，render会多次渲染（大于一次）
                     * 模拟render执行过程,就需要多次执行，我设置i为1，相当于多执行了一次
                     * 如要调整执行次数注意initTabsContent调用的几个位置都需要变更，或者我设置一个render参数
                     * ***********/
                    this.initTabsContent(i-1);
                }
            })
        }
        switchType(type,item,key){
            let dom;
            let defVal;
            let opt;
            let controlsValue = this.state.controlsValue;
            let modal = this.state.modal;
            switch (type){
                case '输出格式':
                    opt = [];
                    item[type].map((con,index)=>{
                        let option = <Option value={con} key={index}>{con}</Option>;
                        opt.push(option);
                    });
                    defVal = modal[key]?modal[key].value:item[type][0];
                    modal[key] = {
                        value:defVal,
                        key:'output_type'
                    };
                    dom = <Select defaultValue={defVal} className="genson-input" style={{width:'100%'}}
                                  onChange={this.changeControls.bind(this,key,type)}>
                        {opt}
                    </Select>;
                    break;
                case '类型':
                    opt = [];
                    defVal = modal[key]?modal[key].value:'ST_JOURNAL';
                    modal[key] = {
                        value:defVal,
                        key:'type'
                    };
                    for(let i in item[type]){
                        let option = <Option key={i} value={i}>{item[type][i]}</Option>;
                        opt.push(option);
                    }
                    dom = <Select defaultValue={defVal} className="genson-input" style={{width:'100%'}}
                                  onChange={this.changeControls.bind(this,key,type)}>
                        {opt}
                    </Select>;
                    break;
                case '科目级别':
                    opt = [];
                    defVal = modal[key]?modal[key].value:item[type][0];
                    modal[key] = {
                        value:defVal,
                        key:'grade'
                    };
                    item[type].map((con,index)=>{
                        let option = <Option value={con} key={index}>{con}</Option>;
                        opt.push(option);
                    });
                    dom = <Select defaultValue={defVal} className="genson-input" style={{width:'100%'}}
                                  onChange={this.changeControls.bind(this,key,type)}>
                        {opt}
                    </Select>;
                    break;
            }
            switch (item[type]){
                case 'DATE_RANGE':
                case 'DATE_RANGEM':
                    defVal = modal[key]?modal[key].value:[moment(this.state.trans_from_date),moment(this.state.trans_to_date)];
                    if(this.state.defaultTabs==715 ||this.state.defaultTabs == 714||this.state.defaultTabs == 717){
                        defVal = modal[key]?defVal:[moment(this.state.dateVnum.date_).startOf('year'), moment(this.state.dateVnum.date_).endOf('year')];
                    }
                    modal[key] = {
                        value:defVal,
                        key:'date'
                    };
                    const month = GetLocalStorage('Const').fiscal_year_end_month;
                    let startYear = moment(this.state.dateVnum.date_).year()+'-'+(month==12?1:Number(month)+1);
                    let endYear = (month==12?moment(this.state.dateVnum.date_):moment(this.state.dateVnum.date_).add(1,'year')).year()+'-'+(month);
                    const ranges = [
                        {
                            from:{
                                title:'当前会计月份',
                                date:[moment(this.state.dateVnum.date_).startOf('month'), moment(this.state.dateVnum.date_).endOf('month')]
                            },
                            to:{
                                title:'上一会计月份',
                                date:[moment(this.state.dateVnum.date_).subtract(1,'month').startOf('month'), moment(this.state.dateVnum.date_).subtract(1,'month').endOf('month')]
                            }
                        },
                        {
                            from:{
                                title:'当前会计年度',
                                date:[moment(startYear).startOf('month'), moment(endYear).endOf('month')]
                            },
                            to:{
                                title:'上一会计年度',
                                date:[moment(startYear).subtract(1,'year'), moment(endYear).subtract(1,'year')],
                            }
                        },
                        {
                            from:{
                                title:'往前一个月',
                                icon:'left',
                                date:[moment(defVal[0]).subtract(1, 'month').startOf('month'), moment(defVal[1]).subtract(1, 'month').endOf('month')],
                            },
                            to:{
                                title:'往后一个月',
                                icon:'right',
                                date:[moment(defVal[0]).add(1, 'month').startOf('month'), moment(defVal[1]).add(1, 'month').endOf('month')],
                            }
                        },
                        {
                            from:{
                                title:'往前一年',
                                icon:'double-left',
                                date:[moment(defVal[0]).subtract(1, 'year').startOf('year'), moment(defVal[1]).subtract(1, 'year').endOf('year')],
                            },
                            to:{
                                title:'往后一年',
                                icon:'double-right',
                                date:[moment(defVal[0]).add(1, 'year').startOf('year'), moment(defVal[1]).add(1, 'year').endOf('year')],
                            }
                        },
                    ];
                    dom = <RangePicker className="genson-input"
                                       value={defVal}
                                       style={{width:'100%',maxWidth:'240px'}}
                                       open={this.state.openDate}
                                       onOpenChange={this.onOpenChange.bind(this)}
                                       renderExtraFooter={
                                           ()=>{
                                               return <div>
                                                   {
                                                       ranges.map((item,i)=>{
                                                           return<Row key={i} type="flex" justify="space-around">
                                                               <Col xs={8}>
                                                                   <Button icon={item.from.icon?item.from.icon:null}
                                                                           onClick={this.changeControls.bind(this,key,type,item.from.date)} style={{width:'100%'}}>
                                                                       {item.from.title}
                                                                   </Button>
                                                               </Col>
                                                               <Col xs={8}>
                                                                   <Button onClick={this.changeControls.bind(this,key,type,item.to.date)} style={{width:'100%'}}>
                                                                       {item.to.title}
                                                                       <Icon type={item.to.icon?item.to.icon:null} />
                                                                   </Button>
                                                               </Col>
                                                           </Row>
                                                       })
                                                   }
                                               </div>
                                           }
                                       }
                                       onChange={this.changeControls.bind(this,key,type)}/>;
                    break;
                case 'DECIMAL_DIGITS':
                case 'ALIGN':
                    defVal = modal[key]?modal[key].value:0;
                    if(type.indexOf('位数')>-1){
                        modal[key] = {
                            value:defVal,
                            key:'decimal'
                        };
                    }else if(type.indexOf('边距')>-1){
                        modal[key] = {
                            value:defVal,
                            key:'distance'
                        };
                    }
                    dom = <InputNumber defaultValue={defVal} className="genson-input" style={{width:'100%'}}
                                       onChange={this.changeControls.bind(this,key,type)}/>;
                    break;
                case 'DIMENSION':
                case 'DATEENDM':
                case 'DATE':
                    defVal = modal[key]?modal[key].value:moment(this.state.date);
                    modal[key] = {
                        value:defVal,
                        key:'trans_to_date'
                    };
                    dom = <DatePicker value={defVal} className="genson-input"
                                      style={{width:'100%',maxWidth:'240px'}}
                                      onChange={this.changeControls.bind(this,key,type)}/>;
                    break;
                case 'YES_NO':
                case 'TRANSLATION':
                    defVal = modal[key]?modal[key].value:false;
                    if(type.indexOf('翻译')>-1){
                        modal[key] = {
                            value:defVal?1:0,
                            key:'translation'
                        };
                    }else if(type.indexOf('合并')>-1){
                        modal[key] = {
                            value:defVal?1:0,
                            key:'is_combine'
                        };
                    }else if(type.indexOf('本年累计数')>-1){
                        modal[key] = {
                            value:defVal?1:0,
                            key:'year_acc'
                        };
                    }else if(type.indexOf('显示零值')>-1){
                        modal[key] = {
                            value:defVal?1:0,
                            key:'no_zero'
                        };
                    }else if(type.indexOf('显示余额')>-1){
                        modal[key] = {
                            value:defVal?1:0,
                            key:'balance'
                        };
                    }
                    dom = <Switch checkedChildren={'是'} unCheckedChildren={'否'} defaultChecked={defVal}
                                  onChange={this.changeControls.bind(this,key,type)}/>;
                    break;
                case 'TEXT':
                case 'TEXTBOX':
                    defVal = modal[key]?modal[key].value:'';
                    modal[key] = {
                        value:defVal,
                        key:'note'
                    };
                    if(type.indexOf('凭证号范围')>-1){
                        // defVal = modal[key].value||'';
                        modal[key] = {
                            value:defVal,
                            key:'vnum'
                        };
                    }
                        dom = <Input defaultValue={defVal} className="genson-input"
                                 style={{width:'100%'}} type="textarea" autosize={{ minRows: 3 }}
                                 onChange={this.changeControls.bind(this,key,type)}/>;
                    break;
                case 'GL_ACCOUNTS':
                    defVal = modal[key]?modal[key].value:this.rtChildren(this.state.tree);
                    if(type.indexOf('自科目')>-1){
                        modal[key] = {
                            value:defVal,
                            key:'beg_account'
                        };
                    }else if(type.indexOf('至科目')>-1){
                        modal[key] = {
                            value:defVal,
                            key:'end_account'
                        };
                    }
                    dom = <Select defaultValue={defVal} className="genson-input" style={{width:'100%'}}
                                  optionLabelProp="title" optionFilterProp="title"
                                  onChange={this.changeControls.bind(this,key,type)}>
                        {this.renOption(this.state.tree,-1)}
                    </Select>;
                    break;
                case 'INVENTORY_ACCOUNTS'://库存结余
                    defVal = modal[key]?modal[key].value:this.state.inventory[0].id;
                    modal[key] = {
                        value:defVal,
                        key:'account'
                    };
                    dom = <Select defaultValue={defVal} className="genson-input" style={{width:'100%'}}
                                  optionLabelProp="title" optionFilterProp="title"
                                  onChange={this.changeControls.bind(this,key,type)}>
                        {this.state.inventory.map((item)=>{
                            return <Option key={item.id} value={item.id}
                                           title={item.id+'--'+item.name}>
                                {item.id+'--'+item.name}
                            </Option>
                        })}
                    </Select>;
                    break;
            }
            controlsValue[key] = defVal;
            this.setState({
                controlsValue:controlsValue,
                modal
            });
            return dom;
        };

        changeControls(key,type,val){
            if(typeof (val) == 'undefined'){
                return;
            }
            let value = val.target?val.target.value:val;
            let controlsValue = this.state.controlsValue;
            controlsValue[key] = value;
            let modal = this.state.modal;
            modal[key].value = value;
            if(value === true || value === false){
                modal[key].value = value?1:0;
            }
            this.setState({
                controlsValue:controlsValue,
                modal
            },()=>{
                if(Array.isArray(val)&&moment.isDate(new Date(val[0]))){
                    this.changeDate(val);
                }
            });
        }
        getReport(item){
            const url = {
                type:'report/display-report',
                method:'FormData',
                Method:'POST'
            };
            let par = {};
            let modal = this.state.modal;
            par.report_id = item.id;
            modal.map((con,index)=>{
                if(con.key == 'date'){
                    //设置日期参数起始值
                    par.trans_from_date = moment(con.value[0]).format('YYYY-MM-D');
                    par.trans_to_date = moment(con.value[1]).format('YYYY-MM-D');
                }else if(con.key == 'is_combine'){
                    par[con.key] = con.value;
                    let fidList = GetLocalStorage('Const').rpt_combination||'';
                    if(fidList.indexOf('&')>-1){
                        par.combine = fidList;
                    }else {
                        par.combine = fidList.split('^').join('&');
                    }
                }else if(con.key == 'trans_to_date'){
                    par[con.key] = moment(con.value).format('YYYY-MM-D');
                }else {
                    par[con.key] = con.value;
                }
            });
            par.output_type = this.state.OutputList[par.output_type];
            let cb = (data)=>{
                console.log(data.info);
                if(data.info.error&&data.info.error.length>0){
                    message.error(String(data.info.error))
                }else {
                    this.setState({
                        iconLoading:false
                    },()=>{
                        if(data.info.indexOf('http')>-1){
                            window.open(data.info,'','width=1024,height=860')
                        }else {
                            window.open('http://'+data.info,'','width=1024,height=860')
                        }
                    });
                }
            };
            console.log(par);
            this.setState({iconLoading:true},()=>{
                Request(par,cb,url);
            });
        }
        render() {
            return (
                <div className="gen-certificate">
                    <Card title={<h1 className="certificate-title">打印输出</h1>}
                          bordered={true}>
                        <div className="genson-block-center" style={{width:'80%'}}>
                            <Tabs tabPosition="left" size="small" type="line"
                                  onChange={this.changeTabs.bind(this)}
                                  activeKey={this.state.defaultTabs}>
                                {
                                    this.state.list.map((item)=>{
                                        return <TabPane key={item.id} tab={item.name}>
                                            {
                                                this.state.renDom.map((dom)=>{
                                                    return dom;
                                                })
                                            }
                                            <Row className="genson-margin-top">
                                                <Col xs={4} offset={3} mdOffset={5} xsOffset={8}>
                                                    <Button type="primary" loading={this.state.iconLoading}
                                                            onClick={this.getReport.bind(this,item)}>
                                                        显示：{item.name}
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </TabPane>
                                    })
                                }
                            </Tabs>
                        </div>

                    </Card>
                </div>
            );
        }
    }
    // const GeneralReport = Form.create()(Report);
    module.exports = GeneralReport;

})();