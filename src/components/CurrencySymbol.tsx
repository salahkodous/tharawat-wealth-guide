import React, { memo } from 'react';

interface CurrencySymbolProps {
  className?: string;
}

const CurrencySymbol: React.FC<CurrencySymbolProps> = memo(({ 
  className = "" 
}) => {
  return (
    <span className={`h-8 px-2 font-semibold text-sm flex items-center ${className}`}>
      ج.م
    </span>
  );
});

CurrencySymbol.displayName = 'CurrencySymbol';

export default CurrencySymbol;