import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  Home, 
  Factory, 
  MapPin,
  Target,
  Calendar,
  DollarSign
} from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import Navigation from '@/components/Navigation';
import PortfolioTable from '@/components/PortfolioTable';
import PortfolioManager from '@/components/PortfolioManager';
import PortfolioSummary from '@/components/PortfolioSummary';
import EnhancedPortfolioOverview from '@/components/EnhancedPortfolioOverview';
import { supabase } from '@/integrations/supabase/client';
import { useCurrency } from '@/hooks/useCurrency';

interface Asset {
  id: string;
  name: string;
  type: string;
  country: string;
  symbol?: string;
  quantity: number;
  purchase_price: number;
  current_price?: number;
  purchase_date?: string;
}

interface Goal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  category: string;
  status: string;
  ai_strategy?: string;
}

const Portfolio = () => {
  const { formatAmount } = useCurrency();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Mock data for demonstration
    setAssets([
      {
        id: '1',
        name: 'Saudi Aramco',
        type: 'stocks',
        country: 'Saudi Arabia',
        symbol: 'ARAMCO',
        quantity: 100,
        purchase_price: 32.5,
        current_price: 35.2
      },
      {
        id: '2', 
        name: 'Dubai Real Estate',
        type: 'real_estate',
        country: 'UAE',
        quantity: 1,
        purchase_price: 850000,
        current_price: 920000
      }
    ]);
    
    setGoals([
      {
        id: '1',
        title: 'Retirement Fund',
        target_amount: 2000000,
        current_amount: 650000,
        target_date: '2040-12-31',
        category: 'retirement',
        status: 'active',
        ai_strategy: 'Diversify across real estate and blue-chip stocks'
      }
    ]);
    
    setLoading(false);
  }, []);

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'stocks': return TrendingUp;
      case 'crypto': return Factory;
      case 'real_estate': return Building2;
      case 'gold': return DollarSign;
      case 'bonds': return Home;
      default: return Building2;
    }
  };

  const getAssetTypeColor = (type: string) => {
    switch (type) {
      case 'stocks': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'crypto': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'real_estate': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'gold': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'bonds': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const calculateTotalValue = () => {
    return assets.reduce((total, asset) => {
      const quantity = asset.quantity || 1;
      const currentPrice = asset.current_price || asset.purchase_price || 0;
      return total + (quantity * currentPrice);
    }, 0);
  };

  const calculateTotalGains = () => {
    return assets.reduce((total, asset) => {
      const quantity = asset.quantity || 1;
      const purchasePrice = asset.purchase_price || 0;
      const currentPrice = asset.current_price || purchasePrice;
      return total + ((currentPrice - purchasePrice) * quantity);
    }, 0);
  };

  const totalValue = calculateTotalValue();
  const totalGains = calculateTotalGains();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10">
        <Navigation />
        
        <section className="py-8">
          <div className="container mx-auto px-4 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Portfolio Management</h1>
                <p className="text-muted-foreground">Manage your investments and track performance</p>
              </div>
              
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Investment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <PortfolioManager />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass-card border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{formatAmount(totalValue)}</div>
                  <p className="text-xs text-muted-foreground">+2.5% from last month</p>
                </CardContent>
              </Card>

              <Card className="glass-card border-success/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Gains</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">{formatAmount(totalGains)}</div>
                  <p className="text-xs text-muted-foreground">+12.5% return</p>
                </CardContent>
              </Card>

              <Card className="glass-card border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
                  <Target className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{goals.length}</div>
                  <p className="text-xs text-muted-foreground">Financial objectives</p>
                </CardContent>
              </Card>
            </div>

            <EnhancedPortfolioOverview />
            
            <PortfolioTable />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    Portfolio Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Risk Score</span>
                      <span className="text-sm font-medium">7.2/10</span>
                    </div>
                    <Progress value={72} className="h-2" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Diversification</span>
                      <span className="text-sm font-medium">Good</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Allocation Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Stocks (MENA)</span>
                        <span>45%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Real Estate</span>
                        <span>35%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cash & Bonds</span>
                        <span>20%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-500" />
                    Performance Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Best Performer: Saudi Aramco (+15.2%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Underperformer: UAE Tech ETF (-3.1%)</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Recommendations</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>• Consider increasing exposure to Dubai real estate</p>
                      <p>• Reduce concentration in single stocks</p>
                      <p>• Add Islamic bonds for stability</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Portfolio;