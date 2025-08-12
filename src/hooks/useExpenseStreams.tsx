import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ExpenseStream {
  id?: string;
  name: string;
  amount: number;
  expense_type: 'fixed' | 'variable' | 'one_time';
  is_active: boolean;
  expense_date?: string;
}

export const useExpenseStreams = () => {
  const { user } = useAuth();
  const [expenseStreams, setExpenseStreams] = useState<ExpenseStream[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenseStreams = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('expense_streams')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExpenseStreams((data || []) as ExpenseStream[]);
    } catch (error) {
      console.error('Error fetching expense streams:', error);
    }
  };

  const addExpenseStream = async (stream: Omit<ExpenseStream, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('expense_streams')
        .insert({ ...stream, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      setExpenseStreams(prev => [data as ExpenseStream, ...prev]);
    } catch (error) {
      console.error('Error adding expense stream:', error);
      throw error;
    }
  };

  const updateExpenseStream = async (id: string, updates: Partial<ExpenseStream>) => {
    try {
      const { error } = await supabase
        .from('expense_streams')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setExpenseStreams(prev => prev.map(stream => 
        stream.id === id ? { ...stream, ...updates } : stream
      ));
    } catch (error) {
      console.error('Error updating expense stream:', error);
      throw error;
    }
  };

  const deleteExpenseStream = async (id: string) => {
    try {
      const { error } = await supabase
        .from('expense_streams')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setExpenseStreams(prev => prev.filter(stream => stream.id !== id));
    } catch (error) {
      console.error('Error deleting expense stream:', error);
    }
  };

  const calculateTotalMonthlyExpenses = () => {
    const recurring = expenseStreams
      .filter(stream => ['fixed', 'variable'].includes(stream.expense_type) && stream.is_active)
      .reduce((total, stream) => total + stream.amount, 0);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const oneTime = expenseStreams
      .filter(stream => {
        if (stream.expense_type !== 'one_time' || !stream.is_active || !stream.expense_date) {
          return false;
        }
        const expenseDate = new Date(stream.expense_date);
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
      })
      .reduce((total, stream) => total + stream.amount, 0);

    return recurring + oneTime;
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchExpenseStreams().finally(() => {
        setLoading(false);
      });
    }
  }, [user]);

  return {
    expenseStreams,
    loading,
    addExpenseStream,
    updateExpenseStream,
    deleteExpenseStream,
    calculateTotalMonthlyExpenses,
  };
};