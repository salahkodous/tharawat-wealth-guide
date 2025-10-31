import { useState } from 'react';
import { useLatestNews } from '@/hooks/useLatestNews';
import Navigation from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, TrendingUp, DollarSign, Building2, Sparkles, Flame, MapPin, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const News = () => {
  const { articles, loading, refetch, getBreakingNews, getCommodityPrices, getLocations, getSectors } = useLatestNews();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');

  const handleSearch = () => {
    refetch({
      source: selectedSource !== 'all' ? selectedSource : undefined,
      location: selectedLocation !== 'all' ? selectedLocation : undefined,
      sector: selectedSector !== 'all' ? selectedSector : undefined,
      search: searchQuery || undefined,
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSource('all');
    setSelectedLocation('all');
    setSelectedSector('all');
    refetch();
  };

  const getSourceBadge = (source: string) => {
    const sourceConfig: Record<string, { label: string; icon: any; variant: string }> = {
      'egyptian_stocks': { label: 'البورصة', icon: TrendingUp, variant: 'default' },
      'mubasher_news': { label: 'مباشر', icon: TrendingUp, variant: 'default' },
      'alborsa_news': { label: 'البورصة نيوز', icon: Building2, variant: 'secondary' },
      'almaal_news': { label: 'المال', icon: Building2, variant: 'secondary' },
      'bloomberg_news': { label: 'بلومبرج', icon: Building2, variant: 'secondary' },
      'ai_generated_news': { label: 'تحليل AI', icon: Sparkles, variant: 'outline' },
      'crawled_news': { label: 'متابعة', icon: Flame, variant: 'destructive' },
      'egyptian_gold_prices': { label: 'أسعار الذهب', icon: DollarSign, variant: 'outline' },
    };

    const config = sourceConfig[source] || { label: source, icon: Building2, variant: 'secondary' };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant as any} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatArabicDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'd MMMM yyyy، h:mm a', { locale: ar });
    } catch {
      return dateString;
    }
  };

  const breakingNews = getBreakingNews();
  const commodityPrices = getCommodityPrices();

  const filteredArticles = () => {
    switch (activeTab) {
      case 'breaking':
        return breakingNews;
      case 'commodities':
        return commodityPrices;
      case 'ai':
        return articles.filter(a => a.source_table === 'ai_generated_news');
      case 'trending':
        return articles.filter(a => a.source_table === 'crawled_news');
      default:
        return articles;
    }
  };

  if (loading && articles.length === 0) {
    return (
      <>
        <Navigation />
        <div className="container mx-auto p-4 space-y-4" dir="rtl">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navigation />
      {/* Header */}
      <div className="glass-card border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="heading-primary mb-2">الأخبار المالية</h1>
          <p className="subtitle-medium text-muted-foreground">آخر الأخبار والتحليلات من الأسواق المصرية</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Search and Filters */}
        <Card className="glass-card p-4">
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث في الأخبار..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pr-10"
                />
              </div>
              <Button onClick={handleSearch} className="electric-glow">
                بحث
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="المصدر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل المصادر</SelectItem>
                  <SelectItem value="egyptian_stocks">البورصة</SelectItem>
                  <SelectItem value="mubasher_news">مباشر</SelectItem>
                  <SelectItem value="alborsa_news">البورصة نيوز</SelectItem>
                  <SelectItem value="almaal_news">المال</SelectItem>
                  <SelectItem value="ai_generated_news">تحليل AI</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="الموقع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل المواقع</SelectItem>
                  {getLocations().map(loc => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="القطاع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل القطاعات</SelectItem>
                  {getSectors().map(sector => (
                    <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={clearFilters}>
                <Filter className="h-4 w-4 ml-2" />
                مسح الفلاتر
              </Button>
            </div>
          </div>
        </Card>

        {/* Breaking News Section */}
        {breakingNews.length > 0 && activeTab === 'all' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-destructive" />
              <h2 className="heading-secondary">عاجل</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {breakingNews.map((article) => (
                <Card key={article.id} className="glass-card p-4 border-destructive/50 hover:border-destructive transition-colors">
                  <div className="space-y-2">
                    <div className="flex gap-2 flex-wrap">
                      {getSourceBadge(article.source_table)}
                      <Badge variant="destructive">عاجل</Badge>
                    </div>
                    <h3 className="heading-tertiary line-clamp-2">{article.title}</h3>
                    <p className="body-small text-muted-foreground line-clamp-2">{article.summary}</p>
                    {article.published_at && (
                      <p className="caption text-muted-foreground">{formatArabicDate(article.published_at)}</p>
                    )}
                    {article.url && (
                      <Button variant="link" className="p-0 h-auto" asChild>
                        <a href={article.url} target="_blank" rel="noopener noreferrer">
                          اقرأ المزيد ←
                        </a>
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="glass-card w-full justify-start overflow-x-auto">
            <TabsTrigger value="all" className="gap-2">
              <Building2 className="h-4 w-4" />
              كل الأخبار
            </TabsTrigger>
            <TabsTrigger value="breaking" className="gap-2">
              <Flame className="h-4 w-4" />
              عاجل
            </TabsTrigger>
            <TabsTrigger value="commodities" className="gap-2">
              <DollarSign className="h-4 w-4" />
              الأسعار
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Sparkles className="h-4 w-4" />
              تحليلات AI
            </TabsTrigger>
            <TabsTrigger value="trending" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              المتابعة
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredArticles().length === 0 ? (
              <Card className="glass-card p-8 text-center">
                <p className="body-medium text-muted-foreground">لا توجد أخبار في هذا القسم</p>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredArticles().map((article) => (
                  <Card key={article.id} className="glass-card p-4 hover:shadow-lg transition-all">
                    <div className="space-y-3">
                      <div className="flex gap-2 flex-wrap items-start">
                        {getSourceBadge(article.source_table)}
                        {article.importance_level === 'high' && (
                          <Badge variant="destructive">مهم</Badge>
                        )}
                        {article.source_table === 'ai_generated_news' && (
                          <Badge variant="outline" className="electric-glow">
                            <Sparkles className="h-3 w-3 ml-1" />
                            AI
                          </Badge>
                        )}
                      </div>

                      <h3 className="heading-tertiary line-clamp-2">{article.title}</h3>
                      
                      {article.summary && (
                        <p className="body-small text-muted-foreground line-clamp-3">{article.summary}</p>
                      )}

                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {article.published_at && (
                          <span className="caption">{formatArabicDate(article.published_at)}</span>
                        )}
                        {article.location && (
                          <span className="flex items-center gap-1 caption">
                            <MapPin className="h-3 w-3" />
                            {article.location}
                          </span>
                        )}
                      </div>

                      {article.business_sector && (
                        <Badge variant="secondary" className="text-xs">
                          {article.business_sector}
                        </Badge>
                      )}

                      {article.tags && article.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {article.tags.slice(0, 3).map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {article.url && (
                        <Button variant="link" className="p-0 h-auto text-primary" asChild>
                          <a href={article.url} target="_blank" rel="noopener noreferrer">
                            اقرأ المزيد ←
                          </a>
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="breaking" className="space-y-4">
            {filteredArticles().length === 0 ? (
              <Card className="glass-card p-8 text-center">
                <p className="body-medium text-muted-foreground">لا توجد أخبار في هذا القسم</p>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredArticles().map((article) => (
                  <Card key={article.id} className="glass-card p-4 hover:shadow-lg transition-all">
                    <div className="space-y-3">
                      <div className="flex gap-2 flex-wrap items-start">
                        {getSourceBadge(article.source_table)}
                        {article.importance_level === 'high' && (
                          <Badge variant="destructive">مهم</Badge>
                        )}
                        {article.source_table === 'ai_generated_news' && (
                          <Badge variant="outline" className="electric-glow">
                            <Sparkles className="h-3 w-3 ml-1" />
                            AI
                          </Badge>
                        )}
                      </div>

                      <h3 className="heading-tertiary line-clamp-2">{article.title}</h3>
                      
                      {article.summary && (
                        <p className="body-small text-muted-foreground line-clamp-3">{article.summary}</p>
                      )}

                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {article.published_at && (
                          <span className="caption">{formatArabicDate(article.published_at)}</span>
                        )}
                        {article.location && (
                          <span className="flex items-center gap-1 caption">
                            <MapPin className="h-3 w-3" />
                            {article.location}
                          </span>
                        )}
                      </div>

                      {article.business_sector && (
                        <Badge variant="secondary" className="text-xs">
                          {article.business_sector}
                        </Badge>
                      )}

                      {article.tags && article.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {article.tags.slice(0, 3).map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {article.url && (
                        <Button variant="link" className="p-0 h-auto text-primary" asChild>
                          <a href={article.url} target="_blank" rel="noopener noreferrer">
                            اقرأ المزيد ←
                          </a>
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="commodities" className="space-y-4">
            {filteredArticles().length === 0 ? (
              <Card className="glass-card p-8 text-center">
                <p className="body-medium text-muted-foreground">لا توجد أخبار في هذا القسم</p>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredArticles().map((article) => (
                  <Card key={article.id} className="glass-card p-4 hover:shadow-lg transition-all">
                    <div className="space-y-3">
                      <div className="flex gap-2 flex-wrap items-start">
                        {getSourceBadge(article.source_table)}
                        {article.importance_level === 'high' && (
                          <Badge variant="destructive">مهم</Badge>
                        )}
                        {article.source_table === 'ai_generated_news' && (
                          <Badge variant="outline" className="electric-glow">
                            <Sparkles className="h-3 w-3 ml-1" />
                            AI
                          </Badge>
                        )}
                      </div>

                      <h3 className="heading-tertiary line-clamp-2">{article.title}</h3>
                      
                      {article.summary && (
                        <p className="body-small text-muted-foreground line-clamp-3">{article.summary}</p>
                      )}

                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {article.published_at && (
                          <span className="caption">{formatArabicDate(article.published_at)}</span>
                        )}
                        {article.location && (
                          <span className="flex items-center gap-1 caption">
                            <MapPin className="h-3 w-3" />
                            {article.location}
                          </span>
                        )}
                      </div>

                      {article.business_sector && (
                        <Badge variant="secondary" className="text-xs">
                          {article.business_sector}
                        </Badge>
                      )}

                      {article.tags && article.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {article.tags.slice(0, 3).map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {article.url && (
                        <Button variant="link" className="p-0 h-auto text-primary" asChild>
                          <a href={article.url} target="_blank" rel="noopener noreferrer">
                            اقرأ المزيد ←
                          </a>
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            {filteredArticles().length === 0 ? (
              <Card className="glass-card p-8 text-center">
                <p className="body-medium text-muted-foreground">لا توجد أخبار في هذا القسم</p>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredArticles().map((article) => (
                  <Card key={article.id} className="glass-card p-4 hover:shadow-lg transition-all">
                    <div className="space-y-3">
                      <div className="flex gap-2 flex-wrap items-start">
                        {getSourceBadge(article.source_table)}
                        {article.importance_level === 'high' && (
                          <Badge variant="destructive">مهم</Badge>
                        )}
                        {article.source_table === 'ai_generated_news' && (
                          <Badge variant="outline" className="electric-glow">
                            <Sparkles className="h-3 w-3 ml-1" />
                            AI
                          </Badge>
                        )}
                      </div>

                      <h3 className="heading-tertiary line-clamp-2">{article.title}</h3>
                      
                      {article.summary && (
                        <p className="body-small text-muted-foreground line-clamp-3">{article.summary}</p>
                      )}

                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {article.published_at && (
                          <span className="caption">{formatArabicDate(article.published_at)}</span>
                        )}
                        {article.location && (
                          <span className="flex items-center gap-1 caption">
                            <MapPin className="h-3 w-3" />
                            {article.location}
                          </span>
                        )}
                      </div>

                      {article.business_sector && (
                        <Badge variant="secondary" className="text-xs">
                          {article.business_sector}
                        </Badge>
                      )}

                      {article.tags && article.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {article.tags.slice(0, 3).map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {article.url && (
                        <Button variant="link" className="p-0 h-auto text-primary" asChild>
                          <a href={article.url} target="_blank" rel="noopener noreferrer">
                            اقرأ المزيد ←
                          </a>
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="trending" className="space-y-4">
            {filteredArticles().length === 0 ? (
              <Card className="glass-card p-8 text-center">
                <p className="body-medium text-muted-foreground">لا توجد أخبار في هذا القسم</p>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredArticles().map((article) => (
                  <Card key={article.id} className="glass-card p-4 hover:shadow-lg transition-all">
                    <div className="space-y-3">
                      <div className="flex gap-2 flex-wrap items-start">
                        {getSourceBadge(article.source_table)}
                        {article.importance_level === 'high' && (
                          <Badge variant="destructive">مهم</Badge>
                        )}
                        {article.source_table === 'ai_generated_news' && (
                          <Badge variant="outline" className="electric-glow">
                            <Sparkles className="h-3 w-3 ml-1" />
                            AI
                          </Badge>
                        )}
                      </div>

                      <h3 className="heading-tertiary line-clamp-2">{article.title}</h3>
                      
                      {article.summary && (
                        <p className="body-small text-muted-foreground line-clamp-3">{article.summary}</p>
                      )}

                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {article.published_at && (
                          <span className="caption">{formatArabicDate(article.published_at)}</span>
                        )}
                        {article.location && (
                          <span className="flex items-center gap-1 caption">
                            <MapPin className="h-3 w-3" />
                            {article.location}
                          </span>
                        )}
                      </div>

                      {article.business_sector && (
                        <Badge variant="secondary" className="text-xs">
                          {article.business_sector}
                        </Badge>
                      )}

                      {article.tags && article.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {article.tags.slice(0, 3).map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {article.url && (
                        <Button variant="link" className="p-0 h-auto text-primary" asChild>
                          <a href={article.url} target="_blank" rel="noopener noreferrer">
                            اقرأ المزيد ←
                          </a>
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default News;
