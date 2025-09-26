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
- news_analysis: Market news impact on portfolio, latest news requests
- goal_tracking: Financial goals progress and planning
- expense_analysis: Spending patterns, budgeting advice
- income_optimization: Income strategies, tax efficiency
- market_research: Market trends, economic analysis, stock/company information
- risk_assessment: Risk evaluation, insurance planning
- general_financial: General financial advice and education

CONTEXT TYPES: personal_finances, debts, assets, goals, income, expenses, deposits, news

RESPONSE TYPES:
- brief: Short greeting or simple answer (50-100 tokens)
- value: Just return a number/value with minimal context (20-50 tokens)  
- medium: Focused analysis with key points (300-500 tokens)
- detailed: Comprehensive analysis with full insights (800-1500 tokens)

TOOLS NEEDED:
- web_search: For market research, investment opportunities, economic trends, latest news, stock/company information
- egyptian_news: For Egyptian stock market news specifically
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
- "Egyptian stock market news" → {"type":"news_analysis","context":["news"],"priority":"medium","responseType":"medium","toolsNeeded":["egyptian_news"]}
- "اخر اخبار البورصة" → {"type":"news_analysis","context":["news"],"priority":"medium","responseType":"medium","toolsNeeded":["egyptian_news"]}
- "latest EGX news" → {"type":"news_analysis","context":["news"],"priority":"medium","responseType":"medium","toolsNeeded":["egyptian_news"]}
- "Apple stock information" → {"type":"market_research","context":["news"],"priority":"medium","responseType":"medium","toolsNeeded":["web_search"]}
- "How should I invest $10k?" → {"type":"investment_advice","context":["personal_finances","assets"],"priority":"high","responseType":"detailed","toolsNeeded":["web_search","portfolio_analysis"]}`
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
  
  const userCountry = userData.personal_finances?.country || userData.user_country || 'Egypt';
  const userCurrency = userData.personal_finances?.currency || 'EGP';
  
  try {
    for (const tool of toolsNeeded) {
      switch (tool) {
        case 'egyptian_news':
          console.log('Fetching Egyptian market news...');
          try {
            const supabaseUrl = Deno.env.get('SUPABASE_URL');
            const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
            
            if (!supabaseUrl || !supabaseKey) {
              throw new Error('Supabase credentials not configured');
            }
            
            const newsResponse = await fetch(`${supabaseUrl}/functions/v1/egyptian-market-news`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ query: message })
            });
            
            if (newsResponse.ok) {
              const newsData = await newsResponse.json();
              console.log('Egyptian news retrieved:', newsData.news?.length || 0, 'articles');
              
              if (newsData.success && newsData.news && newsData.news.length > 0) {
                toolResults.egyptian_news = {
                  success: true,
                  news: newsData.news.slice(0, 5),
                  summary: `Found ${newsData.news.length} recent articles about Egyptian stock market`,
                  key_insights: newsData.news.slice(0, 3).map((item: any) => `${item.title}: ${item.snippet}`).join('\n\n'),
                  sources: newsData.news.slice(0, 3).map((item: any) => item.source),
                  last_updated: newsData.timestamp
                };
              } else {
                toolResults.egyptian_news = {
                  success: false,
                  message: 'No recent Egyptian market news found'
                };
              }
            } else {
              throw new Error('News service unavailable');
            }
          } catch (error) {
            console.error('Egyptian news error:', error);
            toolResults.egyptian_news = {
              success: false,
              error: 'News service temporarily unavailable',
              message: 'Unable to fetch latest Egyptian market news at the moment'
            };
          }
          break;
          
        case 'web_search':
          console.log('Performing general web search...');
          try {
            const googleApiKey = Deno.env.get('GOOGLE_SEARCH_API_KEY');
            const searchEngineId = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID');
            
            if (googleApiKey && searchEngineId) {
              let searchQuery = `${message} financial market analysis investment`;
              if (userCountry !== 'Egypt') {
                searchQuery += ` ${userCountry}`;
              }
              
              const googleSearchUrl = `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${searchEngineId}&q=${encodeURIComponent(searchQuery)}&num=5&safe=active`;
              
              const searchResponse = await fetch(googleSearchUrl);
              
              if (searchResponse.ok) {
                const searchData = await searchResponse.json();
                
                if (searchData.items && searchData.items.length > 0) {
                  toolResults.web_search = {
                    success: true,
                    results: searchData.items.slice(0, 3).map((item: any) => ({
                      title: item.title,
                      snippet: item.snippet,
                      link: item.link,
                      source: item.displayLink
                    })),
                    summary: `Found ${searchData.items.length} relevant search results`,
                    query: searchQuery
                  };
                } else {
                  throw new Error('No search results found');
                }
              } else {
                throw new Error('Search service error');
              }
            } else {
              throw new Error('Search API not configured');
            }
          } catch (error) {
            console.error('Web search error:', error);
            toolResults.web_search = {
              success: false,
              error: 'Search service temporarily unavailable',
              message: `General market analysis for ${userCountry} - search service unavailable`
            };
          }
          break;
          
        case 'portfolio_analysis':
          if (userData.assets) {
            const totalValue = userData.assets.reduce((sum: number, asset: any) => sum + (asset.current_value || 0), 0);
            toolResults.portfolio_analysis = {
              total_value: totalValue,
              currency: userCurrency,
              asset_count: userData.assets.length,
              diversification: userData.assets.length > 1 ? "Diversified" : "Concentrated",
              recommendations: totalValue < 10000 ? 
                [`Build emergency fund in ${userCurrency}`, `Consider low-cost ${userCountry} index funds`] : 
                [`Rebalance quarterly`, `Consider international diversification`]
            };
          }
          break;
          
        case 'goal_planning':
          if (userData.goals) {
            toolResults.goal_planning = {
              active_goals: userData.goals.financial?.length || 0,
              country: userCountry,
              currency: userCurrency,
              strategies: [`${userCurrency}-denominated investments`, `${userCountry} tax-advantaged accounts`]
            };
          }
          break;
          
        case 'risk_analysis':
          const income = userData.income_streams?.reduce((sum: number, stream: any) => sum + (stream.amount || 0), 0) || 0;
          const expenses = userData.expense_streams?.reduce((sum: number, stream: any) => sum + (stream.amount || 0), 0) || 0;
          
          toolResults.risk_analysis = {
            risk_capacity: (income - expenses) > 0 ? "Positive" : "Limited",
            emergency_fund_needed: expenses * 6,
            country: userCountry,
            currency: userCurrency
          };
          break;
      }
    }
  } catch (error) {
    console.error('Tool execution error:', error);
  }
  
  return toolResults;
}

async function generateResponse(classification: any, userData: any, toolResults: any, groqApiKey: string) {
  console.log('Generating response for type:', classification.type);
  
  const userCountry = userData.personal_finances?.country || userData.user_country || 'Egypt';
  const userCurrency = userData.personal_finances?.currency || 'EGP';
  
  let systemPrompt = `You are an expert financial advisor assistant with deep knowledge of ${userCountry} markets and ${userCurrency} currency. Provide helpful, accurate financial guidance.

Current context:
- User location: ${userCountry}
- User currency: ${userCurrency}
- Query type: ${classification.type}
- Response length: ${classification.responseType}

Guidelines:
- Be concise and practical
- Use specific numbers when available
- Include currency (${userCurrency}) in financial figures
- Consider ${userCountry} market conditions
- Provide actionable advice
- If you have news/search results, incorporate key insights naturally`;

  if (classification.responseType === 'brief') {
    systemPrompt += '\n\nKeep response under 100 words.';
  } else if (classification.responseType === 'value') {
    systemPrompt += '\n\nProvide just the specific value/number requested with minimal context.';
  } else if (classification.responseType === 'medium') {
    systemPrompt += '\n\nProvide 200-400 words with key insights and recommendations.';
  } else {
    systemPrompt += '\n\nProvide comprehensive 500-800 word analysis with detailed insights.';
  }

  // Add tool results context
  let toolContext = '';
  
  if (toolResults.egyptian_news?.success) {
    toolContext += `\n\nLATEST EGYPTIAN MARKET NEWS:\n${toolResults.egyptian_news.key_insights}`;
  }
  
  if (toolResults.web_search?.success) {
    toolContext += `\n\nRELEVANT SEARCH RESULTS:\n${toolResults.web_search.results.map((r: any) => `${r.title}: ${r.snippet}`).join('\n')}`;
  }
  
  if (toolResults.portfolio_analysis) {
    toolContext += `\n\nPORTFOLIO DATA: Total value: ${toolResults.portfolio_analysis.total_value} ${userCurrency}, Assets: ${toolResults.portfolio_analysis.asset_count}, Diversification: ${toolResults.portfolio_analysis.diversification}`;
  }

  const userDataContext = `
PERSONAL DATA:
- Income: ${userData.income_streams?.reduce((sum: number, stream: any) => sum + (stream.amount || 0), 0) || 0} ${userCurrency}/month
- Expenses: ${userData.expense_streams?.reduce((sum: number, stream: any) => sum + (stream.amount || 0), 0) || 0} ${userCurrency}/month
- Assets: ${userData.assets?.length || 0} holdings
- Debts: ${userData.debts?.length || 0} debts`;

  const messages = [
    { role: 'system', content: systemPrompt + toolContext + userDataContext },
    { role: 'user', content: `${classification.type === 'greeting' ? 'Hello' : userData.originalMessage}` }
  ];

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-70b-versatile',
      messages,
      max_tokens: classification.responseType === 'brief' ? 150 : 
                   classification.responseType === 'value' ? 50 :
                   classification.responseType === 'medium' ? 500 : 800,
      temperature: 0.3
    }),
  });

  if (!response.ok) {
    console.error('Groq API error:', response.status, response.statusText);
    return `Hello! I'm your AI financial advisor. I'm ready to help you with your financial questions and provide insights about your portfolio, income, expenses, and investment opportunities. What would you like to know?`;
  }

  const data = await response.json();
  console.log('Groq API response:', data);
  
  let finalResponse = 'I apologize, but I encountered an error processing your request.';
  
  if (data && data.choices && data.choices.length > 0 && data.choices[0].message) {
    finalResponse = data.choices[0].message.content || finalResponse;
  } else {
    console.error('Invalid Groq API response structure:', data);
  }
  
  // Add news links if we have Egyptian news results
  if (toolResults.egyptian_news?.success && toolResults.egyptian_news.news?.length > 0) {
    const newsLinks = toolResults.egyptian_news.news.slice(0, 3).map((item: any) => 
      `• [${item.title}](${item.link}) - ${item.source}`
    ).join('\n');
    
    finalResponse += `\n\n**Latest News Sources:**\n${newsLinks}`;
  }
  
  return finalResponse;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId } = await req.json();
    
    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing message:', message);

    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    if (!groqApiKey) {
      throw new Error('GROQ API key not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch user data in parallel
    const [
      { data: personalFinances },
      { data: assets },
      { data: debts },
      { data: incomeStreams },
      { data: expenseStreams },
      { data: deposits },
      { data: goals },
      { data: userSettings }
    ] = await Promise.all([
      supabase.from('personal_finances').select('*').eq('user_id', userId),
      supabase.from('assets').select('*').eq('user_id', userId),
      supabase.from('debts').select('*').eq('user_id', userId),
      supabase.from('income_streams').select('*').eq('user_id', userId),
      supabase.from('expense_streams').select('*').eq('user_id', userId),
      supabase.from('deposits').select('*').eq('user_id', userId),
      supabase.from('goals').select('*').eq('user_id', userId),
      supabase.from('user_settings').select('*').eq('user_id', userId)
    ]);

    const userData = {
      originalMessage: message,
      user_country: userSettings?.[0]?.currency === 'EGP' ? 'Egypt' : 'International',
      personal_finances: personalFinances?.[0],
      assets: assets || [],
      debts: debts || [],
      income_streams: incomeStreams || [],
      expense_streams: expenseStreams || [],
      deposits: deposits || [],
      goals: {
        financial: goals?.filter((g: any) => g.goal_type === 'financial') || [],
        portfolio: goals?.filter((g: any) => g.goal_type === 'portfolio') || []
      }
    };

    console.log('User data loaded:', {
      country: userData.user_country,
      assets: userData.assets.length,
      income_streams: userData.income_streams.length
    });

    // Classify the query
    const classification = await classifyQuery(message, groqApiKey);
    console.log('Query classified as:', classification);

    // Execute required tools
    const toolResults = await executeTools(classification.toolsNeeded || [], message, userData);
    console.log('Tool results:', Object.keys(toolResults));

    // Generate response
    const response = await generateResponse(classification, userData, toolResults, groqApiKey);

    return new Response(JSON.stringify({ 
      response,
      classification: classification.type,
      tools_used: classification.toolsNeeded || []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-router-agent:', error);
    return new Response(JSON.stringify({ 
      error: 'Service temporarily unavailable',
      response: 'I apologize, but I\'m experiencing technical difficulties. Please try again in a moment.'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});