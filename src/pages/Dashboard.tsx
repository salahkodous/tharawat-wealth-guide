import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Briefcase, 
  Calculator, 
  TrendingUp,
  LogOut
} from 'lucide-react';

// Components
import AnimatedBackground from '@/components/AnimatedBackground';
import TharawatLogo from '@/components/TharawatLogo';
import MarketOverview from '@/components/MarketOverview';
import PortfolioSummary from '@/components/PortfolioSummary';
import PersonalFinances from '@/components/PersonalFinances';
import QuickActions from '@/components/QuickActions';
import AIRecommendations from '@/components/AIRecommendations';
import AIAssistantWithCharts from '@/components/AIAssistantWithCharts';
import PortfolioTable from '@/components/PortfolioTable';
import PortfolioManager from '@/components/PortfolioManager';
import FinancialTracker from '@/components/FinancialTracker';
import { useAuth } from '@/hooks/useAuth';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Main Content */}
      <div className="relative z-10">
        {/* Navigation Header */}
        <header className="border-b border-border/20 backdrop-blur-md bg-background/80">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <TharawatLogo size="lg" />
              
              <nav className="hidden md:flex items-center gap-6">
                <Button 
                  variant="ghost" 
                  className="hover:text-primary"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </nav>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <section className="py-8">
          <div className="container mx-auto px-4 space-y-8">
            <MarketOverview />
            <PortfolioSummary />
            <PersonalFinances />
            <QuickActions />
            <AIRecommendations />
          </div>
        </section>

        {/* Main App Interface */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex justify-center mb-8">
                <TabsList className="grid w-full max-w-2xl grid-cols-3 bg-secondary/50">
                  <TabsTrigger value="assistant" className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    <span className="hidden sm:inline">AI Assistant</span>
                  </TabsTrigger>
                  <TabsTrigger value="portfolio" className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    <span className="hidden sm:inline">Portfolio</span>
                  </TabsTrigger>
                  <TabsTrigger value="tracker" className="flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    <span className="hidden sm:inline">Tracker</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="assistant" className="space-y-8">
                <AIAssistantWithCharts />
              </TabsContent>

              <TabsContent value="portfolio" className="space-y-8">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="xl:col-span-2">
                    <PortfolioTable />
                  </div>
                  <div>
                    <PortfolioManager />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tracker" className="space-y-8">
                <FinancialTracker />
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Footer */}
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