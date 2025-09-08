import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TrendingUp, TrendingDown, MoreHorizontal, Edit3, BarChart3, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';
import PortfolioManager from '@/components/PortfolioManager';

const PortfolioTable = () => {
  const { user } = useAuth();
  const { formatAmount, convertAmount, currency } = useCurrency();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchAssets();
    }
  }, [user]);

  const fetchAssets = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error('Error fetching assets:', error);
      toast({
        title: "Error",
        description: "Failed to load portfolio assets.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getAssetCurrency = (asset: any) => {
    // Real estate always uses local currency
    if (asset.asset_type === 'real_estate' || asset.asset_type === 'Real Estate') {
      if (asset.country === 'Egypt') return 'EGP';
      if (asset.country === 'Saudi Arabia') return 'SAR';
      if (asset.country === 'UAE') return 'AED';
      if (asset.country === 'Qatar') return 'QAR';
      if (asset.country === 'Kuwait') return 'KWD';
      if (asset.country === 'Bahrain') return 'BHD';
      if (asset.country === 'Oman') return 'OMR';
      if (asset.country === 'Jordan') return 'JOD';
      return 'USD'; // fallback for international real estate
    }
    
    // For crypto and global assets, they're usually stored in USD
    if (asset.asset_type === 'crypto' || asset.asset_type === 'cryptocurrencies') return 'USD';
    
    // For local assets, use the country's currency
    if (asset.country === 'Egypt') return 'EGP';
    if (asset.country === 'Saudi Arabia') return 'SAR';
    if (asset.country === 'UAE') return 'AED';
    if (asset.country === 'Qatar') return 'QAR';
    if (asset.country === 'Kuwait') return 'KWD';
    if (asset.country === 'Bahrain') return 'BHD';
    if (asset.country === 'Oman') return 'OMR';
    if (asset.country === 'Jordan') return 'JOD';
    
    // Global assets default to USD
    return 'USD';
  };

  const calculateAssetMetrics = (asset: any) => {
    const purchaseValue = (asset.purchase_price || 0) * (asset.quantity || 0);
    const currentValue = (asset.current_price || asset.purchase_price || 0) * (asset.quantity || 0);
    const change = currentValue - purchaseValue;
    const changePercent = purchaseValue > 0 ? (change / purchaseValue) * 100 : 0;

    return {
      value: currentValue,
      change,
      changePercent,
      purchaseValue
    };
  };

  const holdings = assets.map(asset => {
    const metrics = calculateAssetMetrics(asset);
    return {
      id: asset.id,
      name: asset.asset_name,
      symbol: asset.symbol || asset.asset_type,
      type: asset.asset_type?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Unknown',
      country: asset.country,
      quantity: asset.quantity,
      avgPrice: asset.purchase_price,
      currentPrice: asset.current_price || asset.purchase_price,
      value: metrics.value,
      change: metrics.change,
      changePercent: metrics.changePercent,
      currency: getAssetCurrency(asset),
      rawAsset: asset
    };
  });

  const totalValue = holdings.reduce((sum, holding) => {
    // Only convert if asset currency is different from user currency
    if (holding.currency === currency) {
      return sum + holding.value;
    }
    return sum + convertAmount(holding.value, holding.currency, currency);
  }, 0);
  
  const totalChange = holdings.reduce((sum, holding) => {
    // Only convert if asset currency is different from user currency
    if (holding.currency === currency) {
      return sum + holding.change;
    }
    return sum + convertAmount(holding.change, holding.currency, currency);
  }, 0);
  
  const totalPurchaseValue = holdings.reduce((sum, holding) => {
    const purchaseValue = (holding.avgPrice || 0) * (holding.quantity || 0);
    // Only convert if asset currency is different from user currency
    if (holding.currency === currency) {
      return sum + purchaseValue;
    }
    return sum + convertAmount(purchaseValue, holding.currency, currency);
  }, 0);
  
  const totalChangePercent = totalPurchaseValue > 0 ? (totalChange / totalPurchaseValue) * 100 : 0;

  const handleEdit = (asset: any) => {
    setSelectedAsset(asset);
    setEditDialogOpen(true);
  };

  const handleAnalyze = async (asset: any) => {
    setIsAnalyzing(asset.id);
    
    try {
      toast({
        title: "Analysis Starting",
        description: `Analyzing ${asset.name} performance...`,
      });

      const { data, error } = await supabase.functions.invoke('ai-investment-analysis', {
        body: {
          assetName: asset.name,
          assetType: asset.type,
          currentPrice: asset.currentPrice,
          avgPrice: asset.avgPrice,
          quantity: asset.quantity,
          country: asset.country,
          currency: asset.currency
        }
      });

      if (error) throw error;

      toast({
        title: "Analysis Complete",
        description: "Check the AI Assistant page for detailed insights.",
      });
      
    } catch (error) {
      console.error('Analysis Error:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze asset. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(null);
    }
  };

  const handleDelete = async (asset: any) => {
    if (window.confirm(`Are you sure you want to delete ${asset.name} from your portfolio?`)) {
      try {
        const { error } = await supabase
          .from('assets')
          .delete()
          .eq('id', asset.id);

        if (error) throw error;

        toast({
          title: "Asset Removed",
          description: `${asset.name} has been removed from your portfolio.`,
        });

        // Refresh assets list
        fetchAssets();
      } catch (error) {
        console.error('Error deleting asset:', error);
        toast({
          title: "Error",
          description: "Failed to delete asset. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-lg text-muted-foreground">Loading portfolio...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="glass-card">
        <CardContent className="text-center py-12">
          <div className="text-lg text-muted-foreground">Please sign in to view your portfolio.</div>
        </CardContent>
      </Card>
    );
  }

  if (assets.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="text-center py-12">
          <div className="text-lg font-medium text-muted-foreground mb-2">Your portfolio is empty</div>
          <div className="text-sm text-muted-foreground">Add some investments to get started.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Portfolio Holdings</CardTitle>
          <div className="text-right">
            <div className="text-2xl font-bold">{formatAmount(totalValue)}</div>
            <div className={`flex items-center gap-1 text-sm font-medium ${
              totalChange >= 0 ? 'text-success' : 'text-destructive'
            }`}>
              {totalChange >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {formatAmount(Math.abs(totalChange))} ({totalChangePercent.toFixed(2)}%)
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Country</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Avg Price</TableHead>
                <TableHead className="text-right">Current Price</TableHead>
                <TableHead className="text-right">Market Value</TableHead>
                <TableHead className="text-right">P&L</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {holdings.map((holding) => (
                <TableRow key={holding.id} className="hover:bg-secondary/30">
                  <TableCell>
                    <div>
                      <div className="font-medium">{holding.name}</div>
                      <div className="text-sm text-muted-foreground">{holding.symbol}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      holding.type === 'Stock' ? 'bg-blue-500/20 text-blue-500' :
                      holding.type === 'Real Estate' ? 'bg-green-500/20 text-green-500' :
                      holding.type === 'Crypto' ? 'bg-orange-500/20 text-orange-500' :
                      'bg-gray-500/20 text-gray-500'
                    }`}>
                      {holding.type}
                    </span>
                  </TableCell>
                  <TableCell>{holding.country}</TableCell>
                  <TableCell className="text-right">
                    {holding.type === 'Real Estate' ? '1 unit' : 
                     holding.type === 'Crypto' ? holding.quantity.toString() : 
                     holding.quantity.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {holding.currency === currency ? 
                      formatAmount(holding.avgPrice) : 
                      formatAmount(holding.avgPrice, holding.currency)}
                  </TableCell>
                  <TableCell className="text-right">
                    {holding.currency === currency ? 
                      formatAmount(holding.currentPrice) : 
                      formatAmount(holding.currentPrice, holding.currency)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {holding.currency === currency ? 
                      formatAmount(holding.value) : 
                      formatAmount(convertAmount(holding.value, holding.currency, currency))}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className={`${
                      holding.change >= 0 ? 'text-success' : 'text-destructive'
                    }`}>
                      <div className="font-medium">
                        {holding.change >= 0 ? '+' : ''}{holding.currency === currency ? 
                          formatAmount(holding.change) : 
                          formatAmount(convertAmount(holding.change, holding.currency, currency))}
                      </div>
                      <div className="text-sm">
                        ({holding.change >= 0 ? '+' : ''}{holding.changePercent.toFixed(2)}%)
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(holding)}>
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleAnalyze(holding)}
                          disabled={isAnalyzing === holding.id}
                        >
                          <BarChart3 className="w-4 h-4 mr-2" />
                          {isAnalyzing === holding.id ? 'Analyzing...' : 'Analyze'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(holding)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Asset: {selectedAsset?.name}</DialogTitle>
          </DialogHeader>
          <PortfolioManager 
            onAssetAdded={() => {
              setEditDialogOpen(false);
              fetchAssets(); // Refresh portfolio data
            }}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PortfolioTable;