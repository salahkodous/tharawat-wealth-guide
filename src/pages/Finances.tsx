import React from 'react';
import Navigation from '@/components/Navigation';
import { SEO } from '@/components/SEO';
import PersonalFinances from '@/components/PersonalFinances';

const Finances = () => {
  return (
    <>
      <SEO
        title="Financial Management - Anakin Investment Platform"
        description="Manage your personal finances with income tracking, expense management, debt tracking, savings goals, and deposit management. Complete financial overview for Egyptian users."
        keywords="financial management, income tracking, expense management, debt tracking, savings goals, personal finance, budget management"
      />
      <div className="min-h-screen bg-background relative overflow-hidden">
      
      <div className="relative z-10">
        <Navigation />
        
        <section className="py-8">
          <div className="container mx-auto px-4 space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Financial Management</h1>
              <p className="text-muted-foreground">Track your income, expenses, and financial goals</p>
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