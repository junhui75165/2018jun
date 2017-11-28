/**
 * Created by junhui on 2017/6/7.
 */
(function () {
    'use strict';
    let React = require('react');
    const Global = require('../Global');
    let {GetLocalStorage,getDateVnum} = require('../tool');
    let {Request} = require('../request');
    let DatePicker = require('react-datepicker');
    let moment = require('moment');
    let { Upload, Col, Row ,Button ,Icon,message,Modal,Input,Popover} = require('antd');
    const Dragger = Upload.Dragger;
    require('react-datepicker/dist/react-datepicker.css');
    class RangDate extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                searchDate:this.props.searchDate,
                startDate: this.props.searchDate[0],
                endDate: this.props.searchDate[1],
                dateVnum:{vnum:'',date_:moment().format('YYYY-MM-D')},
                visible:false
            };
        }
        componentDidMount() {
            let cb = (data)=>{
                let date_ = [];
                date_[0] = moment(data.date_).startOf('month');
                date_[1] = moment(data.date_).endOf('month');
                this.setState({
                    searchDate:date_,
                    startDate: date_[0],
                    endDate: date_[1],
                    dateVnum:data
                });
            };
            getDateVnum(cb);
        }

        componentWillReceiveProps(nextProps, nextContext) {
            this.setState({
                searchDate:nextProps.searchDate,
                startDate: nextProps.searchDate[0],
                endDate: nextProps.searchDate[1],
            })
        }

        handleChangeStart(data){
            this.setState({
                startDate:data
            })
        }
        handleChangeEnd(data){
            this.setState({
                endDate:data
            })
        }
        changeDate(date){
            this.setState({
                startDate:date[0],
                endDate:date[1],
            })
        }
        hideDate(){
            this.setState({
                visible:false,
                startDate: this.state.searchDate[0],
                endDate: this.state.searchDate[1],
            })
        }
        handleOk(){
            this.setState({visible:false},()=>{
                this.props.changeDate([this.state.startDate,this.state.endDate])
            })
        }
        handleVisibleChange(visible){
            this.setState({visible},()=>{
                if(!visible){
                    this.setState({
                        startDate: this.state.searchDate[0],
                        endDate: this.state.searchDate[1],
                    })
                }
            })
        }
        render() {
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
                        date:[moment(startYear).subtract(1,'year').startOf('month'), moment(endYear).subtract(1,'year').endOf('month')],
                    }
                },
                {
                    from:{
                        title:'往前一个月',
                        icon:'left',
                        date:[moment(this.state.startDate).subtract(1, 'month').startOf('month'), moment(this.state.endDate).subtract(1, 'month').endOf('month')],
                    },
                    to:{
                        title:'往后一个月',
                        icon:'right',
                        date:[moment(this.state.startDate).add(1, 'month').startOf('month'), moment(this.state.endDate).add(1, 'month').endOf('month')],
                    }
                },
                {
                    from:{
                        title:'往前一年',
                        icon:'double-left',
                        date:[moment(this.state.startDate).subtract(1, 'year'), moment(this.state.endDate).subtract(1, 'year')],
                    },
                    to:{
                        title:'往后一年',
                        icon:'double-right',
                        date:[moment(this.state.startDate).add(1, 'year'), moment(this.state.endDate).add(1, 'year')],
                    }
                },
            ];
            const content = <div>
                <Row style={{width:"780px",paddingBottom:0}} className="am-padding" type="flex" justify="space-around">
                    <Col xs={8} className="am-padding">
                        <Row type="flex" justify="space-around">
                            <Col xs={10} className="center">
                                <Input disabled value={moment(this.state.startDate).format('YYYY-MM-DD')}/>
                            </Col>
                            <Col xs={4} className="center">至</Col>
                            <Col xs={10} className="center">
                                <Input disabled value={moment(this.state.endDate).format('YYYY-MM-DD')}/>
                            </Col>
                        </Row>
                        {
                            ranges.map((item,key)=>{
                                return<Row key={key} type="flex" justify="space-around">
                                    <Col xs={11} className="genson-margin-top">
                                        <Button icon={item.from.icon?item.from.icon:null} onClick={this.changeDate.bind(this,item.from.date)} style={{width:'100%'}}>
                                            {item.from.title}
                                        </Button>
                                    </Col>
                                    <Col xs={11} className="genson-margin-top">
                                        <Button  onClick={this.changeDate.bind(this,item.to.date)} style={{width:'100%'}}>
                                            {item.to.title}
                                            <Icon type={item.to.icon?item.to.icon:null} />
                                        </Button>
                                    </Col>
                                </Row>
                            })
                        }
                    </Col>
                    <Col xs={14}>
                        <Col xs={12}>
                            <DatePicker
                                inline
                                maxDate={this.state.endDate}
                                showMonthDropdown
                                showYearDropdown
                                dropdownMode="select"
                                selected={this.state.startDate}
                                selectsStart
                                startDate={this.state.startDate}
                                endDate={this.state.endDate}
                                onChange={this.handleChangeStart.bind(this)}
                            />
                        </Col>
                        <Col xs={12}>
                            <DatePicker
                                inline
                                minDate={this.state.startDate}
                                showMonthDropdown
                                showYearDropdown
                                dropdownMode="select"
                                selected={this.state.endDate}
                                selectsEnd
                                startDate={this.state.startDate}
                                endDate={this.state.endDate}
                                onChange={this.handleChangeEnd.bind(this)}
                            />
                        </Col>
                    </Col>
                </Row>
                <Row type="flex" justify="end">
                    <Col xs={4}>
                        <Button onClick={this.handleOk.bind(this)}>确定</Button>
                    </Col>
                    <Col xs={4}>
                        <Button onClick={this.hideDate.bind(this)}>取消</Button>
                    </Col>
                </Row>
            </div>;

            return (
                <div style={{width:'860px'}}>
                    <Popover placement="bottomLeft" title={null}
                             visible={this.state.visible}
                             onVisibleChange={this.handleVisibleChange.bind(this)}
                             content={content} trigger="click"
                             className="am-padding">
                        <input readonly style={{width:"180px"}}
                               value={moment(this.state.searchDate[0]).format('YYYY-MM-DD')+'至'+moment(this.state.searchDate[1]).format('YYYY-MM-DD')}
                               />
                    </Popover>
                </div>
            );
        }
    }
    class ExcelImport extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                fileList:[],
                searchDate:[moment(),moment()],
                focusedInput:null,
                date:null,
                focused:false
            };
        }
        onChange(info) {
            let fileList = info.fileList;
            if(info.file&&info.file.status==='done'&&info.file.response){
                let response = info.file.response;
                if(response.code == 0){
                    message.success(`${info.file.name} 上传成功`,2);
                }else {
                    message.error(`上传出错：${response.message}`,2);
                }
                this.setState({ fileList:[fileList[fileList.length-1]] });
            }else {
                this.setState({ fileList:fileList });
            }
        }
        download(){
            //文档模板下载...
            window.open(Global.cmpUrl+'/xls/balance.xls');
        }
        test(){
            const url = {
                type:'test/url',
                method:'GET'
            };
            let cb = ()=>{

            };
            Request({},cb,url);
        }

        changeDate(date) {
            this.setState({
                searchDate: date
            });
        }
        render() {
            const state = this.state;
            const props = {
                name:'tmp_name',
                action: Global.cmpUrl+'/sys-session/import-bal-tmp',
                headers: {
                    'access-token':GetLocalStorage('token'),
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
            return (
                <div>
                    <Row>
                        <Col xs={4}>
                            <Button icon="download" type="primary" onClick={this.download.bind(this)}>下载excel模板</Button>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={6}>
                            <h2 className="genson-margin-top">选择一个excel文件上传：</h2>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={6} className="genson-margin-top">
                            <Dragger  {...props} fileList={this.state.fileList}>
                                <p className="ant-upload-drag-icon">
                                    <Icon type="inbox" />
                                </p>
                                <p className="ant-upload-text">点击选择或者拖拽一个文件到这里上传</p>
                                {/*<Button icon="upload" type="primary">*/}
                                {/*上传文件*/}
                                {/*</Button>*/}
                            </Dragger>
                        </Col>
                    </Row>
                    <RangDate searchDate={this.state.searchDate} changeDate={this.changeDate.bind(this)}/>
                </div>
            );
        }

    }
    module.exports = ExcelImport;
})();