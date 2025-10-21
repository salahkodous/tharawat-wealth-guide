import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HF_API_KEY = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');

async function analyzePortfolio(query: string, userData: any): Promise<string> {
  try {
    const model = "microsoft/phi-2";
    
    const portfolioData = {
      assets: userData?.assets || [],
      portfolios: userData?.portfolios || [],
      goals: userData?.portfolioGoals || []
    };
    
    const prompt = `You are a portfolio investment advisor. Portfolio data: ${JSON.stringify(portfolioData)}.
Query: ${query}

Provide investment insights and portfolio recommendations.`;

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
      console.error('Portfolio agent API error:', await response.text());
      return 'Portfolio analysis temporarily unavailable.';
    }
    
    const result = await response.json();
    return result[0]?.generated_text || 'Unable to generate portfolio advice.';
  } catch (error) {
    console.error('Portfolio analysis error:', error);
    return 'Portfolio analysis encountered an error.';
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

    console.log('Portfolio agent processing:', query);
    
    const output = await analyzePortfolio(query, userData);
    
    return new Response(JSON.stringify({
      agent: 'portfolio',
      output
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Portfolio agent error:', error);
    return new Response(JSON.stringify({ 
      agent: 'portfolio',
      error: error instanceof Error ? error.message : 'Portfolio agent failed',
      output: 'Portfolio analysis unavailable.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
