import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';

const MarketOverview = () => {
  const markets = [
    { name: 'EGX 30', value: '18,245.32', change: '+2.34%', positive: true, country: 'Egypt' },
    { name: 'TASI', value: '11,892.45', change: '+1.87%', positive: true, country: 'Saudi Arabia' },
    { name: 'DFM', value: '3,456.78', change: '-0.45%', positive: false, country: 'UAE' },
    { name: 'Boursa Kuwait', value: '7,123.56', change: '+0.92%', positive: true, country: 'Kuwait' }
  ];

  const currencies = [
    { pair: 'USD/EGP', rate: '30.85', change: '+0.12%', positive: true },
    { pair: 'USD/SAR', rate: '3.75', change: '0.00%', positive: null },
    { pair: 'USD/AED', rate: '3.67', change: '-0.02%', positive: false },
    { pair: 'USD/KWD', rate: '0.31', change: '+0.05%', positive: true }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Market Overview</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {markets.map((market, index) => (
          <Card key={index} className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {market.country}
              </CardTitle>
              <div className="text-lg font-bold">{market.name}</div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-xl font-semibold">{market.value}</div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  market.positive ? 'text-green-500' : 'text-red-500'
                }`}>
                  {market.positive ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {market.change}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Currency Exchange Rates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {currencies.map((currency, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <div>
                  <div className="font-medium">{currency.pair}</div>
                  <div className="text-lg font-bold">{currency.rate}</div>
                </div>
                <div className={`text-sm font-medium ${
                  currency.positive === true ? 'text-green-500' : 
                  currency.positive === false ? 'text-red-500' : 'text-muted-foreground'
                }`}>
                  {currency.change}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketOverview;