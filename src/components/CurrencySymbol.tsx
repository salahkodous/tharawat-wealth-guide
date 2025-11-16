import React, { memo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

interface CurrencySymbolProps {
  className?: string;
}

const CurrencySymbol: React.FC<CurrencySymbolProps> = memo(({ 
  className = "" 
}) => {
  const { language } = useTranslation();
  
  return (
    <span className={`h-8 px-2 font-semibold text-sm flex items-center ${className}`}>
      {language === 'ar' ? 'ج.م' : 'EGP'}
    </span>
  );
});

CurrencySymbol.displayName = 'CurrencySymbol';

export default CurrencySymbol;