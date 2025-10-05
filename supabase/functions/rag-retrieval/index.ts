import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { 
      query, 
      userId, 
      matchThreshold = 0.7, 
      matchCount = 5,
      sourceTypes = null 
    } = await req.json();

    if (!query) {
      throw new Error('Query is required');
    }

    console.log('Retrieving relevant knowledge for query:', query);

    // Generate query embedding
    const embeddingResponse = await fetch('https://ai.gateway.lovable.dev/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: query,
      }),
    });

    if (!embeddingResponse.ok) {
      const errorText = await embeddingResponse.text();
      console.error('Lovable AI embeddings error:', errorText);
      throw new Error('Failed to generate query embedding');
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    // Search knowledge base using vector similarity
    const { data: results, error: searchError } = await supabase.rpc(
      'match_knowledge_base',
      {
        query_embedding: queryEmbedding,
        match_threshold: matchThreshold,
        match_count: matchCount,
        filter_user_id: userId || null,
      }
    );

    if (searchError) {
      console.error('Search error:', searchError);
      throw searchError;
    }

    // Filter by source types if provided
    let filteredResults = results || [];
    if (sourceTypes && sourceTypes.length > 0) {
      filteredResults = filteredResults.filter(r => 
        sourceTypes.includes(r.source_type)
      );
    }

    console.log(`Retrieved ${filteredResults.length} relevant results`);

    return new Response(JSON.stringify({
      success: true,
      results: filteredResults,
      count: filteredResults.length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in rag-retrieval:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
