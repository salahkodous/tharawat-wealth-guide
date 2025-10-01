import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Brain, 
  Shield, 
  Globe, 
  Users, 
  TrendingUp, 
  Heart, 
  Award, 
  Target,
  CheckCircle,
  ArrowRight,
  Sparkles,
  BarChart3,
  PiggyBank,
  Briefcase
} from 'lucide-react';
import AnakinLogo from '@/components/AnakinLogo';

const About = () => {
  const navigate = useNavigate();

  const values = [
    {
      icon: Heart,
      title: 'Trust & Transparency',
      description: 'We believe in complete transparency in all our recommendations and fee structures. Your trust is our most valuable asset.'
    },
    {
      icon: Brain,
      title: 'Innovation First',
      description: 'We leverage cutting-edge AI technology to provide insights that were previously only available to institutional investors.'
    },
    {
      icon: Globe,
      title: 'Regional Expertise',
      description: 'Deep understanding of Arab markets, Islamic finance principles, and local economic factors that impact your investments.'
    },
    {
      icon: Users,
      title: 'User-Centric',
      description: 'Every feature we build is designed with your financial success in mind. We succeed only when you succeed.'
    }
  ];

  const services = [
    {
      icon: Brain,
      title: 'AI Financial Advisor',
      description: 'Personal AI assistant that speaks Arabic and English, providing 24/7 financial guidance tailored to your goals.',
      benefits: ['Personalized investment strategies', 'Real-time market analysis', 'Risk assessment and management']
    },
    {
      icon: BarChart3,
      title: 'Portfolio Management',
      description: 'Professional-grade portfolio tracking across stocks, crypto, real estate, and alternative investments.',
      benefits: ['Multi-asset portfolio tracking', 'Performance analytics', 'Rebalancing recommendations']
    },
    {
      icon: PiggyBank,
      title: 'Financial Planning',
      description: 'Comprehensive financial planning tools to help you budget, save, and achieve your financial goals.',
      benefits: ['Automated expense tracking', 'Goal-based savings plans', 'Debt optimization strategies']
    },
    {
      icon: TrendingUp,
      title: 'Market Intelligence',
      description: 'Deep market insights across Egypt, Saudi Arabia, UAE, and Kuwait with real-time data and analysis.',
      benefits: ['Real-time market data', 'Economic indicators', 'Sector analysis and trends']
    }
  ];

  const team = [
    {
      name: 'Ahmed Al-Mansouri',
      role: 'CEO & Co-Founder',
      background: 'Former Goldman Sachs analyst with 15+ years in Middle East markets',
      expertise: 'Investment Banking, Arab Markets'
    },
    {
      name: 'Fatima Hassan',
      role: 'CTO & Co-Founder',
      background: 'Ex-Google engineer, AI/ML specialist with fintech focus',
      expertise: 'Artificial Intelligence, Financial Technology'
    },
    {
      name: 'Omar Khalil',
      role: 'Head of Research',
      background: 'Former HSBC equity research director covering MENA region',
      expertise: 'Equity Research, Market Analysis'
    },
    {
      name: 'Sarah Al-Zahra',
      role: 'Head of Product',
      background: 'Ex-McKinsey consultant specialized in financial services',
      expertise: 'Product Strategy, User Experience'
    }
  ];

  const achievements = [
    { metric: '50,000+', label: 'Active Users' },
    { metric: '$2.5B+', label: 'Assets Under Management' },
    { metric: '94%', label: 'User Satisfaction' },
    { metric: '4', label: 'Arab Markets Covered' }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/20 backdrop-blur-md bg-background/80">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <AnakinLogo size="lg" />
              <Button 
                className="gradient-electric text-primary-foreground"
                onClick={() => navigate('/auth')}
              >
                Get Started Free
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-8 max-w-4xl mx-auto">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                  Who We Are &{' '}
                  <span className="text-gradient-electric">How We Help</span>
                </h1>
                
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  We are on a mission to democratize sophisticated financial management for the Arab world. 
                  Anakin combines cutting-edge AI technology with deep regional expertise to serve as your 
                  personal financial advisor.
                </p>

                <div className="flex flex-wrap justify-center gap-4 text-sm">
                  <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                    <Award className="w-4 h-4 text-primary" />
                    <span>Licensed & Regulated</span>
                  </div>
                  <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                    <Shield className="w-4 h-4 text-primary" />
                    <span>Bank-Level Security</span>
                  </div>
                  <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                    <Users className="w-4 h-4 text-primary" />
                    <span>50K+ Trusted Users</span>
                  </div>
                </div>
              </div>

              {/* Achievements */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
                {achievements.map((achievement, index) => (
                  <Card key={index} className="glass-card">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{achievement.metric}</div>
                      <div className="text-sm font-medium mt-1">{achievement.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Our Mission */}
        <section className="py-20 bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center space-y-6 mb-16">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Our <span className="text-gradient-electric">Mission</span>
                </h2>
                <p className="text-xl text-muted-foreground">
                  To empower every individual in the Arab world with the tools and knowledge 
                  they need to build lasting wealth and achieve financial independence.
                </p>
              </div>

              <Card className="glass-card p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold">The Challenge We Solve</h3>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        For too long, sophisticated financial management tools have been exclusive 
                        to wealthy individuals and institutions. Meanwhile, retail investors in 
                        Arab markets struggled with fragmented information, language barriers, 
                        and lack of personalized guidance.
                      </p>
                      <p>
                        Traditional financial advisors are expensive and often unavailable to 
                        everyday investors. Online resources are either too generic or don't 
                        understand the unique aspects of Arab markets and Islamic finance.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold">Our Solution</h3>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        Anakin bridges this gap by providing institutional-grade financial 
                        management tools powered by AI, specifically designed for Arab markets. 
                        Our platform speaks your language—literally and culturally.
                      </p>
                      <p>
                        We combine the best of technology and human expertise to deliver 
                        personalized financial guidance that's accessible, affordable, and 
                        available 24/7.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">
                Our <span className="text-gradient-electric">Values</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                The principles that guide everything we do
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <Card key={index} className="glass-card hover:electric-glow transition-all duration-300">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold">{value.title}</h3>
                      </div>
                      <p className="text-muted-foreground">{value.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* How We Help */}
        <section className="py-20 bg-secondary/10">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">
                How We <span className="text-gradient-electric">Help You</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Comprehensive financial services designed specifically for Arab investors
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <Card key={index} className="glass-card">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <CardTitle className="text-xl">{service.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">{service.description}</p>
                      <div className="space-y-2">
                        {service.benefits.map((benefit, benefitIndex) => (
                          <div key={benefitIndex} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Leadership Team */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">
                Meet Our <span className="text-gradient-electric">Team</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Industry veterans with decades of combined experience in finance and technology
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {team.map((member, index) => (
                <Card key={index} className="glass-card">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">{member.name}</h3>
                        <p className="text-primary font-medium">{member.role}</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm">{member.background}</p>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{member.expertise}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-8 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to Start Your{' '}
                <span className="text-gradient-electric">Financial Journey</span>?
              </h2>
              <p className="text-xl text-muted-foreground">
                Join thousands of successful investors who trust Anakin to manage and grow their wealth. 
                Experience the future of personal finance today.
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
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-primary/30 hover:border-primary px-8 py-4 text-lg"
                  onClick={() => navigate('/')}
                >
                  <Briefcase className="w-5 h-5 mr-2" />
                  View Platform
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                🔒 Regulated & Secure • 🌟 30-day free trial • 🚫 No credit card required
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/20 py-8 bg-background/50">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <AnakinLogo size="md" />
              <p className="text-sm text-muted-foreground mt-4">
                © 2024 Anakin. Licensed and regulated across Arab markets.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default About;