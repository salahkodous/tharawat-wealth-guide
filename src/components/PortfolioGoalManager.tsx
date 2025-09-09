import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';
import { 
  Plus, 
  Edit3, 
  Save, 
  Trash2, 
  Target,
  TrendingUp,
  PieChart,
  DollarSign,
  Percent,
  BarChart3
} from 'lucide-react';

interface PortfolioGoal {
  id: string;
  title: string;
  goal_type: string; // Changed from union type to string
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

interface PortfolioGoalManagerProps {
  assets?: Asset[];
  totalValue?: number;
}

const PortfolioGoalManager: React.FC<PortfolioGoalManagerProps> = ({ assets = [], totalValue = 0 }) => {
  const [goals, setGoals] = useState<PortfolioGoal[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    goal_type: 'portfolio_value',
    target_value: 100000,
    target_percentage: 20,
    asset_type: 'stocks',
    target_date: ''
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { formatAmount, convertAmount, currency } = useCurrency();

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_goals')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching portfolio goals:', error);
      toast({
        title: "Error",
        description: "Failed to load portfolio goals",
        variant: "destructive"
      });
    }
  };

  const createGoal = async () => {
    if (!user || !newGoal.title) return;
    
    setLoading(true);
    try {
      const goalData: any = {
        user_id: user.id,
        title: newGoal.title,
        goal_type: newGoal.goal_type,
        target_value: newGoal.target_value,
        current_value: calculateCurrentValue(),
        target_date: newGoal.target_date || null
      };

      if (newGoal.goal_type === 'sector_allocation') {
        goalData.asset_type = newGoal.asset_type;
        goalData.target_percentage = newGoal.target_percentage;
      } else if (newGoal.goal_type === 'return_target') {
        goalData.target_percentage = newGoal.target_percentage;
      }

      const { error } = await supabase
        .from('portfolio_goals')
        .insert(goalData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Portfolio goal created successfully"
      });

      setNewGoal({
        title: '',
        goal_type: 'portfolio_value',
        target_value: 100000,
        target_percentage: 20,
        asset_type: 'stocks',
        target_date: ''
      });
      setIsDialogOpen(false);
      fetchGoals();
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: "Error",
        description: "Failed to create portfolio goal",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateCurrentValue = () => {
    switch (newGoal.goal_type) {
      case 'portfolio_value':
        return totalValue;
      case 'sector_allocation':
        const sectorValue = assets
          .filter(asset => asset.asset_type === newGoal.asset_type)
          .reduce((total, asset) => {
            const quantity = asset.quantity || 1;
            const currentPrice = asset.current_price || asset.purchase_price || 0;
            const assetValue = quantity * currentPrice;
            return total + convertAmount(assetValue, getAssetCurrency(asset), currency);
          }, 0);
        return totalValue > 0 ? (sectorValue / totalValue) * 100 : 0;
      case 'return_target':
        const totalInvested = assets.reduce((total, asset) => {
          const quantity = asset.quantity || 1;
          const purchasePrice = asset.purchase_price || 0;
          return total + convertAmount(quantity * purchasePrice, getAssetCurrency(asset), currency);
        }, 0);
        return totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0;
      default:
        return 0;
    }
  };

  const getAssetCurrency = (asset: Asset) => {
    if (asset.metadata?.additional_data?.currency) {
      return asset.metadata.additional_data.currency;
    }
    if (asset.country === 'Egypt') return 'EGP';
    if (asset.country === 'Saudi Arabia') return 'SAR';
    if (asset.country === 'UAE') return 'AED';
    return 'USD';
  };

  const updateGoalCurrentValue = async (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    let currentValue = 0;
    switch (goal.goal_type) {
      case 'portfolio_value':
        currentValue = totalValue;
        break;
      case 'sector_allocation':
        const sectorValue = assets
          .filter(asset => asset.asset_type === goal.asset_type)
          .reduce((total, asset) => {
            const quantity = asset.quantity || 1;
            const currentPrice = asset.current_price || asset.purchase_price || 0;
            const assetValue = quantity * currentPrice;
            return total + convertAmount(assetValue, getAssetCurrency(asset), currency);
          }, 0);
        currentValue = totalValue > 0 ? (sectorValue / totalValue) * 100 : 0;
        break;
      case 'return_target':
        const totalInvested = assets.reduce((total, asset) => {
          const quantity = asset.quantity || 1;
          const purchasePrice = asset.purchase_price || 0;
          return total + convertAmount(quantity * purchasePrice, getAssetCurrency(asset), currency);
        }, 0);
        currentValue = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0;
        break;
    }

    try {
      const { error } = await supabase
        .from('portfolio_goals')
        .update({ current_value: currentValue })
        .eq('id', goalId);

      if (error) throw error;

      setGoals(goals.map(g => 
        g.id === goalId ? { ...g, current_value: currentValue } : g
      ));
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const deleteGoal = async (goalId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('portfolio_goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setGoals(goals.filter(g => g.id !== goalId));
      toast({ title: 'Deleted', description: 'Portfolio goal deleted successfully' });
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({ title: 'Error', description: 'Failed to delete goal', variant: 'destructive' });
    }
  };

  const getGoalIcon = (type: string) => {
    switch (type) {
      case 'portfolio_value': return DollarSign;
      case 'sector_allocation': return PieChart;
      case 'return_target': return TrendingUp;
      case 'asset_target': return BarChart3;
      default: return Target;
    }
  };

  const getGoalTypeLabel = (type: string) => {
    switch (type) {
      case 'portfolio_value': return 'Portfolio Value';
      case 'sector_allocation': return 'Sector Allocation';
      case 'return_target': return 'Return Target';
      case 'asset_target': return 'Asset Target';
      default: return type;
    }
  };

  const calculateProgress = (goal: PortfolioGoal) => {
    if (goal.goal_type === 'sector_allocation' || goal.goal_type === 'return_target') {
      return Math.min((goal.current_value / (goal.target_percentage || 1)) * 100, 100);
    }
    return Math.min((goal.current_value / goal.target_value) * 100, 100);
  };

  const formatGoalValue = (goal: PortfolioGoal) => {
    if (goal.goal_type === 'sector_allocation' || goal.goal_type === 'return_target') {
      return `${goal.current_value.toFixed(1)}%`;
    }
    return formatAmount(goal.current_value);
  };

  const formatTargetValue = (goal: PortfolioGoal) => {
    if (goal.goal_type === 'sector_allocation' || goal.goal_type === 'return_target') {
      return `${goal.target_percentage}%`;
    }
    return formatAmount(goal.target_value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Portfolio Goals</h3>
        <div className="flex gap-2">
          <Button
            variant={editMode ? "default" : "outline"}
            onClick={() => setEditMode(!editMode)}
            className="flex items-center gap-2"
          >
            {editMode ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            {editMode ? 'Done' : 'Edit'}
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Investment Goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Goal Title</Label>
                  <Input
                    id="title"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    placeholder="e.g., Reach $100K Portfolio"
                  />
                </div>
                
                <div>
                  <Label htmlFor="goal-type">Goal Type</Label>
                  <Select
                    value={newGoal.goal_type}
                    onValueChange={(value: any) => setNewGoal({ ...newGoal, goal_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portfolio_value">Portfolio Value Target</SelectItem>
                      <SelectItem value="sector_allocation">Sector Allocation %</SelectItem>
                      <SelectItem value="return_target">Return Target %</SelectItem>
                      <SelectItem value="asset_target">Asset Count Target</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newGoal.goal_type === 'portfolio_value' && (
                  <div>
                    <Label htmlFor="target-value">Target Value</Label>
                    <Input
                      id="target-value"
                      type="number"
                      value={newGoal.target_value}
                      onChange={(e) => setNewGoal({ ...newGoal, target_value: Number(e.target.value) })}
                    />
                  </div>
                )}

                {newGoal.goal_type === 'sector_allocation' && (
                  <>
                    <div>
                      <Label htmlFor="asset-type">Asset Type</Label>
                      <Select
                        value={newGoal.asset_type}
                        onValueChange={(value) => setNewGoal({ ...newGoal, asset_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="stocks">Stocks</SelectItem>
                          <SelectItem value="crypto">Cryptocurrency</SelectItem>
                          <SelectItem value="real_estate">Real Estate</SelectItem>
                          <SelectItem value="gold">Gold</SelectItem>
                          <SelectItem value="bonds">Bonds</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="target-percentage">Target Allocation %</Label>
                      <Input
                        id="target-percentage"
                        type="number"
                        value={newGoal.target_percentage}
                        onChange={(e) => setNewGoal({ ...newGoal, target_percentage: Number(e.target.value) })}
                        max="100"
                        min="0"
                      />
                    </div>
                  </>
                )}

                {newGoal.goal_type === 'return_target' && (
                  <div>
                    <Label htmlFor="return-percentage">Target Return %</Label>
                    <Input
                      id="return-percentage"
                      type="number"
                      value={newGoal.target_percentage}
                      onChange={(e) => setNewGoal({ ...newGoal, target_percentage: Number(e.target.value) })}
                    />
                  </div>
                )}

                {newGoal.goal_type === 'asset_target' && (
                  <div>
                    <Label htmlFor="asset-count">Target Asset Count</Label>
                    <Input
                      id="asset-count"
                      type="number"
                      value={newGoal.target_value}
                      onChange={(e) => setNewGoal({ ...newGoal, target_value: Number(e.target.value) })}
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="target-date">Target Date (Optional)</Label>
                  <Input
                    id="target-date"
                    type="date"
                    value={newGoal.target_date}
                    onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                  />
                </div>
                
                <Button onClick={createGoal} disabled={loading} className="w-full">
                  {loading ? 'Creating...' : 'Create Goal'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-4">
        {goals.map((goal) => {
          const progress = calculateProgress(goal);
          const Icon = getGoalIcon(goal.goal_type);
          
          return (
            <Card key={goal.id} className="glass-card">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium">{goal.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {getGoalTypeLabel(goal.goal_type)}
                          </Badge>
                          {goal.asset_type && (
                            <Badge variant="secondary" className="text-xs capitalize">
                              {goal.asset_type.replace('_', ' ')}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {progress.toFixed(1)}% complete
                        </div>
                      </div>
                      {editMode && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateGoalCurrentValue(goal.id)}
                          >
                            Update
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete this goal?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete this portfolio goal.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteGoal(goal.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Current: {formatGoalValue(goal)}</span>
                      <span>Target: {formatTargetValue(goal)}</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                    {goal.target_date && (
                      <p className="text-xs text-muted-foreground">
                        Target date: {new Date(goal.target_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {goals.length === 0 && (
          <Card className="glass-card">
            <CardContent className="text-center py-12">
              <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Portfolio Goals Yet</h3>
              <p className="text-muted-foreground mb-6">
                Set investment targets to track your portfolio performance and growth
              </p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create Your First Goal
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md z-50 bg-background/95 backdrop-blur-sm">
                  <DialogHeader>
                    <DialogTitle>Create Investment Goal</DialogTitle>
                  </DialogHeader>
                  {/* Dialog content same as above */}
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PortfolioGoalManager;