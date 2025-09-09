import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp,
  TrendingDown,
  Building2,
  DollarSign,
  Factory,
  Home,
  Globe,
  Target,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart
} from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import { useUserCountry } from '@/hooks/useUserCountry';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const EnhancedPortfolioOverview = () => {
  const { formatAmount, convertAmount, currency } = useCurrency();
  const { user } = useAuth();
  const { userCountry } = useUserCountry();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssets();
  }, [user]);

  const fetchAssets = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', user.id);
      
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
    
    // Return the currency based on the asset's country
    if (asset.country === 'Egypt') return 'EGP';
    if (asset.country === 'Saudi Arabia') return 'SAR';
    if (asset.country === 'UAE') return 'AED';
    if (asset.country === 'Qatar') return 'QAR';
    if (asset.country === 'Kuwait') return 'KWD';
    if (asset.country === 'Bahrain') return 'BHD';
    if (asset.country === 'Oman') return 'OMR';
    if (asset.country === 'Jordan') return 'JOD';
    
    return 'USD'; // Default fallback for global assets
  };

  const portfolioMetrics = {
    totalValue: assets.reduce((sum, asset) => {
      const assetValue = (asset.current_price || asset.purchase_price || 0) * (asset.quantity || 0);
      const assetCurrency = getAssetCurrency(asset);
      // Only convert if asset currency is different from user currency
      if (assetCurrency === currency) {
        return sum + assetValue;
      }
      return sum + convertAmount(assetValue, assetCurrency, currency);
    }, 0),
    dayChange: assets.reduce((sum, asset) => {
      const currentValue = (asset.current_price || 0) * (asset.quantity || 0);
      const purchaseValue = (asset.purchase_price || 0) * (asset.quantity || 0);
      const change = currentValue - purchaseValue;
      const assetCurrency = getAssetCurrency(asset);
      // Only convert if asset currency is different from user currency
      if (assetCurrency === currency) {
        return sum + change;
      }
      return sum + convertAmount(change, assetCurrency, currency);
    }, 0),
    dayChangePercent: assets.length > 0 ? 
      (assets.reduce((sum, asset) => {
        const currentValue = (asset.current_price || 0) * (asset.quantity || 0);
        const purchaseValue = (asset.purchase_price || 0) * (asset.quantity || 0);
        return sum + (purchaseValue > 0 ? ((currentValue - purchaseValue) / purchaseValue) * 100 : 0);
      }, 0) / assets.length) : 0,
    totalReturn: assets.reduce((sum, asset) => {
      const currentValue = (asset.current_price || 0) * (asset.quantity || 0);
      const purchaseValue = (asset.purchase_price || 0) * (asset.quantity || 0);
      const profit = currentValue - purchaseValue;
      const assetCurrency = getAssetCurrency(asset);
      // Only convert if asset currency is different from user currency
      if (assetCurrency === currency) {
        return sum + profit;
      }
      return sum + convertAmount(profit, assetCurrency, currency);
    }, 0),
    totalReturnPercent: 0, // Will calculate
    riskScore: 7.2,
    sharpeRatio: 1.8
  };

  // Calculate total return percentage
  const totalInvested = assets.reduce((sum, asset) => {
    const purchaseValue = (asset.purchase_price || 0) * (asset.quantity || 0);
    const assetCurrency = getAssetCurrency(asset);
    // Only convert if asset currency is different from user currency
    if (assetCurrency === currency) {
      return sum + purchaseValue;
    }
    return sum + convertAmount(purchaseValue, assetCurrency, currency);
  }, 0);
  
  portfolioMetrics.totalReturnPercent = totalInvested > 0 
    ? (portfolioMetrics.totalReturn / totalInvested) * 100 
    : 0;

  const assetBreakdown = assets.reduce((acc: any[], asset) => {
    const assetValue = (asset.current_price || asset.purchase_price || 0) * (asset.quantity || 0);
    const assetCurrency = getAssetCurrency(asset);
    const convertedValue = assetCurrency === currency ? assetValue : convertAmount(assetValue, assetCurrency, currency);
    
    const assetType = asset.asset_type?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Unknown';
    const existingType = acc.find(item => item.type === assetType);
    
    if (existingType) {
      existingType.value += convertedValue;
    } else {
      acc.push({
        type: assetType,
        value: convertedValue,
        allocation: 0, // Will calculate after
        change: Math.random() * 20 - 10, // Mock change for now
        icon: getAssetIcon(asset.asset_type),
        color: getAssetColor(asset.asset_type)
      });
    }
    return acc;
  }, []);

  // Calculate allocations
  const totalPortfolioValue = assetBreakdown.reduce((sum, item) => sum + item.value, 0);
  assetBreakdown.forEach(item => {
    item.allocation = totalPortfolioValue > 0 ? (item.value / totalPortfolioValue) * 100 : 0;
  });

  const geographicBreakdown = assets.reduce((acc: any[], asset) => {
    const assetValue = (asset.current_price || asset.purchase_price || 0) * (asset.quantity || 0);
    const assetCurrency = getAssetCurrency(asset);
    const convertedValue = assetCurrency === currency ? assetValue : convertAmount(assetValue, assetCurrency, currency);
    
    const country = asset.country || 'Unknown';
    const existingCountry = acc.find(item => item.region === country);
    if (existingCountry) {
      existingCountry.value += convertedValue;
    } else {
      acc.push({
        region: country,
        flag: getCountryFlag(country),
        value: convertedValue,
        allocation: 0 // Will calculate after
      });
    }
    return acc;
  }, []);

  // Calculate geographic allocations
  geographicBreakdown.forEach(item => {
    item.allocation = totalPortfolioValue > 0 ? (item.value / totalPortfolioValue) * 100 : 0;
  });

  function getAssetIcon(assetType: string) {
    switch (assetType) {
      case 'real_estate': return Building2;
      case 'stocks': return TrendingUp;
      case 'bonds': return Home;
      case 'gold': return DollarSign;
      case 'cryptocurrencies': return Factory;
      case 'banking': return Home;
      default: return Globe;
    }
  }

  function getAssetColor(assetType: string) {
    switch (assetType) {
      case 'real_estate': return 'text-success';
      case 'stocks': return 'text-primary';
      case 'bonds': return 'text-purple-400';
      case 'gold': return 'text-warning';
      case 'cryptocurrencies': return 'text-orange-400';
      case 'banking': return 'text-blue-400';
      default: return 'text-foreground';
    }
  }

  function getCountryFlag(country: string) {
    switch (country) {
      case 'Egypt': return '🇪🇬';
      case 'Saudi Arabia': return '🇸🇦';
      case 'Qatar': return '🇶🇦';
      case 'UAE': return '🇦🇪';
      case 'Kuwait': return '🇰🇼';
      case 'Jordan': return '🇯🇴';
      case 'Lebanon': return '🇱🇧';
      case 'Morocco': return '🇲🇦';
      case 'Tunisia': return '🇹🇳';
      case 'Algeria': return '🇩🇿';
      case 'Iraq': return '🇮🇶';
      default: return '🌍';
    }
  }

  const performanceMetrics = [
    { label: 'Beta', value: '1.15', description: 'Market sensitivity', status: 'neutral' },
    { label: 'Alpha', value: '+2.4%', description: 'Excess return', status: 'positive' },
    { label: 'Volatility', value: '18.5%', description: 'Standard deviation', status: 'neutral' },
    { label: 'Max Drawdown', value: '-12.3%', description: 'Largest loss', status: 'warning' }
  ];

  const riskIndicators = [
    { name: 'Concentration Risk', level: 'Medium', color: 'text-warning', description: '35% in single asset class' },
    { name: 'Currency Risk', level: 'Low', color: 'text-success', description: 'Well diversified currencies' },
    { name: 'Sector Risk', level: 'High', color: 'text-destructive', description: '50% in real estate' },
    { name: 'Liquidity Risk', level: 'Medium', color: 'text-warning', description: 'Mixed liquidity profile' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Loading portfolio...</div>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-lg font-medium text-muted-foreground mb-2">No assets in portfolio</div>
        <div className="text-sm text-muted-foreground">Add some investments to see your portfolio overview.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass-card border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
                <BarChart3 className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {formatAmount(portfolioMetrics.totalValue)}
                </div>
                <div className="flex items-center text-sm">
                  {portfolioMetrics.dayChangePercent > 0 ? (
                    <TrendingUp className="w-4 h-4 text-success mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-destructive mr-1" />
                  )}
                  <span className={portfolioMetrics.dayChangePercent > 0 ? 'text-success' : 'text-destructive'}>
                    {formatAmount(portfolioMetrics.dayChange)} ({portfolioMetrics.dayChangePercent.toFixed(2)}%)
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-success/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Return</CardTitle>
                <Target className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">
                  {portfolioMetrics.totalReturn >= 0 ? '+' : ''}{formatAmount(portfolioMetrics.totalReturn)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {portfolioMetrics.totalReturnPercent >= 0 ? '+' : ''}{portfolioMetrics.totalReturnPercent.toFixed(1)}% all time
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-warning/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
                <AlertTriangle className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">
                  {portfolioMetrics.riskScore}/10
                </div>
                <p className="text-sm text-muted-foreground">Moderate-High Risk</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Asset Allocation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {assetBreakdown.map((asset) => {
                  const IconComponent = asset.icon;
                  return (
                    <div key={asset.type} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <IconComponent className={`w-5 h-5 ${asset.color}`} />
                        <div>
                          <div className="font-medium">{asset.type}</div>
                          <div className="text-sm text-muted-foreground">{asset.allocation.toFixed(1)}%</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatAmount(asset.value)}</div>
                        <div className={`text-sm ${asset.change > 0 ? 'text-success' : 'text-destructive'}`}>
                          {asset.change > 0 ? '+' : ''}{asset.change.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Geographic Diversification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {geographicBreakdown.map((geo) => (
                  <div key={geo.region} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{geo.flag}</span>
                      <div>
                        <div className="font-medium">{geo.region}</div>
                        <div className="text-sm text-muted-foreground">{geo.allocation.toFixed(1)}%</div>
                      </div>
                    </div>
                    <div className="font-semibold">{formatAmount(geo.value)}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="allocation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Asset Type Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {assetBreakdown.map((item) => (
                  <div key={item.type} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{item.type}</span>
                      <span className={`text-sm font-medium ${item.color}`}>{item.allocation.toFixed(1)}%</span>
                    </div>
                    <Progress value={item.allocation} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Regional Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {geographicBreakdown.map((item) => (
                  <div key={item.region} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span>{item.flag}</span>
                        <span className="text-sm font-medium">{item.region}</span>
                      </div>
                      <span className="text-sm font-medium text-primary">{item.allocation.toFixed(1)}%</span>
                    </div>
                    <Progress value={item.allocation} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {performanceMetrics.map((metric) => (
              <Card key={metric.label} className="glass-card">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-foreground">{metric.value}</div>
                  <div className="text-sm font-medium text-muted-foreground">{metric.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{metric.description}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {riskIndicators.map((risk) => (
                <div key={risk.name} className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      risk.level === 'Low' ? 'bg-success' :
                      risk.level === 'Medium' ? 'bg-warning' : 'bg-destructive'
                    }`} />
                    <div>
                      <div className="font-medium">{risk.name}</div>
                      <div className="text-sm text-muted-foreground">{risk.description}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className={risk.color}>
                    {risk.level}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedPortfolioOverview;