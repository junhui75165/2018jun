/**
 * Created by junhui on 2017/4/6.
 */
(function () {
    'use strict';
    let Global = require('./Global');
    let {message,Modal} = require('antd');
    const url = Global.cmpUrl;//192.168.1.30
    let http = require('http');
    const {errorCode} = require('./Global');
    let {hashHistory} =require('react-router');
    let {GetLocalStorage,message403,urlAlert} = require('./tool');
    let querystring = require('querystring');
    let Request;
    let errorToken = false;
    function request(param,callback,type,e){
        let token = GetLocalStorage('token')||'';
        try {
            let getUrl = url+'/'+type.type;
            console.log('fetch...',param);
            if(type.method == 'POST'){
                try {
                    fetch(getUrl,{
                        method: type.method,
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json;application/x-www-form-urlencoded;multipart/form-data',
                            'access-token':token,
                        },
                        body: JSON.stringify(param)
                    })
                        .then(function(response) {
                            //请求状态
                            return response.json();
                        }).then(function(json) {
                        console.log('response json', json);
                        //请求结果
                        if(json.code == 0 || errorCode.indexOf(json.code)>-1 ){
                            callback(json);
                            if(errorToken){
                                errorToken = false;
                            }
                            if(json.url&&json.url.length>0){
                                urlAlert(json.url);
                            }
                        }else if(json.code == 505){
                            if(!errorToken){
                                message.error("登陆已失效，需要重新登录！");
                                hashHistory.push('/login');
                                errorToken = true;
                            }
                        }else if(json.code == 403){
                            message403(json)
                        }else {
                            message.error(json.message)
                        }
                    }).catch(function(ex) {
                        console.log('parsing failed', ex);
                    })
                }catch (e){
                    console.log(e);
                }
            }
            else if(type.method == 'GET'){
                try {
                    fetch(getUrl+'?'+querystring.stringify(param),{
                        method: type.method,
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'access-token':token,
                        },
                    })
                        .then(function(response) {
                            // console.log(response);
                            //请求状态
                            return response.json();
                        }).then(function(json) {
                        console.log('response json', json);
                        // json.url?alert(json.url):'';
                        //请求结果
                        if(json.code == 0 || errorCode.indexOf(json.code)>-1){
                            callback(json);
                            if(errorToken){
                                errorToken = false;
                            }
                            if(json.url&&json.url.length>0){
                                urlAlert(json.url);
                            }
                        }else if(json.code == 505){
                            if(!errorToken){
                                message.error("登陆已失效，需要重新登录！");
                                hashHistory.push('/login');
                                errorToken = true;
                            }
                        }else if(json.code == 403){
                            message403(json)
                        }else {
                            message.error(json.message)
                        }
                    }).catch(function(ex) {
                        console.log('parsing failed', ex);
                    })
                }catch (e){
                    console.log(e);
                }
            }
            else if(type.method == 'FormData'){
                try {
                    fetch(getUrl,{
                        method: type.Method,
                        headers: {
                            'Accept': 'application/json',
                            "Content-Type": "application/x-www-form-urlencoded; multipart/form-data",
                            'access-token':token,
                        },
                        body: querystring.stringify(param)
                    })
                        .then(function(response) {
                            // console.log(response);
                            //请求状态
                            return response.json();
                        }).then(function(json) {
                        console.log('response json', json);
                        // json.url?alert(json.url):'';
                        //请求结果
                        if(json.code == 0 || errorCode.indexOf(json.code)>-1){
                            callback(json);
                            if(errorToken){
                                errorToken = false;
                            }
                            if(json.url&&json.url.length>0){
                                urlAlert(json.url);
                            }
                        }else if(json.code == 505){
                            if(!errorToken){
                                message.error("登陆已失效，需要重新登录！");
                                hashHistory.push('/login');
                                errorToken = true;
                            }
                        }else if(json.code == 403){
                            message403(json)
                        }else {
                            message.error(json.message)
                        }
                    }).catch(function(ex) {
                        console.log('parsing failed', ex);
                    })
                }catch (e){
                    console.log(e);
                }
            }
            else if(type.method == 'File'){
                try {
                    fetch(getUrl,{
                        method: type.Method,
                        headers: {
                            'access-token':token,
                        },
                        body:param
                    })
                        .then(function(response) {
                            //请求状态
                            return response.json();
                        }).then(function(json) {
                        console.log('response json', json);
                        // json.url?alert(json.url):'';
                        //请求结果
                        if(json.code == 0 || errorCode.indexOf(json.code)>-1){
                            callback(json);
                            if(errorToken){
                                errorToken = false;
                            }
                            if(json.url&&json.url.length>0){
                                urlAlert(json.url);
                            }
                        }else if(json.code == 505){
                            if(!errorToken){
                                message.error("登陆已失效，需要重新登录！");
                                hashHistory.push('/login');
                                errorToken = true;
                            }
                        }else if(json.code == 403){
                            message403(json)
                        }else {
                            message.error(json.message)
                        }
                    }).catch(function(ex) {
                        console.log('parsing failed', ex);
                    })
                }catch (e){
                    console.log(e);
                }
            }
        }catch(e) {
            console.log("something error", e);
        }
    }
    function node(param,callback) {
        let token = GetLocalStorage('token')||'';
        var postData=querystring.stringify(param);
        var options={
            hostname:url,
            // port:80,
            path:'/'+param.type,
            method:'POST',
            headers:{
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                // 'mode': 'no-cors',
                'access-token':token,
            },
        };
        var req=http.request(options, function(res) {
            console.log('Status:',res.statusCode);
            console.log('headers:',JSON.stringify(res.headers));
            res.setEncoding('utf-8');
            res.on('data',function(chun){
                console.log('body分隔线---------------------------------\r\n');
                console.info(chun);
            });
            res.on('end',function(){
                console.log('No more data in response.********');
            });
        });
        req.on('error',function(err){
            console.error(err);
        });
        req.write(postData);
        req.end();
    }

    function Ajax(param,callback,type)
    {
        let token = GetLocalStorage('token')||'';
        try {
            let xmlhttp;
            let getUrl = url+'/'+type.type;
            let postData=querystring.stringify(param);
            if (window.XMLHttpRequest)
            {// code for IE7+, Firefox, Chrome, Opera, Safari
                xmlhttp=new XMLHttpRequest();
            }
            else
            {// code for IE6, IE5
                xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
            }
            xmlhttp.onreadystatechange=function()
            {
                if (xmlhttp.readyState==4 && xmlhttp.status==200)
                {
                    console.log(JSON.parse(xmlhttp.responseText));
                    callback(JSON.parse(xmlhttp.responseText));
                }
            };
            if(type.method == 'POST'){
                xmlhttp.open("POST",getUrl,true);
                xmlhttp.setRequestHeader("Content-type","application/json");
                xmlhttp.setRequestHeader("access-token",token);
                xmlhttp.send(postData);
            }else {
                xmlhttp.open("POST",getUrl+'?'+querystring.stringify(param),true);
                xmlhttp.setRequestHeader("Content-type","application/json");
                xmlhttp.setRequestHeader("access-token",token);
                xmlhttp.send();
            }
        }catch (e){
            console.log("something error", e);
        }
    }

    if(window.fetch) {
        // 使用 fetch 框架处理
        Request = request;
    } else {
        // 使用 XMLHttpRequest 或者其他封装框架处理
        Request = Ajax;
    }
    module.exports = {Request,node,Ajax};
})();