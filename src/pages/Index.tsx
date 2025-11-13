import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, 
  Briefcase, 
  Brain, 
  Calculator, 
  Target,
  Sparkles,
  TrendingUp,
  Shield,
  Globe,
  PiggyBank,
  CreditCard,
  BarChart3,
  Users,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

// Components
import AnimatedBackground from '@/components/AnimatedBackground';
import AnakinLogo from '@/components/AnakinLogo';
import VoiceSearchInput from '@/components/VoiceSearchInput';
import PortfolioManager from '@/components/PortfolioManager';
import { SEO } from '@/components/SEO';


// Import hero background
import heroBackground from '@/assets/hero-background.jpg';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/en/dashboard');
    }
  }, [user, loading, navigate]);

  const features = [
    {
      icon: BarChart3,
      title: 'All-in-One Financial View',
      description: 'Track income, expenses, savings, debts, EGX stocks, gold, real estate, and crypto in a single unified dashboard - no more juggling apps'
    },
    {
      icon: Brain,
      title: 'AI-Powered Financial Guidance',
      description: 'Get tailored advice using local EGX data, gold prices, and real estate trends to help you save, invest, or pay debt at the right time'
    },
    {
      icon: Globe,
      title: 'Simplified Financial News',
      description: 'Complex Egyptian and global economic news translated into simple Arabic explanations tied to your personal portfolio'
    },
    {
      icon: Target,
      title: 'Localized Market Coverage',
      description: 'Egyptian Stock Exchange (EGX), gold markets, and real estate price trends integrated for locally-relevant insights'
    },
    {
      icon: Users,
      title: 'Financial Literacy & Accessibility',
      description: 'Arabic-first, mobile-friendly platform that empowers Egyptians to manage finances professionally, regardless of experience'
    },
    {
      icon: Sparkles,
      title: 'Early-Market Advantage',
      description: 'Be among the first Egyptians to access AI-driven unified financial management before others in the region'
    }
  ];

  const benefits = [
    'No more juggling banking apps, spreadsheets, gold shops, and brokerage accounts',
    'AI Decision Agent provides guidance based on EGX, gold, and real estate data',
    'Financial news simplified in Arabic - understand how it affects YOUR money',
    'Egyptian Stock Exchange, gold, and property data built-in from day one',
    'Built for Egyptians: Arabic-first interface, mobile-friendly design',
    'First-mover advantage in Egyptian AI financial management'
  ];

  const testimonials = [
    {
      name: 'Ahmed Hassan',
      role: 'Entrepreneur, Cairo',
      quote: 'Finally, one place to see my bank accounts, EGX stocks, gold savings, and property value. Anakin made managing my finances so much easier.',
    },
    {
      name: 'Mona Ibrahim',
      role: 'Teacher, Alexandria',
      quote: 'The AI explains financial news in simple Arabic. For the first time, I understand how global events affect my savings and what to do about it.',
    },
    {
      name: 'Omar Mahmoud',
      role: 'Engineer, Giza',
      quote: 'As someone with no financial background, Anakin teaches me while helping me invest. The EGX integration with AI guidance is incredible.',
    }
  ];

  const stats = [
    { label: 'Egyptian Market', value: 'EGX', suffix: ' Integrated' },
    { label: 'Live Data', value: 'Gold', suffix: ' Price Tracking' },
    { label: 'AI-Powered', value: 'Arabic', suffix: ' Financial News' },
    { label: 'All Assets', value: '1 App', suffix: ' Unified View' }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Anakin",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "150"
    },
    "description": "AI-powered investment guide for Arab markets. Track EGX stocks, gold, real estate, and manage your entire financial portfolio in one intelligent platform.",
    "featureList": [
      "Portfolio Management",
      "Egyptian Stock Exchange (EGX) Integration",
      "AI Financial Guidance",
      "Real Estate Tracking",
      "Gold Price Monitoring",
      "Arabic Financial News",
      "Multi-currency Support"
    ]
  };

  return (
    <>
      <SEO
        title="Anakin - AI-Powered Investment Guide for Egyptian Markets"
        description="Your AI-powered investment guide for Arab markets. Track EGX stocks, gold, real estate, bank accounts, debts, and crypto with intelligent portfolio management. Free to start."
        keywords="anakin, investment, portfolio management, EGX, egyptian stock exchange, gold prices, real estate, AI investing, arab markets, financial management, wealth management"
        structuredData={structuredData}
        lang="en"
      />
      <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Main Content */}
      <div className="relative z-10">
        {/* Navigation Header */}
        <header className="border-b border-border/20 backdrop-blur-md bg-background/80">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <AnakinLogo size="lg" />
              
              <nav className="hidden md:flex items-center gap-6">
                <Button variant="ghost" className="hover:text-primary" onClick={() => navigate('/about')}>
                  About
                </Button>
                <Button variant="ghost" className="hover:text-primary">Features</Button>
                <Button variant="ghost" className="hover:text-primary">Pricing</Button>
                <Button 
                  className="gradient-electric text-primary-foreground"
                  onClick={() => navigate('/auth')}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start
                </Button>
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
              <div className="space-y-6">
                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                  Your{' '}
                  <span className="text-gradient-electric">AI Financial Command Center</span>{' '}
                  for Egypt
                </h1>
                
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto" dir="auto">
                  Manage all your finances in one intelligent platform. Track EGX stocks, gold, real estate, 
                  bank accounts, debts, and crypto with AI-powered insights tailored to the Egyptian market.
                  <br />
                  <span className="text-lg mt-3 block text-primary/80">
                    مركز القيادة المالية الذكي - مصمم خصيصاً للسوق المصري
                  </span>
                </p>

                <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    <span>EGX Integration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    <span>Arabic Financial News</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-primary" />
                    <span>AI-Powered Guidance</span>
                  </div>
                </div>
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
              </div>

              {/* CTA Section */}
              <div className="space-y-6 text-center">
                <div className="space-y-2">
                  <h3 className="text-2xl md:text-3xl font-bold text-gradient-electric">
                    Start for Free
                  </h3>
                  <p className="text-lg text-muted-foreground">
                    Take all features for free and transform your financial future today
                  </p>
                </div>

                <Button 
                  size="lg" 
                  className="gradient-electric text-primary-foreground electric-pulse px-8 py-4 text-lg"
                  onClick={() => navigate('/auth')}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
        </section>

        {/* Features Section */}
        <section className="py-20 border-t border-border/20">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">
                Why{' '}
                <span className="text-gradient-electric">Egyptian Investors</span>{' '}
                Choose Anakin
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                The first AI-powered financial platform built specifically for the Egyptian market, 
                bringing professional wealth management to everyone
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="glass-card hover:electric-glow transition-all duration-300 group">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold">{feature.title}</h3>
                      </div>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-3xl md:text-4xl font-bold">
                    Built for{' '}
                    <span className="text-gradient-electric">Egypt</span>
                  </h2>
                  <p className="text-xl text-muted-foreground">
                    Stop juggling multiple apps and spreadsheets. Anakin brings everything 
                    together with AI insights that understand the Egyptian market
                  </p>
                </div>

                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                {testimonials.map((testimonial, index) => (
                  <Card key={index} className="glass-card">
                    <CardContent className="p-6 space-y-4">
                      <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold">{testimonial.name}</div>
                          <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-6 max-w-3xl mx-auto">
              <div className="space-y-2">
                <h3 className="text-2xl md:text-3xl font-bold text-gradient-electric">
                  Start for Free
                </h3>
                <p className="text-lg text-muted-foreground">
                  Take all features for free and transform your financial future today
                </p>
              </div>

              <Button 
                size="lg" 
                className="gradient-electric text-primary-foreground electric-pulse px-8 py-4 text-lg"
                onClick={() => navigate('/auth')}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Start
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </section>


        {/* Footer */}
        <footer className="border-t border-border/20 py-12 bg-background/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-4">
                <AnakinLogo size="md" />
                <p className="text-muted-foreground text-sm">
                  Your super personal financial manager for Arab markets. 
                  AI-powered wealth management made simple.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Product</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>Features</div>
                  <div>Pricing</div>
                  <div>Security</div>
                  <div>API</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Company</h4>
                <div className="space-y-2 text-sm">
                  <button 
                    onClick={() => navigate('/about')}
                    className="block text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    About / من نحن
                  </button>
                  <button 
                    onClick={() => navigate('/privacy-policy')}
                    className="block text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    Privacy / الخصوصية
                  </button>
                  <div className="text-muted-foreground">Blog</div>
                  <div className="text-muted-foreground">Contact</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Markets</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>🇪🇬 Egypt (EGX)</div>
                  <div>🇸🇦 Saudi Arabia (Tadawul)</div>
                  <div>🇦🇪 UAE (DFM/ADX)</div>
                  <div>🇰🇼 Kuwait (Boursa)</div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-border/20 mt-8 pt-8 text-center">
              <p className="text-sm text-muted-foreground">
                © 2024 Anakin. All rights reserved. | Licensed and regulated in Arab markets.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
    </>
  );
};

export default Index;
