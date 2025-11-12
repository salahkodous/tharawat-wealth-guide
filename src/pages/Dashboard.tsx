import React from 'react';
import Navigation from '@/components/Navigation';
import PortfolioSummary from '@/components/PortfolioSummary';
import DashboardFinanceOverview from '@/components/DashboardFinanceOverview';
import AIFinancialAgent from '@/components/AIFinancialAgent';
import { SEO } from '@/components/SEO';

const Dashboard = () => {
  return (
    <>
      <SEO
        title="Dashboard - Anakin Investment Platform"
        description="View your complete financial overview including portfolio performance, income, expenses, and AI-powered insights for Egyptian and Arab markets."
        keywords="dashboard, financial overview, portfolio performance, investment tracking, personal finance"
      />
      <div className="min-h-screen bg-background relative overflow-hidden">
      
      <div className="relative z-10">
        <Navigation />
        
        <section className="py-8">
          <div className="container mx-auto px-4 space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
              <p className="text-muted-foreground">Your financial overview at a glance</p>
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
              © 2024 Anakin Investment Platform. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
    </>
  );
};

export default Dashboard;