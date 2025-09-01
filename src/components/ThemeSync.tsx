import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useSettings } from '@/hooks/useSettings';

export const ThemeSync = () => {
  const { setTheme } = useTheme();
  const { settings } = useSettings();

  useEffect(() => {
    if (settings.theme) {
      setTheme(settings.theme);
    }
  }, [settings.theme, setTheme]);

  return null;
};