import { useSettings } from '@/hooks/useSettings';

// Basic language display component for testing
export const LanguageDisplay = () => {
  const { settings } = useSettings();
  
  const getText = () => {
    if (settings.language === 'ar') {
      return {
        welcome: 'مرحباً بك في ثروات',
        dashboard: 'لوحة القيادة',
        portfolio: 'المحفظة الاستثمارية',
        finances: 'الشؤون المالية',
        settings: 'الإعدادات'
      };
    } else {
      return {
        welcome: 'Welcome to Tharawat',
        dashboard: 'Dashboard',
        portfolio: 'Portfolio', 
        finances: 'Finances',
        settings: 'Settings'
      };
    }
  };

  return (
    <div className={`text-sm text-muted-foreground ${settings.language === 'ar' ? 'text-right' : 'text-left'}`}>
      Language: {settings.language === 'ar' ? 'العربية' : 'English'}
    </div>
  );
};