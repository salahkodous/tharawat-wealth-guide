import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    const { urls, maxPages = 10 } = await req.json();

    if (!urls || urls.length === 0) {
      throw new Error('URLs are required');
    }

    console.log('Scraping URLs:', urls);

    const scrapedData: any[] = [];

    for (const url of urls) {
      try {
        if (firecrawlApiKey) {
          // Use Firecrawl if available
          const response = await fetch('https://api.firecrawl.dev/v0/scrape', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${firecrawlApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url,
              formats: ['markdown', 'html'],
            }),
          });

          if (response.ok) {
            const data = await response.json();
            scrapedData.push({
              url,
              content: data.markdown || data.html || '',
              title: data.metadata?.title || '',
              metadata: data.metadata || {},
              success: true,
            });
          } else {
            console.error(`Failed to scrape ${url} with Firecrawl`);
            scrapedData.push({ url, success: false, error: 'Scraping failed' });
          }
        } else {
          // Fallback to simple fetch
          const response = await fetch(url);
          if (response.ok) {
            const html = await response.text();
            // Extract text content (simple version)
            const textContent = html
              .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
              .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
              .replace(/<[^>]+>/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();

            scrapedData.push({
              url,
              content: textContent.substring(0, 10000), // Limit content size
              title: url,
              metadata: {},
              success: true,
            });
          } else {
            scrapedData.push({ url, success: false, error: 'Failed to fetch' });
          }
        }
      } catch (error) {
        console.error(`Error scraping ${url}:`, error);
        scrapedData.push({ 
          url, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    console.log(`Scraped ${scrapedData.filter(d => d.success).length}/${urls.length} URLs`);

    return new Response(JSON.stringify({
      success: true,
      data: scrapedData,
      total: urls.length,
      successful: scrapedData.filter(d => d.success).length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in rag-scraper:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
