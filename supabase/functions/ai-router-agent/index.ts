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
      priority: "low",
      responseType: "brief",
      toolsNeeded: []
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
        content: `Analyze this financial query and return a JSON response with query type, needed context, response type, and tools.

QUERY TYPES:
- greeting: Simple greetings, hellos, casual conversation
- quick_value: Asking for specific numbers (income, net worth, balance, etc.)
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

RESPONSE TYPES:
- brief: Short greeting or simple answer (50-100 tokens)
- value: Just return a number/value with minimal context (20-50 tokens)  
- medium: Focused analysis with key points (300-500 tokens)
- detailed: Comprehensive analysis with full insights (800-1500 tokens)

TOOLS NEEDED:
- web_search: For market research, investment opportunities, economic trends
- portfolio_analysis: For detailed portfolio insights and recommendations
- goal_planning: For long-term financial planning and projections
- risk_analysis: For risk assessment and insurance planning

Return ONLY this JSON format:
{
  "type": "query_type",
  "context": ["context1", "context2"],
  "priority": "high|medium|low",
  "responseType": "brief|value|medium|detailed",
  "toolsNeeded": ["tool1", "tool2"]
}

Examples:
- "What's my total income?" → {"type":"quick_value","context":["income"],"priority":"low","responseType":"value","toolsNeeded":[]}
- "How should I invest $10k?" → {"type":"investment_advice","context":["personal_finances","assets"],"priority":"high","responseType":"detailed","toolsNeeded":["web_search","portfolio_analysis"]}
- "What are good investment opportunities now?" → {"type":"market_research","context":["news"],"priority":"medium","responseType":"medium","toolsNeeded":["web_search"]}`
      }, {
        role: 'user', 
        content: message
      }],
      max_tokens: 200,
      temperature: 0.1
    }),
  });

  const data = await response.json();
  try {
    const classification = JSON.parse(data.choices[0]?.message?.content || '{"type":"general_financial","context":["personal_finances"],"priority":"medium","responseType":"medium","toolsNeeded":[]}');
    console.log('Classification result:', classification);
    return classification;
  } catch (e) {
    console.log('Classification parse error, using fallback');
    // Simple fallback for greetings
    if (lowerMessage.match(/^(hi|hello|hey|good morning|good afternoon|good evening|how are you|what's up|greetings)\.?$/)) {
      return {
        type: "greeting",
        context: [],
        priority: "low",
        responseType: "brief",
        toolsNeeded: []
      };
    }
    return {
      type: "general_financial",
      context: ["personal_finances"],
      priority: "medium",
      responseType: "medium",
      toolsNeeded: []
    };
  }
}

async function executeTools(toolsNeeded: string[], message: string, userData: any): Promise<any> {
  console.log('Executing tools:', toolsNeeded);
  const toolResults: any = {};
  
  try {
    for (const tool of toolsNeeded) {
      switch (tool) {
        case 'web_search':
          // Simple market search for investment opportunities
          const searchQuery = `investment opportunities ${new Date().getFullYear()} market trends financial advice`;
          console.log('Performing web search for:', searchQuery);
          
          // For now, we'll add a placeholder - in a real implementation, you'd integrate with a search API
          toolResults.web_search = {
            summary: "Current market trends suggest diversified portfolios with tech stocks, green energy, and emerging markets show potential.",
            trends: ["AI and technology stocks", "Renewable energy investments", "Emerging market opportunities"],
            risks: ["Market volatility", "Interest rate changes", "Geopolitical tensions"]
          };
          break;
          
        case 'portfolio_analysis':
          // Enhanced portfolio analysis based on user data
          if (userData.assets) {
            const totalValue = userData.assets.reduce((sum: number, asset: any) => sum + (asset.current_value || 0), 0);
            const diversification = userData.assets.length > 1 ? "Diversified" : "Concentrated";
            
            toolResults.portfolio_analysis = {
              total_value: totalValue,
              diversification_score: diversification,
              asset_count: userData.assets.length,
              recommendations: totalValue < 10000 ? ["Consider low-cost index funds", "Build emergency fund first"] : ["Rebalance quarterly", "Consider international exposure"]
            };
          }
          break;
          
        case 'goal_planning':
          // Long-term financial planning
          if (userData.goals) {
            toolResults.goal_planning = {
              active_goals: userData.goals.financial?.length || 0,
              portfolio_goals: userData.goals.portfolio?.length || 0,
              planning_horizon: "5-10 years recommended for wealth building",
              strategies: ["Dollar-cost averaging", "Tax-advantaged accounts", "Compound growth focus"]
            };
          }
          break;
          
        case 'risk_analysis':
          // Risk assessment based on user profile
          const income = userData.income_streams?.reduce((sum: number, stream: any) => sum + (stream.amount || 0), 0) || 0;
          const expenses = userData.expense_streams?.reduce((sum: number, stream: any) => sum + (stream.amount || 0), 0) || 0;
          const netIncome = income - expenses;
          
          toolResults.risk_analysis = {
            risk_capacity: netIncome > 0 ? "Positive" : "Limited",
            emergency_fund_needed: expenses * 6,
            risk_tolerance: income > 50000 ? "Moderate to High" : "Conservative",
            insurance_needs: ["Health insurance", "Life insurance if dependents", "Disability insurance"]
          };
          break;
      }
    }
    
    console.log('Tool execution completed:', Object.keys(toolResults));
    return toolResults;
  } catch (error) {
    console.error('Tool execution error:', error);
    return {};
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

function generateSpecializedPrompt(queryType: string, responseType: string, toolsNeeded: string[], userData: any): string {
  const basePrompts = {
    greeting: `You are Anakin, a friendly AI financial advisor. Respond warmly and briefly. Keep under 50 words.`,
    
    quick_value: `You are Anakin. Provide the exact value requested with minimal context. Be precise and concise.`,
    
    portfolio_analysis: `You are Anakin, a portfolio analysis specialist. Provide insights about holdings, performance, and diversification.`,

    debt_management: `You are Anakin, a debt management expert. Analyze debt strategy and provide optimization recommendations.`,

    investment_advice: `You are Anakin, an investment advisor. Provide personalized investment recommendations.`,

    news_analysis: `You are Anakin, a financial news analyst. Analyze how recent market news impacts the user's portfolio.`,

    goal_tracking: `You are Anakin, a goal tracking specialist. Monitor progress and provide guidance.`,

    general_financial: `You are Anakin, a comprehensive financial advisor. Provide professional financial guidance.`
  };

  const responseStructures = {
    brief: "",
    value: "Provide just the number/value with one line of context.",
    medium: `Structure your response with:
**💡 KEY INSIGHT**
**📊 ANALYSIS**  
**⚡ ACTION**`,
    detailed: `Structure your response with:
**📊 OVERVIEW**
**🎯 KEY INSIGHTS** 
**⚡ IMMEDIATE ACTIONS**
**🔍 DETAILED ANALYSIS**
**📈 RECOMMENDATIONS**`
  };

  let prompt = basePrompts[queryType as keyof typeof basePrompts] || basePrompts.general_financial;
  
  // Add response structure based on type
  if (responseType !== 'brief' && responseType !== 'value') {
    prompt += `\n\n${responseStructures[responseType as keyof typeof responseStructures]}`;
  }

  // Add tool-specific instructions
  if (toolsNeeded.includes('web_search')) {
    prompt += `\n\nIMPORTANT: Include current market trends and investment opportunities based on recent market conditions.`;
  }
  
  if (toolsNeeded.includes('portfolio_analysis')) {
    prompt += `\n\nFocus on portfolio optimization, diversification analysis, and performance metrics.`;
  }
  
  if (toolsNeeded.includes('goal_planning')) {
    prompt += `\n\nProvide long-term financial planning strategies and milestone projections.`;
  }

  // For greetings and quick values, don't include user data
  if (queryType === 'greeting' || queryType === 'quick_value') {
    return prompt;
  }
  
  let contextData = '';
  Object.entries(userData).forEach(([key, value]) => {
    if (key === 'toolResults' && value && Object.keys(value).length > 0) {
      contextData += `\n\nTOOL ANALYSIS RESULTS: ${JSON.stringify(value, null, 2)}`;
    } else if (key !== 'toolResults' && value && (Array.isArray(value) ? value.length > 0 : Object.keys(value).length > 0)) {
      contextData += `\n\n${key.toUpperCase()}: ${JSON.stringify(value, null, 2)}`;
    }
  });

  return `${prompt}

USER FINANCIAL DATA:${contextData}

Provide professional, actionable advice with specific references to the user's data. Use concrete numbers and be specific about recommendations.`;
}

async function generateResponse(message: string, classification: any, userData: any, groqApiKey: string): Promise<string> {
  console.log(`Generating ${classification.type} response with ${classification.responseType} format`);
  
  const systemPrompt = generateSpecializedPrompt(classification.type, classification.responseType, classification.toolsNeeded || [], userData);
  
  // Determine token limits based on response type
  const tokenLimits = {
    brief: 100,
    value: 50,
    medium: 500,
    detailed: 1500
  };
  
  const maxTokens = tokenLimits[classification.responseType as keyof typeof tokenLimits] || 500;
  
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
      max_tokens: maxTokens,
      temperature: classification.type === 'greeting' ? 0.5 : (classification.type === 'market_research' ? 0.3 : 0.7)
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
    
    // Step 2: Fetch relevant data (skip for greetings and quick values to save tokens)
    let userData = {};
    if (classification.type !== 'greeting' && classification.type !== 'quick_value') {
      console.log('Fetching user data for comprehensive query');
      userData = await fetchRelevantData(userId, classification.context, supabase);
    } else {
      console.log('Skipping data fetch for brief response - saving tokens');
    }
    
    // Step 3: Execute any needed tools
    let toolResults = {};
    if (classification.toolsNeeded && classification.toolsNeeded.length > 0) {
      console.log('Executing tools:', classification.toolsNeeded);
      toolResults = await executeTools(classification.toolsNeeded, message, userData);
    }
    
    // Step 4: Generate specialized response with tool results
    const response = await generateResponse(message, classification, { ...userData, toolResults }, groqApiKey);

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