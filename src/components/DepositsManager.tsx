import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useDeposits } from '@/hooks/useDeposits';
import type { CreateDepositData } from '@/hooks/useDeposits';
import { useCurrency } from '@/hooks/useCurrency';
import { useToast } from '@/hooks/use-toast';
import { Plus, PiggyBank, TrendingUp, Building } from 'lucide-react';

export const DepositsManager: React.FC = () => {
  const { deposits, loading, createDeposit, getTotalDepositsValue, getTotalMonthlySavings } = useDeposits();
  const { formatAmount } = useCurrency();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateDepositData>({
    deposit_type: 'savings',
    principal: 0,
    rate: 0,
    start_date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDeposit(formData);
      toast({
        title: "Deposit Created",
        description: "Your deposit has been added successfully.",
      });
      setIsDialogOpen(false);
      setFormData({
        deposit_type: 'savings',
        principal: 0,
        rate: 0,
        start_date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create deposit. Please try again.",
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
          Bank Deposits & Certificates
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Deposit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Deposit</DialogTitle>
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
                <Button type="submit">Create Deposit</Button>
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
                {formatAmount(getTotalDepositsValue())}
              </div>
              <div className="text-sm text-muted-foreground">Total Deposits Value</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {formatAmount(getTotalMonthlySavings())}
              </div>
              <div className="text-sm text-muted-foreground">Monthly Savings</div>
            </div>
          </div>
          
          {deposits.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No deposits found. Add your first deposit to get started.
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
                        {deposit.rate}% • Started {new Date(deposit.start_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatAmount(deposit.computed?.total_value || (deposit.principal + deposit.accrued_interest))}
                    </div>
                    <Badge variant={deposit.status === 'active' ? 'default' : 'secondary'}>
                      {deposit.status}
                    </Badge>
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