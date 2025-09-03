import React, { useState } from 'react';
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

const EnhancedPortfolioOverview = () => {
  const { formatAmount } = useCurrency();
  const { userCountry } = useUserCountry();
  const [selectedTab, setSelectedTab] = useState('overview');

  const portfolioMetrics = {
    totalValue: 2450000,
    dayChange: 18500,
    dayChangePercent: 0.76,
    totalReturn: 245000,
    totalReturnPercent: 11.1,
    localAllocation: 68.5,
    internationalAllocation: 31.5,
    riskScore: 7.2,
    sharpeRatio: 1.8,
    diversificationScore: 82
  };

  const assetBreakdown = [
    { type: 'Real Estate', value: 1225000, allocation: 50, change: 8.2, icon: Building2, color: 'text-success' },
    { type: 'Stocks', value: 735000, allocation: 30, change: 12.5, icon: TrendingUp, color: 'text-primary' },
    { type: 'Bonds', value: 294000, allocation: 12, change: 4.1, icon: Home, color: 'text-purple-400' },
    { type: 'Gold', value: 147000, allocation: 6, change: -2.3, icon: DollarSign, color: 'text-warning' },
    { type: 'Crypto', value: 49000, allocation: 2, change: 23.7, icon: Factory, color: 'text-orange-400' }
  ];

  const geographicBreakdown = [
    { region: userCountry?.name || 'Local', flag: userCountry?.flag || '🏠', value: 1678250, allocation: 68.5 },
    { region: 'Saudi Arabia', flag: '🇸🇦', value: 490000, allocation: 20 },
    { region: 'Egypt', flag: '🇪🇬', value: 171500, allocation: 7 },
    { region: 'Qatar', flag: '🇶🇦', value: 73500, allocation: 3 },
    { region: 'Global', flag: '🌍', value: 36750, allocation: 1.5 }
  ];

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
                    {formatAmount(portfolioMetrics.dayChange)} ({portfolioMetrics.dayChangePercent}%)
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
                  +{formatAmount(portfolioMetrics.totalReturn)}
                </div>
                <p className="text-sm text-muted-foreground">
                  +{portfolioMetrics.totalReturnPercent}% all time
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
                          <div className="text-sm text-muted-foreground">{asset.allocation}%</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatAmount(asset.value)}</div>
                        <div className={`text-sm ${asset.change > 0 ? 'text-success' : 'text-destructive'}`}>
                          {asset.change > 0 ? '+' : ''}{asset.change}%
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
                        <div className="text-sm text-muted-foreground">{geo.allocation}%</div>
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
                      <span className={`text-sm font-medium ${item.color}`}>{item.allocation}%</span>
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
                      <span className="text-sm font-medium text-primary">{item.allocation}%</span>
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