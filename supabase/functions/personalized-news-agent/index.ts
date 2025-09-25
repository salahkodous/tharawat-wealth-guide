import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting personalized news analysis...');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { articleId, userId } = await req.json();

    if (!articleId || !userId) {
      throw new Error('Article ID and User ID are required');
    }

    console.log(`Analyzing article ${articleId} for user ${userId}`);

    // Get the news article
    const { data: article, error: articleError } = await supabase
      .from('news_articles')
      .select('*')
      .eq('id', articleId)
      .single();

    if (articleError || !article) {
      throw new Error('Article not found');
    }

    // Get user's personal data
    const [
      { data: portfolios },
      { data: assets },
      { data: goals },
      { data: finances },
      { data: incomeStreams },
      { data: expenseStreams },
      { data: deposits }
    ] = await Promise.all([
      supabase.from('portfolios').select('*').eq('user_id', userId),
      supabase.from('assets').select('*').eq('user_id', userId),
      supabase.from('financial_goals').select('*').eq('user_id', userId),
      supabase.from('personal_finances').select('*').eq('user_id', userId),
      supabase.from('income_streams').select('*').eq('user_id', userId),
      supabase.from('expense_streams').select('*').eq('user_id', userId),
      supabase.from('deposits').select('*').eq('user_id', userId)
    ]);

    // Create user profile summary
    const userProfile = {
      portfolios: portfolios || [],
      assets: assets || [],
      goals: goals || [],
      finances: finances?.[0] || {},
      incomeStreams: incomeStreams || [],
      expenseStreams: expenseStreams || [],
      deposits: deposits || []
    };

    // Calculate portfolio summary
    const totalPortfolioValue = userProfile.assets.reduce((sum, asset) => {
      return sum + (asset.current_price * asset.quantity || 0);
    }, 0);

    const assetsByType = userProfile.assets.reduce((acc, asset) => {
      acc[asset.asset_type] = (acc[asset.asset_type] || 0) + (asset.current_price * asset.quantity || 0);
      return acc;
    }, {} as Record<string, number>);

    const totalGoalsAmount = userProfile.goals.reduce((sum, goal) => sum + goal.target_amount, 0);
    const totalCurrentGoals = userProfile.goals.reduce((sum, goal) => sum + goal.current_amount, 0);

    // Prepare the prompt for AI analysis
    const analysisPrompt = `
    You are a personal financial advisor AI. Analyze this news article and explain how it specifically affects this user based on their personal financial situation.

    NEWS ARTICLE:
    Title: ${article.title}
    Summary: ${article.summary}
    Category: ${article.category}
    Country: ${article.country}
    Sentiment: ${article.sentiment}
    Keywords: ${article.keywords?.join(', ') || 'None'}

    USER'S FINANCIAL PROFILE:
    - Total Portfolio Value: $${totalPortfolioValue.toFixed(2)}
    - Asset Allocation: ${JSON.stringify(assetsByType)}
    - Monthly Income: $${userProfile.finances.monthly_income || 0}
    - Monthly Expenses: $${userProfile.finances.monthly_expenses || 0}
    - Monthly Investing: $${userProfile.finances.monthly_investing_amount || 0}
    - Financial Goals: ${userProfile.goals.length} goals totaling $${totalGoalsAmount.toFixed(2)} (current: $${totalCurrentGoals.toFixed(2)})
    - Deposits: ${userProfile.deposits.length} deposits
    - Number of Assets: ${userProfile.assets.length}

    DETAILED ASSETS:
    ${userProfile.assets.map(asset => 
      `- ${asset.asset_name} (${asset.asset_type}): ${asset.quantity} shares at $${asset.current_price} each = $${(asset.current_price * asset.quantity || 0).toFixed(2)}`
    ).join('\n')}

    FINANCIAL GOALS:
    ${userProfile.goals.map(goal => 
      `- ${goal.title}: $${goal.current_amount}/$${goal.target_amount} (${((goal.current_amount / goal.target_amount) * 100).toFixed(1)}% complete)`
    ).join('\n')}

    Please provide a personalized analysis in the following format:

    ## Personal Impact Analysis

    ### Direct Impact on Your Portfolio
    [Explain how this news directly affects their specific assets and investments]

    ### Impact on Your Financial Goals
    [Explain how this affects their ability to reach their financial goals]

    ### Recommended Actions
    [Provide 2-3 specific, actionable recommendations]

    ### Opportunity Assessment
    [Rate the opportunity/risk level: LOW/MEDIUM/HIGH and explain why]

    Keep the analysis concise but insightful, focusing on actionable insights specific to this user's situation.
    `;

    console.log('Sending request to OpenRouter AI...');

    // Call OpenRouter API for analysis
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': supabaseUrl,
        'X-Title': 'Anakin Financial News Agent'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'system',
            content: 'You are a professional financial advisor AI that provides personalized investment insights based on news and user portfolios. Be specific, actionable, and concise.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      console.error('OpenRouter API error:', await response.text());
      throw new Error('Failed to get AI analysis');
    }

    const aiResponse = await response.json();
    const personalizedAnalysis = aiResponse.choices[0]?.message?.content;

    if (!personalizedAnalysis) {
      throw new Error('No analysis received from AI');
    }

    console.log('Analysis completed successfully');

    return new Response(JSON.stringify({
      success: true,
      article: {
        id: article.id,
        title: article.title,
        summary: article.summary,
        category: article.category,
        sentiment: article.sentiment,
        country: article.country
      },
      personalizedAnalysis,
      userPortfolioSummary: {
        totalValue: totalPortfolioValue,
        assetAllocation: assetsByType,
        goalsProgress: {
          total: totalGoalsAmount,
          current: totalCurrentGoals,
          percentage: totalGoalsAmount > 0 ? (totalCurrentGoals / totalGoalsAmount) * 100 : 0
        }
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in personalized-news-agent function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});