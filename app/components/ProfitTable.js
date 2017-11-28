/**
 * Created by junhui on 2017/4/27.
 */
(function () {
    'use strict';
    let React = require('react');
    let Global = require('../Global');
    let moment = require('moment');
    let {Request} = require('../request');
    let FidMerge = require('./FidMerge');
    let { Card, Col, Row ,Button,Table,message,Form,Select,
        DatePicker,Popover,Input,Tag,Modal,Spin,Checkbox,Icon} = require('antd');
    const { Option, OptGroup } = Select;
    let {GetLocalStorage,objToArr,getDateVnum,rtTableHeight} = require('../tool');
    const FormItem = Form.Item;
    const {  RangePicker } = DatePicker;
    const reportType = 2;
    class Profit extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                date:[moment().startOf('month'), moment().endOf('month')],//日期始终时间
                content:<Spin tip="加载中..."/>,//表格内容
                visible:false,//是否显示模板
                confirmLoading:false,//模板内容提及loading
                modal:{name:'',line:'',current:'',total:''},
                report:false,
                loading:false,
                edit:{i:'',j:'',edit:false},
                columns:[],
                dataSource:[],
                submit:{option:'+',parameter:''},
                master_select:[],
                master_info:{},
                table_select:[],
                table_info:{},
                option_select:[],
                check:false,
                dateVnum:{vnum:'',date_:moment().format('YYYY-MM-D')},
                active:'search',//search,definition激活状态
                openDate:false,
            }
        }
        resetFid(){
            return <FidMerge content="合并" initTabsContent={this.resetFid.bind(this)}/>
        }
        changeDate(date){
            //设置日期
            this.setState({
                date:date,
                openDate:false
            });
        }
        componentDidMount() {
            // 初始化表格
            this.setTable(this.props.data);
            this.getSelect();
            this.getTableSelect();
            this.getCodeList();
            let cb = (data)=>{
                this.setState({
                    date: [moment(data.date_).startOf('month'),
                        moment(data.date_).endOf('month')],
                    dateVnum:data
                },()=>{
                    this.searchData();
                    // console.log(this.state.dateVnum)
                });
            };
            getDateVnum(cb);
        }
        componentWillReceiveProps(nextProps, nextContext) {
            //接收返回数据重置表格内容
            if(!this.state.visible){
                this.setTable(nextProps.data);
            }
        }
        getSelect(){//科目取数-取数类型下拉列表数据
            const type = {
                type:'report-form/get-master-func-for-select',
                method:'GET'
            };
            let cb = (data)=>{
                let list = [];
                let defaultModal = this.state.submit;
                for(let key in data.info){
                    let item = {};
                    item.key = key;
                    item.value = data.info[key];
                    list.push(item);
                }
                defaultModal.master = list[0].key;
                this.setState({
                    master_info:data.info,
                    master_select:list,
                    submit:defaultModal
                })
            };
            Request({},cb,type)
        }
        renOption(list,level){
            level++;
            let ren = list.map((data1)=>{
                if(data1.open){
                    let optGroup = [];
                    let optChild = [];
                    let optParent = <Option key={data1.id} title={data1.id+" - "+data1.name} value={data1.id}>
                        <div style={{textIndent:(level)*0.75+'rem'}}>{data1.id+" - "+data1.name}</div>
                    </Option>;
                    optGroup.push(optParent);
                    data1.children.map((data2)=>{
                        if(data2.open){
                            let item = <Option key={data2.id} title={data2.id+" - "+data2.name} value={data2.id}>
                                <div style={{textIndent:(level+1)*0.75+'rem'}}>{data2.id+" - "+data2.name}</div>
                            </Option>;
                            optChild.push(item);
                            let children = this.renOption(data2.children,level+1);
                            optChild = optChild.concat(children);
                        }else {
                            let item =  <Option title={data2.id+" - "+data2.name} value={data2.id} key={data2.id}>
                                <div style={{textIndent:(level+1)*0.75+'rem'}}>{data2.id+' - '+data2.name}</div>
                            </Option>;
                            optChild.push(item);
                        }
                    });
                    optGroup = optGroup.concat(optChild);
                    return optGroup;
                }else {
                    return <Option title={data1.id+" - "+data1.name} value={data1.id} key={data1.id}>
                        <div style={{textIndent:level*0.75+'rem'}}>{data1.id+' - '+data1.name}</div>
                    </Option>
                }
            });
            return ren;
        }
        getTableSelect(){
            const type = {
                type:'report-form/get-table-func-for-select',
                method:'GET'
            };
            let cb = (data)=>{
                let list = [];
                let defaultModal = this.state.submit;
                for(let key in data.info){
                    let item = {};
                    item.key = key;
                    item.value = data.info[key];
                    list.push(item);
                }
                defaultModal.table = list[0].key;
                this.setState({
                    table_select:list,
                    table_info:data.info,
                    submit:defaultModal
                })
            };
            Request({},cb,type)
        }
        getCodeList(){
            const type = {
                type:"tree/get-type-master-tree",
                method:'GET'
            };
            let cb = (data)=>{
                let list = data.info;
                list = objToArr(list);
                let defaultModal = this.state.submit;
                defaultModal.code = list[0].id;
                this.setState({
                    option_select:list,
                    submit:defaultModal
                })
            };
            Request({},cb,type);
        }
        cellChange(j,record, event){
            if(this.state.report){
                if(j==1||j==2){
                    record.edit = true;
                    this.setState({
                        edit:{
                            i:record.i,
                            j:j,
                            edit:true
                        }
                    });
                }else {
                    this.setState({
                        edit:{
                            i:record.i,
                            j:j,
                            edit:false
                        }
                    });
                }
            }
        }
        showModal(j,item){
            console.log(item.i,j,item[j]);
            let modal = item;
            modal.j = j;
            let content = item[j];
            let modalTable = [];
            let cb = (data)=>{
                modalTable = data.info;
                this.setState({
                    modal:modal,
                    modalTable:modalTable,
                    visible:true
                })
            };
            this.parseFormula(content,cb);
        }
        parseFormula(content,cb){
            const type = {
                type:'report-form/parse-formula',
                method:'GET'
            };
            let par = {formula:content};
            Request(par,cb,type);
        }
        clickTag(id){
            console.log(id);
            let par = {
                searchDate: [moment(this.state.date[0]).format('YYYY-MM-D'),moment(this.state.date[1]).format('YYYY-MM-D')],
                // account_type:1,
                max_money:0,
                min_money:0,
                account_code:id,
                // page:par.page-1
            };
            this.props.getAB(par);
        }
        Enter(j,record,e){
            let value = e.target.value;
            let isReq = false;
            const type = {
                type:'report-form/save-form-define',
                method:'FormData',
                Method:'POST',
            };
            let par = {type:2};
            this.state.table.map((item,it)=>{
                item.map((con,c)=>{
                    if(it==record.i&&c==j){
                        par[`table[${it}][${c}]`] = value;
                        isReq = con!=value;
                    }else {
                        par[`table[${it}][${c}]`] = con;
                    }
                })
            });
            let cb = (data)=>{
                this.setState({
                    edit:{
                        i:record.i,
                        j:j,
                        edit:false
                    },
                    loading:true,
                    modal:{},
                    visible:false
                },()=>{
                    this.setTable(data.info);
                });

            };
            if(isReq){
                Request(par,cb,type);
            }else {
                this.setState({
                    edit:{
                        i:record.i,
                        j:j,
                        edit:false,
                    },
                    modal:{},
                    visible:false
                })
            }
        }
        setTable(source,modal){
            //查询表格
            let columns = [];
            let table = [];
            let editTable = [];
            for(let i in source){
                editTable[i] = [];
                if(i>1){
                    table[table.length] = {};
                }
                for(let j in source[i]){
                    editTable[i][j] = source[i][j];
                    if(i==1){
                        // 返回数据第一项为表头
                        columns[j-1] = {};
                        columns[j-1].title=source[i][j];
                        columns[j-1].dataIndex=j;
                        columns[j-1].key=j;
                        columns[j-1].width = '20%';
                        // columns[j-1].i = '12.5%';
                        columns[j-1].onCellClick=this.cellChange.bind(this,j);
                        if(this.state.report){
                            columns[j-1].render = (text,item)=>{
                                if(j==3||j==4){
                                    return <div>
                                        {text}<Button icon="edit" shape="circle" onClick={this.showModal.bind(this,j,item)}/>
                                    </div>
                                }else {
                                    if(this.state.edit.edit&&item.i==this.state.edit.i&&j==this.state.edit.j){
                                        return<Input defaultValue={text} onPressEnter={this.Enter.bind(this,j,item)}/>
                                    }else {
                                        return text;
                                    }
                                }
                            }
                        }else {
                            if(j==1||j==2){
                                columns[j-1].render = (text,item)=>{
                                    if(item[`${j}-account`]){
                                        let list = [];
                                        for(let k in item[`${j}-account`]){
                                            let dom = <div key={k}>
                                                <Button type="dashed" onClick={this.clickTag.bind(this,k)}
                                                        className="center genson-margin-top" size="small"
                                                        style={{width:'100%'}}>
                                                    {`${item[`${j}-account`][k]}`}
                                                </Button>
                                            </div>;
                                            list.push(dom);
                                        }
                                        const content = (<div>{list}</div>);
                                        return <div>
                                            {text} <Popover placement="right" content={content} title="账簿查询" trigger="click">
                                            <Button size="small">总账</Button>
                                        </Popover>
                                        </div>
                                    }else {
                                        return text;
                                    }
                                }
                            }else{
                                columns[j-1].render = (text,item)=>{
                                    return <div className="right">{text}</div>
                                }
                            }
                        }
                    }else {
                        //其他项为表格内容
                        table[table.length-1][j]=source[i][j];
                        table[table.length-1]['key']=i+'-'+j;
                        table[table.length-1]['i']=i;
                        table[table.length-1][`${j}-account`]=source[i][`${j}-account`];
                    }
                }
            }
            const option ={
                title:'操作',
                key:'option',
                dataIndex:'option',
                width:'15%',
                render:(text,item)=>{
                    let table = this.state.table;
                    return <Button.Group size="small" >
                        <Button icon="plus-square" title="新增一行" onClick={this.tableOption.bind(this,item,'add')}/>
                        <Button icon="minus-square" title="删除本行" onClick={this.tableOption.bind(this,item,'reduce')}/>
                        <Button icon="up-square" title="上移本行" disabled={item.i==2} onClick={this.tableOption.bind(this,item,'up')}/>
                        <Button icon="down-square" title="下移本行" disabled={item.i==table.length-1} onClick={this.tableOption.bind(this,item,'down')}/>
                    </Button.Group>
                }
            };
            if(this.state.report){
                columns.push(option);
            }
            // //根据返回内容，设置表格内容
            this.setState({
                columns:columns,
                dataSource:table,
                table:editTable,
                loading:false,
            })
        }
        tableOption(item,type){
            let table = this.state.table;
            if(type == 'add'){
                let con = [];
                for(let i in table){
                    if(i == item.i){
                        table[i].map((content,index)=>{
                            if(content){
                                con[index] = "";
                            }
                        });
                        table.splice(Number(i)+1,0,con);
                    }
                }
            }else if(type == 'reduce'){
                table.splice(item.i,1)
            }else if(type=='up'){
                const content = table[item.i-1];
                for(let i in table){
                    if(i == item.i){
                        table[i] = content;
                    }else if(i == item.i-1){
                        table[i] = table[item.i];
                    }
                }
            }else if(type=='down'){
                const content = table[item.i];
                for(let i in table){
                    if(i == item.i){
                        table[i] = table[Number(i)+1];
                    }else if(i == Number(item.i)+1){
                        table[i] = content;
                    }
                }
            }
            const url = {
                type:'report-form/save-form-define',
                method:'FormData',
                Method:'POST',
            };
            let par = {type:reportType};
            table.map((list,i)=>{
                if(list){
                    list.map((con,j)=>{
                        par[`table[${i}][${j}]`] = con;
                    })
                }
            });
            console.log(par);
            let cb = (data)=>{
                this.setState({
                    edit:{
                        i:'',
                        j:'',
                        edit:false
                    },
                    loading:true,
                    modal:{},
                },()=>{
                    this.setTable(data.info);
                });
            };
            Request(par,cb,url);
        }
        searchData(){
            let par = {
                trans_from_date:moment(this.state.date[0]).format('YYYY-MM-D'),
                trans_to_date:moment(this.state.date[1]).format('YYYY-MM-D')
            };
            let list = GetLocalStorage('Const').rpt_combination;
            par.combine = list.split('^').join('&');
            par.is_combine = this.state.check?1:0;
            //根据日期搜索，props含有传入的搜索数据和搜索方法
            this.setState({
                report:false,
                loading:true,
                active:'search'
            },()=>{
                this.props.search(par);
            })
        }
        getProfit(){
            let type = {
                type:'report-form/get-define',
                method:'GET'
            };
            let par = {type:2};
            let cb = (data)=>{
                this.setState({
                    report:true
                },()=>{
                    this.setTable(data.info,true);
                })
            };
            this.setState({
                loading:true,
                active:'definition'
            },()=>{
                Request(par, cb, type);
            });

        }
        handleOk(){
            this.setState({
                confirmLoading: false,
                visible:false,
            });
        }
        openModal(type,value,row,index){
            let newState = {visible:type};
            if(type){//打开模板才传入模板内容
                newState.modal = row;
                let con = {
                    name:row[1],line:row[2],current:row[3],total:row[3]
                };
                newState.modal = con;
                this.setState(newState,()=>{this.props.form.setFieldsValue({'name':this.state.modal.name});});
            }else {
                this.setState(newState);
            }

        }
        hideModal(){
            this.setState({
                modal:{},
                visible:false
            })
        }
        changeFormula(){
            let value = this.state.modal[this.state.modal.j];
            let j = this.state.modal.j;
            let record = this.state.modal;
            let e ={target:{value:value}};
            this.Enter(j,record,e);
        }
        changeDefault(type,value){
            let content = value;
            if(type == 'parameter'){
                content = value.target.value;
            }
            let defaultValue = this.state.submit;
            defaultValue[type] = content;
            this.setState({
                submit:defaultValue
            })
        }
        addModalTable(isSubject){
            let content = this.state.submit;
            let modalTable = this.state.modalTable;
            let modal = this.state.modal;
            let item = {};
            if(isSubject){
                item.OP = content.option;
                item.FUNC = content.master;
                item.ACCT = content.code;
            }else {
                item.OP = '+';
                item.FUNC = content.table;
                item.ACCT = content.parameter;
            }
            let isError = false;
            modalTable.map((con,index)=>{
                if(isSubject&&con.OP == item.OP &&con.FUNC.toLowerCase() == item.FUNC &&con.ACCT == item.ACCT){
                    isError = true;
                    message.error(`${index==0&&con.OP=='+'?'':con.OP}${this.state.master_info[con.FUNC.toLowerCase()]}已存在表格中`)
                }else {

                }
            });
            let test;
            if(item.FUNC.toLowerCase() == 'cell'){
                test = /^[0-9]+(,){1}[0-9]+$/;
            }else if(item.FUNC.toLowerCase() == 'sum'){
                test = /^[0-9]+(,){1}[0-9]+(,){1}[0-9]+(,){1}[0-9]+$/;
            }else {
                test = false;
            }
            if(!item.ACCT||!item.FUNC||!item.OP||(test&&!test.test(item.ACCT))){
                isError = true;
                let msg = !item.FUNC?'缺少公式':'';
                msg += !item.OP?'缺少运算符':'';
                msg += !item.ACCT?'缺少科目/参数':'';
                if(!test.test(item.ACCT)){
                    msg += !test.test(item.ACCT)?'报表取数的参数有误':'';
                }
                message.error(msg)
            }
            if(!isError){
                modalTable.push(item);
                let FContent = '';
                let typeArr = [];
                let valArr = [];
                modalTable.map((formula,index)=>{
                    let nowType = formula.OP+formula.FUNC.toUpperCase();
                    if(typeArr.indexOf(nowType)== -1 || this.state.table_info[formula.FUNC.toLowerCase()]){
                        typeArr.push(nowType);
                        valArr.push(formula.ACCT);
                    }else {
                        valArr[typeArr.indexOf(nowType)] += `,${formula.ACCT}`;
                    }
                });
                typeArr.map((tpItem,index)=>{
                    if(index == 0 && tpItem.indexOf('+')>-1){
                        tpItem = tpItem.split('+')[1];
                    }
                    FContent = FContent.concat(tpItem,'(',valArr[index],')')
                });
                console.log(FContent);
                modal[modal.j] = FContent;
            }
            this.setState({
                modalTable:modalTable,
                modal:modal
            })
        }
        reduceModalTable(item,index){
            let modalTable = this.state.modalTable;
            let modal = this.state.modal;
            modalTable.splice(index,1);
            let FContent = '';
            modalTable.map((formula,index)=>{
                FContent = FContent.concat(index==0&&formula.OP=='+'?'':formula.OP,formula.FUNC.toUpperCase(),`(${formula.ACCT})`)
            });
            modal[modal.j] = FContent;
            this.setState({
                modalTable:modalTable
            })
        }
        changeCheck(e){
            let check = e.target.checked;
            this.setState({
                check:check
            },()=>{
                console.log(check);
            })
        }
        onOpenChange(openDate){
            this.setState({openDate})
        }
        render() {
            const modalTitle = [
                {
                    title:'运算符(+/-)',
                    dataIndex:'OP',
                    key:'OP'
                },
                {
                    title:'报表公式',
                    dataIndex:'FUNC',
                    key:'FUNC',
                    render:(text,item)=>{
                        let con = text.toLowerCase();
                        if(this.state.master_info[con]){
                            return this.state.master_info[con];
                        }else if(this.state.table_info[con]){
                            return this.state.table_info[con];
                        }else {
                            return text;
                        }
                    }
                },
                {
                    title:'科目/参数',
                    dataIndex:'ACCT',
                    key:'ACCT'
                },
                {
                    title:'删除',
                    dataIndex:'delete',
                    key:'delete',
                    render:(text,item,index)=>{
                        return<Button icon="delete" shape="circle" onClick={this.reduceModalTable.bind(this,item,index)}/>
                    }
                },
            ];
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
                        date:[moment(this.state.date[0]).subtract(1, 'month').startOf('month'), moment(this.state.date[1]).subtract(1, 'month').endOf('month')],
                    },
                    to:{
                        title:'往后一个月',
                        icon:'right',
                        date:[moment(this.state.date[0]).add(1, 'month').startOf('month'), moment(this.state.date[1]).add(1, 'month').endOf('month')],
                    }
                },
                {
                    from:{
                        title:'往前一年',
                        icon:'double-left',
                        date:[moment(this.state.date[0]).subtract(1, 'year').startOf('year'), moment(this.state.date[1]).subtract(1, 'year').endOf('year')],
                    },
                    to:{
                        title:'往后一年',
                        icon:'double-right',
                        date:[moment(this.state.date[0]).add(1, 'year').startOf('year'), moment(this.state.date[1]).add(1, 'year').endOf('year')],
                    }
                },
            ];
            return (
                <div className="gen-certificate">
                    <Card title={<h1 className="certificate-title">利润表</h1>}
                          bordered={true}>
                        <Row>
                            <Col xs={6}>
                                日期：<RangePicker value={this.state.date} style={{ width: '80%'}}
                                                open={this.state.openDate}
                                                onOpenChange={this.onOpenChange.bind(this)}
                                                renderExtraFooter={
                                                    ()=>{
                                                        return <div>
                                                            {
                                                                ranges.map((item,key)=>{
                                                                    return<Row key={key} type="flex" justify="space-around">
                                                                        <Col xs={8}>
                                                                            <Button icon={item.from.icon?item.from.icon:null} onClick={this.changeDate.bind(this,item.from.date)} style={{width:'100%'}}>
                                                                                {item.from.title}
                                                                            </Button>
                                                                        </Col>
                                                                        <Col xs={8}>
                                                                            <Button  onClick={this.changeDate.bind(this,item.to.date)} style={{width:'100%'}}>
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
                                                format="YYYY/MM/DD"
                                                onChange={this.changeDate.bind(this)}/>
                            </Col>
                            <Col xs={2}>
                                <Button icon="search" type={this.state.active=='search'?'primary':'default'} onClick={this.searchData.bind(this)}>查询</Button>
                            </Col>
                            <Col xs={2} offset={1}>
                                <Button type={this.state.active=='definition'?'primary':'default'} onClick={this.getProfit.bind(this)}>报表定义</Button>
                            </Col>
                            <Col xs={3} offset={1}>
                                <Button disabled>下载XML报表</Button>
                            </Col>
                            <Col xs={5} offset={1}>
                                <Checkbox defaultChecked={this.state.check} onChange={this.changeCheck.bind(this)}>{this.resetFid()}</Checkbox>
                            </Col>
                        </Row>
                        <Row style={{display:this.state.report?'block':'none'}} className="genson-margin-top">
                            <Col xs={8}>
                                <h2 >
                                    利润表：报表定义检查
                                </h2>
                            </Col>
                            <Col xs={4} offset={12}>
                                <Tag color="#f50" className="center" style={{width:'100%'}}>按下Enter提交修改内容</Tag>
                            </Col>
                        </Row>
                        <Row className="certificate-table" style={{marginTop:'10px'}}>
                            <Table bordered columns={this.state.columns} scroll={{y:rtTableHeight()}}
                                   pagination={false} loading={this.state.loading} size="small"
                                   dataSource={this.state.dataSource}/>
                        </Row>
                        <Modal visible={this.state.visible} width="860"
                               title={`公式:  ${this.state.modal[this.state.modal.j]}`}
                               onOk={this.changeFormula.bind(this)}
                               onCancel={this.hideModal.bind(this)}>
                            <h2>当前报表公式：</h2>
                            <Table columns={modalTitle} pagination={false} className="certificate-table"
                                   bordered dataSource={this.state.modalTable} size="small"/>
                            <h2 className="center genson-margin-top">报表公式添加</h2>
                            <Row>
                                <Col xs={12}>
                                    <h3 className="center">---  科目取数  ---</h3>
                                    <Row className="genson-margin-top">
                                        <Col xs={4} offset={2}>
                                            <span style={{lineHeight:'2.5rem'}}>科目：</span>
                                        </Col>
                                        <Col xs={18}>
                                            <Select className="genson-input" defaultValue={this.state.submit.code}
                                                    onChange={this.changeDefault.bind(this,'code')} showSearch
                                                    style={{width:'100%'}}>
                                                {
                                                    this.renOption(this.state.option_select,-1)
                                                }
                                            </Select>
                                        </Col>
                                    </Row>
                                    <Row className="genson-margin-top">
                                        <Col xs={4} offset={2}>
                                            <span style={{lineHeight:'2.5rem'}}>运算符：</span>
                                        </Col>
                                        <Col xs={18}>
                                            <Select className="genson-input" defaultValue={this.state.submit.option}
                                                    onChange={this.changeDefault.bind(this,'option')}
                                                    style={{width:'100%'}}>
                                                <Option key="+" value="+">+</Option>
                                                <Option key="-" value="-">-</Option>
                                            </Select>
                                        </Col>
                                    </Row>
                                    <Row className="genson-margin-top">
                                        <Col xs={4} offset={2}>
                                            <span style={{lineHeight:'2.5rem'}}>取数类型：</span>
                                        </Col>
                                        <Col xs={18}>
                                            <Select className="genson-input"
                                                    onChange={this.changeDefault.bind(this,'master')}
                                                    defaultValue={this.state.submit.master}
                                                    style={{width:'100%'}}>
                                                {
                                                    this.state.master_select.map((item)=>{
                                                        return<Option key={item.key} value={item.key}>{item.value}</Option>;
                                                    })
                                                }
                                            </Select>
                                        </Col>
                                    </Row>
                                    <Row className="genson-margin-top">
                                        <Col xs={4} offset={10}>
                                            <Button style={{width:'100%'}} onClick={this.addModalTable.bind(this,true)}>添加</Button>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col xs={12}>
                                    <h3 className="center">---  报表取数  ---</h3>
                                    <Row className="genson-margin-top">
                                        <Col xs={4} offset={2}>
                                            <span style={{lineHeight:'2.5rem'}}>取数类型：</span>
                                        </Col>
                                        <Col xs={18}>
                                            <Select className="genson-input" defaultValue={this.state.submit.table}
                                                    onChange={this.changeDefault.bind(this,'table')}
                                                    style={{width:'100%'}}>
                                                {
                                                    this.state.table_select.map((item)=>{
                                                        return<Option key={item.key} value={item.key}>{item.value}</Option>;
                                                    })
                                                }
                                            </Select>
                                        </Col>
                                    </Row>
                                    <Row className="genson-margin-top">
                                        <Col xs={4} offset={2}>
                                            <span style={{lineHeight:'2.5rem'}}>参数：</span>
                                        </Col>
                                        <Col xs={18}>
                                            <Input className="genson-input"
                                                   defaultValue={this.state.submit.parameter}
                                                   onChange={this.changeDefault.bind(this,'parameter')}
                                                   placeholder={this.state.submit.table=='cell'?'2,2':'2,2,2,2'}
                                                   style={{width:'100%'}} />
                                        </Col>
                                    </Row>
                                    <Row className="genson-margin-top">
                                        <Col offset={2}>参数说明：1.从表格取数:(行,列).2.取表格累计数:(起始行,起始列,结束行,结束列)</Col>
                                    </Row>
                                    <Row className="genson-margin-top">
                                        <Col xs={4} offset={10}>
                                            <Button style={{width:'100%'}} onClick={this.addModalTable.bind(this,false)}>添加</Button>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Modal>

                    </Card>
                </div>
            );
        }
    }
    const ProfitTable = Form.create()(Profit);
    module.exports = ProfitTable;
})();