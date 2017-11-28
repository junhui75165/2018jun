/**
 * Created by junhui on 2017/4/18.
 */
(function () {
    'use strict';
    let React = require('react');
    let moment = require('moment');
    let { Card, Col, Row ,DatePicker,Checkbox,Input ,message,Button,Form,Select  } = require('antd');
    let {GetLocalStorage,getConst} = require('./../tool');
    let {Request} = require('./../request');
    const FormItem = Form.Item;
    const Option = Select.Option;

    let content = {
        input:[
            {data:'',title:'公司名称',type:'coy_name'},
            {data:'',title:'国税纳税人识别号',type:'tax_code_1'},
            {data:'',title:'地税纳税人识别号',type:'tax_code_2'},
        ],
        select:[
            {title:'本位币',list:[],data:'',type:'curr_default'},
            {title:'财务年度',list:['一月 ~ 十二月','二月 ~ 一月','三月 ~ 二月','四月 ~ 三月','五月 ~ 四月',
                '六月 ~ 五月','七月 ~ 六月','八月 ~ 七月','九月 ~ 八月','十月 ~ 九月','十一月 ~ 十月','十二月 ~ 十一月',
            ],data:'',type:'fiscal_year_end_month'}
        ],
        date:[{title:'封账日期',tips:'不允许输入该日期或之前的业务',type:'closed_date',forbid:''}]
    };
    let Right = {
        input:[
            {data:'',title:'地址',type:'postal_address'},
            {data:'',title:'注册地址',type:'domicile'},
            {data:'',title:'公司注册号',type:'coy_no'},
            {data:'',title:'电话',type:'phone'},
            {data:'',title:'传真',type:'fax'},
            {data:'',title:'Email地址',type:'email'},
            {data:'',title:'登录超时',type:'login_tout'},
        ],
        checkbox:[
            {data:'',title:'货币科目自动调汇',type:'auto_curr_reval'},
        ],
        text:[
            {data:'',title:'版本ID',type:'version_id'}
        ]
    };
    class Setting extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                left:{
                    input:[],
                    select:[],
                    date:[],
                    checkbox:[],
                    text:[]
                },
                right:{
                    input:[],
                    select:[],
                    date:[],
                    checkbox:[],
                    text:[]
                }
            };
            console.log(this.props)
        }

        componentDidMount() {
            let curr = [];
            GetLocalStorage('currency').map((item)=>{
                if(item.inactive == 0){
                    curr.push(item);
                }
            });
            content.input = [
                {data:this.props.data.coy_name,title:'公司名称',type:'coy_name'},
                {data:this.props.data.tax_code_1,title:'国税纳税人识别号',type:'tax_code_1'},
                {data:this.props.data.tax_code_2,title:'地税纳税人识别号',type:'tax_code_2'},
            ];
            content.date = [
                {title:'封账日期',tips:'不允许输入该日期或之前的业务',type:'closed_date',forbid:this.props.data.closed_date||moment().format('YYYY-MM-D')}
            ];
            content.select = [
                {title:'本位币',list:curr,data:this.props.data.curr_default,type:'curr_default'},
                {title:'财务年度',list:['二月 ~ 一月','三月 ~ 二月','四月 ~ 三月','五月 ~ 四月',
                    '六月 ~ 五月','七月 ~ 六月','八月 ~ 七月','九月 ~ 八月','十月 ~ 九月','十一月 ~ 十月','十二月 ~ 十一月','一月 ~ 十二月',
                ],data:this.props.data.fiscal_year_end_month,type:'fiscal_year_end_month'}
            ];
            Right.input = [
                {data:this.props.data.postal_address,title:'地址',type:'postal_address'},
                {data:this.props.data.domicile,title:'注册地址',type:'domicile'},
                {data:this.props.data.coy_no,title:'公司注册号',type:'coy_no'},
                {data:this.props.data.phone,title:'电话',type:'phone'},
                {data:this.props.data.fax,title:'传真',type:'fax'},
                {data:this.props.data.email,title:'Email地址',type:'email'},
                {data:this.props.data.login_tout,title:'登录超时',type:'login_tout'},
            ];
            Right.text = [
                {data:this.props.data.version_id,title:'版本ID',type:'version_id'}
            ];
            Right.checkbox = [
                {data:this.props.data.auto_curr_reval,title:'货币科目自动调汇',type:'auto_curr_reval'},
            ];
            console.log(Right.input);
            this.setState({
                left:content,
                right:Right
            })
        }

        onChange(type,e,date){
            content.input.map((data,index)=>{
                if(data.type == type){
                    content.input[index].data = e.target.value;
                }
            });
            content.select.map((data,index)=>{
                if(data.type == type){
                    content.select[index].data = e;
                }
            });
            content.date.map((data,index)=>{
                if(data.type == type){
                    content.date[index].forbid = date;
                }
            });
            Right.input.map((data,index)=>{
                if(data.type == type){
                    Right.input[index].data = e.target.value;
                }
            });
            Right.checkbox.map((data,index)=>{
                if(data.type == type){
                    Right.checkbox[index].data = e.target.checked;
                }
            });
            this.setState({
                left:content,
                right:Right
            })
        }
         initLeftContent(){
            let LInput = this.state.left.input.map((data,index)=>{
                return <FormItem key={index}
                    labelCol={{xs:{ span: 24 },sm:{ span: 5 },}}
                    wrapperCol={{xs:{ span: 24 },sm:{ span: 12 },}}
                    label={data.title}
                >
                    <Input className="genson-input" placeholder={'请输入'+data.title} value={data.data} onChange={this.onChange.bind(this,data.type)}/>
                </FormItem>
            });
            let LSelect = this.state.left.select.map((data,index)=>{
                return <FormItem key={index}
                                 labelCol={{xs:{ span: 24 },sm:{ span: 5 },}}
                                 wrapperCol={{xs:{ span: 24 },sm:{ span: 12 },}}
                                 label={data.title}>
                    <Select className="genson-input" defaultValue={data.list[0].curr_abrev?data.data:data.list[data.data-1]} onChange={this.onChange.bind(this,data.type)}>
                        {data.list.map((con,i)=>{
                            return<Option key={i} value={con.curr_abrev?con.curr_abrev:String(i+1)}>
                                {con.currency?con.currency:con}
                            </Option>
                        })}
                    </Select>
                </FormItem>
            });
            let LDate = this.state.left.date.map((data,index)=>{
               return  <FormItem key={index}
                                 labelCol={{xs:{ span: 24 },sm:{ span: 5 },}}
                                 wrapperCol={{xs:{ span: 24 },sm:{ span: 12 },}}
                                 help={data.tips}
                                 validateStatus="validating"
                                 label={data.title}>
                   <DatePicker className="genson-input" value={moment(data.forbid)} onChange={this.onChange.bind(this,data.type)}/>
               </FormItem>
            });
            return [LInput,LSelect,LDate];
        }
        initRightContent(){
            const { getFieldDecorator } = this.props.form;
            let RInput = this.state.right.input.map((data,index)=>{
                return <FormItem key={index}
                                 labelCol={{xs:{ span: 24 },sm:{ span: 5 },}}
                                 wrapperCol={{xs:{ span: 24 },sm:{ span: 12 },}}
                                 label={data.title}>
                            <Input className="genson-input" placeholder={'请输入'+data.title} value={data.data} onChange={this.onChange.bind(this,data.type)}/>
                        </FormItem>
            });
            let RCheckbox = this.state.right.checkbox.map((data,index)=>{
                return <FormItem key={index}
                                 labelCol={{xs:{ span: 24 },sm:{ span: 5 },}}
                                 wrapperCol={{xs:{ span: 24 },sm:{ span: 12 },}}
                                 label={data.title}>
                    <Checkbox defaultChecked={data.data==1} onChange={this.onChange.bind(this,data.type)}/>
                </FormItem>
            });
            let RText = this.state.right.text.map((data,index)=>{
                return <FormItem key={index}
                                 labelCol={{xs:{ span: 24 },sm:{ span: 5 },}}
                                 wrapperCol={{xs:{ span: 24 },sm:{ span: 12 },}}
                                 label={data.title}>
                    <span >{data.data}</span>
                </FormItem>
            });
            return [RInput,RCheckbox,RText];
        }

        submit(){
            let type = {
                type:'sys-prefs/update',
                method:'FormData',
                Method:'POST'
            };
            let params = {
            };
            this.state.left.input.map((data,index)=>{
                params[data.type] = data.data;
            });
            this.state.left.select.map((data,index)=>{
                params[data.type] = data.data;
            });
            this.state.left.date.map((data,index)=>{
                params[data.type] = data.forbid;
            });
            this.state.right.input.map((data,index)=>{
                params[data.type] = data.data;
            });
            this.state.right.checkbox.map((data,index)=>{
                params[data.type] = Number(data.data);
            });
            console.log(params);
            let callback = function (data) {
                console.log(data);
                if(data.code == 0){
                    getConst();
                    message.success('保存成功！');
                }else {
                    message.error(data.message);
                }
            };
            Request(params,callback,type);
        }
        render() {
            return (
                <div className="gen-certificate">
                    <Card id="components-tree-demo-customized-icon" title={<h1 className="certificate-title">公司设置</h1>}
                          bordered={true}>
                        <Row>
                            <Col xs={12}>
                                <Form>
                                    {this.initLeftContent.bind(this)()}
                                </Form>
                            </Col>
                            <Col xs={12}>
                                <Form>
                                    {this.initRightContent.bind(this)()}
                                </Form>
                            </Col>
                        </Row>
                        <Row className="center">
                            <Button onClick={this.submit.bind(this)}>提交</Button>
                        </Row>
                    </Card>
                </div>
            );
        }
    }
    const CmpSetting = Form.create()(Setting);
    module.exports = CmpSetting;
})();