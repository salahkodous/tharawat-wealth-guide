import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  Coins, 
  Landmark, 
  Briefcase,
  DollarSign,
  Globe,
  Banknote
} from 'lucide-react';
import { useMarketData } from '@/hooks/useMarketData';
import { useCurrency } from '@/hooks/useCurrency';

interface AssetBrowserProps {
  onAssetSelect: (asset: any, type: string) => void;
  selectedAssetType?: string;
}

const AssetBrowser = ({ onAssetSelect, selectedAssetType }: AssetBrowserProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(selectedAssetType || 'stocks');
  const { formatAmount } = useCurrency();
  
  const {
    stocks,
    cryptos,
    bonds,
    etfs,
    realEstate,
    goldPrices,
    currencyRates,
    bankProducts,
    loading
  } = useMarketData();

  const formatPrice = (price: number | null, currency?: string) => {
    if (price === null || price === undefined) return 'N/A';
    if (currency === 'EGP' || currency === 'USD') {
      return formatAmount(price);
    }
    return price.toLocaleString();
  };

  const getChangeColor = (change: number | null) => {
    if (!change) return 'text-muted-foreground';
    return change >= 0 ? 'text-green-500' : 'text-red-500';
  };

  const filteredStocks = useMemo(() => {
    return stocks.filter(stock => 
      stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [stocks, searchTerm]);

  const filteredCryptos = useMemo(() => {
    return cryptos.filter(crypto => 
      crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [cryptos, searchTerm]);

  const filteredBonds = useMemo(() => {
    return bonds.filter(bond => 
      bond.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bond.issuer.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [bonds, searchTerm]);

  const filteredETFs = useMemo(() => {
    return etfs.filter(etf => 
      etf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      etf.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [etfs, searchTerm]);

  const filteredRealEstate = useMemo(() => {
    return realEstate.filter(property => 
      (property.city_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (property.neighborhood_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  }, [realEstate, searchTerm]);

  const filteredGold = useMemo(() => {
    return goldPrices.filter(gold => 
      gold.source.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [goldPrices, searchTerm]);

  const filteredCurrencies = useMemo(() => {
    return currencyRates.filter(rate => 
      rate.base_currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rate.target_currency.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [currencyRates, searchTerm]);

  const filteredBankProducts = useMemo(() => {
    return bankProducts.filter(product => 
      product.bank_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [bankProducts, searchTerm]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Loading market data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* Mobile Tabs - Scrollable horizontal list */}
        <div className="block md:hidden">
          <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
            {[
              { value: 'stocks', icon: TrendingUp, label: 'Stocks' },
              { value: 'crypto', icon: Coins, label: 'Crypto' },
              { value: 'bonds', icon: Landmark, label: 'Bonds' },
              { value: 'etfs', icon: Briefcase, label: 'ETFs' },
              { value: 'real_estate', icon: Building2, label: 'Real Estate' },
              { value: 'gold', icon: DollarSign, label: 'Gold' },
              { value: 'currency', icon: Globe, label: 'Currency' },
              { value: 'banking', icon: Banknote, label: 'Banking' }
            ].map(({ value, icon: Icon, label }) => (
              <Button
                key={value}
                variant={activeTab === value ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab(value)}
                className="flex items-center gap-2 whitespace-nowrap min-w-fit px-3 shrink-0"
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs">{label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Desktop Tabs - Grid layout */}
        <div className="hidden md:block">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="stocks" className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Stocks</span>
            </TabsTrigger>
            <TabsTrigger value="crypto" className="flex items-center gap-1">
              <Coins className="w-4 h-4" />
              <span className="hidden sm:inline">Crypto</span>
            </TabsTrigger>
            <TabsTrigger value="bonds" className="flex items-center gap-1">
              <Landmark className="w-4 h-4" />
              <span className="hidden sm:inline">Bonds</span>
            </TabsTrigger>
            <TabsTrigger value="etfs" className="flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              <span className="hidden sm:inline">ETFs</span>
            </TabsTrigger>
            <TabsTrigger value="real_estate" className="flex items-center gap-1">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Real Estate</span>
            </TabsTrigger>
            <TabsTrigger value="gold" className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Gold</span>
            </TabsTrigger>
            <TabsTrigger value="currency" className="flex items-center gap-1">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Currency</span>
            </TabsTrigger>
            <TabsTrigger value="banking" className="flex items-center gap-1">
              <Banknote className="w-4 h-4" />
              <span className="hidden sm:inline">Banking</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="stocks" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 md:max-h-96 overflow-y-auto">
            {filteredStocks.map((stock) => (
              <Card key={stock.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onAssetSelect(stock, 'stocks')}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{stock.name}</h4>
                      <p className="text-sm text-muted-foreground">{stock.symbol} • {stock.exchange}</p>
                      <Badge className="mt-1">{stock.country}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(stock.price, stock.currency)}</p>
                      {stock.change_percent && (
                        <p className={`text-sm flex items-center gap-1 ${getChangeColor(stock.change_percent)}`}>
                          {stock.change_percent >= 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {stock.change_percent.toFixed(2)}%
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="crypto" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 md:max-h-96 overflow-y-auto">
            {filteredCryptos.map((crypto) => (
              <Card key={crypto.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onAssetSelect(crypto, 'crypto')}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{crypto.name}</h4>
                      <p className="text-sm text-muted-foreground">{crypto.symbol}</p>
                      {crypto.rank && <Badge>Rank #{crypto.rank}</Badge>}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${crypto.price_usd?.toLocaleString()}</p>
                      {crypto.change_percentage_24h && (
                        <p className={`text-sm flex items-center gap-1 ${getChangeColor(crypto.change_percentage_24h)}`}>
                          {crypto.change_percentage_24h >= 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {crypto.change_percentage_24h.toFixed(2)}%
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bonds" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 md:max-h-96 overflow-y-auto">
            {filteredBonds.map((bond) => (
              <Card key={bond.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onAssetSelect(bond, 'bonds')}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{bond.name}</h4>
                      <p className="text-sm text-muted-foreground">{bond.issuer}</p>
                      <Badge className="mt-1">{bond.bond_type}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(bond.current_price, bond.currency)}</p>
                      {bond.yield_to_maturity && (
                        <p className="text-sm text-muted-foreground">
                          Yield: {bond.yield_to_maturity.toFixed(2)}%
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="etfs" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 md:max-h-96 overflow-y-auto">
            {filteredETFs.map((etf) => (
              <Card key={etf.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onAssetSelect(etf, 'etfs')}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{etf.name}</h4>
                      <p className="text-sm text-muted-foreground">{etf.symbol} • {etf.exchange}</p>
                      <Badge className="mt-1">{etf.country}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(etf.price, etf.currency)}</p>
                      {etf.change_percentage && (
                        <p className={`text-sm flex items-center gap-1 ${getChangeColor(etf.change_percentage)}`}>
                          {etf.change_percentage >= 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {etf.change_percentage.toFixed(2)}%
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="real_estate" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 md:max-h-96 overflow-y-auto">
            {filteredRealEstate.map((property) => (
              <Card key={property.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onAssetSelect(property, 'real_estate')}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{property.neighborhood_name || 'Property'}</h4>
                      <p className="text-sm text-muted-foreground">{property.city_name}</p>
                      <Badge className="mt-1">{property.property_type}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(property.avg_price_per_meter)} /m²</p>
                      {property.total_properties && (
                        <p className="text-sm text-muted-foreground">
                          {property.total_properties} properties
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="gold" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 md:max-h-96 overflow-y-auto">
            {filteredGold.map((gold) => (
              <Card key={gold.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onAssetSelect(gold, 'gold')}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Gold - {gold.source}</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {gold.price_24k_egp && (
                        <div>
                          <span className="text-muted-foreground">24K:</span>
                          <span className="font-medium ml-2">{formatPrice(gold.price_24k_egp)} EGP</span>
                        </div>
                      )}
                      {gold.price_21k_egp && (
                        <div>
                          <span className="text-muted-foreground">21K:</span>
                          <span className="font-medium ml-2">{formatPrice(gold.price_21k_egp)} EGP</span>
                        </div>
                      )}
                    </div>
                    {gold.change_percentage_24h && (
                      <p className={`text-sm flex items-center gap-1 ${getChangeColor(gold.change_percentage_24h)}`}>
                        {gold.change_percentage_24h >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {gold.change_percentage_24h.toFixed(2)}% (24h)
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="currency" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 md:max-h-96 overflow-y-auto">
            {filteredCurrencies.map((rate) => (
              <Card key={rate.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onAssetSelect(rate, 'currency')}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{rate.base_currency}/{rate.target_currency}</h4>
                      <p className="text-sm text-muted-foreground">{rate.source}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{rate.exchange_rate.toFixed(4)}</p>
                      {rate.change_percentage_24h && (
                        <p className={`text-sm flex items-center gap-1 ${getChangeColor(rate.change_percentage_24h)}`}>
                          {rate.change_percentage_24h >= 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {rate.change_percentage_24h.toFixed(2)}%
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="banking" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 md:max-h-96 overflow-y-auto">
            {filteredBankProducts.map((product) => (
              <Card key={product.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onAssetSelect(product, 'banking')}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{product.product_name}</h4>
                      <p className="text-sm text-muted-foreground">{product.bank_name}</p>
                      <Badge className="mt-1">{product.product_type}</Badge>
                    </div>
                    <div className="text-right">
                      {product.interest_rate && (
                        <p className="font-semibold">{product.interest_rate}% APR</p>
                      )}
                      {product.minimum_amount && (
                        <p className="text-sm text-muted-foreground">
                          Min: {formatPrice(product.minimum_amount)}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssetBrowser;