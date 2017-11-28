/**
 * Created by junhui on 2017/3/10.
 */
(function () {
    'use strict';
    let React = require('react');
    let Global = require('../Global');
    let moment = require('moment');
    let {Request,} = require('../request');
    let {Affix,message,Button,Icon} = require('antd');
    let {SetLocalStorage, GetLocalStorage, getDateVnum} = require('../tool');
    let { Link ,hashHistory} = require('react-router');
    let Certificate = require('./Certificate');
    let Query_Certificate = require('./Query_Certificate');
    let AccountBook = require('./AccountBook');
    let TreePage = require('./TreeNode');
    let Loading = require('./Loading');
    let CmpSetting = require('./CmpSetting');
    let UserSetting = require('./UserSetting');
    let AccountSetting = require('./AccountSetting');
    let DisplaySetting = require('./DisplaySetting');
    let ChangePassword = require('./ChangePassword');
    let BalanceView = require('./BalanceView');
    let TrialBalance = require('./TrialBalance');
    let CashTable = require('./CashTable');
    let ProfitTable = require('./ProfitTable');
    let Copy_Certificate = require('./Copy_Certificate');
    let YearIncome = require('./YearIncome');
    let GeneralReport = require('./GeneralReport');
    let CarryOver = require('./CarryOver');
    let CostAccount = require('./CostAccount');
    let CreditNote = require('./CreditNote');
    let Depreciation = require('./Depreciation');
    let SortCertificate = require('./SortCertificate');
    let FinalAdjustment = require('./FinalAdjustment');
    let ExchangeRate = require('./ExchangeRate');
    let PerformAmortization = require('./PerformAmortization');
    let CarryOverCost = require('./CarryOverCost');
    let FixedAssets = require('./FixedAssets');
    let DefendAmortization = require('./DefendAmortization');
    let DefendFixedAssets = require('./DefendFixedAssets');
    let AddAmortization = require('./AddAmortization');
    let BankAccount = require('./BankAccount');
    let RootSetting = require('./RootSetting');
    let CurrencyPage = require('./CurrencyPage');
    let FinancialNotesPage = require('./FinancialNotesPage');
    let MergeVoucherPage = require('./MergeVoucherPage');
    let ItemToGroupPage = require('./ItemToGroupPage');
    let GroupToItemPage = require('./GroupToItemPage');
    let SummaryPage = require('./SummaryPage');
    let SortSubjectPage = require('./SortSubjectPage');
    let AccountInitPage = require('./AccountInitPage');
    let CheckLogPage = require('./CheckLogPage');
    let DataInspectionPage = require('./DataInspectionPage');
    let ExcelImportPage = require('./ExcelImportPage');
    let CustomizeReportPage = require('./CustomizeReportPage');
    let UserInfoPage = require('./UserInfoPage');
    let ManageAnnexPage = require('./ManageAnnexPage');
    let BackupAndRestorePage = require('./BackupAndRestorePage');
    let SubjectSetting = require('./easyToBook/SubjectSetting');
    let EasyCertificate = require('./easyToBook/EasyCertificate');
    let AutomaticProvision = require('./easyToBook/AutomaticProvision');
    let RouterPage = require('./easyToBook/RouterPage');
    let LinkIframe = require('./LinkIframe');
    let QRcode = require('./QRcode');
    let Home = require('./Home');

    let item = {};
    let uType = GetLocalStorage('urlType') ? GetLocalStorage('urlType') : '101';
    let $this;
    class Content extends React.Component {
        constructor(props, context) {
            super(props, context);
            this.state = {
                title: this.props.title,
                url: this.props.url,
                type: this.props.type,
                content: <Loading/>,
                router:[],
                index:0,
                dateVnum:{vnum:'',date_:moment().format('YYYY-MM-D')},
                cmpName:'',
                fid:'',
                hide:this.props.hide,
            };
            if(this.props.type){
                uType = this.props.type;
            }
            $this = this;
        };
        componentDidMount() {
            if(GetLocalStorage('Const')){
                this.setState({
                    cmpName:GetLocalStorage('Const').coy_name,
                    fid:GetLocalStorage('Const').fid,
                })
            }
            let cb = (data)=>{
                this.setState({dateVnum:data},()=>{
                    this.switchSetType(uType);
                });
            };
            getDateVnum(cb);
        }

        switchSetType(type,isRouter) {
            uType = type;
            let router = this.state.router;
            let index = this.state.index;
            if(!isRouter&&type!=router[router.length-1]){
                router.push(type);
                index = router.length;
            }
            document.title = this.state.title;
            this.setState({router,index},()=>{
                if(uType != 101){
                    window.genRecord = null;
                }
            });
            SetLocalStorage('urlType', type);
            switch (uType) {
                case 100:
                    this.setState({
                        content: <Home title={this.state.title}/>
                    });
                    break;
                case 101:
                    this.setState({
                        content: <Certificate initCertificate={this.initCertificate.bind(this)}
                                              switchSetType={this.switchSetType.bind(this)}/>
                    });
                    break;
                case 102:
                    let par102 = {
                        searchDate: moment(this.state.dateVnum.date_).startOf('month').format('YYYY-MM-D')+'_'+moment(this.state.dateVnum.date_).endOf('month').format('YYYY-MM-D'),
                        searchNum:'',
                        summary:'',
                        page:1
                    };
                    this.getQueryData(par102);
                    break;
                case 103:
                    let par103 = {
                        searchDate: [moment(this.state.dateVnum.date_).startOf('month').format('YYYY-MM-D'),
                            moment(this.state.dateVnum.date_).endOf('month').format('YYYY-MM-D')],
                        max_money:0,
                        min_money:0,
                        page:1,
                        account_code:"",
                    };
                    this.getAccountData(par103);
                    break;
                case 104:
                    let par104 = {
                        trans_to_date:this.state.dateVnum.date_
                    };
                    this.getBalanceView(par104);
                    break;
                case 105:
                    this.getTrialBalance();
                    break;
                case 106:
                    this.getProfitTable();
                    break;
                case 107:
                    this.getGeneralReport();
                    break;
                case 108:
                    let par = {
                        trans_from_date:moment(this.state.dateVnum.date_).startOf('month').format('YYYY-MM-D'),
                        trans_to_date:moment(this.state.dateVnum.date_).endOf('month').format('YYYY-MM-D')
                    };
                    this.getCashTable(par);
                    break;
                case 109:
                    this.getYearIncome();
                    break;
                case 110:
                    this.getCustomizeReport();
                    break;
                case 111:
                    let par111 = {date_:this.state.dateVnum.date_};
                    this.getCarryOver(par111);
                    break;
                case 112:
                    let par112 = {
                        searchDate: moment(this.state.dateVnum.date_).startOf('year').format('YYYY-MM-D')+'-'+moment(this.state.dateVnum.date_).endOf('year').format('YYYY-MM-D'),
                        searchNum:'',
                        summary:'',
                        page:1,
                    };
                    this.getCopyCertificate(par112);
                    break;
                case 113:
                    this.CostAccount();
                    break;
                case 114:
                    let par114 = {
                        date_:  moment(this.state.dateVnum.date_).startOf('year').format('YYYY-MM-D')+'_'+moment(this.state.dateVnum.date_).endOf('year').format('YYYY-MM-D'),
                        memo_:'',
                        vnum:'',
                        page:0
                    };
                    this.getCreditNote(par114);
                    break;
                case 115:
                    let par115 = {
                        date_:moment(this.state.dateVnum.date_).format('YYYY-MM-D'),
                        depreciation_type:1
                    };
                    this.getDepreciation(par115);
                    break;
                case 116:
                    let par116 = {
                        date_:moment(this.state.dateVnum.date_).startOf('month').format('YYYY-MM-D')+'_'+moment(this.state.dateVnum.date_).endOf('month').format('YYYY-MM-D'),
                    };
                    this.getSortCertificate(par116);
                    break;
                case 117:
                    let par117 = {
                        date_:this.state.dateVnum.date_
                    };
                    this.getFinalAdjustment(par117);
                    break;
                case 118:
                    let par118 = {
                        date_:moment(this.state.dateVnum.date_).format('YYYY-MM-D'),
                        depreciation_type:100
                    };
                    this.getPerform(par118);
                    break;
                case 119:
                    this.getCarryOverCost();
                    break;
                case 120:
                    this.getFixedAssets();
                    break;
                case 121:
                    this.getAddAmortization();
                    break;
                case 122:
                    this.getDefendFixed();
                    break;
                case 123:
                    this.getDefend();
                    break;
                case 124:
                    this.getBankAccount();
                    break;
                case 125:
                    this.getSubjectTree();
                    break;
                case 126:
                    this.getSummary();
                    break;
                case 127:
                    this.getSortSubject();
                    break;
                case 128:
                    this.getCurrency();
                    break;
                case 129:
                    this.getToGroup();
                    break;
                case 130:
                    this.getExchangeRate();
                    break;
                case 131:
                    this.getToItem();
                    break;
                case 132:
                    this.getMergeVoucher();
                    break;

                case 133:
                    this.getFinancialNotes();
                    break;
                case 199:
                    this.getQRcode();
                    break;
                case 200:
                    this.setState({
                        content: <RouterPage title={this.state.title} type={this.state.type}/>
                    });
                    break;
                case 201:
                case 202:
                case 203:
                case 204:
                case 205:
                case 206:
                case 207:
                case 208:
                case 209:
                // case 210:
                case 211:
                case 212:
                case 213:
                case 214:
                case 215:
                case 216:
                case 217:
                case 218:
                case 219:
                    this.getEasyCertificate();
                    break;
                case 210:
                    this.AutomaticProvision();
                    break;
                case 220:
                    this.getCarryOverCost();
                    break;
                case 221:
                    let par221 = {
                        searchDate: moment(this.state.dateVnum.date_).startOf('month').format('YYYY-MM-D')+'_'+moment(this.state.dateVnum.date_).endOf('month').format('YYYY-MM-D'),
                        searchNum:'',
                        summary:'',
                        page:1
                    };
                    this.getQueryData(par221);
                    break;
                case 222:
                    let par222 = {
                        searchDate: [moment(this.state.dateVnum.date_).startOf('month').format('YYYY-MM-D'),moment(this.state.dateVnum.date_).endOf('month').format('YYYY-MM-D')],
                        max_money:0,
                        min_money:0,
                        page:1,
                        account_code:"",
                    };
                    this.getAccountData(par222);
                    break;
                case 223:
                    this.getSubjectSetting();
                    break;
                case 224:
                    this.getBankAccount();
                    break;
                case 301:
                    let par301 = {
                        searchDate: [moment(this.state.dateVnum.date_).startOf('month').format('YYYY-MM-D'),moment(this.state.dateVnum.date_).endOf('month').format('YYYY-MM-D')],
                        max_money:0,
                        min_money:0,
                        page:1,
                        account_code:"",
                    };
                    this.getAccountData(par301);
                    break;
                case 302:
                    let par302 = {
                        trans_to_date:this.state.dateVnum.date_
                    };
                    this.getBalanceView(par302);
                    break;
                case 303:
                    this.getProfitTable();
                    break;
                case 304:
                    this.getAccountInit();
                    break;
                case 401:
                case 402:
                case 403:
                case 404:
                case 405:
                case 406:
                case 407:
                case 408:
                case 409:
                case 410:
                case 411:
                case 412:
                case 413:
                case 414:
                    this.getGeneralReport();
                    break;
                case 501:
                    this.getCmpInfo();
                    break;
                case 502:
                    this.getUserList();
                    break;
                case 503:
                    this.getRootSetting();
                    break;
                case 504:
                    this.getAccountSetting();
                    break;
                case 505:
                    this.getDisplaySetting();
                    break;
                case 506:
                    this.getChangePassword();
                    break;
                case 507:
                    this.getBackRestore();
                    break;
                case 509:
                    this.getLogPage();
                    break;
                case 510:
                    this.getDataInspection();
                    break;
                case 512:
                    this.getExcelImport();
                    break;
                case 511:
                    this.getAccountInit();
                    break;
                case 514:
                    this.getUserInfo();
                    break;
                case 515:
                    this.getAnnex();
                    break;
                case 600:
                case 601:
                case 602:
                    this.setState({
                        content: <LinkIframe title={this.state.title} url={this.state.url}/>
                    });
                    break;
                default:
                    this.setState({
                        content: <Loading title={this.state.title}/>
                    });
            }
        }
        initCertificate(content,red,edit){
            let router = this.state.router;
            let index = this.state.index;
            if(router[router.length-1] != 101){
                router.push(101);
            }
            index = router.length;
            console.log(content);
            // hashHistory.push({
            //     pathname: '/mainPage/101',
            //     query: {
            //         content:JSON.stringify(content)
            //     }
            // });
            // content: <Certificate initCertificate={$this.initCertificate.bind(this)}
            //                       init={content} isRed={red} isEdit={edit}/>,
            red = red?1:0;
            edit = edit?1:0;
            $this.setState({
                router,index
            },()=>{
                window.genRecord = content;
                hashHistory.push('/mainPage/101?isRed='+red+'&isEdit='+edit);
            });
        }

        AutomaticProvision(){
            this.setState({
                content: <AutomaticProvision title={this.state.title}/>
            });
        }

        getToGroup(){
            /***129 科目转换为科目组**/
            this.setState({
                content:<ItemToGroupPage/>
            })
        }

        getAnnex(){
            /***515 附件管理**/
            this.setState({
                content:<ManageAnnexPage/>
            })
        }

        getUserInfo(){
            this.setState({
                content:<UserInfoPage />
            })
        }

        getExcelImport(){
            this.setState({
                content:<ExcelImportPage init={$this.getAccountInit.bind(this)}/>
            })
        }

        getCustomizeReport(){
            /******110 自定义报表*****/
            $this.setState({
                content:<CustomizeReportPage getAB={$this.getAccountData.bind(this)}/>
            })
        }

        getDataInspection(){
            /***510 账务数据检验***/
            this.setState({
                content:<DataInspectionPage/>
            })
        }

        getLogPage(){
            /***509 审查日志***/
            this.setState({
                content:<CheckLogPage/>
            })
        }

        getExchangeRate(){
            /****130 汇率*****/
            this.setState({
                content: <ExchangeRate />
            });
        }

        getAccountInit(){
            /*******511 初始化科目开账余额******/
            this.setState({
                content:<AccountInitPage title={this.state.title}/>
            })
        }

        getFinancialNotes(){
            /***133 账务备忘 **/
            this.setState({
                content: <FinancialNotesPage />
            });
        }

        getMergeVoucher(){
            /****132 合并凭证****/
            this.setState({
                content: <MergeVoucherPage />
            });
        }

        getToItem(){
            /****131 整个科目组转换为一个科目*****/
            this.setState({
                content: <GroupToItemPage />
            });
        }

        getAddAmortization(){
            /***********121 摊销项目录入*************/
            this.setState({
                content: <AddAmortization />
            });
        }

        getDefendFixed(){
            /*****122 固定资产类型维护*****/
            this.setState({
                content: <DefendFixedAssets />
            });
        }

        getBankAccount(){
            /****124 银行账户****/
            this.setState({
                content: <BankAccount />
            });
        }

        getDefend(){
            /****123 摊销类型维护****/
            $this.setState({
                content: <DefendAmortization />
            });
        }

        getSortSubject(){
            /**127 精简会计科目*/
            $this.setState({
                content:<SortSubjectPage/>
            })
        }

        getSummary(){
            $this.setState({
                content: <SummaryPage />
            });
        }

        getCurrency(){
            $this.setState({
                content: <CurrencyPage />
            });
        }

        getFixedAssets(){
            /***120 固定资产录入***/
            $this.setState({
                content: <FixedAssets />
            });
        }
        getQRcode(){
            /*****199 扫码记账******/
            $this.setState({
                content: <QRcode type={$this.state.type} title={$this.state.title}/>
            });
        }
        getCarryOverCost(par){
            /***119 出库结转成本***/
            let type = {
                type: 'inventory/inventory-list',
                method: 'GET',
            };
            let cb = (data)=>{
                if(data.code==0){
                    $this.setState({
                        content: <CarryOverCost data={data.info} searchData={$this.getCarryOverCost.bind(this)}/>
                    });
                }
            };
            Request({},cb,type);
        }

        getPerform(par){
            /**118 执行摊销**/
            let type = {
                type: 'assets/amortisation',
                method: 'GET',
            };
            let cb = (data)=>{
                if(data.code==0){
                    $this.setState({
                        content: <PerformAmortization data={data.info} initCertificate={$this.initCertificate.bind(this)}
                                                      searchData={$this.getPerform.bind(this)}/>
                    });
                }
            };
            Request(par,cb,type);
        }

        getFinalAdjustment(par){
            /***117 期末调汇***/
            let type = {
                type:'revaluate-currencies/index',
                method:'GET'
            };
            let cb = (data)=>{
                if(data.code==0){
                    $this.setState({
                        content: <FinalAdjustment data={data.info}
                                   search={$this.getFinalAdjustment.bind(this)}/>
                    });
                }
            };
            Request(par,cb,type);
        }

        getSortCertificate(par){
            /**116 凭证字号整理排序**/
            let type = {
                type:'refs/index',
                method:'GET'
            };
            let cb = (data)=>{
              if(data.code==0){
                  $this.setState({
                      content:<SortCertificate
                          search={$this.getSortCertificate.bind(this)}
                          data={data.info.list}
                          initCertificate={$this.initCertificate.bind(this)}
                          page={data.info.pages}/>
                  })
              }
            };
            Request(par,cb,type)
        }

        getDepreciation(par){
            /**115 计提折旧**/
            let type = {
                type: 'assets/amortisation',
                method: 'GET',
            };
            let cb = (data)=>{
                if(data.code==0){
                    $this.setState({
                        content: <Depreciation data={data.info} initCertificate={$this.initCertificate.bind(this)}
                                               searchData={$this.getDepreciation.bind(this)}/>
                    });
                }
            };
            Request(par,cb,type);
        }

        getCreditNote(par){
            /*******114 红冲账凭证输入*********/
            let type = {
                type: 'refs/index',
                method: 'GET',
            };
            let cb = (data)=>{
                if(data.code == 0){
                    $this.setState({
                        content:<CreditNote page={data.info.pages} data={data.info.list}
                                            initCertificate={$this.initCertificate.bind(this)}
                                            searchData={$this.getCreditNote.bind(this)}/>
                    })
                }
            };
            Request(par,cb,type);
        }

        CostAccount(){
            /**113 结转指定成本科目余额***/
            let type = {
                type: 'forward/get-specify-chart',
                method: 'GET',
            };
            let cb = (data)=>{
              if(data.code == 0){
                  $this.setState({
                      content:<CostAccount data={data.info} searchData={$this.CostAccount.bind(this)}/>
                  })
              }else {
                  message.error(data.message);
              }
            };
            Request({},cb,type);
        }

        getCarryOver(par){
            /*****111 自动结转本期损益*****/
            let type = {
                type:'forward/index',
                method:'GET'
            };
            let cb = (data)=>{
                $this.setState({
                    content:<CarryOver data={data.info} search={$this.getCarryOver.bind(this)}/>
                })
            };
            Request(par,cb,type);
        }

        getGeneralReport(){
            /***107 打印输出***/
            $this.setState({
                content:<GeneralReport type={$this.state.type} title={$this.state.title}/>
            })
        }

        getBackRestore(){
            /****507 备份和恢复****/
            this.setState({
                content:<BackupAndRestorePage/>
            })
        }

        getYearIncome(par){
            /******109 年度收入费用分析******/
            let type = {
                type: 'report-form/year-income-inquiry',
                method: 'FormData',
                Method: 'POST'
            };
            let cb = (data) => {
                if (data.code == 0) {
                    $this.setState({
                        content: <YearIncome data={data.info}  searchDate={$this.getYearIncome.bind(this)}/>
                    });
                }
            };
            Request(par, cb, type);
        }

        getCopyCertificate(par){
            /********112 复制凭证********/
            let params = {
                date_: par.searchDate,
                memo_: par.summary,
                vnum: par.searchNum,
                page:par.page-1
            };
            if(par.page_site){
                params.page_site = par.page_site;
            }
            let type = {
                type: 'refs/index',
                method: 'GET',
            };
            console.log(params);
            let callback = (dataSource) => {
                let list = dataSource.info.list;
                let page = dataSource.info.pages;
                $this.setState({
                    content: <Copy_Certificate initCertificate={$this.initCertificate.bind(this)}
                                               data={list} page={page}
                                               searchDate={$this.getCopyCertificate.bind(this)}/>
                });
            };
            Request(params, callback, type);
        }

        getProfitTable(search){
            /*****106 利润表*****/
            let params = {
                trans_from_date: search&&search.trans_from_date ? search.trans_from_date : moment($this.state.dateVnum.date_).startOf('month').format('YYYY-MM-D'),
                trans_to_date: search&&search.trans_to_date ? search.trans_to_date : moment($this.state.dateVnum.date_).endOf('month').format('YYYY-MM-D'),
            };
            let type = {
                type: 'report-form/profit-loss-view',
                method: 'FormData',
                Method: 'POST'
            };
            let cb = (data) => {
                if (data.code == 0) {
                    $this.setState({
                        content: <ProfitTable data={data.info} getAB={$this.getAccountData.bind(this)}
                                              search={$this.getProfitTable}/>
                    });
                }
            };
            Request(params, cb, type);
        }

        getCashTable(search){
            /*******108 现金流量表*******/
            let type = {
                type: 'report-form/cash-flow-statement-view',
                method: 'FormData',
                Method: 'POST'
            };
            let cb = (data) => {
                if (data.code == 0) {
                    $this.setState({
                        content: <CashTable data={data.info} initCertificate={$this.initCertificate.bind(this)} search={$this.getCashTable}/>
                    });
                }
            };
            Request(search, cb, type);
        }

        getTrialBalance(search) {
            /*******105 试算平衡*******/
            let params = {
                trans_from_date: search&&search.trans_from_date ? search.trans_from_date : moment($this.state.dateVnum.date_).startOf('month').format('YYYY-MM-D'),
                trans_to_date: search&&search.trans_to_date ? search.trans_to_date : moment($this.state.dateVnum.date_).endOf('month').format('YYYY-MM-D'),
                grade: search&&search.grade?search.grade:0,
                no_zero: search&&search.no_zero ? 1 : 0,
                year_acc: search&&search.year_acc ? 1 : 0,
                dimension: 0,
                dimension2: 0,
            };
            let type = {
                type: 'report-form/gl-trail-balance',
                method: 'FormData',
                Method: 'POST'
            };
            let cb = (data) => {
                if (data.code == 0) {
                    $this.setState({
                        content: <TrialBalance data={data.info} search={$this.getTrialBalance}/>
                    });
                }
            };
            Request(params, cb, type);
        }

        getDisplaySetting(){
            let type = {
                type: 'users/display-prefs-index',
                method: 'GET',
            };
            let callback = (data) => {
                $this.setState({
                    content: <DisplaySetting data={data.info}/>
                });
            };
            Request({}, callback, type);
        }

        getBalanceView(params) {
            /*****104 资产负债表****/
            $this.setState({
                content: <BalanceView getAB={$this.getAccountData.bind(this)}
                                      search={$this.getBalanceView.bind(this)}/>
            });
        }

        getChangePassword() {
            setTimeout(() => {
                $this.setState({
                    content: <ChangePassword />
                });
            })
        }

        getAccountSetting() {
            /*******504 系统总账设置*******/
            let type = {
                type: 'tree/get-master-tree',
                method: 'POST',
                // Method:'POST'
            };
            let callback = (data) => {
                $this.setState({
                    content: <AccountSetting data={data.info}/>
                });
            };
            Request({}, callback, type);

        }

        getQueryData(par) {
            /***102 凭证查询****/
            let params = {
                date_: par.searchDate,
                memo_: par.summary,
                vnum: par.searchNum,
                page: par.page-1
            };
            if(par.page_site){
                params.page_site = par.page_site;
            }
            let type = {
                type: 'refs/index',
                method: 'GET',
            };
            console.log(params);
            let callback = (dataSource) => {
                let list = dataSource.info.list;
                let page = dataSource.info.pages;
                $this.setState({
                    content: <Query_Certificate initCertificate={$this.initCertificate.bind(this)}
                                                data={list} page={page}
                                                searchDate={$this.getQueryData.bind(this)}/>
                });
            };
            Request(params, callback, type);
        }

        getAccountData(par) {
            /****103 账簿查询****/

            let type = {
                type: 'gl-trans/gl-account-inquiry',
                method: 'FormData',
                Method: 'POST',
            };
            let callback = (dataSource) => {
                let list = dataSource.info.list;
                let other = {};
                if(dataSource.info.account_balance){
                    other = {
                        account_balance:dataSource.info.account_balance[0],
                        // accumulate:dataSource.info.accumulate,
                        // accyear:dataSource.info.accyear,
                        title_currency:dataSource.info.title_currency,
                        is_show_currency:dataSource.info.is_show_currency,
                        is_show_qty:dataSource.info.is_show_qty
                    };
                }
                let page = dataSource.info.pages;
                $this.setState({
                    content: <AccountBook data={list} page={page} initCertificate={$this.initCertificate.bind(this)}
                                          other={other} account_code={par.account_code}
                                          searchDate={$this.getAccountData.bind(this)}/>
                });
            };
            if(par){
                let params = {
                    trans_from_date: par.searchDate[0],
                    trans_to_date: par.searchDate[1],
                    // account_type:1,
                    max_money:par.max_money,
                    min_money:par.min_money,
                    account_code:par.account_code,
                    page:par.page-1,
                };
                if(par.page_site){
                    params.page_site = par.page_site;
                }
                Request(params, callback, type);
            }else {
                $this.setState({
                    content: <AccountBook searchDate={$this.getAccountData.bind(this)}
                                          initCertificate={$this.initCertificate.bind(this)}/>
                });
            }

        }

        getSubjectTree() {
            /***125 科目定义管理***/
            $this.setState({
                content: <TreePage title={$this.state.title}/>
            });
        }

        getCmpInfo() {
            let type = {
                type: 'sys-prefs/index',
                method: 'GET',
            };
            let callback = (dataSource) => {
                let list = dataSource.info;
                $this.setState({
                    content: <CmpSetting data={list}/>
                });
            };
            Request({}, callback, type);
        }

        getRootSetting(){
            /****503 权限设置*****/
            $this.setState({
                content:<RootSetting/>
            })
        }

        getUserList() {
            /***502 用户帐户设置***/
            let type = {
                type: 'users/index',
                method: 'GET',
            };
            let callback = (dataSource) => {
                let list = dataSource.info.list;
                $this.setState({
                    content: <UserSetting data={list} search={$this.getUserList.bind()}/>
                });
            };
            Request({}, callback, type);
        }

        /*
        *   轻松记账
        */
        getSubjectSetting(){
            this.setState({
                content:<SubjectSetting title={this.state.title}/>
            })
        }
        getEasyCertificate(){
            this.setState({
                content:<EasyCertificate title={this.state.title}
                                         switchSetType={$this.switchSetType.bind(this)}
                                         initCertificate={$this.initCertificate.bind(this)}
                                         type={this.state.type}/>
            })
        }

        componentWillReceiveProps(nextProps) {
            item = nextProps;
            this.setState({
                title: item.title,
                url: item.url,
                type: item.type,
                hide:item.hide,
            },()=>{
                if(item.type!=GetLocalStorage('urlType')){
                    this.switchSetType(item.type);
                }
            });
        };
        getRouter(type){

            let index = this.state.index;
            if(type == 'forward'){
                index++;
            }else {
                index--;
            }
            this.setState({index},()=>{
                this.switchSetType(this.state.router[index-1],true);
                console.log(this.state.router,index)
            });
        }

        render() {
            return (
                <div className={this.state.hide?'gen-slider-content full-slider-content':'gen-slider-content'}>
                    {this.state.content}
                </div>
            );
        }
    }
    module.exports = Content;
})();
   