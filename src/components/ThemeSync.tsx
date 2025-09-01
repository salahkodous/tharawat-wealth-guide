import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useSettings } from '@/hooks/useSettings';

export const ThemeSync = () => {
  const { setTheme, theme } = useTheme();
  const { settings } = useSettings();

  useEffect(() => {
    if (settings.theme && settings.theme !== theme) {
      setTheme(settings.theme);
    }
  }, [settings.theme, setTheme, theme]);

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