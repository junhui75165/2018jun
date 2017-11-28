/**
 * Created by junhui on 2017/4/26.
 * 现金流量表
 */
(function () {
    'use strict';
    let React = require('react');
    let Global = require('../Global');
    let moment = require('moment');
    let {Request} = require('../request');
    let { Card, Col, Row ,Button,Table,Input ,Tag,Modal,
        Spin,Select,DatePicker,Form ,message,Alert,Menu,Icon } = require('antd');
    const { Option,OptGroup } = Select;
    const SubMenu = Menu.SubMenu;
    const FormItem = Form.Item;
    const {  RangePicker } = DatePicker;
    let {toThousands,getDateVnum,GetLocalStorage} = require('./../tool');
    const formItemLayout = {
        labelCol: {
            xs: { span: 24 },
            sm: { span: 6 },
        },
        wrapperCol: {
            xs: { span: 24 },
            sm: { span: 14 },
        },
    };
    class Cash extends React.Component{
        constructor(props){
            /**初始化数据**/
            super(props);
            this.state = {
                date:[moment().startOf('month'), moment().endOf('month')],//日期始终时间
                visible:false,//是否显示模板
                confirmLoading:false,//模板内容提及loading
                selectId:'',//下拉选择值
                modal:{subject:'',name:'',content:'',select:'',key:''},//模板内容
                content:<Spin tip="加载中..."/>,//表格内容
                columns:[],
                dataSource:[],
                active:'search',//search,definition,analysis,special激活状态
                checkInfo:{},
                checkVisible:false,
                loading:true,
                dateVnum:{vnum:'',date_:moment().format('YYYY-MM-D')},
                list:[
                    {
                        options_name:{},
                        options:[{}]
                    }
                ],
                chart:[],
                error:false,
                errorList:[],
                Delete:[],
                Add:[],
                openDate:false
            }
        }

        componentDidMount() {
            // 初始化表格
            this.setTable(this.props.data);
            // 获取下拉列表
            this.getSelectItem();
            let cb = (data)=>{
                this.setState({
                    date: [moment(data.date_).startOf('month'),
                        moment(data.date_).endOf('month')],
                    dateVnum:data
                },()=>{
                    this.getSelectList();
                    console.log(this.state.dateVnum)
                });
            };
            getDateVnum(cb);
        }
        getSelectItem(){
            let type = {
                type:'report-form/get-cash-flow-statement-define-options',
                method:'GET'
            };
            let cb = (data)=>{
                let item = [];
                for(let i in data.info){
                    let con = {};
                    con.key = i;
                    con.title = data.info[i];
                    item.push(con);
                }
                console.log('getSelectItem',item);
                this.setState({
                    selectItem:item
                },(e)=>{
                    console.log(e,'there is cb for getSelectItem')
                });
            };
            Request({}, cb, type);
        }
        componentWillReceiveProps(nextProps, nextContext) {
            if(!this.state.visible){//选择下拉项会执行该函数，通过判断模块是否显示执行
                //接收返回数据重置表格内容
                this.setTable(nextProps.data);
            }
        }
        changeDate(date){
            //设置日期
            this.setState({
                date:date,
                openDate:false
            });
        }
        setTable(source){
            //查询表格
            let columns = [];
            let table = [];
            for(let i in source){
                if(i>1){
                    table[table.length] = {};
                }
                for(let j in source[i]){
                    if(i==1){
                        // 返回数据第一项为表头
                        columns[j-1] = {};
                        columns[j-1].title=source[i][j];
                        columns[j-1].dataIndex=j;
                        columns[j-1].key=j;
                        columns[j-1].render=(text)=>{
                            if(columns[j-1].title == '金额'){
                                return <div className="right">{text}</div>
                            }else {
                                return text;
                            }
                        };
                    }else {
                        //其他项为表格内容
                        table[table.length-1][j]=source[i][j];
                        table[table.length-1]['key']=i+'-'+j;
                    }
                }
            }
            //根据返回内容，设置表格内容
            // let content = <Table bordered columns={columns} dataSource={table}/>;
            this.setState({
                // content:content,
                loading:false,
                columns:columns,
                dataSource:table
            })
        }
        getAnalysis(){
            const url = {
                type:'report-form/analysis-cash-flow',
                method:'FormData',
                Method:'POST'
            };
            let par ={
                trans_from_date:moment(this.state.date[0]).format('YYYY-MM-D'),
                trans_to_date:moment(this.state.date[1]).format('YYYY-MM-D'),
            };
            let columns = [
                {
                    title:'序号',
                    dataIndex:'index',
                    key:'index',
                    render:(text,item)=>{
                        if(item.isTitle){
                            return <a onClick={this.showModal.bind(this,item)} title="点击查看凭证">{text}</a>
                        }else {
                            return text;
                        }
                    }
                },
                {
                    title:'凭证号',
                    dataIndex:'id',
                    key:'id',
                    render:(text,item)=>{
                        if(item.isTitle){
                            return '';
                        }else {
                            return text;
                        }
                    }
                },
                {
                    title:'日期',
                    dataIndex:'date',
                    key:'date'
                },
                {
                    title:'内容',
                    dataIndex:'memo_',
                    key:'memo_'
                },
                {
                    title:'科目',
                    dataIndex:'account',
                    key:'account'
                },
                {
                    title:'借方',
                    dataIndex:'debit',
                    key:'debit',
                    render:(text,item)=>{
                        if(item.amount>0){
                            item.debit = Number(item.amount).toFixed(2);
                        }else {
                            item.debit = '';
                        }
                        return <div className="right">{toThousands(item.debit)}</div>;
                    }
                },
                {
                    title:'贷方',
                    dataIndex:'lender',
                    key:'lender',
                    render:(text,item)=>{
                        if(item.amount<0){
                            item.lender = Number(-item.amount).toFixed(2);
                        }else {
                            item.lender = '';
                        }
                        return <div className="right">{toThousands(item.lender)}</div>;
                    }
                },
                {
                    title:'描述',
                    dataIndex:'desc',
                    key:'desc',
                },
            ];
            let table = [];
            let cb = (data)=>{
                let itemIndex = 0;
                for(let i in data.info){
                    data.info[i].map((item,index)=>{
                        let con = {};
                        if(index == 0){
                            con.index = item;
                            con.key = i;
                            con.id = i;
                            con.isTitle = true;
                        }else {
                            itemIndex++;
                            con.index = itemIndex;
                            con.key = item.type_id+'_'+index;
                            con.account = item.account;
                            con.amount = item.amount;
                            con.date = item.date;
                            con.desc = item.desc;
                            con.memo_ = item.memo_;
                            con.type_id = item.vnum;
                            con.vnum = item.vnum;
                            con.id = item.type_id;
                        }
                        table.push(con);
                    });
                }
                this.setState({
                    loading:false,
                    columns:columns,
                    dataSource:table
                })
            };
            this.setState({
                active:'analysis',
                loading:true
            },()=>{
                Request(par,cb,url);
            });
        }
        changeType(item,type){
            console.log(item);
            let ty = {
                type: 'refs/view',
                method: 'GET',
            };
            let params = {
                id:item.id,
            };
            let cb = (data) => {
                if(data.code == 0){
                    switch (type){
                        case 'edit':
                            this.props.initCertificate(data.info,false,true);
                            break;
                        case  'red':
                            this.props.initCertificate(data.info,true);
                            break;
                        case  'copy':
                            this.props.initCertificate(data.info);
                            break;
                    }
                }else {
                    message.error(data.message);
                }
            };
            Request(params,cb,ty);
        }
        hideModal(type){
            if(type=='print'){
                window.print();
            }else {
                this.setState({
                    checkVisible:false
                })
            }
        }
        showModal(item){
            let checkLabel = [
                {
                    title: '业务号',
                    dataIndex: 'id',
                    key: 'id',
                },
                {
                    title: '凭证号',
                    dataIndex: 'reference',
                    key: 'reference',
                },
                {
                    title: '日期',
                    dataIndex: 'date_',
                    key: 'date_',
                },
                {
                    title:'编辑',
                    dataIndex: 'edit',
                    render:(text, record, index)=>{
                        return<Button shape="circle" icon="edit" onClick={this.changeType.bind(this,record,'edit')}/>
                    }
                },
                {
                    title:'红冲',
                    dataIndex: 'red',
                    render:(text, record, index)=>{
                        return<Button icon="close-circle" type="danger" shape="circle" onClick={this.changeType.bind(this,record,'red')}/>
                    }
                },
                {
                    title:'复制',
                    dataIndex: 'copy',
                    render:(text, record, index)=>{
                        return<Button shape="circle" icon="copy" onClick={this.changeType.bind(this,record,'copy')}/>
                    }
                },
            ];
            let checkTable = [];
            let listLabel = [
                {
                    title:'科目编号',
                    dataIndex: 'account',
                    key: 'account',
                },
                {
                    title:'科目名称',
                    dataIndex: 'account_name',
                    key: 'account_name',
                },
                {
                    title:'币别',
                    dataIndex: 'curr_code',
                    key: 'curr_code',
                },
                {
                    title:'借方',
                    dataIndex: 'debit',
                    key: 'debit',
                    render:(text)=>{
                        return <div className="right">{toThousands(text)}</div>
                    }
                },
                {
                    title:'贷方',
                    dataIndex: 'lender',
                    key: 'lender',
                    render:(text)=>{
                        return <div className="right">{toThousands(text)}</div>
                    }
                },
                {
                    title:'摘要',
                    dataIndex: 'memo_',
                    key: 'memo_',
                },
            ];
            let listTable = [];
            let other =[
                {
                    title:'原币',
                    dataIndex: 'usd',
                    key: 'usd',
                    render:(text,item)=>{
                        let value = Math.abs(item.amount/item.rate);
                        if(String(value).indexOf('.')>-1){
                            value = value.toFixed(2);
                        }
                        if(item.rate==0){
                            return '';
                        }else {
                            return <div className="right">{toThousands(value)}</div>;
                        }
                    }
                },
                {
                    title:'汇率',
                    dataIndex: 'rate',
                    key: 'rate',
                    render:(text)=>{
                        if(text == 0){
                            return ''
                        }else {
                            return text;
                        }
                    }
                },
                {
                    title:'数量',
                    dataIndex: 'qty',
                    key: 'qty',
                    render:(text)=>{
                        if(text == 0){
                            return ''
                        }else {
                            return text;
                        }
                    }
                },
                {
                    title:'单价',
                    dataIndex: 'price',
                    key: 'price',
                    render:(text)=>{
                        return <div className="right">{toThousands(text)}</div>
                    }
                },];
            let type = {
                type: 'refs/view',
                method: 'GET',
            };
            let params = {
                id:item.id,
            };
            let cb = (data) => {
                if (data.code == 0) {
                    console.log(data.info);
                }
                let showUsd = false;
                let showQty = false;
                let Usd = other[0];
                let Rate = other[1];
                let Qty = other[2];
                let Price = other[3];
                checkTable.push(data.info.Refs);
                data.info.GlTrans.map((con,i)=>{
                    let rate = con.rate==0?1:con.rate;
                    let negative = con.negative;
                    if(negative==0){
                        con.debit = con.amount>0?con.amount:'';
                        con.lender = con.amount<0?-1*con.amount:'';
                    }else {
                        con.debit = con.amount<0?con.amount:'';
                        con.lender = con.amount>0?-1*con.amount:'';
                    }
                    con.amount = con.amount<0?-con.amount:con.amount;
                    if(con.price>0){
                        showQty = true;
                    }
                    if(GetLocalStorage('Const').curr_default&&con.curr_code&&GetLocalStorage('Const').curr_default!=con.curr_code){
                        showUsd = true;
                    }
                });
                if(showQty){
                    listLabel.splice(3,0,Qty,Price);
                }
                if(showUsd){
                    listLabel.splice(3,0,Usd,Rate);
                }
                listTable = data.info.GlTrans;
                this.setState({
                    checkVisible:true,
                    checkInfo:{topLabel:checkLabel,topTable:checkTable,contentLabel:listLabel,contentTable:listTable}
                });
            };
            Request(params,cb,type);
        }

        openModal(type,value,row,index){
            let newState = {visible:type};
            if(type){//打开模板才传入模板内容
                newState.modal = row;
                this.setState(newState,()=>{console.log(this.state.modal)});
            }else {
                this.props.form.resetFields();
                this.setState(newState);
            }
        }
        handleOk(){
            //异步关闭，提交表单完成confirmLoading设置false
            this.setState({
                confirmLoading: true,
            });
            let type = {
                type: 'report-form/cash-flow-statement-set-acct',
                method:'FormData',
                Method:'POST'
            };
            let par = {
                acct:this.state.modal.subject,
                attr:this.state.selectId
            };
            let cb = (data)=>{
                console.log(data);
                if(data.code == 0){
                    this.setState({
                        confirmLoading: false,
                        visible:false,
                    });
                    //提交后更新表格内容
                    this.reportForm();
                }else {
                    //错误提示
                    message.error(data.message)
                }
            };
            Request(par,cb,type);
        }
        searchData(){
            let par = {
                trans_from_date:moment(this.state.date[0]).format('YYYY-MM-D'),
                trans_to_date:moment(this.state.date[1]).format('YYYY-MM-D')
            };
            // let list = GetLocalStorage('Const').rpt_combination;
            // par.combine = list.split('^').join('&');
            // par.is_combine = this.state.check?1:0;
            //根据日期搜索，props含有传入的搜索数据和搜索方法
            this.setState({
                active:'search',
                loading:true,
            },()=>{
                this.props.search(par);
            });
        }
        reportForm(){
            let type = {
                type: 'report-form/get-cash-flow-statement-define',
                method: 'GET',
            };
            let par = {
                type:'1'
            };
            let callback = (data) => {
                if(data.code == 0){
                    this.reportTable(data.info.list);
                    if(data.info.error.length>0){
                        this.setState({
                            loading:false,
                            error:true,
                            errorList:data.info.error
                        })
                    }else {
                        this.setState({error:false})
                    }
                }
            };
            this.setState({
                active:'definition',
                loading:true
            },()=>{
                Request(par, callback, type);
            });
        }
        setSpecial(){
            this.setState({
                active: 'special',
            },()=>{
                this.getSpDef();
            });
        }
        getSpDef(success,faile){
            /********获取特殊科目默认值**********/
            const url = {
                type:'report-form/get-cash-specail-statement-define',
                method:'FormData',
                Method:'POST'
            };
            let cb = (data)=>{
                let state = this.state;
                state.list = data.info;
                data.info.map((item)=>{
                    state[item.options_name.code] = item.options[0].account_code;
                });
                this.setState(state,()=>{
                    if(success){
                        success('重置成功！')
                    }
                })
            };
            Request({},cb,url);
        }
        reportTable(data){
            //报表定义，重置表格内容
            let columns = [
                {
                    title:'科目',
                    key:'subject',
                    dataIndex:'subject',
                },
                {
                    title:'科目名称',
                    key:'name',
                    dataIndex:'name',
                },
                {
                    title:'现金流量表',
                    key:'content',
                    dataIndex:'content',
                },
                {
                    title:'编辑',
                    key:'edit',
                    dataIndex:'edit',
                    render:(value, row, index) => {
                        return <div>
                            <Button icon="edit" shape="circle" onClick={this.openModal.bind(this,true,value,row,index)}/>
                        </div>
                    }
                },
            ];
            let table = [];
            data.map((item,index)=>{
                let con = {};
                con.subject = item['0'];
                con.name = item['1'];
                con.content = item['2'];
                con.select = item['3'];
                con.key = item['0'];
                table.push(con);
            });
            this.setState({
                loading:false,
                columns:columns,
                dataSource:table
            })
        }
        changeSelect(val){
            // 设置选择项
            this.setState({
                selectId:val
            })
        }
        changeValue(key,value,e){
            let item = {};
            item[key] = value;
            this.setState(item)
        }
        setCashItem(type,name,id,index,key){
            let {list,Delete,Add} = this.state;
            if(type == 'delete'){
                Delete[index] = Delete[index]?Delete[index]:[];
                list[index].options.splice(key,1);
                if(Delete[index].indexOf(id)==-1){
                    Delete[index].push(id);
                    this.setState({Delete,list})
                }
            }else {
                this.getItemInfo(name,type,id,index);
            }
        }
        getSelectList(){
            const url = {
                type:'tree/get-master-tree',
                method:'GET',
            };
            let cb = (data)=>{
                this.setState({chart:data.info});
            };
            Request({},cb,url);
        };
        getItemInfo(name,type,id,index){
            const url = {
                type:'report-form/cash-specail-statement-set-acct',
                method:'FormData',
                Method:'POST'
            };
            let cb = (data)=>{
                message.success('添加成功！');
                this.getSpDef();
            };
            let par = {
                acct_list_name:name,
                command_type:'add'
            };
            par[`accts[0]`] = id;
            Request(par,cb,url);
            // const url = {
            //     type:'chart-master/info',
            //     method:'GET'
            // };
            // let par = {id};
            // let cb = (data)=>{
            //     let Add = this.state.Add;
            //     let list = this.state.list;
            //     let item = {
            //         account_name:data.info.account_code+' - '+data.info.account_name,
            //         account_code:data.info.account_code
            //     };
            //     list[index].options.push(item);
            //     Add[index] = Add[index]?Add[index]:[];
            //     if(Add[index].indexOf(id)==-1){
            //         Add[index].push(id);
            //         this.setState({Add})
            //     }
            // };
            // Request(par,cb,url);
        }
        resetItem(type){
            let promise = new Promise((success,faile)=>{
                this.getSpDef(success,faile);
            });
            promise.then((success)=>{
                message.success(success);
            },(faile)=>{

            });
        }
        delItem(type,index){
            const url = {
                type:'report-form/cash-specail-statement-set-acct',
                method:'FormData',
                Method:'POST'
            };
            let cb = (data)=>{
                message.success('删除成功！');
                let Delete = this.state.Delete;
                Delete[index] = [];
                this.setState({Delete},()=>{
                    this.getSpDef();
                });
            };
            let par = {
                acct_list_name:type,
                command_type:'delete'
            };
            this.state.Delete[index].map((id,i)=>{
                par[`accts[${i}]`] = id;
            });
            console.log('del',par);
            Request(par,cb,url);
        }
        resetDef(){
            const url = {
                type:'report-form/reset-cash-specail-statement-define',
                method:'POST'
            };
            let cb = (data) =>{
                message.success('重置成功！');
                this.reportForm();
            };
            Request({},cb,url);
        }
        renOption(list,level){
            level++;
            let ren = list.map((data1)=>{
                data1.id = data1.account_code||'';
                data1.name = data1.account_name;
                if(data1.open){
                    return <OptGroup key={data1.id} label={<div style={{textIndent:(level)*0.75+'rem'}}>
                        {data1.id+' - '+data1.name}</div>}>
                        {
                            data1.children.map((data2)=>{
                                data2.id = data2.account_code||'';
                                data2.name = data2.account_name;
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
        toggleCollapsed () {
            this.setState({
                collapsed: !this.state.collapsed,
            });
        }
        onOpenChange(openDate){
            this.setState({openDate})
        }
        render() {
            const { getFieldDecorator } = this.props.form;
            const _this = this;
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
                    <Card title={<h1 className="certificate-title">现金流量表</h1>}
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
                                <Button type={_this.state.active=='search'?'primary':'default'}
                                        icon="search" onClick={this.searchData.bind(this)}>
                                    查询
                                </Button>
                            </Col>
                            <Col xs={2} offset={1}>
                                <Button type={_this.state.active=='definition'?'primary':'default'} onClick={this.reportForm.bind(this)}>报表定义</Button>
                            </Col>
                            <Col xs={3} offset={1}>
                                <Button type={_this.state.active=='special'?'primary':'default'} onClick={this.setSpecial.bind(this)}>特殊科目定义</Button>
                            </Col>
                            <Col xs={3} offset={1}>
                                <Button disabled>下载XML报表</Button>
                            </Col>
                            <Col xs={2} offset={1}>
                                <Button type={_this.state.active=='analysis'?'primary':'default'} onClick={this.getAnalysis.bind(this)}>分析</Button>
                            </Col>
                        </Row>
                        <Alert style={{display:this.state.error&&(this.state.active=='definition')?'block':'none'}}
                               message="错误提示" className="genson-margin-top"
                               description={
                                   <div>
                                       {this.state.errorList.map((item,index)=>{
                                           return <div className="genson-margin-top">{index+1}:{item}</div>
                                       })}
                                   </div>
                               }
                               type="error"
                               showIcon
                        />
                        <Row className="certificate-table" style={{marginTop:'10px',display:_this.state.active!='special'?'block':'none'}}>
                            {/*{this.state.content}*/}
                            <Table bordered columns={this.state.columns} pagination={false}
                                   defaultExpandAllRows={true} size="small"
                                   dataSource={this.state.dataSource} loading={this.state.loading}/>
                            <div className="genson-margin-top" style={{display:_this.state.active=='definition'?'block':'none'}}>
                                <Button icon="sync" type="primary" className="genson-block-center" onClick={this.resetDef.bind(this)}>
                                    重置所有定义为默认值
                                </Button>
                            </div>
                        </Row>
                        <Row style={{display:_this.state.active=='special'?'block':'none'}}>
                            <h2 className="center genson-margin-top">现金流量表特殊科目定义</h2>
                            {
                                _this.state.list.map((item,index)=>{
                                    return <div key={item.options_name.code} className="genson-margin-top">
                                        <h2>{item.options_name.name}</h2>
                                        <div className="genson-margin-top">
                                            <Select className="genson-input"
                                                    showSearch
                                                    onChange={this.changeValue.bind(this,item.options_name.code)}
                                                    value={this.state[item.options_name.code]||(item.options[0]?item.options[0].account_code:'')}
                                                    style={{ width: '100%'}}
                                                    notFoundContent="没有匹配的选项">
                                                {this.renOption(this.state.chart,-1)}
                                            </Select>
                                            <Button style={{marginLeft:'1rem'}}
                                                    onClick={this.setCashItem.bind(this,'add',item.options_name.code,this.state[item.options_name.code],index)}>
                                                添加
                                            </Button>
                                        </div>
                                        <div>
                                            {
                                                item.options.map((con,key)=>{
                                                    return <Tag key={con.account_code+Math.random()} className="genson-margin-top"
                                                          color="#108ee9" closable
                                                          onClose={this.setCashItem.bind(this,'delete',item.options_name.code,con.account_code,index,key)}>
                                                        {con.account_name}
                                                    </Tag>;
                                                })
                                            }
                                            {
                                                <div style={{display:item.options.length==0?'block':'none'}} className="genson-margin-top">
                                                    <Tag>还没定义特殊科目</Tag>
                                                </div>
                                            }
                                        </div>
                                        <div className="genson-margin-top">
                                            <Button style={{marginLeft:'1rem'}}
                                                    onClick={this.delItem.bind(this,item.options_name.code,index)}>
                                                提交删除
                                            </Button>
                                            <Button style={{marginLeft:'1rem'}}
                                                    onClick={this.resetItem.bind(this,item.options_name.code)}>
                                                重置
                                            </Button>
                                        </div>
                                    </div>
                                })
                            }
                        </Row>
                        <Modal title="报表定义"
                               visible={this.state.visible}
                               onOk={this.handleOk.bind(this)}
                               confirmLoading={this.state.confirmLoading}
                               onCancel={this.openModal.bind(this,false)}>
                            <Form>
                                <FormItem {...formItemLayout}
                                          label={(<span>科目</span>
                                          )}>
                                    <Input disabled value={this.state.modal.name}/>
                                </FormItem>
                                <FormItem {...formItemLayout}
                                          label={(<span>现金流量表</span>
                                          )}>
                                    {getFieldDecorator('select', {
                                        rules: [
                                            { required: true, message: '选择项'},
                                        ],
                                        initialValue:this.state.modal.select
                                    })(
                                        <Select onSelect={this.changeSelect.bind(this)}>
                                            {_this.state.selectItem?_this.state.selectItem.map((item,k)=>{
                                                return <Option key={k} value={item.key}>{item.title}</Option>
                                            }):''}
                                        </Select>
                                    )}
                                </FormItem>
                            </Form>
                        </Modal>
                        <Modal visible={this.state.checkVisible}
                               width="960"
                               title="记账凭证"
                               okText="打印"
                               cancelText="关闭"
                               onOk={this.hideModal.bind(this,'print')}
                               onCancel={this.hideModal.bind(this)}>
                            <div id="section-to-print" className="certificate-table">
                                <Table bordered pagination={false} size="small"
                                       dataSource={this.state.checkInfo.topTable}
                                       columns={this.state.checkInfo.topLabel} />
                                <Table style={{marginTop:'1rem'}} bordered pagination={false}
                                       dataSource={this.state.checkInfo.contentTable} size="small"
                                       columns={this.state.checkInfo.contentLabel} />
                            </div>
                        </Modal>
                    </Card>
                </div>
            );
        }
    }
    const CashTable = Form.create()(Cash);
    module.exports = CashTable;
})();