import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, userId, sourceType } = await req.json();
    console.log('RAG Retrieval request:', { query, userId, sourceType });

    if (!query) {
      throw new Error('Query is required');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Step 1: Generate embedding for the query using OpenRouter
    console.log('Generating query embedding...');
    const embeddingResponse = await fetch('https://openrouter.ai/api/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': supabaseUrl,
      },
      body: JSON.stringify({
        model: 'openai/text-embedding-3-small',
        input: query,
      }),
    });

    if (!embeddingResponse.ok) {
      const errorText = await embeddingResponse.text();
      console.error('Embedding API error:', errorText);
      
      // Handle specific error codes
      if (embeddingResponse.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      } else if (embeddingResponse.status === 402) {
        throw new Error('AI service payment required. Please contact support.');
      }
      
      throw new Error('Failed to generate query embedding');
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;
    console.log('Query embedding generated successfully');

    // Step 2: Retrieve similar documents from knowledge base
    console.log('Retrieving similar documents...');
    const { data: matches, error: matchError } = await supabase.rpc('match_knowledge_base', {
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: 5,
      filter_user_id: userId || null,
    });

    if (matchError) {
      console.error('Match error:', matchError);
      throw new Error('Failed to retrieve similar documents');
    }

    console.log(`Retrieved ${matches?.length || 0} matching documents`);

    // Step 3: Filter by source type if specified
    let filteredMatches = matches || [];
    if (sourceType) {
      filteredMatches = filteredMatches.filter((m: any) => m.source_type === sourceType);
      console.log(`Filtered to ${filteredMatches.length} documents of type ${sourceType}`);
    }

    // Step 4: Format results with source citations
    const results = filteredMatches.map((match: any) => ({
      content: match.content,
      metadata: match.metadata,
      sourceUrl: match.source_url,
      sourceType: match.source_type,
      similarity: match.similarity,
    }));

    return new Response(JSON.stringify({
      success: true,
      query,
      results,
      totalMatches: results.length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in RAG retrieval:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      success: false,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
