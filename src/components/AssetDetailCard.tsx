import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import OptimizedCurrencyValue from '@/components/OptimizedCurrencyValue';
import { TrendingUp, TrendingDown, Activity, MapPin, Calendar, Package } from 'lucide-react';

interface AssetDetailCardProps {
  assetName: string;
  assetType: string;
  symbol?: string;
  currentPrice?: number;
  purchasePrice?: number;
  quantity?: number;
  country?: string;
  city?: string;
  purchaseDate?: string;
  inPortfolio?: boolean;
  marketData?: {
    high?: number;
    low?: number;
    volume?: number;
    changePercent?: number;
  };
}

const AssetDetailCard: React.FC<AssetDetailCardProps> = ({
  assetName,
  assetType,
  symbol,
  currentPrice = 0,
  purchasePrice,
  quantity,
  country,
  city,
  purchaseDate,
  inPortfolio = false,
  marketData,
}) => {
  const gain = purchasePrice ? (currentPrice - purchasePrice) * (quantity || 0) : 0;
  const gainPercent = purchasePrice ? ((currentPrice - purchasePrice) / purchasePrice) * 100 : 0;
  const isPositive = gain >= 0;
  const currentValue = currentPrice * (quantity || 0);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {assetName}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {symbol && <span className="font-mono">{symbol}</span>}
              <Badge variant="outline">{assetType}</Badge>
              {inPortfolio && <Badge variant="default">In Portfolio</Badge>}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              <OptimizedCurrencyValue amount={currentPrice} />
            </div>
            {marketData?.changePercent !== undefined && (
              <div className={`text-sm font-medium ${
                marketData.changePercent >= 0 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-rose-600 dark:text-rose-400'
              }`}>
                {marketData.changePercent > 0 ? '+' : ''}{marketData.changePercent.toFixed(2)}%
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {inPortfolio && purchasePrice && quantity && (
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Your Holdings</span>
              <div className={`flex items-center gap-1 font-medium ${
                isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                {isPositive ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {isPositive ? '+' : ''}{gainPercent.toFixed(2)}%
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-muted-foreground">Quantity</div>
                <div className="font-semibold">{quantity}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Current Value</div>
                <div className="font-semibold">
                  <OptimizedCurrencyValue amount={currentValue} />
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Purchase Price</div>
                <div className="font-semibold">
                  <OptimizedCurrencyValue amount={purchasePrice} />
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Total Gain/Loss</div>
                <div className={`font-semibold ${
                  isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}>
                  <OptimizedCurrencyValue amount={Math.abs(gain)} />
                </div>
              </div>
            </div>
          </div>
        )}

        {marketData && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            {marketData.high !== undefined && (
              <div className="p-2 rounded-lg bg-muted">
                <div className="text-muted-foreground">Day High</div>
                <div className="font-semibold">
                  <OptimizedCurrencyValue amount={marketData.high} />
                </div>
              </div>
            )}
            {marketData.low !== undefined && (
              <div className="p-2 rounded-lg bg-muted">
                <div className="text-muted-foreground">Day Low</div>
                <div className="font-semibold">
                  <OptimizedCurrencyValue amount={marketData.low} />
                </div>
              </div>
            )}
            {marketData.volume !== undefined && (
              <div className="p-2 rounded-lg bg-muted col-span-2">
                <div className="text-muted-foreground">Volume</div>
                <div className="font-semibold">
                  {marketData.volume.toLocaleString()}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-3 text-sm pt-2 border-t">
          {country && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{country}{city ? `, ${city}` : ''}</span>
            </div>
          )}
          {purchaseDate && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{new Date(purchaseDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AssetDetailCard;
