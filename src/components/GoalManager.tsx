import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import OptimizedCurrencyValue from '@/components/OptimizedCurrencyValue';
import { Plus, Edit3, Save, X, Trash2 } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  monthly_saving_amount: number;
  category: string;
  target_date: string;
}

const GoalManager = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    target_amount: 10000,
    monthly_saving_amount: 500,
    category: 'savings',
    target_date: ''
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast({
        title: "Error",
        description: "Failed to load financial goals",
        variant: "destructive"
      });
    }
  };

  const createGoal = async () => {
    if (!user || !newGoal.title) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('financial_goals')
        .insert({
          user_id: user.id,
          title: newGoal.title,
          target_amount: newGoal.target_amount,
          current_amount: 0,
          monthly_saving_amount: newGoal.monthly_saving_amount,
          category: newGoal.category,
          target_date: newGoal.target_date || null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Financial goal created successfully"
      });

      setNewGoal({
        title: '',
        target_amount: 10000,
        monthly_saving_amount: 500,
        category: 'savings',
        target_date: ''
      });
      setIsDialogOpen(false);
      fetchGoals();
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: "Error",
        description: "Failed to create financial goal",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateGoal = async (goalId: string, updates: Partial<Goal>) => {
    try {
      const { error } = await supabase
        .from('financial_goals')
        .update(updates)
        .eq('id', goalId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setGoals(goals.map(goal => 
        goal.id === goalId ? { ...goal, ...updates } : goal
      ));

      toast({
        title: "Success",
        description: "Goal updated successfully"
      });
    } catch (error) {
      console.error('Error updating goal:', error);
      toast({
        title: "Error",
        description: "Failed to update goal",
        variant: "destructive"
      });
    }
  };

  const handleSliderChange = (goalId: string, newValue: number[]) => {
    const currentAmount = newValue[0];
    setGoals(goals.map(goal => 
      goal.id === goalId ? { ...goal, current_amount: currentAmount } : goal
    ));
  };

  const handleSliderCommit = (goalId: string, currentAmount: number) => {
    updateGoal(goalId, { current_amount: currentAmount });
  };

  const deleteGoal = async (goalId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('financial_goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', user.id);
      if (error) throw error;
      setGoals(goals.filter((g) => g.id !== goalId));
      toast({ title: 'Deleted', description: 'Goal deleted successfully' });
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({ title: 'Error', description: 'Failed to delete goal', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Financial Goals</h3>
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
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Financial Goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Goal Title</Label>
                  <Input
                    id="title"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    placeholder="e.g., Emergency Fund"
                  />
                </div>
                <div>
                  <Label htmlFor="target">Target Amount</Label>
                  <Input
                    id="target"
                    type="number"
                    value={newGoal.target_amount}
                    onChange={(e) => setNewGoal({ ...newGoal, target_amount: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="monthly">Monthly Saving Amount</Label>
                  <Input
                    id="monthly"
                    type="number"
                    value={newGoal.monthly_saving_amount}
                    onChange={(e) => setNewGoal({ ...newGoal, monthly_saving_amount: Number(e.target.value) })}
                  />
                </div>
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
          const percentage = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
          
          return (
            <Card key={goal.id} className="glass-card">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{goal.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Monthly saving: <OptimizedCurrencyValue amount={goal.monthly_saving_amount} />
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          {percentage.toFixed(1)}% complete
                        </div>
                      </div>
                      {editMode && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="w-4 h-4" />
                              <span className="sr-only">Delete goal</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this goal?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this goal.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={async () => {
                                await deleteGoal(goal.id);
                              }}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>

                  {editMode ? (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Progress: <OptimizedCurrencyValue amount={goal.current_amount} /></span>
                        <span>Target: <OptimizedCurrencyValue amount={goal.target_amount} /></span>
                      </div>
                      <Slider
                        value={[goal.current_amount]}
                        max={goal.target_amount}
                        step={100}
                        onValueChange={(value) => handleSliderChange(goal.id, value)}
                        onValueCommit={(value) => handleSliderCommit(goal.id, value[0])}
                        className="w-full"
                      />
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={goal.monthly_saving_amount}
                          onChange={(e) => updateGoal(goal.id, { monthly_saving_amount: Number(e.target.value) })}
                          placeholder="Monthly amount"
                          className="text-sm"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span><OptimizedCurrencyValue amount={goal.current_amount} /></span>
                        <span><OptimizedCurrencyValue amount={goal.target_amount} /></span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-3">
                        <div 
                          className="bg-primary h-3 rounded-full transition-all duration-500" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default GoalManager;