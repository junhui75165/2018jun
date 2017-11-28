/**
 * Created by junhui on 2017/6/12.
 * 自定义报表文件
 */
(function () {
    'use strict';
    let React = require('react');
    let moment = require('moment');
    let {Request, } = require('../request');
    let Global = require('../Global');
    let {  Col, Row ,Button,Table,message,Form,Select,
        DatePicker,Popover,Input,InputNumber,Tag,Modal,Icon } = require('antd');
    const {  RangePicker } = DatePicker;
    const { Option, OptGroup } = Select;
    let {rtTableHeight,objToArr,getDateVnum,GetLocalStorage} = require('./../tool');
    const reportType = 4;
    class DataInspection extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                date:[moment().startOf('month'), moment().endOf('month')],//起始时间
                report:false,
                loading:false,
                edit:{i:'',j:'',edit:false},
                dataSource:[],
                table:[],
                modal:{},
                modalTable:[],
                submit:{option:'+',parameter:''},
                master_select:[],
                master_info:{},
                table_select:[],
                table_info:{},
                option_select:[],
                visible:false,
                init:{
                    copyType:1,
                    blank:[20,4],
                    name:''
                },
                active:'search',//search,definition激活状态
                openDate:false,
                dateVnum:{}
            };
        }
        changeDate(date){
            //设置日期
            this.setState({
                date:date,
                openDate:false
            });
        }

        componentDidMount() {
            this.getVnum();
            this.getSelect();
            this.getTableSelect();
            this.getCodeList();
        }
        getVnum(){
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
        getTableName(){
            //获取自定义报表标题。
            const type = {
                type:'report-form/get-custom-title',
                method:'FormData',
                Method:'POST'
            };
            let cb = (data)=>{
                console.log('init table title',data.info);
                let init = this.state.init;
                init.name = data.info;
                this.setState({
                    init:init,
                })
            };
            Request({},cb,type);
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
        searchData(){
            const type = {
                type:'report-form/custom-rep-view',
                method: 'FormData',
                Method: 'POST'
            };
            let par = {
                trans_from_date:moment(this.state.date[0]).format('YYYY-MM-D'),
                trans_to_date:moment(this.state.date[1]).format('YYYY-MM-D')
            };
            //根据日期搜索，props含有传入的搜索数据和搜索方法
            let cb = (data)=>{
                this.setState({
                    report:false,
                },()=>{
                    this.setTable(data.info);
                })
            };
            this.setState({
                active:'search',
                loading:true
            },()=>{
                Request(par,cb,type);
            });
        }
        getCustomize(){
            let type = {
                type:'report-form/get-define',
                method:'GET'
            };
            let par = {type:reportType};
            let cb = (data)=>{
                this.setState({
                    loading:false,
                    report:true,
                },()=>{
                    this.setTable(data.info);
                })
            };
            this.getTableName();
            this.setState({
                loading:true,
                active:'definition'
            },()=>{
                Request(par, cb, type);
            });
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
        hideModal(){
            this.setState({
                modal:{},
                visible:false
            })
        }
        parseFormula(content,cb){
            const type = {
                type:'report-form/parse-formula',
                method:'GET'
            };
            let par = {formula:content};
            Request(par,cb,type);
        }
        Enter(j,record,e){
            let value = e.target?e.target.value:e;
            let isReq = false;
            const type = {
                type:'report-form/save-form-define',
                method:'FormData',
                Method:'POST',
            };
            let par = {type:reportType};
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
        cellChange(j,record, event){
            if(this.state.report){
                this.setState({
                    edit:{
                        i:record.i,
                        j:j,
                        edit:true
                    }
                });
            }
        }
        setTable(source){
            //查询表格
            let columns = [];
            let table = [];
            let editTable = [];
            let beg = false;
            let end = false;
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
                        columns[j-1].width = '10%';
                        // columns[j-1].i = '12.5%';
                        columns[j-1].onCellClick=this.cellChange.bind(this,j);
                        if(this.state.report){
                            columns[j-1].render = (text,item)=>{
                                if(this.state.edit.edit&&item.i==this.state.edit.i&&j==this.state.edit.j){
                                    return<Input defaultValue={text} onPressEnter={this.Enter.bind(this,j,item)}/>
                                }else {
                                    return <div>
                                        {text}<Button icon="edit" shape="circle" onClick={this.showModal.bind(this,j,item)}/>
                                    </div>;
                                }
                            }
                        }else {
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
                                }else{
                                    return text;
                                }
                            }
                        }
                    }else {
                        //其他项为表格内容
                        table[table.length-1][j]=source[i][j];
                        table[table.length-1]['key']=i+'-'+j;
                        table[table.length-1]['i']=i;
                        if(source[i][`${j}-account`]){
                            table[table.length-1][`${j}-account`]=source[i][`${j}-account`];
                        }
                    }
                }
            }
            const option ={
                title:'操作',
                key:'option',
                dataIndex:'option',
                width:'8%',
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
            this.setState({
                columns:columns,
                dataSource:table,
                table:editTable,
                loading:false
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
            if(!item.ACCT||!item.FUNC||!item.OP||test){
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
        changeCopyValue(type,val){
            let init = this.state.init;
            let value;
            switch (type){
                case 'copyType':
                    value = val;
                    init.copyType = value;
                    break;
                case 'x':
                    value = val;
                    init.blank[1] = value;
                    break;
                case 'y':
                    value = val;
                    init.blank[0] = value;
                    break;
                case 'name':
                    value = val.target.value;
                    init.name = value;
                    break;
            }
            this.setState({
                init:init
            })
        }
        initReport(method){
            if(method == 'blank'){
                //自定义报表生成一份空白报表
                const type = {
                    type:'report-form/save-form-define',
                    method:'FormData',
                    Method:'POST',
                };
                let par = {type:reportType};
                for(let i=1;i<=this.state.init.blank[0];i++){
                    for(let j=1;j<=this.state.init.blank[1];j++){
                        par[`table[${i}][${j}]`] = '';
                    }
                }
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
                        message.success(`成功初始化一份${this.state.init.blank[0]}*${this.state.init.blank[1]}的空白报表`);
                        this.setTable(data.info);
                    });
                };
                Request(par,cb,type)
            }
            else if(method == 'copy'){
                //自定义复制利润表或资产负债表
                const type ={
                    type:'report-form/copy-custom',
                    method:'FormData',
                    Method:'POST',
                };
                let par = {rpt_type_id:this.state.init.copyType};
                let cb = (data)=>{
                    message.success('已成功复制！');
                    this.setTable(data.info);
                };
                Request(par,cb,type);
            }
            else if(method == 'name'){
                //设置自定义报表名称
                const type = {
                    type:'report-form/set-custom-title',
                    method:'FormData',
                    Method:'POST'
                };
                let par = {rpt_title:this.state.init.name};
                let cb = (data)=>{
                    message.success(data.info);
                };
                Request(par,cb,type);
            }
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
                <div>
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
                            <Button type={this.state.active=='definition'?'primary':'default'} onClick={this.getCustomize.bind(this)}>报表定义</Button>
                        </Col>
                        <Col xs={3} offset={1}>
                            <Button disabled>下载XML报表</Button>
                        </Col>
                    </Row>
                    <div style={{display:this.state.report?'block':'none'}} >
                        <Row className="genson-margin-top" type="flex" justify="space-between">
                            <Col xs={16} lg={6} >
                                <h2 >
                                    自定义报表：报表定义检查
                                </h2>
                            </Col>
                            <Col xs={8} md={6} lg={4}>
                                <Tag color="#f50" className="center" style={{width:'100%'}}>按下Enter提交修改内容</Tag>
                            </Col>
                        </Row>
                        <h3 className="genson-margin-top">报表初始化操作</h3>
                        <Row className="genson-margin-top">
                            <Col xs={8} md={5} lg={4}>从已有报表复制报表定义：</Col>
                            <Col xs={8} md={5} lg={4}>
                                <Select defaultValue={this.state.init.copyType} style={{width:'100%'}}
                                        onChange={this.changeCopyValue.bind(this,'copyType')} className="genson-input">
                                    <Option value={1}>资产负债表</Option>
                                    <Option value={2}>利润表</Option>
                                </Select>
                            </Col>
                            <Col xs={4} md={3} lg={2} offset={1}>
                                <Button onClick={this.initReport.bind(this,'copy')}>复制并初始化</Button>
                            </Col>
                        </Row>
                        <Row className="genson-margin-top">
                            <Col xs={8} md={5} lg={4}>初始化为一个空白报表：</Col>
                            <Col xs={5} md={4} lg={3}>行数：
                                <InputNumber className="genson-input" style={{width:'50%'}}
                                             onChange={this.changeCopyValue.bind(this,'y')}
                                             defaultValue={this.state.init.blank[0]}/>
                            </Col>
                            <Col xs={5} md={4} lg={3}>列数：
                                <InputNumber className="genson-input" style={{width:'50%'}}
                                             onChange={this.changeCopyValue.bind(this,'x')}
                                             defaultValue={this.state.init.blank[1]}/>
                            </Col>
                            <Col xs={3} md={2} lg={2}>
                                <Button onClick={this.initReport.bind(this,'blank')}>并初始化</Button>
                            </Col>
                        </Row>
                        <Row className="genson-margin-top">
                            <Col xs={4} md={3} lg={2}>报表名称：</Col>
                            <Col xs={6} md={5} lg={4}>
                                <Input style={{width:'85%'}} className="genson-input"
                                       value={this.state.init.name}
                                       onChange={this.changeCopyValue.bind(this,'name')}/>
                            </Col>
                            <Col xs={3} md={2} lg={2}>
                                <Button onClick={this.initReport.bind(this,'name')}>设置报表名称</Button>
                            </Col>
                        </Row>
                    </div>
                    <Row className="certificate-table" style={{marginTop:'10px'}}>
                        <Table bordered columns={this.state.columns} scroll={{y:rtTableHeight(this.state.report?180:0)}}
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
                                        <Select className="genson-input"
                                                optionFilterProp="title"
                                                optionLabelProp="title"
                                                defaultValue={this.state.submit.code}
                                                onChange={this.changeDefault.bind(this,'code')}
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

                </div>
            );
        }
    }
    module.exports = DataInspection;

})();