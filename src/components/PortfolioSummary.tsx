import React from 'react';
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

const PortfolioSummary = () => {
  const { formatAmount } = useCurrency();
  
  const portfolioStats = [
    { label: 'Total Value', value: formatAmount(125450), change: '+8.5%', positive: true },
    { label: 'Today\'s Gain', value: '+' + formatAmount(2340), change: '+1.9%', positive: true },
    { label: 'Total Return', value: '+' + formatAmount(15450), change: '+14.1%', positive: true },
    { label: 'Assets', value: '12', change: '+2', positive: true }
  ];

  const topHoldings = [
    { 
      name: 'Saudi Aramco', 
      symbol: 'ARAMCO', 
      value: formatAmount(25600, 'SAR'), 
      allocation: '20.4%', 
      change: '+2.1%', 
      positive: true,
      type: 'stocks',
      country: 'SA'
    },
    { 
      name: 'Commercial Intl Bank', 
      symbol: 'COMI', 
      value: formatAmount(18900, 'EGP'), 
      allocation: '15.1%', 
      change: '+1.8%', 
      positive: true,
      type: 'stocks',
      country: 'EG'
    },
    { 
      name: 'Emirates NBD', 
      symbol: 'ENBD', 
      value: formatAmount(15200, 'AED'), 
      allocation: '12.1%', 
      change: '-0.5%', 
      positive: false,
      type: 'stocks',
      country: 'AE'
    },
    { 
      name: 'Dubai Marina Apt', 
      symbol: 'REAL-01', 
      value: formatAmount(850000, 'AED'), 
      allocation: '35.2%', 
      change: '+8.2%', 
      positive: true,
      type: 'real_estate',
      country: 'AE'
    },
    { 
      name: 'Gold 24K', 
      symbol: 'AU24K', 
      value: formatAmount(12800, 'USD'), 
      allocation: '5.3%', 
      change: '+1.2%', 
      positive: true,
      type: 'gold',
      country: 'GLOBAL'
    }
  ];

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
    SA: '🇸🇦',
    AE: '🇦🇪',
    EG: '🇪🇬',
    QA: '🇶🇦',
    KW: '🇰🇼',
    GLOBAL: '🌍'
  };

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
            {topHoldings.map((holding, index) => {
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
            })}
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
            {[
              { name: 'Real Estate', value: 45, color: 'text-success' },
              { name: 'Stocks', value: 35, color: 'text-primary' },
              { name: 'Bonds', value: 12, color: 'text-purple-400' },
              { name: 'Gold', value: 5, color: 'text-warning' },
              { name: 'Cash', value: 3, color: 'text-muted-foreground' },
            ].map((item) => (
              <div key={item.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className={`text-sm font-medium ${item.color}`}>{item.value}%</span>
                </div>
                <Progress value={item.value} className="h-2" />
              </div>
            ))}
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
            {[
              { country: 'UAE', flag: '🇦🇪', value: 42, color: 'text-success' },
              { country: 'Saudi Arabia', flag: '🇸🇦', value: 28, color: 'text-primary' },
              { country: 'Egypt', flag: '🇪🇬', value: 18, color: 'text-warning' },
              { country: 'Qatar', flag: '🇶🇦', value: 8, color: 'text-purple-400' },
              { country: 'Global', flag: '🌍', value: 4, color: 'text-muted-foreground' },
            ].map((item) => (
              <div key={item.country} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.flag}</span>
                    <span className="text-sm font-medium">{item.country}</span>
                  </div>
                  <span className={`text-sm font-medium ${item.color}`}>{item.value}%</span>
                </div>
                <Progress value={item.value} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PortfolioSummary;