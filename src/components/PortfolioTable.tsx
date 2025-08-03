import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TrendingUp, TrendingDown, MoreHorizontal, Edit3, BarChart3, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PortfolioManager from '@/components/PortfolioManager';

const PortfolioTable = () => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);
  const { toast } = useToast();
  const holdings = [
    {
      id: 1,
      name: 'Saudi Aramco',
      symbol: 'ARAMCO',
      type: 'Stock',
      country: 'Saudi Arabia',
      quantity: 100,
      avgPrice: 32.50,
      currentPrice: 34.20,
      value: 3420,
      change: 5.23,
      changePercent: 1.85
    },
    {
      id: 2,
      name: 'Commercial Intl Bank',
      symbol: 'COMI',
      type: 'Stock',
      country: 'Egypt',
      quantity: 500,
      avgPrice: 45.30,
      currentPrice: 47.10,
      value: 23550,
      change: 900,
      changePercent: 3.97
    },
    {
      id: 3,
      name: 'Dubai Properties',
      symbol: 'Real Estate',
      type: 'Real Estate',
      country: 'UAE',
      quantity: 1,
      avgPrice: 850000,
      currentPrice: 920000,
      value: 920000,
      change: 70000,
      changePercent: 8.24
    },
    {
      id: 4,
      name: 'Bitcoin',
      symbol: 'BTC',
      type: 'Crypto',
      country: 'Global',
      quantity: 0.5,
      avgPrice: 45000,
      currentPrice: 43200,
      value: 21600,
      change: -900,
      changePercent: -2.04
    },
    {
      id: 5,
      name: 'Kuwait Finance House',
      symbol: 'KFH',
      type: 'Stock',
      country: 'Kuwait',
      quantity: 200,
      avgPrice: 1.85,
      currentPrice: 1.92,
      value: 384,
      change: 14,
      changePercent: 3.78
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const totalValue = holdings.reduce((sum, holding) => sum + holding.value, 0);
  const totalChange = holdings.reduce((sum, holding) => sum + holding.change, 0);
  const totalChangePercent = (totalChange / (totalValue - totalChange)) * 100;

  const handleEdit = (asset: any) => {
    setSelectedAsset(asset);
    setEditDialogOpen(true);
  };

  const handleAnalyze = async (asset: any) => {
    setIsAnalyzing(asset.id.toString());
    
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
          country: asset.country
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
      toast({
        title: "Asset Removed",
        description: `${asset.name} has been removed from your portfolio.`,
      });
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Portfolio Holdings</CardTitle>
          <div className="text-right">
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <div className={`flex items-center gap-1 text-sm font-medium ${
              totalChange >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {totalChange >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {formatCurrency(Math.abs(totalChange))} ({totalChangePercent.toFixed(2)}%)
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
                    {formatCurrency(holding.avgPrice)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(holding.currentPrice)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(holding.value)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className={`${
                      holding.change >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      <div className="font-medium">
                        {holding.change >= 0 ? '+' : ''}{formatCurrency(holding.change)}
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
                          disabled={isAnalyzing === holding.id.toString()}
                        >
                          <BarChart3 className="w-4 h-4 mr-2" />
                          {isAnalyzing === holding.id.toString() ? 'Analyzing...' : 'Analyze'}
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
              // Refresh portfolio data here if needed
            }}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PortfolioTable;