import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePersonalFinances } from '@/hooks/usePersonalFinances';
import OptimizedCurrencyValue from '@/components/OptimizedCurrencyValue';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, CreditCard, Wallet } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const PersonalFinanceCard: React.FC = () => {
  const { finances, debts, loading, getTotalDebt, getMonthlyDebtPayments, getFreeMonthCash } = usePersonalFinances();

  if (loading) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const totalDebt = getTotalDebt();
  const monthlyDebtPayments = getMonthlyDebtPayments();
  const freeCash = getFreeMonthCash();

  const stats = [
    {
      label: 'Monthly Income',
      value: finances?.monthly_income || 0,
      icon: TrendingUp,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
    {
      label: 'Monthly Expenses',
      value: finances?.monthly_expenses || 0,
      icon: TrendingDown,
      color: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-50 dark:bg-rose-950/30',
    },
    {
      label: 'Monthly Investing',
      value: finances?.monthly_investing_amount || 0,
      icon: PiggyBank,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      label: 'Free Cash',
      value: freeCash,
      icon: Wallet,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    },
  ];

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Personal Finances Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`rounded-lg p-3 ${stat.bgColor} border border-border/50`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div className="text-xl font-semibold">
                  <OptimizedCurrencyValue amount={stat.value} />
                </div>
              </div>
            );
          })}
        </div>

        {totalDebt > 0 && (
          <div className="rounded-lg p-3 bg-amber-50 dark:bg-amber-950/30 border border-border/50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">Total Debt</span>
              <CreditCard className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex items-center justify-between">
              <div className="text-xl font-semibold">
                <OptimizedCurrencyValue amount={totalDebt} />
              </div>
              <div className="text-sm text-muted-foreground">
                <OptimizedCurrencyValue amount={monthlyDebtPayments} />
                /mo
              </div>
            </div>
          </div>
        )}

        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Net Savings</span>
            <span className="font-medium">
              <OptimizedCurrencyValue amount={finances?.net_savings || 0} />
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalFinanceCard;
