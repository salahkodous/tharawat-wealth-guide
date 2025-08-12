import React from 'react';
import AnimatedBackground from '@/components/AnimatedBackground';
import Navigation from '@/components/Navigation';
import PortfolioSummary from '@/components/PortfolioSummary';
import PersonalFinances from '@/components/PersonalFinances';
import AIFinancialAgent from '@/components/AIFinancialAgent';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <AnimatedBackground />
      
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
              <PersonalFinances />
            </div>
          </div>
        </section>

        <footer className="border-t border-border/20 py-8 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-muted-foreground">
              © 2024 Tharawat Investment Platform. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;