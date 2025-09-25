import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function classifyQuery(message: string, groqApiKey: string) {
  console.log('Classifying query:', message.substring(0, 100));
  
  // Quick check for obvious greetings before API call
  const lowerMessage = message.toLowerCase().trim();
  if (lowerMessage.match(/^(hi|hello|hey|good morning|good afternoon|good evening|how are you|what's up|greetings)\.?$/)) {
    console.log('Detected greeting, skipping API classification');
    return {
      type: "greeting",
      context: [],
      priority: "low"
    };
  }
  
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{
        role: 'system',
        content: `Analyze this financial query and return a JSON response with the query type and needed context.

QUERY TYPES:
- greeting: Simple greetings, hellos, casual conversation (hi, hello, how are you, etc.)
- portfolio_analysis: Holdings, performance, diversification questions
- debt_management: Debt strategy, payments, consolidation questions  
- investment_advice: Buying/selling, asset allocation recommendations
- news_analysis: Market news impact on portfolio
- goal_tracking: Financial goals progress and planning
- expense_analysis: Spending patterns, budgeting advice
- income_optimization: Income strategies, tax efficiency
- market_research: Market trends, economic analysis
- risk_assessment: Risk evaluation, insurance planning
- general_financial: General financial advice and education

CONTEXT TYPES: personal_finances, debts, assets, goals, income, expenses, deposits, news

Return ONLY this JSON format:
{
  "type": "query_type",
  "context": ["context1", "context2"],
  "priority": "high|medium|low"
}

IMPORTANT: For simple greetings (hi, hello, how are you), always return:
{
  "type": "greeting", 
  "context": [],
  "priority": "low"
}`
      }, {
        role: 'user', 
        content: message
      }],
      max_tokens: 150,
      temperature: 0.1
    }),
  });

  const data = await response.json();
  try {
    const classification = JSON.parse(data.choices[0]?.message?.content || '{"type":"general_financial","context":["personal_finances"],"priority":"medium"}');
    console.log('Classification result:', classification);
    return classification;
  } catch (e) {
    console.log('Classification parse error, checking if greeting');
    // Simple fallback for greetings
    if (lowerMessage.match(/^(hi|hello|hey|good morning|good afternoon|good evening|how are you|what's up|greetings)\.?$/)) {
      return {
        type: "greeting",
        context: [],
        priority: "low"
      };
    }
    return {
      type: "general_financial",
      context: ["personal_finances"],
      priority: "medium"
    };
  }
}

async function fetchRelevantData(userId: string, contextTypes: string[], supabase: any) {
  console.log('Fetching data for contexts:', contextTypes);
  const dataMap: Record<string, any> = {};
  
  try {
    for (const type of contextTypes) {
      switch (type) {
        case 'personal_finances':
          const pf = await supabase.from('personal_finances').select('*').eq('user_id', userId).single();
          if (pf.data) dataMap[type] = pf.data;
          break;
        case 'debts':
          const debts = await supabase.from('debts').select('*').eq('user_id', userId);
          if (debts.data?.length) dataMap[type] = debts.data;
          break;
        case 'assets':
          const assets = await supabase.from('assets').select('*').eq('user_id', userId);
          if (assets.data?.length) dataMap[type] = assets.data;
          break;
        case 'goals':
          const [portfolioGoals, financialGoals] = await Promise.all([
            supabase.from('portfolio_goals').select('*').eq('user_id', userId),
            supabase.from('financial_goals').select('*').eq('user_id', userId)
          ]);
          if (portfolioGoals.data?.length || financialGoals.data?.length) {
            dataMap[type] = {
              portfolio: portfolioGoals.data || [],
              financial: financialGoals.data || []
            };
          }
          break;
        case 'income':
          const income = await supabase.from('income_streams').select('*').eq('user_id', userId);
          if (income.data?.length) dataMap[type] = income.data;
          break;
        case 'expenses':
          const expenses = await supabase.from('expense_streams').select('*').eq('user_id', userId);
          if (expenses.data?.length) dataMap[type] = expenses.data;
          break;
        case 'deposits':
          const deposits = await supabase.from('deposits').select('*').eq('user_id', userId);
          if (deposits.data?.length) dataMap[type] = deposits.data;
          break;
        case 'news':
          const news = await supabase.from('news_articles').select('*').limit(5);
          if (news.data?.length) dataMap[type] = news.data;
          break;
      }
    }
    
    console.log('Fetched data keys:', Object.keys(dataMap));
    return dataMap;
  } catch (error) {
    console.error('Data fetch error:', error);
    return dataMap;
  }
}

function generateSpecializedPrompt(queryType: string, userData: any): string {
  const prompts = {
    greeting: `You are Anakin, a friendly AI financial advisor. Respond to this greeting warmly and briefly. Keep your response under 50 words. Simply say hello back and ask how you can help with their financial needs today. DO NOT provide any financial analysis or data unless specifically asked.`,
    
    portfolio_analysis: `You are Anakin, a portfolio analysis specialist. Provide detailed insights about holdings, performance, and diversification. Structure your response with:

**📊 PORTFOLIO OVERVIEW**
**🎯 KEY INSIGHTS** 
**⚡ IMMEDIATE ACTIONS**
**🔍 DETAILED ANALYSIS**
**📈 RECOMMENDATIONS**`,

    debt_management: `You are Anakin, a debt management expert. Analyze debt strategy and provide optimization recommendations. Structure your response with:

**💳 DEBT SUMMARY**
**🎯 PRIORITY ACTIONS**
**📊 PAYOFF STRATEGY** 
**💰 SAVINGS OPPORTUNITIES**
**📋 ACTION PLAN**`,

    investment_advice: `You are Anakin, an investment advisor. Provide personalized investment recommendations. Structure your response with:

**🎯 INVESTMENT THESIS**
**📊 MARKET ANALYSIS**
**💼 PORTFOLIO ALLOCATION**
**⚠️ RISK ASSESSMENT**
**🚀 ACTION STEPS**`,

    news_analysis: `You are Anakin, a financial news analyst. Analyze how recent market news impacts the user's portfolio. Structure your response with:

**📰 NEWS IMPACT SUMMARY**
**📊 PORTFOLIO EFFECTS**
**⚡ IMMEDIATE ACTIONS**
**🔮 OUTLOOK**
**📋 MONITORING POINTS**`,

    goal_tracking: `You are Anakin, a goal tracking specialist. Monitor progress and provide guidance. Structure your response with:

**🎯 GOAL STATUS**
**📊 PROGRESS METRICS**
**⚡ ACCELERATION STRATEGIES**
**🔄 ADJUSTMENTS NEEDED**
**📅 MILESTONE TIMELINE**`,

    general_financial: `You are Anakin, a comprehensive financial advisor. Provide professional financial guidance. Structure your response with:

**💡 KEY INSIGHTS**
**📊 FINANCIAL SNAPSHOT**
**🎯 RECOMMENDATIONS**
**⚡ IMMEDIATE ACTIONS**
**📈 LONG-TERM STRATEGY**`
  };

  const prompt = prompts[queryType as keyof typeof prompts] || prompts.general_financial;
  
  // For greetings, don't include any user data
  if (queryType === 'greeting') {
    return prompt;
  }
  
  let contextData = '';
  Object.entries(userData).forEach(([key, value]) => {
    if (value && (Array.isArray(value) ? value.length > 0 : Object.keys(value).length > 0)) {
      contextData += `\n\n${key.toUpperCase()}: ${JSON.stringify(value, null, 2)}`;
    }
  });

  return `${prompt}

USER FINANCIAL DATA:${contextData}

Provide professional, actionable advice with specific references to the user's data. Use concrete numbers and be specific about recommendations.`;
}

async function generateResponse(message: string, queryType: string, userData: any, groqApiKey: string): Promise<string> {
  console.log(`Generating ${queryType} response`);
  
  const systemPrompt = generateSpecializedPrompt(queryType, userData);
  
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: queryType === 'greeting' ? 100 : 1500,
      temperature: queryType === 'greeting' ? 0.5 : (queryType === 'market_research' ? 0.3 : 0.7)
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || 'Unable to generate response.';
}

serve(async (req) => {
  console.log('AI Router Agent - Request received');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId } = await req.json();
    console.log('Processing query for user:', userId, 'Message type check:', message.toLowerCase().trim());

    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!groqApiKey) {
      throw new Error('API configuration missing');
    }

    const supabase = createClient(supabaseUrl!, supabaseKey!);

    // Step 1: Classify the query
    const classification = await classifyQuery(message, groqApiKey);
    console.log('Final classification:', classification);
    
    // Step 2: Fetch relevant data (skip for greetings to save tokens)
    let userData = {};
    if (classification.type !== 'greeting') {
      console.log('Fetching user data for non-greeting query');
      userData = await fetchRelevantData(userId, classification.context, supabase);
    } else {
      console.log('Skipping data fetch for greeting - saving tokens');
    }
    
    // Step 3: Generate specialized response
    const response = await generateResponse(message, classification.type, userData, groqApiKey);

    console.log('Response generated successfully for type:', classification.type);
    return new Response(JSON.stringify({ response }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Router error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      response: 'I encountered an error processing your request. Please try again.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});