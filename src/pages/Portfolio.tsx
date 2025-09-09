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
  DollarSign,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import Navigation from '@/components/Navigation';
import PortfolioTable from '@/components/PortfolioTable';
import PortfolioManager from '@/components/PortfolioManager';
import PortfolioSummary from '@/components/PortfolioSummary';
import EnhancedPortfolioOverview from '@/components/EnhancedPortfolioOverview';
import PortfolioGoals from '@/components/PortfolioGoals';
import { supabase } from '@/integrations/supabase/client';
import { useCurrency } from '@/hooks/useCurrency';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Asset {
  id: string;
  asset_name: string;
  asset_type: string;
  country: string;
  symbol?: string;
  quantity: number;
  purchase_price: number;
  current_price?: number;
  purchase_date?: string;
  user_id: string;
  portfolio_id: string;
  city?: string;
  district?: string;
  property_type?: string;
  area_sqm?: number;
  created_at: string;
  updated_at: string;
  metadata?: any;
}

interface Goal {
  id: string;
  title: string;
  goal_type: string;
  target_value: number;
  current_value: number;
  target_percentage?: number;
  asset_type?: string;
  target_date?: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const Portfolio = () => {
  const { formatAmount, convertAmount, currency } = useCurrency();
  const { user } = useAuth();
  const { toast } = useToast();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchPortfolioData();
      const cleanup = setupRealtimeSubscription();
      return cleanup;
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchPortfolioData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);

      // Fetch assets
      const { data: assetsData, error: assetsError } = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', user.id);

      if (assetsError) throw assetsError;

      // Fetch portfolio goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('portfolio_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (goalsError) throw goalsError;

