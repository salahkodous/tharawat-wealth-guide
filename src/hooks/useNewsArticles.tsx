import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserCountry } from './useUserCountry';

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  full_text: string;
  source_website: string | null;
  sentiment: string;
  country: string;
  keywords: string[] | null;
  category: string | null;
  sources: string[];
  url: string | null;
  priority_score: number | null;
  created_at: string;
  updated_at: string;
}

export const useNewsArticles = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userCountry } = useUserCountry();

  const fetchNewsArticles = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('news_articles' as any)
        .select('*')
        .order('priority_score', { ascending: false })
        .order('created_at', { ascending: false });

      // Filter by user's country if available
      if (userCountry?.code) {
        const countryMapping: Record<string, string> = {
          'EG': 'EGY',
          'SA': 'SAU',
          'AE': 'UAE'
        };
        const countryCode = countryMapping[userCountry.code] || userCountry.code;
        query = query.eq('country', countryCode);
      }

      const { data, error } = await query.limit(20);

      if (error) {
        setError(error.message);
        return;
      }

      setArticles((data as any) || []);
    } catch (err) {
      setError('Failed to fetch news articles');
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  const getArticlesByCategory = (category: string) => {
    return articles.filter(article => 
      article.category?.toLowerCase() === category.toLowerCase()
    );
  };

  const getTopArticles = (limit: number = 10) => {
    return articles
      .sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0))
      .slice(0, limit);
  };

  const searchArticles = (query: string) => {
    const searchTerm = query.toLowerCase();
    return articles.filter(article =>
      article.title.toLowerCase().includes(searchTerm) ||
      article.summary.toLowerCase().includes(searchTerm) ||
      article.keywords?.some(keyword => 
        keyword.toLowerCase().includes(searchTerm)
      )
    );
  };

  const getCategories = () => {
    const categories = articles
      .map(article => article.category)
      .filter((category): category is string => category !== null)
      .filter((category, index, self) => self.indexOf(category) === index);
    
    return categories;
  };

  useEffect(() => {
    fetchNewsArticles();
  }, [userCountry]);

  return {
    articles,
    loading,
    error,
    refetch: fetchNewsArticles,
    getArticlesByCategory,
    getTopArticles,
    searchArticles,
    getCategories,
  };
};