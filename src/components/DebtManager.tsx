import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Plus, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCurrency } from '@/hooks/useCurrency';

interface Debt {
  id?: string;
  name: string;
  total_amount: number;
  paid_amount: number;
  monthly_payment: number;
  interest_rate: number;
  duration_months: number;
  start_date: string;
}

interface DebtManagerProps {
  debts: Debt[];
  onAddDebt: (debt: Omit<Debt, 'id'>) => void;
  onUpdateDebt: (id: string, updates: Partial<Debt>) => void;
  onDeleteDebt: (id: string) => void;
}

const DebtManager: React.FC<DebtManagerProps> = ({
  debts,
  onAddDebt,
  onUpdateDebt,
  onDeleteDebt,
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [formData, setFormData] = useState<Omit<Debt, 'id'>>({
    name: '',
    total_amount: 0,
    paid_amount: 0,
    monthly_payment: 0,
    interest_rate: 0,
    duration_months: 0,
    start_date: new Date().toISOString().split('T')[0],
  });
  const { formatAmount } = useCurrency();

  const resetForm = () => {
    setFormData({
      name: '',
      total_amount: 0,
      paid_amount: 0,
      monthly_payment: 0,
      interest_rate: 0,
      duration_months: 0,
      start_date: new Date().toISOString().split('T')[0],
    });
  };

  const handleSubmit = () => {
    if (editingDebt) {
      onUpdateDebt(editingDebt.id!, formData);
      setEditingDebt(null);
    } else {
      onAddDebt(formData);
      setIsAddOpen(false);
    }
    resetForm();
  };

  const openEdit = (debt: Debt) => {
    setFormData({
      name: debt.name,
      total_amount: debt.total_amount,
      paid_amount: debt.paid_amount,
      monthly_payment: debt.monthly_payment,
      interest_rate: debt.interest_rate,
      duration_months: debt.duration_months,
      start_date: debt.start_date,
    });
    setEditingDebt(debt);
  };

  const getProgressPercentage = (debt: Debt) => {
    return debt.total_amount > 0 ? (debt.paid_amount / debt.total_amount) * 100 : 0;
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Active Debts
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Debt
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Debt</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Debt Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Car Loan"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="total_amount">Total Amount</Label>
                    <Input
                      id="total_amount"
                      type="number"
                      value={formData.total_amount}
                      onChange={(e) => setFormData({ ...formData, total_amount: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="paid_amount">Paid Amount</Label>
                    <Input
                      id="paid_amount"
                      type="number"
                      value={formData.paid_amount}
                      onChange={(e) => setFormData({ ...formData, paid_amount: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="monthly_payment">Monthly Payment</Label>
                    <Input
                      id="monthly_payment"
                      type="number"
                      value={formData.monthly_payment}
                      onChange={(e) => setFormData({ ...formData, monthly_payment: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="interest_rate">Interest Rate (%)</Label>
                    <Input
                      id="interest_rate"
                      type="number"
                      value={formData.interest_rate}
                      onChange={(e) => setFormData({ ...formData, interest_rate: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration_months">Duration (Months)</Label>
                    <Input
                      id="duration_months"
                      type="number"
                      value={formData.duration_months}
                      onChange={(e) => setFormData({ ...formData, duration_months: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleSubmit} className="w-full">
                  Add Debt
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {debts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No debts recorded. Click "Add Debt" to get started.
          </div>
        ) : (
          debts.map((debt) => (
            <div key={debt.id} className="p-4 bg-secondary/30 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="font-medium">{debt.name}</div>
                  <div className="text-sm text-muted-foreground">{debt.interest_rate}% APR</div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEdit(debt)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteDebt(debt.id!)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-semibold">{formatAmount(debt.total_amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Paid:</span>
                  <span className="font-semibold text-green-600">{formatAmount(debt.paid_amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Remaining:</span>
                  <span className="font-semibold text-red-500">{formatAmount(debt.total_amount - debt.paid_amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Monthly Payment:</span>
                  <span>{formatAmount(debt.monthly_payment)}</span>
                </div>
                
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span>{getProgressPercentage(debt).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(getProgressPercentage(debt), 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingDebt} onOpenChange={() => setEditingDebt(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Debt</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Debt Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-total">Total Amount</Label>
                  <Input
                    id="edit-total"
                    type="number"
                    value={formData.total_amount}
                    onChange={(e) => setFormData({ ...formData, total_amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-paid">Paid Amount</Label>
                  <Input
                    id="edit-paid"
                    type="number"
                    value={formData.paid_amount}
                    onChange={(e) => setFormData({ ...formData, paid_amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-monthly">Monthly Payment</Label>
                  <Input
                    id="edit-monthly"
                    type="number"
                    value={formData.monthly_payment}
                    onChange={(e) => setFormData({ ...formData, monthly_payment: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-rate">Interest Rate (%)</Label>
                  <Input
                    id="edit-rate"
                    type="number"
                    value={formData.interest_rate}
                    onChange={(e) => setFormData({ ...formData, interest_rate: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <Button onClick={handleSubmit} className="w-full">
                Update Debt
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default DebtManager;