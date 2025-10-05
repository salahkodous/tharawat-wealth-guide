import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const GOOGLE_SEARCH_API_KEY = Deno.env.get('GOOGLE_SEARCH_API_KEY');
const GOOGLE_SEARCH_ENGINE_ID = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId, chatId } = await req.json();
    console.log('RAG Agent request:', { message, userId });

    if (!message) {
      throw new Error('Message is required');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Step 1: Retrieve relevant context from knowledge base
    console.log('Retrieving relevant context...');
    const retrievalResponse = await fetch(`${supabaseUrl}/functions/v1/rag-retriever`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: message,
        userId,
      }),
    });

    let knowledgeContext = [];
    let sources = [];

    if (retrievalResponse.ok) {
      const retrievalData = await retrievalResponse.json();
      knowledgeContext = retrievalData.results || [];
      console.log(`Retrieved ${knowledgeContext.length} knowledge documents`);
      
      // Extract sources for citation
      sources = knowledgeContext.map((doc: any) => ({
        title: doc.metadata?.title || 'Source',
        url: doc.sourceUrl,
        type: doc.sourceType,
      })).filter((s: any) => s.url);
    }

    // Step 2: Check if we need to fetch fresh data from web
    const needsWebSearch = knowledgeContext.length === 0 || 
                           message.toLowerCase().includes('latest') ||
                           message.toLowerCase().includes('current') ||
                           message.toLowerCase().includes('today');

    if (needsWebSearch && GOOGLE_SEARCH_API_KEY && GOOGLE_SEARCH_ENGINE_ID) {
      console.log('Fetching fresh data from web...');
      const searchQuery = encodeURIComponent(`${message} financial market news`);
      const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_SEARCH_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&q=${searchQuery}&num=3`;
      
      const searchResponse = await fetch(searchUrl);
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        
        // Ingest search results into knowledge base
        for (const item of searchData.items || []) {
          const content = `${item.title}\n\n${item.snippet}`;
          
          // Store in knowledge base (fire and forget)
          fetch(`${supabaseUrl}/functions/v1/rag-ingest`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseAnonKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              content,
              metadata: { title: item.title },
              sourceUrl: item.link,
              sourceType: 'web',
              userId: null, // Global knowledge
              validate: false,
            }),
          }).catch(e => console.error('Failed to ingest:', e));

          // Add to sources
          sources.push({
            title: item.title,
            url: item.link,
            type: 'web',
          });
          
          knowledgeContext.push({
            content,
            metadata: { title: item.title },
            sourceUrl: item.link,
          });
        }
      }
    }

    // Step 3: Build context for LLM
    const contextText = knowledgeContext
      .map((doc: any, idx: number) => `[${idx + 1}] ${doc.content}`)
      .join('\n\n');

    // Step 4: Generate response with LLM using retrieved context
    console.log('Generating response with AI...');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{
          role: 'system',
          content: `You are a financial advisor AI. Use the provided context to answer questions accurately. Always cite your sources using [SOURCE:Title|URL] format at the end of each relevant statement.

Context from knowledge base:
${contextText}

Guidelines:
- Base your answer primarily on the provided context
- If context doesn't fully answer the question, acknowledge the limitation
- Add source citations in format: [SOURCE:Title|URL]
- Be clear, concise, and accurate
- If making recommendations, explain the reasoning`,
        }, {
          role: 'user',
          content: message,
        }],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const error = await aiResponse.text();
      console.error('AI API error:', error);
      throw new Error('Failed to generate AI response');
    }

    const aiData = await aiResponse.json();
    let response = aiData.choices[0].message.content;

    // Step 5: Add source citations if not already present
    if (sources.length > 0 && !response.includes('[SOURCE:')) {
      const uniqueSources = sources.filter((s: any, idx: number, self: any[]) => 
        self.findIndex((x: any) => x.url === s.url) === idx
      );
      
      for (const source of uniqueSources) {
        if (!response.includes(source.url)) {
          response += ` [SOURCE:${source.title}|${source.url}]`;
        }
      }
    }

    // Step 6: Store the conversation
    if (chatId) {
      await supabase.from('chat_messages').insert([
        { chat_id: chatId, user_id: userId, role: 'user', content: message },
        { chat_id: chatId, user_id: userId, role: 'assistant', content: response },
      ]);
    }

    console.log('Response generated successfully');

    return new Response(JSON.stringify({
      success: true,
      response,
      sourcesUsed: sources.length,
      contextRetrieved: knowledgeContext.length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in RAG agent:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      success: false,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
