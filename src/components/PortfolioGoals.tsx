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
  PieChart
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';
import { useTranslation } from '@/hooks/useTranslation';

// Import the investment-focused goal manager
import PortfolioGoalManager from '@/components/PortfolioGoalManager';

interface PortfolioGoal {
  id: string;
  title: string;
  goal_type: string;
  target_value: number;
  current_value: number;
  target_percentage?: number;
  asset_type?: string;
  target_date?: string;
  status: string;
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
  const { t } = useTranslation();
  const [goals, setGoals] = useState<PortfolioGoal[]>([]);
  const [isGoalManagerOpen, setIsGoalManagerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchGoals();

      // Set up real-time subscription for portfolio goals
      const channel = supabase
        .channel('portfolio-goals-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'portfolio_goals', filter: `user_id=eq.${user.id}` },
          (payload) => {
            console.log('Portfolio goals updated via realtime in component:', payload);
            fetchGoals();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchGoals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('portfolio_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching portfolio goals:', error);
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
    const portfolioValueGoals = goals.filter(goal => goal.goal_type === 'portfolio_value');

    if (portfolioValueGoals.length === 0) return null;

    const mainGoal = portfolioValueGoals[0];
    const progress = Math.min((totalValue / mainGoal.target_value) * 100, 100);

    return {
      goal: mainGoal,
      progress,
      remaining: Math.max(mainGoal.target_value - totalValue, 0)
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
    const allocationGoals = goals.filter(goal => goal.goal_type === 'sector_allocation');

    allocationGoals.forEach(goal => {
      if (goal.asset_type && sectorBreakdown[goal.asset_type]) {
        sectorBreakdown[goal.asset_type].target = goal.target_percentage;
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
            <div className="text-sm text-muted-foreground">{t('loadingGoalsMsg')}</div>
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
            {t('portfolioGoals')}
          </CardTitle>
          <Dialog open={isGoalManagerOpen} onOpenChange={setIsGoalManagerOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                {t('manageGoals')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <PortfolioGoalManager
                assets={assets}
                totalValue={totalValue}
                onGoalsChange={fetchGoals}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {activeGoals.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">{t('noPortfolioGoals')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('setPortfolioTargets')}
            </p>
            <Dialog open={isGoalManagerOpen} onOpenChange={setIsGoalManagerOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  {t('createFirstGoal')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <PortfolioGoalManager
                  assets={assets}
                  totalValue={totalValue}
                  onGoalsChange={fetchGoals}
                />
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
                    {portfolioProgress.progress.toFixed(1)}% مكتمل
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>الحالي: {formatAmount(totalValue)}</span>
                    <span>الهدف: {formatAmount(portfolioProgress.goal.target_value)}</span>
                  </div>
                  <Progress value={portfolioProgress.progress} className="h-2" />
                  {portfolioProgress.remaining > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {formatAmount(portfolioProgress.remaining)} متبقي للوصول إلى الهدف
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
                  <span className="font-medium">{t('sectorAllocationTargets')}</span>
                </div>
                <div className="space-y-2">
                  {Object.entries(sectorAllocation).map(([sector, data]) => {
                    if (!data.target) return null;
                    const currentPercentage = totalValue > 0 ? (data.value / totalValue) * 100 : 0;
                    const progress = Math.min((currentPercentage / data.target) * 100, 100);

                    return (
                      <div key={sector} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{sector.replace('_', ' ')}</span>
                          <span>{currentPercentage.toFixed(1)}% / {data.target}%</span>
                        </div>
                        <Progress value={progress} className="h-1" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Active Goals Summary */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="font-medium">{t('activeGoals')}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeGoals.slice(0, 4).map((goal) => {
                  let progress = 0;
                  let currentDisplay = '';
                  let targetDisplay = '';

                  if (goal.goal_type === 'portfolio_value') {
                    progress = Math.min((goal.current_value / goal.target_value) * 100, 100);
                    currentDisplay = formatAmount(goal.current_value);
                    targetDisplay = formatAmount(goal.target_value);
                  } else if (goal.goal_type === 'sector_allocation' || goal.goal_type === 'return_target') {
                    progress = Math.min((goal.current_value / (goal.target_percentage || 1)) * 100, 100);
                    currentDisplay = `${goal.current_value.toFixed(1)}%`;
                    targetDisplay = `${goal.target_percentage}%`;
                  } else {
                    progress = Math.min((goal.current_value / goal.target_value) * 100, 100);
                    currentDisplay = goal.current_value.toString();
                    targetDisplay = goal.target_value.toString();
                  }

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
                          <span>{currentDisplay}</span>
                          <span>{targetDisplay}</span>
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
                      {t('viewAllGoals')} {activeGoals.length} {t('goals')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <PortfolioGoalManager
                      assets={assets}
                      totalValue={totalValue}
                      onGoalsChange={fetchGoals}
                    />
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