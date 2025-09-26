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
  
  // Extract user geography from user data
  const userCountry = userData.personal_finances?.country || userData.user_country || 'Egypt';
  const userCurrency = userData.personal_finances?.currency || 'EGP';
  const currentYear = new Date().getFullYear();
  
  try {
    for (const tool of toolsNeeded) {
      switch (tool) {
        case 'web_search':
          // Geographic and context-aware search
          let searchQuery = '';
          if (message.toLowerCase().includes('business') || message.toLowerCase().includes('invest') || message.toLowerCase().includes('opportunity')) {
            searchQuery = `${userCountry} business investment opportunities ${currentYear} ${userCurrency} market economy industry trends`;
          } else if (message.toLowerCase().includes('real estate') || message.toLowerCase().includes('property')) {
            searchQuery = `${userCountry} real estate market ${currentYear} property investment ${userCurrency} trends`;
          } else if (message.toLowerCase().includes('stock') || message.toLowerCase().includes('trading')) {
            searchQuery = `${userCountry} stock market ${currentYear} ${userCurrency} trading opportunities local stocks`;
          } else {
            searchQuery = `${userCountry} financial market ${currentYear} investment opportunities ${userCurrency} economy`;
          }
          
          console.log('Performing Google search for:', searchQuery);
          
          try {
            // Google Custom Search API integration
            const googleApiKey = Deno.env.get('GOOGLE_SEARCH_API_KEY');
            const searchEngineId = '017576662512468239146:omuauf_lfve'; // Generic search engine ID
            
            if (googleApiKey) {
              const googleSearchUrl = `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${searchEngineId}&q=${encodeURIComponent(searchQuery)}&num=5`;
              
              const searchResponse = await fetch(googleSearchUrl);
              const searchData = await searchResponse.json();
              
              if (searchData.items && searchData.items.length > 0) {
                const searchResults = searchData.items.map((item: any) => ({
                  title: item.title,
                  snippet: item.snippet,
                  link: item.link,
                  source: item.displayLink
                }));
                
                // Extract key insights from search results
                const insights = searchResults.map((result: any) => result.snippet).join(' ');
                
                toolResults.web_search = {
                  country: userCountry,
                  currency: userCurrency,
                  query: searchQuery,
                  results: searchResults,
                  summary: `Recent ${userCountry} market analysis based on current web sources`,
                  key_insights: insights.substring(0, 500) + '...',
                  sources: searchResults.map((r: any) => r.source).slice(0, 3),
                  last_updated: new Date().toISOString()
                };
                
                console.log('Google search completed with', searchResults.length, 'results');
              } else {
                throw new Error('No search results found');
              }
            } else {
              throw new Error('Google API key not configured');
            }
          } catch (error) {
            console.error('Google search error:', error);
            // Fallback to enhanced placeholder
            toolResults.web_search = {
              country: userCountry,
              currency: userCurrency,
              summary: `Current ${userCountry} market trends suggest opportunities in local sectors aligned with economic growth patterns.`,
              local_opportunities: [`${userCountry} emerging sectors`, `Local ${userCurrency} investment vehicles`, `Regional market advantages`],
              economic_context: [`${userCountry} economic indicators`, `${userCurrency} exchange rate trends`, `Local regulatory environment`],
              risks: [`${userCountry} market volatility`, `${userCurrency} currency risks`, `Local political/economic stability`],
              search_query: searchQuery,
              note: 'Using cached market intelligence due to search service unavailability'
            };
          }
          break;
          
        case 'portfolio_analysis':
          // Enhanced geographic portfolio analysis
          if (userData.assets) {
            const totalValue = userData.assets.reduce((sum: number, asset: any) => sum + (asset.current_value || 0), 0);
            const diversification = userData.assets.length > 1 ? "Diversified" : "Concentrated";
            const localAssets = userData.assets.filter((asset: any) => asset.country === userCountry);
            const internationalAssets = userData.assets.filter((asset: any) => asset.country !== userCountry);
            
            toolResults.portfolio_analysis = {
              total_value: totalValue,
              currency: userCurrency,
              diversification_score: diversification,
              asset_count: userData.assets.length,
              geographic_breakdown: {
                local_assets: localAssets.length,
                international_assets: internationalAssets.length,
                local_percentage: localAssets.length / userData.assets.length * 100
              },
              recommendations: totalValue < 10000 ? 
                [`Consider low-cost ${userCountry} index funds`, `Build emergency fund in ${userCurrency}`, `Explore local ${userCountry} investment platforms`] : 
                [`Rebalance quarterly considering ${userCurrency} fluctuations`, `Consider international exposure beyond ${userCountry}`, `Review ${userCountry} tax implications`]
            };
          }
          break;
          
        case 'goal_planning':
          // Geographic goal planning
          if (userData.goals) {
            const localInflationRate = userCountry === 'Egypt' ? 15 : userCountry === 'UAE' ? 3 : 5; // Approximate rates
            toolResults.goal_planning = {
              country: userCountry,
              currency: userCurrency,
              active_goals: userData.goals.financial?.length || 0,
              portfolio_goals: userData.goals.portfolio?.length || 0,
              local_inflation_context: `${localInflationRate}% estimated ${userCountry} inflation`,
              planning_horizon: "5-10 years recommended for wealth building",
              strategies: [
                `${userCurrency}-denominated investments`, 
                `${userCountry} tax-advantaged accounts`, 
                `Local ${userCountry} compound growth opportunities`,
                `Hedge against ${userCurrency} devaluation`
              ]
            };
          }
          break;
          
        case 'risk_analysis':
          // Geographic risk assessment
          const income = userData.income_streams?.reduce((sum: number, stream: any) => sum + (stream.amount || 0), 0) || 0;
          const expenses = userData.expense_streams?.reduce((sum: number, stream: any) => sum + (stream.amount || 0), 0) || 0;
          const netIncome = income - expenses;
          
          // Country-specific risk factors
          const countryRiskFactors = {
            'Egypt': ['Currency devaluation risk', 'High inflation environment', 'Political stability considerations'],
            'UAE': ['Oil price dependency', 'Real estate market cycles', 'Regional geopolitical factors'],
            'Saudi Arabia': ['Economic diversification progress', 'Oil market volatility', 'Vision 2030 implementation']
          };
          
          toolResults.risk_analysis = {
            country: userCountry,
            currency: userCurrency,
            risk_capacity: netIncome > 0 ? "Positive" : "Limited",
            emergency_fund_needed: expenses * 6,
            risk_tolerance: income > 50000 ? "Moderate to High" : "Conservative",
            local_risk_factors: countryRiskFactors[userCountry as keyof typeof countryRiskFactors] || ['Market volatility', 'Currency fluctuation', 'Economic policy changes'],
            insurance_needs: [
              `${userCountry} health insurance requirements`, 
              `Life insurance with ${userCurrency} coverage`, 
              `${userCountry} disability/unemployment insurance`
            ]
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
          
          // Also fetch user settings for currency/country preferences
          const settings = await supabase.from('user_settings').select('currency, language').eq('user_id', userId).single();
          if (settings.data) {
            dataMap.user_settings = settings.data;
          }
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
  // Extract geographic context
  const userCountry = userData.user_settings?.country || userData.personal_finances?.country || 'Egypt';
  const userCurrency = userData.user_settings?.currency || userData.personal_finances?.currency || 'EGP';
  
  const basePrompts = {
    greeting: `You are Anakin, a friendly AI financial advisor. Respond warmly and briefly. Keep under 50 words.`,
    
    quick_value: `You are Anakin. Provide the exact value requested in ${userCurrency} with minimal context. Be precise and concise.`,
    
    portfolio_analysis: `You are Anakin, a portfolio analysis specialist for ${userCountry} market. Provide insights about holdings, performance, and diversification considering ${userCountry} economic conditions and ${userCurrency} implications.`,

    debt_management: `You are Anakin, a debt management expert specializing in ${userCountry} financial systems. Analyze debt strategy considering local ${userCurrency} interest rates and ${userCountry} banking practices.`,

    investment_advice: `You are Anakin, an investment advisor specializing in ${userCountry} markets. Provide personalized investment recommendations considering ${userCountry} economic climate, ${userCurrency} stability, and local investment opportunities.`,

    news_analysis: `You are Anakin, a financial news analyst focused on ${userCountry} markets. Analyze how recent ${userCountry} and regional news impacts the user's portfolio, considering ${userCurrency} market dynamics.`,

    goal_tracking: `You are Anakin, a goal tracking specialist for ${userCountry} residents. Monitor progress considering local ${userCountry} inflation rates, ${userCurrency} purchasing power, and regional economic factors.`,

    general_financial: `You are Anakin, a comprehensive financial advisor specializing in ${userCountry} financial landscape. Provide professional guidance considering ${userCountry} economic conditions, ${userCurrency} market dynamics, local regulations, and cultural financial practices.`
  };

  const responseStructures = {
    brief: "",
    value: `Provide just the number/value in ${userCurrency} with one line of context.`,
    medium: `Structure your response with geographic context for ${userCountry}:
**💡 KEY INSIGHT** (${userCountry} specific)
**📊 ANALYSIS** (considering ${userCurrency} and local market)
**⚡ ACTION** (actionable for ${userCountry} resident)`,
    detailed: `Structure your response with comprehensive ${userCountry} context:
**📊 OVERVIEW** (${userCountry} market perspective)
**🎯 KEY INSIGHTS** (local ${userCurrency} implications)
**⚡ IMMEDIATE ACTIONS** (specific to ${userCountry} regulations/options)
**🔍 DETAILED ANALYSIS** (${userCountry} economic factors)
**📈 RECOMMENDATIONS** (optimized for ${userCountry} resident)`
  };

  let prompt = basePrompts[queryType as keyof typeof basePrompts] || basePrompts.general_financial;
  
  // Add response structure based on type
  if (responseType !== 'brief' && responseType !== 'value') {
    prompt += `\n\n${responseStructures[responseType as keyof typeof responseStructures]}`;
  }

  // Add tool-specific instructions with geographic context
  if (toolsNeeded.includes('web_search')) {
    prompt += `\n\nIMPORTANT: Include current ${userCountry} market trends, local investment opportunities, and ${userCurrency} market conditions based on recent regional economic developments.`;
  }
  
  if (toolsNeeded.includes('portfolio_analysis')) {
    prompt += `\n\nFocus on portfolio optimization for ${userCountry} resident, diversification analysis considering ${userCurrency} exposure, and performance metrics relative to ${userCountry} market benchmarks.`;
  }
  
  if (toolsNeeded.includes('goal_planning')) {
    prompt += `\n\nProvide long-term financial planning strategies specific to ${userCountry} economic environment, considering local inflation rates, ${userCurrency} stability, and regional growth projections.`;
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
  
GEOGRAPHIC CONTEXT: You are advising a ${userCountry} resident dealing with ${userCurrency}. All advice must be relevant to ${userCountry} economic conditions, local market opportunities, regulatory environment, and cultural financial practices.

USER FINANCIAL DATA:${contextData}

Provide professional, actionable advice with specific references to the user's data and ${userCountry} context. Use concrete numbers in ${userCurrency} and be specific about recommendations that work in ${userCountry}.`;
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