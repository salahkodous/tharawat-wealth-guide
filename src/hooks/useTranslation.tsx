import { useSettings } from './useSettings';

const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    portfolio: 'Portfolio',
    finances: 'Finances',
    assistant: 'AI Assistant',
    analytics: 'Analytics',
    settings: 'Settings',
    news: 'News',

    // Dashboard
    welcome: 'Welcome to Anakin',
    personalFinancialManager: 'Your Super Personal Financial Manager',
    dashboardOverview: 'Dashboard Overview',
    yourFinancialOverview: 'Your financial overview at a glance',
    allRightsReserved: 'All rights reserved',

    // Portfolio
    portfolioManagement: 'Portfolio Management',
    trackYourInvestments: 'Track and manage your investment portfolio',

    // Finances
    financialManagement: 'Financial Management',
    trackIncomeExpenses: 'Track your income, expenses, and financial goals',

    // Settings
    profileInformation: 'Profile Information',
    preferences: 'Preferences',
    notifications: 'Notifications',
    privacySecurity: 'Privacy & Security',
    accountActions: 'Account Actions',

    // Form labels
    email: 'Email',
    fullName: 'Full Name',
    avatarUrl: 'Avatar URL',
    currency: 'Currency',
    language: 'Language',
    theme: 'Theme',

    // Options
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    english: 'English',
    arabic: 'Arabic',

    // Buttons
    save: 'Save',
    saveProfile: 'Save Profile',
    savePreferences: 'Save Preferences',
    exportData: 'Export My Data',
    deleteAccount: 'Delete Account',
    signOut: 'Sign Out',

    // Messages
    saving: 'Saving...',
    settingsSaved: 'Settings Saved',
    settingsSavedDesc: 'Your preferences have been updated successfully.',
    profileUpdated: 'Profile Updated',
    profileUpdatedDesc: 'Your profile has been updated successfully.',

    // Currencies
    usdDollar: 'USD - US Dollar',
    aedDirham: 'AED - UAE Dirham',
    sarRiyal: 'SAR - Saudi Riyal',
    qarRiyal: 'QAR - Qatari Riyal',
    kwdDinar: 'KWD - Kuwaiti Dinar',
    bhdDinar: 'BHD - Bahraini Dinar',
    omrRial: 'OMR - Omani Rial',
    jodDinar: 'JOD - Jordanian Dinar',
    egpPound: 'EGP - Egyptian Pound',

    // Dashboard Finance Overview
    personalFinances: 'Personal Finances',
    monthlyIncome: 'Monthly Income',
    monthlyExpenses: 'Monthly Expenses',
    monthlyInvesting: 'Monthly Investing',
    freeMonthlyC: 'Free Monthly Cash',
    totalDebt: 'Total Debt',

    // Portfolio
    portfolioSummary: 'Portfolio Summary',
    totalValue: 'Total Value',
    totalGains: 'Total Gains',
    assetAllocation: 'Asset Allocation',
    geographicDistribution: 'Geographic Distribution',
    topPerformer: 'Top Performer',
    worstPerformer: 'Worst Performer',
    holdings: 'Holdings',

    // AI Agent
    askQuestion: 'Ask me anything about your finances...',
    send: 'Send',
    newChat: 'New Chat',
    chatHistory: 'Chat History',

    // Portfolio Table
    asset: 'Asset',
    type: 'Type',
    quantity: 'Quantity',
    value: 'Value',
    change: 'Change',
    actions: 'Actions',
    edit: 'Edit',
    analyze: 'Analyze',
    delete: 'Delete',
    noAssets: 'No assets in portfolio',

    // Portfolio Goals
    investmentGoals: 'Investment Goals',
    portfolioTargets: 'Portfolio Targets',
    addGoal: 'Add Goal',
    progress: 'Progress',
    targetValue: 'Target Value',
    currentValue: 'Current Value',
    remainingAmount: 'Remaining',
    targetDate: 'Target Date',

    // Editable Finance Card
    amount: 'Amount',
    enterAmount: 'Enter amount',
    cancel: 'Cancel',

    // Personal Finances
    activeDebts: 'Active Debts',
    addDebt: 'Add Debt',
    debtName: 'Debt Name',
    totalAmount: 'Total Amount',
    paidAmount: 'Paid Amount',
    monthlyPayment: 'Monthly Payment',
    interestRate: 'Interest Rate',
    durationMonths: 'Duration (Months)',
    startDate: 'Start Date',
    addNewDebt: 'Add New Debt',
    editDebt: 'Edit Debt',
    paid: 'Paid',
    debtRemaining: 'Remaining',
    incomeStreams: 'Income Streams',
    addIncome: 'Add Income',
    incomeName: 'Income Name',
    incomeType: 'Income Type',
    salary: 'Salary',
    stableMonthly: 'Stable Monthly',
    oneTime: 'One-time',
    receivedDate: 'Received Date',
    expenseStreams: 'Expense Streams',
    addExpense: 'Add Expense',
    expenseName: 'Expense Name',
    expenseType: 'Expense Type',
    fixedMonthly: 'Fixed Monthly',
    variableMonthly: 'Variable Monthly',
    expenseDate: 'Expense Date',
    active: 'Active',
    inactive: 'Inactive',

    // Portfolio Manager
    addInvestment: 'Add Investment',
    selectAssetType: 'Select Asset Type',
    searchAssets: 'Search for assets...',
    stocks: 'Stocks',
    etfs: 'ETFs',
    crypto: 'Cryptocurrencies',
    bonds: 'Bonds',
    realEstate: 'Real Estate',
    gold: 'Gold',
    currencies: 'Currencies',
    enterDetails: 'Enter Investment Details',
    purchaseDetails: 'Purchase Details',
    purchasePrice: 'Purchase Price',
    purchaseDate: 'Purchase Date',
    selectDate: 'Select date',
    propertyArea: 'Property Area (sqm)',
    saveInvestment: 'Save Investment',
    addingInvestment: 'Adding Investment...',
    back: 'Back',
    next: 'Next',
    investmentAdded: 'Investment Added',
    investmentAddedSuccess: 'Your investment has been added successfully',
    errorAddingInvestment: 'Error adding investment',

    // Portfolio Page Additional
    loadingPortfolio: 'Loading portfolio...',
    portfolioAccess: 'Portfolio Access',
    pleaseSignIn: 'Please sign in to view your portfolio.',
    errorLoadingPortfolio: 'Error Loading Portfolio',
    tryAgain: 'Try Again',
    manageInvestments: 'Manage your investments and track performance',
    totalPortfolioValue: 'Total Portfolio Value',
    overallReturn: 'overall return',
    totalGainsLoss: 'Total Gains/Loss',
    return: 'return',
    activeGoals: 'Active Goals',
    portfolioAnalysis: 'Portfolio Analysis',
    totalAssets: 'Total Assets',
    portfolioReturn: 'Portfolio Return',
    assetTypeBreakdown: 'Asset Type Breakdown',
    performanceInsights: 'Performance Insights',
    best: 'Best',
    worst: 'Worst',
    aiRecommendations: 'AI Recommendations',
    setGoalsAdvice: 'Set financial goals to get personalized advice',
    diversifyAdvice: 'Consider diversifying with more asset types',
    reviewUnderperforming: 'Review underperforming assets',
    addDifferentAssets: 'Add different asset classes for better diversification',
    startInvestmentJourney: 'Start Your Investment Journey',
    addFirstInvestment: 'Add your first investment to begin tracking your portfolio performance',
    addYourFirstInvestment: 'Add Your First Investment',

    // Settings Page Additional
    managePreferences: 'Manage your account preferences and privacy settings',
    job: 'Job/Occupation',
    jobPlaceholder: 'e.g., Software Engineer, Doctor, Teacher',
    error: 'Error',
    failedUpdateProfile: 'Failed to update profile.',
    failedSaveSettings: 'Failed to save settings.',

    // Portfolio Table Additional
    country: 'Country',
    avgPrice: 'Avg Price',
    currentPrice: 'Current Price',
    marketValue: 'Market Value',
    gainLoss: 'Gain/Loss',
    analyzing: 'Analyzing...',
    editAsset: 'Edit Asset',
    assetRemoved: 'Asset Removed',
    assetRemovedDesc: 'has been removed from your portfolio.',
    unit: 'unit',
    emptyPortfolio: 'Your portfolio is empty',
    addInvestmentsToStart: 'Add some investments to get started.',

    // Portfolio Manager Additional
    browseSelectAssets: 'Browse & Select Assets',
    chooseFromRealData: 'Choose from real market data across MENA region',
    enterInvestmentDetails: 'Enter your investment details',
    numberOfProperties: 'Number of Properties',
    investmentAmount: 'Investment Amount',
    quantityShares: 'Quantity/Shares',
    enterQuantity: 'Enter quantity',
    areaSquareMeters: 'Area (Square Meters)',
    enterAreaSqm: 'Enter area in m²',
    purchasePricePerUnit: 'Purchase Price (per unit)',
    enterPurchasePrice: 'Enter purchase price',
    pickDate: 'Pick a date',
    totalInvestment: 'Total Investment',
    reviewInvestment: 'Review Investment',
    confirmDetails: 'Confirm your investment details',
    investmentSummary: 'Investment Summary',
    assetLabel: 'Asset',
    typeLabel: 'Type',
    quantityLabel: 'Quantity',
    areaLabel: 'Area',
    pricePerUnit: 'Price per Unit',
    totalPrice: 'Total Price',
    notSet: 'Not set',
    previous: 'Previous',
    savingAsset: 'Saving...',
    saveAsset: 'Save Asset',
    assetAdded: 'Asset Added Successfully!',
    assetAddedTo: 'has been added to your portfolio.',
    failedAddAsset: 'Failed to add asset. Please try again.',
    addNewInvestment: 'Add New Investment',

    // Dialog titles
    manageIncomeStreams: 'Manage Income Streams',
    manageExpenseStreams: 'Manage Expense Streams',
    manageDebts: 'Manage Debts',

    // Confirm messages
    confirmDelete: 'Are you sure you want to delete',
    fromPortfolio: 'from your portfolio?',

    // Dashboard
    aiFinancialAgent: 'AI Financial Agent',
    askAboutFinances: 'Ask about your finances...',

    // Portfolio Summary
    todaysGains: "Today's Gains",
    totalReturnLabel: 'Total Return',
    assetsCount: 'Assets',
    topHoldings: 'Top Holdings',
    noAssetsYet: 'No assets in your portfolio yet.',
    startAddingFirst: 'Start by adding your first investment!',
    noAssetsToDisplay: 'No assets to display allocation',

    // Portfolio Goals
    portfolioGoals: 'Portfolio Goals',
    manageGoals: 'Manage Goals',
    noPortfolioGoals: 'No Portfolio Goals Set',
    setPortfolioTargets: 'Set portfolio targets to track your investment progress',
    createFirstGoal: 'Create Your First Goal',
    loadingGoalsMsg: 'Loading goals...',
    currentLabel: 'Current',
    targetLabel: 'Target',
    remainingToGoal: 'remaining to reach goal',
    sectorAllocationTargets: 'Sector Allocation Targets',
    viewAllGoals: 'View All',
    goals: 'Goals',
    complete: 'complete',

    // Enhanced Portfolio Overview
    overview: 'Overview',
    allocation: 'Allocation',
    performance: 'Performance',
    riskAnalysis: 'Risk Analysis',
    portfolioValue: 'Portfolio Value',
    totalReturnCard: 'Total Return',
    allTime: 'all time',
    riskScore: 'Risk Score',
    moderateHighRisk: 'Moderate-High Risk',
    noAssetsInPortfolio: 'No assets in portfolio',
    addInvestmentsToSee: 'Add some investments to see your portfolio overview.',
    assetTypeDistribution: 'Asset Type Distribution',
    riskAssessment: 'Risk Assessment',

    // Performance metrics
    beta: 'Beta',
    alpha: 'Alpha',
    volatility: 'Volatility',
    maxDrawdown: 'Max Drawdown',
    marketSensitivity: 'Market sensitivity',
    excessReturn: 'Excess return',
    standardDeviation: 'Standard deviation',
    largestLoss: 'Largest loss',

    // Risk indicators
    concentrationRisk: 'Concentration Risk',
    currencyRisk: 'Currency Risk',
    sectorRisk: 'Sector Risk',
    liquidityRisk: 'Liquidity Risk',
    high: 'High',
    medium: 'Medium',
    low: 'Low',

    // Financial Goals section
    financialGoals: 'Financial Goals',
    newGoal: 'New Goal',
    monthlySaving: 'Monthly saving',

    // Savings section
    savings: 'Savings',
    addSavings: 'Add Savings',
    totalSavingsValue: 'Total Savings Value',
    investmentLinked: 'Investment Linked',
    started: 'Started',

    // Debts section
    activeDebtsSection: 'Active Debts',
    noDebtsRecorded: 'No debts recorded. Click "Add Debt" to get started.',

    // Holdings table
    holdingsLabel: 'Holdings'
  },
  ar: {
    // Navigation
    dashboard: 'لوحة التحكم',
    portfolio: 'المحفظة الاستثمارية',
    finances: 'الشؤون المالية',
    assistant: 'المساعد الذكي',
    analytics: 'التحليلات',
    settings: 'الإعدادات',
    news: 'الأخبار',

    // Dashboard
    welcome: 'مرحباً بك في أناكين',
    personalFinancialManager: 'مديرك المالي الشخصي الذكي',
    dashboardOverview: 'نظرة عامة',
    yourFinancialOverview: 'ملخص وضعك المالي الحالي',
    allRightsReserved: 'جميع الحقوق محفوظة',

    // Portfolio
    portfolioManagement: 'إدارة المحفظة الاستثمارية',
    trackYourInvestments: 'تتبع وإدارة استثماراتك',

    // Finances
    financialManagement: 'إدارة الشؤون المالية',
    trackIncomeExpenses: 'تتبع دخلك ومصروفاتك وأهدافك المالية',

    // Settings
    profileInformation: 'معلومات الملف الشخصي',
    preferences: 'التفضيلات',
    notifications: 'الإشعارات',
    privacySecurity: 'الخصوصية والأمان',
    accountActions: 'إجراءات الحساب',

    // Form labels
    email: 'البريد الإلكتروني',
    fullName: 'الاسم الكامل',
    avatarUrl: 'رابط الصورة الشخصية',
    currency: 'العملة',
    language: 'اللغة',
    theme: 'النمط',

    // Options
    light: 'فاتح',
    dark: 'داكن',
    system: 'النظام',
    english: 'English',
    arabic: 'العربية',

    // Buttons
    save: 'حفظ',
    saveProfile: 'حفظ الملف الشخصي',
    savePreferences: 'حفظ التفضيلات',
    exportData: 'تصدير بياناتي',
    deleteAccount: 'حذف الحساب',
    signOut: 'تسجيل الخروج',

    // Messages
    saving: 'جاري الحفظ...',
    settingsSaved: 'تم حفظ الإعدادات',
    settingsSavedDesc: 'تم تحديث تفضيلاتك بنجاح.',
    profileUpdated: 'تم تحديث الملف الشخصي',
    profileUpdatedDesc: 'تم تحديث ملفك الشخصي بنجاح.',

    // Currencies
    usdDollar: 'دولار أمريكي - USD',
    aedDirham: 'درهم إماراتي - AED',
    sarRiyal: 'ريال سعودي - SAR',
    qarRiyal: 'ريال قطري - QAR',
    kwdDinar: 'دينار كويتي - KWD',
    bhdDinar: 'دينار بحريني - BHD',
    omrRial: 'ريال عماني - OMR',
    jodDinar: 'دينار أردني - JOD',
    egpPound: 'جنيه مصري - EGP',

    // Dashboard Finance Overview
    personalFinances: 'الشؤون المالية الشخصية',
    monthlyIncome: 'الدخل الشهري',
    monthlyExpenses: 'المصروفات الشهرية',
    monthlyInvesting: 'الاستثمار الشهري',
    freeMonthlyC: 'النقدية الشهرية المتاحة',
    totalDebt: 'إجمالي الديون',

    // Portfolio
    portfolioSummary: 'ملخص المحفظة الاستثمارية',
    totalValue: 'القيمة الإجمالية',
    totalGains: 'إجمالي الأرباح',
    assetAllocation: 'توزيع الأصول',
    geographicDistribution: 'التوزيع الجغرافي',
    topPerformer: 'أفضل أداء',
    worstPerformer: 'أسوأ أداء',
    holdings: 'الممتلكات',

    // AI Agent
    askQuestion: 'اسألني أي شيء عن شؤونك المالية...',
    send: 'إرسال',
    newChat: 'محادثة جديدة',
    chatHistory: 'سجل المحادثات',

    // Portfolio Table
    asset: 'الأصل',
    type: 'النوع',
    quantity: 'الكمية',
    value: 'القيمة',
    change: 'التغيير',
    actions: 'الإجراءات',
    edit: 'تعديل',
    analyze: 'تحليل',
    delete: 'حذف',
    noAssets: 'لا توجد أصول في المحفظة',

    // Portfolio Goals
    investmentGoals: 'الأهداف الاستثمارية',
    portfolioTargets: 'أهداف المحفظة',
    addGoal: 'إضافة هدف',
    progress: 'التقدم',
    targetValue: 'القيمة المستهدفة',
    currentValue: 'القيمة الحالية',
    remainingAmount: 'المتبقي',
    targetDate: 'التاريخ المستهدف',

    // Editable Finance Card
    amount: 'المبلغ',
    enterAmount: 'أدخل المبلغ',
    cancel: 'إلغاء',

    // Personal Finances
    activeDebts: 'الديون النشطة',
    addDebt: 'إضافة دين',
    debtName: 'اسم الدين',
    totalAmount: 'المبلغ الإجمالي',
    paidAmount: 'المبلغ المدفوع',
    monthlyPayment: 'القسط الشهري',
    interestRate: 'معدل الفائدة',
    durationMonths: 'المدة (بالأشهر)',
    startDate: 'تاريخ البدء',
    addNewDebt: 'إضافة دين جديد',
    editDebt: 'تعديل الدين',
    paid: 'مدفوع',
    debtRemaining: 'المتبقي',
    incomeStreams: 'مصادر الدخل',
    addIncome: 'إضافة دخل',
    incomeName: 'اسم الدخل',
    incomeType: 'نوع الدخل',
    salary: 'راتب',
    stableMonthly: 'دخل شهري ثابت',
    oneTime: 'دخل مرة واحدة',
    receivedDate: 'تاريخ الاستلام',
    expenseStreams: 'المصروفات',
    addExpense: 'إضافة مصروف',
    expenseName: 'اسم المصروف',
    expenseType: 'نوع المصروف',
    fixedMonthly: 'مصروف شهري ثابت',
    variableMonthly: 'مصروف شهري متغير',
    expenseDate: 'تاريخ المصروف',
    active: 'نشط',
    inactive: 'غير نشط',

    addInvestment: 'أضف استثمار',
    selectAssetType: 'اختر نوع الأصل',
    searchAssets: 'ابحث عن الأصول...',
    stocks: 'الأسهم',
    etfs: 'صناديق المؤشرات',
    crypto: 'العملات الرقمية',
    bonds: 'السندات',
    realEstate: 'العقارات',
    gold: 'الذهب',
    currencies: 'العملات',
    enterDetails: 'أدخل تفاصيل الاستثمار',
    purchaseDetails: 'تفاصيل الشراء',
    purchasePrice: 'سعر الشراء',
    purchaseDate: 'تاريخ الشراء',
    selectDate: 'اختر التاريخ',
    propertyArea: 'مساحة العقار (متر مربع)',
    saveInvestment: 'حفظ الاستثمار',
    addingInvestment: 'جاري إضافة الاستثمار...',
    back: 'رجوع',
    next: 'التالي',
    investmentAdded: 'تم إضافة الاستثمار',
    investmentAddedSuccess: 'تم إضافة استثمارك بنجاح',
    errorAddingInvestment: 'فيه مشكلة في إضافة الاستثمار',

    // Portfolio Page Additional
    loadingPortfolio: 'بيحمّل المحفظة...',
    portfolioAccess: 'الدخول للمحفظة',
    pleaseSignIn: 'لازم تسجل دخول الأول عشان تشوف محفظتك',
    errorLoadingPortfolio: 'فيه مشكلة في تحميل المحفظة',
    tryAgain: 'حاول تاني',
    manageInvestments: 'تابع استثماراتك وشوف أدائها',
    totalPortfolioValue: 'إجمالي قيمة المحفظة',
    overallReturn: 'العائد الكلي',
    totalGainsLoss: 'المكسب/الخسارة',
    return: 'العائد',
    activeGoals: 'الأهداف النشطة',
    portfolioAnalysis: 'تحليل المحفظة',
    totalAssets: 'إجمالي الأصول',
    portfolioReturn: 'عائد المحفظة',
    assetTypeBreakdown: 'توزيع أنواع الأصول',
    performanceInsights: 'نظرة على الأداء',
    best: 'الأفضل',
    worst: 'الأسوأ',
    aiRecommendations: 'توصيات الذكاء الاصطناعي',
    setGoalsAdvice: 'حط أهدافك المالية عشان تاخد نصايح مخصصة ليك',
    diversifyAdvice: 'فكر تنوّع استثماراتك بأنواع أصول تانية',
    reviewUnderperforming: 'راجع الأصول اللي أداؤها ضعيف',
    addDifferentAssets: 'ضيف أنواع أصول مختلفة عشان تنوّع أحسن',
    startInvestmentJourney: 'ابدأ رحلتك الاستثمارية',
    addFirstInvestment: 'ضيف أول استثمار عشان تبدأ تتابع أداء محفظتك',
    addYourFirstInvestment: 'أضف أول استثمار',

    // Settings Page Additional
    managePreferences: 'إدارة إعدادات حسابك والخصوصية',
    job: 'الوظيفة',
    jobPlaceholder: 'مثال: مهندس، دكتور، معلم',
    error: 'خطأ',
    failedUpdateProfile: 'فشل تحديث الملف الشخصي',
    failedSaveSettings: 'فشل حفظ الإعدادات',

    // Portfolio Table Additional
    country: 'الدولة',
    avgPrice: 'متوسط السعر',
    currentPrice: 'السعر الحالي',
    marketValue: 'القيمة السوقية',
    gainLoss: 'المكسب/الخسارة',
    analyzing: 'جاري التحليل...',
    editAsset: 'تعديل الأصل',
    assetRemoved: 'تم حذف الأصل',
    assetRemovedDesc: 'تم حذفه من محفظتك',
    unit: 'وحدة',
    emptyPortfolio: 'محفظتك فاضية',
    addInvestmentsToStart: 'ضيف استثمارات عشان تبدأ',

    // Portfolio Manager Additional
    browseSelectAssets: 'تصفح واختار الأصول',
    chooseFromRealData: 'اختار من بيانات السوق الحقيقية في منطقة الشرق الأوسط',
    enterInvestmentDetails: 'أدخل تفاصيل استثمارك',
    numberOfProperties: 'عدد العقارات',
    investmentAmount: 'مبلغ الاستثمار',
    quantityShares: 'الكمية/الأسهم',
    enterQuantity: 'أدخل الكمية',
    areaSquareMeters: 'المساحة (متر مربع)',
    enterAreaSqm: 'أدخل المساحة بالمتر',
    purchasePricePerUnit: 'سعر الشراء (للوحدة)',
    enterPurchasePrice: 'أدخل سعر الشراء',
    pickDate: 'اختار التاريخ',
    totalInvestment: 'إجمالي الاستثمار',
    reviewInvestment: 'مراجعة الاستثمار',
    confirmDetails: 'تأكد من تفاصيل استثمارك',
    investmentSummary: 'ملخص الاستثمار',
    assetLabel: 'الأصل',
    typeLabel: 'النوع',
    quantityLabel: 'الكمية',
    areaLabel: 'المساحة',
    pricePerUnit: 'السعر للوحدة',
    totalPrice: 'السعر الإجمالي',
    notSet: 'غير محدد',
    previous: 'السابق',
    savingAsset: 'جاري الحفظ...',
    saveAsset: 'احفظ الأصل',
    assetAdded: 'تم إضافة الأصل بنجاح!',
    assetAddedTo: 'تم إضافته لمحفظتك',
    failedAddAsset: 'فشل إضافة الأصل. حاول تاني.',
    addNewInvestment: 'أضف استثمار جديد',

    // Dialog titles
    manageIncomeStreams: 'إدارة مصادر الدخل',
    manageExpenseStreams: 'إدارة المصروفات',
    manageDebts: 'إدارة الديون',

    // Confirm messages
    confirmDelete: 'متأكد إنك عايز تحذف',
    fromPortfolio: 'من محفظتك؟',

    // Dashboard
    aiFinancialAgent: 'المساعد المالي الذكي',
    askAboutFinances: 'اسأل عن شؤونك المالية...',

    // Portfolio Summary
    todaysGains: 'أرباح اليوم',
    totalReturnLabel: 'إجمالي العائد',
    assetsCount: 'الأصول',
    topHoldings: 'أفضل الممتلكات',
    noAssetsYet: 'لا توجد أصول في محفظتك بعد.',
    startAddingFirst: 'ابدأ بإضافة استثمارك الأول!',
    noAssetsToDisplay: 'لا توجد أصول لعرض التوزيع',

    // Portfolio Goals
    portfolioGoals: 'أهداف المحفظة',
    manageGoals: 'إدارة الأهداف',
    noPortfolioGoals: 'لا توجد أهداف للمحفظة',
    setPortfolioTargets: 'حط أهداف لمحفظتك عشان تتابع تقدمك',
    createFirstGoal: 'أنشئ هدفك الأول',
    loadingGoalsMsg: 'جاري تحميل الأهداف...',
    currentLabel: 'الحالي',
    targetLabel: 'الهدف',
    remainingToGoal: 'متبقي للوصول للهدف',
    sectorAllocationTargets: 'أهداف توزيع القطاعات',
    viewAllGoals: 'عرض الكل',
    goals: 'أهداف',
    complete: 'مكتمل',

    // Enhanced Portfolio Overview
    overview: 'نظرة عامة',
    allocation: 'التوزيع',
    performance: 'الأداء',
    riskAnalysis: 'تحليل المخاطر',
    portfolioValue: 'قيمة المحفظة',
    totalReturnCard: 'إجمالي العائد',
    allTime: 'منذ البداية',
    riskScore: 'مؤشر المخاطر',
    moderateHighRisk: 'مخاطر متوسطة-عالية',
    noAssetsInPortfolio: 'لا توجد أصول في المحفظة',
    addInvestmentsToSee: 'ضيف استثمارات عشان تشوف نظرة عامة على محفظتك.',
    assetTypeDistribution: 'توزيع أنواع الأصول',
    riskAssessment: 'تقييم المخاطر',

    // Performance metrics
    beta: 'بيتا',
    alpha: 'ألفا',
    volatility: 'التقلب',
    maxDrawdown: 'أقصى انخفاض',
    marketSensitivity: 'الحساسية للسوق',
    excessReturn: 'العائد الإضافي',
    standardDeviation: 'الانحراف المعياري',
    largestLoss: 'أكبر خسارة',

    // Risk indicators
    concentrationRisk: 'مخاطر التركز',
    currencyRisk: 'مخاطر العملة',
    sectorRisk: 'مخاطر القطاع',
    liquidityRisk: 'مخاطر السيولة',
    high: 'عالي',
    medium: 'متوسط',
    low: 'منخفض',

    // Financial Goals section
    financialGoals: 'الأهداف المالية',
    newGoal: 'هدف جديد',
    monthlySaving: 'التوفير الشهري',

    // Savings section
    savings: 'المدخرات',
    addSavings: 'إضافة مدخرات',
    totalSavingsValue: 'إجمالي قيمة المدخرات',
    investmentLinked: 'مرتبط بالاستثمار',
    started: 'بدأ في',

    // Debts section
    activeDebtsSection: 'الديون النشطة',
    noDebtsRecorded: 'لا توجد ديون مسجلة. اضغط "إضافة دين" للبدء.',

    // Holdings table
    holdingsLabel: 'الممتلكات'
  }
};

export const useTranslation = () => {
  const { settings } = useSettings();
  const currentLang = settings.language || 'en';

  const t = (key: string): string => {
    const translation = translations[currentLang as keyof typeof translations];
    return translation[key as keyof typeof translation] || key;
  };

  return { t, language: currentLang, isRTL: currentLang === 'ar' };
};