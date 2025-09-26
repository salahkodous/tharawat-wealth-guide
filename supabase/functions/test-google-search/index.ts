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

    // For now, let's test the Google API step by step
    console.log('Testing Google API integration...');
    
    // Step 1: Check if API key exists
    const googleApiKey = Deno.env.get('GOOGLE_SEARCH_API_KEY');
    console.log('Google API Key present:', !!googleApiKey);
    
    if (!googleApiKey) {
      console.log('Google API key missing');
      return new Response(JSON.stringify({
        success: false,
        error: 'Google API key not configured',
        test_status: 'API_KEY_MISSING',
        message: 'GOOGLE_SEARCH_API_KEY environment variable is missing'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Step 2: Test a single search engine ID
    const searchEngineId = '017576662512468239146:omuauf_lfve';
    const googleSearchUrl = `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&num=3&safe=active`;
    
    console.log('Attempting Google search...');
    console.log('Search URL (without key):', googleSearchUrl.replace(googleApiKey, '[HIDDEN]'));
    
    try {
      const searchResponse = await fetch(googleSearchUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      console.log('Google API response status:', searchResponse.status);
      
      if (!searchResponse.ok) {
        const errorText = await searchResponse.text();
        console.log('Google API error response:', errorText);
        
        return new Response(JSON.stringify({
          success: false,
          error: `Google API returned status ${searchResponse.status}`,
          api_error: errorText,
          test_status: 'GOOGLE_API_ERROR',
          query: query
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const searchData = await searchResponse.json();
      console.log('Search data received, items count:', searchData.items?.length || 0);
      
      if (searchData.items && searchData.items.length > 0) {
        const results = searchData.items.map((item: any) => ({
          title: item.title,
          snippet: item.snippet,
          link: item.link,
          source: item.displayLink
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
        return new Response(JSON.stringify({
          success: false,
          error: 'No search results returned',
          raw_response: searchData,
          test_status: 'NO_RESULTS',
          query: query
        }), {
          status: 200, // Not an error, just no results
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
    } catch (fetchError) {
      const errorName = fetchError instanceof Error ? fetchError.name : 'UnknownFetchError';
      const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
      
      console.error('Fetch error:', errorMessage);
      
      return new Response(JSON.stringify({
        success: false,
        error: errorMessage,
        error_name: errorName,
        test_status: 'FETCH_ERROR',
        query: query
      }), {
        status: 500,
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