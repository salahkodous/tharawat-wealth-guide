import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, 
  Briefcase, 
  Brain, 
  Calculator, 
  Target,
  Sparkles,
  TrendingUp,
  Shield,
  Globe
} from 'lucide-react';

// Components
import AnimatedBackground from '@/components/AnimatedBackground';
import TharawatLogo from '@/components/TharawatLogo';
import VoiceSearchInput from '@/components/VoiceSearchInput';
import PortfolioManager from '@/components/PortfolioManager';
import AIRecommendations from '@/components/AIRecommendations';


// Import hero background
import heroBackground from '@/assets/hero-background.jpg';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const features = [
    {
      icon: Search,
      title: 'AI Assistant',
      description: 'Ask questions in Arabic or English about investments across Arab markets'
    },
    {
      icon: Briefcase,
      title: 'Portfolio Manager',
      description: 'Track stocks, crypto, real estate, and more across Egypt, Saudi, UAE, and Kuwait'
    },
    {
      icon: Brain,
      title: 'Smart Recommendations',
      description: 'AI-powered insights and personalized investment strategies'
    },
    {
      icon: Calculator,
      title: 'Financial Tracker',
      description: 'Complete overview of income, expenses, debts, and savings goals'
    }
  ];

  const stats = [
    { label: 'Arab Markets Covered', value: '4', suffix: ' Countries' },
    { label: 'Investment Types', value: '7', suffix: ' Categories' },
    { label: 'AI Recommendations', value: '24/7', suffix: ' Support' },
    { label: 'Multi-Language', value: 'AR/EN', suffix: ' Support' }
  ];

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
                <Button variant="ghost" className="hover:text-primary">Markets</Button>
                <Button variant="ghost" className="hover:text-primary">Research</Button>
                <Button variant="ghost" className="hover:text-primary">Education</Button>
                <Button className="gradient-electric text-primary-foreground">Get Started</Button>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative py-20 md:py-32">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${heroBackground})` }}
          />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center space-y-8 max-w-4xl mx-auto">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                  <span className="text-gradient-electric">AI-Powered</span>{' '}
                  Investment Guide for{' '}
                  <span className="text-gradient-electric">Arab Markets</span>
                </h1>
                
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto" dir="auto">
                  Professional investment tools powered by artificial intelligence. 
                  Trade across Egypt, Saudi Arabia, UAE, and Kuwait with confidence.
                  <br />
                  <span className="text-lg mt-2 block">
                    دليل الاستثمار الذكي للأسواق العربية
                  </span>
                </p>
              </div>

              {/* Hero Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
                {stats.map((stat, index) => (
                  <Card key={index} className="glass-card">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.suffix}</div>
                      <div className="text-sm font-medium mt-1">{stat.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="gradient-electric text-primary-foreground electric-pulse"
                  onClick={() => setActiveTab('assistant')}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Try AI Assistant
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-primary/30 hover:border-primary"
                  onClick={() => setActiveTab('portfolio')}
                >
                  <Briefcase className="w-5 h-5 mr-2" />
                  Manage Portfolio
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 border-t border-border/20">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">
                Professional Tools for{' '}
                <span className="text-gradient-electric">Smart Investing</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need to build and manage wealth across Arab markets
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="glass-card hover:electric-glow transition-all duration-300 float-animation">
                    <CardContent className="p-6 text-center space-y-4">
                      <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Main App Interface */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex justify-center mb-8">
                <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-secondary/50">
                  <TabsTrigger value="dashboard" className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </TabsTrigger>
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

              <TabsContent value="dashboard" className="space-y-8">
                <AIRecommendations />
              </TabsContent>

              <TabsContent value="assistant" className="space-y-8">
                <VoiceSearchInput />
              </TabsContent>

              <TabsContent value="portfolio" className="space-y-8">
                <div className="flex justify-center">
                  <PortfolioManager />
                </div>
              </TabsContent>

            </Tabs>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/20 py-12 mt-20">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4">
              <TharawatLogo size="md" />
              <p className="text-muted-foreground max-w-md mx-auto">
                Democratizing sophisticated investment tools for the Arab world. 
                Build wealth with confidence using AI-powered insights.
              </p>
              <div className="flex justify-center items-center gap-2 text-sm text-muted-foreground">
                <Globe className="w-4 h-4" />
                <span>Serving Egypt • Saudi Arabia • UAE • Kuwait</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
