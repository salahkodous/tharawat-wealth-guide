import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SEO } from '@/components/SEO';
import { 
  Shield, 
  Lock, 
  Eye, 
  Users, 
  FileText, 
  Mail,
  Home,
  ArrowRight
} from 'lucide-react';
import AnakinLogo from '@/components/AnakinLogo';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  const sections = [
    {
      icon: FileText,
      title: 'المعلومات التي نجمعها',
      content: [
        'المعلومات الشخصية: مثل الاسم والبريد الإلكتروني وبيانات التواصل لإنشاء الحساب وتسجيل الدخول.',
        'البيانات المالية: مثل الأرصدة، والاستثمارات، والمصروفات، والبيانات التي تختار ربطها بمنصتنا.',
        'بيانات الاستخدام: مثل نوع الجهاز، وتفاعلات التطبيق، لتحسين الأداء والتجربة.',
        'ملفات تعريف الارتباط (Cookies): لتخزين تفضيلاتك وتحسين الأداء.'
      ]
    },
    {
      icon: Eye,
      title: 'كيفية استخدام البيانات',
      content: [
        'تقديم تحليلات وتوصيات مالية مخصصة بالاعتماد على الذكاء الاصطناعي.',
        'تحسين دقة النظام وتطوير الميزات.',
        'إرسال التحديثات والإشعارات الأمنية.',
        'الامتثال للقوانين المحلية والدولية ذات الصلة.'
      ],
      note: 'نحن لا نبيع ولا نشارك بياناتك الشخصية أو المالية مع أي جهة لأغراض إعلانية.'
    },
    {
      icon: Lock,
      title: 'أمان البيانات',
      content: [
        'نستخدم تشفيراً بمستوى أمني مماثل للبنوك (AES-256).',
        'نقل البيانات يتم عبر اتصالات HTTPS مشفرة.',
        'يُسمح بالوصول إلى البيانات فقط للأنظمة المصرح بها.'
      ]
    },
    {
      icon: Users,
      title: 'مشاركة البيانات مع أطراف أخرى',
      content: [
        'عند ربطك لأي حساب مالي أو مصدر بيانات خارجي، يتم الوصول إلى البيانات للقراءة فقط لأغراض التحليل والعرض — دون أي تعديل أو تنفيذ عمليات مالية.'
      ]
    },
    {
      icon: Shield,
      title: 'حقوقك كمستخدم',
      content: [
        'طلب نسخة من بياناتك.',
        'حذف حسابك وجميع بياناتك نهائياً.',
        'إلغاء الاشتراك في الرسائل غير الضرورية.'
      ],
      note: 'يمكنك ممارسة هذه الحقوق من خلال إعدادات التطبيق أو عبر البريد الإلكتروني: support@anakin.tech'
    },
    {
      icon: FileText,
      title: 'تحديثات السياسة',
      content: [
        'قد نقوم بتحديث هذه السياسة من حين لآخر بما يتناسب مع التغييرات التقنية أو القانونية.',
        'سيتم نشر أي تحديث هنا مع تاريخ آخر تحديث.'
      ]
    }
  ];

  return (
    <>
      <SEO
        title="سياسة الخصوصية - آناكن | حماية بياناتك المالية"
        description="تعرف على كيفية حماية آناكن لبياناتك المالية الشخصية. نستخدم أعلى معايير الأمان والتشفير لحماية معلوماتك."
        keywords="سياسة الخصوصية, حماية البيانات, أمان المعلومات, تشفير البيانات, آناكن"
        lang="ar"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "سياسة الخصوصية - آناكن",
          "description": "سياسة الخصوصية وحماية البيانات في منصة آناكن",
          "url": "https://yourdomain.com/privacy-policy"
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
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="w-10 h-10 text-primary" />
                </div>
                
                <div className="space-y-6">
                  <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                    <span className="text-gradient-electric">سياسة الخصوصية</span>
                  </h1>
                  
                  <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    في آناكن، نحترم خصوصيتك ونعمل على حماية بياناتك بأعلى معايير الأمان. 
                    توضح هذه السياسة كيفية جمعنا واستخدامنا وحمايتنا لمعلوماتك عند استخدامك لمنصتنا وخدماتنا.
                  </p>

                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <span>آخر تحديث:</span>
                    <span className="font-semibold">نوفمبر ٢٠٢٥</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Content Sections */}
          <section className="py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto space-y-8">
                {sections.map((section, index) => {
                  const Icon = section.icon;
                  return (
                    <Card key={index} className="glass-card">
                      <CardContent className="p-8 space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                          <h2 className="text-2xl font-bold">{section.title}</h2>
                        </div>

                        <div className="space-y-4 mr-16">
                          <ul className="space-y-3">
                            {section.content.map((item, itemIndex) => (
                              <li key={itemIndex} className="flex items-start gap-3 text-muted-foreground leading-relaxed">
                                <span className="text-primary mt-1 flex-shrink-0">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>

                          {section.note && (
                            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-4">
                              <p className="text-sm text-foreground leading-relaxed">{section.note}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="py-20 bg-secondary/10">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <Card className="glass-card">
                  <CardContent className="p-8 text-center space-y-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <Mail className="w-8 h-8 text-primary" />
                    </div>
                    
                    <div className="space-y-4">
                      <h2 className="text-2xl font-bold">هل لديك أسئلة حول الخصوصية؟</h2>
                      <p className="text-muted-foreground leading-relaxed">
                        إذا كان لديك أي استفسارات أو مخاوف بخصوص سياسة الخصوصية أو كيفية استخدامنا لبياناتك، 
                        لا تتردد في التواصل معنا.
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Button 
                          size="lg" 
                          className="gradient-electric text-primary-foreground"
                          onClick={() => window.location.href = 'mailto:support@anakin.tech'}
                        >
                          <Mail className="w-5 h-5 ml-2" />
                          تواصل معنا
                        </Button>
                        <Button 
                          size="lg" 
                          variant="outline"
                          onClick={() => navigate('/about')}
                        >
                          تعرف علينا أكثر
                          <ArrowRight className="w-5 h-5 mr-2" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
                    onClick={() => navigate('/about')}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    من نحن
                  </button>
                  <span className="text-muted-foreground">•</span>
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

export default PrivacyPolicy;