      setAssets(assetsData || []);
      setGoals(goalsData || []);
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      setError('Failed to load portfolio data. Please try again.');
      toast({
        title: "Error",
        description: "Failed to load portfolio data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user) return;

    const channel = supabase
      .channel('portfolio-realtime-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'assets', filter: `user_id=eq.${user.id}` },
        (payload) => {
          console.log('Assets updated via realtime:', payload);
          fetchPortfolioData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'portfolio_goals', filter: `user_id=eq.${user.id}` },
        (payload) => {
          console.log('Portfolio goals updated via realtime:', payload);
          fetchPortfolioData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'portfolios', filter: `user_id=eq.${user.id}` },
        (payload) => {
          console.log('Portfolios updated via realtime:', payload);
          fetchPortfolioData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

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

  const getAssetCurrency = (asset: Asset) => {
    // Check metadata for currency first
    if (asset.metadata?.additional_data?.currency) {
      return asset.metadata.additional_data.currency;
    }
    
    if (asset.country === 'Egypt') return 'EGP';
    if (asset.country === 'Saudi Arabia') return 'SAR';
    if (asset.country === 'UAE') return 'AED';
    if (asset.country === 'Qatar') return 'QAR';
    if (asset.country === 'Kuwait') return 'KWD';
    return 'USD';
  };

  const calculateTotalValue = () => {
    return assets.reduce((total, asset) => {
      const quantity = asset.quantity || 1;
      const currentPrice = asset.current_price || asset.purchase_price || 0;
      const assetValue = quantity * currentPrice;
      return total + convertAmount(assetValue, getAssetCurrency(asset), currency);
    }, 0);
  };

  const calculateTotalGains = () => {
    return assets.reduce((total, asset) => {
      const quantity = asset.quantity || 1;
      const purchasePrice = asset.purchase_price || 0;
      const currentPrice = asset.current_price || purchasePrice;
      const gain = (currentPrice - purchasePrice) * quantity;
      return total + convertAmount(gain, getAssetCurrency(asset), currency);
    }, 0);
  };

  const calculateGainsPercentage = () => {
    const totalInvested = assets.reduce((total, asset) => {
      const quantity = asset.quantity || 1;
      const purchasePrice = asset.purchase_price || 0;
      const investedValue = quantity * purchasePrice;
      return total + convertAmount(investedValue, getAssetCurrency(asset), currency);
    }, 0);
    
    if (totalInvested === 0) return 0;
    return (calculateTotalGains() / totalInvested) * 100;
  };

  const getAssetBreakdown = () => {
    const breakdown: { [key: string]: { value: number; percentage: number } } = {};
    const totalValue = calculateTotalValue();

    assets.forEach(asset => {
      const quantity = asset.quantity || 1;
      const currentPrice = asset.current_price || asset.purchase_price || 0;
      const assetValue = convertAmount(quantity * currentPrice, getAssetCurrency(asset), currency);
      
      if (!breakdown[asset.asset_type]) {
        breakdown[asset.asset_type] = { value: 0, percentage: 0 };
      }
      breakdown[asset.asset_type].value += assetValue;
    });

    // Calculate percentages
    Object.keys(breakdown).forEach(type => {
      breakdown[type].percentage = totalValue > 0 ? (breakdown[type].value / totalValue) * 100 : 0;
    });

    return breakdown;
  };

  const getBestPerformer = () => {
    if (assets.length === 0) return null;
    
    return assets.reduce((best, asset) => {
      const currentReturn = asset.current_price && asset.purchase_price 
        ? ((asset.current_price - asset.purchase_price) / asset.purchase_price) * 100 
        : 0;
      const bestReturn = best.current_price && best.purchase_price 
        ? ((best.current_price - best.purchase_price) / best.purchase_price) * 100 
        : 0;
      
      return currentReturn > bestReturn ? asset : best;
    });
  };

  const getWorstPerformer = () => {
    if (assets.length === 0) return null;
    
    return assets.reduce((worst, asset) => {
      const currentReturn = asset.current_price && asset.purchase_price 
        ? ((asset.current_price - asset.purchase_price) / asset.purchase_price) * 100 
        : 0;
      const worstReturn = worst.current_price && worst.purchase_price 
        ? ((worst.current_price - worst.purchase_price) / worst.purchase_price) * 100 
        : 0;
      
      return currentReturn < worstReturn ? asset : worst;
    });
  };

  const totalValue = calculateTotalValue();
  const totalGains = calculateTotalGains();
  const gainsPercentage = calculateGainsPercentage();
  const assetBreakdown = getAssetBreakdown();
  const bestPerformer = getBestPerformer();
  const worstPerformer = getWorstPerformer();

  if (loading) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10">
          <Navigation />
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-lg text-muted-foreground">Loading portfolio...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10">
          <Navigation />
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Portfolio Access</h2>
              <p className="text-muted-foreground">Please sign in to view your portfolio.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10">
          <Navigation />
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Error Loading Portfolio</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchPortfolioData}>Try Again</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                    <PortfolioManager onAssetAdded={() => {
                      setIsModalOpen(false);
                      fetchPortfolioData();
                    }} />
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
                  <p className="text-xs text-muted-foreground">
                    {gainsPercentage >= 0 ? '+' : ''}{gainsPercentage.toFixed(1)}% overall return
                  </p>
                </CardContent>
              </Card>

              <Card className={`glass-card ${totalGains >= 0 ? 'border-success/20' : 'border-destructive/20'}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Gains/Loss</CardTitle>
                  {totalGains >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${totalGains >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {totalGains >= 0 ? '+' : ''}{formatAmount(totalGains)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {gainsPercentage >= 0 ? '+' : ''}{gainsPercentage.toFixed(2)}% return
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
                  <Target className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{goals.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {goals.length} active
                  </p>
                </CardContent>
              </Card>
            </div>

            <PortfolioTable />
            
            <EnhancedPortfolioOverview />

            <PortfolioGoals assets={assets} totalValue={totalValue} />

            {assets.length > 0 && (
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
                        <span className="text-sm">Total Assets</span>
                        <span className="text-sm font-medium">{assets.length}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Portfolio Return</span>
                        <span className={`text-sm font-medium ${gainsPercentage >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {gainsPercentage >= 0 ? '+' : ''}{gainsPercentage.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={Math.min(Math.abs(gainsPercentage), 100)} className="h-2" />
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-2">Asset Type Breakdown</h4>
                      <div className="space-y-2 text-sm">
                        {Object.entries(assetBreakdown).map(([type, data]) => (
                          <div key={type} className="flex justify-between">
                            <span className="capitalize">{type.replace('_', ' ')}</span>
                            <span>{data.percentage.toFixed(1)}%</span>
                          </div>
                        ))}
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
                      {bestPerformer && (
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-success" />
                          <span className="text-sm">
                            Best: {bestPerformer.asset_name}
                            {bestPerformer.current_price && bestPerformer.purchase_price && (
                              <span className="text-success">
                                {' '}(+{(((bestPerformer.current_price - bestPerformer.purchase_price) / bestPerformer.purchase_price) * 100).toFixed(1)}%)
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                      {worstPerformer && (
                        <div className="flex items-center gap-2">
                          <TrendingDown className="h-4 w-4 text-destructive" />
                          <span className="text-sm">
                            Worst: {worstPerformer.asset_name}
                            {worstPerformer.current_price && worstPerformer.purchase_price && (
                              <span className="text-destructive">
                                {' '}({(((worstPerformer.current_price - worstPerformer.purchase_price) / worstPerformer.purchase_price) * 100).toFixed(1)}%)
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-2">AI Recommendations</h4>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        {goals.length === 0 && (
                          <p>• Set financial goals to get personalized advice</p>
                        )}
                        {assets.length < 3 && (
                          <p>• Consider diversifying with more asset types</p>
                        )}
                        {gainsPercentage < 0 && (
                          <p>• Review underperforming assets</p>
                        )}
                        {Object.keys(assetBreakdown).length === 1 && (
                          <p>• Add different asset classes for better diversification</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {assets.length === 0 && (
              <Card className="glass-card">
                <CardContent className="text-center py-12">
                  <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Start Your Investment Journey</h3>
                  <p className="text-muted-foreground mb-6">
                    Add your first investment to begin tracking your portfolio performance
                  </p>
                  <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add Your First Investment
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <PortfolioManager onAssetAdded={() => {
                        setIsModalOpen(false);
                        fetchPortfolioData();
                      }} />
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Portfolio;