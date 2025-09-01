import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';
import { useSettings } from '@/hooks/useSettings';
import { useTheme } from 'next-themes';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import AnimatedBackground from '@/components/AnimatedBackground';
import Navigation from '@/components/Navigation';
import { 
  User, 
  Globe, 
  DollarSign, 
  Bell, 
  Shield, 
  Download,
  Palette,
  Monitor,
  Save
} from 'lucide-react';

const Settings = () => {
  const { user, signOut } = useAuth();
  const { currency } = useCurrency();
  const { toast } = useToast();
  const { settings, updateSettings, refreshSettings } = useSettings();
  const { setTheme, theme } = useTheme();
  const { t, isRTL } = useTranslation();
  
  const [profile, setProfile] = useState({
    full_name: '',
    avatar_url: ''
  });
  
  // Initialize preferences from settings context
  const [preferences, setPreferences] = useState({
    currency: settings.currency,
    language: settings.language,
    theme: settings.theme,
    notifications: {
      email: settings.email_notifications,
      push: settings.push_notifications,
      sms: settings.sms_notifications
    },
    privacy: {
      profileVisibility: settings.profile_visibility,
      dataSharing: settings.data_sharing
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  // Update local preferences when settings change
  useEffect(() => {
    setPreferences({
      currency: settings.currency,
      language: settings.language,
      theme: settings.theme,
      notifications: {
        email: settings.email_notifications,
        push: settings.push_notifications,
        sms: settings.sms_notifications
      },
      privacy: {
        profileVisibility: settings.profile_visibility,
        dataSharing: settings.data_sharing
      }
    });
  }, [settings]);

  const loadProfile = async () => {
    try {
      // Load profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error loading profile:', profileError);
      }

      if (profileData) {
        setProfile({
          full_name: profileData.full_name || '',
          avatar_url: profileData.avatar_url || ''
        });
      }

      // Load user settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (settingsError) {
        console.error('Error loading settings:', settingsError);
      }

      if (settingsData) {
        setPreferences({
          currency: settingsData.currency || 'USD',
          language: settingsData.language || 'en',
          theme: settingsData.theme || 'system',
          notifications: {
            email: settingsData.email_notifications ?? true,
            push: settingsData.push_notifications ?? true,
            sms: settingsData.sms_notifications ?? false
          },
          privacy: {
            profileVisibility: settingsData.profile_visibility || 'private',
            dataSharing: settingsData.data_sharing ?? false
          }
        });
      } else {
        // Initialize default settings if none exist
        await saveSettings(preferences);
      }
    } catch (error) {
      console.error('Error loading profile and settings:', error);
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url
        });

      if (error) throw error;

      toast({
        title: t('profileUpdated'),
        description: t('profileUpdatedDesc')
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (settingsToSave = preferences) => {
    if (!user) return;
    
    setSavingSettings(true);
    try {
      // Check if settings exist first
      const { data: existingSettings } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      const settingsData = {
        currency: settingsToSave.currency,
        language: settingsToSave.language,
        theme: settingsToSave.theme,
        email_notifications: settingsToSave.notifications.email,
        push_notifications: settingsToSave.notifications.push,
        sms_notifications: settingsToSave.notifications.sms,
        data_sharing: settingsToSave.privacy.dataSharing,
        profile_visibility: settingsToSave.privacy.profileVisibility
      };

      let settingsError;
      if (existingSettings) {
        // Update existing record
        const { error } = await supabase
          .from('user_settings')
          .update(settingsData)
          .eq('user_id', user.id);
        settingsError = error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('user_settings')
          .insert({ ...settingsData, user_id: user.id });
        settingsError = error;
      }

      if (settingsError) throw settingsError;

      // Update the settings context with new values
      updateSettings({
        currency: settingsToSave.currency,
        language: settingsToSave.language,
        theme: settingsToSave.theme,
        email_notifications: settingsToSave.notifications.email,
        push_notifications: settingsToSave.notifications.push,
        sms_notifications: settingsToSave.notifications.sms,
        data_sharing: settingsToSave.privacy.dataSharing,
        profile_visibility: settingsToSave.privacy.profileVisibility
      });

      // Update user metadata for currency (so useCurrency hook works)
      try {
        await supabase.auth.updateUser({
          data: { currency: settingsToSave.currency }
        });
      } catch (userError) {
        console.warn('Could not update user metadata:', userError);
        // Don't throw here as the main settings were saved successfully
      }

      // Apply theme immediately
      setTheme(settingsToSave.theme);

      setHasUnsavedChanges(false);
      toast({
        title: t('settingsSaved'), 
        description: t('settingsSavedDesc')
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive"
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const updatePreferences = (newPreferences: typeof preferences) => {
    setPreferences(newPreferences);
    setHasUnsavedChanges(true);
    
    // Apply theme change immediately
    if (newPreferences.theme !== preferences.theme) {
      setTheme(newPreferences.theme);
    }
  };

  const exportData = async () => {
    if (!user) return;
    
    try {
      // Get all user data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id);
      
      const { data: settingsData } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id);

      const { data: financesData } = await supabase
        .from('personal_finances')
        .select('*')
        .eq('user_id', user.id);

      const exportData = {
        profile: profileData,
        settings: settingsData,
        finances: financesData,
        exported_at: new Date().toISOString()
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tharawat-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Data Export Complete",
        description: "Your data has been downloaded successfully."
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export your data.",
        variant: "destructive"
      });
    }
  };

  const deleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      toast({
        title: "Account Deletion",
        description: "Please contact support to delete your account.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className={`min-h-screen bg-background relative overflow-hidden ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <AnimatedBackground />
      
      <div className="relative z-10">
        <Navigation />
        
        <section className="py-8">
          <div className="container mx-auto px-4 max-w-4xl space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">{t('settings')}</h1>
              <p className="text-muted-foreground">Manage your account preferences and privacy settings</p>
            </div>

            {/* Profile Settings */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {t('profileInformation')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">{t('email')}</Label>
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-secondary/50"
                  />
                </div>
                <div>
                  <Label htmlFor="full_name">{t('fullName')}</Label>
                  <Input
                    id="full_name"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    placeholder={t('fullName')}
                  />
                </div>
                <div>
                  <Label htmlFor="avatar_url">{t('avatarUrl')}</Label>
                  <Input
                    id="avatar_url"
                    value={profile.avatar_url}
                    onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
                <Button onClick={saveProfile} disabled={loading}>
                  {loading ? t('saving') : t('saveProfile')}
                </Button>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  {t('preferences')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currency">{t('currency')}</Label>
                    <Select value={preferences.currency} onValueChange={(value) => 
                      updatePreferences({ ...preferences, currency: value })
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">{t('usdDollar')}</SelectItem>
                        <SelectItem value="AED">{t('aedDirham')}</SelectItem>
                        <SelectItem value="SAR">{t('sarRiyal')}</SelectItem>
                        <SelectItem value="QAR">{t('qarRiyal')}</SelectItem>
                        <SelectItem value="KWD">{t('kwdDinar')}</SelectItem>
                        <SelectItem value="BHD">{t('bhdDinar')}</SelectItem>
                        <SelectItem value="OMR">{t('omrRial')}</SelectItem>
                        <SelectItem value="JOD">{t('jodDinar')}</SelectItem>
                        <SelectItem value="EGP">{t('egpPound')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="language">{t('language')}</Label>
                    <Select value={preferences.language} onValueChange={(value) => 
                      updatePreferences({ ...preferences, language: value })
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">{t('english')}</SelectItem>
                        <SelectItem value="ar">{t('arabic')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="theme">{t('theme')}</Label>
                  <Select value={preferences.theme} onValueChange={(value) => 
                    updatePreferences({ ...preferences, theme: value })
                  }>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">{t('light')}</SelectItem>
                      <SelectItem value="dark">{t('dark')}</SelectItem>
                      <SelectItem value="system">{t('system')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={() => saveSettings()} 
                  disabled={savingSettings || !hasUnsavedChanges}
                  className="w-full md:w-auto"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {savingSettings ? t('saving') : t('savePreferences')}
                </Button>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>{t('accountActions')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={signOut} className="w-full">
                  {t('signOut')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;