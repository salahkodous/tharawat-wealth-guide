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
import { supabase } from '@/integrations/supabase/client';

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
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+2.5% from last month</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Gains</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">${totalGains.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+12.5% return</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
                  <Target className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{goals.length}</div>
                  <p className="text-xs text-muted-foreground">Financial objectives</p>
                </CardContent>
              </Card>
            </div>

            <PortfolioTable />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Portfolio;