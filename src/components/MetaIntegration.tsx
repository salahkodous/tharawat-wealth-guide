import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Facebook, Instagram, Link2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface MetaAccount {
  id: string;
  account_name: string;
  platform: string;
  is_connected: boolean;
  last_sync: string | null;
}

interface MetaIntegrationProps {
  projectId: string;
}

const MetaIntegration = ({ projectId }: MetaIntegrationProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<MetaAccount[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [platform, setPlatform] = useState<string>('facebook');
  const [accountName, setAccountName] = useState('');

  useEffect(() => {
    fetchAccounts();
  }, [projectId]);

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('meta_accounts')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error: any) {
      console.error('Error fetching Meta accounts:', error);
    }
  };

  const handleConnect = async () => {
    if (!accountName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an account name',
        variant: 'destructive',
      });
      return;
    }

    setIsConnecting(true);
    try {
      const { data, error } = await supabase
        .from('meta_accounts')
        .insert([
          {
            project_id: projectId,
            user_id: user?.id,
            account_name: accountName,
            platform: platform,
            is_connected: false,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setAccounts([data, ...accounts]);
      setAccountName('');
      
      toast({
        title: 'Account Added',
        description: 'Meta account configuration saved. You can now add your API credentials.',
      });
    } catch (error: any) {
      console.error('Error connecting Meta account:', error);
      toast({
        title: 'Error',
        description: 'Failed to add Meta account',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return <Facebook className="h-4 w-4" />;
      case 'instagram':
        return <Instagram className="h-4 w-4" />;
      default:
        return <Facebook className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Facebook className="h-5 w-5" />
          Meta Integration
        </CardTitle>
        <CardDescription>Connect Facebook & Instagram accounts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <Label htmlFor="platform">Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger id="platform">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="account-name">Account Name</Label>
            <Input
              id="account-name"
              placeholder="My Business Account"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
            />
          </div>

          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full"
          >
            <Link2 className="h-4 w-4 mr-2" />
            {isConnecting ? 'Adding Account...' : 'Add Meta Account'}
          </Button>
        </div>

        {accounts.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-medium">Connected Accounts</h4>
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getPlatformIcon(account.platform)}
                  <div>
                    <p className="font-medium">{account.account_name}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {account.platform}
                    </p>
                  </div>
                </div>
                <Badge variant={account.is_connected ? 'default' : 'secondary'}>
                  {account.is_connected ? 'Connected' : 'Not Connected'}
                </Badge>
              </div>
            ))}
          </div>
        )}

        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            To complete the integration, you'll need to add your Meta API credentials and access tokens.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetaIntegration;
