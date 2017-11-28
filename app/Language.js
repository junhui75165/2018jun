/**
 * Created by junhui on 2017/10/10.
 */
(()=>{
    'use strict';
    const C = {
        AccountAlias:'Account Alias',
        AccountCode:'Account Code',
        AccountName:'Account Name',
        AccountNotes:"Account Notes",
        AccountDefinitionManagement:'Account Definition Management',
        AccountingPeriodEnding:'Accounting Period Ending',
        AccountingSubjects:'Accounting Subjects',
        AccountSetting:'Account Setting',
        AccountSystem:'Accounting system (account table)',
        AccountPassword:'Account login password',
        AccountSupport:'The set number only supports entering numbers',
        AccountStatement:'Account Statement',
        AccountStructureMaintenance:'Account Structure Maintenance',
        AddExpense:'Add a fee bill',
        AdministratorPassword:'Administrator password',
        AmortisationEntries:'Amortisation Entries',
        AmortisationPosting:'Amortisation Posting',
        AmortizationType:'Amortization Type',
        AnnualStatement:'Annual Income/Expense Statement',
        AssetsAndAmortization:'Assets & Amortization',
        AssetsEntries:'Assets Entries',
        AssetTypeEntries:'Asset Type Entries',
        AttachmentManagement:'Attachment Management',
        AuditTrail:"Audit Trail",
        AutoCarryForward:'Auto. Carry Forward',
        AutomaticProvisionTax:'Automatic Provision Tax',
        AutomaticProvisionTaxTips:'Automatic provision of foreign representative office tax',
        BackupAndRestore:"Backup & Restore",
        BalanceSheet:'Balance Sheet',
        BankAccount:'Bank Account',
        BankAccountTips:'The current account of the bank account',
        BankAccountTransfers:'Bank Account Transfers',
        BankAccountTransfersTips:'Add a bank transfer voucher',
        BankCharges:'Bank Charges',
        BankChargesTips:'Add a bank fee certificate',
        BookkeepingVouchers:'Voucher',
        BookSearch:'Book Search',
        BookSearchTips:'Check the records of the books',
        CarryoverCosts:'Carryover Costs',
        CarryoverCostsTips:'Inventory carryover and inventory definition',
        CashFlowStatement:'Cash Flow Statement',
        ChangePassword:"Change Password",
        CodeScanningAccount:"CodeScanningAccount",
        CombineVouchers:'Combine Vouchers',
        Communicate:"Communicate",
        CreateSuccess:'Create successfully, landing',
        Currency:"Currency",
        CustomReport:'Custom Report',
        DepreciationPosting:'Depreciation Posting',
        DisplaySetting:"Display Setting",
        EasyAccountSetting:'Easy Account Setting',
        EasyAccountSettingTips:'Easily book the list of account settings',
        EnterAbbreviation:'Enter account'/'s abbreviation',
        EnterAccountName:'Enter the name of the account',
        EnterAccountType:'Enter the type of account',
        EnterpriseSetting:"Enterprise Setting",
        Expense:'Expense',
        FixedAssets:'Type of fixed assets',
        ForeignCurrencyManagement:"Foreign Currency Management",
        GeneralLedger:'General Ledger',
        G_LAccountSetting:'G / L Account Setting',
        Help:"Help",
        Home:'Home',
        InitializeAccountBalance:"Initialize Account Balance",
        Initialization:'Initialization',
        InputDebitImbalance:"Input Debit Imbalance",
        Interest:'Interest',
        InterestTips:'Add interest memo',
        InventoryConsumptionCostPurchase:'Inventory Consumption & Cost Carry Forward',
        ImportAccountBalance:"Import Account Balance",
        Import_ExportData:"Import/Export Data",
        KeepTwoEntries:"Keep At Least Two Entries",
        Maintain:"Maintain",
        ManuallyBalanceCarryForward:'Manually Balance Carry Forward',
        MemoMaintenance:"Memo Maintenance",
        MissingAbbreviation:'Missing account abbreviation',
        MissingAccountPassword:'Missing login password',
        MissingAccountName:'Missing account name',
        MissingAccountNumber:'Missing account number',
        MissingAccountType:'Missing account type',
        MissingAccountSystem:'Missing account system',
        NonOperatingIncome:'Non Operating Income',
        NonOperatingIncomeTips:'Add non-operating income vouchers',
        OperatingExpenses:'Operating Expenses',
        OperatingExpensesTips:'Add a non-operating expense certificate',
        PayHouseFund:'Pay House Fund',
        PayHouseFundTips:'Add to pay the housing provident fund certificate',
        PaymentCustomer:'Payment Customer',
        PaymentCustomerTips:'Add a payment (customer) certificate',
        PaymentNonCustomer:'Payment Non-customer',
        PaymentNonCustomerTips:'Add a paid (non-customer) certificate',
        PaySocialSecurity:'Pay Social Security',
        PaySocialSecurityTips:'Add payment service premium voucher',
        PayingTaxes:'Paying Taxes',
        PayingTaxesTips:'Add a tax payment certificate',
        PayWages:'Pay Wages',
        PayWagesTips:'Add the payment voucher',
        PermissionSettings:"Permission Settings",
        PrintOutput:'Print Output',
        PrintOutputTips:'Print The Contents Of The Book',
        ProfitStatement:'Profit Statement',
        Purchase:'Purchase',
        PurchaseTips:'Add purchase receipt certificate',
        PurchaseAssets:'Purchase Assets',
        PurchaseAssetsTips:'Add purchase of fixed asset certificate',
        Rate:"Rate",
        ReceiptCustomer:'Receipt(Clients or Suppliers)',
        ReceiptCustomerTips:'Add a receipt (Clients or Suppliers) certificate',
        ReceiptNonCustomer:'Receipt(Non-Client)',
        ReceiptNonCustomerTips:'Add a payment (Non-Client) certificate',
        Register:'Register',
        RegisteredAccount:'Registered account set',
        ReturnLogin:'Return to login',
        RevaluationCurrencyAccounts:'Revaluation of Currency Accounts',
        RoleInformation:"Role Information",
        SalesIncome:'Sales Income (No Delivery)',
        SalesIncomeTips:'Add no sales income certificate',
        SaveCertificateSuccessfully:"Save The Certificate Successfully",
        SelfBilling:'Self Billing',
        SelfBooking:"Self Booking",
        SignOut:"Sign Out",
        StreamliningAccountingSubjects:"Streamlining Accounting Subjects",
        StrikeBalance:"Strike a balance",
        SortVoucher:'Sort Voucher Number',
        SystemDataVerify:"System Data Verify",
        UserAccountSettings:"User Account Settings",
        Quit:"Quit",
        TransferAccountToGroup:'Transfer Account To Group',
        TransferGroupToAccount:'Transfer Group To Account',
        TrialBalance:'Trial Balance',
        TrialBalanceTips:'Check The Account Records Correctly',
        VoidTransaction:"Void a Transaction",
        VoucherCopy:'Voucher Copy',
        VoucherEntry:'Voucher Entry',
        VoucherEntryTips:'Enter A New Voucher',
        VoucherSearch:'Voucher Search',
        VoucherSearchTips:'Query the record of the Voucher',
        WageAccrual:'Wage Accrual',
        WageAccrualTips:'Add the accrued voucher',
    };
    const zh_CN = {
        AccountAlias:'账号（别名）',
        AccountCode:'客户编码',
        AccountName:'公司全称',
        AccountNotes:"账务备忘",
        AccountDefinitionManagement:'科目定义管理',
        AccountingPeriodEnding:'期末处理',
        AccountingSubjects:'会计科目',
        AccountSetting:'账务设置',
        AccountSystem:'会计制度（科目表）',
        AccountPassword:'帐套登陆的密码',
        AccountSupport:'帐套编号仅支持输入数字',
        AccountStatement:'账簿报表',
        AccountStructureMaintenance:'摊销类型维护',
        AddExpense:'添加费用开支凭证',
        AdministratorPassword:'管理员密码',
        AmortisationEntries:'摊销项目录入',
        AmortisationPosting:'执行摊销',
        AmortizationType:'摊销类型',
        AnnualStatement:'年度收入费用分析',
        AssetsAndAmortization:'资产及摊销',
        AssetsEntries:'固定资产录入',
        AssetTypeEntries:'固定资产类型维护',
        AttachmentManagement:'附件管理',
        AuditTrail:"审查日志",
        AutoCarryForward:'自动结转本期损益',
        AutomaticProvisionTax:'自动计提处税金',
        AutomaticProvisionTaxTips:'自动计提外资代表处税金',
        BackupAndRestore:"备份和恢复",
        BalanceSheet:'资产负债表',
        BankAccount:'银行账户',
        BankAccountTips:'当前账户的银行账户',
        BankAccountTransfers:'银行账户转账(提现/存现）',
        BankAccountTransfersTips:'添加银行转账凭证',
        BankCharges:'银行手续费及费用',
        BankChargesTips:'添加银行手续费凭证',
        BookkeepingVouchers:'记账凭证',
        BookSearch:'账簿查询',
        BookSearchTips:'查询账簿的记录',
        CarryoverCosts:'出库结转',
        CarryoverCostsTips:'库存结转和库存定义',
        CashFlowStatement:'现金流量表',
        ChangePassword:"更改密码",
        CodeScanningAccount:"扫码记账",
        CombineVouchers:'合并凭证',
        Communicate:"交流",
        CreateSuccess:'创建成功,正在登陆',
        Currency:"货币",
        CustomReport:'自定义报表',
        DepreciationPosting:'计提折旧',
        DisplaySetting:"显示设置",
        EasyAccountSetting:'轻松记账科目设置',
        EasyAccountSettingTips:'轻松记账科目的列表设置',
        EnterAbbreviation:'录入客户的简称',
        EnterAccountName:'录入客户的名称',
        EnterAccountType:'录入科目的类型',
        EnterpriseSetting:"企业设置",
        Expense:'费用开支',
        FixedAssets:'固定资产类型',
        ForeignCurrencyManagement:"外币管理",
        GeneralLedger:'总账',
        G_LAccountSetting:'总账科目设置',
        Help:"帮助",
        Home:'首页',
        InitializeAccountBalance:"初始化科目开账余额",
        Initialization:'初始化',
        InputDebitImbalance:"录入借贷不平衡",
        Interest:'利息',
        InterestTips:'添加利息凭证',
        InventoryConsumptionCostPurchase:'出库结转成本',
        ImportAccountBalance:"导入科目开账余额",
        Import_ExportData:"导入/导出数据",
        KeepTwoEntries:"至少保留二条分录",
        Maintain:"维护",
        ManuallyBalanceCarryForward:'结转指定成本科目余额',
        MemoMaintenance:"常用摘要维护",
        MissingAbbreviation:'缺少客户简称',
        MissingAccountPassword:'缺少登陆密码',
        MissingAccountName:'缺少客户名称',
        MissingAccountNumber:'缺少帐套编号',
        MissingAccountType:'缺少科目类型',
        MissingAccountSystem:'缺少会计制度',
        NonOperatingIncome:'营业外收入',
        NonOperatingIncomeTips:'添加营业外收入凭证',
        OperatingExpenses:'营业外支出',
        OperatingExpensesTips:'添加营业外支出凭证',
        PayHouseFund:'支付住房公积金',
        PayHouseFundTips:'添加支付住房公积金凭证',
        PaymentCustomer:'付款(客户）',
        PaymentCustomerTips:'添加付款(客户）凭证',
        PaymentNonCustomer:'付款(非客户）',
        PaymentNonCustomerTips:'添加付款(非客户）凭证',
        PaySocialSecurity:'支付社保费',
        PaySocialSecurityTips:'添加支付社保费凭证',
        PayingTaxes:'缴纳税款',
        PayingTaxesTips:'添加缴纳税款凭证',
        PayWages:'发放工资',
        PayWagesTips:'添加发放工资凭证',
        PermissionSettings:"权限设置",
        PrintOutput:'打印输出',
        PrintOutputTips:'打印账簿内容',
        ProfitStatement:'利润表',
        Purchase:'采购进货',
        PurchaseTips:'添加采购进货收入凭证',
        PurchaseAssets:'购入固定资产',
        PurchaseAssetsTips:'添加购入固定资产凭证',
        Rate:"汇率",
        ReceiptCustomer:'收款(从客户或供应商)',
        ReceiptCustomerTips:'添加收款(客户)凭证',
        ReceiptNonCustomer:'收款(非客户/非货款）',
        ReceiptNonCustomerTips:'添加收款(非客户）凭证',
        Register:'注册',
        RegisteredAccount:'注册账套',
        ReturnLogin:'返回登录',
        RevaluationCurrencyAccounts:'期末调汇',
        RoleInformation:"角色信息",
        SalesIncome:'不出库销售收入',
        SalesIncomeTips:'添加不出库销售收入凭证',
        SaveCertificateSuccessfully:"保存凭证成功",
        SelfBilling:'自助记账',
        SelfBooking:"轻松记账",
        SignOut:"退出登陆",
        StreamliningAccountingSubjects:"精简会计科目",
        StrikeBalance:"红冲帐凭证输入",
        SortVoucher:'凭证字号整理排序',
        SystemDataVerify:"账务数据检验",
        UserAccountSettings:"用户帐户设置",
        Quit:"退出",
        TransferAccountToGroup:'科目转换为科目组',
        TransferGroupToAccount:'科目组转换为科目',
        TrialBalance:'试算平衡',
        TrialBalanceTips:'检查账户记录',
        VoidTransaction:"作废一笔业务",
        VoucherCopy:'复制凭证',
        VoucherEntry:'凭证输入',
        VoucherEntryTips:'录入一份新凭证',
        VoucherSearch:'凭证簿查询',
        VoucherSearchTips:'查询凭证的记录',
        WageAccrual:'计提工资',
        WageAccrualTips:'添加计提工资凭证',
    };
    const zh_TW = {
        AccountAlias:'賬號（別名）',
        AccountCode:'客戶編碼',
        AccountName:'公司全稱',
        AccountNotes:"賬務備忘",
        AccountDefinitionManagement:'科目定義管理',
        AccountingPeriodEnding:'期末處理',
        AccountingSubjects:'會計科目',
        AccountSetting:'賬務設置',
        AccountSystem:'會計制度（科目表）',
        AccountPassword:'帳套登陸的密碼',
        AccountSupport:'帳套編號僅支持輸入數字',
        AccountStatement:'賬簿報表',
        AccountStructureMaintenance:'攤銷類型維護',
        AddExpense:'添加費用開支憑證',
        AdministratorPassword:'管理員密碼',
        AmortisationEntries:'攤銷項目錄入',
        AmortisationPosting:'執行攤銷',
        AmortizationType:'攤銷類型',
        AnnualStatement:'年度收入費用分析',
        AssetsAndAmortization:'資產及攤銷',
        AssetsEntries:'固定資產錄入',
        AssetTypeEntries:'固定資產類型維護',
        AttachmentManagement:'附件管理',
        AuditTrail:"審查日誌",
        AutoCarryForward:'自動結轉本期損益',
        AutomaticProvisionTax:'自動計提處稅金',
        AutomaticProvisionTaxTips:'自動計提外資代表處稅金',
        BackupAndRestore:"備份和恢復",
        BalanceSheet:'資產負債表',
        BankAccount:'銀行賬戶',
        BankAccountTips:'當前賬戶的銀行賬戶',
        BankAccountTransfers:'銀行賬戶轉賬(提現/存現）',
        BankAccountTransfersTips:'添加銀行轉賬憑證',
        BankUser:'',
        BankCharges:'銀行手續費及費用',
        BankChargesTips:'添加銀行手續費憑證',
        BookkeepingVouchers:'記賬憑證',
        BookSearch:'賬簿查詢',
        BookSearchTips:'查詢賬簿的記錄',
        CarryoverCosts:'出庫結轉',
        CarryoverCostsTips:'庫存結轉和庫存定義',
        CashFlowStatement:'現金流量表',
        ChangePassword:"更改密碼",
        CodeScanningAccount:"掃碼記賬",
        CombineVouchers:'合併憑證',
        Communicate:"交流",
        CreateSuccess:'創建成功，正在登陸',
        Currency:"貨幣",
        CustomReport:'自定義報表',
        DepreciationPosting:'計提折舊',
        DisplaySetting:"顯示設置",
        EasyAccountSetting:'輕鬆記賬科目設置',
        EasyAccountSettingTips:'輕鬆記賬科目的列表設置',
        EnterAbbreviation:'錄入客戶的簡稱',
        EnterAccountName:'錄入客戶的名稱',
        EnterAccountType:'錄入科目的類型',
        EnterpriseSetting:"企業設置",
        Expense:'費用開支',
        FixedAssets:'固定資產類型',
        ForeignCurrencyManagement:"外幣管理",
        GeneralLedger:'總賬',
        G_LAccountSetting:'總賬科目設置',
        Help:"幫助",
        Home:'首頁',
        InitializeAccountBalance:"初始化科目開賬餘額",
        Initialization:'初始化',
        InputDebitImbalance:"錄入借貸不平衡",
        Interest:'利息',
        InterestTips:'添加利息憑證',
        InventoryConsumptionCostPurchase:'出庫結轉成本',
        ImportAccountBalance:"導入科目開賬餘額",
        Import_ExportData:"導入/導出數據",
        KeepTwoEntries:"至少保留二条分录",
        Maintain:"維護",
        ManuallyBalanceCarryForward:'結轉指定成本科目餘額',
        MemoMaintenance:"常用摘要維護",
        MissingAbbreviation:'缺少客戶簡稱',
        MissingAccountPassword:'缺少登陸密碼',
        MissingAccountName:'缺少客戶名稱',
        MissingAccountNumber:'缺少帳套編號',
        MissingAccountType:'缺少科目類型',
        MissingAccountSystem:'缺少會計制度',
        NonOperatingIncome:'營業外收入',
        NonOperatingIncomeTips:'添加營業外收入憑證',
        OperatingExpenses:'營業外支出',
        OperatingExpensesTips:'添加營業外支出憑證',
        PayHouseFund:'支付住房公積金',
        PayHouseFundTips:'添加支付住房公積金憑證',
        PaymentCustomer:'付款(客戶）',
        PaymentCustomerTips:'添加付款(客戶）憑證',
        PaymentNonCustomer:'付款(非客戶）',
        PaymentNonCustomerTips:'添加付款(非客戶）憑證',
        PaySocialSecurity:'支付社保費',
        PaySocialSecurityTips:'添加支付社保費憑證',
        PayingTaxes:'繳納稅款',
        PayingTaxesTips:'添加繳納稅款憑證',
        PayWages:'發放工資',
        PayWagesTips:'添加發放工資憑證',
        PermissionSettings:"權限設置",
        PrintOutput:'打印輸出',
        PrintOutputTips:'打印賬簿內容',
        ProfitStatement:'利潤表',
        Purchase:'採購進貨',
        PurchaseTips:'添加採購進貨收入憑證',
        PurchaseAssets:'購入固定資產',
        PurchaseAssetsTips:'添加購入固定資產憑證',
        Rate:"匯率",
        ReceiptCustomer:'收款(客戶)',
        ReceiptCustomerTips:'添加收款(客戶)憑證',
        ReceiptNonCustomer:'收款(非客戶）',
        ReceiptNonCustomerTips:'添加收款(非客戶）憑證',
        Register:'注册',
        RegisteredAccount:'注册賬套',
        ReturnLogin:'返回登錄',
        RevaluationCurrencyAccounts:'期末調匯',
        RoleInformation:"角色信息",
        SalesIncome:'不出庫銷售收入',
        SalesIncomeTips:'添加不出庫銷售收入憑證',
        SaveCertificateSuccessfully:"保存憑證成功",
        SelfBilling:'自助記賬',
        SelfBooking:"輕鬆記賬",
        SignOut:"退出登錄",
        StreamliningAccountingSubjects:"精簡會計科目",
        StrikeBalance:"紅沖帳憑證輸入",
        SortVoucher:'憑證字號整理排序',
        SystemDataVerify:"賬務數據檢驗",
        UserAccountSettings:"用戶帳戶設置",
        Quit:"退出",
        TransferAccountToGroup:'科目轉換為科目組',
        TransferGroupToAccount:'科目組轉換為科目',
        TrialBalance:'試算平衡',
        TrialBalanceTips:'檢查賬戶記錄是否正確',
        VoidTransaction:"作廢一筆業務",
        VoucherCopy:'複製憑證',
        VoucherEntry:'憑證輸入',
        VoucherEntryTips:'錄入一份新憑證',
        VoucherSearch:'憑證簿查詢',
        VoucherSearchTips:'查詢憑證的記錄',
        WageAccrual:'計提工資',
        WageAccrualTips:'添加計提工資憑證',
    };
    const Const = require('./tool').GetLocalStorage('Const');
    let language = Const?Const.language:"";
    let output = zh_CN;
    if(language == 'zh_TW'){
        output = zh_TW;
    }else if(language == 'C'){
        output = C;
    }else {
        output = zh_CN;
    }
    module.exports = output
})();