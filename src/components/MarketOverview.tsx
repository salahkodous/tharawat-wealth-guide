import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import OptimizedCurrencyValue from '@/components/OptimizedCurrencyValue';

const MarketOverview = () => {
  const markets = [
    { name: 'TASI', value: 12450.8, change: '+2.3%', positive: true, category: 'Stocks', country: 'Saudi Arabia', currency: 'SAR' },
    { name: 'DFM', value: 4125.6, change: '-0.8%', positive: false, category: 'Stocks', country: 'UAE', currency: 'AED' },
    { name: 'Dubai Real Estate', value: 98.2, change: '+3.1%', positive: true, category: 'Real Estate', country: 'UAE', currency: 'AED' },
    { name: 'Bitcoin (MENA)', value: 67432, change: '-2.4%', positive: false, category: 'Crypto', country: 'Regional', currency: 'USD' },
    { name: 'Saudi Banks', value: 8945, change: '+1.8%', positive: true, category: 'Banking', country: 'Saudi Arabia', currency: 'SAR' },
    { name: 'UAE Property', value: 156.7, change: '+2.2%', positive: true, category: 'Real Estate', country: 'UAE', currency: 'AED' },
    { name: 'QE Index', value: 10234, change: '+0.9%', positive: true, category: 'Stocks', country: 'Qatar', currency: 'QAR' },
    { name: 'Ethereum Gulf', value: 3821, change: '+1.5%', positive: true, category: 'Crypto', country: 'Regional', currency: 'USD' }
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
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    market.category === 'Stocks' ? 'bg-blue-500' :
                    market.category === 'Real Estate' ? 'bg-green-500' :
                    market.category === 'Crypto' ? 'bg-orange-500' :
                    'bg-purple-500'
                  }`} />
                  <span className="text-xs text-muted-foreground">
                    {market.category}
                  </span>
                </div>
                <div className={`flex items-center gap-1 ${
                  market.positive ? 'text-green-500' : 'text-red-500'
                }`}>
                  {market.positive ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">
                    {market.change}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">{market.name}</h3>
                <p className="text-xl font-bold">
                  <OptimizedCurrencyValue 
                    amount={market.value} 
                    fromCurrency={market.currency}
                  />
                </p>
                <p className="text-xs text-muted-foreground">{market.country}</p>
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