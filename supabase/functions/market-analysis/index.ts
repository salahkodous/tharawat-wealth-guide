import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const hfToken = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN') || Deno.env.get('HUGGINGFACE_API_TOKEN');

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

    const hfModel = Deno.env.get('HF_MODEL') || 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B';
    const prompt = `${systemPrompt}\n\nUser: ${userPrompt}\nAssistant:`;

    const response = await fetch(`https://api-inference.huggingface.co/models/${hfModel}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 800,
          temperature: 0.6,
          return_full_text: false
        },
        options: {
          wait_for_model: true
        }
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${data.error || 'Unknown error'}`);
    }

    let analysis: string;
    if (Array.isArray(data) && data[0]?.generated_text) {
      analysis = data[0].generated_text;
    } else if ((data as any)?.generated_text) {
      analysis = (data as any).generated_text;
    } else {
      analysis = typeof data === 'string' ? data : JSON.stringify(data);
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in market-analysis function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to generate market analysis',
        details: 'Please check if your Hugging Face API token is properly configured.'
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});