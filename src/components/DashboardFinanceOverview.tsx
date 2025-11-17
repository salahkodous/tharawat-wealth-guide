import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, CreditCard, TrendingUp, Banknote, AlertTriangle } from 'lucide-react';
import EditableFinanceCard from '@/components/EditableFinanceCard';
import IncomeStreamManager from '@/components/IncomeStreamManager';
import ExpenseStreamManager from '@/components/ExpenseStreamManager';
import DebtManager from '@/components/DebtManager';
import { usePersonalFinances } from '@/hooks/usePersonalFinances';
import { useCurrency } from '@/hooks/useCurrency';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTranslation } from '@/hooks/useTranslation';

const DashboardFinanceOverview = () => {
  const { 
    finances, 
    debts,
    loading, 
    updateFinances, 
    updateMonthlyIncomeFromStreams,
    updateMonthlyExpensesFromStreams,
    getFreeMonthCash,
    getTotalDebt,
    addDebt,
    updateDebt,
    deleteDebt
  } = usePersonalFinances();
  const { formatAmount } = useCurrency();
  const { t } = useTranslation();
  const [showIncomeManager, setShowIncomeManager] = React.useState(false);
  const [showExpenseManager, setShowExpenseManager] = React.useState(false);
  const [showDebtManager, setShowDebtManager] = React.useState(false);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">{t('personalFinances')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
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
      label: t('monthlyIncome'), 
      value: finances.monthly_income, 
      icon: DollarSign, 
      color: 'text-green-500',
      field: 'monthly_income' as keyof typeof finances
    },
    { 
      label: t('monthlyExpenses'), 
      value: finances.monthly_expenses, 
      icon: CreditCard, 
      color: 'text-red-500',
      field: 'monthly_expenses' as keyof typeof finances
    },
    { 
      label: t('monthlyInvesting'), 
      value: finances.monthly_investing_amount, 
      icon: TrendingUp, 
      color: 'text-purple-500',
      field: 'monthly_investing_amount' as keyof typeof finances
    },
    { 
      label: t('freeMonthlyC'), 
      value: getFreeMonthCash(), 
      icon: Banknote, 
      color: 'text-teal-500',
      field: null
    },
    { 
      label: t('totalDebt'), 
      value: getTotalDebt(), 
      icon: AlertTriangle, 
      color: 'text-orange-500',
      field: 'total_debt' as any
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <DollarSign className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">{t('personalFinances')}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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

            // Special handling for monthly expenses to show expense stream manager
            if (stat.field === 'monthly_expenses') {
              return (
                <Card key={index} className="glass-card cursor-pointer" onClick={() => setShowExpenseManager(true)}>
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

            // Special handling for total debt to show debt manager
            if (stat.field === 'total_debt') {
              return (
                <Card key={index} className="glass-card cursor-pointer" onClick={() => setShowDebtManager(true)}>
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
            // Free cash is calculated, not editable
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

      <Dialog open={showIncomeManager} onOpenChange={setShowIncomeManager}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Income Streams</DialogTitle>
          </DialogHeader>
          <IncomeStreamManager onIncomeChange={updateMonthlyIncomeFromStreams} />
        </DialogContent>
      </Dialog>

      <Dialog open={showExpenseManager} onOpenChange={setShowExpenseManager}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Expense Streams</DialogTitle>
          </DialogHeader>
          <ExpenseStreamManager onExpenseChange={updateMonthlyExpensesFromStreams} />
        </DialogContent>
      </Dialog>

      <Dialog open={showDebtManager} onOpenChange={setShowDebtManager}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Debts</DialogTitle>
          </DialogHeader>
          <DebtManager 
            debts={debts} 
            onAddDebt={addDebt} 
            onUpdateDebt={updateDebt} 
            onDeleteDebt={deleteDebt} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardFinanceOverview;