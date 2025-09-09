import React from 'react';
import anakinLogoProfessional from '@/assets/anakin-logo-professional.png';

interface AnakinLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const AnakinLogo: React.FC<AnakinLogoProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl', 
    lg: 'text-4xl'
  };

  const logoSize = {
    sm: 20,
    md: 28,
    lg: 36
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        <img 
          src={anakinLogoProfessional}
          alt="Anakin Logo"
          className="electric-glow"
          style={{ width: logoSize[size], height: logoSize[size] }}
        />
      </div>
      <span className={`font-bold text-gradient-electric ${sizeClasses[size]}`}>
        Anakin
      </span>
    </div>
  );
};

export default AnakinLogo;