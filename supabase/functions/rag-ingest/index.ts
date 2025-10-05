import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, metadata, sourceUrl, sourceType, userId, validate = true } = await req.json();
    console.log('RAG Ingest request:', { sourceType, userId, contentLength: content?.length });

    if (!content || !sourceType) {
      throw new Error('Content and sourceType are required');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Step 1: Generate content hash to avoid duplicates
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const contentHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    console.log('Content hash generated:', contentHash);

    // Step 2: Check if content already exists
    const { data: existing } = await supabase
      .from('knowledge_base')
      .select('id')
      .eq('content_hash', contentHash)
      .single();

    if (existing) {
      console.log('Content already exists, skipping ingestion');
      return new Response(JSON.stringify({
        success: true,
        message: 'Content already exists in knowledge base',
        id: existing.id,
        skipped: true,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Step 3: Validate content if requested
    let isValidated = false;
    let relevanceScore = 0;

    if (validate) {
      console.log('Validating content with AI...');
      const validationResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{
            role: 'system',
            content: 'You are a content validator. Rate the quality and relevance of the following content on a scale of 0-100. Return only a JSON object with {score: number, isValid: boolean, reason: string}.',
          }, {
            role: 'user',
            content: `Validate this ${sourceType} content:\n\n${content.substring(0, 2000)}`,
          }],
          max_tokens: 200,
        }),
      });

      if (validationResponse.ok) {
        const validationData = await validationResponse.json();
        const validation = JSON.parse(validationData.choices[0].message.content);
        isValidated = validation.isValid;
        relevanceScore = validation.score / 100;
        console.log('Validation result:', { isValidated, relevanceScore });
      }
    }

    // Step 4: Generate embedding for the content
    console.log('Generating content embedding...');
    const embeddingResponse = await fetch('https://ai.gateway.lovable.dev/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: content.substring(0, 8000), // Limit to avoid token limits
      }),
    });

    if (!embeddingResponse.ok) {
      const error = await embeddingResponse.text();
      console.error('Embedding API error:', error);
      throw new Error('Failed to generate content embedding');
    }

    const embeddingData = await embeddingResponse.json();
    const embedding = embeddingData.data[0].embedding;
    console.log('Embedding generated successfully');

    // Step 5: Store in knowledge base
    const { data: inserted, error: insertError } = await supabase
      .from('knowledge_base')
      .insert({
        user_id: userId || null,
        content,
        content_hash: contentHash,
        embedding,
        metadata: metadata || {},
        source_url: sourceUrl,
        source_type: sourceType,
        relevance_score: relevanceScore,
        is_validated: isValidated,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      throw new Error('Failed to store in knowledge base');
    }

    console.log('Content stored successfully:', inserted.id);

    return new Response(JSON.stringify({
      success: true,
      id: inserted.id,
      contentHash,
      isValidated,
      relevanceScore,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in RAG ingestion:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      success: false,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
