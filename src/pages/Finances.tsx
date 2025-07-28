import React from 'react';
import AnimatedBackground from '@/components/AnimatedBackground';
import Navigation from '@/components/Navigation';
import PersonalFinances from '@/components/PersonalFinances';

const Finances = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <AnimatedBackground />
      
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
  );
};

export default Finances;