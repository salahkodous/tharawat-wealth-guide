import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Briefcase, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Target,
  Building2,
  DollarSign,
  Factory,
  Home,
  Globe
} from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const PortfolioSummary = () => {
  const { formatAmount, convertAmount, currency } = useCurrency();
  const { user } = useAuth();
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Define constants before they're used
  const assetTypeIcons = {
    stocks: TrendingUp,
    real_estate: Building2,
    gold: DollarSign,
    crypto: Factory,
    bonds: Home,
    banking: Briefcase
  };

  const assetTypeColors = {
    stocks: 'text-primary',
    real_estate: 'text-success',
    gold: 'text-warning',
    crypto: 'text-orange-400',
    bonds: 'text-purple-400',
    banking: 'text-blue-400'
  };

  const countryFlags = {
    'UAE': '🇦🇪', 'Saudi Arabia': '🇸🇦', 'Egypt': '🇪🇬', 'Qatar': '🇶🇦',
    'Kuwait': '🇰🇼', 'Bahrain': '🇧🇭', 'Oman': '🇴🇲', 'Jordan': '🇯🇴',
    'Lebanon': '🇱🇧', 'Morocco': '🇲🇦', 'Tunisia': '🇹🇳', 'Algeria': '🇩🇿',
    'Iraq': '🇮🇶', 'US': '🇺🇸', 'UK': '🇬🇧', 'EU': '🇪🇺', 'GLOBAL': '🌍'
  };

  useEffect(() => {
    if (user) {
      fetchAssets();

      // Set up real-time subscription for assets
      const channel = supabase
        .channel('portfolio-summary-assets')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'assets', filter: `user_id=eq.${user.id}` },
          (payload) => {
            console.log('Portfolio summary: Assets updated via realtime:', payload);
            fetchAssets();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchAssets = async () => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAssetCurrency = (asset: any) => {
    // Check metadata for currency first
    if (asset.metadata?.additional_data?.currency) {
      return asset.metadata.additional_data.currency;
    }
    
    // For crypto and global assets, they're usually stored in USD
    if (asset.asset_type === 'crypto' || asset.asset_type === 'cryptocurrencies') return 'USD';
    
    const currencyMap: { [key: string]: string } = {
      'UAE': 'AED', 'Saudi Arabia': 'SAR', 'Egypt': 'EGP', 'Qatar': 'QAR',
      'Kuwait': 'KWD', 'Bahrain': 'BHD', 'Oman': 'OMR', 'Jordan': 'JOD',
      'Lebanon': 'LBP', 'Morocco': 'MAD', 'Tunisia': 'TND', 'Algeria': 'DZD',
      'Iraq': 'IQD', 'US': 'USD', 'UK': 'GBP', 'EU': 'EUR'
    };
    return currencyMap[asset.country] || 'USD';
  };

  const calculateAssetMetrics = (asset: any) => {
    const currency = getAssetCurrency(asset);
    const value = (asset.current_price || asset.purchase_price || 0) * (asset.quantity || 1);
    const purchaseValue = (asset.purchase_price || 0) * (asset.quantity || 1);
    const change = value - purchaseValue;
    const changePercent = purchaseValue > 0 ? ((change / purchaseValue) * 100) : 0;
    
    return { value, change, changePercent, currency };
  };

  const holdings = assets.map(asset => {
    const metrics = calculateAssetMetrics(asset);
    return {
      name: asset.asset_name,
      symbol: asset.symbol || asset.asset_name.substring(0, 6).toUpperCase(),
      value: metrics.value,
      change: metrics.change,
      changePercent: metrics.changePercent,
      type: asset.asset_type,
      country: asset.country,
      currency: metrics.currency
    };
  });

  const totalValue = holdings.reduce((sum, holding) => {
    // Only convert if asset currency is different from user currency
    if (holding.currency === currency) {
      return sum + holding.value;
    }
    return sum + convertAmount(holding.value, holding.currency);
  }, 0);
  const totalChange = holdings.reduce((sum, holding) => {
    // Only convert if asset currency is different from user currency
    if (holding.currency === currency) {
      return sum + holding.change;
    }
    return sum + convertAmount(holding.change, holding.currency);
  }, 0);
  const totalChangePercent = totalValue > 0 ? ((totalChange / (totalValue - totalChange)) * 100) : 0;

  const portfolioStats = [
    { 
      label: 'Total Value', 
      value: formatAmount(totalValue), 
      change: `${totalChangePercent >= 0 ? '+' : ''}${totalChangePercent.toFixed(1)}%`, 
      positive: totalChangePercent >= 0 
    },
    { 
      label: 'Today\'s Gain', 
      value: `${totalChange >= 0 ? '+' : ''}${formatAmount(Math.abs(totalChange))}`, 
      change: `${totalChangePercent >= 0 ? '+' : ''}${totalChangePercent.toFixed(1)}%`, 
      positive: totalChange >= 0 
    },
    { 
      label: 'Total Return', 
      value: `${totalChange >= 0 ? '+' : ''}${formatAmount(Math.abs(totalChange))}`, 
      change: `${totalChangePercent >= 0 ? '+' : ''}${totalChangePercent.toFixed(1)}%`, 
      positive: totalChange >= 0 
    },
    { 
      label: 'Assets', 
      value: assets.length.toString(), 
      change: assets.length > 0 ? `+${assets.length}` : '0', 
      positive: assets.length > 0 
    }
  ];

  const topHoldings = holdings
    .sort((a, b) => {
      const aValue = a.currency === currency ? a.value : convertAmount(a.value, a.currency);
      const bValue = b.currency === currency ? b.value : convertAmount(b.value, b.currency);
      return bValue - aValue;
    })
    .slice(0, 5)
    .map(holding => {
      const totalPortfolioValue = totalValue > 0 ? totalValue : 1;
      const holdingValue = holding.currency === currency ? 
        holding.value : convertAmount(holding.value, holding.currency);
      const allocation = ((holdingValue / totalPortfolioValue) * 100).toFixed(1);
      
      return {
        name: holding.name,
        symbol: holding.symbol,
        value: holding.currency === currency ? 
          formatAmount(holding.value) : formatAmount(holdingValue),
        allocation: `${allocation}%`,
        change: `${holding.changePercent >= 0 ? '+' : ''}${holding.changePercent.toFixed(1)}%`,
        positive: holding.changePercent >= 0,
        type: holding.type,
        country: holding.country
      };
    });

  // Calculate asset allocation
  const assetTypeAllocation = holdings.reduce((acc, holding) => {
    const value = holding.currency === currency ? holding.value : convertAmount(holding.value, holding.currency);
    acc[holding.type] = (acc[holding.type] || 0) + value;
    return acc;
  }, {} as { [key: string]: number });

  const assetAllocation = Object.entries(assetTypeAllocation).map(([type, value]) => ({
    name: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: totalValue > 0 ? ((value / totalValue) * 100) : 0,
    color: assetTypeColors[type as keyof typeof assetTypeColors] || 'text-muted-foreground'
  }));

  // Calculate geographic allocation
  const countryAllocation = holdings.reduce((acc, holding) => {
    const value = holding.currency === currency ? holding.value : convertAmount(holding.value, holding.currency);
    acc[holding.country] = (acc[holding.country] || 0) + value;
    return acc;
  }, {} as { [key: string]: number });

  const geographicAllocation = Object.entries(countryAllocation).map(([country, value]) => ({
    country,
    flag: countryFlags[country as keyof typeof countryFlags] || '🌍',
    value: totalValue > 0 ? ((value / totalValue) * 100) : 0,
    color: 'text-primary'
  }));


  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Portfolio Summary</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="glass-card animate-pulse">
              <CardContent className="p-4">
                <div className="h-16 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Portfolio Summary</h2>
        </div>
        <Card className="glass-card">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Please sign in to view your portfolio.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Briefcase className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Portfolio Summary</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {portfolioStats.map((stat, index) => (
          <Card key={index} className="glass-card border-card-border">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  stat.positive ? 'text-success' : 'text-destructive'
                }`}>
                  {stat.positive ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {stat.change}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card border-card-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Top Holdings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topHoldings.length > 0 ? topHoldings.map((holding, index) => {
              const IconComponent = assetTypeIcons[holding.type as keyof typeof assetTypeIcons] || Building2;
              const iconColor = assetTypeColors[holding.type as keyof typeof assetTypeColors] || 'text-muted-foreground';
              
              return (
                <div key={index} className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg border border-card-border/50">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center gap-2">
                      <IconComponent className={`w-5 h-5 ${iconColor}`} />
                      <span className="text-lg">
                        {countryFlags[holding.country as keyof typeof countryFlags] || '🌍'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-foreground">{holding.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <span>{holding.symbol}</span>
                        <Badge variant="outline" className="text-xs">
                          {holding.type.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-foreground">{holding.value}</div>
                    <div className="text-sm text-muted-foreground">{holding.allocation}</div>
                  </div>
                  <div className={`text-sm font-medium ml-4 ${
                    holding.positive ? 'text-success' : 'text-destructive'
                  }`}>
                    {holding.change}
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No assets in your portfolio yet.</p>
                <p className="text-sm text-muted-foreground mt-2">Start by adding your first investment!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card border-card-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Asset Allocation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {assetAllocation.length > 0 ? assetAllocation.map((item) => (
              <div key={item.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className={`text-sm font-medium ${item.color}`}>{item.value.toFixed(1)}%</span>
                </div>
                <Progress value={item.value} className="h-2" />
              </div>
            )) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No assets to display allocation
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-card-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Geographic Allocation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {geographicAllocation.length > 0 ? geographicAllocation.map((item) => (
              <div key={item.country} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.flag}</span>
                    <span className="text-sm font-medium">{item.country}</span>
                  </div>
                  <span className={`text-sm font-medium ${item.color}`}>{item.value.toFixed(1)}%</span>
                </div>
                <Progress value={item.value} className="h-2" />
              </div>
            )) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No assets to display geographic allocation
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PortfolioSummary;