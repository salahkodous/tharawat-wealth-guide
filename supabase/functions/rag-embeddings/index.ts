import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { createHash } from "https://deno.land/std@0.168.0/hash/mod.ts";

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

    const { content, metadata = {}, sourceUrl, sourceType, userId } = await req.json();

    if (!content) {
      throw new Error('Content is required');
    }

    console.log('Creating embedding for content:', content.substring(0, 100));

    // Create content hash to avoid duplicates
    const hash = createHash("md5");
    hash.update(content);
    const contentHash = hash.toString("hex");

    // Check if content already exists
    const { data: existing } = await supabase
      .from('knowledge_base')
      .select('id')
      .eq('content_hash', contentHash)
      .eq('user_id', userId || null)
      .single();

    if (existing) {
      console.log('Content already exists in knowledge base');
      return new Response(JSON.stringify({ 
        success: true, 
        id: existing.id,
        message: 'Content already indexed' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate embedding using Lovable AI
    const embeddingResponse = await fetch('https://ai.gateway.lovable.dev/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: content,
      }),
    });

    if (!embeddingResponse.ok) {
      const errorText = await embeddingResponse.text();
      console.error('Lovable AI embeddings error:', errorText);
      throw new Error('Failed to generate embedding');
    }

    const embeddingData = await embeddingResponse.json();
    const embedding = embeddingData.data[0].embedding;

    console.log('Embedding generated, storing in database...');

    // Store in knowledge base
    const { data: stored, error: storeError } = await supabase
      .from('knowledge_base')
      .insert({
        content,
        content_hash: contentHash,
        embedding,
        metadata,
        source_url: sourceUrl,
        source_type: sourceType || 'web',
        user_id: userId || null,
        is_validated: true,
      })
      .select()
      .single();

    if (storeError) {
      console.error('Storage error:', storeError);
      throw storeError;
    }

    console.log('Content indexed successfully');

    return new Response(JSON.stringify({
      success: true,
      id: stored.id,
      message: 'Content indexed successfully',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in rag-embeddings:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
