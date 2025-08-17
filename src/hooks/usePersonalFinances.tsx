import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useIncomeStreams } from './useIncomeStreams';
import { useExpenseStreams } from './useExpenseStreams';

interface PersonalFinance {
  id?: string;
  monthly_income: number;
  monthly_expenses: number;
  net_savings: number;
  monthly_investing_amount: number;
}

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

export const usePersonalFinances = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { calculateTotalMonthlyIncome } = useIncomeStreams();
  const { calculateTotalMonthlyExpenses } = useExpenseStreams();
  const [finances, setFinances] = useState<PersonalFinance>({
    monthly_income: 0,
    monthly_expenses: 0,
    net_savings: 0,
    monthly_investing_amount: 0,
  });
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFinances = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('personal_finances')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setFinances({
          id: data.id,
          monthly_income: Number(data.monthly_income) || 0,
          monthly_expenses: Number(data.monthly_expenses) || 0,
          net_savings: Number(data.net_savings) || 0,
          monthly_investing_amount: Number(data.monthly_investing_amount) || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching finances:', error);
      toast({
        title: "Error",
        description: "Failed to load personal finances",
        variant: "destructive",
      });
    }
  };

  const fetchDebts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setDebts(data || []);
    } catch (error) {
      console.error('Error fetching debts:', error);
      toast({
        title: "Error",
        description: "Failed to load debts",
        variant: "destructive",
      });
    }
  };

  const updateFinances = async (field: keyof PersonalFinance, value: number, options?: { silent?: boolean }) => {
    if (!user) return;

    try {
      // Skip if value didn't change to prevent unnecessary updates/toasts
      if (finances[field] === value) {
        return;
      }

      const updatedFinances = { ...finances, [field]: value };
      
      if (finances.id) {
        const { error } = await supabase
          .from('personal_finances')
          .update(updatedFinances)
          .eq('id', finances.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('personal_finances')
          .insert({ ...updatedFinances, user_id: user.id })
          .select()
          .single();

        if (error) throw error;
        updatedFinances.id = data.id;
      }

      setFinances(updatedFinances);
      if (!options?.silent) {
        toast({
          title: "Success",
          description: "Personal finances updated",
        });
      }
    } catch (error) {
      console.error('Error updating finances:', error);
      toast({
        title: "Error",
        description: "Failed to update personal finances",
        variant: "destructive",
      });
    }
  };

  const updateMonthlyIncomeFromStreams = async (totalIncome: number) => {
    await updateFinances('monthly_income', totalIncome, { silent: true });
  };

  const updateMonthlyExpensesFromStreams = async (totalExpenses: number) => {
    await updateFinances('monthly_expenses', totalExpenses, { silent: true });
  };

  const addDebt = async (debt: Omit<Debt, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('debts')
        .insert({ ...debt, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      setDebts(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Debt added successfully",
      });
    } catch (error) {
      console.error('Error adding debt:', error);
      toast({
        title: "Error",
        description: "Failed to add debt",
        variant: "destructive",
      });
    }
  };

  const updateDebt = async (id: string, updates: Partial<Debt>) => {
    try {
      const { error } = await supabase
        .from('debts')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setDebts(prev => prev.map(debt => 
        debt.id === id ? { ...debt, ...updates } : debt
      ));
      toast({
        title: "Success",
        description: "Debt updated successfully",
      });
    } catch (error) {
      console.error('Error updating debt:', error);
      toast({
        title: "Error",
        description: "Failed to update debt",
        variant: "destructive",
      });
    }
  };

  const deleteDebt = async (id: string) => {
    try {
      const { error } = await supabase
        .from('debts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDebts(prev => prev.filter(debt => debt.id !== id));
      toast({
        title: "Success",
        description: "Debt deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting debt:', error);
      toast({
        title: "Error",
        description: "Failed to delete debt",
        variant: "destructive",
      });
    }
  };

  const getTotalDebt = () => {
    return debts.reduce((total, debt) => total + (debt.total_amount - debt.paid_amount), 0);
  };

  const getMonthlyDebtPayments = () => {
    return debts.reduce((total, debt) => total + debt.monthly_payment, 0);
  };

  const getFreeMonthCash = () => {
    const monthlyDebtPayments = getMonthlyDebtPayments();
    return finances.monthly_income - (finances.monthly_expenses + finances.monthly_investing_amount + monthlyDebtPayments);
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([fetchFinances(), fetchDebts()]).finally(() => {
        setLoading(false);
      });
    }
  }, [user]);

  return {
    finances,
    debts,
    loading,
    updateFinances,
    updateMonthlyIncomeFromStreams,
    updateMonthlyExpensesFromStreams,
    addDebt,
    updateDebt,
    deleteDebt,
    getTotalDebt,
    getMonthlyDebtPayments,
    getFreeMonthCash,
  };
};