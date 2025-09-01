import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import TharawatLogo from '@/components/TharawatLogo';
import VoiceSearchInput from '@/components/VoiceSearchInput';
import PortfolioManager from '@/components/PortfolioManager';
import AIRecommendations from '@/components/AIRecommendations';


// Import hero background
import heroBackground from '@/assets/hero-background.jpg';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: 'AI Financial Advisor',
      description: 'Get personalized financial advice powered by AI in Arabic and English'
    },
    {
      icon: PiggyBank,
      title: 'Smart Budgeting',
      description: 'Automated expense tracking and intelligent budget recommendations'
    },
    {
      icon: TrendingUp,
      title: 'Investment Management',
      description: 'Professional portfolio management across Arab markets'
    },
    {
      icon: Target,
      title: 'Goal Planning',
      description: 'Set and achieve financial goals with AI-powered strategies'
    },
    {
      icon: CreditCard,
      title: 'Debt Management',
      description: 'Optimize debt payments and improve your credit score'
    },
    {
      icon: BarChart3,
      title: 'Financial Analytics',
      description: 'Deep insights into your financial health and spending patterns'
    }
  ];

  const benefits = [
    'Complete financial overview in one dashboard',
    'AI-powered recommendations tailored to you',
    'Multi-currency support for Arab markets',
    'Automated expense categorization',
    'Real-time portfolio tracking',
    'Secure bank-level encryption'
  ];

  const testimonials = [
    {
      name: 'Ahmed Hassan',
      role: 'Entrepreneur, Cairo',
      quote: 'Tharawat helped me organize my finances and grow my investments by 40% in 6 months.',
    },
    {
      name: 'Sarah Al-Rashid',
      role: 'Business Owner, Dubai',
      quote: 'The AI assistant speaks both Arabic and English perfectly. It\'s like having a personal financial advisor.',
    },
    {
      name: 'Omar Abdullah',
      role: 'Engineer, Riyadh',
      quote: 'Finally, a financial app that understands Arab markets and Islamic finance principles.',
    }
  ];

  const stats = [
    { label: 'Active Users', value: '50K+', suffix: ' Investors' },
    { label: 'Assets Managed', value: '$2.5B', suffix: ' Portfolio Value' },
    { label: 'Success Rate', value: '94%', suffix: ' User Satisfaction' },
    { label: 'AI Accuracy', value: '98%', suffix: ' Recommendation Score' }
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
                <Button variant="ghost" className="hover:text-primary" onClick={() => navigate('/about')}>
                  About
                </Button>
                <Button variant="ghost" className="hover:text-primary">Features</Button>
                <Button variant="ghost" className="hover:text-primary">Pricing</Button>
                <Button 
                  className="gradient-electric text-primary-foreground"
                  onClick={() => navigate('/auth')}
                >
                  Get Started Free
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
                  <span className="text-gradient-electric">Super Personal</span>{' '}
                  Financial Manager
                </h1>
                
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto" dir="auto">
                  Take control of your financial future with AI-powered insights, automated tracking, 
                  and personalized recommendations. Join 50,000+ users who trust Tharawat to manage 
                  their wealth across Arab markets.
                  <br />
                  <span className="text-lg mt-3 block text-primary/80">
                    مديرك المالي الشخصي الذكي - خبير الأسواق العربية
                  </span>
                </p>

                <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <span>Bank-level Security</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span>50K+ Active Users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    <span>4 Arab Markets</span>
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

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="gradient-electric text-primary-foreground electric-pulse px-8 py-4 text-lg"
                  onClick={() => navigate('/auth')}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-primary/30 hover:border-primary px-8 py-4 text-lg"
                  onClick={() => setActiveTab('demo')}
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  View Demo
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                ✨ No credit card required • 30-day free trial • Cancel anytime
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 border-t border-border/20">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">
                Complete{' '}
                <span className="text-gradient-electric">Financial Management</span>{' '}
                Suite
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Everything you need to take control of your finances, grow your wealth, 
                and achieve your financial goals - all in one intelligent platform
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
                    Why Choose{' '}
                    <span className="text-gradient-electric">Tharawat</span>?
                  </h2>
                  <p className="text-xl text-muted-foreground">
                    Join thousands of successful investors who trust Tharawat 
                    as their personal financial manager
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

                <Button 
                  size="lg" 
                  className="gradient-electric text-primary-foreground"
                  onClick={() => navigate('/auth')}
                >
                  Start Your Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
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

        {/* Interactive Demo Section */}
        <section className="py-20 bg-secondary/10">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">
                Experience{' '}
                <span className="text-gradient-electric">Tharawat</span>{' '}
                in Action
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                See how our AI-powered platform can transform your financial life
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex justify-center mb-8">
                <TabsList className="grid w-full max-w-3xl grid-cols-4 bg-secondary/50">
                  <TabsTrigger value="dashboard" className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </TabsTrigger>
                  <TabsTrigger value="demo" className="flex items-center gap-2">
                    <Brain className="w-4 h-4" />
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

              <TabsContent value="demo" className="space-y-8">
                <VoiceSearchInput />
              </TabsContent>

              <TabsContent value="portfolio" className="space-y-8">
                <div className="flex justify-center">
                  <PortfolioManager />
                </div>
              </TabsContent>

              <TabsContent value="tracker" className="space-y-8">
                <Card className="max-w-4xl mx-auto">
                  <CardHeader>
                    <CardTitle className="text-center">Financial Tracker Demo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center text-muted-foreground py-12">
                      <Calculator className="w-16 h-16 mx-auto mb-4 text-primary" />
                      <p>Track all your finances in one place</p>
                      <Button 
                        className="mt-4"
                        onClick={() => navigate('/auth')}
                      >
                        Sign Up to Access Full Tracker
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

            </Tabs>

            <div className="text-center mt-12">
              <Button 
                size="lg" 
                className="gradient-electric text-primary-foreground px-8"
                onClick={() => navigate('/auth')}
              >
                Get Full Access Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-8 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to Transform Your{' '}
                <span className="text-gradient-electric">Financial Future</span>?
              </h2>
              <p className="text-xl text-muted-foreground">
                Join 50,000+ users who trust Tharawat as their personal financial manager. 
                Start your free trial today and experience the power of AI-driven financial management.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="gradient-electric text-primary-foreground px-8 py-4 text-lg"
                  onClick={() => navigate('/auth')}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                🔒 Bank-level security • 🌟 30-day free trial • 🚫 No credit card required
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/20 py-12 bg-background/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-4">
                <TharawatLogo size="md" />
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
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>About</div>
                  <div>Blog</div>
                  <div>Careers</div>
                  <div>Contact</div>
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
                © 2024 Tharawat. All rights reserved. | Licensed and regulated in Arab markets.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
