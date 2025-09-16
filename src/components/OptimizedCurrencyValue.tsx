import React, { memo, useMemo } from 'react';
import { useCurrency } from '@/hooks/useCurrency';

interface OptimizedCurrencyValueProps {
  amount: number;
  fromCurrency?: string;
  className?: string;
  showSymbol?: boolean;
}

const OptimizedCurrencyValue: React.FC<OptimizedCurrencyValueProps> = memo(({
  amount,
  fromCurrency,
  className = "",
  showSymbol = true
}) => {
  const { formatAmount } = useCurrency();

  // Memoize formatted value to prevent recalculation on every render
  const formattedValue = useMemo(() => {
    return formatAmount(amount, fromCurrency);
  }, [amount, fromCurrency, formatAmount]);

  return (
    <span className={className}>
      {formattedValue}
    </span>
  );
});

OptimizedCurrencyValue.displayName = 'OptimizedCurrencyValue';

export default OptimizedCurrencyValue;