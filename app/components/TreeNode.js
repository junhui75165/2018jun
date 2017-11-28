/**
 * Created by junhui on 2017/4/11.
 */
(function () {
    'use strict';
    let React = require('react');
    let { Card, Col, Row ,Button,Switch,Input ,
        message,Modal,Form,Select,Tag  } = require('antd');
    let Tree = require('rc-tree');
    let { TreeNode }  = require('rc-tree');
    //rc-tree版本在1.74出错，目前指定安装版本1.5.0（npm i rc-tree@1.5.0）
    // const TreeNode = Tree.TreeNode;
    let {GetLocalStorage,objToArr} = require('./../tool');
    let {Request,} = require('../request');
    const Global = require('../Global');
    const Search = Input.Search;
    const ButtonGroup = Button.Group;
    const FormItem = Form.Item;
    const Option = Select.Option;
    const addPNG = require('./../img/add.png');
    const mainPNG = require('./../img/main.png');
    const transPNG = require('./../img/trans.png');

    let expKeys = [];
    let curr = [];
    class TreePage extends React.Component{
        constructor(props){
            super(props);
            let blank = {
                title:'',
                account_name:'',
                account_code:'',
                account_code2:'',
                account_type:'',
                curr_code:'',
                sb_type:'',
                inactive:'',
            };
            this.state = {
                data :[],
                trans:[],
                classList:[],
                sb_type:[{title:'普通科目',value:'0'},{title:'数量单价科目',value:'1'},],
                inactive:[{title:'激活',value:'0'},{title:'无效',value:'1'},],
                inputValue: '',
                addModal:false,
                editModal:false,
                editParentModal:false,
                translationModal:false,
                addContent:blank,
                editContent:blank,
                editParentContent:{},
                translationContent:{},
                expandedKeys:[],
                autoExpandParent: true,
                openStop:true,
                stopTree:[],
            };
        }
        componentWillMount() {
            this.getTrans();
            this.getChartClass();
            this.goSearch();
            GetLocalStorage('currency').map((item)=>{
                if(item.inactive == 0){
                    curr.push(item);
                }
            })
        }

        componentWillReceiveProps(nextProps, nextContext) {
            // this.setState({
            //     data:objToArr(nextProps.data)
            // });
        }
        goSearch(){
            let type = {
                type: 'tree/get-all-tree',
                method: 'GET',
            };
            let callback = (dataSource) => {
                let list = dataSource.info;
                let stopTree = [];
                this.getStopList(list,stopTree);
                console.log(stopTree);
                this.setState({
                    data:objToArr(list),
                    stopTree
                },()=>{
                    if(this.props.resetTree){
                        this.props.resetTree();
                    }
                });
            };
            Request({}, callback, type);
        }
        getStopList(list,stopTree){
            list.map((a,f)=>{
                if(a.open){
                    this.getStopList(a.children,stopTree);
                }else {
                    if(a.inactive==1){
                        stopTree.push(a);
                    }
                }
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
        resetExpandAll(type){
            switch (type){
                case 'close':
                    expKeys = [];
                    this.setState({expandedKeys:[]});
                    break;
                case 'closeAll':
                    expKeys = [];
                    this.setState({expandedKeys:[]});
                    break;
                case 'open':
                    console.log('open the expKeys',expKeys);
                    expKeys = [];
                    this.searchList(this.state.inputValue,this.state.data);
                    this.setState({expandedKeys:expKeys,autoExpandParent: true},()=>{
                    });
                    break;
                case 'openAll':
                    this.searchList('',this.state.data);
                    this.setState({expandedKeys:expKeys,autoExpandParent: true});
                    console.log(expKeys);
                    break;
            }
        }
        onSelect(selectedKeys, info){
            console.log('selected', selectedKeys, info);
        };
        onExpand(expandedKeys) {
            // 展开/收起节点时触发
            // this.filterKeys = undefined;
            console.log('onExpand', arguments);
            this.setState({
                expandedKeys,
                autoExpandParent: false,
            });
        };
        onChange(event){
            const value = event.target.value;
            expKeys = [];
            this.setState({
                inputValue: value,
                // expandedKeys:[]
            });
        }
        searchList(value,data){
            // let allKeys = allKeys;
            data.map((item)=>{
                let {id,name} = item;
                if(id.toLocaleUpperCase().indexOf(value.toLocaleUpperCase()) > -1||
                    name.toLocaleUpperCase().indexOf(value.toLocaleUpperCase()) > -1){
                    let newKeys = expKeys.concat(id);
                    expKeys = Array.from(new Set(newKeys));
                    if(item.children){
                        this.searchList(value,item.children);
                    }

                }
                if(item.children){
                    this.searchList(value,item.children);
                }
            },()=>{
                console.log(expKeys);
            });
        }
        filterTreeNode(treeNode) {
            // console.log(treeNode.props.eventKey);
            // 根据 key 进行搜索，可以根据其他数据，如 value
            return this.filterFn(treeNode.props.eventKey,treeNode.props.val,treeNode.props.children);
        };
        filterFn(key,value,children) {
            //过滤函数通过返回true/false确定是否高亮显示
            if(this.state.inputValue && value.toLocaleUpperCase().indexOf(this.state.inputValue.toLocaleUpperCase()) > -1) {
                expKeys = expKeys.concat(key);
                expKeys = Array.from(new Set(expKeys));
                // console.log(expKeys);
                if(children&&children.length>0){
                    children.map((data)=>{
                        this.filterFn(data.key,data.props.val,data.props.children)
                    })
                }
                return true;
            }else if(children&&children.length>0){
                children.map((data)=>{
                    this.filterFn(data.key,data.props.val,data.props.children)
                })
            }
            return false;
        };
        addDetail(){
            this.setState({
                addContent:{
                    title:'新增科目',
                    account_name:'',
                    account_code:'',
                    account_code2:'',
                    account_type:'',
                    curr_code:GetLocalStorage('Const').curr_default||curr[0].curr_abrev,
                    sb_type:this.state.sb_type[0].value,
                    inactive:this.state.inactive[0].value,
                    noDisabled:true,
                }
            },()=>{
                console.log('addDetail next tree');
                this.setModalVisible('addModal',true);
            });
        }
        addNextTree(id,children,title,item){
            this.setState({
                addContent:{
                    title:'新增科目',
                    account_name:title,
                    account_code:children.length>0?(Number(children[children.length-1].id)+1):id+'001',
                    account_code2:'',
                    account_type:item.id,
                    curr_code:GetLocalStorage('Const').curr_default||curr[0].curr_abrev,
                    sb_type:this.state.sb_type[0].value,
                    inactive:this.state.inactive[0].value,
                }
            },()=>{
                console.log('addNextTree next tree',id);
                this.setModalVisible('addModal',true);
            });
        }
        editTree(id,children,title,item){
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
                    console.log('editTree next tree',id);
                    this.setModalVisible('editModal',true);
                });
            };
            this.chart_master(id,cb);
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
        editParentTree(id,children,title){
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
                    console.log('editParentTree next tree',id);
                    this.setModalVisible('editParentModal',true);
                });
            };
            this.chart_type(id,cb);
        }
        translationNextTree(id,children,title,item){
            let cb = (data)=>{
                let con = data.info.master;
                let tp = data.info.type;
                console.log('translationModal next tree',id);
                this.props.form.resetFields();//重置表格内容
                this.setState({
                    translationContent:{
                        title:'转为科目组',
                        account_name:title,
                        account_code:id,
                        new_account_code:id+'01',
                        tra_group_account_code:con.account_code,
                        tra_group_account_name:con.account_name,
                        tra_group_account_type:con.account_type,
                        tra_group_class_id:tp.class_id,
                        curr_code:GetLocalStorage('Const').curr_default||curr[0].curr_abrev,
                        sb_type:this.state.sb_type[0].value,
                        inactive:this.state.inactive[0].value,
                        account_code2:'',
                    }
                },()=>{
                    console.log('translationModal data'+this.state.translationContent);
                    this.setModalVisible('translationModal',true);
                });
            };
            this.itemToList(id,cb);
        }
        returnTitle(title,children,id,hasParent,item){
            /**
             * title:名称
             * children：子节点
             * id：标示符
             * hasParent：是否含有父节点
             * item：节点项 open:是否为节点
             * */
            if(item.open&&!hasParent){
                return <span >
                    {id+':'+title}
                    <img src={addPNG}
                         onClick={this.addNextTree.bind(this,id,children,title,item)}
                         title="新增下级目录"/>
                </span>
            }else if(item.open&&hasParent){
                return <span >
                    {id+':'+title}
                    <span></span>
                    <img src={mainPNG}
                         onClick={this.editParentTree.bind(this,id,children,title,item)}
                         title="编辑/删除"/>
                    <img src={addPNG}
                         onClick={this.addNextTree.bind(this,id,children,title,item)}
                         title="新增下级目录"/>
                </span>
            }else {
                return <span >
                    {id+':'+title} <span>{item.inactive==1?'(已停用)':''}</span>
                      <img src={mainPNG}
                           onClick={this.editTree.bind(this,id,children,title,item)}
                           title="编辑/删除"/>
                    <img src={transPNG}
                         onClick={this.translationNextTree.bind(this,id,children,title,item)}
                         title="科目转换为科目组/新增下级科目"/>
                </span>
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
                    this.getTrans();
                    this.getChartClass();
                    this.goSearch();
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
                    this.getTrans();
                    this.getChartClass();
                    this.goSearch();
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
                    this.getTrans();
                    this.getChartClass();
                    this.goSearch();
                    message.success(`科目组：${par.name}，修改成功`)
                });
            };
            Request(par,cb,type);
        }
        delSubject(){
            let edit = this.state.editParentContent;
            let par = {id:edit.account_code};
            let cb = (data)=>{
                this.setState({
                    editParentModal:false
                },()=>{
                    this.getTrans();
                    this.getChartClass();
                    this.goSearch();
                    message.success(`科目分组：${edit.account_name}，已删除！`);
                })
            };
            let url = {
                type:'chart-type/delete',
                method:'FormData',
                Method:'POST',
            };
            Request(par,cb,url);
        }
        delItem(){
            let edit = this.state.editContent;
            let par = {account_code:edit.account_code};
            let cb = (data)=>{
                this.setState({
                    editModal:false
                },()=>{
                    this.getTrans();
                    this.getChartClass();
                    this.goSearch();
                    message.success(`科目：${edit.account_name}，已删除！`)
                })
            };
            let url = {
                type:'chart-master/delete',
                method:'FormData',
                Method:'POST',
            };
            Request(par,cb,url);
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
                    this.getTrans();
                    this.getChartClass();
                    this.goSearch();
                    message.success(`科目：${item.tra_group_account_name}，转换科目组成功`)
                });
            };
            Request(par,cb,type);
        }
        RtTree(list,index){
            let tree;
            let openStop = this.state.openStop;
            tree = list.map((a,f)=>{
                if(openStop){
                    return <TreeNode val={a.id+':'+a.name}
                                     title={this.returnTitle(a.name,a.children,a.id,index>0,a)}
                                     key={a.id}>
                        {a.children&&a.children.length>0?this.RtTree(a.children,index+1):''}
                    </TreeNode>
                }else {
                    if(a.inactive!=1){
                        return <TreeNode val={a.id+':'+a.name}
                                         title={this.returnTitle(a.name,a.children,a.id,index>0,a)}
                                         key={a.id}>
                            {a.children&&a.children.length>0?this.RtTree(a.children,index+1):''}
                        </TreeNode>
                    }
                }
            });
            tree = tree.filter((item)=>{
                /*******过滤数组为空的数据*******/
                return item;
            });
            return tree;
        }
        changeStop(openStop){
            this.setState({openStop})
        }
        render() {
            const { getFieldDecorator } = this.props.form;
            let expandedKeys = this.state.expandedKeys;
            let autoExpandParent = this.state.autoExpandParent;
            if (this.filterKeys) {
                expandedKeys = this.filterKeys;
                autoExpandParent = true;
            }
            return (
                <div className="gen-certificate">
                    <Card id="components-tree-demo-customized-icon" title={<h1 className="certificate-title">{this.props.title}</h1>}
                          bordered={true}>
                        <Row>
                            <Search style={{ width: 300 }} placeholder="搜索科目编号或名称"
                                    value={this.state.inputValue}
                                    onSearch={this.resetExpandAll.bind(this,'open')}
                                    onChange={this.onChange.bind(this)} />
                        </Row>
                        <div className="genson-margin-top">
                            <ButtonGroup >
                                <Button type="primary" onClick={this.resetExpandAll.bind(this,'openAll')}>展开全部节点</Button>
                                <Button type="primary" onClick={this.resetExpandAll.bind(this,'closeAll')}>关闭全部节点</Button>
                            </ButtonGroup>
                            <Button type="primary" onClick={this.addDetail.bind(this)}
                                    style={{marginLeft:'1rem'}} icon="plus-circle-o">创建明细科目</Button>
                        </div>
                        <div className="genson-margin-top">
                                <span>显示停用科目：</span>
                                <Switch checked={this.state.openStop}
                                        onChange={this.changeStop.bind(this)}
                                        checkedChildren="开" unCheckedChildren="关"/>
                        </div>
                        <Row>
                            <Col xs={12}>
                                <Tree showIcon showLine filterTreeNode={this.filterTreeNode.bind(this)}
                                      onExpand={this.onExpand.bind(this)} expandedKeys={expandedKeys}
                                      autoExpandParent={autoExpandParent} selectable={false}
                                      onSelect={this.onSelect}
                                >
                                    {this.RtTree.bind(this,this.state.data,0)()}
                                </Tree>
                            </Col>
                            <Col xs={12} style={{display:this.state.openStop?'none':'block'}}>
                                <h2 className="center">停用科目(数量:{this.state.stopTree.length})</h2>
                                {
                                    this.state.stopTree.map((item)=>{
                                        return <Tag className="genson-margin-top" color="#108ee9">{item.id}-{item.name}</Tag>
                                    })
                                }
                            </Col>
                        </Row>

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
                                        <Select placeholder="选择科目组" optionLabelProp="title" disabled={!this.state.addContent.noDisabled}>
                                            {this.state.trans.map((data)=>{
                                                return  <Option title={`${data.id}--${data.name}`} value={data.id} key={data.id}>
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
                                                return <Option value={data.curr_abrev} key={data.curr_abrev}>{data.currency}</Option>;
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
                                    label="新科目代码"
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
                                        <Select placeholder="选择科目组" optionLabelProp="title">
                                            {this.state.trans.map((data)=>{
                                                return  <Option title={`${data.id}--${data.name}`} value={data.id} key={data.id}>
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
                                                return <Option value={data.curr_abrev} key={data.curr_abrev}>{data.currency}</Option>;
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
                            <Button onClick={this.delItem.bind(this)} className="genson-block-center" icon="delete" type="primary">删除科目</Button>
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
                                                return <Option value={data.curr_abrev} key={data.curr_abrev}>{data.currency}</Option>;
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
                                        <Select placeholder="选择上级科目组" optionLabelProp="title">
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
                                        <Input placeholder="输入科目代码" disabled style={{width:'100%'}}/>
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
                                        <Select placeholder="选择上级科目组" optionLabelProp="title">
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
                            <Button onClick={this.delSubject.bind(this)} className="genson-block-center" icon="delete" type="primary">删除科目分组</Button>
                        </Modal>
                    </Card>
                </div>
            );
        }
    }
    TreePage = Form.create({})(TreePage);
    module.exports = TreePage;
})();
