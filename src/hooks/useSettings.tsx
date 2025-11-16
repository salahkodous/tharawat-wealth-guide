import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface UserSettings {
  currency: string;
  language: string;
  theme: string;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  data_sharing: boolean;
  profile_visibility: string;
}

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: UserSettings = {
  currency: 'EGP',
  language: 'ar',
  theme: 'dark',
  email_notifications: true,
  push_notifications: true,
  sms_notifications: false,
  data_sharing: false,
  profile_visibility: 'private'
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);

  const refreshSettings = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setSettings({
          currency: data.currency || defaultSettings.currency,
          language: data.language || defaultSettings.language,
          theme: data.theme || defaultSettings.theme,
          email_notifications: data.email_notifications ?? defaultSettings.email_notifications,
          push_notifications: data.push_notifications ?? defaultSettings.push_notifications,
          sms_notifications: data.sms_notifications ?? defaultSettings.sms_notifications,
          data_sharing: data.data_sharing ?? defaultSettings.data_sharing,
          profile_visibility: data.profile_visibility || defaultSettings.profile_visibility
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    // Immediately update database for fast sync
    if (user) {
      try {
        await supabase
          .from('user_settings')
          .upsert({ 
            user_id: user.id, 
            ...updatedSettings 
          });
      } catch (error) {
        console.error('Error updating settings:', error);
      }
    }
  };

  useEffect(() => {
    refreshSettings();
  }, [user]);

  const value = {
    settings,
    updateSettings,
    refreshSettings
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};