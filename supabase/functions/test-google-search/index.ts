import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query = "EFG Hermes Egypt stock analysis" } = await req.json().catch(() => ({}));
    
    console.log('Testing Google Search API with query:', query);
    
    const googleApiKey = Deno.env.get('GOOGLE_SEARCH_API_KEY');
    
    if (!googleApiKey) {
      console.error('Google API key not found');
      return new Response(JSON.stringify({
        success: false,
        error: 'Google API key not configured',
        message: 'GOOGLE_SEARCH_API_KEY environment variable is missing'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Google API key found, attempting search...');

    // Test multiple search engine IDs
    const searchEngineIds = [
      '017576662512468239146:omuauf_lfve', // Primary general search
      'a12ac54d856bf4e8e', // Alternative ID
      'f1e0e1a6f93e14704', // Backup ID
      '015836716817887271234:9amtfxjk_ea', // Additional fallback
      '017576662512468239146:9rmzp9bkf6a' // Final fallback
    ];

    let searchSuccess = false;
    let searchResults: any[] = [];
    let lastError = '';

    for (const searchEngineId of searchEngineIds) {
      if (searchSuccess) break;
      
      try {
        const googleSearchUrl = `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&num=5&safe=active`;
        
        console.log(`Testing search engine ${searchEngineId}...`);
        
        const searchResponse = await fetch(googleSearchUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        });
        
        console.log(`Search response status: ${searchResponse.status}`);
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          console.log('Search data received, items count:', searchData.items?.length || 0);
          
          if (searchData.items && searchData.items.length > 0) {
            searchResults = searchData.items.map((item: any) => ({
              title: item.title,
              snippet: item.snippet,
              link: item.link,
              source: item.displayLink
            }));
            searchSuccess = true;
            console.log(`Search successful with engine ${searchEngineId}`);
            break;
          } else {
            console.log(`No results returned from engine ${searchEngineId}`);
            lastError = 'No search results returned';
          }
        } else {
          const errorText = await searchResponse.text();
          console.log(`Search failed with status ${searchResponse.status}:`, errorText);
          lastError = errorText;
        }
      } catch (engineError) {
        console.log(`Search engine ${searchEngineId} failed:`, engineError);
        lastError = engineError instanceof Error ? engineError.message : String(engineError);
        continue;
      }
    }

    if (searchSuccess && searchResults.length > 0) {
      return new Response(JSON.stringify({
        success: true,
        query: query,
        results_count: searchResults.length,
        results: searchResults,
        message: 'Google Search API is working correctly!',
        test_status: 'PASSED'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        query: query,
        error: 'No search results found',
        last_error: lastError,
        message: 'Google Search API test failed - no results returned from any search engine',
        test_status: 'FAILED'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Test function error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      message: 'Test function encountered an error',
      test_status: 'ERROR'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});