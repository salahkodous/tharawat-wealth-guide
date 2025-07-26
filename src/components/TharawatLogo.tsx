import React from 'react';
import { Zap } from 'lucide-react';
import tharawatLogo from '@/assets/tharawat-logo.png';

interface TharawatLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const TharawatLogo: React.FC<TharawatLogoProps> = ({ 
  size = 'md', 
  showText = true, 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl', 
    xl: 'text-3xl'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} relative electric-pulse`}>
        <img 
          src={tharawatLogo} 
          alt="Tharawat AI"
          className="w-full h-full object-contain"
        />
        <div className="absolute inset-0 bg-gradient-electric opacity-20 rounded-lg"></div>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <h1 className={`font-bold text-gradient-electric ${textSizeClasses[size]} leading-tight`}>
            ثروات AI
          </h1>
          <p className="text-muted-foreground text-xs tracking-wide">
            THARAWAT AI
          </p>
        </div>
      )}
    </div>
  );
};

export default TharawatLogo;