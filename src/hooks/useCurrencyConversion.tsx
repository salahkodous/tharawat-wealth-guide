import { useState, useEffect, useMemo, useCallback } from 'react';
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

  // Memoized rate lookup map for O(1) access
  const rateMap = useMemo(() => {
    const map = new Map<string, number>();
    rates.forEach(rate => {
      const key = `${rate.base_currency}-${rate.target_currency}`;
      map.set(key, rate.exchange_rate);
    });
    return map;
  }, [rates]);

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

  const convertCurrency = useCallback((amount: number, fromCurrency: string, toCurrency?: string): number => {
    const targetCurrency = toCurrency || settings.currency;
    
    if (fromCurrency === targetCurrency) {
      return amount;
    }

    // O(1) lookup using memoized rate map
    let rate = 1;
    
    // Direct conversion
    const directKey = `${fromCurrency}-${targetCurrency}`;
    const directRate = rateMap.get(directKey);
    
    if (directRate) {
      rate = directRate;
    } else {
      // Indirect conversion via USD
      const fromToUsdKey = `${fromCurrency}-USD`;
      const usdToTargetKey = `USD-${targetCurrency}`;
      const fromToUsd = rateMap.get(fromToUsdKey);
      const usdToTarget = rateMap.get(usdToTargetKey);
      
      if (fromToUsd && usdToTarget) {
        rate = fromToUsd * usdToTarget;
      } else {
        // Reverse indirect conversion
        const usdToFromKey = `USD-${fromCurrency}`;
        const targetToUsdKey = `${targetCurrency}-USD`;
        const usdToFrom = rateMap.get(usdToFromKey);
        const targetToUsd = rateMap.get(targetToUsdKey);
        
        if (usdToFrom && targetToUsd) {
          rate = targetToUsd / usdToFrom;
        }
      }
    }

    return amount * rate;
  }, [rateMap, settings.currency]);

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
      INR: '₹',
      CNY: '¥',
    };

    const symbol = currencySymbols[targetCurrency] || targetCurrency;
    return `${symbol}${amount.toLocaleString()}`;
  };

  const getAvailableCurrencies = useMemo((): string[] => {
    const currencies = new Set<string>();
    rates.forEach(rate => {
      currencies.add(rate.base_currency);
      currencies.add(rate.target_currency);
    });
    return Array.from(currencies).sort();
  }, [rates]);

  return {
    convertCurrency,
    formatCurrency,
    getAvailableCurrencies,
    rates,
    loading,
    refetch: fetchRates,
  };
};