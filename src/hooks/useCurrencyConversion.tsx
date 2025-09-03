import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSettings } from './useSettings';

interface CurrencyRate {
  base_currency: string;
  target_currency: string;
  exchange_rate: number;
  last_updated: string;
}

export const useCurrencyConversion = () => {
  const { settings } = useSettings();
  const [rates, setRates] = useState<CurrencyRate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRates = async () => {
    try {
      const { data, error } = await supabase
        .from('currency_rates')
        .select('*')
        .order('last_updated', { ascending: false });
      
      if (!error && data) {
        setRates(data);
      }
    } catch (error) {
      console.error('Error fetching currency rates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const convertCurrency = (amount: number, fromCurrency: string, toCurrency?: string): number => {
    const targetCurrency = toCurrency || settings.currency;
    
    if (fromCurrency === targetCurrency) {
      return amount;
    }

    // Find conversion rate
    let rate = 1;
    
    // Direct conversion
    const directRate = rates.find(r => 
      r.base_currency === fromCurrency && r.target_currency === targetCurrency
    );
    
    if (directRate) {
      rate = directRate.exchange_rate;
    } else {
      // Indirect conversion via USD
      const fromToUsd = rates.find(r => 
        r.base_currency === fromCurrency && r.target_currency === 'USD'
      );
      const usdToTarget = rates.find(r => 
        r.base_currency === 'USD' && r.target_currency === targetCurrency
      );
      
      if (fromToUsd && usdToTarget) {
        rate = fromToUsd.exchange_rate * usdToTarget.exchange_rate;
      } else {
        // Reverse indirect conversion
        const usdToFrom = rates.find(r => 
          r.base_currency === 'USD' && r.target_currency === fromCurrency
        );
        const targetToUsd = rates.find(r => 
          r.base_currency === targetCurrency && r.target_currency === 'USD'
        );
        
        if (usdToFrom && targetToUsd) {
          rate = targetToUsd.exchange_rate / usdToFrom.exchange_rate;
        }
      }
    }

    return amount * rate;
  };

  const formatCurrency = (amount: number, currency?: string): string => {
    const targetCurrency = currency || settings.currency;
    
    const currencySymbols: Record<string, string> = {
      AED: 'د.إ',
      SAR: 'ر.س',
      QAR: 'ر.ق',
      KWD: 'د.ك',
      BHD: 'د.ب',
      OMR: 'ر.ع',
      JOD: 'د.أ',
      LBP: 'ل.ل',
      EGP: 'ج.م',
      MAD: 'د.م',
      TND: 'د.ت',
      DZD: 'د.ج',
      IQD: 'د.ع',
      USD: '$',
      GBP: '£',
      EUR: '€',
    };

    const symbol = currencySymbols[targetCurrency] || targetCurrency;
    return `${symbol}${amount.toLocaleString()}`;
  };

  const getAvailableCurrencies = (): string[] => {
    const currencies = new Set<string>();
    rates.forEach(rate => {
      currencies.add(rate.base_currency);
      currencies.add(rate.target_currency);
    });
    return Array.from(currencies).sort();
  };

  return {
    convertCurrency,
    formatCurrency,
    getAvailableCurrencies,
    rates,
    loading,
    refetch: fetchRates,
  };
};