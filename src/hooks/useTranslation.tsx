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
    remaining: 'Remaining',
    targetDate: 'Target Date',
    
    // Editable Finance Card
    amount: 'Amount',
    enterAmount: 'Enter amount',
    cancel: 'Cancel'
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
    remaining: 'المتبقي',
    targetDate: 'التاريخ المستهدف',
    
    // Editable Finance Card
    amount: 'المبلغ',
    enterAmount: 'أدخل المبلغ',
    cancel: 'إلغاء'
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