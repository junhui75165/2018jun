/**
 * Created by junhui on 2017/5/27.
 */
(function () {
    'use strict';
    let React = require('react');
    let moment = require('moment');
    let {Request, } = require('../request');
    let Global = require('../Global');
    let {  Col, Row ,Button,Table,Modal,Form ,Select,Menu,Dropdown,Icon,Upload,
        InputNumber,message,Tag,DatePicker,Input,Alert} = require('antd');
    const { MonthPicker } = DatePicker;
    const { Option,} = Select;
    const FormItem = Form.Item;
    const {GetLocalStorage,objToArr,getDateVnum,rtTableHeight,toThousands} = require('../tool');
    let gg = [];
    let curr = [];
    class Init extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                date:moment(),
                type:'init',
                dataSource:[],
                loading:false,
                editId:'',
                editItem:{},
                trans:[],
                classList:[],
                curr_default:GetLocalStorage('Const').curr_default,
                sb_type:[{title:'普通科目',value:'0'},{title:'数量单价科目',value:'1'},],
                inactive:[{title:'激活',value:'0'},{title:'无效',value:'1'},],
                confirmLoading:false,
                addModal:false,
                editModal:false,
                editParentModal:false,
                translationModal:false,
                addContent:{},
                editContent:{},
                editParentContent:{},
                translationContent:{},
                checkTable:false,
                errorInfo:[],
                fileList:[],
                defaultExpandedRowKeys:[]
            };
        }
         reSetDate(){
            let cb = (data)=>{
              let date = moment(data.date_);
              date = moment(date);
              this.setState({date});
            };
            getDateVnum(cb);
         }
        componentWillMount() {
            GetLocalStorage('currency').map((item)=>{
                if(item.inactive == 0){
                    curr.push(item);
                }
            });
            this.getInitTable();
            this.getTrans();
            this.getChartClass();
            this.checkTable();
        }
        checkTable(){
            const url = {
                type:'sys-session/have-init-bal',
                method:'FormData',
                Method:'POST',
            };
            let cb = (data)=>{
                let checkTable = data.info;
                let type = data.info?'init':'table';
                this.setState({
                    type:type,
                    checkTable:checkTable
                })
            };
            Request({},cb,url)
        }
        componentDidMount(){
            this.reSetDate();
        }
        keyUp(e){
            const _this = this;
            let open = _this.state.editItem.open;
            let editId = _this.state.editId;
            if(e.keyCode === 13 && !open && !!editId){
                _this.saveTemp();
            }
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
        getChartClass(){
            const type = {
                type:'chart-class/get-all-for-select',
                method:'GET'
            };
            let cb =(data)=>{
                let value = data.info;
                let con = [];
                for(let i in value){
                    let item = {key:i,value:value[i]};
                    con.push(item)
                }
                this.setState({
                    classList:con,
                })
            };
            Request({},cb,type);
        }

        getInitTable(){
            const type = {
                type:'sys-session/bal-tmp-index',
                method:'GET'
            };
            let cb = (data)=>{
                gg = [];
              let list = objToArr(data.info.tree);
              this.resetContent(list);
                setTimeout(()=>{
                    this.setState({
                        dataSource:list,
                        date:moment(data.info.gl.date_),
                        loading:false
                    },()=>{
                        // console.log(gg);
                        console.log('table\'s source is',this.state.dataSource)
                    })
                });
            };
            this.setState({
                loading:true,
            },()=>{
                Request({},cb,type);
            });
        }

        resetContent(item,parent){
            let defaultExpandedRowKeys = this.state.defaultExpandedRowKeys;
            if(item.children){
                defaultExpandedRowKeys.push(item.key);
                item.children.map((con,index)=>{
                    if(con.children){
                        con.key = con.id;
                        if(gg.indexOf(con.id)>-1){
                            console.log('something error',con);
                            con.key = con.id+Math.random();
                        }
                        if(item.key == '5503'){
                            console.log('gggggg',con)
                        }
                        gg.push(con.id);
                        parent.push(item);
                        this.setState({defaultExpandedRowKeys},()=>{
                            this.resetContent(con,parent);
                        });
                    }else {
                        if(con.type!='o'&&con.type!='q'){
                            con.key = con.id;
                            if(gg.indexOf(con.id)>-1){
                                console.log('something error',con);
                                con.key = con.id+Math.random();
                            }
                            gg.push(con.id);

                            // con.standard = con.curr_code==this.state.curr_default||con.curr_code==''?'本位币':'原币';
                            con.standard = '本位币';
                            item.aa = item.aa?item.aa:0;
                            item.ad = item.ad?item.ad:0;
                            item.ac = item.ac?item.ac:0;
                            item.bd = item.bd?item.bd:0;
                            item.bc = item.bc?item.bc:0;
                            item.debit = item.debit?item.debit:0;
                            item.lender = item.lender?item.lender:0;
                            item.aa += con.aa = Number(con.bal.aa);
                            item.ad += con.ad = Number(con.bal.ad);
                            item.ac += con.ac = Number(con.bal.ac);
                            item.bd += con.bd = Number(con.bal.bd);
                            item.bc += con.bc = Number(con.bal.bc);

                            let con_account = con.bd - con.bc- con.ad + con.ac;
                            if(con_account>0){
                                con.debit = con_account;
                            }else {
                                con.lender = -con_account;
                            }
                            con.debit = con.debit?con.debit:0;
                            con.lender = con.lender?con.lender:0;
                            item.debit += con.debit;
                            item.lender += con.lender;
                            if(con.key.indexOf('1243')>-1){
                                console.log('gggggg',con)
                            }
                            parent.map((par)=>{
                                if(con.key.indexOf(par.key)>-1){
                                    par.aa = 0;
                                    par.ad = 0;
                                    par.ac = 0;
                                    par.bd = 0;
                                    par.bc = 0;
                                    par.debit = 0;
                                    par.lender = 0;
                                    par.children.map((pI)=>{
                                        par.aa += pI.aa?pI.aa:0;
                                        par.ad += pI.ad?pI.ad:0;
                                        par.ac += pI.ac?pI.ac:0;
                                        par.bd += pI.bd?pI.bd:0;
                                        par.bc += pI.bc?pI.bc:0;
                                        par.debit += pI.debit?pI.debit:0;
                                        par.lender += pI.lender?pI.lender:0;
                                    })
                                }
                            });
                            let o = {};
                            let q = {};
                            if(typeof(con.bal.ado) != "undefined"){//存在（原币）本年累计（借方）
                                o = {
                                    type:'o',
                                    aa:Number(con.bal.aao),
                                    ad:Number(con.bal.ado),
                                    ac:Number(con.bal.aco),
                                    bd:Number(con.bal.bdo),
                                    bc:Number(con.bal.bco),
                                    id:con.id,
                                    key:con.id+'*',
                                    standard:'原币',
                                    open:con.open,
                                    name:con.name,
                                };
                                //*id 数据叠加 不叠加o
                                // item.aa += o.aa;
                                // item.ad += o.ad;
                                // item.ac += o.ac;
                                // item.bd += o.bd;
                                // item.bc += o.bc;
                                if(gg.indexOf(o.key)>-1){
                                    console.log('something error',o);
                                    o.key = o.key+Math.random();
                                }
                                let o_account = o.bd - o.bc- o.ad + o.ac;
                                if(o_account>0){
                                    o.debit = o_account;
                                }else {
                                    o.lender = -o_account;
                                }
                                gg.push(o.key);
                                const length = item.children.length;
                                setTimeout(()=>{
                                    //数量变更插入位置发生变化
                                    const newLength = item.children.length;
                                    item.children.splice(index+1+(newLength-length), 0, o);
                                    console.log(item.children)
                                });
                            }
                            if(typeof(con.bal.adq) != "undefined"){
                                q = {
                                    type:'q',
                                    aa:Number(con.bal.aaq),
                                    ad:Number(con.bal.adq),
                                    ac:Number(con.bal.acq),
                                    bd:Number(con.bal.bdq),
                                    bc:Number(con.bal.bcq),
                                    id:con.id,
                                    key:con.id+'#',
                                    standard:'数量',
                                    open:con.open,
                                    name:con.name,
                                };
                                //#id 数据叠加 不叠加q
                                // item.aa += q.aa;
                                // item.ad += q.ad;
                                // item.ac += q.ac;
                                // item.bd += q.bd;
                                // item.bc += q.bc;
                                let q_account = q.bd - q.bc- q.ad + q.ac;
                                if(q_account>0){
                                    q.debit = q_account;
                                }else {
                                    q.lender = -q_account;
                                }
                                if(gg.indexOf(q.key)>-1){
                                    console.log('something error',q);
                                    q.key = q.key+Math.random();
                                }
                                gg.push(q.key);
                                const length = item.children.length;
                                setTimeout(()=>{
                                    const newLength = item.children.length;
                                    item.children.splice(index+1+(newLength-length), 0, q);
                                });
                            }
                        }
                    }
                })
            }else {
                item.map((con,index)=>{
                    if(con.children){
                        con.key = con.id;
                        if(gg.indexOf(con.id)>-1){
                            console.log('something error',con);
                            con.key = con.id+Math.random();
                        }
                        gg.push(con.id);
                        let parent = [];
                        // parent.push(con);
                        this.resetContent(con,parent);
                    }else {
                        con.key = con.id;
                        if(gg.indexOf(con.id)>-1){
                            console.log('something error',con);
                            con.key = con.id+Math.random();
                        }
                        if(con.key.indexOf('1243')>-1){
                            console.log('gggggg',con)
                        }
                        gg.push(con.id);
                        con.standard = con.curr_code==this.state.curr_default||con.curr_code==''?'本位币':'原币';
                        item.aa = item.aa?item.aa:0;
                        item.ad = item.ad?item.ad:0;
                        item.ac = item.ac?item.ac:0;
                        item.bd = item.bd?item.bd:0;
                        item.bc = item.bc?item.bc:0;
                        item.debit = item.debit?item.debit:0;
                        item.lender = item.lender?item.lender:0;
                        item.aa += con.aa = Number(con.bal.aa);
                        item.ad += con.ad = Number(con.bal.ad);
                        item.ac += con.ac = Number(con.bal.ac);
                        item.bd += con.bd = Number(con.bal.bd);
                        item.bc += con.bc = Number(con.bal.bc);
                        let con_account = con.bd - con.bc- con.ad + con.ac;
                        if(con_account>0){
                            con.debit = con_account;
                        }else {
                            con.lender = -con_account;
                        }
                        con.debit = con.debit?con.debit:0;
                        con.lender = con.lender?con.lender:0;
                        let o = {};
                        let q = {};
                        if(typeof(con.bal.ado) != "undefined"){//存在（原币）本年累计（借方）
                            o = {
                                type:'o',
                                aa:Number(con.bal.aao),
                                ad:Number(con.bal.ado),
                                ac:Number(con.bal.aco),
                                bd:Number(con.bal.bdo),
                                bc:Number(con.bal.bco),
                                id:con.id,
                                key:con.id+'*',
                                standard:'原币',
                                open:con.open,
                                name:con.name,
                            };
                            //*id 数据叠加 不叠加o
                            // item.aa += o.aa;
                            // item.ad += o.ad;
                            // item.ac += o.ac;
                            // item.bd += o.bd;
                            // item.bc += o.bc;
                            if(gg.indexOf(o.key)>-1){
                                console.log('something error',o);
                                o.key = o.key+Math.random();
                            }
                            let o_account = o.bd - o.bc- o.ad + o.ac;
                            if(o_account>0){
                                o.debit = o_account;
                            }else {
                                o.lender = -o_account;
                            }
                            gg.push(o.key);
                            const length = item.length;
                            setTimeout(()=>{
                                //数量变更插入位置发生变化
                                const newLength = item.length;
                                item.splice(index+1+(newLength-length), 0, o);
                                console.log(item)
                            });
                        }
                        if(typeof(con.bal.adq) != "undefined"){
                            q = {
                                type:'q',
                                aa:Number(con.bal.aaq),
                                ad:Number(con.bal.adq),
                                ac:Number(con.bal.acq),
                                bd:Number(con.bal.bdq),
                                bc:Number(con.bal.bcq),
                                id:con.id,
                                key:con.id+'#',
                                standard:'数量',
                                open:con.open,
                                name:con.name,
                            };
                            //#id 数据叠加 不叠加q
                            // item.aa += q.aa;
                            // item.ad += q.ad;
                            // item.ac += q.ac;
                            // item.bd += q.bd;
                            // item.bc += q.bc;
                            let q_account = q.bd - q.bc- q.ad + q.ac;
                            if(q_account>0){
                                q.debit = q_account;
                            }else {
                                q.lender = -q_account;
                            }
                            if(gg.indexOf(q.key)>-1){
                                console.log('something error',q);
                                q.key = q.key+Math.random();
                            }
                            gg.push(q.key);
                            const length = item.length;
                            setTimeout(()=>{
                                const newLength = item.length;
                                item.splice(index+1+(newLength-length), 0, q);
                            });
                        }
                    }
                });
            }

        }

        setDate(date){
            this.setState({
                date:date,
            })
        }
        setType(type){
            const tp = {
                type:'sys-session/init-bal-tmp',
                method:'FormData',
                Method:'POST'
            };
            let cb = ()=>{
                message.success('科目开账余额会计分录已经生成');
                this.getInitTable();
                this.checkTable();
            };
            let par = {date_:moment(this.state.date).format('YYYY-MM-D')};
            if(type === 'init2'){
                this.setState({
                    type:'init'
                },()=>{
                    console.log(this.state.type)
                })
            }else if(type != 'table'){
                Request(par,cb,tp);
            }else {
                this.setState({
                    type:type
                },()=>{
                    this.dataValidation();
                    console.log(this.state.type)
                })
            }
        }
        dataValidation(){
            const url = {
                type:'sys-session/init-bal-validation',
                method:'FormData',
                Method:'POST'
            };
            let par = {date_:moment(this.state.date).format('YYYY-MM-D')};
            let cb = (data)=>{
                this.setState({
                    errorInfo:data.info,
                })
            };
            Request(par,cb,url);
        }
        add(item){
            console.log(item);
            if(item.open){
                this.setState({
                    addContent:{
                        title:'新增科目',
                        account_name:item.name,
                        account_code:item.children.length>0?(Number(item.children[item.children.length-1].id)+1):item.id+'001',
                        account_code2:'',
                        account_type:item.id,
                        curr_code:GetLocalStorage('Const').curr_default||GetLocalStorage('Const')[0].curr_abrev,
                        sb_type:this.state.sb_type[0].value,
                        inactive:this.state.inactive[0].value,
                    }
                },()=>{
                    console.log('addNextTree next tree',item.id);
                    this.setModalVisible('addModal',true);
                });
            }else {
                let cb = (data)=>{
                    let con = data.info.master;
                    let tp = data.info.type;
                    console.log('translationModal next tree',item.id);
                    this.setState({
                        translationContent:{
                            title:'转为科目组',
                            account_name:item.name,
                            account_code:item.id,
                            new_account_code:item.id+'01',
                            tra_group_account_code:con.account_code,
                            tra_group_account_name:con.account_name,
                            tra_group_account_type:con.account_type,
                            tra_group_class_id:tp.class_id,
                        }
                    },()=>{
                        this.setModalVisible('translationModal',true);
                    });
                };
                this.itemToList(item.id,cb);
            }
        }
        edit(item){
            if(item.open){
                let cb = (data)=>{
                    let item = data.info;
                    this.setState({
                        editParentContent:{
                            title:'总账科目组',
                            account_name:item.name,
                            account_code:item.id,
                            parent:item.parent,
                            inactive:item.inactive,
                        }
                    },()=>{
                        console.log('editParentTree next tree',item.id);
                        this.setModalVisible('editParentModal',true);
                    });
                };
                this.chart_type(item.id,cb);
            }else {
                let cb = (data)=>{
                    data = data.info;
                    this.setState({
                        editContent:{
                            title:'编辑科目',
                            account_name:data.account_name,
                            code:data.account_code,
                            account_code2:data.account_code2,
                            account_code:data.account_code,
                            account_type:data.account_type,
                            curr_code:data.curr_code,
                            sb_type:data.sb_type,
                            note:data.note,
                            inactive:data.inactive,
                        }
                    },()=>{
                        console.log('editTree next tree',item.id);
                        this.setModalVisible('editModal',true);
                    });
                };
                this.chart_master(item.id,cb);
            }
        }
        setEditId(item,index){
            // console.log(item,index);
            this.setState({
                editId:item.key,
                editItem:item,
            })
        }
        changeTemp(type , value ){
            if(typeof type != 'string'){
                return;
            }
            let content = this.state.editItem;
            content[type] = value;
            this.setState({
                editItem:content
            })
        }
        saveTemp(){
            let item = this.state.editItem;
            let type = item.type?item.type:'';
            let par = {};
            par[`detail[${item.id}][ad${type}]`] = item.ad;
            par[`detail[${item.id}][ac${type}]`] = item.ac;
            par[`detail[${item.id}][bd${type}]`] = item.bd;
            par[`detail[${item.id}][bc${type}]`] = item.bc;
            par[`detail[${item.id}][aa${type}]`] = item.aa;
            const tp = {
                type:'sys-session/save-bal-tmp',
                method:'FormData',
                Method:'POST'
            };
            let cb = (data)=>{
                message.success('已更新');
                this.setState({
                    editItem:{},
                    editId:''
                },()=>{
                    this.getInitTable();
                })
            };
            if(!this.state.checkTable){
                message.error('初始化已完成，不能进行更改！')
            }else {
                Request(par,cb,tp);
            }
        }
        closeModal(type){
            if(type == 'add'){
                let modal= this.state.AddModal;
                modal.visible = false;
                this.setState({
                    AddModal:modal
                })
            }else if(type == 'edit'){
                let modal= this.state.AddModal;
                modal.visible = false;
                this.setState({
                    EditModal:modal
                })
            }
        }
        setModalVisible(type,val){
            let list = {};
            if(!val){
                this.props.form.validateFields((err, values) => {
                    for(let name in values){
                        if(type == 'addModal'&&name.indexOf('add_')>-1){
                            list[name] = values[name];
                        }else if(type == 'editModal'&&name.indexOf('edit_')>-1){
                            list[name] = values[name];
                        }else if(type == 'editParentModal'&&name.indexOf('editP_')>-1){
                            list[name] = values[name];
                        }else if(type == 'translationModal'&&name.indexOf('tra_')>-1){
                            list[name] = values[name];
                        }
                    }
                    console.log('submit forms is',list);
                    this.props.form.resetFields();//重置表格内容
                });
            }
            switch (type){
                case 'addModal':
                    if(!val){
                        this.createItem(list);
                    }else {
                        this.setState({
                            addModal:val
                        });
                    }
                    break;
                case 'editModal':
                    if(!val){
                        this.editItem(list);
                    }else {
                        this.setState({
                            editModal:val
                        });
                    }
                    break;
                case 'editParentModal':
                    if(!val){
                        this.editPItem(list);
                    }else {
                        this.setState({
                            editParentModal:val
                        });
                    }
                    break;
                case 'translationModal':
                    if(!val){
                        this.transItem(list);
                    }else {
                        this.setState({
                            translationModal:val
                        });
                    }
                    break;
            }
        }
        cancelModal(type){
            switch (type){
                case 'addModal':
                    this.setState({
                        addModal:false
                    });
                    break;
                case 'editModal':
                    this.setState({
                        editModal:false
                    });
                    break;
                case 'editParentModal':
                    this.setState({
                        editParentModal:false
                    });
                    break;
                case 'translationModal':
                    this.setState({
                        translationModal:false
                    });
                    break;
            }
            this.props.form.resetFields();
        }

        createItem(item){
            const type = {
                type:'chart-master/create',
                method:'FormData',
                Method:'POST',
            };
            let par = {
                account_code:item.add_account_code,
                account_name:item.add_account_name,
                account_type:item.add_account_type,
                inactive:item.add_inactive,
                sb_type:item.add_sb_type,
                curr_code:item.add_curr_code,
                // note:item.add_note,
                account_code2:item.add_account_code2,
            };
            let cb = (data)=>{
                this.setState({
                    addModal:false
                },()=>{
                    this.getInitTable();
                    message.success(`科目：${par.account_name}，新增成功`)
                });
            };
            Request(par,cb,type);
        }
        editItem(item){
            const type = {
                type:'chart-master/update',
                method:'FormData',
                Method:'POST',
            };
            let par = {};
            par[`account_code`] = item.edit_code;
            par[`master[account_code]`] = item.edit_account_code;
            par[`master[account_name]`] = item.edit_account_name;
            par[`master[account_type]`] = item.edit_account_type;
            par[`master[inactive]`] = item.edit_inactive;
            par[`master[sb_type]`] = item.edit_sb_type;
            par[`master[curr_code]`] = item.edit_curr_code;
            par[`master[account_code2]`] = item.edit_account_code2;
            let cb = (data)=>{
                this.setState({
                    editModal:false
                },()=>{
                    this.getInitTable();
                    message.success(`科目：${par[`master[account_name]`]}，修改成功`)
                });
            };
            Request(par,cb,type);
        }
        editPItem(item){
            const type = {
                type:'chart-type/update',
                method:'FormData',
                Method:'POST',
            };
            let par = {
                id:item.editP_account_code,
                name:item.editP_account_name,
                parent:item.editP_parent,
                inactive:item.editP_inactive,
            };
            let cb = (data)=>{
                this.setState({
                    editParentModal:false
                },()=>{
                    this.getInitTable();
                    message.success(`科目组：${par.name}，修改成功`)
                });
            };
            Request(par,cb,type);
        }
        transItem(item){
            const type = {
                type:'chart-master/trans-to-type',
                method:'FormData',
                Method:'POST',
            };
            let par = {
                account_code:item.tra_group_account_code,
                'new_type[name]':item.tra_group_account_name,
                'new_type[parent]':item.tra_group_account_type,
                'new_type[class_id]':item.tra_group_class_id,
                'new_master[account_code]':item.tra_new_account_code,
                'new_master[account_name]':item.tra_new_account_name,

                'new_master[inactive]':item.tra_new_inactive,
                'new_master[sb_type]':item.tra_new_sb_type,
                'new_master[account_code2]':item.tra_new_account_code2,
                'new_master[curr_code]':item.tra_new_curr_code,
            };
            let cb = (data)=>{
                this.setState({
                    translationModal:false
                },()=>{
                    this.getInitTable();
                    message.success(`科目：${item.tra_group_account_name}，转换科目组成功`)
                });
            };
            Request(par,cb,type);
        }
        chart_master(id,cb){
            const type = {
                type:'chart-master/info',
                method:'GET'
            };
            let par = {id:id};
            Request(par,cb,type);
        }
        chart_type(id,cb){
            const type = {
                type:'chart-type/info',
                method:'GET'
            };
            let par = {id:id};
            Request(par,cb,type);
        }
        itemToList(id,cb){
            const type = {
                type:'chart-master/master-to-type-list',
                method:'GET'
            };
            let par = {account_code:id};
            Request(par,cb,type);
        }
        clearData(){
            const url = {
                type:'sys-session/clear-bal-tmp-data',
                method:'FormData',
                Method:'POST'
            };
            let cb = (data)=>{
                message.success('已清空表格数据！');
                this.getInitTable();
            };
            Request({},cb,url);
        }
        clearInit(){
            const url = {
                type:'sys-session/delete-bal-tmp',
                method:'FormData',
                Method:'POST'
            };
            let cb = (data)=>{
                this.setState({type:'init'});
                message.success('已清空初始化数据！');
                this.getInitTable();
                this.checkTable();
            };
            Request({},cb,url);
        }
        searchList(data,list){
            let expKeys = list;
            data.map((item)=>{
                let {id} = item;
                if(id.toLocaleUpperCase().indexOf('') > -1){
                    let newKeys = expKeys.concat(id);
                    expKeys = Array.from(new Set(newKeys));
                    if(item.children){
                        this.searchList(item.children,expKeys);
                    }
                }
                if(item.children){
                    this.searchList(value,item.children);
                }
            });
            console.log(expKeys);
            return expKeys;
        }
        rtFooter(item){
            let list = document.getElementsByTagName('th');
            let dom = [];
            if(list.length>10){
                dom[0] = <div className="title" style={{width:list[0].offsetWidth}}>{item.key}</div>;
                dom[1] = <div style={{width:list[1].offsetWidth}}>&nbsp;</div>;//科目名称
                if(this.state.type=='table'&&list.length==13){
                    dom[2] = <div style={{width:list[2].offsetWidth}}>&nbsp;</div>;//币别数量
                    dom[3] = <div className="right" style={{width:list[7].offsetWidth}}>{toThousands(item.debit)}</div>;//年初开账余额-借方
                    dom[4] = <div className="right" style={{width:list[8].offsetWidth}}>{toThousands(item.lender)}</div>;//年初开账余额-贷方
                    dom[5] = <div className="right" style={{width:list[9].offsetWidth}}>{toThousands(item.ad)}</div>;//本年累计-借方
                    dom[6] = <div className="right" style={{width:list[10].offsetWidth}}>{toThousands(item.ac)}</div>;//本年累计-贷方
                    dom[7] = <div className="right" style={{width:list[11].offsetWidth}}>{toThousands(item.bd)}</div>;//余额-借方
                    dom[8] = <div className="right" style={{width:list[12].offsetWidth}}>{toThousands(item.bc)}</div>;//余额-贷方
                    dom[9] = <div className="right" style={{width:list[6].offsetWidth,marginRight:'-1px'}}>{toThousands(item.aa)}</div>;//损益科目发生数
                }else{
                    // console.log(item);
                    dom[2] = <div style={{width:list[2].offsetWidth}}>&nbsp;</div>;//操作
                    dom[3] = <div style={{width:list[3].offsetWidth}}>&nbsp;</div>;//币别数量
                    dom[4] = <div className="right" style={{width:list[7].offsetWidth}}>{toThousands(item.ad)}</div>;//本年累计-借方
                    dom[5] = <div className="right" style={{width:list[8].offsetWidth}}>{toThousands(item.ac)}</div>;//本年累计-贷方
                    dom[6] = <div className="right" style={{width:list[9].offsetWidth}}>{toThousands(item.bd)}</div>;//余额-借方
                    dom[7] = <div className="right" style={{width:list[10].offsetWidth}}>{toThousands(item.bc)}</div>;//余额-贷方
                    dom[8] = <div className="right" style={{width:list[6].offsetWidth,marginRight:'-1px'}}>{toThousands(item.aa)}</div>;//损益科目发生数
                }
            }
            return <div className="genson-table-footer">
                {dom}
            </div>;
        }
        downloadExcel(item){
            const url = {
                type:'sys-session/bal-tmp-execl',
                method:'POST'
            };
            let cb = (data)=>{
                if(data.info.indexOf('http')>-1){
                    window.open(data.info)
                }else {
                    window.open('http://'+data.info)
                }
            };
            Request({},cb,url);
        }
        onChange(info) {
            let fileList = info.fileList;
            if(info.file&&info.file.status==='done'&&info.file.response){
                let response = info.file.response;
                if(response.code == 0){
                    message.success(`${info.file.name} 上传成功`,2);
                    this.getInitTable();
                }else {
                    message.error(`上传出错：${response.message}`,2);
                }
                this.setState({ fileList:[fileList[fileList.length-1]] });
            }else {
                this.setState({ fileList:fileList });
            }
        }
        batchConversion(list,type,rq){
            const url = {
                method:'FormData',
                Method:'POST'
            };
            let par = {};
            if(type == 'toList'){
                // 转换为科目组
                url.type = 'chart-master/trans-to-types';
                list.map((account_code,index)=>{
                    par[`account_code[${index}]`] = account_code;
                })
            }else if(type == 'toItem'){
                // 转换为明细科目
                url.type = 'chart-type/trans-to-masters';
                list.map((id,index)=>{
                    par[`id[${index}]`] = id;
                })
            }
            let cb = (data)=>{
              message.success('一键转换成功！');
              this.verify(rq.file,rq.success.rq.error);
            };
            Request(par,cb,url);
            console.log(par,url);
        }
        verify(file,sucess,error){
            const formData = new FormData();
            formData.append('tmp_name', file);
            const url = {
                type:'sys-session/import-bal-tmp-verify',
                method:'File',
                Method:'POST'
            };
            let cb = (data)=>{
                if(data.info){
                    if(data.info.error.length == 0){
                        sucess('success');
                        this.getInitTable();
                    }else {

                        let group_to_account,account_to_group;
                        let toList = [];
                        let toItem = [];
                        let rq = {};
                        let ErrorList = [];
                        let ErrorItem = [];
                        let ErrorOther = [];
                        data.info.error.map((item)=>{
                            if(item.type == 'group_to_account'){
                                group_to_account = true;
                                toItem.push(item.param.id);
                                ErrorItem.push(item);
                            }else if(item.type == 'account_to_group'){
                                account_to_group = true;
                                toList.push(item.param.id);
                                ErrorList.push(item);
                            }else {
                                ErrorOther.push(item)
                            }
                        });
                        if(group_to_account||account_to_group){
                            rq = {file,sucess,error};
                        }else {
                            error(data.info.error);
                        }
                        Modal.error({
                            title: '初始化过程出错',
                            width:'960',
                            content: <div>
                                <div style={{display:group_to_account?'block':'none'}}>
                                    <h3 className="genson-margin-top">科目组转换为明细科目出错</h3>
                                    {ErrorItem.map((item,index)=>{
                                        return<Row>{index+1}：{item.message||item}</Row>
                                    })}
                                    <Button className="genson-margin-top" onClick={this.batchConversion.bind(this,toItem,'toItem',rq)}
                                            type="primary"
                                            style={{margin:'1rem',display:group_to_account?'':'none'}}>
                                        一键转换
                                    </Button>
                                </div>
                                <div style={{display:account_to_group?'block':'none'}}>
                                    <h3 className="genson-margin-top">明细科目转换为科目组出错</h3>
                                    {ErrorList.map((item,index)=>{
                                        return<Row>{index+1}：{item.message||item}</Row>
                                    })}
                                    <Button className="genson-margin-top" onClick={this.batchConversion.bind(this,toList,'toList',rq)}
                                            type="primary"
                                            style={{margin:'1rem',display:account_to_group?'':'none'}}>
                                        一键转换
                                    </Button>
                                </div>
                                <div style={{display:ErrorOther.length>0?'block':'none'}}>
                                    <h3 className="genson-margin-top">其他错误</h3>
                                    {ErrorOther.map((item,index)=>{
                                        return<Row>{index+1}：{item.message||item}</Row>
                                    })}
                                </div>
                            </div>,
                        });
                    }
                }
            };
            Request(formData,cb,url);
        }
        render() {
            const { getFieldDecorator } = this.props.form;
            const initCol = [
                {
                    title:'科目',
                    dataIndex:'key',
                    key:'key',
                    width:'16%',
                },
                {
                    title:'科目名称',
                    dataIndex:'name',
                    key:'name',
                    width:'16%'
                },
                {
                    title:'操作',
                    dataIndex:'edit',
                    key:'edit',
                    width:'8%',
                    render:(text,item,index)=>{
                        return<Row>
                            <Button disabled={item.type=='o'||item.type=='q'}
                                    icon="edit" title="编辑/新增" shape="circle-outline"
                                    onClick={this.edit.bind(this,item)}/>
                            <Button disabled={item.type=='o'||item.type=='q'}
                                    style={{marginLeft:'1rem'}} icon="plus-square"
                                    onClick={this.add.bind(this,item)}
                                    title={item.children?'新增下级科目':'科目转换为科目组'}
                                    shape="circle-outline"/>
                        </Row>
                    }
                },
                {
                    title:'币别数量',
                    dataIndex:'standard',
                    key:'standard',
                    width:'8%'
                },
                {
                    title:'本年累计',
                    children: [
                        {
                            title: '借方',
                            dataIndex: 'ad',
                            key: 'ad',
                            width:'10%',
                            render:(text,item)=>{
                                if(item.key==this.state.editId&&!item.open){
                                    return<InputNumber defaultValue={this.state.editItem.ad} style={{width:'100%'}}
                                                       onChange={this.changeTemp.bind(this,'ad')}/>
                                }else {
                                    return <div className="right">{toThousands(text)}</div>
                                }
                            }
                        },
                        {
                            title: '贷方',
                            dataIndex: 'ac',
                            key: 'ac',
                            width:'10%',
                            render:(text,item)=>{
                                if(item.key==this.state.editId&&!item.open){
                                    return<InputNumber defaultValue={this.state.editItem.ac} style={{width:'100%'}}
                                                       onChange={this.changeTemp.bind(this,'ac')}/>
                                }else {
                                    return <div className="right">{toThousands(text)}</div>
                                }
                            }
                        },
                    ]
                },
                {
                    title:'余额',
                    children: [
                        {
                            title: '借方',
                            dataIndex: 'bd',
                            key: 'bd',
                            width:'10%',
                            render:(text,item)=>{
                                if(item.key==this.state.editId&&!item.open){
                                    return<InputNumber defaultValue={this.state.editItem.bd} style={{width:'100%'}}
                                                       onChange={this.changeTemp.bind(this,'bd')}/>
                                }else {
                                    return <div className="right">{toThousands(text)}</div>
                                }
                            }
                        },
                        {
                            title: '贷方',
                            dataIndex: 'bc',
                            key: 'bc',
                            width:'10%',
                            render:(text,item)=>{
                                if(item.key==this.state.editId&&!item.open){
                                    return<InputNumber defaultValue={this.state.editItem.bc} style={{width:'100%'}}
                                                       onChange={this.changeTemp.bind(this,'bc')}/>
                                }else {
                                    return <div className="right">{toThousands(text)}</div>
                                }
                            }
                        },
                    ]
                },
                {
                    title:'损益科目实际发生数',
                    dataIndex:'aa',
                    key:'aa',
                    width:'10%',
                    render:(text,item)=>{
                        if(item.key==this.state.editId&&!item.open){
                            return<InputNumber defaultValue={this.state.editItem.aa} style={{width:'100%'}}
                                               onChange={this.changeTemp.bind(this,'aa')}/>
                        }else {
                            return <div className="right">{toThousands(text)}</div>
                        }
                    }
                }
            ];
            const check = [
                {
                    title:'科目',
                    dataIndex:'key',
                    key:'key',
                    width:'17%',
                    onFilter:()=>{}
                },
                {
                    title:'科目名称',
                    dataIndex:'name',
                    key:'name',
                    width:'17%'
                },
                {
                    title:'币别数量',
                    dataIndex:'standard',
                    key:'standard',
                    width:'8%'
                },
                {
                    title:'年初开账余额',
                    children:[
                        {
                            title:'借方',
                            dataIndex:'debit',
                            key:'debit',
                            width:'8%',
                            render:(text)=>{
                                return <div className="right">{toThousands(text)}</div>
                            }
                        },
                        {
                            title:'贷方',
                            dataIndex:'lender',
                            key:'lender',
                            width:'8%',
                            render:(text)=>{
                                return <div className="right">{toThousands(text)}</div>
                            }
                        },
                    ]
                    // width:'8%'
                },
                {
                    title:'本年累计',
                    children: [
                        {
                            title: '借方',
                            dataIndex: 'ad',
                            key: 'ad',
                            width:'8%',
                            render:(text)=>{
                                return <div className="right">{toThousands(text)}</div>
                            }
                        },
                        {
                            title: '贷方',
                            dataIndex: 'ac',
                            key: 'ac',
                            width:'8%',
                            render:(text)=>{
                                return <div className="right">{toThousands(text)}</div>
                            }
                        },
                    ]
                },
                {
                    title:'余额',
                    children: [
                        {
                            title: '借方',
                            dataIndex: 'bd',
                            key: 'bd',
                            width:'8%',
                            render:(text)=>{
                                return <div className="right">{toThousands(text)}</div>
                            }
                        },
                        {
                            title: '贷方',
                            dataIndex: 'bc',
                            key: 'bc',
                            width:'8%',
                            render:(text)=>{
                                return <div className="right">{toThousands(text)}</div>
                            }
                        },
                    ]
                },
                {
                    title:'损益科目实际发生数',
                    dataIndex:'aa',
                    key:'aa',
                    width:'8%',
                    render:(text)=>{
                        return <div className="right">{toThousands(text)}</div>
                    }
                }
            ];
            const _this = this;
            const props = {
                name:'tmp_name',
                action: Global.cmpUrl+'/sys-session/import-bal-tmp',
                // action: Global.cmpUrl+'/sys-session/import-bal-tmp-verify',
                headers: {
                    'access-token':GetLocalStorage('token'),
                },
                beforeUpload: (file, fileList) => {
                    let promise = new Promise(function(resolve, reject) {
                        let done = _this.verify(file,resolve,reject);
                    });
                    return promise;
                },
                onPreview:(file)=>{
                    if(file.response&&file.response.code==0){
                        console.log(file.response.info)
                    }else {
                        message.error(file.response.message)
                    }
                },
                onChange:this.onChange.bind(this),
                fileList: this.state.fileList,
                supportServerRender:true,
            };
            let itemFooter = {
                key:'总计',
                open:true,
                type:'o',
                aa:0,
                ad:0,
                ac:0,
                bd:0,
                bc:0,
                debit:0,
                lender:0
            };
            this.state.dataSource.map((con)=>{
                const def = 5000;//损益科目小于5000不为0
                if(con.type!='o'&&con.type!='q'){
                    let k = con.key.substr(0,4);
                    if(Number(k)<def){
                        itemFooter.err += con.aa?con.aa:0;
                    }
                    itemFooter.aa += con.aa?con.aa:0;
                    itemFooter.ad += con.ad?con.ad:0;
                    itemFooter.ac += con.ac?con.ac:0;
                    itemFooter.bd += con.bd?con.bd:0;
                    itemFooter.bc += con.bc?con.bc:0;
                    itemFooter.debit += con.debit?con.debit:0;
                    itemFooter.lender += con.lender?con.lender:0;
                }else {
                    console.log(con.key);
                }
            });
            itemFooter.aa = itemFooter.aa;
            itemFooter.ad = Number(itemFooter.ad).toFixed(2);
            itemFooter.ac = Number(itemFooter.ac).toFixed(2);
            itemFooter.bd = Number(itemFooter.bd).toFixed(2);
            itemFooter.bc = Number(itemFooter.bc).toFixed(2);
            itemFooter.debit = Number(itemFooter.debit).toFixed(2);
            itemFooter.lender = Number(itemFooter.lender).toFixed(2);
            let dataSource = this.state.dataSource;
            return (
                <div onKeyDown={this.keyUp.bind(this)}>
                    <Alert message={this.state.errorInfo.length==0?(this.state.checkTable?'数据验证无误':'初始化已完成'):'初始化出错'}
                           className="genson-max-width"
                           style={{display:(this.state.type=='table')?
                               'block':'none'}}
                           description={<div>
                               {
                                   this.state.errorInfo.map((item)=>{
                                       return<Row>{item}</Row>
                                   })
                               }
                           </div>}
                           type={this.state.errorInfo.length==0?'success':'error'}
                           closable showIcon/>
                    <Row style={{display:this.state.type=='init'?'block':'none'}}>
                        <Col xs={6}>
                            开账日期：<MonthPicker value={moment(this.state.date)} format='YYYY/MM'
                                              onChange={this.setDate.bind(this)}/>
                        </Col>
                        <Col xs={6}>
                            <Button.Group>
                                <Button onClick={this.setType.bind(this,'table')}>数据检查</Button>
                                <Button onClick={this.clearData.bind(this)}>清空表格数据</Button>
                                <Button onClick={this.downloadExcel.bind(this)}>模板下载</Button>
                            </Button.Group>
                        </Col>
                        <Col xs={2} offset={1}>
                            <Upload {...props}  style={{width:'100%'}}>
                                <Button style={{width:'100%'}} type="primary" icon="upload">
                                    上传excel
                                </Button>
                            </Upload>
                        </Col>
                        <Col xs={6} offset={3}>
                            <Tag color="orange">注意：修改金额后请按回车(Enter)键保存数据</Tag>
                        </Col>
                    </Row>
                    <Row className="genson-margin-top" style={{display:this.state.type!='init'?'block':'none'}}>
                        <Col lg={3} md={5} xs={6} style={{lineHeight:'2.5rem'}}>
                            开账日期：{moment(this.state.date).format('YYYY-MM')}
                        </Col>
                        <Col xs={16} md={10} lg={8} offset={1}>
                            <Button.Group>
                                <Button disabled={!this.state.checkTable} onClick={this.setType.bind(this,'init')}>初始化开账余额</Button>
                                <Button disabled={this.state.checkTable} onClick={this.clearInit.bind(this)}>清除初始化数据</Button>
                                <Button disabled={!this.state.checkTable} onClick={this.setType.bind(this,'init2')}>返回</Button>
                            </Button.Group>
                        </Col>
                    </Row>
                    <div className="certificate-table">
                        <Table dataSource={dataSource}  bordered size="small"
                               loading={this.state.loading} defaultExpandedRowKeys={this.state.defaultExpandedRowKeys}
                               onRowClick={this.setEditId.bind(this)}
                               style={{position:'relative'}}
                               footer={()=>{
                                   return this.rtFooter(itemFooter)
                               }}
                               pagination={false} scroll={{y:rtTableHeight(40)}}
                               columns={this.state.type=='table'?check:initCol}/>
                    </div>
                    <Modal
                        title={this.state.addContent.title}
                        visible={this.state.addModal}
                        onOk={() => this.setModalVisible.bind(this,'addModal',false)()}
                        onCancel={() => this.cancelModal.bind(this,'addModal')()}
                    >
                        <Form layout='horizontal' >
                            <FormItem
                                {...Global.formItemLayout}
                                label="科目代码"
                                help="科目代码不能比所属科目组编码长3位以上"
                            >
                                {getFieldDecorator('add_account_code', {
                                    rules: [{
                                        required: true, message: '请输入科目代码',
                                    }],
                                    initialValue:this.state.addContent.account_code
                                })(
                                    <Input type="number" placeholder="输入科目代码" style={{width:'100%'}}/>
                                )}
                            </FormItem>
                            <FormItem
                                {...Global.formItemLayout}
                                label="科目名称"
                            >
                                {getFieldDecorator('add_account_name', {
                                    rules: [{
                                        required: true, message: '请输入科目名称',
                                    }],
                                    initialValue:this.state.addContent.account_name
                                })(
                                    <Input placeholder="输入科目名称" style={{width:'100%'}}/>
                                )}
                            </FormItem>
                            <FormItem
                                {...Global.formItemLayout}
                                label="计量单位"
                            >
                                {getFieldDecorator('add_account_code2', {
                                    rules: [{
                                        required: false, message: '请输入计量单位',
                                    }],
                                    initialValue:this.state.addContent.account_code2
                                })(
                                    <Input placeholder="输入计量单位" style={{width:'100%'}}/>
                                )}
                            </FormItem>
                            <FormItem
                                {...Global.formItemLayout}
                                label="科目组">
                                {getFieldDecorator('add_account_type', {
                                    rules: [{
                                        required: true, message: '请选择一个科目组',
                                    }],
                                    initialValue:this.state.addContent.account_type
                                })(
                                    <Select placeholder="选择科目组" disabled>
                                        {this.state.trans.map((data,index)=>{
                                            return  <Option value={data.id} key={data.id} title={`${data.id}--${data.name}`}>
                                                <div style={{textIndent:(data.level||0)*0.75+'rem'}}>
                                                    {`${data.id}--${data.name}`}
                                                </div>
                                            </Option>
                                        })}
                                    </Select>
                                )}

                            </FormItem>
                            <FormItem
                                {...Global.formItemLayout}
                                label="币别"
                            >
                                {getFieldDecorator('add_curr_code', {
                                    rules: [{
                                        required: true, message: '请选择币别',
                                    }],
                                    initialValue:this.state.addContent.curr_code
                                })(
                                    <Select placeholder="选择币别">
                                        {curr.map((data)=>{
                                            return  <Option value={data.curr_abrev} key={data.curr_abrev}>{data.currency}</Option>
                                        })}
                                    </Select>
                                )}
                            </FormItem>
                            <FormItem
                                {...Global.formItemLayout}
                                label="属性"
                            >
                                {getFieldDecorator('add_sb_type', {
                                    rules: [{
                                        required: true, message: '请选择科目属性',
                                    }],
                                    initialValue:this.state.addContent.sb_type
                                })(
                                    <Select placeholder="选择科目属性">
                                        {this.state.sb_type.map((data)=>{
                                            return  <Option value={data.value} key={data.value}>{data.title}</Option>
                                        })}
                                    </Select>
                                )}

                            </FormItem>
                            <FormItem
                                {...Global.formItemLayout}
                                label="科目状态"
                                required={true}
                                validateStatus="success"
                            >
                                {getFieldDecorator('add_inactive', {
                                    rules: [{
                                        required: true, message: '请选择科目状态',
                                    }],
                                    initialValue:this.state.addContent.inactive
                                })(
                                    <Select placeholder="选择科目状态">
                                        {this.state.inactive.map((data,index)=>{
                                            return  <Option value={data.value} key={data.value}>{data.title}</Option>
                                        })}
                                    </Select>
                                )}

                            </FormItem>
                        </Form>
                    </Modal>
                    <Modal
                        title={this.state.editContent.title}
                        visible={this.state.editModal}
                        onOk={() => this.setModalVisible.bind(this,'editModal',false)()}
                        onCancel={() => this.cancelModal.bind(this,'editModal')()}
                    >
                        <Form layout='horizontal' >
                            <FormItem
                                {...Global.formItemLayout}
                                label="原科目代码"
                            >
                                {getFieldDecorator('edit_code', {
                                    rules: [{
                                        required: true, message: '请输入科目代码',
                                    }],
                                    initialValue:this.state.editContent.code
                                })(
                                    <Input type="number" disabled placeholder="输入科目代码" style={{width:'100%'}}/>
                                )}
                            </FormItem>
                            <FormItem
                                {...Global.formItemLayout}
                                label="科目代码"
                                help="科目代码不能比所属科目组编码长3位以上"
                            >
                                {getFieldDecorator('edit_account_code', {
                                    rules: [{
                                        required: true, message: '请输入科目代码',
                                    }],
                                    initialValue:this.state.editContent.account_code
                                })(
                                    <Input type="number" placeholder="输入科目代码" style={{width:'100%'}}/>
                                )}
                            </FormItem>
                            <FormItem
                                {...Global.formItemLayout}
                                label="科目名称"
                            >
                                {getFieldDecorator('edit_account_name', {
                                    rules: [{
                                        required: true, message: '请输入科目名称',
                                    }],
                                    initialValue:this.state.editContent.account_name
                                })(
                                    <Input placeholder="输入科目名称" style={{width:'100%'}}/>
                                )}
                            </FormItem>
                            <FormItem
                                {...Global.formItemLayout}
                                label="计量单位"
                            >
                                {getFieldDecorator('edit_account_code2', {
                                    rules: [{
                                        required: false, message: '请输入计量单位',
                                    }],
                                    initialValue:this.state.editContent.account_code2
                                })(
                                    <Input placeholder="输入计量单位" style={{width:'100%'}}/>
                                )}
                            </FormItem>
                            <FormItem
                                {...Global.formItemLayout}
                                label="科目组">
                                {getFieldDecorator('edit_account_type', {
                                    rules: [{
                                        required: true, message: '请选择一个科目组',
                                    }],
                                    initialValue:this.state.editContent.account_type
                                })(
                                    <Select placeholder="选择科目组" >
                                        {this.state.trans.map((data,index)=>{
                                            return  <Option value={data.id} key={data.id} title={`${data.id}--${data.name}`}>
                                                <div style={{textIndent:(data.level||0)*0.75+'rem'}}>
                                                    {`${data.id}--${data.name}`}
                                                </div>
                                            </Option>
                                        })}
                                    </Select>
                                )}

                            </FormItem>
                            <FormItem
                                {...Global.formItemLayout}
                                label="币别"
                            >
                                {getFieldDecorator('edit_curr_code', {
                                    rules: [{
                                        required: true, message: '请选择币别',
                                    }],
                                    initialValue:this.state.editContent.curr_code
                                })(
                                    <Select placeholder="选择币别">
                                        {curr.map((data,index)=>{
                                            return  <Option value={data.curr_abrev} key={data.curr_abrev}>{data.currency}</Option>
                                        })}
                                    </Select>
                                )}
                            </FormItem>
                            <FormItem
                                {...Global.formItemLayout}
                                label="属性"
                            >
                                {getFieldDecorator('edit_sb_type', {
                                    rules: [{
                                        required: true, message: '请选择科目属性',
                                    }],
                                    initialValue:this.state.editContent.sb_type
                                })(
                                    <Select placeholder="选择科目属性">
                                        {this.state.sb_type.map((data)=>{
                                            return  <Option value={data.value} key={data.value}>{data.title}</Option>
                                        })}
                                    </Select>
                                )}

                            </FormItem>
                            <FormItem
                                {...Global.formItemLayout}
                                label="科目状态"
                                required={true}
                                validateStatus="success"
                            >
                                {getFieldDecorator('edit_inactive', {
                                    rules: [{
                                        required: true, message: '请选择科目状态',
                                    }],
                                    initialValue:this.state.editContent.inactive
                                })(
                                    <Select placeholder="选择科目状态">
                                        {this.state.inactive.map((data,index)=>{
                                            return  <Option value={data.value} key={data.value}>{data.title}</Option>
                                        })}
                                    </Select>
                                )}

                            </FormItem>
                        </Form>
                    </Modal>
                    <Modal
                        title={this.state.translationContent.title}
                        visible={this.state.translationModal}
                        onOk={() => this.setModalVisible.bind(this,'translationModal',false)()}
                        onCancel={() => this.cancelModal.bind(this,'translationModal')()}
                    >
                        <Form layout='horizontal' onSubmit={(e)=>{console.log(e)}}>
                            <h2 className="center">新科目</h2>
                            <FormItem
                                {...Global.formItemLayout}
                                label="原科目代码">
                                {getFieldDecorator('tra_account_code', {
                                    rules: [{
                                        required: false, message: '请输入货币的缩写',
                                    }],
                                    initialValue:this.state.translationContent.account_code
                                })(
                                    <Input disabled placeholder="输入科目代码" style={{width:'100%'}}/>
                                )}
                            </FormItem>
                            <FormItem
                                {...Global.formItemLayout}
                                label="新科目代码">
                                {getFieldDecorator('tra_new_account_code', {
                                    rules: [{
                                        required: false, message: '输入新科目代码',
                                    }],
                                    initialValue:this.state.translationContent.new_account_code
                                })(
                                    <Input placeholder="输入新科目代码" style={{width:'100%'}}/>
                                )}
                            </FormItem>
                            <FormItem
                                {...Global.formItemLayout}
                                label="新科目名称"
                            >
                                {getFieldDecorator('tra_new_account_name', {
                                    rules: [{
                                        required: false, message: '输入新科目名称',
                                    }],
                                    initialValue:this.state.translationContent.account_name
                                })(
                                    <Input placeholder="输入新科目名称" style={{width:'100%'}}/>
                                )}
                            </FormItem>
                            <FormItem
                                {...Global.formItemLayout}
                                label="新计量单位">
                                {getFieldDecorator('tra_new_account_code2', {
                                    rules: [{
                                        required: false, message: '请输入计量单位',
                                    }],
                                    initialValue:this.state.translationContent.account_code2
                                })(
                                    <Input placeholder="输入计量单位" style={{width:'100%'}}/>
                                )}
                            </FormItem>
                            <FormItem
                                {...Global.formItemLayout}
                                label="新币别"
                            >
                                {getFieldDecorator('tra_new_curr_code', {
                                    rules: [{
                                        required: true, message: '请选择币别',
                                    }],
                                    initialValue:this.state.translationContent.curr_code
                                })(
                                    <Select placeholder="选择币别">
                                        {curr.map((data)=>{
                                            return  <Option value={data.curr_abrev} key={data.curr_abrev}>{data.currency}</Option>
                                        })}
                                    </Select>
                                )}
                            </FormItem>
                            <FormItem
                                {...Global.formItemLayout}
                                label="新属性"
                            >
                                {getFieldDecorator('tra_new_sb_type', {
                                    rules: [{
                                        required: true, message: '请选择科目属性',
                                    }],
                                    initialValue:this.state.translationContent.sb_type
                                })(
                                    <Select placeholder="选择科目属性">
                                        {this.state.sb_type.map((data)=>{
                                            return  <Option value={data.value} key={data.value}>{data.title}</Option>
                                        })}
                                    </Select>
                                )}

                            </FormItem>
                            <FormItem
                                {...Global.formItemLayout}
                                label="新科目状态"
                                required={true}
                                validateStatus="success"
                            >
                                {getFieldDecorator('tra_new_inactive', {
                                    rules: [{
                                        required: true, message: '请选择科目状态',
                                    }],
                                    initialValue:this.state.translationContent.inactive
                                })(
                                    <Select placeholder="选择科目状态">
                                        {this.state.inactive.map((data,index)=>{
                                            return  <Option value={data.value} key={data.value}>{data.title}</Option>
                                        })}
                                    </Select>
                                )}
                            </FormItem>
                            <h2 className="center">新科目组</h2>
                            <FormItem
                                {...Global.formItemLayout}
                                label="组编码(ID)"
                            >
                                {getFieldDecorator('tra_group_account_code', {
                                    rules: [{
                                        required: false, message: '输入新科目组编号',
                                    }],
                                    initialValue:this.state.translationContent.tra_group_account_code
                                })(
                                    <Input disabled placeholder="输入新科目组编号" style={{width:'100%'}}/>
                                )}
                            </FormItem>
                            <FormItem
                                {...Global.formItemLayout}
                                label="组名"
                            >
                                {getFieldDecorator('tra_group_account_name', {
                                    rules: [{
                                        required: false, message: '输入新科目组名',
                                    }],
                                    initialValue:this.state.translationContent.tra_group_account_name
                                })(
                                    <Input placeholder="输入新科目组名" style={{width:'100%'}}/>
                                )}
                            </FormItem>
                            <FormItem
                                {...Global.formItemLayout}
                                label="上级组"
                            >
                                {getFieldDecorator('tra_group_account_type', {
                                    rules: [{
                                        required: false, message: '选择上级组',
                                    }],
                                    initialValue:this.state.translationContent.tra_group_account_type
                                })(
                                    <Select placeholder="选择上级科目组">
                                        {this.state.trans.map((data,index)=>{
                                            return  <Option value={data.id} key={data.id} title={`${data.id}--${data.name}`}>
                                                <div style={{textIndent:(data.level||0)*0.75+'rem'}}>
                                                    {`${data.id}--${data.name}`}
                                                </div>
                                            </Option>
                                        })}
                                    </Select>
                                )}
                            </FormItem>
                            <FormItem
                                {...Global.formItemLayout}
                                label="科目组类别"
                            >
                                {getFieldDecorator('tra_group_class_id', {
                                    rules: [{
                                        required: false, message: '选择科目组类别',
                                    }],
                                    initialValue:this.state.translationContent.tra_group_class_id
                                })(
                                    <Select placeholder="选择科目组类别">
                                        {this.state.classList.map((data)=>{
                                            return  <Option value={data.key} key={data.key}>{`${data.key}--${data.value}`}</Option>
                                        })}
                                    </Select>
                                )}
                            </FormItem>
                        </Form>
                    </Modal>
                    <Modal
                        title={this.state.editParentContent.title}
                        visible={this.state.editParentModal}
                        onOk={() => this.setModalVisible.bind(this,'editParentModal',false)()}
                        onCancel={() => this.cancelModal.bind(this,'editParentModal')()}
                    >
                        <Form layout='horizontal' onSubmit={(e)=>{console.log(e)}}>
                            <FormItem
                                {...Global.formItemLayout}
                                label="科目代码"
                            >
                                {getFieldDecorator('editP_account_code', {
                                    rules: [{
                                        required: false, message: '输入科目代码',
                                    }],
                                    initialValue:this.state.editParentContent.account_code
                                })(
                                    <Input placeholder="输入科目代码" style={{width:'100%'}}/>
                                )}
                            </FormItem>
                            <FormItem
                                {...Global.formItemLayout}
                                label="新科目名称"
                            >
                                {getFieldDecorator('editP_account_name', {
                                    rules: [{
                                        required: false, message: '输入科目代码',
                                    }],
                                    initialValue:this.state.editParentContent.account_name
                                })(
                                    <Input placeholder="输入新科目名称" style={{width:'100%'}}/>
                                )}
                            </FormItem>
                            <FormItem
                                {...Global.formItemLayout}
                                label="选择上级科目组"
                            >
                                {getFieldDecorator('editP_parent', {
                                    rules: [{
                                        required: false, message: '选择上级科目组',
                                    }],
                                    initialValue:this.state.editParentContent.parent
                                })(
                                    <Select placeholder="选择上级科目组">
                                        {this.state.trans.map((data,index)=>{
                                            return  <Option value={data.id} key={data.id} title={`${data.id}--${data.name}`}>
                                                <div style={{textIndent:(data.level||0)*0.75+'rem'}}>
                                                    {`${data.id}--${data.name}`}
                                                </div>
                                            </Option>
                                        })}
                                    </Select>
                                )}
                            </FormItem>
                            <FormItem
                                {...Global.formItemLayout}
                                label="科目状态"
                            >
                                {getFieldDecorator('editP_inactive', {
                                    rules: [{
                                        required: true, message: '请选择科目状态',
                                    }],
                                    initialValue:this.state.editParentContent.inactive
                                })(
                                    <Select placeholder="选择科目状态">
                                        {this.state.inactive.map((data,index)=>{
                                            return  <Option value={data.value} key={data.value}>{data.title}</Option>
                                        })}
                                    </Select>
                                )}
                            </FormItem>
                        </Form>
                    </Modal>
                </div>
            );
        }

    }
    const AccountInit = Form.create()(Init);
    module.exports = AccountInit;
})();