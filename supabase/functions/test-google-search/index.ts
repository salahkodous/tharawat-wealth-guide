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

    // For now, let's skip the Google API and just return a test response
    console.log('Returning test response for query:', query);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Function working - Google API test skipped for now',
      query: query,
      test_status: 'BASIC_TEST_PASSED',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

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