import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
  ArrowRight,
  Menu
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
  const { lang } = useParams<{ lang: string }>();
  const currentLang = lang || 'en';
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/en/dashboard');
    }
  }, [user, loading, navigate]);

  const features = [
    {
      icon: BarChart3,
      title: 'نظرة مالية شاملة موحدة',
      description: 'تتبع الدخل والمصروفات والمدخرات والديون وأسهم البورصة المصرية والذهب والعقارات والعملات الرقمية في لوحة واحدة - لا مزيد من التطبيقات المتعددة'
    },
    {
      icon: Brain,
      title: 'إرشاد مالي مدعوم بالذكاء الاصطناعي',
      description: 'احصل على نصائح مخصصة باستخدام بيانات البورصة المصرية وأسعار الذهب واتجاهات العقارات لمساعدتك على الادخار أو الاستثمار أو سداد الديون في الوقت المناسب'
    },
    {
      icon: Globe,
      title: 'أخبار مالية مبسطة',
      description: 'الأخبار الاقتصادية المصرية والعالمية المعقدة مترجمة إلى شروحات بسيطة بالعربية مرتبطة بمحفظتك الشخصية'
    },
    {
      icon: Target,
      title: 'تغطية السوق المحلي',
      description: 'البورصة المصرية وأسواق الذهب واتجاهات أسعار العقارات متكاملة لرؤى محلية ذات صلة'
    },
    {
      icon: Users,
      title: 'الثقافة المالية وسهولة الوصول',
      description: 'منصة بالعربية أولاً وصديقة للهاتف المحمول تمكن المصريين من إدارة شؤونهم المالية بشكل احترافي بغض النظر عن الخبرة'
    },
    {
      icon: Sparkles,
      title: 'ميزة السوق المبكر',
      description: 'كن من أوائل المصريين الذين يحصلون على إدارة مالية موحدة مدعومة بالذكاء الاصطناعي قبل الآخرين في المنطقة'
    }
  ];

  const benefits = [
    'لا مزيد من التنقل بين تطبيقات البنوك وجداول البيانات ومحلات الذهب وحسابات الوساطة',
    'وكيل القرار بالذكاء الاصطناعي يقدم إرشادات بناءً على بيانات البورصة المصرية والذهب والعقارات',
    'أخبار مالية مبسطة بالعربية - افهم كيف تؤثر على أموالك',
    'البورصة المصرية وبيانات الذهب والعقارات مدمجة من اليوم الأول',
    'مصمم للمصريين: واجهة بالعربية أولاً وتصميم صديق للهاتف المحمول',
    'ميزة الريادة في الإدارة المالية بالذكاء الاصطناعي في مصر'
  ];

  const testimonials = [
    {
      name: 'أحمد حسن',
      role: 'رائد أعمال، القاهرة',
      quote: 'أخيراً، مكان واحد لرؤية حساباتي البنكية وأسهمي في البورصة المصرية ومدخرات الذهب وقيمة العقارات. أناكين جعل إدارة شؤوني المالية أسهل بكثير.',
    },
    {
      name: 'منى إبراهيم',
      role: 'معلمة، الإسكندرية',
      quote: 'الذكاء الاصطناعي يشرح الأخبار المالية بعربية بسيطة. لأول مرة، أفهم كيف تؤثر الأحداث العالمية على مدخراتي وماذا أفعل حيال ذلك.',
    },
    {
      name: 'عمر محمود',
      role: 'مهندس، الجيزة',
      quote: 'كشخص بدون خلفية مالية، أناكين يعلمني بينما يساعدني على الاستثمار. تكامل البورصة المصرية مع الإرشاد بالذكاء الاصطناعي رائع.',
    }
  ];

  const stats = [
    { label: 'السوق المصري', value: 'EGX', suffix: ' متكامل' },
    { label: 'بيانات حية', value: 'الذهب', suffix: ' تتبع الأسعار' },
    { label: 'ذكاء اصطناعي', value: 'عربي', suffix: ' أخبار مالية' },
    { label: 'جميع الأصول', value: 'تطبيق واحد', suffix: ' رؤية موحدة' }
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
    "description": "دليل استثماري مدعوم بالذكاء الاصطناعي للأسواق العربية. تتبع أسهم البورصة المصرية والذهب والعقارات وإدارة محفظتك المالية بالكامل في منصة ذكية واحدة.",
    "featureList": [
      "إدارة المحفظة الاستثمارية",
      "تكامل البورصة المصرية (EGX)",
      "إرشاد مالي بالذكاء الاصطناعي",
      "تتبع العقارات",
      "مراقبة أسعار الذهب",
      "أخبار مالية بالعربية",
      "دعم عملات متعددة"
    ]
  };

  return (
    <>
      <SEO
        title="أناكين - دليلك الاستثماري بالذكاء الاصطناعي للسوق المصري"
        description="دليلك الاستثماري المدعوم بالذكاء الاصطناعي للأسواق العربية. تتبع أسهم البورصة المصرية والذهب والعقارات والحسابات البنكية والديون والعملات الرقمية مع إدارة محفظة ذكية. ابدأ مجاناً."
        keywords="أناكين، استثمار، إدارة المحفظة، البورصة المصرية، EGX، أسعار الذهب، عقارات، استثمار بالذكاء الاصطناعي، الأسواق العربية، إدارة مالية، إدارة الثروات"
        structuredData={structuredData}
        lang="ar"
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
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-6">
                <Button variant="ghost" className="hover:text-primary" onClick={() => navigate(`/${currentLang}/about`)}>
                  من نحن
                </Button>
                <Button variant="ghost" className="hover:text-primary" onClick={() => navigate(`/${currentLang}/privacy-policy`)}>
                  الخصوصية
                </Button>
                <Button variant="ghost" className="hover:text-primary" onClick={() => navigate(`/${currentLang}/pricing`)}>
                  الأسعار
                </Button>
                <Button 
                  className="gradient-electric text-primary-foreground"
                  onClick={() => navigate(`/${currentLang}/auth`)}
                >
                  <Sparkles className="w-4 h-4 ml-2" />
                  ابدأ الآن
                </Button>
              </nav>

              {/* Mobile Navigation */}
              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-background z-50">
                    <DropdownMenuItem onClick={() => navigate(`/${currentLang}/about`)}>
                      من نحن
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/${currentLang}/privacy-policy`)}>
                      الخصوصية
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/${currentLang}/pricing`)}>
                      الأسعار
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/${currentLang}/auth`)}>
                      <Sparkles className="w-4 h-4 ml-2" />
                      ابدأ الآن
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
                <h1 className="text-4xl md:text-6xl font-bold leading-tight" dir="rtl">
                  مركز{' '}
                  <span className="text-gradient-electric">القيادة المالية الذكي</span>{' '}
                  لمصر
                </h1>
                
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto" dir="rtl">
                  أدِر جميع شؤونك المالية في منصة ذكية واحدة. تتبع أسهم البورصة المصرية والذهب والعقارات 
                  والحسابات البنكية والديون والعملات الرقمية مع رؤى مدعومة بالذكاء الاصطناعي مصممة خصيصاً للسوق المصري.
                </p>

                <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground" dir="rtl">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    <span>تكامل البورصة المصرية</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    <span>أخبار مالية بالعربية</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-primary" />
                    <span>إرشاد بالذكاء الاصطناعي</span>
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
                  <h3 className="text-2xl md:text-3xl font-bold text-gradient-electric" dir="rtl">
                    ابدأ مجاناً
                  </h3>
                  <p className="text-lg text-muted-foreground" dir="rtl">
                    احصل على جميع الميزات مجاناً وحوّل مستقبلك المالي اليوم
                  </p>
                </div>

                <Button 
                  size="lg" 
                  className="gradient-electric text-primary-foreground electric-pulse px-8 py-4 text-lg"
                  onClick={() => navigate('/auth')}
                  dir="rtl"
                >
                  <ArrowRight className="w-5 h-5 ml-2" />
                  ابدأ الآن
                  <Sparkles className="w-5 h-5 mr-2" />
                </Button>
              </div>
            </div>
        </section>

        {/* Features Section */}
        <section className="py-20 border-t border-border/20">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold" dir="rtl">
                لماذا{' '}
                <span className="text-gradient-electric">المستثمرون المصريون</span>{' '}
                يختارون أناكين
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto" dir="rtl">
                أول منصة مالية مدعومة بالذكاء الاصطناعي مصممة خصيصاً للسوق المصري، 
                تجلب إدارة الثروات الاحترافية للجميع
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
                  <h2 className="text-3xl md:text-4xl font-bold" dir="rtl">
                    مصمم{' '}
                    <span className="text-gradient-electric">لمصر</span>
                  </h2>
                  <p className="text-xl text-muted-foreground" dir="rtl">
                    توقف عن التنقل بين التطبيقات وجداول البيانات المتعددة. أناكين يجمع كل شيء 
                    مع رؤى ذكاء اصطناعي تفهم السوق المصري
                  </p>
                </div>

                <div className="space-y-4" dir="rtl">
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
                    <CardContent className="p-6 space-y-4" dir="rtl">
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
                <h3 className="text-2xl md:text-3xl font-bold text-gradient-electric" dir="rtl">
                  ابدأ مجاناً
                </h3>
                <p className="text-lg text-muted-foreground" dir="rtl">
                  احصل على جميع الميزات مجاناً وحوّل مستقبلك المالي اليوم
                </p>
              </div>

              <Button 
                size="lg" 
                className="gradient-electric text-primary-foreground electric-pulse px-8 py-4 text-lg"
                onClick={() => navigate('/auth')}
                dir="rtl"
              >
                <ArrowRight className="w-5 h-5 ml-2" />
                ابدأ الآن
                <Sparkles className="w-5 h-5 mr-2" />
              </Button>
            </div>
          </div>
        </section>


        {/* Footer */}
        <footer className="border-t border-border/20 py-12 bg-background/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8" dir="rtl">
              <div className="space-y-4">
                <AnakinLogo size="md" />
                <p className="text-muted-foreground text-sm">
                  مديرك المالي الشخصي الذكي للأسواق العربية. 
                  إدارة الثروات المدعومة بالذكاء الاصطناعي أصبحت بسيطة.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">المنتج</h4>
                <div className="space-y-2 text-sm">
                  <button 
                    onClick={() => navigate(`/${currentLang}/pricing`)}
                    className="block text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    الأسعار
                  </button>
                  <div className="text-muted-foreground">الأمان</div>
                  <div className="text-muted-foreground/60">API (قريباً)</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">الشركة</h4>
                <div className="space-y-2 text-sm">
                  <button 
                    onClick={() => navigate(`/${currentLang}/about`)}
                    className="block text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    من نحن
                  </button>
                  <button 
                    onClick={() => navigate(`/${currentLang}/privacy-policy`)}
                    className="block text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    الخصوصية
                  </button>
                  <a 
                    href="mailto:support@anakin.tech"
                    className="block text-muted-foreground hover:text-primary transition-colors"
                  >
                    تواصل معنا
                  </a>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">تغطية السوق</h4>
                <div className="space-y-2 text-sm">
                  <div className="text-foreground font-medium">🇪🇬 مصر (البورصة المصرية)</div>
                  <p className="text-muted-foreground text-xs">
                    تكامل البورصة المصرية مع بيانات فورية
                  </p>
                  <div className="text-muted-foreground/60 text-xs pt-2">
                    المزيد من الأسواق قريباً
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-border/20 mt-8 pt-8 text-center">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} أناكين. جميع الحقوق محفوظة.
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
