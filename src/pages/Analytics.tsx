import React from 'react';
import AnimatedBackground from '@/components/AnimatedBackground';
import Navigation from '@/components/Navigation';
import MarketOverview from '@/components/MarketOverview';

const Analytics = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10">
        <Navigation />
        
        <section className="py-8">
          <div className="container mx-auto px-4 space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Market Analytics</h1>
              <p className="text-muted-foreground">Real-time market data and trends</p>
            </div>
            
            <MarketOverview />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Analytics;