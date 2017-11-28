/**
 * Created by junhui on 2017/3/7.
 */
(function () {
    'use strict';
    let { Router, Route,IndexRoute, hashHistory ,browserHistory} = require('react-router');
    let { createHistory, createHashHistory, useBasename } = require( 'history');
    let LoginPage = require( './page/LoginPage');
    let React = require( 'react');
    let MainPage = require( './page/MainPage');
    let CreateClientPage = require( './page/CreateClientPage');
    let CreateTestPage = require( './page/CreateTestPage');
    let routes =<Route>
            <IndexRoute component={LoginPage} />
            <Route path="/" component={LoginPage}/>
            <Route path="/login" component={LoginPage}/>
            <Route path='/mainPage(/:type)' components={MainPage}/>
            <Route path='/create' components={CreateClientPage}/>
            <Route path='/createTest' components={CreateTestPage}/>
        </Route>;
    let WebRouter = <Router history={hashHistory} routes={routes}/>;
    module.exports = WebRouter;
})();