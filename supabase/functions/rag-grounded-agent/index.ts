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
      message, 
      userId, 
      chatId,
      webSearch = false,
      searchUrls = []
    } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    console.log('RAG Agent processing:', message);

    // Step 1: Retrieve relevant context from vector DB
    const retrievalResponse = await supabase.functions.invoke('rag-retrieval', {
      body: {
        query: message,
        userId: userId,
        matchCount: 10,
        matchThreshold: 0.7,
      }
    });

    let context = '';
    const sources: Array<{ title: string; url: string }> = [];

    if (retrievalResponse.data?.results?.length > 0) {
      console.log(`Retrieved ${retrievalResponse.data.results.length} relevant documents`);
      
      context = retrievalResponse.data.results
        .map((r: any, i: number) => {
          if (r.source_url) {
            sources.push({
              title: r.metadata?.title || `Source ${i + 1}`,
              url: r.source_url
            });
          }
          return `[Document ${i + 1}]\n${r.content}\n`;
        })
        .join('\n\n');
    }

    // Step 2: Web scraping if requested
    if (webSearch && searchUrls.length > 0) {
      console.log('Scraping URLs:', searchUrls);
      
      const scraperResponse = await supabase.functions.invoke('rag-scraper', {
        body: { urls: searchUrls }
      });

      if (scraperResponse.data?.data) {
        for (const scraped of scraperResponse.data.data) {
          if (scraped.success && scraped.content) {
            // Store scraped content
            await supabase.functions.invoke('rag-embeddings', {
              body: {
                content: scraped.content,
                sourceUrl: scraped.url,
                sourceType: 'web',
                userId: userId,
                metadata: scraped.metadata,
              }
            });

            context += `\n\n[Web Source]\nURL: ${scraped.url}\n${scraped.content}\n`;
            
            sources.push({
              title: scraped.metadata?.title || scraped.url,
              url: scraped.url
            });
          }
        }
      }
    }

    // Step 3: Generate grounded response with Lovable AI
    const systemPrompt = `You are a helpful AI assistant that provides accurate, grounded answers based on retrieved knowledge.

CRITICAL INSTRUCTIONS:
1. Base your answers ONLY on the provided context documents
2. If the context doesn't contain enough information, say so clearly
3. Cite sources using the format: [SOURCE:Title|URL]
4. Do not make up information or use knowledge not in the context
5. Be concise and factual

Context Documents:
${context || 'No relevant context found.'}`;

    console.log('Generating grounded response...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', errorText);
      throw new Error('Failed to generate response');
    }

    const aiData = await aiResponse.json();
    let response = aiData.choices[0]?.message?.content || 'No response generated';

    // Step 4: Save to chat history
    if (chatId && userId) {
      await supabase.from('chat_messages').insert([
        {
          chat_id: chatId,
          user_id: userId,
          role: 'user',
          content: message,
        },
        {
          chat_id: chatId,
          user_id: userId,
          role: 'assistant',
          content: response,
          metadata: { sources, contextUsed: context.length > 0 }
        }
      ]);
    }

    console.log('RAG Agent response generated successfully');

    return new Response(JSON.stringify({
      success: true,
      response,
      sources,
      contextUsed: context.length > 0,
      documentsRetrieved: retrievalResponse.data?.results?.length || 0,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in rag-grounded-agent:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
