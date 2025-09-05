import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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
    } catch (error) {
      console.error('Error adding income stream:', error);
      throw error;
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
    } catch (error) {
      console.error('Error updating income stream:', error);
      throw error;
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
    } catch (error) {
      console.error('Error deleting income stream:', error);
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

      // Set up real-time subscription for income streams
      const channel = supabase
        .channel('income-streams-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'income_streams', filter: `user_id=eq.${user.id}` },
          (payload) => {
            console.log('Income streams updated via realtime:', payload);
            fetchIncomeStreams();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
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