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
  Monitor
} from 'lucide-react';

const Settings = () => {
  const { user, signOut } = useAuth();
  const { currency } = useCurrency();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState({
    full_name: '',
    avatar_url: ''
  });
  
  const [preferences, setPreferences] = useState({
    currency: 'USD',
    language: 'en',
    theme: 'system',
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    privacy: {
      profileVisibility: 'private',
      dataSharing: false
    }
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          avatar_url: data.avatar_url || ''
        });
      }
      
      // Set currency from user metadata
      if (user?.user_metadata?.currency) {
        setPreferences(prev => ({
          ...prev,
          currency: user.user_metadata.currency
        }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
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
        title: "Profile Updated",
        description: "Your profile has been updated successfully."
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

  const exportData = () => {
    toast({
      title: "Data Export Started",
      description: "Your data export will be sent to your email shortly."
    });
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10">
        <Navigation />
        
        <section className="py-8">
          <div className="container mx-auto px-4 max-w-4xl space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Settings</h1>
              <p className="text-muted-foreground">Manage your account preferences and privacy settings</p>
            </div>

            {/* Profile Settings */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-secondary/50"
                  />
                </div>
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="avatar_url">Avatar URL</Label>
                  <Input
                    id="avatar_url"
                    value={profile.avatar_url}
                    onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
                <Button onClick={saveProfile} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Profile'}
                </Button>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={preferences.currency} onValueChange={(value) => 
                      setPreferences({ ...preferences, currency: value })
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                        <SelectItem value="SAR">SAR - Saudi Riyal</SelectItem>
                        <SelectItem value="QAR">QAR - Qatari Riyal</SelectItem>
                        <SelectItem value="KWD">KWD - Kuwaiti Dinar</SelectItem>
                        <SelectItem value="BHD">BHD - Bahraini Dinar</SelectItem>
                        <SelectItem value="OMR">OMR - Omani Rial</SelectItem>
                        <SelectItem value="JOD">JOD - Jordanian Dinar</SelectItem>
                        <SelectItem value="EGP">EGP - Egyptian Pound</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select value={preferences.language} onValueChange={(value) => 
                      setPreferences({ ...preferences, language: value })
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ar">العربية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={preferences.theme} onValueChange={(value) => 
                    setPreferences({ ...preferences, theme: value })
                  }>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch 
                    checked={preferences.notifications.email}
                    onCheckedChange={(checked) => 
                      setPreferences({
                        ...preferences,
                        notifications: { ...preferences.notifications, email: checked }
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Browser push notifications</p>
                  </div>
                  <Switch 
                    checked={preferences.notifications.push}
                    onCheckedChange={(checked) => 
                      setPreferences({
                        ...preferences,
                        notifications: { ...preferences.notifications, push: checked }
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Important alerts via SMS</p>
                  </div>
                  <Switch 
                    checked={preferences.notifications.sms}
                    onCheckedChange={(checked) => 
                      setPreferences({
                        ...preferences,
                        notifications: { ...preferences.notifications, sms: checked }
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Privacy & Security */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Privacy & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Data Sharing</Label>
                    <p className="text-sm text-muted-foreground">Share anonymized data for research</p>
                  </div>
                  <Switch 
                    checked={preferences.privacy.dataSharing}
                    onCheckedChange={(checked) => 
                      setPreferences({
                        ...preferences,
                        privacy: { ...preferences.privacy, dataSharing: checked }
                      })
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <Button variant="outline" onClick={exportData} className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Export My Data
                  </Button>
                  
                  <Button variant="destructive" onClick={deleteAccount} className="w-full justify-start">
                    <Shield className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Account Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={signOut} className="w-full">
                  Sign Out
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