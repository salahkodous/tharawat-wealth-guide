import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  PlusCircle,
  Building,
  Coins,
  TrendingDown as TrendingDownIcon,
  Building2,
  Landmark,
  Sparkles,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import AnimatedBackground from '@/components/AnimatedBackground';
import TharawatLogo from '@/components/TharawatLogo';
import PortfolioManager from '@/components/PortfolioManager';

interface Asset {
  id: string;
  asset_name: string;
  asset_type: string;
  country: string;
  symbol?: string;
  quantity?: number;
  purchase_price?: number;
  current_price?: number;
  purchase_date?: string;
  city?: string;
  district?: string;
  property_type?: string;
  area_sqm?: number;
  metadata?: any;
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
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddAsset, setShowAddAsset] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAssets();
      fetchGoals();
    }
  }, [user]);

  const fetchAssets = async () => {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAssets(data);
    }
    setLoading(false);
  };

  const fetchGoals = async () => {
    const { data, error } = await supabase
      .from('financial_goals')
      .select('*')
      .eq('user_id', user?.id)
      .eq('status', 'active')
      .order('target_date', { ascending: true });

    if (!error && data) {
      setGoals(data);
    }
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'stocks': return TrendingUp;
      case 'crypto': return Coins;
      case 'real_estate': return Building;
      case 'gold': return DollarSign;
      case 'bonds': return Landmark;
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
  const gainsPercentage = totalValue > 0 ? (totalGains / (totalValue - totalGains)) * 100 : 0;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/20 backdrop-blur-md bg-background/80">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <TharawatLogo size="lg" />
              <Button 
                onClick={() => setShowAddAsset(true)}
                className="gradient-electric"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Asset
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Portfolio Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {assets.length} assets across {new Set(assets.map(a => a.country)).size} countries
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Gains/Loss</CardTitle>
                {totalGains >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-400" />
                ) : (
                  <TrendingDownIcon className="h-4 w-4 text-red-400" />
                )}
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${totalGains >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${totalGains.toLocaleString()}
                </div>
                <p className={`text-xs ${totalGains >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {gainsPercentage > 0 ? '+' : ''}{gainsPercentage.toFixed(2)}% from cost basis
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{goals.length}</div>
                <p className="text-xs text-muted-foreground">
                  Financial objectives in progress
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="assets" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="assets">Assets</TabsTrigger>
              <TabsTrigger value="goals">Goals</TabsTrigger>
              <TabsTrigger value="insights">AI Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="assets" className="space-y-4">
              {assets.length === 0 ? (
                <Card className="glass-card">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Building className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Assets Yet</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      Start building your portfolio by adding your first investment
                    </p>
                    <Button 
                      onClick={() => setShowAddAsset(true)}
                      className="gradient-electric"
                    >
                      Add Your First Asset
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {assets.map((asset) => {
                    const Icon = getAssetIcon(asset.asset_type);
                    const quantity = asset.quantity || 1;
                    const purchasePrice = asset.purchase_price || 0;
                    const currentPrice = asset.current_price || purchasePrice;
                    const totalValue = quantity * currentPrice;
                    const gains = (currentPrice - purchasePrice) * quantity;
                    const gainsPercent = purchasePrice > 0 ? (gains / (purchasePrice * quantity)) * 100 : 0;

                    return (
                      <Card key={asset.id} className="glass-card">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="p-2 bg-primary/10 rounded-full">
                                <Icon className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{asset.asset_name}</h3>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge className={getAssetTypeColor(asset.asset_type)}>
                                    {asset.asset_type.replace('_', ' ').toUpperCase()}
                                  </Badge>
                                  <Badge variant="outline">{asset.country}</Badge>
                                  {asset.symbol && (
                                    <Badge variant="secondary">{asset.symbol}</Badge>
                                  )}
                                </div>
                                {asset.asset_type === 'real_estate' && asset.city && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {asset.city}, {asset.district} • {asset.property_type} • {asset.area_sqm}m²
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">${totalValue.toLocaleString()}</div>
                              <div className={`text-sm ${gains >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {gains >= 0 ? '+' : ''}${gains.toLocaleString()} ({gainsPercent.toFixed(2)}%)
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {quantity} @ ${currentPrice.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="goals" className="space-y-4">
              {goals.length === 0 ? (
                <Card className="glass-card">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Target className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Financial Goals</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      Set up your financial goals to get AI-powered strategies
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {goals.map((goal) => {
                    const progress = (goal.current_amount / goal.target_amount) * 100;
                    const remaining = goal.target_amount - goal.current_amount;

                    return (
                      <Card key={goal.id} className="glass-card">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{goal.title}</CardTitle>
                            <Badge>{goal.category.replace('_', ' ')}</Badge>
                          </div>
                          <CardDescription>
                            ${goal.current_amount.toLocaleString()} of ${goal.target_amount.toLocaleString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <Progress value={progress} className="w-full" />
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{progress.toFixed(1)}% complete</span>
                            <span className="text-muted-foreground">${remaining.toLocaleString()} remaining</span>
                          </div>
                          {goal.target_date && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4 mr-2" />
                              Target: {new Date(goal.target_date).toLocaleDateString()}
                            </div>
                          )}
                          {goal.ai_strategy && (
                            <Alert>
                              <Sparkles className="h-4 w-4" />
                              <AlertDescription>
                                <strong>AI Strategy:</strong> {goal.ai_strategy}
                              </AlertDescription>
                            </Alert>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-primary" />
                    AI-Powered Portfolio Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Diversification Recommendation:</strong> Consider adding more real estate exposure to balance your portfolio across different asset classes.
                    </AlertDescription>
                  </Alert>
                  
                  <Alert>
                    <TrendingUp className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Market Opportunity:</strong> Saudi Aramco shows strong fundamentals with upcoming dividend announcement expected next month.
                    </AlertDescription>
                  </Alert>
                  
                  <Alert>
                    <Building className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Real Estate Alert:</strong> Dubai property market showing 8% YoY growth. Consider rebalancing real estate allocation.
                    </AlertDescription>
                  </Alert>

                  <Card className="bg-primary/5 border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-sm">Recent Market News</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-sm">
                        <p className="font-medium">EGX30 reaches new highs amid economic reforms</p>
                        <p className="text-muted-foreground text-xs">Egypt's main index gains 3.2% following IMF deal completion</p>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">UAE Central Bank maintains interest rates</p>
                        <p className="text-muted-foreground text-xs">Decision supports real estate and banking sectors</p>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">Saudi Vision 2030 drives tech investments</p>
                        <p className="text-muted-foreground text-xs">NEOM project attracts $500B in commitments</p>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Add Asset Modal */}
      {showAddAsset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Add New Asset</h2>
                <Button variant="ghost" onClick={() => setShowAddAsset(false)}>
                  ×
                </Button>
              </div>
              <PortfolioManager onAssetAdded={() => {
                setShowAddAsset(false);
                fetchAssets();
              }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;