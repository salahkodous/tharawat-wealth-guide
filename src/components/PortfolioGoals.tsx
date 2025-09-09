import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  TrendingUp, 
  Calendar, 
  Plus,
  DollarSign,
  PieChart,
  Percent
} from 'lucide-react';
import GoalManager from '@/components/GoalManager';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';

interface Goal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  category: string;
  status: string;
  monthly_saving_amount?: number;
}

interface Asset {
  id: string;
  asset_name: string;
  asset_type: string;
  country: string;
  quantity: number;
  purchase_price: number;
  current_price?: number;
  metadata?: any;
}

interface PortfolioGoalsProps {
  assets: Asset[];
  totalValue: number;
}

const PortfolioGoals: React.FC<PortfolioGoalsProps> = ({ assets, totalValue }) => {
  const { user } = useAuth();
  const { formatAmount, convertAmount, currency } = useCurrency();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isGoalManagerOpen, setIsGoalManagerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  const fetchGoals = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAssetCurrency = (asset: Asset) => {
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

  const calculatePortfolioTargetProgress = () => {
    const portfolioTargetGoals = goals.filter(goal => 
      goal.category === 'portfolio' || goal.title.toLowerCase().includes('portfolio')
    );
    
    if (portfolioTargetGoals.length === 0) return null;
    
    const mainGoal = portfolioTargetGoals[0];
    const progress = Math.min((totalValue / mainGoal.target_amount) * 100, 100);
    
    return {
      goal: mainGoal,
      progress,
      remaining: Math.max(mainGoal.target_amount - totalValue, 0)
    };
  };

  const calculateSectorAllocation = () => {
    const sectorBreakdown: { [key: string]: { value: number; target?: number } } = {};
    
    assets.forEach(asset => {
      const quantity = asset.quantity || 1;
      const currentPrice = asset.current_price || asset.purchase_price || 0;
      const assetValue = convertAmount(quantity * currentPrice, getAssetCurrency(asset), currency);
      
      if (!sectorBreakdown[asset.asset_type]) {
        sectorBreakdown[asset.asset_type] = { value: 0 };
      }
      sectorBreakdown[asset.asset_type].value += assetValue;
    });

    // Add target allocations from goals
    const allocationGoals = goals.filter(goal => 
      goal.category === 'allocation' || goal.title.toLowerCase().includes('allocation')
    );
    
    allocationGoals.forEach(goal => {
      const assetType = goal.title.toLowerCase().includes('stocks') ? 'stocks' :
                       goal.title.toLowerCase().includes('real estate') ? 'real_estate' :
                       goal.title.toLowerCase().includes('crypto') ? 'crypto' :
                       goal.title.toLowerCase().includes('gold') ? 'gold' :
                       goal.title.toLowerCase().includes('bonds') ? 'bonds' : null;
      
      if (assetType && sectorBreakdown[assetType]) {
        sectorBreakdown[assetType].target = goal.target_amount;
      }
    });

    return sectorBreakdown;
  };

  const portfolioProgress = calculatePortfolioTargetProgress();
  const sectorAllocation = calculateSectorAllocation();
  const activeGoals = goals.filter(goal => goal.status === 'active');

  if (loading) {
    return (
      <Card className="glass-card border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-24">
            <div className="text-sm text-muted-foreground">Loading goals...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Portfolio Goals
          </CardTitle>
          <Dialog open={isGoalManagerOpen} onOpenChange={setIsGoalManagerOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Manage Goals
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <GoalManager />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {activeGoals.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Portfolio Goals Set</h3>
            <p className="text-muted-foreground mb-4">
              Set portfolio targets to track your investment progress
            </p>
            <Dialog open={isGoalManagerOpen} onOpenChange={setIsGoalManagerOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create Your First Goal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <GoalManager />
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Portfolio Value Target */}
            {portfolioProgress && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-success" />
                    <span className="font-medium">{portfolioProgress.goal.title}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {portfolioProgress.progress.toFixed(1)}% complete
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current: {formatAmount(totalValue)}</span>
                    <span>Target: {formatAmount(portfolioProgress.goal.target_amount)}</span>
                  </div>
                  <Progress value={portfolioProgress.progress} className="h-2" />
                  {portfolioProgress.remaining > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {formatAmount(portfolioProgress.remaining)} remaining to reach target
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Sector Allocation Goals */}
            {Object.keys(sectorAllocation).some(sector => sectorAllocation[sector].target) && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-primary" />
                  <span className="font-medium">Sector Allocation Targets</span>
                </div>
                <div className="space-y-2">
                  {Object.entries(sectorAllocation).map(([sector, data]) => {
                    if (!data.target) return null;
                    const progress = Math.min((data.value / data.target) * 100, 100);
                    
                    return (
                      <div key={sector} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{sector.replace('_', ' ')}</span>
                          <span>{progress.toFixed(1)}%</span>
                        </div>
                        <Progress value={progress} className="h-1" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Other Active Goals */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="font-medium">Active Goals</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeGoals.slice(0, 4).map((goal) => {
                  const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
                  
                  return (
                    <div key={goal.id} className="p-3 rounded-lg bg-secondary/20 border">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-medium">{goal.title}</span>
                          <Badge variant="secondary" className="text-xs">
                            {progress.toFixed(0)}%
                          </Badge>
                        </div>
                        <Progress value={progress} className="h-1" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{formatAmount(goal.current_amount)}</span>
                          <span>{formatAmount(goal.target_amount)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {activeGoals.length > 4 && (
                <Dialog open={isGoalManagerOpen} onOpenChange={setIsGoalManagerOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full text-sm">
                      View All {activeGoals.length} Goals
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <GoalManager />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PortfolioGoals;
