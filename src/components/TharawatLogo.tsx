import React from 'react';
import { Zap } from 'lucide-react';

interface TharawatLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const TharawatLogo: React.FC<TharawatLogoProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl', 
    lg: 'text-4xl'
  };

  const iconSize = {
    sm: 16,
    md: 24,
    lg: 32
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <Zap 
          className="text-primary" 
          size={iconSize[size]}
          fill="currentColor"
        />
      </div>
      <span className={`font-bold text-gradient-electric ${sizeClasses[size]}`}>
        Tharawat
      </span>
    </div>
  );
};

export default TharawatLogo;