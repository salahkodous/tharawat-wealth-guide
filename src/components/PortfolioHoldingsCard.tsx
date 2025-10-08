import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import OptimizedCurrencyValue from '@/components/OptimizedCurrencyValue';
import { TrendingUp, TrendingDown, PieChart, Package } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const PortfolioHoldingsCard: React.FC = () => {
  const { user } = useAuth();

  const { data: portfolios, isLoading: portfoliosLoading } = useQuery({
    queryKey: ['portfolios', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: assets, isLoading: assetsLoading } = useQuery({
    queryKey: ['assets', portfolios?.[0]?.id],
    queryFn: async () => {
      if (!portfolios?.[0]?.id) return [];
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('portfolio_id', portfolios[0].id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!portfolios?.[0]?.id,
  });

  const isLoading = portfoliosLoading || assetsLoading;

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!assets || assets.length === 0) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Portfolio Holdings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No assets in portfolio yet
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate total portfolio value and sort by current value
  const enrichedAssets = assets.map(asset => ({
    ...asset,
    currentValue: (asset.current_price || 0) * (asset.quantity || 0),
    purchaseValue: (asset.purchase_price || 0) * (asset.quantity || 0),
    gain: ((asset.current_price || 0) - (asset.purchase_price || 0)) * (asset.quantity || 0),
    gainPercent: asset.purchase_price
      ? (((asset.current_price || 0) - (asset.purchase_price || 0)) / (asset.purchase_price || 0)) * 100
      : 0,
  }));

  const totalValue = enrichedAssets.reduce((sum, a) => sum + a.currentValue, 0);
  const sortedAssets = enrichedAssets.sort((a, b) => b.currentValue - a.currentValue).slice(0, 5);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Top Portfolio Holdings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <div className="text-sm text-muted-foreground mb-1">Total Portfolio Value</div>
          <div className="text-2xl font-bold">
            <OptimizedCurrencyValue amount={totalValue} />
          </div>
        </div>

        <div className="space-y-2">
          {sortedAssets.map((asset) => {
            const allocation = totalValue > 0 ? (asset.currentValue / totalValue) * 100 : 0;
            const isPositive = asset.gain >= 0;

            return (
              <div
                key={asset.id}
                className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{asset.asset_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {asset.asset_type} • {asset.symbol || asset.country}
                    </div>
                  </div>
                  <div className="text-right ml-2">
                    <div className="font-semibold">
                      <OptimizedCurrencyValue amount={asset.currentValue} />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {allocation.toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="text-muted-foreground">
                    {asset.quantity} @ <OptimizedCurrencyValue amount={asset.current_price || 0} />
                  </div>
                  <div className={`flex items-center gap-1 font-medium ${
                    isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <OptimizedCurrencyValue amount={Math.abs(asset.gain)} />
                    ({asset.gainPercent > 0 ? '+' : ''}{asset.gainPercent.toFixed(2)}%)
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioHoldingsCard;
