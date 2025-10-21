import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HF_API_KEY = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');

async function analyzeFinance(query: string, userData: any): Promise<string> {
  try {
    // Use a financial analysis model
    const model = "microsoft/phi-2"; // Good for reasoning
    
    const prompt = `You are a financial advisor. User data: ${JSON.stringify(userData?.personalFinances || {})}. 
Query: ${query}

Provide concise financial advice based on the user's situation.`;

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          inputs: prompt,
          parameters: {
            max_new_tokens: 200,
            temperature: 0.7,
            return_full_text: false
          }
        }),
      }
    );
    
    if (!response.ok) {
      console.error('Finance agent API error:', await response.text());
      return 'Financial analysis temporarily unavailable.';
    }
    
    const result = await response.json();
    return result[0]?.generated_text || 'Unable to generate financial advice.';
  } catch (error) {
    console.error('Finance analysis error:', error);
    return 'Financial analysis encountered an error.';
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, userData } = await req.json();
    
    if (!query) {
      throw new Error('Query is required');
    }

    console.log('Finance agent processing:', query);
    
    const output = await analyzeFinance(query, userData);
    
    return new Response(JSON.stringify({
      agent: 'finance',
      output
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Finance agent error:', error);
    return new Response(JSON.stringify({ 
      agent: 'finance',
      error: error instanceof Error ? error.message : 'Finance agent failed',
      output: 'Financial analysis unavailable.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
