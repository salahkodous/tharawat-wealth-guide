import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, TrendingUp, PieChart, Target } from 'lucide-react';
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
    { name: 'Saudi Aramco', symbol: 'ARAMCO', value: formatAmount(25600), allocation: '20.4%', change: '+2.1%', positive: true },
    { name: 'Commercial Intl Bank', symbol: 'COMI', value: formatAmount(18900), allocation: '15.1%', change: '+1.8%', positive: true },
    { name: 'Emirates NBD', symbol: 'ENBD', value: formatAmount(15200), allocation: '12.1%', change: '-0.5%', positive: false },
    { name: 'Kuwait Finance House', symbol: 'KFH', value: formatAmount(12800), allocation: '10.2%', change: '+0.8%', positive: true }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Briefcase className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Portfolio Summary</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {portfolioStats.map((stat, index) => (
          <Card key={index} className="glass-card">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  stat.positive ? 'text-green-500' : 'text-red-500'
                }`}>
                  <TrendingUp className="w-4 h-4" />
                  {stat.change}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Top Holdings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topHoldings.map((holding, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{holding.name}</div>
                  <div className="text-sm text-muted-foreground">{holding.symbol}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{holding.value}</div>
                  <div className="text-sm text-muted-foreground">{holding.allocation}</div>
                </div>
                <div className={`text-sm font-medium ml-4 ${
                  holding.positive ? 'text-green-500' : 'text-red-500'
                }`}>
                  {holding.change}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioSummary;