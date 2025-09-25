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
    const { query, portfolioData, userProfile } = await req.json();

    const systemPrompt = `You are an expert investment advisor specializing in MENA (Middle East and North Africa) markets. You provide personalized investment analysis and recommendations based on:

1. Current portfolio composition and performance
2. User's financial profile (income, goals, risk tolerance)
3. Current market conditions in Arab markets
4. Regional economic trends and geopolitical factors

Always structure your response with:
- 📊 **Analysis**: Brief analysis of the query
- 💡 **Recommendation**: Specific actionable advice
- ⚠️ **Risk Assessment**: Important considerations
- 📈 **Timeline**: Suggested implementation timeline

Keep responses concise but comprehensive, focusing on practical advice for Arab/MENA markets.`;

    const userPrompt = `
User Query: ${query}

Portfolio Context: ${portfolioData ? JSON.stringify(portfolioData) : 'No specific portfolio data provided'}

User Profile: ${userProfile ? JSON.stringify(userProfile) : 'Limited profile information available'}

Please provide personalized investment analysis and recommendations.`;

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
        temperature: 0.7,
        max_tokens: 1000,
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
    console.error('Error in ai-investment-analysis function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to generate AI analysis',
        details: 'Please check if your OpenAI API key is properly configured.'
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});