import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Store, Link2, RefreshCw } from 'lucide-react';
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
  const [storeUrl, setStoreUrl] = useState('');

  useEffect(() => {
    fetchStore();
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
      setStoreUrl('');
      
      toast({
        title: 'Store Added',
        description: 'Shopify store configuration saved. You can now add your API credentials.',
      });
    } catch (error: any) {
      console.error('Error connecting Shopify store:', error);
      toast({
        title: 'Error',
        description: 'Failed to add Shopify store',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
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
                {store.is_connected ? 'Connected' : 'Not Connected'}
              </Badge>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                To complete the integration, you'll need to add your Shopify API credentials.
              </p>
              <p className="text-sm font-medium">
                Please provide your API key and access token when ready.
              </p>
            </div>

            {store.last_sync && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4" />
                Last synced: {new Date(store.last_sync).toLocaleString()}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShopifyIntegration;
