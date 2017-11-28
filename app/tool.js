/**
 * Created by junhui on 2017/3/27.
 */
(function () {
    'use strict';
    let store = require('store');
    function numToDX(n) {
        var minus;
        if(n<0){
            minus = true;
            n = -n;
        }else {
            minus = false;
        }
        if (!/^(0|[1-9]\d*)(\.\d+)?$/.test(n))
            return "数据非法";
        var unit = "千百拾亿千百拾万千百拾元角分", str = minus?"负":"";
        n += "00";
        var p = n.indexOf('.');
        if (p >= 0)
            n = n.substring(0, p) + n.substr(p+1, 2);
        unit = unit.substr(unit.length - n.length);
        for (var i=0; i < n.length; i++)
            str += '零壹贰叁肆伍陆柒捌玖'.charAt(n.charAt(i)) + unit.charAt(i);
        return str.replace(/零(千|百|拾|角)/g, "零").replace(/(零)+/g, "零").replace(/零(万|亿|元)/g, "$1").replace(/(亿)万|壹(拾)/g, "$1$2").replace(/^元零?|零分/g, "").replace(/元$/g, "元整");
    }
    function SetLocalStorage(key,value) {
        store.set(key, value);
    }
    function GetLocalStorage(key) {
        // console.info(store.get(key));
        return store.get(key);
    }
    function objToArr(obj){
        let b = obj;
        let c = [];
        for(let i in b){
            c = c.concat(b[i]);
            if(b[i].children){
                b[i].children = objToArr(b[i].children)
            }
        }
        return c;
    }
    function getConst(resolve,) {
        let type = {
            type:'default/default-data',
            method:'POST',
        };
        let cb = function (data) {
            SetLocalStorage('Const',data.info);
            resolve?resolve():'';
        };
        if(GetLocalStorage('token')){
            require('./request').Request({},cb,type);
        }else {
            setTimeout(this.getConst,100)
        }
    }
    function getDateVnum(callback,date) {
        let type = {
            type:'default/default-date-vnum',
            Method:'POST',
            method:'FormData',
        };
        let cb = (data)=>{
            SetLocalStorage('dateVnum',data.info);
            callback(data.info);
        };
        let par = {date_:date||''};
        require('./request').Request(par,cb,type);
    }
    function printVoucher(id,success,error) {
        let type = {
            type:'report/print-refs',
            Method:'POST',
            method:'FormData',
        };
        let cb = (data)=>{
            const link = data.info;
            if(data.info){
                success(data.info);
            }else {
                error(data.info);
            }
        };
        let par = {id};
        require('./request').Request(par,cb,type);
    }
    function GetCurrency() {
        let {Request} = require('./request');
        let type = {
            type:'currencies/index',
            method:'GET',
        };
        let callback = (dataSource)=>{
            let currencyList = dataSource.info.list;
            console.log('获取货币列表...',currencyList);
            SetLocalStorage('currency',currencyList);
        };
        if(GetLocalStorage('token')){
            Request({},callback,type);
        }else {
            setTimeout(()=>{
                Request({},callback,type);
            },100)
        }
    }
    function toThousands(value) {
        //数字添加千分符
        if(value==0 || !value){
            return '';
        }
        value = String(Number(value).toFixed(2));
        let negative = value>0?'':'-';
        let parInt = Math.abs(parseInt(value));
        let parFloat = '';
        if(value.indexOf('.')>-1){
            parFloat = value.slice(value.indexOf('.')+1);
        }
        parInt = (parInt || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
        return negative+parInt+'.'+parFloat;
    }
    function rtTableHeight(more) {
        let height = document.getElementsByClassName('gen-slider-content')[0].offsetHeight;
        let other = 280;
        if(more){
            other = other + more;
        }
        return height-other;
    }
    function urlParam() {
        let url = window.location.hash.split('?')[1];
        if(!url){
            return {};
        }
        let param = url.split('&');
        let par = {};
        param.map((item)=>{
            let con = item.split('=');
            par[`${con[0]}`] = con[1];
        });
        return par;
    }
    function message403(data) {
        const {Modal} = require('antd');
        Modal.warning({
            title: '权限警告提示',
            content: data.message,
        });
    }
    function urlAlert(url) {
        const {Modal,Button,Table,Row,Col} = require('antd');
        let querystring = require('querystring');
        let {Request} = require('./request');
        let { hashHistory} =require('react-router');
        let link = (item,message)=>{
            console.log(item);
            let param = item.param;
            if(item.type == 'gl_view'){
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
                    id:param.id,
                };
                let cb = (data) => {
                    let showUsd = false;
                    let showQty = false;
                    let Usd = other[0];
                    let Rate = other[1];
                    let Qty = other[2];
                    let Price = other[3];
                    if (data.code == 0) {
                        console.log(data.info);
                    }
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
                    const modalMsg = Modal.info({
                        title: <Row type="flex" justify="space-between">
                            <Col xs={20}>{message}</Col>
                            <Col xs={3} className="right" onClick={()=>{modalMsg.destroy()}}><Button shape="circle" icon="close"/></Col>
                        </Row>,
                        width: 980,
                        content: (
                            <div className="certificate-table">
                                <Table bordered pagination={false} size="small"
                                       dataSource={checkTable}
                                       columns={checkLabel} />
                                <Table style={{marginTop:'1rem'}} bordered pagination={false}
                                       dataSource={listTable} size="small"
                                       columns={listLabel} />
                            </div>
                        ),
                        onOk() {},
                    });
                };
                Request(params,cb,type);
            }else if(item.type == 'gl_list'){
                const linkUrl = '/mainPage/102'+'?'+querystring.stringify(param);
                hashHistory.push(linkUrl);
            }else if(item.type == 'master_list'){
                const linkUrl = '/mainPage/125';
                hashHistory.push(linkUrl);
            }else if(item.type == 'gl_setup'){
                const linkUrl = '/mainPage/504';
                hashHistory.push(linkUrl);
            }else if(item.type == 'sb_gl_setup'){
                const linkUrl = '/mainPage/223';
                hashHistory.push(linkUrl);
            }
        };
        const modal = Modal.info({
            title: <Row type="flex" justify="space-between">
                <Col xs={20}>消息提示</Col>
                <Col xs={3} className="right" onClick={()=>{modal.destroy()}}><Button shape="circle" icon="close"/></Col>
            </Row>,
            width: 720,
            content: <div>
                {
                    url.map((item)=>{
                        return<div className="genson-margin-top">
                            <Button onClick={link.bind(this,item,item.message,modal)}>{item.message}</Button>
                        </div>
                    })
                }
            </div>
        })
    }
    module.exports = {
        numToDX,
        SetLocalStorage,
        GetLocalStorage,
        GetCurrency,
        objToArr,
        getDateVnum,
        getConst,
        toThousands,
        rtTableHeight,
        printVoucher,
        urlParam,
        message403,
        urlAlert
    };
})();