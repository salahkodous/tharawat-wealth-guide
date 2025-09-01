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
    
    // Dashboard
    welcome: 'Welcome to Tharawat',
    personalFinancialManager: 'Your Super Personal Financial Manager',
    
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
    egpPound: 'EGP - Egyptian Pound'
  },
  ar: {
    // Navigation
    dashboard: 'لوحة القيادة',
    portfolio: 'المحفظة الاستثمارية',
    finances: 'الشؤون المالية',
    assistant: 'المساعد الذكي',
    analytics: 'التحليلات',
    settings: 'الإعدادات',
    
    // Dashboard
    welcome: 'مرحباً بك في ثروات',
    personalFinancialManager: 'مديرك المالي الشخصي المتميز',
    
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
    egpPound: 'جنيه مصري - EGP'
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