import React from 'react';
import Navigation from '@/components/Navigation';
import { SEO } from '@/components/SEO';
import PersonalFinances from '@/components/PersonalFinances';
import { useTranslation } from '@/hooks/useTranslation';

const Finances = () => {
  const { t } = useTranslation();
  
  return (
    <>
      <SEO
        title={`${t('finances')} - أناكين | إدارة الشؤون المالية`}
        description="أدر شؤونك المالية الشخصية مع تتبع الدخل، إدارة المصروفات، تتبع الديون، أهداف الادخار، وإدارة الودائع. نظرة مالية كاملة للمستخدمين المصريين."
        keywords="إدارة مالية، تتبع الدخل، إدارة المصروفات، تتبع الديون، أهداف الادخار، التمويل الشخصي، إدارة الميزانية"
      />
      <div className="min-h-screen bg-background relative overflow-hidden">
      
      <div className="relative z-10">
        <Navigation />
        
        <section className="py-8">
          <div className="container mx-auto px-4 space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">{t('financialManagement')}</h1>
              <p className="text-muted-foreground">{t('trackIncomeExpenses')}</p>
            </div>
            
            <PersonalFinances />
          </div>
        </section>
      </div>
    </div>
    </>
  );
};

export default Finances;