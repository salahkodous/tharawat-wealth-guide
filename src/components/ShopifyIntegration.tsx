import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Store, Link2, RefreshCw, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ShopifyStore {
  id: string;
  store_name: string;
  store_url: string;
  is_connected: boolean;
  last_sync: string | null;
}

interface ShopifyIntegrationProps {
  projectId: string;
}

const ShopifyIntegration = ({ projectId }: ShopifyIntegrationProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [store, setStore] = useState<ShopifyStore | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [storeUrl, setStoreUrl] = useState('');
  const [productCount, setProductCount] = useState<number | null>(null);

  useEffect(() => {
    fetchStore();
    
    // Check for OAuth callback
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const shop = params.get('shop');
    
    if (code && shop && store && !store.is_connected) {
      handleOAuthCallback(code, shop);
    }
  }, [projectId]);

  const fetchStore = async () => {
    try {
      const { data, error } = await supabase
        .from('shopify_stores')
        .select('*')
        .eq('project_id', projectId)
        .maybeSingle();

      if (error) throw error;
      setStore(data);
    } catch (error: any) {
      console.error('Error fetching Shopify store:', error);
    }
  };

  const handleConnect = async () => {
    if (!storeUrl.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your Shopify store URL',
        variant: 'destructive',
      });
      return;
    }

    setIsConnecting(true);
    try {
      // First, save the store to database
      const { data, error } = await supabase
        .from('shopify_stores')
        .insert([
          {
            project_id: projectId,
            user_id: user?.id,
            store_name: storeUrl.split('.')[0],
            store_url: storeUrl,
            is_connected: false,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setStore(data);

      // Get OAuth URL from edge function
      const { data: authData, error: authError } = await supabase.functions.invoke(
        'shopify-integration',
        {
          body: {
            action: 'getAuthUrl',
            storeUrl: storeUrl,
          },
        }
      );

      if (authError) throw authError;

      // Redirect to Shopify OAuth
      window.location.href = authData.authUrl;
      
    } catch (error: any) {
      console.error('Error connecting Shopify store:', error);
      toast({
        title: 'Error',
        description: 'Failed to initiate Shopify connection',
        variant: 'destructive',
      });
      setIsConnecting(false);
    }
  };

  const handleOAuthCallback = async (code: string, shop: string) => {
    try {
      const { error } = await supabase.functions.invoke('shopify-integration', {
        body: {
          action: 'exchangeToken',
          code: code,
          storeUrl: shop,
          projectId: projectId,
          userId: user?.id,
        },
      });

      if (error) throw error;

      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
      
      toast({
        title: 'Success',
        description: 'Shopify store connected successfully!',
      });

      fetchStore();
    } catch (error: any) {
      console.error('OAuth callback error:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete Shopify connection',
        variant: 'destructive',
      });
    }
  };

  const handleInitiateOAuth = async () => {
    if (!store) return;
    
    setIsConnecting(true);
    try {
      const { data: authData, error: authError } = await supabase.functions.invoke(
        'shopify-integration',
        {
          body: {
            action: 'getAuthUrl',
            storeUrl: store.store_url,
          },
        }
      );

      if (authError) throw authError;

      // Redirect to Shopify OAuth
      window.location.href = authData.authUrl;
    } catch (error: any) {
      console.error('Error initiating OAuth:', error);
      toast({
        title: 'Error',
        description: 'Failed to connect to Shopify',
        variant: 'destructive',
      });
      setIsConnecting(false);
    }
  };

  const handleSyncProducts = async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('shopify-integration', {
        body: {
          action: 'syncProducts',
          projectId: projectId,
          userId: user?.id,
        },
      });

      if (error) throw error;

      setProductCount(data.count);
      
      toast({
        title: 'Sync Complete',
        description: `Successfully synced ${data.count} products from Shopify`,
      });
    } catch (error: any) {
      console.error('Sync error:', error);
      toast({
        title: 'Error',
        description: 'Failed to sync products from Shopify',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          Shopify Integration
        </CardTitle>
        <CardDescription>Connect your Shopify store</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!store ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="shopify-url">Store URL</Label>
              <Input
                id="shopify-url"
                placeholder="your-store.myshopify.com"
                value={storeUrl}
                onChange={(e) => setStoreUrl(e.target.value)}
              />
            </div>
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full"
            >
              <Link2 className="h-4 w-4 mr-2" />
              {isConnecting ? 'Adding Store...' : 'Add Shopify Store'}
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">{store.store_name}</p>
                <p className="text-sm text-muted-foreground">{store.store_url}</p>
              </div>
              <Badge variant={store.is_connected ? 'default' : 'secondary'}>
                {store.is_connected ? 'Connected' : 'Pending'}
              </Badge>
            </div>

            {store.is_connected ? (
              <>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    Your Shopify store is connected and ready to sync.
                  </p>
                  {productCount !== null && (
                    <p className="text-sm font-medium">
                      {productCount} products synced
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleSyncProducts}
                  disabled={isSyncing}
                  className="w-full"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing...' : 'Sync Products'}
                </Button>

                {store.last_sync && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <RefreshCw className="h-4 w-4" />
                    Last synced: {new Date(store.last_sync).toLocaleString()}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    Click the button below to authorize this app on Shopify.
                  </p>
                </div>
                
                <Button
                  onClick={handleInitiateOAuth}
                  disabled={isConnecting}
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {isConnecting ? 'Connecting...' : 'Connect to Shopify'}
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShopifyIntegration;
