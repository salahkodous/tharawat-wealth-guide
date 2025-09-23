import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};


async function getUserFinancialData(userId: string, supabase: any) {
  try {
    console.log('Fetching comprehensive user data for:', userId);
    
    // Fetch all financial data in parallel
    const [
      personalFinances,
      debts,
      assets,
      portfolioGoals,
      financialGoals,
      incomeStreams,
      expenseStreams,
      deposits,
      portfolios,
      newsArticles
    ] = await Promise.all([
      supabase.from('personal_finances').select('*').eq('user_id', userId).single(),
      supabase.from('debts').select('*').eq('user_id', userId),
      supabase.from('assets').select('*').eq('user_id', userId),
      supabase.from('portfolio_goals').select('*').eq('user_id', userId),
      supabase.from('financial_goals').select('*').eq('user_id', userId),
      supabase.from('income_streams').select('*').eq('user_id', userId),
      supabase.from('expense_streams').select('*').eq('user_id', userId),
      supabase.from('deposits').select('*').eq('user_id', userId),
      supabase.from('portfolios').select('*').eq('user_id', userId),
      supabase.from('news_articles').select('*').limit(5)
    ]);

    return {
      personalFinances: personalFinances.data,
      debts: debts.data || [],
      assets: assets.data || [],
      portfolioGoals: portfolioGoals.data || [],
      financialGoals: financialGoals.data || [],
      incomeStreams: incomeStreams.data || [],
      expenseStreams: expenseStreams.data || [],
      deposits: deposits.data || [],
      portfolios: portfolios.data || [],
      newsArticles: newsArticles.data || []
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

async function callGroqAPI(message: string, groqApiKey: string, userData: any): Promise<string> {
  console.log('Making enhanced Groq API call with web search capabilities...');
  
  const systemPrompt = `You are Anakin, an advanced AI financial advisor with access to comprehensive user data and web search capabilities for real-time information.

USER FINANCIAL PROFILE:
Personal Finances: ${JSON.stringify(userData?.personalFinances, null, 2)}
Debts: ${JSON.stringify(userData?.debts, null, 2)}
Assets/Portfolio: ${JSON.stringify(userData?.assets, null, 2)}
Portfolio Goals: ${JSON.stringify(userData?.portfolioGoals, null, 2)}
Financial Goals: ${JSON.stringify(userData?.financialGoals, null, 2)}
Income Streams: ${JSON.stringify(userData?.incomeStreams, null, 2)}
Expense Streams: ${JSON.stringify(userData?.expenseStreams, null, 2)}
Savings/Deposits: ${JSON.stringify(userData?.deposits, null, 2)}
Portfolios: ${JSON.stringify(userData?.portfolios, null, 2)}

RECENT FINANCIAL NEWS:
${userData?.newsArticles?.map((article: any) => `- ${article.title}: ${article.summary}`).join('\n') || 'No recent news available'}

You have complete access to this user's financial situation and can search the web for current market information, news, and financial data. Provide personalized, actionable advice based on their actual data. Be specific about their assets, debts, goals, and financial position. Reference their actual numbers and provide concrete recommendations.

Key capabilities:
- Analyze their complete financial picture
- Search the web for current market data and news when needed
- Provide investment advice based on their portfolio
- Help with debt management strategies
- Track progress toward their goals
- Offer market insights relevant to their assets
- Suggest optimizations for their income/expense streams

Be conversational, insightful, and reference their specific financial data when relevant. Use web search to get current information when discussing market conditions or recent financial news.`;

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
          content: systemPrompt
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 1000,
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

    // Get API keys
    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!groqApiKey) {
      console.error('Groq API key not found');
      return new Response(JSON.stringify({ 
        error: 'API key not configured',
        response: 'I need the Groq API key configured in Supabase Edge Function secrets.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    // Fetch comprehensive user financial data
    let userData = null;
    if (userId) {
      console.log('Fetching user financial data...');
      userData = await getUserFinancialData(userId, supabase);
    }

    // Make enhanced API call with all context
    console.log('Calling enhanced Groq API with full context...');
    const response = await callGroqAPI(message, groqApiKey, userData);

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

