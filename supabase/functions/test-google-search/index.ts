import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('=== Function called ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      console.log('Handling OPTIONS request');
      return new Response(null, { 
        status: 200,
        headers: corsHeaders 
      });
    }

    console.log('Processing main request...');
    
    // Try to parse request body safely
    let requestData = {};
    try {
      const body = await req.text();
      console.log('Raw request body:', body);
      if (body) {
        requestData = JSON.parse(body);
        console.log('Parsed request data:', requestData);
      }
    } catch (parseError) {
      console.log('Body parse error (this is OK):', parseError);
    }

    const { healthCheck = false, query = "test query" } = requestData as any;

    // Health check - just return success
    if (healthCheck) {
      console.log('Health check requested - returning OK');
      return new Response(JSON.stringify({
        success: true,
        message: 'Function is healthy',
        timestamp: new Date().toISOString(),
        test_status: 'HEALTH_OK'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // For Google API test, let's go step by step with extensive logging
    console.log('=== FULL API TEST MODE ===');
    console.log('Testing Google API integration...');
    
    try {
      // Step 1: Check if API key exists
      console.log('Step 1: Checking API key...');
      const googleApiKey = Deno.env.get('GOOGLE_SEARCH_API_KEY');
      console.log('Google API Key present:', !!googleApiKey);
      console.log('API Key length:', googleApiKey ? googleApiKey.length : 0);
      
      if (!googleApiKey) {
        console.log('API key missing - returning error response');
        return new Response(JSON.stringify({
          success: false,
          error: 'Google API key not configured',
          test_status: 'API_KEY_MISSING',
          message: 'GOOGLE_SEARCH_API_KEY environment variable is missing'
        }), {
          status: 200, // Change to 200 to avoid FunctionsHttpError
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      console.log('Step 2: Preparing search URL...');
      // Step 2: Get custom search engine ID from environment
      const searchEngineId = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID');
      console.log('Search Engine ID present:', !!searchEngineId);
      
      if (!searchEngineId) {
        console.log('Search Engine ID missing - returning error response');
        return new Response(JSON.stringify({
          success: false,
          error: 'Google Search Engine ID not configured',
          test_status: 'SEARCH_ENGINE_ID_MISSING',
          message: 'GOOGLE_SEARCH_ENGINE_ID environment variable is missing'
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const encodedQuery = encodeURIComponent(query);
      console.log('Encoded query:', encodedQuery);
      console.log('Using Search Engine ID:', searchEngineId);
      
      const googleSearchUrl = `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${searchEngineId}&q=${encodedQuery}&num=3&safe=active`;
      console.log('Search URL prepared (length):', googleSearchUrl.length);
      
      console.log('Step 3: Making fetch request...');
      const searchResponse = await fetch(googleSearchUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      console.log('Step 4: Processing response...');
      console.log('Google API response status:', searchResponse.status);
      console.log('Response headers:', Object.fromEntries(searchResponse.headers.entries()));
      
      if (!searchResponse.ok) {
        console.log('Response not OK, reading error text...');
        const errorText = await searchResponse.text();
        console.log('Google API error response:', errorText);
        
        return new Response(JSON.stringify({
          success: false,
          error: `Google API returned status ${searchResponse.status}`,
          api_error: errorText,
          test_status: 'GOOGLE_API_ERROR',
          query: query,
          status_code: searchResponse.status
        }), {
          status: 200, // Return 200 to avoid FunctionsHttpError
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      console.log('Step 5: Parsing JSON response...');
      const searchData = await searchResponse.json();
      console.log('Search data keys:', Object.keys(searchData));
      console.log('Items count:', searchData.items?.length || 0);
      
      if (searchData.items && searchData.items.length > 0) {
        console.log('Success! Processing results...');
        const results = searchData.items.slice(0, 3).map((item: any) => ({
          title: item.title?.substring(0, 100) || 'No title',
          snippet: item.snippet?.substring(0, 200) || 'No snippet',
          link: item.link || '#',
          source: item.displayLink || 'Unknown'
        }));
        
        return new Response(JSON.stringify({
          success: true,
          query: query,
          results_count: results.length,
          results: results,
          message: 'Google Search API working perfectly!',
          test_status: 'GOOGLE_API_SUCCESS'
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        console.log('No results found');
        return new Response(JSON.stringify({
          success: false,
          error: 'No search results returned',
          test_status: 'NO_RESULTS',
          query: query,
          raw_keys: Object.keys(searchData)
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
    } catch (apiError) {
      console.error('=== API ERROR CAUGHT ===');
      const errorName = apiError instanceof Error ? apiError.name : 'UnknownAPIError';
      const errorMessage = apiError instanceof Error ? apiError.message : String(apiError);
      const errorStack = apiError instanceof Error ? apiError.stack : undefined;
      
      console.error('API Error name:', errorName);
      console.error('API Error message:', errorMessage);
      console.error('API Error stack:', errorStack);
      
      return new Response(JSON.stringify({
        success: false,
        error: errorMessage,
        error_name: errorName,
        error_stack: errorStack?.substring(0, 500),
        test_status: 'API_EXCEPTION',
        query: query
      }), {
        status: 200, // Return 200 to avoid FunctionsHttpError
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('=== Function Error ===');
    console.error('Error:', error);
    
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('Error name:', errorName);
    console.error('Error message:', errorMessage);
    console.error('Error stack:', errorStack);
    
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
      error_name: errorName,
      test_status: 'ERROR',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});