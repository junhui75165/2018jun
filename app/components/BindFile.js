/**
 * Created by junhui on 2017/6/29.
 */
(function () {
    'use strict';
    let React = require('react');
    let moment = require('moment');
    let {Request} = require('./../request');
    let {hashHistory} = require('react-router');
    let {Col, Row ,Button,Input ,Modal,Steps,
        Table,Icon,message,Upload,Tag } = require('antd');
    const { CheckableTag } = Tag;
    const Step = Steps.Step;
    let {GetLocalStorage,} = require('./../tool');
    const {upload} = require('../Global');
    class BindFile extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                fileList: [],
                step:0,
                upload:{textarea:'',tag:[],name:''},
                visible:false,
                table:[],
                selectedRowKeys:[],
                Keys:[],
                KeysItem:[],
                modal:{},
                showImg:false,
                showEye:[],
                imgList:[],
                nextDis:false,
                preDis:false
            }
        }
        componentDidMount() {
            this.getTagList();
            this.getTableList();
            if(this.props.defaultAttId.length>0){
                this.setState({
                    Keys:this.props.defaultAttId
                },()=>{
                    this.getFileList(this.state.Keys)
                })
            }
        }

        componentWillReceiveProps(nextProps, nextContext) {
            if(nextProps.defaultAttId&&nextProps.defaultAttId.length>0){
                this.setState({
                    Keys:nextProps.defaultAttId
                },()=>{
                    this.getFileList(this.state.Keys)
                })
            }
        }

        getTagList(){
            const url = {
                type:'attachments-sign/get-list',
                method:'GET'
            };
            let cb = (data)=>{
                data.info.map((item)=>{
                    item.tag = false;
                });
                let upload = this.state.upload;
                upload.tag = data.info;
                this.setState({
                    upload:upload,
                },()=>{
                    this.getFileList();
                })
            };
            Request({},cb,url);
        }
        getTableList(){
            /*******获取未绑定附件文件列表*******/
            const url = {
                type:'attachments-file/get-not-bound-att',
                method:'FormData',
                Method:'POST'
            };
            let cb = (data)=>{
                data.info.map((item)=>{
                    item.key = item.id;
                });
                this.setState({
                    table:data.info,
                })
            };
            Request({},cb,url);
        }
        getFileList(id){
            /*******根据id获取附件详情*******/
            const url = {
                type:'attachments-file/get-att',
                method:'FormData',
                Method:'POST'
            };
            let par = {};
            let IdCd = (data)=>{
                this.setState({KeysItem:data.info});
            };
            if(id){
                if(Array.isArray(id)){
                    id.map((item,index)=>{
                        par[`att_id[${index}]`] = item;
                    })
                }else {
                    par.att_id = id;
                }
                Request(par,IdCd,url);
            }
        }
        setUpload(type,e){
            let value = e.target?e.target.value:e;
            let upload = this.state.upload;
            upload[type] = value;
            this.setState({
                upload:upload
            })
        }
        setStep(value){
            let canSet = false;
            switch (value){
                case 1:
                    canSet = !!this.state.upload.textarea;
                    break;
                case 2:
                    let length = 0;
                    this.state.upload.tag.map((item)=>{
                        if(item.tag){
                            length++;
                        }
                    });
                    canSet = length>0;
                    break;
                case 3:
                    canSet = !!this.state.upload.name;
                    break;
                case 4:
                    canSet = this.state.fileList.length>0;
                    break;
            }
            if(canSet){
                this.setState({
                    step:value
                })
            }
        }
        changeTag(index,value){
            let upload = this.state.upload;
            let list = upload.tag;
            list[index].tag = value;
            this.setState({
                upload:upload
            },()=>{
                this.setStep(2);
            })
        }
        uploadFile(info){
            let fileList = info.fileList;
            fileList = fileList.map((file) => {
                if (file.response) {
                    file.url = file.response.url;
                }
                return file;
            });
            fileList = fileList.filter((file) => {
                if (file.response) {
                    return file.response.status === 'success';
                }
                return true;
            });
            if(info.file&&info.file.response&&info.file.status!='removed'){
                let response = info.file.response;
                if(response.code == 0){
                    message.success('上传成功！',);
                    this.setStep(4);
                    this.setState({
                        Keys:[response.info].concat(this.state.Keys)
                    },()=>{
                        this.getTableList();
                        // this.getFileList(response.info);
                        this.props.setAttId(this.state.Keys);
                    });
                }else {
                    message.error('上传文件出错'+response.message)
                }
            }
            this.setState({ fileList });
        }
        openModal(){
            this.setState({
                visible:true,
                selectedRowKeys:Object.assign([],this.state.Keys)
            })
        }
        closeModal(){
            this.setState({
                visible:false,
            })
        }
        closeImg(e){
            this.setState({
                showImg:false,
                modal:{}
            })
        }
        openImg(item,list,preDis,nextDis){
            this.setState({
                showImg:true,
                modal:item,
                imgList:list,
                preDis,nextDis
            })
        }
        changeRowKeys(selectedRowKeys,selectedRows){
            this.setState({
                selectedRowKeys,
            },()=>{
                console.info(selectedRowKeys,selectedRows)
            })
        }
        switchSetType(){
            // this.props.switchSetType(515);
            hashHistory.push('/mainPage/515');
        }
        rtAttId(){
            this.setState({
                visible:false,
                Keys:this.state.selectedRowKeys
            },()=>{
                this.props.setAttId(this.state.Keys);
            })
        }
        clearBind(){
            this.setState({
                Keys:[],
                KeysItem:[],
                selectedRowKeys:[]
            },()=>{
                this.props.setAttId(this.state.Keys);
            })
        }
        tagClose(key){
            let Keys = this.state.Keys;
            let KeysItem = this.state.KeysItem;
            let img = this.refs["img"+key];
            let show = this.refs["show"+key];
            img.style.opacity = 0;
            setTimeout(()=>{
                Keys.splice(key,1);
                KeysItem.splice(key,1);
                this.setState({
                    Keys,KeysItem
                })
            },300);
        }
        setEye(key,value){
            let showEye = this.state.showEye;
            showEye[key] = value;
            this.setState({showEye})
        }
        addFile(){
            this.setState({addFile:true})
        }
        closeFile(){
            this.setState({addFile:false})
        }
        setSize(type,e){
            let target = e.currentTarget;
            if(type == 'l'){
                target.style.fontSize = '25px';
            }else if(type == 's'){
                target.style.fontSize = '';
            }
        }
        changImg(type,id){
            let index;
            let {nextDis,preDis} = this.state;
            this.state.imgList.map((item,i)=>{
                if(id == item.id){
                    if(type == 'next' && i <(this.state.imgList.length-1)){
                        index = i+1;
                    }else if(type == 'pre' && i > 0){
                        index = i-1;
                    }
                    preDis = index == 0;
                    nextDis = index == (this.state.imgList.length-1);
                }
            });
            this.setState({
                modal:this.state.imgList[index],
                nextDis,preDis
            })
        }
        render() {
            const props = {
                name: 'AttachmentsFile[files]',
                action: upload,
                multiple: true,
                data:(file)=>{
                    let par ={};
                    // par['Refs[files]'] = file;
                    par['description'] = this.state.upload.textarea||'';
                    par['file_name'] = this.state.upload.name||'';
                    let i = 0;
                    this.state.upload.tag.map((item)=>{
                       if(item.tag){
                           par[`sign_id[${i}]`] = item.id;
                           i++;
                       }
                    });
                    return par;
                },
                onPreview:(file)=>{
                    if(file.response&&file.response.code==0){
                        window.open(file.response.info)
                    }
                },
                fileList:this.state.fileList,
                headers: {
                    'access-token':GetLocalStorage('token'),
                },
                onChange:this.uploadFile.bind(this),
                supportServerRender:true,
                // customRequest:this.uploadReq.bind(this)
            };
            const columns = [
                {
                    title:'文件名称',
                    dataIndex:'filename',
                    key:'filename'
                },
                {
                    title:'上传时间',
                    dataIndex:'tran_date',
                    key:'tran_date',
                    sorter: (a, b) => new Date(a.tran_date) - new Date(b.tran_date),
                },
                {
                    title:'文件大小',
                    dataIndex:'filesize',
                    key:'filesize',
                    sorter: (a, b) => a.filesize - b.filesize,
                    render:(text,item)=>{
                        if(item.filesize>1024*1024){
                            return Number(item.filesize/(1024*1024)).toFixed(2)+'M';
                        }else if(item.filesize>1024){
                            return (item.filesize/1024).toFixed(2)+'K';
                        }else {
                            return Number(item.filesize).toFixed(2)+'B';
                        }
                    }
                },
                {
                    title:'文件标签',
                    dataIndex:'sign_id',
                    key:'sign_id',
                    render:(text)=>{
                        let sign = this.state.upload.tag.filter((item)=>{
                            if(text){
                                return text.indexOf(item.id)>-1
                            }
                        });
                        let list = sign.map((item)=>{
                            return item.name;
                        });
                        return list.toString();
                    }
                },
                {
                    title:'文件备注',
                    dataIndex:'description',
                    key:'description'
                },
                {
                    title:'图片预览',
                    dataIndex:'open',
                    key:'open',
                    render:(text,item)=>{
                        let show = item.filetype.indexOf('image')>-1;
                        let index;
                        this.state.table.map((con,i)=>{
                            if(con.id == item.id){
                                index = i;
                            }
                        });
                        return<Button icon="search" shape="circle" disabled={!show} onClick={this.openImg.bind(this,item,this.state.table,index==0,index==(this.state.table.length-1))}/>
                    }
                },
            ];
            return (
                <div>
                    <h2 className="genson-margin-top">
                        你也可以为凭证绑定附件：
                    </h2>
                    <div className="genson-margin-top" style={{display:this.state.Keys.length>0?'block':'none'}}>
                        当前绑定附件：{this.state.KeysItem.map((item,index)=>{
                            return <div className="genson-thumbnail"
                                        onMouseOver={this.setEye.bind(this,index,true)}
                                        onMouseOut={this.setEye.bind(this,index,false)}>
                                <img key={item.id} ref={'img'+index}
                                     src={item.url_thumb} alt={item.filename} title={item.filename}/>
                                <div className={this.state.showEye[index]?'setBlock show':'show'}
                                     title={item.filename} ref={'show'+index}>
                                    <Icon type="eye-o" onMouseOver={this.setSize.bind(this,'l')}
                                          onMouseOut={this.setSize.bind(this,'s')}
                                          onClick={this.openImg.bind(this,item,this.state.KeysItem,index==0,index==(this.state.KeysItem.length-1))}/>
                                    <Icon type="delete" onMouseOver={this.setSize.bind(this,'l')}
                                          style={{marginLeft:"2rem"}}
                                          onMouseOut={this.setSize.bind(this,'s')}
                                          onClick={this.tagClose.bind(this,index)}/>
                                </div>
                            </div>
                    })}
                        <Button onClick={this.clearBind.bind(this)}>清空绑定的附件</Button>
                    </div>
                    <div className="genson-margin-top genson-font-bold">方法一：</div>
                    <Row className="genson-margin-top">
                        <Col xs={6}>
                            <Button type="primary" style={{backgroundColor:'#49a9ee'}} icon="plus-circle"
                                    onClick={this.addFile.bind(this)}>添加附件</Button>
                        </Col>
                    </Row>
                    <div className="genson-margin-top genson-font-bold">方法二：</div>
                    <Row className="genson-margin-top">
                        <Col xs={6}>
                            <Button type="primary" style={{backgroundColor:'#49a9ee'}} icon="retweet" onClick={this.openModal.bind(this)}>绑定已存在的附件</Button>
                        </Col>
                    </Row>
                    <Modal visible={this.state.addFile} title="添加附件" width="720" footer={null}
                           onOk={this.addFile.bind(this)} onCancel={this.closeFile.bind(this)}>
                        <Row>
                            <Col lg={6}>
                                <Steps  style={{borderRight:'2px solid grey'}}
                                        direction="vertical" current={this.state.step}>
                                    <Step title="第一步" description="添加备注"/>
                                    <Step title="第二步" description="选择附件标签"/>
                                    <Step title="第三步" description="设置文件名称"/>
                                    <Step title="第四步" description="上传的附件"/>
                                </Steps>
                            </Col>

                            <Col lg={18}>
                                <Row className="genson-margin-top">
                                    <Col lg={4} offset={4} xs={21}>
                                        文件备注：
                                    </Col>
                                    <Col lg={12} xs={24}>
                                        <Input type="textarea" value={this.state.upload.textarea}
                                               onChange={this.setUpload.bind(this,'textarea')} onBlur={this.setStep.bind(this,1)}
                                               autosize={{minRows:2,maxRows:5}}/>
                                    </Col>
                                </Row>
                                <Row className="genson-margin-top">
                                    <Col lg={4} offset={4} xs={21} >
                                        文件标签：
                                    </Col>
                                    <Col lg={12} xs={24}>
                                        {this.state.upload.tag.map((item,index)=>{
                                            return<CheckableTag key={item.id} checked={item.tag}
                                                                onChange={this.changeTag.bind(this,index)}>
                                                {item.name}
                                            </CheckableTag >;
                                        })}
                                        {this.state.upload.tag.length==0?'尚未添加文件标签':''}
                                    </Col>
                                </Row>
                                <Row className="genson-margin-top">
                                    <Col lg={4} offset={4} xs={21}>
                                        文件名称：
                                    </Col>
                                    <Col lg={12} xs={24}>
                                        <Input value={this.state.upload.name} onChange={this.setUpload.bind(this,'name')}
                                               onBlur={this.setStep.bind(this,3)}/>
                                    </Col>
                                </Row>
                                <Row className="genson-margin-top">
                                    <Col lg={6}  offset={4}>
                                        <Upload {...props} style={{width:'100%'}}>
                                            <Button type="primary" style={{backgroundColor:'#49a9ee',width:'100%'}}  icon="upload">
                                                上传附件
                                            </Button>
                                        </Upload>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Modal>
                    <Modal visible={this.state.visible} title="绑定附件" width="960" onOk={this.rtAttId.bind(this)}
                           onCancel={this.closeModal.bind(this)}>
                        <div className="gen-font-grey">如果需要修改附件内容可以在这里更改：<a onClick={this.switchSetType.bind(this)}>设置--维护--附件管理</a></div>
                        <Table className="certificate-table"
                               rowSelection={{selectedRowKeys:this.state.selectedRowKeys,onChange:this.changeRowKeys.bind(this)}}
                               columns={columns} dataSource={this.state.table} size="small" bordered />
                    </Modal>
                    <Modal visible={this.state.showImg} footer={null} onCancel={this.closeImg.bind(this)}>
                        <img alt={this.state.modal.description||this.state.modal.unique_name}
                             style={{ width: '100%' }} src={this.state.modal.url} />
                        <div className="genson-bind-img">
                            <Row type="flex" justify="space-between">
                                <Button icon="left-circle" shape="circle" size="large"
                                        disabled={this.state.preDis}
                                        onClick={this.changImg.bind(this,'pre',this.state.modal.id)}/>
                                <Button icon="right-circle" shape="circle" size="large"
                                        disabled={this.state.nextDis}
                                        onClick={this.changImg.bind(this,'next',this.state.modal.id)}/>
                            </Row>
                        </div>
                    </Modal>
                </div>
            );
        }

    }
    module.exports = BindFile;
})();