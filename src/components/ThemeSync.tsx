import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useSettings } from '@/hooks/useSettings';

export const ThemeSync = () => {
  const { setTheme } = useTheme();
  const { settings } = useSettings();

  useEffect(() => {
    // Force dark mode only
    setTheme('dark');
    
    // Set default direction to RTL for Arabic
    const html = document.documentElement;
    html.setAttribute('dir', 'rtl');
    html.setAttribute('lang', 'ar');
  }, [setTheme]);

  // Apply language direction
  useEffect(() => {
    const html = document.documentElement;
    if (settings.language === 'ar') {
      html.setAttribute('dir', 'rtl');
      html.setAttribute('lang', 'ar');
    } else {
      html.setAttribute('dir', 'ltr');
      html.setAttribute('lang', 'en');
    }
  }, [settings.language]);

  return null;
};