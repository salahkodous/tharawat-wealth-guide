import React from 'react';
import Navigation from '@/components/Navigation';
import PortfolioSummary from '@/components/PortfolioSummary';
import DashboardFinanceOverview from '@/components/DashboardFinanceOverview';
import AIFinancialAgent from '@/components/AIFinancialAgent';
import { SEO } from '@/components/SEO';
import { useTranslation } from '@/hooks/useTranslation';

const Dashboard = () => {
  const { t } = useTranslation();
  
  return (
    <>
      <SEO
        title={`${t('dashboard')} - أناكين | منصة الاستثمار المصرية`}
        description="استعرض ملخصك المالي الكامل بما في ذلك أداء محفظتك الاستثمارية، الدخل، المصروفات، والتحليلات الذكية للسوق المصري."
        keywords="لوحة التحكم، نظرة مالية، أداء المحفظة، تتبع الاستثمارات، التمويل الشخصي"
      />
      <div className="min-h-screen bg-background relative overflow-hidden">
      
      <div className="relative z-10">
        <Navigation />
        
        <section className="py-8">
          <div className="container mx-auto px-4 space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">{t('dashboardOverview')}</h1>
              <p className="text-muted-foreground">{t('yourFinancialOverview')}</p>
            </div>
            
            <AIFinancialAgent />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <PortfolioSummary />
              <DashboardFinanceOverview />
            </div>
          </div>
        </section>

        <footer className="border-t border-border/20 py-8 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-muted-foreground">
              © 2024 أناكين | منصة الاستثمار. جميع الحقوق محفوظة.
            </p>
          </div>
        </footer>
      </div>
    </div>
    </>
  );
};

export default Dashboard;