import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SEO } from '@/components/SEO';
import { 
  Brain, 
  Shield, 
  Globe, 
  Users, 
  TrendingUp, 
  Target,
  ArrowRight,
  Home
} from 'lucide-react';
import AnakinLogo from '@/components/AnakinLogo';

const About = () => {
  const navigate = useNavigate();

  const pillars = [
    {
      icon: Target,
      title: 'تجربة موحدة',
      description: 'لوحة تحكم واحدة لكل أصولك وأهدافك'
    },
    {
      icon: Brain,
      title: 'تحليلات ذكية',
      description: 'قرارات مالية شخصية تعتمد على الذكاء الاصطناعي'
    },
    {
      icon: Globe,
      title: 'توطين المحتوى',
      description: 'تجربة عربية أولاً مع بيانات محلية دقيقة'
    },
    {
      icon: Users,
      title: 'رفع الوعي المالي',
      description: 'مساعدة المستخدمين على فهم وتحسين أوضاعهم المالية'
    }
  ];

  return (
    <>
      <SEO
        title="من نحن - آناكن | منصة إدارة الشؤون المالية بالذكاء الاصطناعي"
        description="آناكن هو منصة ذكية لإدارة الشؤون المالية الشخصية تجمع كل ما يتعلق بحياتك المالية في مكان واحد. مدعوم بالذكاء الاصطناعي لتقديم نصائح مالية مخصصة."
        keywords="آناكن, إدارة مالية, ذكاء اصطناعي, استثمار, مصر, السعودية, مدير مالي شخصي"
        lang="ar"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "آناكن - Anakin",
          "description": "منصة ذكية لإدارة الشؤون المالية الشخصية مدعومة بالذكاء الاصطناعي",
          "url": "https://yourdomain.com"
        }}
      />
      <div className="min-h-screen bg-background relative overflow-hidden" dir="rtl">
      
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/20 backdrop-blur-md bg-background/80">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/')}
                >
                  <Home className="w-5 h-5" />
                </Button>
                <AnakinLogo size="lg" />
              </div>
              <Button 
                className="gradient-electric text-primary-foreground"
                onClick={() => navigate('/auth')}
              >
                ابدأ مجاناً
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
                  آناكن – مديرك المالي الشخصي{' '}
                  <span className="text-gradient-electric">المدعوم بالذكاء الاصطناعي</span>
                </h1>
                
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  آناكن هو منصة ذكية لإدارة الشؤون المالية الشخصية، تجمع كل ما يتعلق بحياتك المالية في مكان واحد. 
                  سواء كنت تتابع نفقاتك، أو تدير استثماراتك، أو تراقب مدخراتك، أو تتابع أخبار الأسواق، 
                  فإن آناكن يمنحك رؤية شاملة ودقيقة تساعدك على اتخاذ قرارات مالية أفضل.
                </p>

                <div className="flex flex-wrap justify-center gap-4 text-sm">
                  <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                    <Shield className="w-4 h-4 text-primary" />
                    <span>أمان بمستوى البنوك</span>
                  </div>
                  <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                    <Brain className="w-4 h-4 text-primary" />
                    <span>ذكاء اصطناعي متقدم</span>
                  </div>
                  <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                    <Globe className="w-4 h-4 text-primary" />
                    <span>أسواق عربية محلية</span>
                  </div>
                </div>
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
                  <span className="text-gradient-electric">مهمتنا</span>
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  تمكين الأفراد من السيطرة على مستقبلهم المالي من خلال قرارات ذكية مبنية على البيانات
                </p>
              </div>

              <Card className="glass-card p-8">
                <div className="space-y-8">
                  <div className="space-y-4 text-muted-foreground leading-relaxed">
                    <p>
                      يعمل آناكن عبر نظام متعدد الوكلاء (Multi-Agent AI) يقوم بتحليل الدخل والمصروفات والمحافظ والأهداف 
                      ليقدم لك نصائح مالية مخصصة تناسب وضعك الشخصي.
                    </p>
                    <p>
                      من تبسيط الأخبار الاقتصادية إلى مساعدتك في اتخاذ قرار الادخار أو الاستثمار أو سداد الديون — 
                      آناكن هو مستشارك المالي الذكي على مدار الساعة.
                    </p>
                    <p>
                      نبدأ انطلاقتنا من مصر والمملكة العربية السعودية مع دمج مباشر للأسواق المحلية مثل الأسهم والذهب والعقارات، 
                      ونتطلع للتوسع إلى منطقة الخليج والأسواق الناشئة لتوفير أدوات مالية متقدمة في متناول الجميع.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Pillars */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">
                <span className="text-gradient-electric">ركائزنا الأساسية</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {pillars.map((pillar, index) => {
                const Icon = pillar.icon;
                return (
                  <Card key={index} className="glass-card hover:electric-glow transition-all duration-300">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold">{pillar.title}</h3>
                      </div>
                      <p className="text-muted-foreground">{pillar.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Vision */}
        <section className="py-20 bg-secondary/10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">
                  <span className="text-gradient-electric">رؤيتنا</span>
                </h2>
                <Card className="glass-card p-8">
                  <p className="text-xl text-muted-foreground leading-relaxed">
                    أن نصبح المدير المالي الشخصي الافتراضي المدعوم بالذكاء الاصطناعي على مستوى العالم — 
                    لمساعدة الناس في اتخاذ قرارات مالية أذكى، وبناء الثروة، وتحقيق الحرية المالية.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-8 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold">
                ابدأ رحلتك المالية{' '}
                <span className="text-gradient-electric">مع آناكن</span>
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                انضم إلى الآلاف من المستثمرين الناجحين الذين يثقون بآناكن لإدارة ونمو ثرواتهم. 
                اختبر مستقبل الإدارة المالية الشخصية اليوم.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="gradient-electric text-primary-foreground px-8 py-4 text-lg"
                  onClick={() => navigate('/auth')}
                >
                  ابدأ الآن مجاناً
                  <ArrowRight className="w-5 h-5 mr-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-primary/30 hover:border-primary px-8 py-4 text-lg"
                  onClick={() => navigate('/')}
                >
                  استكشف المنصة
                  <TrendingUp className="w-5 h-5 mr-2" />
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                🔒 آمن ومُرخص • 🌟 مجاني للاستخدام • 🚫 لا حاجة لبطاقة ائتمان
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/20 py-8 bg-background/50">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4">
              <AnakinLogo size="md" />
              <p className="text-sm text-muted-foreground">
                © 2024 آناكن. جميع الحقوق محفوظة.
              </p>
              <div className="flex justify-center gap-4 text-sm">
                <button 
                  onClick={() => navigate('/privacy-policy')}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  سياسة الخصوصية
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
    </>
  );
};

export default About;