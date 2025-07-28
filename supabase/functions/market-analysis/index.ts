import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { region, assetType, currency } = await req.json();

    const systemPrompt = `You are a financial market analyst specializing in MENA markets. Provide current market analysis and insights for the specified region and asset type. Focus on:

1. Current market trends and performance
2. Economic indicators and their impact
3. Regional factors affecting investments
4. Short and medium-term outlook
5. Key opportunities and risks

Keep the analysis professional, data-driven, and actionable.`;

    const userPrompt = `Provide a comprehensive market analysis for:
- Region: ${region || 'MENA/Arab markets'}
- Asset Type: ${assetType || 'General market overview'}
- Currency Context: ${currency || 'USD'}

Include current market conditions, key trends, and investment outlook.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.6,
        max_tokens: 800,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    const analysis = data.choices[0].message.content;

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in market-analysis function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to generate market analysis',
        details: 'Please check if your OpenAI API key is properly configured.'
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});