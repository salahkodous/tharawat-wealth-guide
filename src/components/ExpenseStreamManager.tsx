import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Edit, CreditCard } from 'lucide-react';
import { useExpenseStreams, ExpenseStream } from '@/hooks/useExpenseStreams';
import OptimizedCurrencyValue from '@/components/OptimizedCurrencyValue';
import { useTranslation } from '@/hooks/useTranslation';

interface ExpenseStreamManagerProps {
  onExpenseChange: (totalExpense: number) => void;
}

const ExpenseStreamManager: React.FC<ExpenseStreamManagerProps> = ({ onExpenseChange }) => {
  const { t } = useTranslation();
  const { expenseStreams, addExpenseStream, updateExpenseStream, deleteExpenseStream, calculateTotalMonthlyExpenses } = useExpenseStreams();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStream, setEditingStream] = useState<ExpenseStream | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    expense_type: 'fixed' as ExpenseStream['expense_type'],
    expense_date: ''
  });

  useEffect(() => {
    const total = calculateTotalMonthlyExpenses();
    onExpenseChange(total);
  }, [expenseStreams, onExpenseChange, calculateTotalMonthlyExpenses]);

  const resetForm = () => {
    setFormData({
      name: '',
      amount: '',
      expense_type: 'fixed',
      expense_date: ''
    });
    setEditingStream(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) return;

    if (formData.expense_type === 'one_time' && !formData.expense_date) return;

    const streamData: Omit<ExpenseStream, 'id'> = {
      name: formData.name.trim(),
      amount,
      expense_type: formData.expense_type,
      is_active: true,
      expense_date: formData.expense_type === 'one_time' ? formData.expense_date : undefined
    };

    try {
      if (editingStream?.id) {
        await updateExpenseStream(editingStream.id, streamData);
      } else {
        await addExpenseStream(streamData);
      }

      resetForm();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error submitting expense stream:', error);
    }
  };

  const handleEdit = (stream: ExpenseStream) => {
    setEditingStream(stream);
    setFormData({
      name: stream.name,
      amount: stream.amount.toString(),
      expense_type: stream.expense_type,
      expense_date: stream.expense_date || ''
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteExpenseStream(id);
    } catch (error) {
      console.error('Error deleting expense stream:', error);
    }
  };

  const toggleActive = async (stream: ExpenseStream) => {
    try {
      await updateExpenseStream(stream.id!, { is_active: !stream.is_active });
    } catch (error) {
      console.error('Error toggling expense stream:', error);
    }
  };

  const getExpenseTypeLabel = (type: string) => {
    switch (type) {
      case 'fixed': return t('fixedMonthly');
      case 'variable': return t('variableMonthly');
      case 'one_time': return t('oneTime');
      default: return type;
    }
  };

  const getExpenseTypeColor = (type: string) => {
    switch (type) {
      case 'fixed': return 'bg-blue-100 text-blue-800';
      case 'variable': return 'bg-yellow-100 text-yellow-800';
      case 'one_time': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Expense Streams</h3>
          <p className="text-sm text-muted-foreground">
            Total Monthly Expenses: <OptimizedCurrencyValue amount={calculateTotalMonthlyExpenses()} />
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Expense
        </Button>
      </div>

      <div className="grid gap-4">
        {expenseStreams.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <CreditCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No expense streams yet.</p>
              <p className="text-sm text-muted-foreground">Add your first expense to get started.</p>
            </CardContent>
          </Card>
        ) : (
          expenseStreams.map((stream) => (
            <Card key={stream.id} className={`glass-card ${!stream.is_active ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{stream.name}</h4>
                      <Badge className={getExpenseTypeColor(stream.expense_type)}>
                        {getExpenseTypeLabel(stream.expense_type)}
                      </Badge>
                      {!stream.is_active && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">
                        <OptimizedCurrencyValue amount={stream.amount} />
                      </span>
                      {stream.expense_date && (
                        <span>Date: {new Date(stream.expense_date).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(stream)}
                      className={stream.is_active ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                    >
                      {stream.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(stream)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(stream.id!)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingStream ? 'Edit Expense Stream' : 'Add New Expense Stream'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Expense Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter expense name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="Enter amount"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense_type">Expense Type</Label>
              <Select 
                value={formData.expense_type} 
                onValueChange={(value: ExpenseStream['expense_type']) => 
                  setFormData(prev => ({ ...prev, expense_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select expense type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Monthly (e.g., rent, insurance)</SelectItem>
                  <SelectItem value="variable">Variable Monthly (e.g., groceries, utilities)</SelectItem>
                  <SelectItem value="one_time">One-time Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.expense_type === 'one_time' && (
              <div className="space-y-2">
                <Label htmlFor="expense_date">Expense Date</Label>
                <Input
                  id="expense_date"
                  type="date"
                  value={formData.expense_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, expense_date: e.target.value }))}
                  required
                />
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                {editingStream ? 'Update Expense' : 'Add Expense'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpenseStreamManager;