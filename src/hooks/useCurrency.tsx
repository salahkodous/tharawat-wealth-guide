import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { useSettings } from './useSettings';

interface CurrencyContextType {
  currency: string;
  formatAmount: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

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

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    // Prefer settings context over user metadata
    if (settings.currency) {
      setCurrency(settings.currency);
    } else if (user?.user_metadata?.currency) {
      setCurrency(user.user_metadata.currency);
    }
  }, [user, settings.currency]);

  const formatAmount = (amount: number): string => {
    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${amount.toLocaleString()}`;
  };

  const value = {
    currency,
    formatAmount,
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};