import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, CreditCard, Target, AlertTriangle, Plus, TrendingUp, Banknote } from 'lucide-react';
import GoalManager from '@/components/GoalManager';
import EditableFinanceCard from '@/components/EditableFinanceCard';
import DebtManager from '@/components/DebtManager';
import IncomeStreamManager from '@/components/IncomeStreamManager';
import { usePersonalFinances } from '@/hooks/usePersonalFinances';
import { useCurrency } from '@/hooks/useCurrency';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const PersonalFinances = () => {
  const { 
    finances, 
    debts, 
    loading, 
    updateFinances, 
    updateMonthlyIncomeFromStreams,
    addDebt, 
    updateDebt, 
    deleteDebt, 
    getTotalDebt,
    getFreeMonthCash
  } = usePersonalFinances();
  const { formatAmount } = useCurrency();
  const [showIncomeManager, setShowIncomeManager] = React.useState(false);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Personal Finances</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="glass-card animate-pulse">
              <CardContent className="p-4">
                <div className="h-16 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const financialStats = [
    { 
      label: 'Monthly Income', 
      value: finances.monthly_income, 
      icon: DollarSign, 
      color: 'text-green-500',
      field: 'monthly_income' as keyof typeof finances
    },
    { 
      label: 'Monthly Expenses', 
      value: finances.monthly_expenses, 
      icon: CreditCard, 
      color: 'text-red-500',
      field: 'monthly_expenses' as keyof typeof finances
    },
    { 
      label: 'Net Savings', 
      value: finances.net_savings, 
      icon: Target, 
      color: 'text-blue-500',
      field: 'net_savings' as keyof typeof finances
    },
    { 
      label: 'Monthly Investing', 
      value: finances.monthly_investing_amount, 
      icon: TrendingUp, 
      color: 'text-purple-500',
      field: 'monthly_investing_amount' as keyof typeof finances
    },
    { 
      label: 'Total Debt', 
      value: getTotalDebt(), 
      icon: AlertTriangle, 
      color: 'text-orange-500',
      field: null
    },
    { 
      label: 'Free Monthly Cash', 
      value: getFreeMonthCash(), 
      icon: Banknote, 
      color: 'text-teal-500',
      field: null
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <DollarSign className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Personal Finances</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {financialStats.map((stat, index) => {
          if (stat.field) {
            // Special handling for monthly income to show income stream manager
            if (stat.field === 'monthly_income') {
              return (
                <Card key={index} className="glass-card cursor-pointer" onClick={() => setShowIncomeManager(true)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
                        <div className="text-2xl font-bold">{formatAmount(stat.value)}</div>
                      </div>
                      <stat.icon className={`w-8 h-8 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              );
            }
            
            return (
              <EditableFinanceCard
                key={index}
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
                color={stat.color}
                onUpdate={(value) => updateFinances(stat.field!, value)}
              />
            );
          } else {
            // Total Debt is calculated, not editable
            const Icon = stat.icon;
            return (
              <Card key={index} className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
                      <div className="text-2xl font-bold">{formatAmount(stat.value)}</div>
                    </div>
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          }
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <GoalManager />
        </div>

        <DebtManager
          debts={debts}
          onAddDebt={addDebt}
          onUpdateDebt={updateDebt}
          onDeleteDebt={deleteDebt}
        />
      </div>

      <Dialog open={showIncomeManager} onOpenChange={setShowIncomeManager}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Income Streams</DialogTitle>
          </DialogHeader>
          <IncomeStreamManager onIncomeChange={updateMonthlyIncomeFromStreams} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PersonalFinances;