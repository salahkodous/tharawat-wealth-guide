import React, { useState } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  CreditCard, 
  PiggyBank, 
  Plus, 
  Target,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const FinancialTracker: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Mock financial data
  const financialSummary = {
    totalIncome: 45000,
    totalExpenses: 32000,
    totalSavings: 13000,
    totalDebt: 18500,
    currency: 'SAR'
  };

  const incomeStreams = [
    { source: 'Salary', amount: 35000, type: 'monthly', currency: 'SAR' },
    { source: 'Investment Returns', amount: 7500, type: 'monthly', currency: 'SAR' },
    { source: 'Side Business', amount: 2500, type: 'monthly', currency: 'SAR' }
  ];

  const expenseCategories = [
    { category: 'Housing', amount: 12000, budget: 15000, currency: 'SAR', color: 'text-warning' },
    { category: 'Transportation', amount: 3500, budget: 4000, currency: 'SAR', color: 'text-primary' },
    { category: 'Food & Dining', amount: 4200, budget: 5000, currency: 'SAR', color: 'text-success' },
    { category: 'Entertainment', amount: 2800, budget: 3000, currency: 'SAR', color: 'text-muted-foreground' },
    { category: 'Healthcare', amount: 1500, budget: 2000, currency: 'SAR', color: 'text-destructive' },
    { category: 'Other', amount: 8000, budget: 10000, currency: 'SAR', color: 'text-accent-foreground' }
  ];

  const debts = [
    { 
      name: 'Home Mortgage', 
      balance: 12500, 
      payment: 1850, 
      rate: 3.5, 
      currency: 'SAR',
      nextPayment: '2024-02-01'
    },
    { 
      name: 'Car Loan', 
      balance: 4500, 
      payment: 650, 
      rate: 5.2, 
      currency: 'SAR',
      nextPayment: '2024-02-15'
    },
    { 
      name: 'Credit Card', 
      balance: 1500, 
      payment: 300, 
      rate: 18.9, 
      currency: 'SAR',
      nextPayment: '2024-02-10'
    }
  ];

  const savingsGoals = [
    { goal: 'Emergency Fund', current: 25000, target: 50000, deadline: '2024-12-31', currency: 'SAR' },
    { goal: 'New Car', current: 15000, target: 80000, deadline: '2025-06-30', currency: 'SAR' },
    { goal: 'Investment Portfolio', current: 35000, target: 100000, deadline: '2025-12-31', currency: 'SAR' }
  ];

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toLocaleString()} ${currency}`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gradient-electric">Financial Tracker</h2>
        <p className="text-muted-foreground">
          Complete overview of your income, expenses, debts, and savings
        </p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card electric-glow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Income</p>
                <p className="text-2xl font-bold text-success">
                  {formatCurrency(financialSummary.totalIncome, financialSummary.currency)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-warning">
                  {formatCurrency(financialSummary.totalExpenses, financialSummary.currency)}
                </p>
              </div>
              <Wallet className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Savings</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(financialSummary.totalSavings, financialSummary.currency)}
                </p>
              </div>
              <PiggyBank className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Debt</p>
                <p className="text-2xl font-bold text-destructive">
                  {formatCurrency(financialSummary.totalDebt, financialSummary.currency)}
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="debts">Debts</TabsTrigger>
          <TabsTrigger value="savings">Savings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cash Flow Chart */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Monthly Cash Flow</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Income</span>
                    <span className="font-semibold text-success">+{formatCurrency(45000, 'SAR')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Expenses</span>
                    <span className="font-semibold text-warning">-{formatCurrency(32000, 'SAR')}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Net Cash Flow</span>
                      <span className="font-bold text-primary">+{formatCurrency(13000, 'SAR')}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Savings Rate */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Savings Rate</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">28.9%</div>
                  <p className="text-muted-foreground">of income saved</p>
                </div>
                <Progress value={28.9} className="h-3" />
                <p className="text-sm text-muted-foreground text-center">
                  Excellent! Target: 20%
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="income" className="space-y-6">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Income Sources</CardTitle>
              <Button size="sm" className="gradient-electric text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Add Income
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {incomeStreams.map((income, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-success/5 rounded-lg border border-success/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-success" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{income.source}</h4>
                        <p className="text-sm text-muted-foreground">Monthly {income.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-success">
                        {formatCurrency(income.amount, income.currency)}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        Active
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Expense Categories</CardTitle>
              <Button size="sm" className="gradient-electric text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expenseCategories.map((expense, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{expense.category}</span>
                      <span className={`font-semibold ${expense.color}`}>
                        {formatCurrency(expense.amount, expense.currency)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <Progress 
                        value={(expense.amount / expense.budget) * 100} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Spent: {formatCurrency(expense.amount, expense.currency)}</span>
                        <span>Budget: {formatCurrency(expense.budget, expense.currency)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="debts" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Debt Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {debts.map((debt, index) => (
                  <div key={index} className="p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{debt.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {debt.rate}% APR
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-destructive">
                          {formatCurrency(debt.balance, debt.currency)}
                        </p>
                        <p className="text-sm text-muted-foreground">Balance</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Monthly Payment</p>
                        <p className="font-semibold">{formatCurrency(debt.payment, debt.currency)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Next Payment</p>
                        <p className="font-semibold flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {debt.nextPayment}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="savings" className="space-y-6">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Savings Goals</CardTitle>
              <Button size="sm" className="gradient-electric text-primary-foreground">
                <Target className="w-4 h-4 mr-2" />
                New Goal
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {savingsGoals.map((goal, index) => (
                  <div key={index} className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{goal.goal}</h4>
                        <p className="text-sm text-muted-foreground">
                          Target: {goal.deadline}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">
                          {getProgressPercentage(goal.current, goal.target).toFixed(1)}%
                        </p>
                        <p className="text-sm text-muted-foreground">Complete</p>
                      </div>
                    </div>
                    
                    <Progress 
                      value={getProgressPercentage(goal.current, goal.target)} 
                      className="h-3 mb-2"
                    />
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {formatCurrency(goal.current, goal.currency)}
                      </span>
                      <span className="text-muted-foreground">
                        {formatCurrency(goal.target, goal.currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialTracker;