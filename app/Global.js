(function () {
    'use strict';

    const language = require('./Language');
    const Global = {
        // cmpUrl:'https://www.tm520.cn',
        cmpUrl:'https://a.tj520.cn',
        // upload:'https://www.tm520.cn/attachments-file/add-attachment',
        upload:'https://a.tj520.cn/attachments-file/add-attachment',
        formItemLayout : {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 6 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 14 },
            },
        },
        reqConst:{
            fixed:{type:1,tips:language.FixedAssets},
            defend:{type:100,tips:language.AmortizationType},
        },
        topList:[
            {title:language.GeneralLedger,url:'',active:true,type:'contentList'},
            {title:language.SelfBilling,url:'',type:'keepAccount',},
            // {title:'轻松看帐',url:'',type:'checkAccount',},
            // {title:'报表',url:'',type:'reimbursed'},
            // {title:'设置',url:'',type:'setting'},
            // {title:'帮助',url:'',type:'help'},
            {title:language.Quit,url:'/login',type:'login_out'},
        ],
        contentList:[
            {
                title:language.Home,url:'',type:100,Icon:'home'
            },
            {
                title:language.BookkeepingVouchers,
                list:[//2
                    {title:language.VoucherEntry,url:'/',type:101},
                    {title:language.VoucherSearch,url:'/',type:102},
                    {title:language.AttachmentManagement,url:'/',type:515},
                    {title:language.VoucherCopy,url:'',type:112},
                    {title:language.StrikeBalance,url:'',type:114},
                    {title:language.SortVoucher,url:'',type:116},
                    {title:language.CombineVouchers,url:'',type:132},
                ],
                icon:'jizhangpingzheng'
            },
            {
                title:language.CodeScanningAccount,url:"",type:199,Icon:'qrcode'
            },
            {
                title:language.SelfBooking,
                url:'/',
                content: {
                    type: 200,
                    list:[
                        {title:language.Expense,url:'/',type:201,group:0,desc:language.AddExpense},
                        {title:language.ReceiptCustomer,url:'/',type:202,group:0,desc:language.ReceiptCustomerTips},
                        {title:language.ReceiptNonCustomer,url:'/',type:203,group:0,desc:language.ReceiptNonCustomerTips},
                        {title:language.BankAccountTransfers,url:'/',type:204,group:0,desc:language.BankAccountTransfersTips},
                        {title:language.BankCharges,url:'/',type:205,group:0,desc:language.BankChargesTips},
                        {title:language.WageAccrual,url:'/',type:206,group:0,desc:language.WageAccrualTips},
                        {title:language.PayWages,url:'/',type:207,group:0,desc:language.PayWagesTips},
                        {title:language.PayHouseFund,url:'/',type:208,group:0,desc:language.PayHouseFundTips},
                        {title:language.SalesIncome,url:'/',type:209,group:0,desc:language.SalesIncomeTips},
                        {title:language.AutomaticProvisionTax,url:'/',type:210,group:0,desc:language.AutomaticProvisionTaxTips},

                        {title:language.PaymentCustomer,url:'/',type:211,group:0,desc:language.PaymentCustomerTips},
                        {title:language.PaymentNonCustomer,url:'/',type:212,group:0,desc:language.PaymentNonCustomerTips},
                        {title:language.PaySocialSecurity,url:'/',type:213,group:0,desc:language.PaySocialSecurityTips},
                        {title:language.PayingTaxes,url:'/',type:214,group:0,desc:language.PayingTaxesTips},
                        {title:language.Interest,url:'/',type:215,group:0,desc:language.InterestTips},
                        {title:language.OperatingExpenses,url:'/',type:216,group:0,desc:language.OperatingExpensesTips},
                        {title:language.NonOperatingIncome,url:'/',type:217,group:0,desc:language.NonOperatingIncomeTips},
                        {title:language.PurchaseAssets,url:'/',type:218,group:0,desc:language.PurchaseAssetsTips},
                        {title:language.Purchase,url:'/',type:219,group:0,desc:language.PurchaseTips},
                        {title:language.CarryoverCosts,url:'/',type:220,group:0,desc:language.CarryoverCostsTips},

                        {title:language.VoucherSearch,url:'/',type:221,group:1,desc:language.VoucherSearchTips,Icon:'search'},
                        {title:language.BookSearch,url:'',type:222,group:1,desc:language.BookSearchTips,Icon:'search'},

                        {title:language.EasyAccountSetting,url:'/',type:223,group:2,desc:language.EasyAccountSettingTips,Icon:'setting'},
                        {title:language.BankAccount,url:'/',type:224,group:2,desc:language.BankAccountTips,Icon:'contacts'},
                    ]
                },
                icon:'kanzhang'
            },
            {
                title:language.AccountStatement,
                list:[//8
                    {title:language.BookSearch,url:'',type:103},
                    {title:language.BalanceSheet,url:'',type:104},
                    {title:language.TrialBalance,url:'',type:105},
                    {title:language.ProfitStatement,url:'',type:106},
                    // {title:'总账报表',url:'',type:107},
                    {title:language.CashFlowStatement,url:'',type:108},
                    {title:language.AnnualStatement,url:'',type:109},
                    {title:language.CustomReport,url:'',type:110},
                ],
                icon:'chaxunhebaobiao'
            },
            {
                title:language.PrintOutput,url:'',type:107,icon:'zongzhang'
            },
            {
                title:language.AccountingPeriodEnding,
                list:[//9
                    {title:language.AutoCarryForward,url:'',type:111},
                    {title:language.DepreciationPosting,url:'',type:115},
                    {title:language.AmortisationPosting,url:'',type:118},
                    {title:language.InventoryConsumptionCostPurchase,url:'',type:119},
                    {title:language.RevaluationCurrencyAccounts,url:'',type:117},
                    {title:language.ManuallyBalanceCarryForward,url:'',type:113},
                ],
                icon:'qimojiqita'
            },
            {
                title:language.AssetsAndAmortization,
                list:[//4
                    {title:language.AssetsEntries,url:'',type:120},
                    {title:language.AssetTypeEntries,url:'',type:122},
                    {title:language.AmortisationEntries,url:'',type:121},
                    {title:language.AccountStructureMaintenance,url:'',type:123},
                ],
                icon:'zhejiu'
            },
            {
                title:language.Maintain,
                list:[
                    {title:language.AuditTrail,url:'/',type:509},
                    {title:language.SystemDataVerify,url:'/',type:510},
                    {title:language.AccountNotes,url:'',type:133},
                    {title:language.MemoMaintenance,url:'',type:126},
                    {title:language.BackupAndRestore,url:'/',type:507},
                ],
                icon:'weihu'
            },
            {
                title:language.ForeignCurrencyManagement,
                list:[
                    {title:language.Rate,url:'',type:130},
                    {title:language.Currency,url:'',type:128},
                ],
                icon:'waihui'
            },
            {
                title:language.AccountSetting,
                list:[//500
                    {title:language.EnterpriseSetting,url:'/',type:501},

                    {title:language.G_LAccountSetting,url:'/',type:504},
                    {title:language.UserAccountSettings,url:'/',type:502},

                    {title:language.DisplaySetting,url:'/',type:505},
                    {title:language.BankAccount,url:'',type:124},
                    {title:language.RoleInformation,url:'/',type:514,},
                    // {title:language.PermissionSettings,url:'/',type:503,disabled:true},
                    {title:language.ChangePassword,url:'/',type:506},
                ],
                icon:'shezhi'
            },
            {
                title:language.Initialization,
                list:[
                    // {title:language.VoidTransaction,url:'/',type:508,disabled:true},
                    {title:language.InitializeAccountBalance,url:'/',type:511},
                    // {title:language.ImportAccountBalance,url:'/',type:512,disabled:true},
                    // {title:language.Import_ExportData,url:'/',type:513,disabled:true},
                ],
                icon:'chushihua'
            },
            {
                title:language.AccountingSubjects,
                list:[//10
                    {title:language.AccountDefinitionManagement,url:'',type:125},
                    {title:language.StreamliningAccountingSubjects,url:'',type:127},
                    {title:language.TransferAccountToGroup,url:'',type:129},
                    {title:language.TransferGroupToAccount,url:'',type:131},
                ],
                Icon:'book'
            },
            // {
            //     title:'轻松看帐',
            //     list:[
            //         {title:'账簿查询',url:'/',type:301},
            //         {title:'资产负债表',url:'/',type:302},
            //         {title:'利润表',url:'/',type:303},
            //         {title:'轻松看帐功能设置',url:'/',type:304},
            //     ],
            //     icon:'qingsong'
            // },
            {title:language.Help,url:'http://acc8.cn/h/%E5%9C%A8%E7%BA%BF%E4%BC%9A%E8%AE%A1',type:601,icon:'jiaoliu'},
            {title:language.Communicate,url:'http://acc8.cn/h/forum',type:602,icon:'bangzhu'},
        ],
        keepAccount:[
            // {
            //     title:'轻松看帐',
            //     list:[
            //         {title:'账簿查询',url:'/',type:301},
            //         {title:'资产负债表',url:'/',type:302},
            //         {title:'利润表',url:'/',type:303},
            //         {title:'轻松看帐功能设置',url:'/',type:304},
            //     ]
            // },
            // {
            //     title:'轻松记账',
            //     list:[
            //         {title:'费用开支',url:'/',type:201},
            //         {title:'收款(客户)',url:'/',type:202},
            //         {title:'收款(非客户）',url:'/',type:203},
            //         {title:'银行转账',url:'/',type:204},
            //         {title:'银行手续费',url:'/',type:205},
            //         {title:'计提工资',url:'/',type:206},
            //         {title:'发放工资',url:'/',type:207},
            //         {title:'支付住房公积金',url:'/',type:208},
            //         {title:'不出库销售收入',url:'/',type:209},
            //         {title:'自动计提处税金',url:'/',type:210},
            //         {title:'付款(客户）',url:'/',type:211},
            //         {title:'付款(非客户）',url:'/',type:212},
            //         {title:'支付社保费',url:'/',type:213},
            //         {title:'缴纳税款',url:'/',type:214},
            //         {title:'利息',url:'/',type:215},
            //         {title:'营业外支出',url:'/',type:216},
            //         {title:'营业外收入',url:'/',type:217},
            //         {title:'购入固定资产',url:'/',type:218},
            //         {title:'采购进货',url:'/',type:219},
            //         {title:'出库结转成本',url:'/',type:220},
            //         {title:'轻松记账科目设置',url:'/',type:223},
            //         {title:'银行账户',url:'/',type:224},
            //     ]
            // },
            // {
            //     title:'查询和报表',
            //     list:[
            //         {title:'凭证簿查询',url:'/',type:221},
            //         {title:'账簿查询',url:'/',type:222},
            //     ]
            // },
        ],
        checkAccount:[
            // {
            //     title:'查询和报表',
            //     list:[
            //         {title:'账簿查询',url:'/',type:301},
            //         {title:'资产负债表',url:'/',type:302},
            //         {title:'利润表',url:'/',type:303},
            //     ]
            // },
            // {
            //     title:'维护',
            //     list:[
            //         {title:'轻松看帐功能设置',url:'/',type:304},
            //     ]
            // },
        ],
        reimbursed:[
            // {
            //     title:'报表',
            //     list:[
            //         {title:'总账报表',url:'/',type:401},
            //     ]
            // },
            // {
            //     title:'总账报表',
            //     list:[
            //         {title:'总账',url:'/',type:402,},
            //         {title:'明细账',url:'/',type:403,},
            //         {title:'资产负债表',url:'/',type:404,},
            //         {title:'利润表',url:'/',type:405,},
            //         {title:'记账凭证',url:'/',type:406,},
            //         {title:'试算平衡',url:'/',type:407,},
            //         {title:'库存结余',url:'/',type:408,},
            //         {title:'自定义报表',url:'/',type:409,},
            //         {title:'现金流量表',url:'/',type:410,},
            //         {title:'科目表',url:'/',type:411,},
            //         {title:'凭证簿',url:'/',type:412,},
            //         {title:'资产折旧表',url:'/',type:413,},
            //         {title:'摊销表',url:'/',type:414,},
            //     ]
            // },
        ],
        setting:[
            // {
            //     title:'公司设置',
            //     list:[//500
            //         {title:'公司设置',url:'/',type:501},
            //         {title:'用户帐户设置',url:'/',type:502},
            //         {title:'角色信息',url:'/',type:514,disabled:true},
            //         {title:'权限设置',url:'/',type:503,disabled:true},
            //         {title:'系统总账设置',url:'/',type:504},
            //         {title:'显示设置',url:'/',type:505},
            //         {title:'更改密码',url:'/',type:506},
            //         {title:'备份和恢复',url:'/',type:507},
            //     ]
            // },
            // {
            //     title:'维护',
            //     list:[
            //         {title:'作废一笔业务',url:'/',type:508,disabled:true},
            //         {title:'审查日志',url:'/',type:509},
            //         {title:'账务数据检验',url:'/',type:510},
            //         {title:'初始化科目开账余额',url:'/',type:511},
            //         {title:'导入科目开账余额',url:'/',type:512},
            //         {title:'导入/导出数据',url:'/',type:513,disabled:true},
            //
            //     ]
            // },
        ],
        help:[
            // {title:'帮助',url:'http://acc8.cn/h/%E5%9C%A8%E7%BA%BF%E4%BC%9A%E8%AE%A1',type:601},
            // {title:'交流',url:'http://acc8.cn/h/forum',type:602},
        ],
        errorCode:[
            // Token_Failure:505,//token 失效
            // Authority_Failure:403,//权限警告提示
            // Scan_Code:441,//扫描的发票失败提示
            441
        ]
    };

    module.exports = Global;
})();
