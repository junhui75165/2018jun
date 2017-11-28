/**
 * Created by junhui on 2017/8/11.
 */
(()=>{
    'use strict';
    let React = require('react');
    let moment = require('moment');
    let {Card,Col, Row ,Button,DatePicker,Input,
        InputNumber,message,Modal ,Select} = require('antd');
    const { Option, OptGroup } = Select;
    let {getDateVnum,toThousands,objToArr,GetLocalStorage} = require('../../tool');
    let {Request} = require('../../request');
    let CertificateTable = require('./CertificateTable');
    class EasyCertificate extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                vnum:'',
                date:moment(),
                type:this.props.type,
                inputValue:[],
                inputList:[],
                expense_chart:[],
                payment_chart:[],
                paying_taxes:[],
                simple_chart:[],
                account_list:[],
                costs_chart:[],
                searchKey:[],
                isExchange:false,
                isUsd:false,
                table:[],
                merge:false,
                times:0,//添加次数
            }
        }

        componentDidMount() {
            this.getVnum();//获取日期和凭证号
            this.getExpense();//费用开支科目列表
            this.getRecPay();//收款付款--科目列表
            this.payingTaxes();//缴纳税款
            this.payingCosts();//社保费用--科目列表
            this.getSimple();//正常科目--科目列表
            this.getAccount();//获取银行账户
            setTimeout(()=>{
                this.initInput(this.state.type);//初始化列表选项
            })
        }
        componentWillReceiveProps(nextProps, nextContext) {
            this.setState({
                type:nextProps.type,
                inputValue:[],
                searchKey:[],
                table:[],
            },()=>{
                this.initInput(this.state.type);
                // this.initValue(this.state.type);
            })
        }
        getExpense(){
            const url = {
                type:'simple-bookkeeping/expense-master-list',
                method:'GET',
            };
            let cb = (data)=>{
                // console.log('费用开支科目列表',data.info);
                const expense_chart = objToArr(data.info);
                this.setState({expense_chart})
            };
            Request({},cb,url);
        }
        getRecPay(){
            const url = {
                type:'simple-bookkeeping/payment-master-list',
                method:'GET',
            };
            let cb = (data)=>{
                // console.log('收款付款--科目列表',data.info);
                const payment_chart = data.info;
                this.setState({payment_chart})
            };
            Request({},cb,url);
        }
        payingTaxes(){
            /********缴纳税款*******/
            const url = {
                type:'simple-bookkeeping/tax-payment-master-list',
                method:'GET',
            };
            let cb = (data)=>{
                const paying_taxes = data.info;
                this.setState({paying_taxes})
            };
            Request({},cb,url);
        }
        payingCosts(){
            /********社保费用--科目列表*******/
            const url = {
                type:'simple-bookkeeping/social-insurance-master-list',
                method:'GET',
            };
            let cb = (data)=>{
                const costs_chart = data.info;
                this.setState({costs_chart})
            };
            Request({},cb,url);
        }
        getSimple(){
            /********
             *银行手续费及费用
             *利息
             *营业外支出
             *********/
            const url = {
                type:'tree/get-master-tree',
                method:'GET',
            };
            let cb = (data)=>{
                const simple_chart = data.info;
                this.setState({simple_chart})
            };
            Request({},cb,url);
        }
        getAccount(){
            /********
             *银行账户列表
             *********/
            const url = {
                type:'simple-bookkeeping/blank-list',
                method:'GET',
            };
            let cb = (data)=>{
                const account_list = data.info;
                this.setState({account_list})
            };
            Request({},cb,url);
        }
        getBalance(id,key){
            const url = {
                type:'chart-master/account-balance',
                method:'GET'
            };
            let par = {account_code:id};
            let cb=(data)=>{
                let inputValue = this.state.inputValue;
                inputValue[key] = data.info.amount;
                this.setState({inputValue});
            };
            Request(par,cb,url)
        }
        getDetail(id){
            const url = {
                type:'chart-master/info',
                method:'GET'
            };
            let cb = (data)=>{
                const curr_default = GetLocalStorage('Const').curr_default;//默认币种
                let {curr_code,sb_type,account_name} = data.info;
                let {isExchange,isUsd} = this.state;
                if(curr_code&&(curr_code != curr_default)){
                    /*********默认币种不等于科目币种，属于外汇科目**********/
                    isExchange = true;
                    console.log('这是一个外汇科目...')
                }
                if(sb_type == 1){
                    /**********科目为数量科目**********/
                    isUsd = true;
                    console.log('这是一个数量科目...')
                }
                this.setState({isExchange,isUsd});
            };
            let par = {id:id};
            if(id){
                Request(par,cb,url);
            }
        }
        initValue(type,seletd){
            let par = {};
            const url = {
                type:'simple-bookkeeping/get-default',
                method:'GET'
            };
            let cb = (data)=>{
                let value = data.info.refs;
                let {
                    expense_chart,payment_chart,
                    paying_taxes,simple_chart,
                    account_list,inputValue,
                    searchKey,
                } = this.state;
                switch (type){
                    case 201:// 费用开支
                        inputValue[0] = value.expense_chart||
                        expense_chart[0].children[0]?expense_chart[0].children[0].account_code:expense_chart[0].account_code;
                        inputValue[1] = value.account_list||account_list[0].account_code;
                        this.getBalance(inputValue[1],2);
                        searchKey = [2];
                        inputValue[3] = 0;
                        inputValue[4] = value.memo_;
                        break;
                    case 202://收款(从客户或供应商)
                        inputValue[0] = value.default_class||payment_chart[0].account_code;
                        this.getBalance(inputValue[0],1);
                        inputValue[2] = value.account_list||account_list[0].account_code;
                        this.getBalance(inputValue[2],3);
                        searchKey = [1,3];
                        inputValue[4] = 0;
                        inputValue[5] = value.memo_;
                        break;
                    case 203://收款(非客户/非货款）
                        inputValue[0] = value.payment_chart||payment_chart[0].account_code;
                        this.getBalance(inputValue[0],1);
                        inputValue[2] = value.account_list||account_list[0].account_code;
                        this.getBalance(inputValue[2],3);
                        searchKey = [1,3];
                        inputValue[4] = 0;
                        inputValue[5] = value.memo_;
                        break;
                    case 204://银行账户转账(提现/存现）
                        inputValue[0] = value.account_list||account_list[0].account_code;
                        this.getBalance(inputValue[0],1);
                        searchKey = [1];
                        inputValue[2] = value.account_list||account_list[0].account_code;
                        inputValue[3] = 0;
                        inputValue[4] = value.memo_;
                        break;
                    case 205://银行手续费及费用bank_charges
                        inputValue[0] = value.default_class||simple_chart[0].account_code;
                        inputValue[1] = value.account_list||account_list[0].account_code;
                        this.getBalance(inputValue[1],2);
                        searchKey = [2];
                        inputValue[3] = 0;
                        inputValue[4] = value.memo_;
                        break;
                    case 206://计提工资 wage_accrual
                        inputValue[0] = value.sb_accrued_wages_act;//应付工资
                        inputValue[1] = value.sb_expense_of_wages_act;//费用开支
                        inputValue[2] = 0;
                        inputValue[3] = value.memo_;
                        break;
                    case 207://发放工资 pay_wages
                        inputValue[0] = value.sb_accrued_wages_act;//应付工资
                        inputValue[1] = value.account_list||account_list[0].account_code;
                        this.getBalance(inputValue[1],2);
                        searchKey = [2];
                        inputValue[3] = 0;
                        inputValue[4] = value.memo_;
                        inputValue[5] = value.sb_personal_income_tax_payable_act;//应交个人所得税
                        inputValue[6] = 0;
                        inputValue[7] = value.sb_personal_social_insurance_act;//社保费个人部分
                        inputValue[8] = 0;
                        inputValue[9] = value.sb_personal_house_fund_act;//公积金个人部分
                        inputValue[10] = 0;
                        break;
                    case 208://支付住房公积金 house_fund
                        inputValue[0] = value.account_list||account_list[0].account_code;
                        this.getBalance(inputValue[0],1);
                        searchKey = [1];
                        inputValue[2] = value.memo_;
                        inputValue[3] = value.sb_expense_of_house_fund_act;//住房公积金（管理费用）
                        inputValue[4] = 0;
                        inputValue[5] = value.sb_personal_house_fund_act;//公司负担部分金额
                        inputValue[6] = 0;
                        break;
                    case 209://不出库销售收入 pure_sales_income
                        if(!seletd||seletd==1){
                            inputValue[1] = value.default_class;
                            inputValue[2] = value.account_list||account_list[0].account_code;
                            inputValue[3] = 0;
                            inputValue[4] = value.memo_;
                        }else if(seletd==2){
                            inputValue[1] = value.default_class;
                            inputValue[2] = value.payment_chart||payment_chart[0].account_code;
                            this.getBalance(inputValue[2],3);
                            searchKey = [3];
                            inputValue[4] = 0;
                            inputValue[5] = value.memo_;
                        }else if(seletd==3){
                            inputValue[1] = value.default_class;
                            inputValue[2] = value.payment_chart||payment_chart[0].account_code;
                            this.getBalance(inputValue[2],3);
                            searchKey = [3];
                            inputValue[4] = 0;
                            inputValue[5] = value.account_list||account_list[0].account_code;
                            inputValue[6] = 0;
                            inputValue[7] = value.memo_;
                        }else if(seletd==4){
                            inputValue[1] = value.default_class;
                            inputValue[2] = value.account_list||account_list[0].account_code;
                            inputValue[3] = 0;
                            inputValue[4] = value.payment_chart||payment_chart[0].account_code;
                            this.getBalance(inputValue[4],5);
                            searchKey = [5];
                            inputValue[6] = 0;
                            inputValue[7] = value.memo_;
                        }else if(seletd==5){
                            inputValue[1] = value.default_class;
                            inputValue[2] = value.payment_chart||payment_chart[0].account_code;
                            this.getBalance(inputValue[2],3);
                            inputValue[4] = 0;
                            inputValue[5] = value.account_list||account_list[0].account_code;
                            inputValue[6] = 0;
                            inputValue[7] = value.payment_chart||payment_chart[0].account_code;
                            this.getBalance(inputValue[7],8);
                            searchKey = [3,8];
                            inputValue[9] = 0;
                            inputValue[10] = value.memo_;
                        }else if(seletd==6){
                            inputValue[1] = value.default_class;
                            inputValue[2] = value.payment_chart||payment_chart[0].account_code;
                            this.getBalance(inputValue[2],3);
                            searchKey = [3];
                            inputValue[4] = 0;
                            inputValue[5] = value.memo_;
                        }
                        break;
                    case 211://付款(给供应商或客户） payment_supp
                        inputValue[0] = value.account_list||account_list[0].account_code;
                        this.getBalance(inputValue[0],1);
                        inputValue[2] = value.default_class||payment_chart[0].account_code;
                        this.getBalance(inputValue[2],3);
                        searchKey = [1,3];
                        inputValue[4] = 0;
                        inputValue[5] = value.memo_;
                        break;
                    case 212://付款(非供应商/非货款）payment
                        inputValue[0] = value.account_list||account_list[0].account_code;
                        this.getBalance(inputValue[0],1);
                        inputValue[2] = value.default_class||payment_chart[0].account_code;
                        this.getBalance(inputValue[2],3);
                        searchKey = [1,3];
                        inputValue[4] = 0;
                        inputValue[5] = value.memo_;
                        break;
                    case 213://支付社保费 social_insurance
                        inputValue[0] = value.account_list||account_list[0].account_code;
                        this.getBalance(inputValue[0],1);
                        searchKey = [1];
                        inputValue[2] = value.memo_;
                        inputValue[3] = value.sb_expense_of_social_insurance_act||costs_chart[0].account_code;
                        inputValue[4] = 0;
                        inputValue[5] = value.sb_personal_social_insurance_act||costs_chart[0].account_code;
                        inputValue[6] = 0;
                        break;
                    case 214://缴纳税款 tax_payment
                        inputValue[0] = paying_taxes[0].children[0]?paying_taxes[0].children[0].account_code:paying_taxes[0].account_code;
                        inputValue[1] = value.account_list||account_list[0].account_code;
                        this.getBalance(inputValue[1],2);
                        searchKey = [2];
                        inputValue[3] = 0;
                        inputValue[4] = value.memo_;
                        break;
                    case 215://利息 interest
                        inputValue[0] = value.account_list||account_list[0].account_code;
                        inputValue[1] = value.default_class||simple_chart[0].account_code;
                        inputValue[2] = 0;
                        inputValue[3] = value.memo_;
                        break;
                    case 216://营业外支出 non_operating_expense
                        inputValue[0] = value.default_class||simple_chart[0].account_code;
                        inputValue[1] = value.account_list||account_list[0].account_code;
                        this.getBalance(inputValue[1],2);
                        searchKey = [2];
                        inputValue[3] = 0;
                        inputValue[4] = value.memo_;
                        break;
                    case 217://营业外收入 non_operating_income
                        inputValue[0] = value.default_class||simple_chart[0].account_code;
                        inputValue[1] = value.account_list||account_list[0].account_code;
                        inputValue[2] = 0;
                        inputValue[3] = value.memo_;
                        break;
                    case 218://购入固定资产 asset_purchase
                        inputValue[0] = value.account_list||account_list[0].account_code;
                        this.getBalance(inputValue[0],1);
                        inputValue[2] = value.default_class||costs_chart[0].account_code;
                        this.getBalance(inputValue[2],3);
                        searchKey = [1,3];
                        inputValue[4] = 0;
                        inputValue[5] = value.memo_;
                        break;
                    case 219://采购进货 inventory_purchase
                        if(!seletd||seletd==1){
                            inputValue[1] = value.inventory_goods||simple_chart[0].account_code;
                            inputValue[3] = value.account_list||account_list[0].account_code;
                            inputValue[4] = 0;
                            inputValue[5] = value.memo_;
                        }else if(seletd==2){
                            inputValue[1] = value.inventory_goods||simple_chart[0].account_code;
                            inputValue[3] = value.advance_payment||payment_chart[0].account_code;
                            this.getBalance(inputValue[3],4);
                            searchKey = [4];
                            inputValue[5] = 0;
                            inputValue[6] = value.memo_;
                        }else if(seletd==3){
                            inputValue[1] = value.inventory_goods||simple_chart[0].account_code;
                            inputValue[3] = value.advance_payment||payment_chart[0].account_code;
                            this.getBalance(inputValue[3],4);
                            searchKey = [4];
                            inputValue[5] = 0;
                            inputValue[6] = value.account_list||account_list[0].account_code;
                            inputValue[7] = 0;
                            inputValue[8] = value.memo_;
                        }else if(seletd==4){
                            inputValue[1] = value.inventory_goods||simple_chart[0].account_code;
                            inputValue[3] = value.account_list||account_list[0].account_code;
                            inputValue[4] = 0;
                            inputValue[5] = value.accounts_payable||payment_chart[0].account_code;
                            this.getBalance(inputValue[5],6);
                            searchKey = [6];
                            inputValue[7] = 0;
                            inputValue[8] = value.memo_;
                        }else if(seletd==5){
                            inputValue[1] = value.inventory_goods||simple_chart[0].account_code;
                            inputValue[3] = value.advance_payment||payment_chart[0].account_code;
                            this.getBalance(inputValue[3],4);
                            inputValue[5] = 0;
                            inputValue[6] = value.account_list||account_list[0].account_code;
                            inputValue[7] = 0;
                            inputValue[8] = value.accounts_payable||payment_chart[0].account_code;
                            this.getBalance(inputValue[8],9);
                            searchKey = [4,9];
                            inputValue[10] = 0;
                            inputValue[11] = value.memo_;
                        }else if(seletd==6){
                            inputValue[1] = value.inventory_goods||simple_chart[0].account_code;
                            inputValue[3] = value.accounts_payable||payment_chart[0].account_code;
                            this.getBalance(inputValue[3],4);
                            searchKey = [4];
                            inputValue[5] = 0;
                            inputValue[6] = value.memo_;
                        }
                        break;
                }
                this.setState({inputValue,searchKey})
            };
            switch (type){
                case 201:// 费用开支
                    par.type = 'expense';
                    break;
                case 202://收款(从客户或供应商)
                    par.type = 'receipt_client';
                    break;
                case 203://收款(非客户/非货款）
                    par.type = 'receipt';
                    break;
                case 204://银行账户转账(提现/存现）
                    par.type = 'bank_transfer';
                    break;
                case 205://银行手续费及费用
                    par.type = 'bank_charges';
                    break;
                case 206://计提工资
                    par.type = 'wage_accrual';
                    break;
                case 207://发放工资
                    par.type = 'pay_wages';
                    break;
                case 208://支付住房公积金
                    par.type = 'house_fund';
                    break;
                case 209://不出库销售收入
                    par.type = 'pure_sales_income';
                    break;
                case 211://付款(给供应商或客户）
                    par.type = 'payment_supp';
                    break;
                case 212://付款(非供应商/非货款）
                    par.type = 'payment';
                    break;
                case 213://支付社保费
                    par.type = 'social_insurance';
                    break;
                case 214://缴纳税款
                    par.type = 'tax_payment';
                    break;
                case 215://利息
                    par.type = 'interest';
                    break;
                case 216://营业外支出
                    par.type = 'non_operating_expense';
                    break;
                case 217://营业外收入
                    par.type = 'non_operating_income';
                    break;
                case 218://购入固定资产
                    par.type = 'asset_purchase';
                    break;
                case 219://采购进货
                    par.type = 'inventory_purchase';
                    break;
            }
            Request(par,cb,url);
        }

        renOption(list,level){
            level++;
            if(!list){
                return '';
            }
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
        getVnum(date){
            let cb = (data)=>{
                this.setState({
                    vnum:data.vnum,
                    date:moment(data.date_)
                })
            };
            getDateVnum(cb,date);
        }
        initInput(type){
            const list = {
                '201':[//费用开支
                    {title:'费用开支',type:'fedList'},
                    {title:'付款账户',type:'account'},
                    {title:'银行余额',type:'balance'},
                    {title:'金额',type:'amount'},
                    {title:'摘要',type:'summary'},
                    {title:'',type:'merge',summary:'合并付款分录为一笔'}//是否合并付款
                ],
                '202':[//收款(从客户或供应商)
                    {title:'收款自账户',type:'bankList'},
                    {title:'余额',type:'over'},
                    {title:'到账户',type:'account'},
                    {title:'银行余额',type:'balance'},
                    {title:'金额',type:'amount'},
                    {title:'摘要',type:'summary'},
                ],
                '203':[//收款(非客户/非货款）
                    {title:'收款自账户',type:'bankList'},
                    {title:'余额',type:'over'},
                    {title:'到账户',type:'account'},
                    {title:'银行余额',type:'balance'},
                    {title:'金额',type:'amount'},
                    {title:'摘要',type:'summary'},
                ],
                '204':[//银行账户转账(提现/存现）
                    {title:'从账户',type:'account'},
                    {title:'银行余额',type:'balance'},
                    {title:'到账户',type:'account'},
                    {title:'金额',type:'amount'},
                    {title:'摘要',type:'summary'},
                ],
                '205':[//银行手续费及费用
                    {title:'银行费用科目',type:'bankExpense'},
                    {title:'付款账户',type:'account'},
                    {title:'银行余额',type:'balance'},
                    {title:'金额',type:'amount'},
                    {title:'摘要',type:'summary'},
                    {title:'',type:'merge',summary:'合并付款分录为一笔'}//是否合并付款
                ],
                '206':[//计提工资
                    {title:'应付工资',type:'exesList'},
                    {title:'费用开支',type:'exesList'},
                    {title:'金额',type:'amount'},
                    {title:'摘要',type:'summary'},
                ],
                '207':[//发放工资
                    {title:'应付工资',type:'exesList'},
                    {title:'付款账户',type:'account'},
                    {title:'银行余额',type:'balance'},
                    {title:'金额',type:'amount'},
                    {title:'摘要',type:'summary'},
                    {title:'应交个税',type:'exesList'},
                    {title:'个人所得税',type:'amount'},
                    {title:'社保费个人部分',type:'exesList'},
                    {title:'社保费个人金额',type:'amount'},
                    {title:'公积金个人部分',type:'exesList'},
                    {title:'公积金个人金额',type:'amount'},
                    {title:'总金额',type:'over'},
                ],
                '208':[//支付住房公积金
                    {title:'付款账户',type:'account'},
                    {title:'银行余额',type:'balance'},
                    {title:'摘要',type:'summary'},
                    {title:'住房公积金（管理费用）',type:'exesList'},
                    {title:'公司负担部分金额',type:'amount'},
                    {title:'住房公积金个人部分',type:'exesList'},
                    {title:'个人负担部分金额',type:'amount'},
                ],
                '209':[//不出库销售收入
                    {title:'收款类型',type:'collection',set:'收'},
                    {title:'销售(收入)科目',type:'bankExpense'},
                    {title:'收款科目',type:'account'},
                    {title:'金额',type:'amount'},
                    {title:'摘要',type:'summary'},
                ],
                '211':[//付款(给供应商或客户）
                    {title:'从账户',type:'account'},
                    {title:'银行余额',type:'balance'},
                    {title:'付款至账户',type:'bankList'},
                    {title:'余额',type:'over'},
                    {title:'金额',type:'amount'},
                    {title:'摘要',type:'summary'},
                ],
                '212':[//付款(非供应商/非货款）
                    {title:'从账户',type:'account'},
                    {title:'银行余额',type:'balance'},
                    {title:'付款至账户',type:'bankList'},
                    {title:'余额',type:'over'},
                    {title:'金额',type:'amount'},
                    {title:'摘要',type:'summary'},
                ],
                '213':[//支付社保费
                    {title:'付款账户',type:'account'},
                    {title:'银行余额',type:'balance'},
                    {title:'摘要',type:'summary'},
                    {title:'社保费（管理费用）',type:'exesList'},
                    {title:'公司负担部分金额',type:'amount'},
                    {title:'社保费个人部分',type:'exesList'},
                    {title:'个人负担部分金额',type:'amount'},
                ],
                '214':[//缴纳税款
                    {title:'缴纳税款',type:'paying'},
                    {title:'从账户',type:'account'},
                    {title:'银行余额',type:'balance'},
                    {title:'金额',type:'amount'},
                    {title:'摘要',type:'summary'},
                    {title:'',type:'merge',summary:'合并付款分录为一笔'}//是否合并付款
                ],
                '215':[//利息
                    {title:'账户',type:'account'},
                    {title:'利息',type:'bankExpense'},
                    {title:'金额',type:'amount'},
                    {title:'摘要',type:'summary'},
                ],
                '216':[//营业外支出
                    {title:'营业外支出',type:'bankExpense'},
                    {title:'从账户',type:'account'},
                    {title:'银行余额',type:'balance'},
                    {title:'金额',type:'amount'},
                    {title:'摘要',type:'summary'},
                ],
                '217':[//营业外收入
                    {title:'营业外收入',type:'bankExpense'},
                    {title:'从账户',type:'account'},
                    {title:'金额',type:'amount'},
                    {title:'摘要',type:'summary'},
                ],
                '218':[//购入固定资产
                    {title:'从账户',type:'account'},
                    {title:'银行余额',type:'balance'},
                    {title:'固定资产科目',type:'exesList'},
                    {title:'余额',type:'over'},
                    {title:'金额',type:'amount'},
                    {title:'摘要',type:'summary'},
                ],
                '219':[//采购进货
                    {title:'付款类型',type:'collection',set:'付'},
                    {title:'库存商品(产成品)科目',type:'bankExpense'},
                    {title:'数量',type:'number'},
                    {title:'付款账户',type:'account'},
                    {title:'金额',type:'amount'},
                    {title:'摘要',type:'summary'},
                    {title:'',type:'merge',summary:'合并付款分录为一笔'},//是否合并付款
                ],
            };
            if(!list[type]){
                type = '201'
            }
            this.setState({inputList:list[type]},()=>{
                this.initValue(type);//初始化默认值
            })
        }
        reSetCon(set,value){
            let {inputList} = this.state;
            switch (value){
                case "1":
                    inputList = [
                        {title:set+'款类型',type:'collection',set},
                        {title:'库存商品(产成品)科目',type:'bankExpense'},

                        {title:set+'款账户',type:'account'},
                        {title:'金额',type:'amount'},
                        {title:'摘要',type:'summary'},
                    ];
                    break;
                case "2":
                    inputList = [
                        {title:set+'款类型',type:'collection',set},
                        {title:'库存商品(产成品)科目',type:'bankExpense'},

                        {title:'预'+set+'账款科目',type:'bankList'},
                        {title:'预'+set+'账款科目(余额)',type:'over'},
                        {title:'预'+set+'金额',type:'amount'},
                        {title:'摘要',type:'summary'},
                    ];
                    break;
                case "3":
                    inputList = [
                        {title:set+'款类型',type:'collection',set},
                        {title:'库存商品(产成品)科目',type:'bankExpense'},

                        {title:'预'+set+'账款科目',type:'bankList'},
                        {title:'预'+set+'账款科目(余额)',type:'over'},
                        {title:'预'+set+'金额',type:'amount'},
                        {title:set+'款账户',type:'account'},
                        {title:'金额',type:'amount'},
                        {title:'摘要',type:'summary'},
                    ];
                    break;
                case "4":
                    inputList = [
                        {title:set+'款类型',type:'collection',set},
                        {title:'库存商品(产成品)科目',type:'bankExpense'},

                        {title:set+'款账户',type:'account'},
                        {title:'金额',type:'amount'},
                        {title:'应'+set+'款科目',type:'bankList'},
                        {title:'应'+set+'款科目(余额)',type:'over'},
                        {title:'应'+set+'账款金额',type:'amount'},
                        {title:'摘要',type:'summary'},
                    ];
                    break;
                case "5":
                    inputList = [
                        {title:set+'款类型',type:'collection',set},
                        {title:'库存商品(产成品)科目',type:'bankExpense'},

                        {title:'预'+set+'账款科目',type:'bankList'},
                        {title:'预'+set+'账款科目(余额)',type:'over'},
                        {title:'预'+set+'金额',type:'amount'},
                        {title:set+'款账户',type:'account'},
                        {title:'金额',type:'amount'},
                        {title:'应'+set+'款科目',type:'bankList'},
                        {title:'应'+set+'款科目(余额)',type:'over'},
                        {title:'应'+set+'账款金额',type:'amount'},
                        {title:'摘要',type:'summary'},
                    ];
                    break;
                case "6":
                    inputList = [
                        {title:set+'款类型',type:'collection',set},
                        {title:'库存商品(产成品)科目',type:'bankExpense'},

                        {title:'应'+set+'款科目',type:'bankList'},
                        {title:'应'+set+'款科目(余额)',type:'over'},
                        {title:'应'+set+'账款金额',type:'amount'},
                        {title:'摘要',type:'summary'},
                    ];
                    break;
            }
            if(set=='付'){
                inputList.push({title:'',type:'merge',summary:'合并付款分录为一笔'});
            }
            if(this.state.type == '219'){
                let item = {title:'数量',type:'number'};
                inputList.splice(2,0,item);
            }
            this.setState({inputList},()=>{
                this.initValue(this.state.type,value);
                console.log(inputList)
            })
        }
        changeValue(key,type,e){
            let value = (e&&e.target)?e.target.value:e;
            let Key = key+1;
            let search = false;
            let {inputValue,searchKey} = this.state;
            if(type == 'collection'){
                inputValue = [];
            }else if(type == 'fedList'){
                //费用开支
                search = true;
            }else if(type == 'bankList'){
                //收款付款--其它全部科目
                search = true;
            }else if(type == 'bankExpense'){
                //银行费用科目 22
                search = true;
            }else if(type == 'exesList'){
                //银行存款 1002
                search = true;
            }else if(type == 'paying'){
                //缴纳税款
                search = true;
            }else if(type == 'account'){
                //付款账户
                search = true;
            }
            if(searchKey.indexOf(Key)>-1){
                this.getBalance(value,Key);
            }
            inputValue[key] = value;
            this.setState({inputValue},()=>{
                // if(search){
                //     this.getDetail(value);
                // }
            })
        }
        rtType(type,set,key){
            let input;
            let inputValue = this.state.inputValue;
            switch (type){
                case 'fedList'://费用开支
                    input = <Select className="genson-input"
                                    showSearch
                                    style={{ width: '100%'}}
                                    onChange={this.changeValue.bind(this,key,type)}
                                    value={inputValue[key]}
                                    notFoundContent="没有匹配的选项">
                        {this.renOption(this.state.expense_chart,-1)}
                    </Select>;
                    break;
                case 'bankList'://收款付款--其它全部科目
                    input = <Select className="genson-input"
                                    showSearch
                                    onChange={this.changeValue.bind(this,key,type)}
                                    value={inputValue[key]}
                                    style={{ width: '100%'}}
                                    notFoundContent="没有匹配的选项">
                        {this.renOption(this.state.payment_chart,-1)}
                    </Select>;
                    break;
                case 'bankExpense'://银行费用科目 22
                    input = <Select className="genson-input"
                                    showSearch
                                    onChange={this.changeValue.bind(this,key,type)}
                                    value={inputValue[key]}
                                    style={{ width: '100%'}}
                                    notFoundContent="没有匹配的选项">
                        {this.renOption(this.state.simple_chart,-1)}
                    </Select>;
                    break;
                case 'exesList'://银行存款 1002
                    input = <Select className="genson-input"
                                    showSearch
                                    onChange={this.changeValue.bind(this,key,type)}
                                    value={inputValue[key]}
                                    style={{ width: '100%'}}
                                    notFoundContent="没有匹配的选项">
                        {this.renOption(this.state.costs_chart,-1)}
                    </Select>;
                    break;
                case 'paying'://缴纳税款
                    input = <Select className="genson-input"
                                    showSearch
                                    onChange={this.changeValue.bind(this,key,type)}
                                    value={inputValue[key]}
                                    style={{ width: '100%'}}
                                    notFoundContent="没有匹配的选项">
                        {this.renOption(this.state.paying_taxes,-1)}
                    </Select>;
                    break;
                case 'collection'://收款类型
                    input = <Select className="genson-input"
                                    value={inputValue[key]||"1"}
                                    style={{ width: '100%'}}
                                    onChange={this.changeValue.bind(this,key,type)}
                                    onSelect={this.reSetCon.bind(this,set)}
                                    notFoundContent="没有匹配的选项">
                        <option value="1">现在全部结清货款</option>
                        <option value="2">全部货款此前已经预付完毕</option>
                        <option value="3">部分货款此前已经预付，其余款项现在结清</option>
                        <option value="4">部分货款开票时收款，其余为应收账款(欠款)</option>
                        <option value="5">部分货款此前已经预付，部分开票时收款，剩余部分为应收账款</option>
                        <option value="6">全部货款未付(为应收账款)</option>
                    </Select>;
                    break;
                case 'account'://付款账户
                    input = <Select className="genson-input"
                                    onChange={this.changeValue.bind(this,key,type)}
                                    showSearch
                                    value={inputValue[key]}
                                    style={{ width: '100%'}}
                                    notFoundContent="没有匹配的选项">
                        {this.state.account_list.map((item)=>{
                            return<Option key={item.account_code} value={item.account_code}>
                                {item.bank_account_name}
                                </Option>;
                        })}
                    </Select>;
                    break;
                case 'balance'://账户余额
                    input = <a>{toThousands(inputValue[key]||0.00)}</a>;
                    break;
                case 'summary'://摘要
                    input = <Input type="textarea" className="genson-input" value={inputValue[key]}
                                   onChange={this.changeValue.bind(this,key,type)}
                                   autosize={{ minRows: 2, maxRows: 6 }}/>;
                    break;
                case 'amount'://金额
                    input = <InputNumber className="genson-input"
                                         onChange={this.changeValue.bind(this,key,type)}
                                         value={inputValue[key]||0}/>;
                    break;
                case 'merge'://合并付款
                    input = <Button onClick={this.getMerge.bind(this)}>合并付款分录为一笔</Button>;
                    break;
                case 'over'://余额
                    input = <span>{toThousands(inputValue[key])||0.00}</span>;
                    break;
                case 'number'://余额
                    input = <InputNumber className="genson-input"
                                         onChange={this.changeValue.bind(this,key,type)}
                                         value={inputValue[key]||0}/>;
                    break;
            }
            return input;
        }
        changeVnum(value){
            this.setState({
                vnum:value
            })
        }
        changeDate(date){
            this.setState({
                date:date
            },()=>{
                if(date){
                    this.getVnum(moment(this.state.date).format('YYYY-MM-D'));
                }
            })
        }
        getMerge(){
            this.setState({
                merge:true,
            },()=>{
                this.setState({merge:false});
            })
        }
        submitForm(){
            console.log('submit form is',this.state.inputValue,this.state.type);
            let {times,type,inputValue} = this.state;
            let table = [];
            switch (String(type)){
                case '201':
                    let item201_1 = {
                        id:inputValue[0],
                        des:'',
                        debit:inputValue[3],
                        summary:inputValue[4],
                    };
                    let item201_2 = {
                        id:inputValue[1],
                        des:'',
                        lender:inputValue[3],
                        summary:inputValue[4],
                    };
                    times++;
                    table = table.concat(item201_1,item201_2);
                    break;
                case '202':
                    let item202_1 = {
                        id:inputValue[2],
                        des:'',
                        debit:inputValue[4],
                        summary:inputValue[5],
                    };
                    let item202_2 = {
                        id:inputValue[0],
                        des:'',
                        lender:inputValue[4],
                        summary:inputValue[5],
                    };
                    times++;
                    table = table.concat(item202_1,item202_2);
                    break;
                case '203':
                    let item203_1 = {
                        id:inputValue[2],
                        des:'',
                        debit:inputValue[4],
                        summary:inputValue[5],
                    };
                    let item203_2 = {
                        id:inputValue[0],
                        des:'',
                        lender:inputValue[4],
                        summary:inputValue[5],
                    };
                    times++;
                    table = table.concat(item203_1,item203_2);
                    break;
                case '204':
                    let item204_1 = {
                        id:inputValue[2],
                        des:'',
                        debit:inputValue[3],
                        summary:inputValue[4],
                    };
                    let item204_2 = {
                        id:inputValue[0],
                        des:'',
                        lender:inputValue[3],
                        summary:inputValue[4],
                    };
                    times++;
                    table = table.concat(item204_1,item204_2);
                    break;
                case '205':
                    let item205_1 = {
                        id:inputValue[0],
                        des:'',
                        debit:inputValue[3],
                        summary:inputValue[4],
                    };
                    let item205_2 = {
                        id:inputValue[1],
                        des:'',
                        lender:inputValue[3],
                        summary:inputValue[4],
                    };
                    times++;
                    table = table.concat(item205_1,item205_2);
                    break;
                case '206':
                    let item206_1 = {
                        id:inputValue[1],
                        des:'',
                        debit:inputValue[2],
                        summary:inputValue[3],
                    };
                    let item206_2 = {
                        id:inputValue[0],
                        des:'',
                        lender:inputValue[2],
                        summary:inputValue[3],
                    };
                    times++;
                    table = table.concat(item206_1,item206_2);
                    break;
                case '207':
                    let item207_1 = {
                        id:inputValue[0],
                        des:'',
                        debit:inputValue[3]+inputValue[6]+inputValue[8]+inputValue[10],
                        summary:inputValue[4],
                    };
                    let item207_2 = {
                        id:inputValue[1],
                        des:'',
                        lender:inputValue[3],
                        summary:inputValue[4],
                    };
                    let item207_3 = {
                        id:inputValue[5],
                        des:'',
                        lender:inputValue[6],
                        summary:inputValue[4],
                    };
                    let item207_4 = {
                        id:inputValue[7],
                        des:'',
                        lender:inputValue[8],
                        summary:inputValue[4],
                    };
                    let item207_5 = {
                        id:inputValue[9],
                        des:'',
                        lender:inputValue[10],
                        summary:inputValue[4],
                    };
                    times++;
                    table = table.concat(item207_1,item207_2,item207_3,item207_4,item207_5);
                    break;
                case '208':
                    let item208_1 = {
                        id:inputValue[3],
                        des:'',
                        debit:inputValue[4],
                        summary:inputValue[2],
                    };
                    let item208_2 = {
                        id:inputValue[5],
                        des:'',
                        debit:inputValue[6],
                        summary:inputValue[2],
                    };
                    let item208_3 = {
                        id:inputValue[0],
                        des:'',
                        lender:inputValue[4]+inputValue[6],
                        summary:inputValue[2],
                    };
                    times++;
                    table = table.concat(item208_1,item208_2,item208_3);
                    break;
                case '209':
                    if(!inputValue[0]||inputValue[0]==1){
                        let item209_1 = {
                            id:inputValue[1],
                            des:'',
                            debit:type==209?inputValue[3]:undefined,
                            summary:inputValue[4],
                        };
                        let item209_2 = {
                            id:inputValue[2],
                            des:'',
                            lender:type==209?inputValue[3]:undefined,
                            summary:inputValue[4],
                        };
                        times++;
                        table = table.concat(item209_1,item209_2);
                    }else if(inputValue[0]==2){
                        let item209_1 = {
                            id:inputValue[1],
                            des:'',
                            debit:type==209?inputValue[4]:undefined,
                            summary:inputValue[5],
                        };
                        let item209_2 = {
                            id:inputValue[2],
                            des:'',
                            lender:type==209?inputValue[4]:undefined,
                            summary:inputValue[5],
                        };
                        times++;
                        table = table.concat(item209_1,item209_2);
                    }else if(inputValue[0]==3){
                        let item209_1 = {
                            id:inputValue[2],
                            des:'',
                            debit:type==209?inputValue[4]:undefined,
                            summary:inputValue[7],
                        };
                        let item209_2 = {
                            id:inputValue[5],
                            des:'',
                            debit:type==209?inputValue[6]:undefined,
                            summary:inputValue[7],
                        };
                        let item209_3 = {
                            id:inputValue[1],
                            des:'',
                            lender:type==209?inputValue[4]+inputValue[6]:undefined,
                            summary:inputValue[7],
                        };
                        times++;
                        table = table.concat(item209_3,item209_1,item209_2);
                    }else if(inputValue[0]==4){
                        let item209_1 = {
                            id:inputValue[2],
                            des:'',
                            debit:type==209?inputValue[3]:undefined,
                            lender:type==219?inputValue[3]:undefined,
                            summary:inputValue[7],
                        };
                        let item209_2 = {
                            id:inputValue[4],
                            des:'',
                            debit:type==209?inputValue[6]:undefined,
                            lender:type==219?inputValue[6]:undefined,
                            summary:inputValue[7],
                        };
                        let item209_3 = {
                            id:inputValue[1],
                            des:'',
                            debit:type==219?inputValue[3]+inputValue[6]:undefined,
                            lender:type==209?inputValue[3]+inputValue[6]:undefined,
                            summary:inputValue[7],
                        };
                        times++;
                        table = table.concat(item209_3,item209_1,item209_2);
                    }else if(inputValue[0]==5){
                        let item209_1 = {
                            id:inputValue[2],
                            des:'',
                            debit:type==209?inputValue[4]:undefined,
                            lender:type==219?inputValue[4]:undefined,
                            summary:inputValue[10],
                        };
                        let item209_2 = {
                            id:inputValue[4],
                            des:'',
                            debit:type==209?inputValue[6]:undefined,
                            lender:type==219?inputValue[6]:undefined,
                            summary:inputValue[10],
                        };
                        let item209_3 = {
                            id:inputValue[7],
                            des:'',
                            debit:type==209?inputValue[9]:undefined,
                            summary:inputValue[10],
                        };
                        let item209_4 = {
                            id:inputValue[1],
                            des:'',
                            lender:type==209?inputValue[4]+inputValue[6]+inputValue[9]:undefined,
                            summary:inputValue[10],
                        };
                        times++;
                        table = table.concat(item209_4,item209_1,item209_2,item209_3);
                    }else if(inputValue[0] == 6){
                        let item209_1 = {
                            id:inputValue[2],
                            des:'',
                            debit:type==209?inputValue[4]:undefined,
                            lender:type==219?inputValue[4]:undefined,
                            summary:inputValue[5],
                        };
                        let item209_2 = {
                            id:inputValue[1],
                            des:'',
                            debit:type==219?inputValue[4]:undefined,
                            lender:type==209?inputValue[4]:undefined,
                            summary:inputValue[5],
                        };
                        times++;
                        table = table.concat(item209_1,item209_2);
                    }
                    break;
                case '219':
                    /********219和209区别在于借贷方对调,多一个数量**********/
                     if(!inputValue[0]||inputValue[0]==1){
                         let item219_1 = {
                             id:inputValue[1],
                             des:'',
                             lender:type==219?inputValue[4]:undefined,
                             summary:inputValue[5],
                             num:inputValue[2]
                         };
                         let item219_2 = {
                             id:inputValue[3],
                             des:'',
                             debit:type==219?inputValue[4]:undefined,
                             summary:inputValue[5],
                         };
                         times++;
                         table = table.concat(item219_2,item219_1);
                     }else if(inputValue[0]==2){
                         let item219_1 = {
                             id:inputValue[1],
                             des:'',
                             lender:type==219?inputValue[5]:undefined,
                             summary:inputValue[6],
                             num:inputValue[2]
                         };
                         let item219_2 = {
                             id:inputValue[3],
                             des:'',
                             debit:type==219?inputValue[5]:undefined,
                             summary:inputValue[6],
                         };
                         times++;
                         table = table.concat(item219_2,item219_1);
                     }else if(inputValue[0]==3){
                         let item219_1 = {
                             id:inputValue[3],
                             des:'',
                             lender:type==219?inputValue[5]:undefined,
                             summary:inputValue[8],
                         };
                         let item219_2 = {
                             id:inputValue[6],
                             des:'',
                             lender:type==219?inputValue[7]:undefined,
                             summary:inputValue[8],
                         };
                         let item219_3 = {
                             id:inputValue[1],
                             des:'',
                             debit:type==219?inputValue[5]+inputValue[7]:undefined,
                             summary:inputValue[8],
                             num:inputValue[2]
                         };
                         times++;
                         table = table.concat(item219_3,item219_1,item219_2);
                     }else if(inputValue[0]==4){
                         let item219_1 = {
                             id:inputValue[3],
                             des:'',
                             lender:type==219?inputValue[4]:undefined,
                             summary:inputValue[8],
                         };
                         let item219_2 = {
                             id:inputValue[5],
                             des:'',
                             lender:type==219?inputValue[7]:undefined,
                             summary:inputValue[8],
                         };
                         let item219_3 = {
                             id:inputValue[1],
                             des:'',
                             debit:type==219?inputValue[4]+inputValue[7]:undefined,
                             summary:inputValue[8],
                             num:inputValue[2]
                         };
                         times++;
                         table = table.concat(item219_3,item219_1,item219_2);
                     }else if(inputValue[0]==5){
                         let item219_1 = {
                             id:inputValue[3],
                             des:'',
                             lender:type==219?inputValue[5]:undefined,
                             summary:inputValue[11],
                         };
                         let item219_2 = {
                             id:inputValue[5],
                             des:'',
                             lender:type==219?inputValue[7]:undefined,
                             summary:inputValue[11],
                         };
                         let item219_3 = {
                             id:inputValue[8],
                             des:'',
                             lender:type==219?inputValue[10]:undefined,
                             summary:inputValue[11],
                         };
                         let item219_4 = {
                             id:inputValue[1],
                             des:'',
                             debit:type==219?inputValue[5]+inputValue[7]+inputValue[10]:undefined,
                             summary:inputValue[11],
                             num:inputValue[2]
                         };
                         times++;
                         table = table.concat(item219_4,item219_1,item219_2,item219_3);
                     }else if(inputValue[0] == 6){
                         let item219_1 = {
                             id:inputValue[3],
                             des:'',
                             lender:type==219?inputValue[5]:undefined,
                             summary:inputValue[6],
                         };
                         let item219_2 = {
                             id:inputValue[1],
                             des:'',
                             debit:type==219?inputValue[5]:undefined,
                             summary:inputValue[6],
                             num:inputValue[2]
                         };
                         times++;
                         table = table.concat(item219_2,item219_1);
                     }
                    break;
                case '211':
                    let item211_1 = {
                        id:inputValue[2],
                        des:'',
                        debit:inputValue[4],
                        summary:inputValue[5],
                    };
                    let item211_2 = {
                        id:inputValue[0],
                        des:'',
                        lender:inputValue[4],
                        summary:inputValue[5],
                    };
                    times++;
                    table = table.concat(item211_1,item211_2);
                    break;
                case '212':
                    let item212_1 = {
                        id:inputValue[2],
                        des:'',
                        debit:inputValue[4],
                        summary:inputValue[5],
                    };
                    let item212_2 = {
                        id:inputValue[0],
                        des:'',
                        lender:inputValue[4],
                        summary:inputValue[5],
                    };
                    times++;
                    table = table.concat(item212_1,item212_2);
                    break;
                case '213':
                    let item213_1 = {
                        id:inputValue[3],
                        des:'',
                        debit:inputValue[4],
                        summary:inputValue[2],
                    };
                    let item213_2 = {
                        id:inputValue[5],
                        des:'',
                        debit:inputValue[6],
                        summary:inputValue[2],
                    };
                    let item213_3 = {
                        id:inputValue[0],
                        des:'',
                        lender:inputValue[4]+inputValue[6],
                        summary:inputValue[2],
                    };
                    times++;
                    table = table.concat(item213_1,item213_2,item213_3);
                    break;
                case '214':
                    let item214_1 = {
                        id:inputValue[0],
                        des:'',
                        debit:inputValue[3],
                        summary:inputValue[4],
                    };
                    let item214_2 = {
                        id:inputValue[1],
                        des:'',
                        lender:inputValue[3],
                        summary:inputValue[4],
                    };
                    times++;
                    table = table.concat(item214_1,item214_2);
                    break;
                case '215':
                    let item215_1 = {
                        id:inputValue[0],
                        des:'',
                        debit:inputValue[2],
                        summary:inputValue[3],
                    };
                    let item215_2 = {
                        id:inputValue[1],
                        des:'',
                        debit:inputValue[2]*-1,
                        summary:inputValue[3],
                    };
                    times++;
                    table = table.concat(item215_1,item215_2);
                    break;
                case '216':
                    let item216_1 = {
                        id:inputValue[0],
                        des:'',
                        debit:inputValue[3],
                        summary:inputValue[4],
                    };
                    let item216_2 = {
                        id:inputValue[1],
                        des:'',
                        lender:inputValue[3],
                        summary:inputValue[4],
                    };
                    times++;
                    table = table.concat(item216_1,item216_2);
                    break;
                case '217':
                    let item217_1 = {
                        id:inputValue[1],
                        des:'',
                        debit:inputValue[2],
                        summary:inputValue[3],
                    };
                    let item217_2 = {
                        id:inputValue[0],
                        des:'',
                        lender:inputValue[2],
                        summary:inputValue[3],
                    };
                    times++;
                    table = table.concat(item217_1,item217_2);
                    break;
                case '218':
                    let item218_1 = {
                        id:inputValue[2],
                        des:'',
                        debit:inputValue[4],
                        summary:inputValue[5],
                    };
                    let item218_2 = {
                        id:inputValue[0],
                        des:'',
                        lender:inputValue[4],
                        summary:inputValue[5],
                    };
                    times++;
                    table = table.concat(item218_1,item218_2);
                    break;
            }
            this.setState({table,times})
        }
        render() {
            return (
                <div className="gen-certificate">
                    <Card title={<h1 className="certificate-title">{this.props.title}</h1>}
                          bordered={true}>
                        <Row>
                            <Col xs={8}>
                                <Row>
                                    <Col xs={8} className="right" style={{paddingRight:'1rem'}}>
                                        日期
                                    </Col>
                                    <Col xs={16}>
                                        <DatePicker value={this.state.date} onChange={this.changeDate.bind(this)}/>
                                    </Col>
                                </Row>
                                <Row className="genson-margin-top">
                                    <Col xs={8} className="right" style={{paddingRight:'1rem'}}>
                                        凭证号
                                    </Col>
                                    <Col xs={16}>
                                        <InputNumber value={this.state.vnum} onChange={this.changeVnum.bind(this)}/>
                                    </Col>
                                </Row>
                            </Col>
                            <Col xs={14} offset={2} style={{borderLeft:'2px solid #888888'}}>
                                <Row>
                                    {this.state.inputList.map((item,index)=>{
                                        return<Col xs={18} key={index} className="genson-margin-top">
                                            <Col xs={8} className="right"
                                                 style={{paddingRight:'1rem',
                                                     visibility:item.type=='merge'?'hidden':'visible'}}>
                                                {item.title}
                                            </Col>
                                            <Col xs={16}>
                                                {this.rtType(item.type,item.set,index)}
                                            </Col>
                                        </Col>
                                    })}
                                </Row>
                                <Row >
                                    <Col offset={6} style={{marginTop:'1rem'}}>
                                        <Button onClick={this.submitForm.bind(this)}>执行</Button>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <CertificateTable exchange={this.state.isExchange} vnum={this.state.vnum} date={this.state.date}
                                          switchSetType={this.props.switchSetType.bind(this)}
                                          getVnum={this.getVnum.bind(this)}
                                          initCertificate={this.props.initCertificate.bind(this)}
                                          merge={this.state.merge}
                                          type={this.state.type}
                                          times={this.state.times}
                                          table={this.state.table}
                                          usd={this.state.isUsd}/>
                    </Card>
                </div>
            );
        }

    }
    module.exports = EasyCertificate;
})();