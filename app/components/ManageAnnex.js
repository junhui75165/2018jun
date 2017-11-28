/**
 * Created by junhui on 2017/6/21.
 */
(function () {
    'use strict';
    let React = require('react');
    let moment = require('moment');
    let {Request, } = require('../request');
    let { Col, Row ,Button,Table,Input,Popconfirm,Tag,Upload,
        DatePicker,Select,message,Modal,Steps} = require('antd');
    const Step = Steps.Step;
    const {GetLocalStorage} = require('../tool');
    const {upload} = require('../Global');
    const RangePicker = DatePicker.RangePicker;
    const Option = Select.Option;
    const Global = require('../Global');
    const { CheckableTag } = Tag;
    class ManageAnnex extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                date:[moment().startOf('month'),moment().endOf('month')],
                fileType:['Excel','Pdf'],
                type:'Excel',
                step:0,
                tag:[],
                fileList:[],
                name:'',
                table:[],
                textarea:'',
                loading:false,
                visible:false,
                subTag:[],
                modal:{},
                showImg:false,
                upload:false,
                edit:false,
            }
        }

        componentDidMount() {
            this.getTagList();
        }

        getFileList(){
            const url = {
                type:'attachments-file/get-att',
                method:'FormData',
                Method:'POST'
            };
            let sign_id=[];
            let par = {};
            let i = 0;
            this.state.tag.map((item)=>{
               if(item.tag){
                   // sign_id.push(item.id);
                   par[`sign_id[${i}]`] = item.id;
                   i++;
               }
            });
            par.trans_from_date = moment(this.state.date[0]).format('YYYY-MM-D');
            par.trans_to_date = moment(this.state.date[1]).format('YYYY-MM-D');
            let cb = (data)=>{
                data.info.map((item)=>{
                    item.key = item.id;
                });
                this.setState({
                    table:data.info,
                    loading:false
                })
            };
            this.setState({
                loading:true
            },()=>{
                Request(par,cb,url);
            });
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
                this.setState({
                    tag:data.info,
                },()=>{
                    this.getFileList();
                })
            };
            Request({},cb,url);
        }

        changeDate(date){
            this.setState({
                date:date,
            },()=>{
                // console.log(date)
            })
        }
        changeTag(index,value){
            let list = this.state.tag;
            list[index].tag = value;
            this.setState({
                tag:list
            },()=>{
                this.getFileList();
                console.log(this.state.tag[index])
            })
        }
        changeFileType(value){
            this.setState({
                type:value
            })
        }
        setStep(value){
            this.setState({
                step:value
            })
        }
        uploadFile(info){
            let fileList = info.fileList;
            console.log(fileList);
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
                    message.success('上传文件成功！');
                    this.setState({
                        visible:false,
                        fileList:[],
                        textarea:'',
                        name:'',
                        subTag:[],
                        upload:false,
                        edit:false,
                    },()=>{
                        this.setStep(4);
                        this.getFileList();
                    })
                }else {
                    message.error('上传文件出错：'+response.message)
                }
            }
            if(info.file.status == 'done'){
                setTimeout(()=>{
                    this.setState({ fileList:[] });
                })
            }else {
                this.setState({ fileList });
            }
        }
        changeContent(type,e){
            //设置文件备注
            let value = e.target?e.target.value:e;
            let state = this.state;
            state[type] = value;
            this.setState({state},()=>{
                if(type == 'textarea'&&value){
                    this.setStep(1);
                }else if(type == 'name'&&value){
                    this.setStep(3);
                }
            })
        }
        deleteFile(item){
            const url = {
                type:'attachments-file/delete-att',
                method:'FormData',
                Method:'POST'
            };
            let cb = (data)=>{
                message.success(`${data.info}`);
                this.getFileList();
            };
            let par = {att_id:item.id};
            Request(par,cb,url);
        }
        openFile(item){
            this.setState({
                modal:item,
            },()=>{
                if(item.filetype.indexOf('image')>-1){
                    this.setState({
                        showImg:true,
                    })
                }else {
                    window.open(item.url);
                }
            });
        }
        editFile(item){
            this.setState({
                modal:item,
                subTag:item.sign_id?item.sign_id.split(','):[],
                textarea:item.description,
                name:item.filename,
                fileList:[],
                edit:true
            },()=>{
                let step = 0;
                if(this.state.name){
                    step = 3;
                }else if(this.state.subTag.length>0){
                    step = 2;
                }else if(this.state.textarea){
                    step = 1;
                }
                this.setState({
                    visible:true,
                    step:step
                });
            })
        }
        hideModal(){
            this.setState({
                visible:false,
                showImg:false,
                edit:false,
                fileList:[],
                modal:{},
                textarea:'',
                name:'',
                subTag:[]
            })
        }
        showModal(){
            this.setState({
                visible:true,
                step:0,
            })
        }
        changeSelect(value){
            console.log(value);
            this.setState({
                subTag:value
            },()=>{
                this.setStep(2);
            })
        }
        beforeUpload(file, fileList){
            this.setState({
                upload:file
            });
            return false;
        }
        delayUpload(){
            const url = {
                type:'attachments-file/update-att',
                method:'FormData',
                Method:'POST',
            };
            let cb = (data)=>{
                message.success('修改成功');
                this.setState({
                    visible:false,
                    fileList:[],
                    textarea:'',
                    subTag:[],
                    upload:false,
                    edit:false,
                },()=>{
                    this.getFileList();
                })
            };
            let par = {};
            par['description'] = this.state.textarea;
            par['file_name'] = this.state.name;
            this.state.subTag.map((item,index)=>{
                par[`sign_id[${index}]`] = item;
            });
            par['att_id'] = this.state.modal.id;
            this.setState({
                fileList:[this.state.upload]
            },()=>{
                Request(par,cb,url);
            });
        }
        changeSize(pageSize){
            this.setState({pageSize})
        }
        render() {
            const columns = [
                {
                    title:'文件名称',
                    dataIndex:'filename',
                    key:'filename'
                },
                {
                    title:'文件类型',
                    dataIndex:'filetype',
                    key:'filetype'
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
                        let sign = this.state.tag.filter((item)=>{
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
                    title:'文件查看',
                    dataIndex:'preview',
                    key:'preview',
                    render:(text,item)=>{
                        return<Button shape="circle" icon="search" onClick={this.openFile.bind(this,item)}/>
                    }
                },
                {
                    title:'文件编辑',
                    dataIndex:'edit',
                    key:'edit',
                    render:(text,item)=>{
                        return<Button shape="circle" icon="edit" onClick={this.editFile.bind(this,item)}/>
                    }
                },
                {
                    title:'删除',
                    dataIndex:'delete',
                    key:'delete',
                    render:(text,item)=>{
                        return <Popconfirm placement="leftTop" title="是否删除该文件？"
                                           onConfirm={this.deleteFile.bind(this,item)} okText="是" cancelText="否">
                            <Button shape="circle" icon="delete"/>
                        </Popconfirm>
                    }
                }
            ];
            const props = {
                name: 'AttachmentsFile[files]',
                action: upload,
                multiple: true,
                // beforeUpload:this.beforeUpload.bind(this),
                data:(file)=>{
                    let par ={};
                    par['description'] = this.state.textarea||'';
                    par['file_name'] = this.state.name||'';
                    this.state.subTag.map((item,index)=>{
                        par[`sign_id[${index}]`] = item;
                    });
                    return par;
                },
                onPreview:(file)=>{
                    if(file.response&&file.response.code==0){
                        window.open(file.response.info);
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
            const EditProps = {
                name: 'AttachmentsFile[files]',
                action: Global.cmpUrl+'/attachments-file/update-att',
                multiple: true,
                // beforeUpload:this.beforeUpload.bind(this),
                data:(file)=>{
                    let par ={};
                    par['description'] = this.state.textarea||'';
                    par['file_name'] = this.state.name||'';
                    this.state.subTag.map((item,index)=>{
                        par[`sign_id[${index}]`] = item;
                    });
                    par['att_id'] = this.state.modal.id;
                    return par;
                },
                onPreview:(file)=>{
                    if(file.response&&file.response.code==0){
                        window.open(file.response.info);
                    }
                },
                defaultFileList:this.state.fileList,
                headers: {
                    'access-token':GetLocalStorage('token'),
                },
                onChange:this.uploadFile.bind(this),
                supportServerRender:true,
                // customRequest:this.uploadReq.bind(this)
            };
            return (
                <div>
                    <Row type="flex" justify="space-between">
                        <Col xs={10} style={{lineHeight:'2.5rem'}}>
                            上传时间：<RangePicker defaultValue={this.state.date}
                                              ranges={{
                                                  '今日': [moment(), moment()],
                                                  '本月': [moment().startOf('month'), moment().endOf('month')],
                                                  '上月': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
                                                  '今年': [moment().startOf('year'), moment().endOf('year')],
                                                  '去年': [moment().subtract(1, 'year').startOf('year'), moment().subtract(1, 'year').endOf('year')],
                                              }}
                                              onChange={this.changeDate.bind(this)}/>
                        </Col>
                        <Col xs={6}>
                            文件类型：<Select style={{width:'6rem'}} defaultValue={this.state.type} onChange={this.changeFileType.bind(this)}>
                                {this.state.fileType.map((item)=>{
                                    return<Option key={item} value={item}>{item}</Option>
                                })}
                            </Select>
                        </Col>
                        <Col xs={4}>
                            <Button icon="search" type="primary" onClick={this.getFileList.bind(this)}>查询</Button>
                        </Col>
                        <Col xs={4}>
                            每页显示条数：
                            <Select defaultValue={this.state.pageSize}
                                    style={{width:"6rem"}} allowClear
                                    onChange={this.changeSize.bind(this)}>
                                <Option value={50}>50</Option>
                                <Option value={100}>100</Option>
                                <Option value={200}>200</Option>
                                <Option value={500}>500</Option>
                            </Select>
                        </Col>
                    </Row>
                    <Row className="genson-margin-top" type="flex" justify="start" align="middle">
                        <Col xs={3}>
                            文件类型筛选：
                        </Col>
                        <Col xs={17} >
                            {this.state.tag.map((item,index)=>{
                                return<CheckableTag key={item.id}  color="green" checked={item.tag}
                                                    onChange={this.changeTag.bind(this,index)}>
                                            {item.name}
                                    </CheckableTag >;
                            })}
                        </Col>
                    </Row>
                    <Row className="genson-margin-top">
                        <Col><Button icon="plus-circle" type="primary" onClick={this.showModal.bind(this)}>添加附件</Button></Col>
                    </Row>
                    <div className="certificate-table">
                        <Table bordered pagination={{pageSize:Number(this.state.pageSize)}} size="small" loading={this.state.loading}
                               dataSource={this.state.table} columns={columns}/>
                    </div>
                    <Modal visible={this.state.visible} onCancel={this.hideModal.bind(this)} footer={null} width="720"
                            title={this.state.edit?'修改附件':'添加附件'} onOk={this.delayUpload.bind(this)}>
                        <Row>
                            <Col lg={6} style={{borderRight:'2px solid grey'}}>
                                <Steps direction="vertical" current={this.state.step}>
                                    <Step title="第一步" description="添加备注"/>
                                    <Step title="第二步" description="选择附件标签"/>
                                    <Step title="第三步" description="设置文件名称"/>
                                    <Step title="第四步" description="选择上传的附件"/>
                                </Steps>
                            </Col>
                            <Col lg={18}>
                                <Row className="genson-margin-top">
                                    <Col lg={4} offset={4} xs={21}>
                                        文件备注：
                                    </Col>
                                    <Col lg={12} xs={24}>
                                        <Input type="textarea" style={{width:'100%'}}
                                               onChange={this.changeContent.bind(this,'textarea')}
                                               autosize={{minRows: 2}} value={this.state.textarea}/>
                                    </Col>
                                </Row>
                                <Row className="genson-margin-top">
                                    <Col lg={4} offset={4} xs={21} >
                                        文件标签：
                                    </Col>
                                    <Col lg={12} xs={24}>
                                        <Select mode="tags" value={this.state.subTag}
                                                style={{ width: '100%' }} onChange={this.changeSelect.bind(this)}>
                                            {this.state.tag.map((item,index)=>{
                                                return<Option key={item.id} value={item.id}
                                                              onChange={this.changeTag.bind(this,index)}>
                                                    {item.name}
                                                </Option >;
                                            })}
                                        </Select>

                                    </Col>
                                </Row>
                                <Row className="genson-margin-top">
                                    <Col lg={4} offset={4} xs={21}>
                                        文件名称：
                                    </Col>
                                    <Col lg={12} xs={24}>
                                        <Input type="text" style={{width:'100%'}}
                                               onChange={this.changeContent.bind(this,'name')}
                                               value={this.state.name}/>
                                    </Col>
                                </Row>
                                <Row className="genson-margin-top" style={{display:this.state.edit?'block':'none'}}>
                                    <Col lg={8} offset={4}>不更改文件内容直接提交</Col>
                                    <Button lg={4} type="primary" onClick={this.delayUpload.bind(this)}>提交</Button>
                                </Row>
                                <Row className="genson-margin-top">
                                    <Col lg={6}  offset={4}>
                                        <Upload {...this.state.edit?EditProps:props}>
                                            <Button type="primary" icon="upload">
                                                选择附件上传
                                            </Button>
                                        </Upload>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Modal>
                    <Modal visible={this.state.showImg} footer={null} onCancel={this.hideModal.bind(this)}>
                        <img alt={this.state.modal.name} style={{ width: '100%' }}
                             src={this.state.modal.url||this.state.modal.url_thumb} />
                    </Modal>
                </div>
            );
        }
    }

    module.exports = ManageAnnex;
})();