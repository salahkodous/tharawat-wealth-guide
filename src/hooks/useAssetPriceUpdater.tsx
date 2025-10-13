import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface AssetMetadata {
  additional_data?: {
    karat?: number;
    currency?: string;
  };
}

export const useAssetPriceUpdater = () => {
  const { user } = useAuth();

  const updateAssetPrices = async () => {
    if (!user) return;

    try {
      const { data: assets, error: assetsError } = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', user.id);

      if (assetsError || !assets) return;

      for (const asset of assets) {
        let currentPrice: number | null = null;
        const metadata = asset.metadata as AssetMetadata | null;

        try {
          switch (asset.asset_type) {
            case 'stocks':
              if (asset.symbol && asset.country === 'Egypt') {
                const { data } = await (supabase as any)
                  .from('egyptian_stocks')
                  .select('last_price')
                  .eq('symbol', asset.symbol)
                  .maybeSingle();
                currentPrice = data?.last_price || null;
              }
              break;

            case 'crypto':
            case 'cryptocurrencies':
              if (asset.symbol) {
                const { data } = await supabase
                  .from('cryptocurrencies')
                  .select('price_usd')
                  .eq('symbol', asset.symbol)
                  .maybeSingle();
                currentPrice = data?.price_usd || null;
              }
              break;

            case 'etfs':
              if (asset.symbol) {
                const { data } = await supabase
                  .from('etfs')
                  .select('price')
                  .eq('symbol', asset.symbol)
                  .maybeSingle();
                currentPrice = data?.price || null;
              }
              break;

            case 'gold':
              const karat = metadata?.additional_data?.karat;
              if (karat) {
                const { data } = await (supabase as any)
                  .from('egyptian_gold_prices')
                  .select('price_egp')
                  .eq('karat', `${karat}K`)
                  .order('scraped_at', { ascending: false })
                  .limit(1)
                  .maybeSingle();
                currentPrice = data?.price_egp || null;
              }
              break;

            case 'real_estate':
              if (asset.city && asset.district && asset.area_sqm) {
                const { data } = await supabase
                  .from('real_estate_prices')
                  .select('avg_price_per_meter')
                  .eq('city_name', asset.city)
                  .eq('neighborhood_name', asset.district)
                  .eq('property_type', asset.property_type || 'mixed')
                  .maybeSingle();
                
                if (data?.avg_price_per_meter) {
                  currentPrice = data.avg_price_per_meter * asset.area_sqm;
                }
              }
              break;

            case 'currency':
              if (asset.symbol?.includes('-')) {
                const [base, target] = asset.symbol.split('-');
                const { data } = await supabase
                  .from('currency_rates')
                  .select('exchange_rate')
                  .eq('base_currency', base)
                  .eq('target_currency', target)
                  .order('last_updated', { ascending: false })
                  .limit(1)
                  .maybeSingle();
                currentPrice = data?.exchange_rate || null;
              }
              break;
          }

          if (currentPrice !== null && currentPrice !== asset.current_price) {
            await supabase
              .from('assets')
              .update({ current_price: currentPrice })
              .eq('id', asset.id);
          }
        } catch (err) {
          console.error(`Error updating price for asset ${asset.id}:`, err);
        }
      }
    } catch (error) {
      console.error('Error updating asset prices:', error);
    }
  };

  useEffect(() => {
    if (user) {
      updateAssetPrices();
      const interval = setInterval(updateAssetPrices, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return { updateAssetPrices };
};
