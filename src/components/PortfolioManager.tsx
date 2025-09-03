import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  ArrowRight, 
  Calendar as CalendarIcon,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import AssetBrowser from '@/components/AssetBrowser';

interface PortfolioManagerProps {
  onAssetAdded?: () => void;
}

const PortfolioManager = ({ onAssetAdded }: PortfolioManagerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAssetType, setSelectedAssetType] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState<Date>();
  const [loading, setLoading] = useState(false);

  const handleAssetSelect = (asset: any, type: string) => {
    setSelectedAssetType(type);
    setSelectedAsset(asset);
    
    // Set default values based on asset type and current market price
    if (asset.price || asset.current_price || asset.price_usd) {
      const currentPrice = asset.price || asset.current_price || asset.price_usd || asset.exchange_rate;
      setPurchasePrice(currentPrice?.toString() || '');
    }
    
    nextStep();
  };

  // Real market data will be loaded from AssetBrowser component

  const saveAsset = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // First ensure user has a portfolio
      let { data: portfolio } = await supabase
        .from('portfolios')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (!portfolio) {
        const { data: newPortfolio, error: portfolioError } = await supabase
          .from('portfolios')
          .insert({ user_id: user.id, name: 'My Portfolio' })
          .select()
          .single();
        
        if (portfolioError) throw portfolioError;
        portfolio = newPortfolio;
      }

      // Prepare asset data
      const getAssetName = () => {
        if (selectedAsset.name) return selectedAsset.name;
        if (selectedAsset.product_name) return selectedAsset.product_name;
        if (selectedAsset.neighborhood_name) return selectedAsset.neighborhood_name + ', ' + selectedAsset.city_name;
        return 'Unknown Asset';
      };

      const getCurrentPrice = () => {
        return selectedAsset.price || 
               selectedAsset.current_price || 
               selectedAsset.price_usd || 
               selectedAsset.exchange_rate || 
               parseFloat(purchasePrice) || 0;
      };

      const assetData = {
        portfolio_id: portfolio.id,
        user_id: user.id,
        country: selectedAsset.country || 'Unknown',
        asset_type: selectedAssetType,
        asset_name: getAssetName(),
        symbol: selectedAsset.symbol || null,
        quantity: parseFloat(quantity) || 1,
        purchase_price: parseFloat(purchasePrice) || 0,
        current_price: getCurrentPrice(),
        purchase_date: purchaseDate?.toISOString().split('T')[0],
        city: selectedAsset.city_name || null,
        district: selectedAsset.neighborhood_name || null,
        property_type: selectedAsset.property_type || null,
        area_sqm: selectedAsset.area_sqm || null,
        metadata: {
          original_asset_id: selectedAsset.id,
          source: selectedAsset.source || selectedAsset.exchange || null,
          additional_data: selectedAsset
        }
      };

      const { error } = await supabase.from('assets').insert(assetData);
      
      if (error) throw error;

      toast({
        title: "Asset Added Successfully!",
        description: `${getAssetName()} has been added to your portfolio.`,
      });

      resetForm();
      onAssetAdded?.();
    } catch (error) {
      console.error('Error saving asset:', error);
      toast({
        title: "Error",
        description: "Failed to add asset. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedAssetType('');
    setSelectedAsset(null);
    setQuantity('');
    setPurchasePrice('');
    setPurchaseDate(undefined);
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedAsset !== null;
      case 2: return quantity !== '' && purchasePrice !== '' && purchaseDate !== undefined;
      default: return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Browse & Select Assets</h3>
              <p className="text-muted-foreground">Choose from real market data across MENA region</p>
            </div>
            
            <AssetBrowser 
              onAssetSelect={handleAssetSelect}
              selectedAssetType={selectedAssetType}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Purchase Details</h3>
              <p className="text-muted-foreground">Enter your investment details</p>
            </div>

            {selectedAsset && (
              <Card className="bg-secondary/20 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">
                        {selectedAsset.name || selectedAsset.product_name || 
                         (selectedAsset.neighborhood_name + ', ' + selectedAsset.city_name)}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedAsset.symbol || selectedAsset.bank_name} • {selectedAssetType}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">Current Price</p>
                      <p className="text-lg">
                        {selectedAsset.price || selectedAsset.current_price || 
                         selectedAsset.price_usd || selectedAsset.exchange_rate || 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="quantity">
                  {selectedAssetType === 'real_estate' ? 'Number of Properties' : 
                   selectedAssetType === 'banking' ? 'Investment Amount' : 'Quantity/Shares'}
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="Enter quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Purchase Price (per unit)</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  placeholder="Enter purchase price"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Purchase Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !purchaseDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {purchaseDate ? format(purchaseDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={purchaseDate}
                      onSelect={setPurchaseDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {quantity && purchasePrice && (
                <div className="md:col-span-2">
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Investment:</span>
                        <span className="text-xl font-bold text-primary">
                          ${(parseFloat(quantity) * parseFloat(purchasePrice)).toLocaleString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="glass-card w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-gradient-electric text-2xl">
          Add New Investment
        </CardTitle>
        
        {/* Progress Steps */}
        <div className="flex justify-center mt-6">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <React.Fragment key={step}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step <= currentStep ? 'gradient-electric text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-12 h-1 ${step < currentStep ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {renderStep()}
        
        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            onClick={prevStep}
            disabled={currentStep === 1}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          {currentStep === 4 ? (
            <Button 
              onClick={saveAsset}
              className="gradient-electric w-full max-w-xs"
              disabled={loading || !canProceed()}
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              {loading ? 'Saving...' : 'Save Asset'}
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="gradient-electric flex items-center gap-2"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioManager;