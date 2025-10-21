import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HF_API_KEY = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');

async function detectScam(query: string): Promise<string> {
  try {
    // Use a simple classification approach with phi-2
    const model = "microsoft/phi-2";
    
    const prompt = `Analyze this message for fraud or scam indicators: "${query}"
    
Is this suspicious? Explain briefly:`;

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
            max_new_tokens: 100,
            temperature: 0.3,
            return_full_text: false
          }
        }),
      }
    );
    
    if (!response.ok) {
      console.error('Scam detection API error:', await response.text());
      return 'Scam detection temporarily unavailable.';
    }
    
    const result = await response.json();
    return result[0]?.generated_text || 'Unable to analyze for scam indicators.';
  } catch (error) {
    console.error('Scam detection error:', error);
    return 'Scam detection encountered an error.';
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    if (!query) {
      throw new Error('Query is required');
    }

    console.log('Scam agent processing:', query);
    
    const output = await detectScam(query);
    
    return new Response(JSON.stringify({
      agent: 'scam',
      output
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Scam agent error:', error);
    return new Response(JSON.stringify({ 
      agent: 'scam',
      error: error instanceof Error ? error.message : 'Scam agent failed',
      output: 'Scam detection unavailable.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
