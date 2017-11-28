/**
 * Created by junhui on 2017/3/23.
 */
(function () {
    'use strict';
    let React = require('react');
    let moment = require('moment');
    let {Request} = require('./../request');
    let { hashHistory} = require('react-router');
    let ChangeExchange = require('./ChangeExchange');
    let ScanCode = require('./ScanCode');
    let { Card, Col, Row ,Button,Select,Input ,InputNumber,DatePicker,Tag,
        Tooltip,Menu,Dropdown,Icon,message,Switch,Modal } = require('antd');
    let {GetLocalStorage,objToArr,numToDX,getDateVnum,toThousands,urlParam} = require('./../tool');
    let BindFile = require('./BindFile');
    let TreePage = require('./TreeNode');
    const language = require('../Language');
    const { Option, OptGroup } = Select;
    const money = ["亿","千","百","十","万","千","百","十","元","角","分",];
    const limit = {max:999999999.99};
    let curr = [];
    class Certificate extends React.Component{
        constructor(props){
            super(props);
            const Const = GetLocalStorage('Const');
            this.state = {
                vnum:GetLocalStorage('Const').vnum,
                date:moment().format("YYYY-MM-D"),
                memo_:'',
                key:3,//初始行数0,1,2,3
                balance:[],//下拉选项
                income:[],//借方
                outcome:[],//贷方
                con:[],//表格内容
                des:[],//描述
                total:'',//合计金额
                showExchange:false,//显示外汇
                showNumber:false,//显示数量单价
                minusIn:[],//借方负数标记
                minusOut:[],//贷方负数标记
                exchangeType:[],//币种
                att_id:[],
                focusKey:'',
                focusItem:{key:'',type:''},
                exchange:[],//汇率
                usd:[],//原币
                num:[],//数量
                price:[],//单价
                openExchange:0,//打开汇率面板
                CONST:{
                    prices_dec:Const.prices_dec||2,//价格/金额
                    qty_dec: Const.qty_dec||2,      //数量
                    rates_dec: Const.rates_dec||2,  //汇率
                },
                reference:'',
                subject:[],//科目借贷余额
                step:1,
            };
            this.add = this.add.bind(this);
            this.reduce = this.reduce.bind(this);
        }
        /*************增加一行*************/
        add(key,event){
            event.preventDefault();
            // this.setState({value: event.target.value});
            let con = this.state.con;
            let exchange = this.state.exchange;
            let addKey;
            con.map((data,index)=>{
                if(data && (data.key == key)){
                    addKey = index;
                }
            });
            exchange[this.state.key+1] = 1;
            con.splice(addKey+1,0,this.initLine(this.state.key+1).ud);
            this.setState((prevState) => ({
                key:this.state.key+1,
                con:con,
                exchange
            }));
        }
        /*************删除一行*************/
        reduce(key,event){
            event.preventDefault();
            let con = this.state.con;
            let inC = this.state.income;
            let outC = this.state.outcome;
            inC[key] = '';
            outC[key] = '';
            if(con.length == 2){
                message.warning(language.KeepTwoEntries);
                return ;
            }
            con.map((data,index)=>{
                if(data && data.key == key){
                    con.splice(index,1);
                }
            });
            this.setState({
                income:inC,
                outcome:outC,
                con:con,
            })
        }
        /***************保存**************/
        save(isNew){
            const _this = this;
            let {minusOut,minusIn} = this.state;
            let countIn = 0;
            let countOut = 0;
            let income = this.state.income.length == 0?0:this.state.income.reduce(
                (prev, curr,currentIndex) => {
                    let negative = minusIn[currentIndex];
                    if(countIn==0){
                        countIn++;
                        let negative0 = minusIn[0]||minusOut[0];
                        prev = prev*(negative0?-1:1)
                    }
                    prev= prev?prev:0;
                    curr= curr?curr*(negative?-1:1):0;
                    return Number(prev) + Number(curr)
                } );
            let outcome = this.state.outcome.length == 0?0:this.state.outcome.reduce(
                (prev, curr,currentIndex) => {
                    let negative = minusOut[currentIndex];
                    if(countOut==0){
                        countOut++;
                        let negative0 = minusIn[0]||minusOut[0];
                        prev = prev*(negative0?-1:1)
                    }
                    prev= prev?prev:0;
                    curr= curr?curr*(negative?-1:1):0;
                    return Number(prev) + Number(curr)
                } );
            let item = this.state.con;
            item.map((data,index)=>{
                if(!this.state.des[data.key]){
                    // message.warning('第'+index+'行的')
                }
            });
            if(this.state.income.length+this.state.outcome.length<2){
                message.warning(language.KeepTwoEntries);
                return ;
            }else if(income!=outcome){
                message.warning(language.InputDebitImbalance);
                return ;
            }else {
                let keyList = {};
                _this.state.con.map((item,i)=>{
                    keyList[`${item.key}`] = i;
                });
                console.log(keyList);
                let i = [];
                let par = {
                    date_:this.state.date,
                    memo_:this.state.memo_,
                    vnum:this.state.vnum,
                };
                this.state.att_id.map((id,index)=>{
                   par[`att_id[${index}]`]  = id;
                });
                if(urlParam().isEdit==1){
                    par['refs[id]'] = window.genRecord.Refs.id;
                    par['refs[type]'] = window.genRecord.Refs.type;
                }
                let USD = this.state.usd;
                let EXCHANGE = this.state.exchange;
                let NUM = this.state.num;
                let PRICE = this.state.price;
                this.state.income.map((data,index)=>{
                    if(!!data){
                        let key = keyList[index];
                        par['detail['+key+'][amount]'] = data*(minusIn[index]?-1:1)/100;
                        par['detail['+key+'][memo_]'] = this.state.des[index]||'';
                        par['detail['+key+'][identity]'] = '1';
                        if(!this.state.balance[index]){
                            this.state.con.map((tree,j)=>{
                                if(tree.key == index){
                                    i.push(j+1);
                                }
                            });
                        }else {
                            par['detail['+key+'][account]'] = this.state.balance[index];
                        }
                        if(this.state.showNumber && PRICE[index]){
                            let qty = document.getElementById(`${index}num`);
                            let price = document.getElementById(`${index}price`);
                            if(qty){
                                par[`detail[${key}][qty]`] = qty.value;
                            }
                            if(price){
                                par[`detail[${key}][price]`] = price.value;
                            }
                        }
                        if(this.state.showExchange && USD[index]){
                            let exchange = document.getElementById(`${index}exchange`);
                            if(exchange){
                                par[`detail[${key}][rate]`] = exchange.value;
                                par['detail['+key+'][curr_code]'] = this.state.exchangeType[index];
                            }
                        }
                    }
                });
                this.state.outcome.map((data,index)=>{
                    if(!!data){
                        let key = keyList[index];
                        par['detail['+key+'][amount]'] = data*(minusOut[index]?-1:1)/100;
                        par['detail['+key+'][memo_]'] = this.state.des[index]||'';
                        par['detail['+key+'][identity]'] = '2';
                        if(!this.state.balance[index]){
                            this.state.con.map((tree,j)=>{
                                if(tree.key == index){
                                    i.push(j+1);
                                }
                            });
                        }else {
                            par['detail['+key+'][account]'] = this.state.balance[index];
                        }
                        if(this.state.showNumber&& PRICE[index]){
                            let qty = document.getElementById(`${index}num`);
                            let price = document.getElementById(`${index}price`);
                            if(qty){
                                par[`detail[${key}][qty]`] = qty.value;
                            }
                            if(price){
                                par[`detail[${key}][price]`] = price.value;
                            }
                        }
                        if(this.state.showExchange&& USD[index]){
                            let exchange = document.getElementById(`${index}exchange`);
                            if(exchange){
                                par[`detail[${key}][rate]`] = exchange.value;
                                par['detail['+key+'][curr_code]'] = this.state.exchangeType[index];
                            }
                        }
                    }
                });
                let type = {
                    type:urlParam().isEdit==1?'refs/update':'refs/save',
                    method:'FormData',
                    Method:'POST'
                };
                let callback = function (data) {
                    if(data.code == 0){
                        message.success(language.SaveCertificateSuccessfully);
                        _this.setState({
                            memo_:'',
                            key:3,//初始行数0,1,2,3
                            balance:[],//下拉选项
                            income:[],//借方
                            outcome:[],//贷方
                            con:[],//表格内容
                            des:[],//描述
                            total:'',//合计金额
                            showExchange:false,//显示外汇
                            showNumber:false,//显示数量单价
                            minusIn:[],//借方负数标记
                            minusOut:[],//贷方负数标记
                            exchangeType:[],
                            att_id:[],
                            focusKey:'',
                            focusItem:{key:'',type:''},
                            exchange:[],
                            usd:[],
                            num:[],
                            price:[]
                        },()=>{
                            if(isNew != 'new'){
                                let modifyCb = (mData)=>{
                                    window.genRecord = mData.info;
                                    hashHistory.push('/mainPage/101?isRed=0&isEdit=1');
                                    // _this.props.initCertificate(mData.info,false,true)
                                };
                                let id = urlParam().isEdit==1?window.genRecord.Refs.id:data.info;
                                _this.searchById(id,modifyCb);
                            }else {
                                window.genRecord = null;
                                hashHistory.push('/mainPage/101?isRed=0&isEdit=0');
                                // _this.props.isEdit = false;
                                // _this.getInit();
                                _this.getVnum(_this.state.date);
                            }
                        });
                    }else {
                        message.error(data.message);
                    }
                };
                if(i.length!=0){
                    message.error('尚未选择第'+i+'条会计科目');
                }else if(!par.date_) {
                    message.error('尚未选择录入日期');
                }else{
                    let defer = new Promise((resolve, reject)=>{
                        this.isBeyond(resolve, reject);
                    });
                    defer.then(function(value) {
                        // success
                        Request(par,callback,type);
                    }, function(value) {
                        // failure
                        return ;
                    });
                }
            }
        }
        /****检查凭证的银行科目是否超出额度****/
        isBeyond(resolve, reject){
            let {subject,minusOut,minusIn,balance,income,outcome} = this.state;
            let code = [];
            let list = [];
            let waring = false;
            balance.map((id,key)=>{
                if(list.indexOf(id)==-1){
                    // code.push(id);
                    if(!subject[key].is_bank){
                        /********非银行科目不做提示*******/
                        return ;
                    }
                    let item = {};
                    item.id = id;
                    item.key = key;
                    let amount = subject[key].amount;
                    let use = income[key]/100*(minusIn[key]?-1:1)-outcome[key]/100*(minusOut[key]?-1:1);
                    let beyond = amount+use;
                    item.amount = amount;
                    item.nowAmount = subject[key].amount;
                    item.use = use;
                    item.beyond = beyond;
                    item.waring = beyond<0?true:false;
                    code.push(item);
                    list.push(id);
                }else {
                    code.map((con,index)=>{
                        if(con.id == id){
                            let item = {};
                            item.id = id;
                            item.key = key;
                            let amount = con.beyond;
                            let use = income[key]/100*(minusIn[key]?-1:1)-outcome[key]/100*(minusOut[key]?-1:1);
                            let beyond = amount+use;
                            item.nowAmount = con.nowAmount = subject[key].amount;
                            item.amount = con.amount = amount;
                            item.use = con.use = use;
                            item.beyond = con.beyond = beyond;
                            item.waring = con.waring = beyond<0?true:false;
                        }
                    })
                }
            });
            code.map((item)=>{
               if(!waring&&item.waring){
                   waring = true;
               }
            });
            if(waring){
                console.log(code);
                Modal.confirm({
                    title: '部分银行科目超出额度，是否继续？',
                    width:'720',
                    content: <div>
                        {
                            code.map((item,index)=>{
                                if(item.waring){
                                    return <Row className="genson-margin-top">
                                        {index+1}：科目{item.id}额度超出当前余额，当前余额为：
                                        {toThousands(item.nowAmount)}，
                                        录入后余额为：{toThousands(item.beyond)}。
                                    </Row>
                                }else {
                                    return '';
                                }
                            })
                        }
                    </div>,
                    okText: '继续提交',
                    cancelText: '取消',
                    onOk:()=>{resolve();},
                    onCancel:()=>{reject();},
                });
            }else {
                resolve();
            }
        }
        searchById(id,cb){
            const url = {
                type:'refs/view',
                method:'GET'
            };
            let par = {id:id};
            Request(par,cb,url);
        };
        /*******键盘点击事件的监听***********/
        handleKeyDown(e){
            e = window.event || e;
            let focusKey = this.state.focusKey;
            // console.log('focusKey is:',focusKey);
            let {income,focusItem,outcome,minusOut,minusIn} = this.state;
            let inDom = document.getElementById(`${focusKey}income`);
            let outDom = document.getElementById(`${focusKey}outcome`);
            if(e.ctrlKey&&e.keyCode == 83){//监听ctrl+s按键
                this.save();
                e.preventDefault();//通知 Web 浏览器不要执行与事件关联的默认动作
                e.returnValue=false;
                return false;
            }else if(e.keyCode == 118 ){
                //F7-借贷自动平衡/摘要
                let incomeTotal = 0;
                let outcomeTotal = 0;
                let {usd,exchange,num,price} = this.state;
                income.map((item,index)=>{
                    if(index!=focusKey){
                        incomeTotal+=Number(item*(minusIn[index]?-1:1)||0);
                    }
                });
                outcome.map((item,index)=>{
                    if(index!=focusKey){
                        outcomeTotal+=Number(item*(minusOut[index]?-1:1)||0);
                    }
                });
                if(incomeTotal<outcomeTotal){
                    inDom.value = outcomeTotal-incomeTotal;
                    income[focusKey] = outcomeTotal-incomeTotal;
                    minusIn[focusKey] = false;
                    if(focusItem.type == 'income'&& focusItem.key ==focusKey){
                        income[focusKey] = income[focusKey]/100;
                    }
                    outcome[focusKey] = '';
                    if(usd[focusKey]!='undefined'){
                        usd[focusKey] = Number(income[focusKey]/exchange[focusKey]/100);
                        if(String(usd[focusKey]).indexOf(".")>-1){
                            usd[focusKey] = usd[focusKey].toFixed(this.state.CONST.rates_dec)
                        }
                    }
                    if(price[focusKey]!='undefined'){
                        price[focusKey] = Number(income[focusKey]/num[focusKey]/100);
                        if(String(price[focusKey]).indexOf(".")>-1){
                            price[focusKey] = price[focusKey].toFixed(this.state.CONST.prices_dec)
                        }
                    }
                }else {
                    outDom.value = incomeTotal-outcomeTotal;
                    outcome[focusKey] = incomeTotal-outcomeTotal;
                    minusOut[focusKey] = false;
                    if(focusItem.type == 'outcome'&& focusItem.key ==focusKey){
                        outcome[focusKey] = outcome[focusKey]/100;
                    }
                    income[focusKey] = '';
                    if(usd[focusKey]!='undefined'){
                        usd[focusKey] = Number(outcome[focusKey]/exchange[focusKey]/100);
                        if(String(usd[focusKey]).indexOf(".")>-1){
                            usd[focusKey] = usd[focusKey].toFixed(this.state.CONST.rates_dec)
                        }
                    }
                    if(price[focusKey]!='undefined'){
                        price[focusKey] = Number(outcome[focusKey]/num[focusKey]/100);
                        if(String(price[focusKey]).indexOf(".")>-1){
                            price[focusKey] = price[focusKey].toFixed(this.state.CONST.prices_dec)
                        }
                    }
                }
                this.setState({income,outcome,minusOut,minusIn},()=>{
                    this.getTotal()
                });
            }else if(e.keyCode == 119){
                //F8 - 借贷对调
                setTimeout(()=>{
                    if(focusItem.key == focusKey&&focusItem.type=='income'){
                        if(income[focusKey]>0){
                            inDom.value = Math.round(inDom.value*100);
                        }else {
                            outDom.value = outDom.value/100;
                        }
                    }
                    if(focusItem.key == focusKey&&focusItem.type=='outcome'){
                        if(outcome[focusKey]>0){
                            outDom.value = Math.round(outDom.value*100);
                        }else {
                            inDom.value = inDom.value/100;
                        }
                    }
                    let temp = inDom.value;
                    inDom.value = outDom.value||'';
                    outDom.value = temp||'';
                    income[focusKey] = inDom.value;
                    outcome[focusKey] = outDom.value;
                    let tempRed = minusIn[focusKey];
                    minusIn[focusKey] = minusOut[focusKey];
                    minusOut[focusKey] = tempRed;
                    console.log(minusIn[focusKey],minusOut[focusKey]);
                    this.setState({income,outcome,minusOut,minusIn},()=>{
                        this.getTotal()
                    });
                });
            }else if(e.keyCode == 120){
                //F9 - 复制备注
                this.focusTextarea.bind(this)(focusKey);
            }
        };
        /*********科目下拉内容排布**********/
        renOption(list,level){
            level++;
            let ren = list.map((data1)=>{
                if(data1.open){
                    return <OptGroup key={data1.id} label={<div style={{textIndent:(level)*0.75+'rem'}}>
                        {data1.id+' - '+data1.name}</div>}>
                        {
                            data1.children.map((data2)=>{
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
        /***********接收到内容更新**********/
        componentWillReceiveProps(nextProps, nextContext) {
            this.getInit();
            console.log('new props',nextProps)
        }

        componentWillMount() {
            GetLocalStorage('currency').map((item)=>{
                if(item.inactive == 0){
                    curr.push(item);
                }
            });
        }

        componentDidMount() {
            let par = urlParam();
            if(!(par.isEdit==1)){
                this.getVnum(this.state.date);
            }
            this.getInit();
        }
        /*********更新凭证编号*********/
        getVnum(date){
            let cb = (data)=>{
                //获取默认凭证号和时间
                let date = data.date_;
                let vnum = data.vnum;
                this.setState({
                    date,
                    vnum
                })
            };
            getDateVnum(cb,date);
        }
        setFocusKey(key){
            this.setState({focusKey:key})
        }
        getInit(){
            const initCon = [];
            let Exchange = [];
            // const children = [];
            let _this = this;
            let type = {
                type:'tree/get-type-master-tree',
                method:'GET',
            };
            if(!window.genRecord){
                for(let i=0;i<=this.state.key;i++){
                    initCon[i] = this.initLine(i).ud;
                    Exchange[i] = 1;
                }
            }
            let callback = function (data) {
                let list = objToArr(data.info);
                let ren = _this.renOption(list,-1);
                _this.setState({con:initCon,children:ren,exchange:Exchange});
                if(window.genRecord){
                    let st = {};
                    st = {
                        memo_:window.genRecord.Refs.memo_,
                        att_id:window.genRecord.Refs.att_id,
                    };
                    if(urlParam().isEdit==1){
                        st.vnum = window.genRecord.Refs.vnum;
                        st.date = window.genRecord.Refs.date_;
                        st.reference = window.genRecord.Refs.reference;
                    }
                    st.income = [];
                    st.outcome = [];
                    st.des = [];
                    st.exchangeType = [];
                    st.minusOut = [];
                    st.minusIn = [];
                    st.balance = [];
                    st.con = [];
                    st.usd = [];
                    st.price = [];
                    st.exchange = [];
                    st.num = [];
                    st.key = window.genRecord.GlTrans.length-1;
                    window.genRecord.GlTrans.map((item,index)=>{
                        st.con[index] =_this.initLine(index).ud;
                        st.exchange[index] = 1;
                        st.des[index] = item.memo_;
                        st.exchangeType[index] = item.curr_code;
                        st.balance[index] = item.account;
                        _this.setSelect(index,item.account);
                        if(GetLocalStorage('Const').curr_default&&item.curr_code&&GetLocalStorage('Const').curr_default!=item.curr_code){
                            st.showExchange = true;//汇率大于0显示汇率
                            let temp = Number(item.amount/item.rate);
                            temp = temp.toFixed(_this.state.CONST.rates_dec);
                            st.usd[index] = Math.abs(temp);
                            st.exchange[index] = item.rate;
                        }
                        if(item.price!=0){
                            st.showNumber = true;//单价不等于0显示数量
                            st.price[index] = Math.abs(item.price);
                            st.num[index] = Math.abs(item.qty);
                        }
                        if(item.negative == 0){
                            if(item.amount>0){
                                st.income[index] = Math.round(Number(item.amount*100));
                                st.minusIn[index] = false;
                                if(urlParam().isRed==1){
                                    st.minusIn[index] = !st.minusIn[index];
                                }

                            }else {
                                st.outcome[index] = Math.round(Number(-item.amount*100));
                                st.minusOut[index] = false;
                                if(urlParam().isRed==1){
                                    st.minusOut[index] = !st.minusOut[index];
                                }
                            }
                        }else{
                            if(item.amount<0){
                                st.income[index] = Math.round(Number(-item.amount*100));
                                st.minusIn[index] = true;
                                if(urlParam().isRed==1){
                                    st.minusIn[index] = !st.minusIn[index];
                                }
                            }else {
                                st.outcome[index] = Math.round(Number(item.amount*100));
                                st.minusOut[index] = true;
                                if(urlParam().isRed==1){
                                    st.minusOut[index] = !st.minusOut[index];
                                }
                            }
                        }
                    });
                    console.log(st);
                    _this.setState(st,()=>{
                        window.genRecord.GlTrans.map((item,index)=>{
                            let usd = document.getElementById(index+'usd');
                            let exchange = document.getElementById(index+'exchange');
                            let num = document.getElementById(index+'num');
                            let price = document.getElementById(index+'price');
                            if(item.rate>0){
                                exchange.value = item.rate;
                                usd.value = item.amount>0?item.amount/item.rate:-item.amount/item.rate;
                                usd.value = parseInt(Number(usd.value).toFixed(_this.state.CONST.rates_dec));
                            }
                            if(item.price>0){
                                price.value = item.price;
                                num.value = item.qty;
                            }
                        });
                        _this.getTotal();
                    });
                }
            };
            Request({},callback,type);
        }
        resetTree(){
            let _this = this;
            let type = {
                type:'tree/get-type-master-tree',
                method:'GET',
            };
            let callback = function (data) {
                let list = objToArr(data.info);
                let ren = _this.renOption(list,-1);
                _this.setState({children:ren});
            };
            Request({},callback,type);
        }
        focusChange(key,type,e){
            let value = e.target.value;
            let dom = document.getElementById(key+type);
            let {minusIn,minusOut,income,outcome,focusItem} = this.state;
            if(!value){
                dom.value = '';
            }else {
                let isRed = (minusIn[key]||minusOut[key])?-1:1;
                //根据标记是否为负计算
                dom.value = Number(isRed*value/100);
            }
            focusItem.key = key;
            focusItem.type = type;
            if(type == 'income'){
                income[key] = dom.value;
            }else if(type == 'outcome'){
                outcome[key] = dom.value;
            }
            this.setState({income,outcome,focusItem});
            console.log('focus',key+type,dom.value)
        }
        income(key,value){
            let inC = this.state.income;
            let outC = this.state.outcome;
            let minusIn = this.state.minusIn;
            let focusItem = this.state.focusItem;
            focusItem.key = '';
            focusItem.type = '';
            let temp = value.target.value;
            let reg = ['+','-','*','/'];
            if(reg.indexOf(temp[temp.length-1])>-1){
                temp = temp.substr(0,temp.length-1);
            }
            value.target.value = eval(temp)||'';
            if(value.target.value==0){
                value.target.value = '';
                inC[key] = '';
                this.setState({
                    income:inC,
                    outcome:outC
                });
                return ;
            }else {
                if(value.target.value<0) {
                    value.target.value = -value.target.value;
                    minusIn[key] = true;//标记对应key为负数
                }else {
                    minusIn[key] = false;
                }
                if(value.target.value>limit.max){
                    //判断是否超过限定的最大值
                    value.target.value = limit.max;
                }
                console.log('blur income',value.target.value);
                value.target.value = Math.round(Number(value.target.value).toFixed(2)*100);
            }
            inC[key] = Number(value.target.value);
            outC[key] = '';//清空贷方记录数据
            let e = document.getElementById(key+'outcome');
            e.value = '';//清空贷方显示数据
            let usd = this.state.usd;
            let exchange = this.state.exchange;
            let num = this.state.num;
            let price = this.state.price;
            if((exchange[key]!=0 && typeof(usd[key])!='undefined')||exchange[key]){
                let val = Number(inC[key]/100/(exchange[key]||1));
                usd[key] = val.toFixed(this.state.CONST.rates_dec);
            }
            if((num[key]!=0 &&typeof(price[key])!='undefined')||num[key]){
                let val = Number(inC[key]/100/(num[key]||1)/(exchange[key]||1));
                price[key] = val.toFixed(this.state.CONST.prices_dec);
            }
            this.setState({
                income:inC,
                outcome:outC,
                minusIn:minusIn,
                focusItem,
                price,
                usd
            },()=>{

            });
            this.getTotal();
        }
        outcome(key,value){
            let inC = this.state.income;
            let outC = this.state.outcome;
            let minusOut = this.state.minusOut;
            let focusItem = this.state.focusItem;
            focusItem.key = '';
            focusItem.type = '';
            let temp = value.target.value;
            let reg = ['+','-','*','/'];
            if(reg.indexOf(temp[temp.length-1])>-1){
                temp = temp.substr(0,temp.length-1);
            }
            value.target.value = eval(temp)||'';
            if(value.target.value==0){
                value.target.value = '';
                outC[key] = '';
                this.setState({
                    income:inC,
                    outcome:outC
                });
                return ;
            }else {
                if(value.target.value<0) {
                    value.target.value = -value.target.value;
                    minusOut[key] = true;
                }else {
                    minusOut[key] = false;
                }
                if(value.target.value>limit.max){
                    value.target.value = limit.max;
                }
                value.target.value = Math.round(Number(value.target.value).toFixed(2)*100);
            }
            outC[key] = Number(value.target.value);
            inC[key] = '';

            let e = document.getElementById(key+'outcome');
            e.value = '';//清空贷方显示数据
            let usd = this.state.usd;
            let exchange = this.state.exchange;
            let num = this.state.num;
            let price = this.state.price;
            if(exchange[key]!=0 && typeof(usd[key])!='undefined'||exchange[key]){
                let val = Number(outC[key]/100/(exchange[key]||1));
                usd[key] = val.toFixed(this.state.CONST.rates_dec)
            }
            if(num[key]!=0 &&typeof(price[key])!='undefined'||num[key]){
                let val = Number(outC[key]/100/(num[key]||1)/(exchange[key]||1));
                price[key] = val.toFixed(this.state.CONST.prices_dec)
            }
            this.setState({
                income:inC,
                outcome:outC,
                minusOut:minusOut,
                focusItem,
                price,
                usd
            },()=>{

            });
            this.getTotal();
        }
        setSelect(key, value,option ){
            let ba = this.state.balance;
            let subject = this.state.subject;
            if(value){
                ba[key] = value;
                this.setState({balance:ba},()=>{
                    this.getBalance(value,key);
                });
            }else {
                ba[key] = null;
                subject[key] = null;
                this.setState({balance:ba,subject});
            }
        }
        getBalance(id,key){
            const url = {
                type:'chart-master/account-balance',
                method:'GET'
            };
            let par = {account_code:id};
            let cb=(data)=>{
                let subject = this.state.subject;
                subject[key] = data.info;
                this.setState({subject});
            };
            Request(par,cb,url)
        }
        selectType(key, value,option){
            let {sb_type,curr_code} = option.props;
            let exchangeType = this.state.exchangeType;
            let showExchange = this.state.showExchange;
            let showNumber = this.state.showNumber;
            let price = this.state.price;
            let num = this.state.num;
            exchangeType[key] = curr_code;
            if(sb_type == 1){//数值科目
                showNumber = true;
                num[key] = num[key]||1;
                let account = this.state.income[key]/100||this.state.outcome[key]/100;
                if(account){
                    //如果有汇率，则汇率纳入计算
                    price[key] = this.state.exchange[key]>0?
                        (account/num[key]/this.state.exchange[key]).toFixed(this.state.CONST.prices_dec):
                        (account/num[key]).toFixed(this.state.CONST.prices_dec);
                }
            }
            if(GetLocalStorage('Const').curr_default&&curr_code&&curr_code!=GetLocalStorage('Const').curr_default){
                showExchange = true;
                this.searchRate(curr_code,key)
            }
            this.setState({exchangeType,showNumber,showExchange,price,num},()=>{
                this.setBlur.bind(this,key,'select')();
            });
            console.log(sb_type,curr_code)
        }
        changeVnum(value){
            this.setState({
                vnum:value
            })
        }
        changeTextarea(key,e){
            let des = this.state.des;
            des[key] = e.target.value.replace(/[\r\n]/g, "");//去掉回车换行
            this.setState({
                des:des,
            });
        }
        focusTextarea(key){
            let {des,con,income,outcome,balance} = this.state;
            let detail = '';
            let num ;
            const e = document.getElementById('textarea'+key);
            if(!e.value){
                if((income[key]||outcome[key]) && balance[key]){
                    con.map((con_data,a)=>{
                        if(con_data.key == key ){
                            num = a;
                        }
                    });
                    con.map((item,index)=>{

                        if(index<=num&&index>0){
                            if(des[con[index-1].key]){
                                detail = des[con[index-1].key];
                            }
                            if(detail&&!des[item.key]&&
                                (income[item.key]||
                                outcome[item.key])&&
                                balance[item.key]){
                                des[item.key] = detail;
                            }
                        }
                    });
                    console.log(des);
                    // des.map((data,index)=>{
                    //
                    //     if(data&&index==num){
                    //         detail = data;
                    //     }
                    // });
                    // des[key] = detail;
                    this.setState({
                        des:des,
                    });
                }else {
                    e.style.borderColor = 'red';
                    let name = e.className;
                    e.className = name+' animated shake';
                    setTimeout(()=>{
                        e.className = 'ant-input';
                        e.style.borderColor = '';
                    },1000);
                }
            }
        }
        getTotal(){
            let income,outcome;
            if(this.state.income.length>0){
                income = this.state.income.reduce(
                    (prev, curr, index) => {
                        prev= prev?prev:0;curr= curr?curr*(this.state.minusIn[index]?-1:1):0;
                        return(Number(prev) + Number(curr))==0?null:(Number(prev) + Number(curr))
                    },0);
            }
            if(this.state.outcome.length>0){
                outcome = this.state.outcome.reduce(
                    (prev, curr, index) => {
                        prev= prev?prev:0;curr= curr?curr*(this.state.minusOut[index]?-1:1):0;
                        return(Number(prev) + Number(curr))==0?null:(Number(prev) + Number(curr))
                    },0);
            }
            if(income == outcome){
                this.setState({
                    total:numToDX(income/100)
                })
            }else {
                this.setState({
                    total:''
                })
            }
        }
        initHeader(){
            let LTextA,LSelect;
            if(this.state.showExchange&&this.state.showNumber){
                LTextA = 2;
                LSelect = 6;
            }else if(!this.state.showExchange&&!this.state.showNumber){
                LTextA = 6;
                LSelect = 10;
            }else if(this.state.showExchange&&!this.state.showNumber){
                LTextA = 4;
                LSelect = 7;
            }else if(!this.state.showExchange&&this.state.showNumber){
                LTextA = 4;
                LSelect = 9;
            }
            let header = <Row className="center certificate-header">
                <Col xs={LSelect}>会计科目</Col>
                <Col xs={2} style={{display:this.state.showExchange?'block':'none'}}>币种</Col>
                <Col xs={3} style={{display:this.state.showExchange?'block':'none'}}>外币原币</Col>
                <Col xs={3} style={{display:this.state.showNumber?'block':'none'}}>数量单价</Col>
                <Col xs={4}>
                    <Row style={{borderBottom:"1px solid #cccccc"}}>
                        <Col className="center" xs={24}>借方金额</Col>
                    </Row>
                    <Row className="bg-money-rp">
                        {money.map((data,index)=>{
                            return <span key={index}>{data}</span>
                        })}
                    </Row>
                </Col>
                <Col xs={4}>
                    <Row style={{borderBottom:"1px solid #cccccc"}}>
                        <Col className="center" xs={24}>贷方金额</Col>
                    </Row>
                    <Row className="bg-money-rp">
                        {money.map((data,index)=>{
                            return <span key={index}>{data}</span>
                        })}
                    </Row>
                </Col>
                <Col style={{borderLeft:'1px solid #cccccc'}} xs={LTextA}>摘要</Col>
            </Row>;
            return header;
        }
        changeUSD(key,e){
            let income = this.state.income;
            let outcome = this.state.outcome;
            let USD = this.state.usd;
            let exchange = this.state.exchange[key]||1;
            let usd = eval(e.target.value);
            let price = this.state.price;
            let num = this.state.num[key]||1;
            if(Math.round((usd*exchange).toFixed(2))>limit.max){
                //超出最大值
                console.log('超出最大值');
                return ;
            }else if(usd<0){
                //非负
                USD[key] = "";
                e.target.value = "";
                this.setState({usd:USD});
                return ;
            }
            if(usd||USD[key]){
                USD[key] = usd;
                if(price[key]){
                    price[key] = Number(usd/num).toFixed(this.state.CONST.prices_dec);
                }
                if(income[key]){
                    income[key] = Math.round((usd*exchange).toFixed(2)*100);
                }else if(outcome[key]){
                    outcome[key] = Math.round((usd*exchange).toFixed(2)*100);
                }else{
                    income[key] = Math.round((usd*exchange).toFixed(2)*100);
                }
                this.setState({
                    income:income,
                    outcome:outcome,
                    usd:USD,
                    price
                })
            }
            this.getTotal();
        }
        inputValue(id,type,e){
            let value = e.target.value;
            let isFun = false;
            let reg=['+','-','*','/','.'];
            reg.map((item)=>{
                if(reg.indexOf(value[value.length-1])>-1||!isNaN(value[value.length-1])){
                    isFun = true;
                }
            });
            if(isNaN(value)&&value!='-'){
                if(!isFun){
                    value = value.substr(0,value.length-1);
                }
                e.target.value = value;
            }else {
                if(type!='income'&&type!='outcome'){
                    let st = this.state;
                    st[type][id] = value;
                    this.setState(st);
                }
            }
        }
        changeExchange(key,e){
            let income = this.state.income;
            let outcome = this.state.outcome;
            let usd = this.state.usd[key]||'';
            let EXCHANGE = this.state.exchange;
            let exchange = eval(e.target.value)||1;
            let price = this.state.price;
            let num = this.state.num[key]||1;
            e.target.value = exchange||1;
            EXCHANGE[key] = exchange;
            if(Math.round((usd*exchange).toFixed(2))>limit.max){
                console.log('超出最大值');
                return ;
            }else if(exchange<0){
                e.target.value = 0;
                EXCHANGE[key] = 0;
                this.setState({exchange:EXCHANGE});
                return ;
            }
            if(e.target.value&&usd){
                if(price[key]){
                    price[key] = Number(usd/num).toFixed(this.state.CONST.prices_dec);
                }
                if(income[key]){
                    income[key] = Math.round((usd*exchange).toFixed(2)*100);
                }else if(outcome[key]){
                    outcome[key] = Math.round((usd*exchange).toFixed(2)*100);
                }else {
                    income[key] = Math.round((usd*exchange).toFixed(2)*100);
                }
                this.setState({
                    income:income,
                    outcome:outcome,
                    exchange:EXCHANGE,
                    price
                })
            }
            this.getTotal();
        }
        changeNumber(key,e){
            let income = this.state.income;
            let outcome = this.state.outcome;
            let price = this.state.price[key]||'';
            let NUM = this.state.num;
            let num = eval(e.target.value);
            let usd = this.state.usd;
            let exchange = this.state.exchange[key]||1;
            e.target.value = num;
            if(usd[key]){
                if(price&&Math.round((price*num*exchange).toFixed(2))>limit.max){
                    console.log('超出最大值');
                    return ;
                }
            }else if(num<0){
                e.target.value = 0;
                NUM[key] = 0;
                this.setState({num:NUM});
                console.log('数量不为负');
                return ;
            }else {
                if(price&&Math.round((price*num).toFixed(2))>limit.max){
                    console.log('超出最大值');
                    return ;
                }
            }
            if(num&&price){
                NUM[key] = num;
                if(usd[key]){
                    usd[key] = Number(price*num).toFixed(this.state.CONST.rates_dec);
                }
                if(income[key]){
                    income[key] = Math.round((price*num*exchange).toFixed(2)*100);
                }else if(outcome[key]){
                    outcome[key] = Math.round((price*num*exchange).toFixed(2)*100);
                }else {
                    income[key] = Math.round((price*num*exchange).toFixed(2)*100);
                }
                this.setState({
                    income:income,
                    outcome:outcome,
                    num:NUM,
                    usd
                })
            }
            this.getTotal();
        }
        changePrice(key,e){
            let income = this.state.income;
            let outcome = this.state.outcome;
            let num = this.state.num[key]||1;
            let Price = this.state.price;
            let price = eval(e.target.value);
            let exchange = this.state.exchange[key]||1;
            let usd = this.state.usd;
            if(usd[key]){
                if(Math.round((price*num*exchange).toFixed(2))>limit.max){
                    console.log('超出最大值');
                    return ;
                }
            }else if(price<0){
                console.log('单价不为负');
                e.target.value = 0;
                Price[key] = 0;
                this.setState({price:Price});
                return ;
            }else {
                if(Math.round((price*num).toFixed(2))>limit.max){
                    console.log('超出最大值');
                    return ;
                }
            }
            if(Price[key]||price){
                Price[key] = price;
                if(usd[key]){
                    usd[key] = Number(price*num).toFixed(this.state.CONST.rates_dec);
                }
                if(income[key]){
                    income[key] = Math.round((price*num*exchange).toFixed(2)*100);
                }else if(outcome[key]){
                    outcome[key] = Math.round((price*num*exchange).toFixed(2)*100);
                }else {
                    income[key] = Math.round((price*num*exchange).toFixed(2)*100);
                }
                this.setState({
                    income:income,
                    outcome:outcome,
                    price:Price,
                    usd
                })
            }
            this.getTotal();
        }
        selectExchange(key,val,option){
            let type = this.state.exchangeType;
            type[key] = val.key;
            this.setState({
                exchangeType:type
            },()=>{

            })
        }
        keyDown(event){
            if(event.keyCode == "13")
            {
                event.target.blur();
            }
        }
        setDir(type,key){
            let {con,balance,income,outcome,des,minusOut,minusIn,exchange,usd,price,num,subject,exchangeType} = this.state;
            let tempBalance,tempIncome,tempOutcome,tempDes,tempMinusOut,tempMinusIn,tempExchange,tempUsd,tempPrice,tempNum,tempSubject,tempType;
            let form,to;
            con.map((item,index)=>{
               if(item.key == key){
                   form = key;
                   if(type=='up'&&index!=0){
                       to = con[index-1].key;
                   }else if(type=='down'&&index!=(con.length-1)){
                       to = con[index+1].key;
                   }
               }
            });
            if(form&&to){
                tempBalance = balance[form];
                tempIncome = income[form];
                tempOutcome = outcome[form];
                tempDes = des[form];
                tempMinusIn = minusIn[form];
                tempMinusOut = minusOut[form];
                tempExchange = exchange[form];
                tempUsd = usd[form];
                tempPrice = price[form];
                tempNum = num[form];
                tempSubject = subject[form];
                tempType = exchangeType[form];

                balance[form] = balance[to];
                balance[to] = tempBalance;
                income[form] = income[to];
                income[to] = tempIncome;
                outcome[form] = outcome[to];
                outcome[to] = tempOutcome;
                des[form] = des[to];
                des[to] = tempDes;
                minusIn[form] = minusIn[to];
                minusIn[to] = tempMinusIn;
                minusOut[form] = minusOut[to];
                minusOut[to] = tempMinusOut;
                exchange[form] = exchange[to];
                exchange[to] = tempExchange;
                usd[form] = usd[to];
                usd[to] = tempUsd;
                price[form] = price[to];
                price[to] = tempPrice;
                num[form] = num[to];
                num[to] = tempNum;
                subject[form] = subject[to];
                subject[to] = tempSubject;
                exchangeType[form] = exchangeType[to];
                exchangeType[to] = tempType;
            }
            this.setState({con,balance,income,outcome,des,minusOut,minusIn,exchange,usd,price,num,subject});
            console.log(form,to)
        }
        setBlur(key,type){
            const _this = this;
            let openExchange = _this.state.showExchange;
            let openNumber = _this.state.showNumber;
            setTimeout(()=>{
                let e ;
                switch (type){

                    case 'select'://科目下拉
                        e = openExchange?document.getElementById('curr'+key).childNodes[0]:
                            openNumber?_this.refs['price'+key].refs.input:_this.refs['income'+key];
                        break;
                    case 'curr'://币种
                        e = _this.refs['usd'+key].refs.input;
                        break;
                    case 'usd'://原币
                        e = _this.refs['exchange'+key].refs.input;
                        break;
                    case 'exchange'://汇率
                        e = openNumber?_this.refs['price'+key].refs.input:_this.refs['income'+key];
                        break;
                    case 'price'://单价
                        e = _this.refs['num'+key].refs.input;
                        break;
                    case 'num'://数量
                        e = _this.refs['income'+key].refs.input;
                        break;
                    case 'income'://借方
                        e = _this.refs['outcome'+key].refs.input;
                        break;
                    case 'outcome'://贷方
                        e = document.getElementById('textarea'+key);
                        break;
                    case 'textarea'://注释
                        let con = _this.state.con;
                        con.map((item,index)=>{
                            if(key == item.key){
                                e = index+1 == con.length?
                                    {focus:()=>{},click:()=>{}} :
                                    document.getElementById('select'+con[index+1].key);
                            }
                        });
                        break;
                }
                e.focus();
                e.click();
                console.log(key,type,e)
            },100)
        }
        initLine(key){
            let plus = <Button size="small" shape="circle" type="primary" icon="plus" onClick={this.add.bind(this,key)}/>;
            let minus = <Button size="small" shape="circle" type="primary" icon="minus" onClick={this.reduce.bind(this,key)}/>;
            let setUp = <Button size="small" shape="circle" type="primary" icon="up" onClick={this.setDir.bind(this,'up',key)}/>;
            let setDown = <Button size="small" shape="circle" type="primary" icon="down" onClick={this.setDir.bind(this,'down',key)}/>;
            let notice =<div>
                <Row>{minus}</Row>
                <Row>{plus}</Row>
            </div>;
            let direction = <div>
                <Row>{setUp}</Row>
                <Row>{setDown}</Row>
            </div>;
            let LTextA,LSelect;
            let exchangeType = this.state.exchangeType;
            if(!exchangeType[key]){
                exchangeType[key] = GetLocalStorage('Const').curr_default||'';
            }
            if(this.state.showExchange&&this.state.showNumber){
                LTextA = 2;//设置宽度
                LSelect = 6;
            }else if(!this.state.showExchange&&!this.state.showNumber){
                LTextA = 6;
                LSelect = 10;
            }else if(this.state.showExchange&&!this.state.showNumber){
                LTextA = 4;
                LSelect = 7;
            }else if(!this.state.showExchange&&this.state.showNumber){
                LTextA = 4;
                LSelect = 9;
            }

            let content = <div className="certificate-content-line" onFocus={this.setFocusKey.bind(this,key)}>
                <Col xs={LSelect} className="certificate-content-select">
                    <Select ref={'select'+key} id={'select'+key}
                        showSearch
                        allowClear
                        optionLabelProp="title"
                        optionFilterProp="title"
                        style={{ width: '100%'}}
                        notFoundContent="没有匹配的选项"
                        onSelect={this.selectType.bind(this,key)}
                        onChange={this.setSelect.bind(this,key)}
                        value={this.state.balance[key]}>
                        {this.state.children}
                    </Select>
                    <Row className="money">
                        <Col xs={12}>{this.state.subject[key]?'借：'+this.state.subject[key].debit:''}</Col>
                        <Col xs={12}>{this.state.subject[key]?'贷：'+this.state.subject[key].credit:''}</Col>
                    </Row>
                </Col>
                <Col xs={2} style={{display:this.state.showExchange?'block':'none'}} id={'curr'+key}>
                    <Select labelInValue className="genson-usd-select" onSelect={this.setBlur.bind(this,key,'curr')}
                            value={{ key: exchangeType[key] }} ref={'curr'+key}
                            onChange={this.selectExchange.bind(this,key)}>
                        {
                            curr.map((rate)=>{
                                return<Option key={rate.curr_abrev} value={rate.curr_abrev}>
                                    {rate.currency}
                                </Option>
                            })
                        }
                    </Select>
                    <Icon type="caret-down" className="genson-usd-icon"/>
                </Col>
                <Col xs={3} style={{display:this.state.showExchange?'block':'none'}}>
                    <div className="gen-exchange">
                        <Row>
                            <Col xs={8}>{exchangeType[key]}：</Col>
                            <Col xs={16}>
                                <Input type='text' size="small" ref={'usd'+key}
                                       onPressEnter={this.setBlur.bind(this,key,'usd')}
                                       style={{color:this.state.minusOut[key]||this.state.minusIn[key]?'red':''}}
                                       value={this.state.usd[key]||''} id={key+'usd'}
                                       onChange={this.inputValue.bind(this,key,'usd')}
                                       onKeyDown={this.keyDown.bind(this)}
                                       onBlur={this.changeUSD.bind(this,key)}/>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={8}>汇率：</Col>
                            <Col xs={16}>
                                <Input type='text' size="small" onChange={this.inputValue.bind(this,key,'exchange')}
                                       value={this.state.exchange[key]||''} id={key+'exchange'}
                                       onKeyDown={this.keyDown.bind(this)} ref={'exchange'+key}
                                       onPressEnter={this.setBlur.bind(this,key,'exchange')}
                                       onBlur={this.changeExchange.bind(this,key)}/>
                            </Col>
                        </Row>
                    </div>
                </Col>
                <Col xs={3} style={{display:this.state.showNumber?'block':'none'}}>
                    <div className="gen-exchange">
                        <Row>
                            <Col xs={8}>单价：</Col>
                            <Col xs={16}>
                                <Input type='text' size="small" onChange={this.inputValue.bind(this,key,'price')}
                                       value={this.state.price[key]||''} id={key+'price'}
                                       onKeyDown={this.keyDown.bind(this)} ref={'price'+key}
                                       onPressEnter={this.setBlur.bind(this,key,'price')}
                                       onBlur={this.changePrice.bind(this,key)}/>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={8}>数量：</Col>
                            <Col xs={16}>
                                <Input type='text' size="small" onChange={this.inputValue.bind(this,key,'num')}
                                       value={this.state.num[key]||''} id={key+'num'}
                                       style={{color:this.state.minusOut[key]||this.state.minusIn[key]?'red':''}}
                                       onKeyDown={this.keyDown.bind(this)} ref={'num'+key}
                                       onPressEnter={this.setBlur.bind(this,key,'num')}
                                       onBlur={this.changeNumber.bind(this,key)}/>
                            </Col>
                        </Row>
                    </div>
                </Col>
                <Col xs={4} >
                    <Input className="gen-input"
                           onChange={this.inputValue.bind(this,key,'income')}
                           style={{color:this.state.minusIn[key]?'red':''}}
                           onFocus={this.focusChange.bind(this,key,'income')}
                           type='text' defaultValue={this.state.income[key]}
                           onKeyDown={this.keyDown.bind(this)} ref={'income'+key}
                           onPressEnter={this.setBlur.bind(this,key,'income')}
                           id={key+'income'} onBlur={this.income.bind(this,key)}/>
                </Col>
                <Col xs={4}>
                    <Input className="gen-input"
                           onChange={this.inputValue.bind(this,key,'outcome')}
                           type="text" defaultValue={this.state.outcome[key]}
                           onFocus={this.focusChange.bind(this,key,'outcome')}
                           id={key+'outcome'} onBlur={this.outcome.bind(this,key)}
                           onKeyDown={this.keyDown.bind(this)} ref={'outcome'+key}
                           onPressEnter={this.setBlur.bind(this,key,'outcome')}
                           step={1} style={{ width: '100%',color:this.state.minusOut[key]?'red':''}}/>
                </Col>
                <Col xs={LTextA} >
                    <Input type="textarea" value={this.state.des[key]} id={'textarea'+key}
                           ref={'textarea'+key}
                           onChange={this.changeTextarea.bind(this,key)}
                           onPressEnter={this.setBlur.bind(this,key,'textarea')}/>
                </Col>
            </div>;
            let ud = <Tooltip key={key} overlayClassName="certificate-tips" autoAdjustOverflow={false} overlayStyle={{padding:0}}
                              placement="left" title={notice} arrowPointAtCenter={true}>
                <Tooltip key={key} overlayClassName="certificate-tips" autoAdjustOverflow={false} overlayStyle={{padding:0}}
                         placement="right" title={direction} arrowPointAtCenter={true}>
                    <Row className="certificate-content">
                        {content}
                    </Row>
                </Tooltip>
            </Tooltip>;
            return {
                ud:ud,
            };
        }

        initFoot(){
            let focusItem = this.state.focusItem;
            let totalL = 16;
            if(this.state.showExchange&&this.state.showNumber){
                totalL = 14;
            }else if(!this.state.showExchange&&!this.state.showNumber){
                totalL = 10;
            }else if(this.state.showExchange&&!this.state.showNumber){
                totalL = 12;
            }else {
                totalL = 12;
            }
            let totalIn = this.state.income.length == 0?null:this.state.income.reduce(
                    (prev, curr, index) => {
                        prev= prev?prev:0;
                        if(focusItem.type=='income'&&focusItem.key==index){
                            curr = curr*100;
                        }
                        curr= curr?curr*(this.state.minusIn[index]?-1:1):0;
                        return(Number(prev) + Number(curr))==0?null:(Number(prev) + Number(curr))
                    },0);
            let totalOut = this.state.outcome.length == 0?null:this.state.outcome.reduce(
                    (prev, curr, index) => {
                        prev= prev?prev:0;
                        if(focusItem.type=='outcome'&&focusItem.key==index){
                            curr = curr*100;
                        }
                        curr= curr?curr*(this.state.minusOut[index]?-1:1):0;
                        return(Number(prev) + Number(curr))==0?null:(Number(prev) + Number(curr))
                    },0);

            return <div className="certificate-foot">
                <Col xs={totalL}>
                    合计：{this.state.total}
                </Col>
                <Col style={{color:totalIn<0?'red':''}} className="certificate-foot-num bg-money-rp" xs={4}>
                    { Math.round(totalIn<0?-totalIn:totalIn) }
                </Col>
                <Col style={{color:totalOut<0?'red':''}} className="certificate-foot-num bg-money-rp" xs={4}>
                    {Math.round(totalOut<0?-totalOut:totalOut)}
                </Col>
                <Col xs={16-totalL} style={{overflow: 'hidden',whiteSpace:'nowrap'}}>
                    <h3 style={{padding:'0 5px'}}>{this.state.memo_}</h3>
                </Col>
            </div>
        }
        setExchange(type){
            this.setState({
                showExchange:type,
            });
        }
        setPriceNumber(type){
            this.setState({
                showNumber:type,
            });
        }
        initContent(initCon){
            let content = [];
            if(initCon&&initCon.length == 0){
                for(let i=0;i<=this.state.key;i++){
                    initCon[i] = this.initLine(i).ud
                }
            }else if(initCon&&initCon.length>0){
                initCon.map((data,index)=>{
                    content[index] = this.initLine(data.key).ud;
                    setTimeout(()=>{
                        let Ein = document.getElementById(data.key+'income');
                        let Eout = document.getElementById(data.key+'outcome');
                        if(Ein){
                            Ein.value = this.state.income[data.key]?this.state.income[data.key]:'';
                        }
                        if(Eout){
                            Eout.value = this.state.outcome[data.key]?this.state.outcome[data.key]:'';
                        }
                    })
                });
            }
            return content;
        }
        setTime(date,dateString){
            // console.log(date,dateString);
            this.setState({
                date:dateString
            },()=>{
                this.getVnum(this.state.date);
            })
        }
        setmemo_(e){
            let value = e.target.value;
            this.setState({
                memo_:value
            })
        }
        setAttId(att_id){
            // att_id = att_id.concat(this.state.att_id);
            this.setState({
                att_id:att_id
            },()=>{
                console.info('return attid is',att_id);
            })
        }
        openModal(type){
            // let value = type.key==0?true:type;
            this.setState({openExchange:type.key},()=>{
            })
        }
        searchRate(curr,key){
            const url = {
                type:'currencies/get-latest-curr',
                method:'GET'
            };
            let par = {curr:curr};
            let cb = (data)=>{
                let exchange = this.state.exchange;
                let usd = this.state.usd;
                let account = this.state.income[key]/100||this.state.outcome[key]/100;
                exchange[key] = data.info;
                if(account&&data.info!=0){
                    usd[key] = (account/data.info).toFixed(this.state.CONST.rates_dec);
                }
                this.setState({exchange,usd})
            };
            Request(par,cb,url);
        }
        scanCode(step){
            this.setState({step})
        }
        render() {
            const menu = (
                <Menu onClick={this.openModal.bind(this)}>
                    <Menu.Item key="1" >汇率变更</Menu.Item>
                    <Menu.Item key="2" disabled>保存为模板</Menu.Item>
                    <Menu.Item key="3" disabled>从模板生产</Menu.Item>
                    <Menu.Item key="4">会计科目定义</Menu.Item>
                </Menu>
            );
            return (
                <div className="gen-certificate" onKeyDown={this.handleKeyDown.bind(this)}>
                    <Card className="certificate-splice" title={<h1 className="certificate-title">凭证录入</h1>}
                          bordered={true} style={{minHeight:'100%'}}>
                        <Row className="color-black" type="flex" justify="space-between">
                            <Col xs={6}>
                                <Col xs={12}>
                                    凭证字
                                    <Select defaultValue="记" className="center">
                                        <Select.Option value="记">记</Select.Option>
                                        <Select.Option disabled value="收">收</Select.Option>
                                        <Select.Option disabled value="付">付</Select.Option>
                                        <Select.Option disabled value="转">转</Select.Option>
                                    </Select>
                                </Col>
                                <Col xs={12} className="center">
                                    第<InputNumber min={1} style={{width:"5rem"}} value={this.state.vnum}
                                                   onChange={this.changeVnum.bind(this)}/>号
                                </Col>
                            </Col>
                            <Col xs={5}>
                                日期：<DatePicker value={moment(this.state.date)} onChange={this.setTime.bind(this)}/>
                            </Col>
                            <Col xs={2}>
                                <Switch onChange={this.setExchange.bind(this)} checked={this.state.showExchange} checkedChildren={'关闭外币'} unCheckedChildren={'输入外币'}/>
                            </Col>
                            <Col xs={2}>
                                <Switch onChange={this.setPriceNumber.bind(this)} checked={this.state.showNumber} checkedChildren={'关闭数量'} unCheckedChildren={'输入数量'}/>
                            </Col>
                            <Col xs={8} style={{textAlign:'right'}}>
                                <Button.Group>
                                    <Button onClick={this.scanCode.bind(this,2)}>扫码录入</Button>
                                    <Button onClick={this.save.bind(this,'new')}>保存并新增</Button>
                                    <Button title="Ctrl+S" onClick={this.save.bind(this)}>保存</Button>
                                    <Dropdown overlay={menu} >
                                        <Button>
                                            更多<Icon type="down" />
                                        </Button>
                                    </Dropdown>
                                </Button.Group>
                            </Col>
                        </Row>
                        <Row className="genson-margin-top">
                            <Tag color="#f50"
                                 style={{display:this.state.reference?'inline-block':'none',float:'right'}}>
                                {this.state.reference}
                            </Tag>
                        </Row>
                        {this.initHeader()}
                        {this.initContent.bind(this,this.state.con)()}
                        <Row style={{border:'1px solid #cccccc',borderTop:0,borderBottom:0}}>{this.initFoot()}</Row>
                        <Row className="certificate-des">
                            <Input style={{width:'100%'}} value={this.state.memo_} onChange={this.setmemo_.bind(this)} autosize={true} type="textarea" placeholder="请输入凭证摘要"/>
                        </Row>
                        <Row className="genson-margin-top">
                            <span>快捷键提示：</span>
                            <Tag color="#7ec2f3">F8 - 借贷对调</Tag>
                            <Tag color="#7ec2f3">F7 - 借贷自动平衡/摘要</Tag>
                            <Tag color="#7ec2f3">Ctrl+S - 保存凭证</Tag>
                            <h3 style={{float:'right'}}>制作单位：{GetLocalStorage('Const').coy_name}</h3>
                        </Row>
                        <BindFile defaultAttId={this.state.att_id}
                                  setAttId={this.setAttId.bind(this)}/>
                        <Modal visible={this.state.openExchange==1}
                               width="860"
                               wrapClassName="vertical-center-modal"
                               footer={null}
                               onCancel={this.openModal.bind(this,false)}>
                            <ChangeExchange/>
                        </Modal>
                        <Modal visible={this.state.openExchange==4}
                               width="960"
                               footer={null}
                               onCancel={this.openModal.bind(this,false)}>
                            <TreePage title="科目定义管理" resetTree={this.resetTree.bind(this)}/>
                        </Modal>
                        <ScanCode step={this.state.step} changeStep={this.scanCode.bind(this)}/>
                    </Card>
                </div>
            );
        }
    }
    module.exports = Certificate;
})();