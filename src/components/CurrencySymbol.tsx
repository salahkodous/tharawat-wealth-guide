import React, { memo, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';
import { useSettings } from '@/hooks/useSettings';

interface CurrencySymbolProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  EGP: 'ج.م',
};

const CURRENCY_NAMES: Record<string, string> = {
  EGP: 'Egyptian Pound',
};

const CurrencySymbol: React.FC<CurrencySymbolProps> = memo(({ 
  className = "", 
  variant = "ghost" 
}) => {
  const { currency } = useCurrency();
  const { getAvailableCurrencies } = useCurrencyConversion();
  const { updateSettings } = useSettings();

  // Memoize available currencies to prevent recalculation
  const availableCurrencies = useMemo(() => 
    getAvailableCurrencies.filter(curr => CURRENCY_SYMBOLS[curr]),
    [getAvailableCurrencies]
  );

  const currentSymbol = CURRENCY_SYMBOLS[currency] || currency;

  const handleCurrencyChange = async (newCurrency: string) => {
    await updateSettings({ currency: newCurrency });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size="sm" 
          className={`h-8 px-2 font-semibold text-sm hover:bg-accent/50 transition-colors duration-200 ${className}`}
        >
          {currentSymbol}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 max-h-80 overflow-y-auto bg-popover/95 backdrop-blur-sm border-border/50"
      >
        {availableCurrencies.map((curr) => (
          <DropdownMenuItem
            key={curr}
            onClick={() => handleCurrencyChange(curr)}
            className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-accent/50 transition-colors duration-150 ${
              curr === currency ? 'bg-primary/10 text-primary' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-semibold">
                {CURRENCY_SYMBOLS[curr]}
              </span>
              <span className="text-sm">{curr}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {CURRENCY_NAMES[curr]}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

CurrencySymbol.displayName = 'CurrencySymbol';

export default CurrencySymbol;