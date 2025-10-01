import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, ExternalLink, TrendingUp, Globe, Filter, Search, AlertCircle } from 'lucide-react';
import { useNewsArticles } from '@/hooks/useNewsArticles';
import { useUserCountry } from '@/hooks/useUserCountry';
import { useAuth } from '@/hooks/useAuth';
import Navigation from '@/components/Navigation';

const Analytics = () => {
  const { articles, loading, error, getCategories } = useNewsArticles();
  const { userCountry } = useUserCountry();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('all');

  const categories = getCategories();

  const filteredArticles = useMemo(() => {
    let filtered = articles;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(query) ||
        article.summary.toLowerCase().includes(query) ||
        article.keywords?.some(keyword => 
          keyword.toLowerCase().includes(query)
        )
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => 
        article.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by sentiment
    if (selectedSentiment !== 'all') {
      filtered = filtered.filter(article => 
        article.sentiment.toLowerCase() === selectedSentiment.toLowerCase()
      );
    }

    return filtered.slice(0, 20); // Limit to top 20 articles
  }, [articles, searchQuery, selectedCategory, selectedSentiment]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
    }
  };

  const getPriorityIcon = (priority: number | null) => {
    if (!priority) return <Filter className="w-4 h-4 text-muted-foreground" />;
    
    if (priority >= 8) {
      return <TrendingUp className="w-4 h-4 text-red-500" />;
    } else if (priority >= 5) {
      return <Globe className="w-4 h-4 text-yellow-500" />;
    } else {
      return <Filter className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        
        <div className="relative z-10">
          <Navigation />
          
          <section className="py-8">
            <div className="container mx-auto px-4 space-y-8">
              <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Financial News Hub
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Loading the latest financial news for {userCountry?.name || 'your region'}...
                </p>
              </div>

              <div className="grid gap-6">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Card key={index}>
                    <CardHeader className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-5 w-20" />
                            <Skeleton className="h-5 w-14" />
                          </div>
                          <Skeleton className="h-6 w-full" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-16 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        
        <div className="relative z-10">
          <Navigation />
          
          <section className="py-8">
            <div className="container mx-auto px-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load news articles: {error}
                </AlertDescription>
              </Alert>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      
      <div className="relative z-10">
        <Navigation />
        
        <section className="py-8">
          <div className="container mx-auto px-4 space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Financial News Hub
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Stay updated with the latest financial news and market insights for {userCountry?.name || 'your region'}
              </p>
            </div>

            {/* Filters */}
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedSentiment} onValueChange={setSelectedSentiment}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Sentiments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sentiments</SelectItem>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center text-sm text-muted-foreground">
                  <Globe className="w-4 h-4 mr-2" />
                  {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''}
                </div>
              </div>
            </Card>

            {/* Articles */}
            <div className="grid gap-6">
              {filteredArticles.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No articles found matching your criteria.</p>
                </Card>
              ) : (
                filteredArticles.map((article) => (
                  <Card key={article.id} className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {getPriorityIcon(article.priority_score)}
                            {article.category && (
                              <Badge variant="secondary" className="text-xs">
                                {article.category}
                              </Badge>
                            )}
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getSentimentColor(article.sentiment)}`}
                            >
                              {article.sentiment}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Globe className="w-3 h-3" />
                              {article.country}
                            </div>
                          </div>
                          <CardTitle className="text-xl leading-tight hover:text-primary transition-colors">
                            {article.title}
                          </CardTitle>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {formatTimeAgo(article.created_at)}
                        </div>
                        {article.source_website && (
                          <span className="font-medium">{article.source_website}</span>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <CardDescription className="text-base leading-relaxed">
                        {article.summary}
                      </CardDescription>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2 flex-wrap">
                          {article.keywords?.slice(0, 4).map((keyword, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex gap-2">
                          {article.url && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="gap-2" 
                              asChild
                            >
                              <a href={article.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                                Read More
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Analytics;