import React from 'react';
import AnimatedBackground from '@/components/AnimatedBackground';
import Navigation from '@/components/Navigation';
import AIAssistantWithCharts from '@/components/AIAssistantWithCharts';
import AIRecommendations from '@/components/AIRecommendations';

const Assistant = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10">
        <Navigation />
        
        <section className="py-8">
          <div className="container mx-auto px-4 space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">AI Assistant</h1>
              <p className="text-muted-foreground">Get personalized insights and recommendations</p>
            </div>
            
            <AIAssistantWithCharts />
            <AIRecommendations />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Assistant;