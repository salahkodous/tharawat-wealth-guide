import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface Deposit {
  id?: string;
  deposit_type: 'fixed_cd' | 'savings' | 'investment_linked' | 'cash_savings';
  principal: number;
  rate: number;
  start_date: string;
  maturity_date?: string;
  last_interest_date: string;
  accrued_interest: number;
  linked_asset?: string;
  status: string;
  computed?: {
    pending_accrual: number;
    total_value: number;
    monthly_saving_value: number;
  };
}

export interface CreateDepositData {
  deposit_type: 'fixed_cd' | 'savings' | 'investment_linked' | 'cash_savings';
  principal: number;
  rate: number;
  start_date: string;
  maturity_date?: string;
}

export const useDeposits = () => {
  const { user } = useAuth();
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeposits = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('deposits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeposits((data || []) as Deposit[]);
    } catch (error) {
      console.error('Error fetching deposits:', error);
    }
  };

  const createDeposit = async (depositData: CreateDepositData) => {
    if (!user) return;

    try {
      const response = await supabase.functions.invoke('deposits', {
        method: 'POST',
        body: depositData
      });

      if (response.error) throw response.error;
      
      await fetchDeposits();
      return response.data;
    } catch (error) {
      console.error('Error creating deposit:', error);
      throw error;
    }
  };

  const getDepositView = async (id: string) => {
    if (!user) return null;

    try {
      const response = await supabase.functions.invoke('deposits', {
        method: 'GET',
        body: { id }
      });

      if (response.error) throw response.error;
      return response.data;
    } catch (error) {
      console.error('Error getting deposit view:', error);
      throw error;
    }
  };

  const processDeposit = async (id: string) => {
    if (!user) return;

    try {
      const response = await supabase.functions.invoke('deposits', {
        method: 'PUT',
        body: { id, action: 'process' }
      });

      if (response.error) throw response.error;
      
      await fetchDeposits();
      return response.data;
    } catch (error) {
      console.error('Error processing deposit:', error);
      throw error;
    }
  };

  const deleteDeposit = async (id: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('deposits')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
      await fetchDeposits();
      return true;
    } catch (error) {
      console.error('Error deleting deposit:', error);
      throw error;
    }
  };

  const getTotalDepositsValue = () => {
    return deposits.reduce((total, deposit) => {
      const totalValue = deposit.computed?.total_value || (deposit.principal + deposit.accrued_interest);
      return total + totalValue;
    }, 0);
  };

  const getTotalMonthlySavings = () => {
    return deposits.reduce((total, deposit) => {
      return total + (deposit.computed?.monthly_saving_value || 0);
    }, 0);
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchDeposits().finally(() => {
        setLoading(false);
      });

      // Set up real-time subscription for deposits
      const channel = supabase
        .channel('deposits-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'deposits', filter: `user_id=eq.${user.id}` },
          (payload) => {
            console.log('Deposits updated via realtime:', payload);
            fetchDeposits();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'deposit_transactions', filter: `user_id=eq.${user.id}` },
          (payload) => {
            console.log('Deposit transactions updated via realtime:', payload);
            fetchDeposits();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return {
    deposits,
    loading,
    createDeposit,
    getDepositView,
    processDeposit,
    deleteDeposit,
    getTotalDepositsValue,
    getTotalMonthlySavings,
    refetch: fetchDeposits,
  };
};