import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useDeposits } from '@/hooks/useDeposits';
import type { CreateDepositData } from '@/hooks/useDeposits';
import { useToast } from '@/hooks/use-toast';
import OptimizedCurrencyValue from '@/components/OptimizedCurrencyValue';
import { Plus, PiggyBank, TrendingUp, Building, Wallet, Trash2 } from 'lucide-react';

export const DepositsManager: React.FC = () => {
  const { deposits, loading, createDeposit, getTotalDepositsValue, getTotalMonthlySavings, deleteDeposit } = useDeposits();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateDepositData>({
    deposit_type: 'cash_savings',
    principal: 0,
    rate: 0,
    start_date: new Date().toISOString().split('T')[0],
  });
  const [monthlySavingTarget, setMonthlySavingTarget] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDeposit(formData);
      toast({
        title: "Savings Added",
        description: "Your savings has been added successfully.",
      });
      setIsDialogOpen(false);
      setFormData({
        deposit_type: 'cash_savings',
        principal: 0,
        rate: 0,
        start_date: new Date().toISOString().split('T')[0],
      });
      setMonthlySavingTarget(0);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add savings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getDepositIcon = (type: string) => {
    switch (type) {
      case 'fixed_cd':
        return <Building className="h-4 w-4" />;
      case 'savings':
        return <PiggyBank className="h-4 w-4" />;
      case 'investment_linked':
        return <TrendingUp className="h-4 w-4" />;
      case 'cash_savings':
        return <Wallet className="h-4 w-4" />;
      default:
        return <PiggyBank className="h-4 w-4" />;
    }
  };

  const getDepositTypeLabel = (type: string) => {
    switch (type) {
      case 'fixed_cd':
        return 'Certificate of Deposit';
      case 'savings':
        return 'Savings Account';
      case 'investment_linked':
        return 'Investment Linked';
      case 'cash_savings':
        return 'Cash Savings';
      default:
        return type;
    }
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading deposits...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <PiggyBank className="h-5 w-5" />
          Savings
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Savings
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Savings</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="deposit_type">Deposit Type</Label>
                <Select
                  value={formData.deposit_type}
                  onValueChange={(value) => setFormData({ ...formData, deposit_type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash_savings">Cash Savings</SelectItem>
                    <SelectItem value="savings">Savings Account</SelectItem>
                    <SelectItem value="fixed_cd">Certificate of Deposit</SelectItem>
                    <SelectItem value="investment_linked">Investment Linked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="principal">Principal Amount</Label>
                <Input
                  id="principal"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.principal}
                  onChange={(e) => setFormData({ ...formData, principal: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              
              {formData.deposit_type !== 'cash_savings' && (
                <div>
                  <Label htmlFor="rate">Annual Interest Rate (%)</Label>
                  <Input
                    id="rate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
              )}

              {formData.deposit_type === 'cash_savings' && (
                <div>
                  <Label htmlFor="monthly_target">Monthly Saving Target</Label>
                  <Input
                    id="monthly_target"
                    type="number"
                    min="0"
                    step="0.01"
                    value={monthlySavingTarget}
                    onChange={(e) => setMonthlySavingTarget(parseFloat(e.target.value) || 0)}
                    placeholder="Enter desired monthly saving amount"
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
              
              {formData.deposit_type === 'fixed_cd' && (
                <div>
                  <Label htmlFor="maturity_date">Maturity Date</Label>
                  <Input
                    id="maturity_date"
                    type="date"
                    value={formData.maturity_date || ''}
                    onChange={(e) => setFormData({ ...formData, maturity_date: e.target.value })}
                  />
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Savings</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                <OptimizedCurrencyValue amount={getTotalDepositsValue()} />
              </div>
              <div className="text-sm text-muted-foreground">Total Savings Value</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                <OptimizedCurrencyValue amount={getTotalMonthlySavings()} />
              </div>
              <div className="text-sm text-muted-foreground">Monthly Savings</div>
            </div>
          </div>
          
          {deposits.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No savings found. Add your first savings to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {deposits.map((deposit) => (
                <div
                  key={deposit.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getDepositIcon(deposit.deposit_type)}
                    <div>
                      <div className="font-medium">{getDepositTypeLabel(deposit.deposit_type)}</div>
                      <div className="text-sm text-muted-foreground">
                        {deposit.deposit_type === 'cash_savings' 
                          ? `Cash • Started ${new Date(deposit.start_date).toLocaleDateString()}`
                          : `${deposit.rate}% • Started ${new Date(deposit.start_date).toLocaleDateString()}`
                        }
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="font-medium">
                        <OptimizedCurrencyValue amount={deposit.computed?.total_value || (deposit.principal + deposit.accrued_interest)} />
                      </div>
                      <Badge variant={deposit.status === 'active' ? 'default' : 'secondary'}>
                        {deposit.status}
                      </Badge>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this savings?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this savings entry.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={async () => {
                            try {
                              await deleteDeposit(deposit.id!);
                              toast({ title: 'Deleted', description: 'Savings deleted successfully.' });
                            } catch (e) {
                              toast({ title: 'Error', description: 'Failed to delete savings.', variant: 'destructive' });
                            }
                          }}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};