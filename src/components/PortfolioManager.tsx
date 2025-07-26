import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Building2, TrendingUp, Coins, Home, Gem, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface Asset {
  id: string;
  name: string;
  symbol: string;
  market: string;
  price: number;
  currency: string;
}

const PortfolioManager: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedAssetType, setSelectedAssetType] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [purchaseDetails, setPurchaseDetails] = useState({
    quantity: '',
    price: '',
    date: ''
  });
  const { toast } = useToast();

  // Country data with markets and currencies
  const countries = [
    { 
      code: 'EG', 
      name: 'Egypt • مصر', 
      market: 'EGX', 
      currency: 'EGP',
      flag: '🇪🇬'
    },
    { 
      code: 'SA', 
      name: 'Saudi Arabia • السعودية', 
      market: 'Tadawul', 
      currency: 'SAR',
      flag: '🇸🇦'
    },
    { 
      code: 'AE', 
      name: 'UAE • الإمارات', 
      market: 'DFM/ADX', 
      currency: 'AED',
      flag: '🇦🇪'
    },
    { 
      code: 'KW', 
      name: 'Kuwait • الكويت', 
      market: 'Boursa Kuwait', 
      currency: 'KWD',
      flag: '🇰🇼'
    }
  ];

  // Asset types
  const assetTypes = [
    { id: 'stocks', name: 'Stocks • الأسهم', icon: TrendingUp, color: 'text-primary' },
    { id: 'crypto', name: 'Cryptocurrency • العملات الرقمية', icon: Coins, color: 'text-success' },
    { id: 'realestate', name: 'Real Estate • العقارات', icon: Home, color: 'text-warning' },
    { id: 'etf', name: 'ETFs • صناديق المؤشرات', icon: Building2, color: 'text-primary' },
    { id: 'bonds', name: 'Bonds • السندات', icon: Building2, color: 'text-muted-foreground' },
    { id: 'gold', name: 'Gold • الذهب', icon: Gem, color: 'text-warning' },
    { id: 'manual', name: 'Manual Asset • أصل يدوي', icon: PlusCircle, color: 'text-muted-foreground' }
  ];

  // Sample assets by country
  const assetsByCountry: Record<string, Record<string, Asset[]>> = {
    EG: {
      stocks: [
        { id: 'comi', name: 'Commercial International Bank', symbol: 'COMI', market: 'EGX', price: 85.5, currency: 'EGP' },
        { id: 'etel', name: 'Egyptian Company for Mobile Services', symbol: 'ETEL', market: 'EGX', price: 12.3, currency: 'EGP' },
        { id: 'cib', name: 'Credit Agricole Egypt', symbol: 'CIB', market: 'EGX', price: 45.2, currency: 'EGP' }
      ]
    },
    SA: {
      stocks: [
        { id: 'aramco', name: 'Saudi Arabian Oil Company', symbol: '2222', market: 'Tadawul', price: 35.4, currency: 'SAR' },
        { id: 'sabic', name: 'Saudi Basic Industries Corporation', symbol: '2010', market: 'Tadawul', price: 89.2, currency: 'SAR' },
        { id: 'stc', name: 'Saudi Telecom Company', symbol: '7010', market: 'Tadawul', price: 124.5, currency: 'SAR' }
      ]
    },
    AE: {
      stocks: [
        { id: 'emaar', name: 'Emaar Properties', symbol: 'EMAAR', market: 'DFM', price: 5.12, currency: 'AED' },
        { id: 'adcb', name: 'Abu Dhabi Commercial Bank', symbol: 'ADCB', market: 'ADX', price: 8.45, currency: 'AED' },
        { id: 'enbd', name: 'Emirates NBD Bank', symbol: 'ENBD', market: 'DFM', price: 15.3, currency: 'AED' }
      ]
    },
    KW: {
      stocks: [
        { id: 'nbk', name: 'National Bank of Kuwait', symbol: 'NBK', market: 'Boursa Kuwait', price: 1.125, currency: 'KWD' },
        { id: 'zain', name: 'Mobile Telecommunications Company', symbol: 'ZAIN', market: 'Boursa Kuwait', price: 0.645, currency: 'KWD' }
      ]
    }
  };

  const cryptoAssets: Asset[] = [
    { id: 'btc', name: 'Bitcoin', symbol: 'BTC', market: 'Global', price: 43250, currency: 'USD' },
    { id: 'eth', name: 'Ethereum', symbol: 'ETH', market: 'Global', price: 2580, currency: 'USD' },
    { id: 'bnb', name: 'Binance Coin', symbol: 'BNB', market: 'Global', price: 315, currency: 'USD' }
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    toast({
      title: "🎉 Asset Added Successfully!",
      description: `${selectedAsset?.name} has been added to your portfolio`,
    });
    
    // Reset form
    setCurrentStep(1);
    setSelectedCountry('');
    setSelectedAssetType('');
    setSelectedAsset(null);
    setPurchaseDetails({ quantity: '', price: '', date: '' });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-center">Select Your Market</h3>
            <p className="text-muted-foreground text-center">Choose the country where you want to invest</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {countries.map((country) => (
                <Card
                  key={country.code}
                  className={`cursor-pointer transition-all hover:electric-glow ${
                    selectedCountry === country.code ? 'border-primary bg-primary/10' : 'glass-card'
                  }`}
                  onClick={() => setSelectedCountry(country.code)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{country.flag}</span>
                      <div>
                        <h4 className="font-semibold" dir="auto">{country.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {country.market} • {country.currency}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-center">Choose Asset Type</h3>
            <p className="text-muted-foreground text-center">What type of investment are you adding?</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assetTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <Card
                    key={type.id}
                    className={`cursor-pointer transition-all hover:electric-glow ${
                      selectedAssetType === type.id ? 'border-primary bg-primary/10' : 'glass-card'
                    }`}
                    onClick={() => setSelectedAssetType(type.id)}
                  >
                    <CardContent className="p-6 text-center">
                      <Icon className={`w-8 h-8 mx-auto mb-2 ${type.color}`} />
                      <h4 className="font-medium" dir="auto">{type.name}</h4>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );

      case 3:
        const availableAssets = selectedAssetType === 'crypto' 
          ? cryptoAssets 
          : assetsByCountry[selectedCountry]?.[selectedAssetType] || [];

        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-center">Select Asset</h3>
            <p className="text-muted-foreground text-center">Choose the specific asset to add</p>
            
            {availableAssets.length > 0 ? (
              <div className="space-y-3">
                {availableAssets.map((asset) => (
                  <Card
                    key={asset.id}
                    className={`cursor-pointer transition-all hover:electric-glow ${
                      selectedAsset?.id === asset.id ? 'border-primary bg-primary/10' : 'glass-card'
                    }`}
                    onClick={() => setSelectedAsset(asset)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold">{asset.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {asset.symbol} • {asset.market}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-success">
                            {asset.price.toLocaleString()} {asset.currency}
                          </p>
                          <p className="text-xs text-muted-foreground">Current Price</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="glass-card">
                <CardContent className="p-8 text-center">
                  <PlusCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h4 className="font-semibold mb-2">Manual Entry</h4>
                  <p className="text-muted-foreground">
                    Enter your asset details manually
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-center">Purchase Details</h3>
            <p className="text-muted-foreground text-center">Enter your investment details</p>
            
            {selectedAsset && (
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">{selectedAsset.name}</h4>
                      <p className="text-sm text-muted-foreground">{selectedAsset.symbol}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-success">
                        {selectedAsset.price.toLocaleString()} {selectedAsset.currency}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity/Shares</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="Enter quantity"
                  value={purchaseDetails.quantity}
                  onChange={(e) => setPurchaseDetails({...purchaseDetails, quantity: e.target.value})}
                  className="bg-secondary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Purchase Price</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="Enter purchase price"
                  value={purchaseDetails.price}
                  onChange={(e) => setPurchaseDetails({...purchaseDetails, price: e.target.value})}
                  className="bg-secondary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Purchase Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={purchaseDetails.date}
                  onChange={(e) => setPurchaseDetails({...purchaseDetails, date: e.target.value})}
                  className="bg-secondary/50"
                />
              </div>

              {purchaseDetails.quantity && purchaseDetails.price && (
                <Card className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Investment:</span>
                      <span className="text-xl font-bold text-primary">
                        {(parseFloat(purchaseDetails.quantity) * parseFloat(purchaseDetails.price)).toLocaleString()} {selectedAsset?.currency}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return selectedCountry !== '';
      case 2: return selectedAssetType !== '';
      case 3: return selectedAsset !== null;
      case 4: return purchaseDetails.quantity && purchaseDetails.price && purchaseDetails.date;
      default: return false;
    }
  };

  return (
    <Card className="glass-card w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-gradient-electric">
          Add New Investment
        </CardTitle>
        
        {/* Progress Steps */}
        <div className="flex justify-center mt-6">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <React.Fragment key={step}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                  step <= currentStep ? 'gradient-electric text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-8 h-1 ${step < currentStep ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {renderStepContent()}
        
        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          {currentStep === 4 ? (
            <Button
              onClick={handleFinish}
              disabled={!isStepValid()}
              className="gradient-electric text-primary-foreground flex items-center gap-2"
            >
              Complete
              <PlusCircle className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="gradient-electric text-primary-foreground flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioManager;