import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, Sparkles, Zap } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import AnakinLogo from '@/components/AnakinLogo';

const Pricing = () => {
  const navigate = useNavigate();
  const { lang } = useParams<{ lang: string }>();
  const currentLang = lang || 'en';
  const isArabic = currentLang === 'ar';

  const features = {
    free: [
      { name: isArabic ? 'جميع الميزات الأساسية' : 'All core Anakin features', included: true },
      { name: isArabic ? 'لوحة تحكم مالية كاملة' : 'Full financial dashboard', included: true },
      { name: isArabic ? 'تتبع المحفظة الاستثمارية' : 'Portfolio tracking', included: true },
      { name: isArabic ? 'أخبار مالية مخصصة' : 'Personalized financial news', included: true },
      { name: isArabic ? 'وصول أساسي لوكيل القرار' : 'Decision Agent basic access', included: true },
      { name: isArabic ? 'أدوات ذكية لإدارة الميزانية' : 'Smart budgeting tools', included: true },
      { name: isArabic ? 'حتى 3 استفسارات ذكاء اصطناعي يومياً' : 'Up to 3 AI queries per day', included: true },
      { name: isArabic ? 'دعم متعدد اللغات' : 'Multi-language support', included: true },
      { name: isArabic ? 'استفسارات ذكاء اصطناعي غير محدودة' : 'Unlimited AI queries', included: false },
      { name: isArabic ? 'دعم ذو أولوية' : 'Priority support', included: false },
      { name: isArabic ? 'وصول مبكر للميزات الجديدة' : 'Early access to new features', included: false },
      { name: isArabic ? 'تقرير مالي شهري' : 'Monthly financial report', included: false },
    ],
    pro: [
      { name: isArabic ? 'جميع الميزات الأساسية' : 'All core Anakin features', included: true },
      { name: isArabic ? 'لوحة تحكم مالية كاملة' : 'Full financial dashboard', included: true },
      { name: isArabic ? 'تتبع المحفظة الاستثمارية' : 'Portfolio tracking', included: true },
      { name: isArabic ? 'أخبار مالية مخصصة' : 'Personalized financial news', included: true },
      { name: isArabic ? 'وصول أساسي لوكيل القرار' : 'Decision Agent basic access', included: true },
      { name: isArabic ? 'أدوات ذكية لإدارة الميزانية' : 'Smart budgeting tools', included: true },
      { name: isArabic ? 'استفسارات ذكاء اصطناعي غير محدودة' : 'Unlimited AI queries', included: true },
      { name: isArabic ? 'دعم متعدد اللغات' : 'Multi-language support', included: true },
      { name: isArabic ? 'سرعة استجابة ذات أولوية' : 'Priority response speed', included: true },
      { name: isArabic ? 'وصول مبكر للميزات الجديدة' : 'Early access to new features', included: true },
      { name: isArabic ? 'رؤى محفظة متقدمة' : 'Deeper portfolio insights', included: true },
      { name: isArabic ? 'تنبيهات متقدمة' : 'Advanced alerts', included: true },
      { name: isArabic ? 'تحسين الأهداف الذكية' : 'Smart goals optimization', included: true },
      { name: isArabic ? 'تقرير مالي شهري مخصص' : 'Personalized monthly financial report', included: true },
      { name: isArabic ? 'سير عمل متقدم متعدد الوكلاء' : 'Premium multi-agent workflows', included: true },
    ],
  };

  return (
    <>
      <SEO
        title={isArabic ? 'الأسعار - آناكن' : 'Pricing - Anakin'}
        description={isArabic ? 'أسعار بسيطة وشفافة. ابدأ مجاناً - قم بالترقية في أي وقت.' : 'Simple, transparent pricing. Start free — upgrade anytime.'}
        lang={currentLang}
      />

      <div className="min-h-screen bg-background" dir={isArabic ? 'rtl' : 'ltr'}>
        {/* Header */}
        <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="cursor-pointer" onClick={() => navigate(`/${currentLang}`)}>
                <AnakinLogo size="lg" />
              </div>
              
              <nav className="hidden md:flex items-center gap-6">
                <Button variant="ghost" onClick={() => navigate(`/${currentLang}/about`)}>
                  {isArabic ? 'من نحن' : 'About'}
                </Button>
                <Button variant="ghost" onClick={() => navigate(`/${currentLang}/privacy-policy`)}>
                  {isArabic ? 'الخصوصية' : 'Privacy'}
                </Button>
                <Button variant="ghost" onClick={() => navigate(`/${currentLang}/pricing`)}>
                  {isArabic ? 'الأسعار' : 'Pricing'}
                </Button>
                <Button 
                  className="gradient-electric text-primary-foreground"
                  onClick={() => navigate(`/${currentLang}/auth`)}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isArabic ? 'ابدأ الآن' : 'Start'}
                </Button>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            {isArabic ? 'أسعار بسيطة وشفافة' : 'Simple, transparent pricing'}
          </h1>
          <p className="text-xl text-muted-foreground mb-12">
            {isArabic ? 'ابدأ مجاناً - قم بالترقية في أي وقت' : 'Start free — upgrade anytime'}
          </p>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
            {/* Free Plan */}
            <Card className="border-2 border-border">
              <CardHeader>
                <div className="mb-2">
                  <Sparkles className="w-8 h-8 text-primary mx-auto" />
                </div>
                <CardTitle className="text-2xl">
                  {isArabic ? 'خطة مجانية' : 'Free Plan'}
                </CardTitle>
                <CardDescription>
                  {isArabic ? 'للمستخدمين الجدد الذين يستكشفون آناكن' : 'Best for new users exploring Anakin'}
                </CardDescription>
                <div className="text-4xl font-bold mt-4">
                  {isArabic ? '٠ جنيه' : '0 EGP'}
                  <span className="text-lg text-muted-foreground font-normal">
                    {isArabic ? ' / شهرياً' : ' / month'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {features.free.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-primary shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground shrink-0" />
                    )}
                    <span className={feature.included ? 'text-foreground' : 'text-muted-foreground'}>
                      {feature.name}
                    </span>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => navigate(`/${currentLang}/auth`)}
                >
                  {isArabic ? 'ابدأ مجاناً' : 'Start for Free'}
                </Button>
              </CardFooter>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-primary shadow-lg relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                {isArabic ? 'الأكثر شعبية' : 'Most Popular'}
              </div>
              <CardHeader>
                <div className="mb-2">
                  <Zap className="w-8 h-8 text-primary mx-auto" />
                </div>
                <CardTitle className="text-2xl">
                  {isArabic ? 'خطة برو' : 'Pro Plan'}
                </CardTitle>
                <CardDescription>
                  {isArabic ? 'للمستخدمين النشطين الذين يريدون إرشاداً غير محدود' : 'For active users who want unlimited AI guidance'}
                </CardDescription>
                <div className="text-4xl font-bold mt-4">
                  {isArabic ? '١٠٠ جنيه' : '100 EGP'}
                  <span className="text-lg text-muted-foreground font-normal">
                    {isArabic ? ' / شهرياً' : ' / month'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {features.pro.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-foreground">{feature.name}</span>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full gradient-electric text-primary-foreground"
                  onClick={() => navigate(`/${currentLang}/auth`)}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isArabic ? 'احصل على برو' : 'Go Pro'}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Comparison Table */}
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">
              {isArabic ? 'مقارنة الميزات' : 'Feature Comparison'}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border border-border rounded-lg">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-semibold">
                      {isArabic ? 'الميزة' : 'Feature'}
                    </th>
                    <th className="text-center p-4 font-semibold">
                      {isArabic ? 'مجاني' : 'Free'}
                    </th>
                    <th className="text-center p-4 font-semibold">
                      {isArabic ? 'برو' : 'Pro'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border">
                    <td className="p-4">{isArabic ? 'جميع الميزات الأساسية' : 'All core features'}</td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                  </tr>
                  <tr className="border-t border-border bg-muted/20">
                    <td className="p-4">{isArabic ? 'استفسارات ذكاء اصطناعي يومياً' : 'AI queries per day'}</td>
                    <td className="text-center p-4">3</td>
                    <td className="text-center p-4">{isArabic ? 'غير محدود' : 'Unlimited'}</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="p-4">{isArabic ? 'رؤى مخصصة' : 'Personalized insights'}</td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                  </tr>
                  <tr className="border-t border-border bg-muted/20">
                    <td className="p-4">{isArabic ? 'دعم ذو أولوية' : 'Priority support'}</td>
                    <td className="text-center p-4"><X className="w-5 h-5 text-muted-foreground mx-auto" /></td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="p-4">{isArabic ? 'تقرير مالي شهري' : 'Monthly report'}</td>
                    <td className="text-center p-4"><X className="w-5 h-5 text-muted-foreground mx-auto" /></td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                  </tr>
                  <tr className="border-t border-border bg-muted/20">
                    <td className="p-4">{isArabic ? 'وصول مبكر للميزات' : 'Early feature access'}</td>
                    <td className="text-center p-4"><X className="w-5 h-5 text-muted-foreground mx-auto" /></td>
                    <td className="text-center p-4"><Check className="w-5 h-5 text-primary mx-auto" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Pricing;
