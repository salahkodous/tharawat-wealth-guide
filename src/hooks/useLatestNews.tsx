import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface NewsArticle {
  id: number;
  title: string;
  summary: string;
  content: string;
  source_table: string;
  category: string;
  published_at: string;
  importance_level: string;
  location: string;
  business_sector: string;
  url: string;
  tags: string[];
  commodity_type: string;
  created_at: string;
  news_id: string;
}

export const useLatestNews = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async (filters?: {
    source?: string;
    location?: string;
    sector?: string;
    search?: string;
  }) => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('latest_all_news' as any)
        .select('*')
        .order('published_at', { ascending: false })
        .limit(100);

      if (filters?.source) {
        query = query.eq('source_table', filters.source);
      }

      if (filters?.location) {
        query = query.eq('location', filters.location);
      }

      if (filters?.sector) {
        query = query.eq('business_sector', filters.sector);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      let filteredData = (data as any) || [];

      // Client-side search filter
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter((article: NewsArticle) =>
          article.title?.toLowerCase().includes(searchLower) ||
          article.summary?.toLowerCase().includes(searchLower) ||
          article.content?.toLowerCase().includes(searchLower)
        );
      }

      setArticles(filteredData);
      setError(null);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('فشل تحميل الأخبار');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const getBreakingNews = () => {
    return articles.filter(article => article.importance_level === 'high').slice(0, 3);
  };

  const getBySource = (source: string) => {
    return articles.filter(article => article.source_table === source);
  };

  const getCommodityPrices = () => {
    return articles.filter(article => article.commodity_type);
  };

  const getLocations = () => {
    return [...new Set(articles.filter(a => a.location).map(a => a.location))];
  };

  const getSectors = () => {
    return [...new Set(articles.filter(a => a.business_sector).map(a => a.business_sector))];
  };

  return {
    articles,
    loading,
    error,
    refetch: fetchNews,
    getBreakingNews,
    getBySource,
    getCommodityPrices,
    getLocations,
    getSectors,
  };
};
