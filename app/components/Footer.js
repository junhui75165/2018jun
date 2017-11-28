/**
 * Created by junhui on 2017/3/8.
 */
(function () {
    'use strict';
    let React = require('react');
    let Amazeui = require('amazeui-react');
    let Container = Amazeui.Container;
    const year = new Date().getFullYear();

    const SiteFooter = function SiteFooter() {
        return (
            <footer className="ask-footer center">
                <Container>
                    <p>Copyright © 2016 - {year} Genson 谨信云会计. All Rights Reserved</p>
                </Container>
            </footer>
        );
    };
    module.exports = SiteFooter;

})();