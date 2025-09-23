import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function callGroqAPI(message: string, groqApiKey: string): Promise<string> {
  console.log('Making simple Groq API call...');
  
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful financial assistant. Keep responses short and helpful.'
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Groq API error:', response.status, errorText);
    throw new Error(`Groq API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
}

serve(async (req) => {
  console.log('Request received:', req.method, req.url);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Parsing request body...');
    const { message, userId } = await req.json();
    console.log('Request data:', { message, userId });

    // Get Groq API key
    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    console.log('Groq API key exists:', !!groqApiKey);
    console.log('Groq API key length:', groqApiKey?.length || 0);

    if (!groqApiKey) {
      console.error('Groq API key not found');
      return new Response(JSON.stringify({ 
        error: 'API key not configured',
        response: 'I need the Groq API key configured as "groq anakin" in Supabase Edge Function secrets.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Make simple API call to Groq
    console.log('Calling Groq API...');
    const response = await callGroqAPI(message, groqApiKey);

    return new Response(JSON.stringify({ 
      response: response
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-financial-agent function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to process request',
      response: 'Sorry, I encountered an error. Please try again.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

