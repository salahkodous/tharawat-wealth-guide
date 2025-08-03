import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, CreditCard, Target, AlertTriangle } from 'lucide-react';
import GoalManager from '@/components/GoalManager';

const PersonalFinances = () => {
  const financialStats = [
    { label: 'Monthly Income', value: '$8,500', icon: DollarSign, color: 'text-green-500' },
    { label: 'Monthly Expenses', value: '$5,200', icon: CreditCard, color: 'text-red-500' },
    { label: 'Net Savings', value: '$3,300', icon: Target, color: 'text-blue-500' },
    { label: 'Total Debt', value: '$45,600', icon: AlertTriangle, color: 'text-orange-500' }
  ];

  const debts = [
    { name: 'Home Mortgage', balance: '$385,000', payment: '$2,200/mo', rate: '3.5%' },
    { name: 'Car Loan', balance: '$18,500', payment: '$420/mo', rate: '4.2%' },
    { name: 'Credit Card', balance: '$3,200', payment: '$150/mo', rate: '18.9%' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <DollarSign className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Personal Finances</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {financialStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <GoalManager />
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Active Debts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {debts.map((debt, index) => (
              <div key={index} className="p-3 bg-secondary/30 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium">{debt.name}</div>
                  <div className="text-sm text-muted-foreground">{debt.rate}</div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Balance:</span>
                  <span className="font-semibold">{debt.balance}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment:</span>
                  <span>{debt.payment}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PersonalFinances;