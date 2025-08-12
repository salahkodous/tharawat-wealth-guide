import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface IncomeStream {
  id?: string;
  name: string;
  amount: number;
  income_type: 'salary' | 'stable' | 'unstable';
  is_active: boolean;
  received_date?: string;
}

export const useIncomeStreams = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [incomeStreams, setIncomeStreams] = useState<IncomeStream[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIncomeStreams = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('income_streams')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIncomeStreams((data || []) as IncomeStream[]);
    } catch (error) {
      console.error('Error fetching income streams:', error);
      toast({
        title: "Error",
        description: "Failed to load income streams",
        variant: "destructive",
      });
    }
  };

  const addIncomeStream = async (stream: Omit<IncomeStream, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('income_streams')
        .insert({ ...stream, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      setIncomeStreams(prev => [data as IncomeStream, ...prev]);
      toast({
        title: "Success",
        description: "Income stream added successfully",
      });
    } catch (error) {
      console.error('Error adding income stream:', error);
      toast({
        title: "Error",
        description: "Failed to add income stream",
        variant: "destructive",
      });
    }
  };

  const updateIncomeStream = async (id: string, updates: Partial<IncomeStream>) => {
    try {
      const { error } = await supabase
        .from('income_streams')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setIncomeStreams(prev => prev.map(stream => 
        stream.id === id ? { ...stream, ...updates } : stream
      ));
      toast({
        title: "Success",
        description: "Income stream updated successfully",
      });
    } catch (error) {
      console.error('Error updating income stream:', error);
      toast({
        title: "Error",
        description: "Failed to update income stream",
        variant: "destructive",
      });
    }
  };

  const deleteIncomeStream = async (id: string) => {
    try {
      const { error } = await supabase
        .from('income_streams')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setIncomeStreams(prev => prev.filter(stream => stream.id !== id));
      toast({
        title: "Success",
        description: "Income stream deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting income stream:', error);
      toast({
        title: "Error",
        description: "Failed to delete income stream",
        variant: "destructive",
      });
    }
  };

  const calculateTotalMonthlyIncome = () => {
    const stable = incomeStreams
      .filter(stream => ['salary', 'stable'].includes(stream.income_type) && stream.is_active)
      .reduce((total, stream) => total + stream.amount, 0);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const unstable = incomeStreams
      .filter(stream => {
        if (stream.income_type !== 'unstable' || !stream.is_active || !stream.received_date) {
          return false;
        }
        const receivedDate = new Date(stream.received_date);
        return receivedDate.getMonth() === currentMonth && receivedDate.getFullYear() === currentYear;
      })
      .reduce((total, stream) => total + stream.amount, 0);

    return stable + unstable;
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchIncomeStreams().finally(() => {
        setLoading(false);
      });
    }
  }, [user]);

  return {
    incomeStreams,
    loading,
    addIncomeStream,
    updateIncomeStream,
    deleteIncomeStream,
    calculateTotalMonthlyIncome,
  };
};