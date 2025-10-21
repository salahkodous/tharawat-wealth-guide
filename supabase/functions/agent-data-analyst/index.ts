import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HF_API_KEY = "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";

async function analyzeData(query: string, userData: any): Promise<string> {
  try {
    const model = "google/flan-t5-small";
    
    const financialMetrics = {
      income: userData?.incomeStreams || [],
      expenses: userData?.expenseStreams || [],
      debts: userData?.debts || []
    };
    
    const prompt = `Analyze these financial patterns and trends: ${JSON.stringify(financialMetrics)}. Question: ${query}`;

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
            max_length: 150
          }
        }),
      }
    );
    
    if (!response.ok) {
      console.error('Data analyst API error:', await response.text());
      return 'Data analysis temporarily unavailable.';
    }
    
    const result = await response.json();
    return result[0]?.generated_text || 'Unable to analyze data patterns.';
  } catch (error) {
    console.error('Data analysis error:', error);
    return 'Data analysis encountered an error.';
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

    console.log('Data analyst processing:', query);
    
    const output = await analyzeData(query, userData);
    
    return new Response(JSON.stringify({
      agent: 'data_analyst',
      output
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Data analyst error:', error);
    return new Response(JSON.stringify({ 
      agent: 'data_analyst',
      error: error instanceof Error ? error.message : 'Data analyst failed',
      output: 'Data analysis unavailable.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
