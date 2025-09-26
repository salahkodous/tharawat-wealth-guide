import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ExternalLink, Search, Clock, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NewsItem {
  title: string;
  snippet: string;
  link: string;
  source: string;
  published: string;
  query: string;
}

interface NewsResponse {
  success: boolean;
  news: NewsItem[];
  total: number;
  message: string;
  timestamp: string;
}

export const EgyptianMarketNews = () => {
  const [query, setQuery] = useState('Egyptian stock market news EGX');
  const [loading, setLoading] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchNews = async (searchQuery?: string) => {
    setLoading(true);
    
    try {
      console.log('Fetching Egyptian market news...');
      
      const { data, error } = await supabase.functions.invoke('egyptian-market-news', {
        body: { query: searchQuery || query }
      });

      if (error) {
        console.error('Function error:', error);
        toast.error('Failed to fetch news: ' + error.message);
        return;
      }

      const response = data as NewsResponse;
      console.log('News response:', response);
      
      if (response.success) {
        setNews(response.news);
        setLastUpdated(new Date().toLocaleString());
        toast.success(`Found ${response.total} news articles`);
      } else {
        toast.error('Failed to fetch news');
      }
    } catch (err) {
      console.error('News fetch error:', err);
      toast.error('Error fetching news: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const quickSearches = [
    'Egyptian stock market news EGX',
    'EGX market performance today',
    'Egyptian banks stocks news',
    'Egypt real estate market news',
    'EGX30 index news'
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Egyptian Stock Market News
          {lastUpdated && (
            <Badge variant="outline" className="ml-auto">
              <Clock className="w-3 h-3 mr-1" />
              {lastUpdated}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for Egyptian market news..."
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && fetchNews()}
          />
          <Button 
            onClick={() => fetchNews()} 
            disabled={loading}
            size="sm"
          >
            <Search className="w-4 h-4 mr-2" />
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {quickSearches.map((search, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => fetchNews(search)}
              disabled={loading}
              className="text-xs"
            >
              {search}
            </Button>
          ))}
        </div>

        {news.length > 0 && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {news.map((item, index) => (
              <div key={index} className="p-3 bg-muted/50 rounded-lg space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium text-sm leading-tight line-clamp-2">
                    {item.title}
                  </h4>
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    {item.source}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {item.snippet}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {item.published !== 'Recent' ? item.published : 'Recently published'}
                  </span>
                  <a 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    Read more
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {news.length === 0 && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Click "Search" to fetch the latest Egyptian market news</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};