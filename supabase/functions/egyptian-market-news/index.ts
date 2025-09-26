import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('=== Egyptian Market News Function ===');
  console.log('Method:', req.method);
  
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      console.log('Handling OPTIONS request');
      return new Response(null, { 
        status: 200,
        headers: corsHeaders 
      });
    }

    const { query = "Egyptian stock market news EGX" } = await req.json().catch(() => ({}));
    
    console.log('Searching for:', query);
    
    // Get API credentials
    const googleApiKey = Deno.env.get('GOOGLE_SEARCH_API_KEY');
    const searchEngineId = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID');
    
    if (!googleApiKey || !searchEngineId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Google Search API not configured',
        news: []
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Search for recent Egyptian stock market news
    const searchQueries = [
      `${query} site:mubasher.info OR site:egx.com.eg OR site:alborsanews.com`,
      `Egyptian Exchange EGX latest news`,
      `Egypt stock market today news`
    ];

    const allNews = [];

    for (const searchQuery of searchQueries) {
      try {
        const encodedQuery = encodeURIComponent(searchQuery);
        const googleSearchUrl = `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${searchEngineId}&q=${encodedQuery}&num=5&safe=active&sort=date`;
        
        console.log('Fetching news for:', searchQuery);
        
        const searchResponse = await fetch(googleSearchUrl);
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          
          if (searchData.items && searchData.items.length > 0) {
            const newsItems = searchData.items.map((item: any) => ({
              title: item.title?.substring(0, 150) || 'No title',
              snippet: item.snippet?.substring(0, 300) || 'No description',
              link: item.link || '#',
              source: item.displayLink || 'Unknown',
              published: item.pagemap?.metatags?.[0]?.['article:published_time'] || 
                        item.pagemap?.metatags?.[0]?.['pubdate'] || 
                        'Recent',
              query: searchQuery
            }));
            
            allNews.push(...newsItems);
          }
        }
      } catch (searchError) {
        console.error('Search query failed:', searchQuery, searchError);
      }
    }

    // Remove duplicates and limit to 10 most relevant articles
    const uniqueNews = allNews.filter((item, index, self) => 
      index === self.findIndex(t => t.link === item.link)
    ).slice(0, 10);

    console.log('Found news articles:', uniqueNews.length);

    return new Response(JSON.stringify({
      success: true,
      news: uniqueNews,
      total: uniqueNews.length,
      message: uniqueNews.length > 0 ? 'Latest Egyptian stock market news retrieved successfully' : 'No recent news found',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('=== Function Error ===');
    console.error('Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      news: []
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});