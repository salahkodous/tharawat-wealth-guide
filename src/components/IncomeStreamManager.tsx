import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Edit, DollarSign } from 'lucide-react';
import { useIncomeStreams, IncomeStream } from '@/hooks/useIncomeStreams';
import { useCurrency } from '@/hooks/useCurrency';
import { useToast } from '@/hooks/use-toast';

interface IncomeStreamManagerProps {
  onIncomeChange: (totalIncome: number) => void;
}

const IncomeStreamManager: React.FC<IncomeStreamManagerProps> = ({ onIncomeChange }) => {
  const { incomeStreams, addIncomeStream, updateIncomeStream, deleteIncomeStream, calculateTotalMonthlyIncome } = useIncomeStreams();
  const { formatAmount } = useCurrency();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStream, setEditingStream] = useState<IncomeStream | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    income_type: 'salary' as IncomeStream['income_type'],
    received_date: ''
  });

  React.useEffect(() => {
    onIncomeChange(calculateTotalMonthlyIncome());
  }, [incomeStreams, onIncomeChange, calculateTotalMonthlyIncome]);

  const resetForm = () => {
    setFormData({
      name: '',
      amount: '',
      income_type: 'salary',
      received_date: ''
    });
    setEditingStream(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the income stream",
        variant: "destructive",
      });
      return;
    }
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (formData.income_type === 'unstable' && !formData.received_date) {
      toast({
        title: "Error",
        description: "Please select a received date for one-time income",
        variant: "destructive",
      });
      return;
    }

    const streamData: Omit<IncomeStream, 'id'> = {
      name: formData.name.trim(),
      amount,
      income_type: formData.income_type,
      is_active: true,
      received_date: formData.income_type === 'unstable' ? formData.received_date : undefined
    };

    try {
      if (editingStream?.id) {
        await updateIncomeStream(editingStream.id, streamData);
      } else {
        await addIncomeStream(streamData);
      }

      resetForm();
      setIsAddDialogOpen(false);
    } catch (error) {
      // Error handling is already done in the hooks
      console.error('Error submitting income stream:', error);
    }
  };

  const handleEdit = (stream: IncomeStream) => {
    setEditingStream(stream);
    setFormData({
      name: stream.name,
      amount: stream.amount.toString(),
      income_type: stream.income_type,
      received_date: stream.received_date || ''
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteIncomeStream(id);
  };

  const getIncomeTypeLabel = (type: IncomeStream['income_type']) => {
    switch (type) {
      case 'salary': return 'Salary';
      case 'stable': return 'Stable Monthly';
      case 'unstable': return 'One-time';
    }
  };

  const getIncomeTypeColor = (type: IncomeStream['income_type']) => {
    switch (type) {
      case 'salary': return 'bg-green-100 text-green-800';
      case 'stable': return 'bg-blue-100 text-blue-800';
      case 'unstable': return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Income Streams</h3>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Income
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingStream ? 'Edit Income Stream' : 'Add Income Stream'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Salary, Rent Income, Bonus"
                  required
                />
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="Enter amount"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <Label htmlFor="type">Income Type</Label>
                <Select 
                  value={formData.income_type} 
                  onValueChange={(value: IncomeStream['income_type']) => 
                    setFormData(prev => ({ ...prev, income_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salary">Salary (Monthly)</SelectItem>
                    <SelectItem value="stable">Stable Monthly Income</SelectItem>
                    <SelectItem value="unstable">One-time Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.income_type === 'unstable' && (
                <div>
                  <Label htmlFor="received_date">Received Date</Label>
                  <Input
                    id="received_date"
                    type="date"
                    value={formData.received_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, received_date: e.target.value }))}
                    required
                  />
                </div>
              )}
              <div className="flex gap-2">
                <Button type="submit">
                  {editingStream ? 'Update' : 'Add'} Income
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {incomeStreams.map((stream) => (
          <Card key={stream.id} className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{stream.name}</span>
                  <Badge className={getIncomeTypeColor(stream.income_type)}>
                    {getIncomeTypeLabel(stream.income_type)}
                  </Badge>
                </div>
                <div className="text-lg font-bold text-primary">
                  {formatAmount(stream.amount)}
                </div>
                {stream.received_date && (
                  <div className="text-sm text-muted-foreground">
                    Received: {new Date(stream.received_date).toLocaleDateString()}
                  </div>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(stream)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(stream.id!)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
        
        {incomeStreams.length === 0 && (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">No income streams yet. Add your first income source!</p>
          </Card>
        )}
      </div>

      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Total Monthly Income</div>
              <div className="text-2xl font-bold text-primary">{formatAmount(calculateTotalMonthlyIncome())}</div>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IncomeStreamManager;