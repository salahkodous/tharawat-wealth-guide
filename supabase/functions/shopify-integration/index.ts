import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const clientId = Deno.env.get('SHOPIFY_CLIENT_ID');
    const clientSecret = Deno.env.get('SHOPIFY_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new Error('Shopify credentials not configured');
    }

    const { action, storeUrl, code, projectId, userId } = await req.json();

    console.log('Shopify integration action:', action);

    // Generate OAuth URL
    if (action === 'getAuthUrl') {
      const shop = storeUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
      const redirectUri = 'https://anakin.tech/en/business';
      const scopes = 'read_products,write_products,read_orders,write_orders';
      
      const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}`;
      
      return new Response(
        JSON.stringify({ authUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Exchange code for access token
    if (action === 'exchangeToken') {
      const shop = storeUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
      const tokenUrl = `https://${shop}/admin/oauth/access_token`;
      
      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
        }),
      });

      if (!tokenResponse.ok) {
        const error = await tokenResponse.text();
        console.error('Token exchange failed:', error);
        throw new Error('Failed to exchange authorization code');
      }

      const { access_token } = await tokenResponse.json();

      // Update the store with the access token
      const { error: updateError } = await supabase
        .from('shopify_stores')
        .update({
          access_token: access_token,
          is_connected: true,
          last_sync: new Date().toISOString(),
        })
        .eq('project_id', projectId)
        .eq('user_id', userId);

      if (updateError) {
        console.error('Failed to update store:', updateError);
        throw new Error('Failed to save access token');
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sync products from Shopify
    if (action === 'syncProducts') {
      const { data: store } = await supabase
        .from('shopify_stores')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .single();

      if (!store || !store.access_token) {
        throw new Error('Store not connected');
      }

      const shop = store.store_url.replace(/^https?:\/\//, '').replace(/\/$/, '');
      const productsUrl = `https://${shop}/admin/api/2024-01/products.json`;

      const productsResponse = await fetch(productsUrl, {
        headers: {
          'X-Shopify-Access-Token': store.access_token,
          'Content-Type': 'application/json',
        },
      });

      if (!productsResponse.ok) {
        const error = await productsResponse.text();
        console.error('Failed to fetch products:', error);
        throw new Error('Failed to fetch products from Shopify');
      }

      const { products } = await productsResponse.json();

      // Update last sync time
      await supabase
        .from('shopify_stores')
        .update({ last_sync: new Date().toISOString() })
        .eq('id', store.id);

      return new Response(
        JSON.stringify({ products, count: products.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Shopify integration error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
