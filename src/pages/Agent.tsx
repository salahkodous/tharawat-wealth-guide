import React from 'react';
import Navigation from '@/components/Navigation';
import AIFinancialAgent from '@/components/AIFinancialAgent';

const Agent = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="relative z-10">
        <Navigation />
        
        <section className="py-8">
          <div className="container mx-auto px-4 space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">AI Financial Agent</h1>
              <p className="text-muted-foreground">Ask questions about your finances and get AI-powered insights</p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <AIFinancialAgent />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Agent;
