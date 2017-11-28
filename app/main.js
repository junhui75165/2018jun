/**
 * Created by junhui on 2017/3/7.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import WebRouter from './Router';
import 'babel-polyfill'
import './css/style.less';
import moment from 'moment';
// 推荐在入口文件全局设置 locale
// import 'moment/locale/zh-cn';
moment.locale('zh-cn');
ReactDOM.render(
    (
        WebRouter
    ),
    document.getElementById('content')
);