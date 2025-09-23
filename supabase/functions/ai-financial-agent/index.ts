import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

console.log('Environment check:');
console.log('SUPABASE_URL exists:', !!supabaseUrl);
console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!supabaseServiceKey);
console.log('Function startup timestamp:', new Date().toISOString());

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MarketDataSummary {
  stocks: {
    total: number;
    countries: string[];
    top_performers: any[];
    best_performers?: any[];
    worst_performers?: any[];
  };
  crypto: {
    total: number;
    top_by_market_cap: any[];
    market_cap_total?: number;
    trending?: any[];
  };
  real_estate: {
    total_neighborhoods: number;
    cities: string[];
    avg_price_ranges: any[];
    hottest_areas?: any[];
  };
  bonds: {
    total: number;
    avg_yield: number;
    types: string[];
    government_vs_corporate?: any;
  };
  etfs: {
    total: number;
    categories: string[];
    performance_leaders?: any[];
  };
  gold_prices: {
    current_24k: number | null;
    change_24h: number | null;
    trend?: string;
  };
  currency_rates: {
    major_pairs: any[];
    strongest_currencies?: any[];
  };
  bank_products: {
    total: number;
    best_rates: any[];
    savings_vs_cd?: any;
  };
}

async function getMarketDataSummary(supabase: any): Promise<MarketDataSummary> {
  try {
    console.log('Fetching comprehensive market data...');
    
    const [
      stocksResult,
      cryptoResult,
      realEstateResult,
      etfsResult,
      currencyResult,
      bankProductsResult
    ] = await Promise.all([
      supabase.from('egypt_stocks').select('*').order('market_cap', { ascending: false }).limit(100),
      supabase.from('cryptocurrencies').select('*').order('market_cap', { ascending: false }).limit(50),
      supabase.from('real_estate_prices').select('*').order('avg_price_per_meter', { ascending: false }).limit(100),
      supabase.from('etfs').select('*').order('market_cap', { ascending: false }).limit(50),
      supabase.from('currency_rates').select('*').order('last_updated', { ascending: false }).limit(20),
      supabase.from('bank_products').select('*').order('interest_rate', { ascending: false }).limit(50)
    ]);

    const stocks = stocksResult.data || [];
    const crypto = cryptoResult.data || [];
    const realEstate = realEstateResult.data || [];
    const bonds = bondsResult.data || [];
    const etfs = etfsResult.data || [];
    const goldPrices = goldResult.data?.[0] || null;
    const currencyRates = currencyResult.data || [];
    const bankProducts = bankProductsResult.data || [];

    // Calculate top performers for stocks
    const topStockPerformers = stocks
      .filter(stock => stock.change_percent !== null)
      .sort((a, b) => (b.change_percent || 0) - (a.change_percent || 0))
      .slice(0, 5);

    const worstStockPerformers = stocks
      .filter(stock => stock.change_percent !== null)
      .sort((a, b) => (a.change_percent || 0) - (b.change_percent || 0))
      .slice(0, 5);

    // Get unique countries from stocks
    const stockCountries = [...new Set(stocks.map(s => s.country).filter(Boolean))];

    // Calculate crypto market cap total
    const cryptoMarketCapTotal = crypto.reduce((sum, c) => sum + (c.market_cap || 0), 0);

    // Get trending crypto (top gainers)
    const trendingCrypto = crypto
      .filter(c => c.change_24h !== null)
      .sort((a, b) => (b.change_24h || 0) - (a.change_24h || 0))
      .slice(0, 5);

    // Get unique cities from real estate
    const realEstateCities = [...new Set(realEstate.map(re => re.city).filter(Boolean))];

    // Calculate average price ranges for real estate
    const avgPriceRanges = realEstateCities.map(city => {
      const cityProperties = realEstate.filter(re => re.city === city);
      const avgPrice = cityProperties.reduce((sum, prop) => sum + (prop.price || 0), 0) / cityProperties.length;
      return { city, avg_price: avgPrice, count: cityProperties.length };
    }).sort((a, b) => b.avg_price - a.avg_price).slice(0, 10);

    // Get hottest real estate areas (highest price growth)
    const hottestAreas = realEstate
      .filter(re => re.price_change_percent !== null)
      .sort((a, b) => (b.price_change_percent || 0) - (a.price_change_percent || 0))
      .slice(0, 5);

    // Calculate average bond yield
    const avgBondYield = bonds.length > 0 
      ? bonds.reduce((sum, bond) => sum + (bond.yield || 0), 0) / bonds.length 
      : 0;

    // Get unique bond types
    const bondTypes = [...new Set(bonds.map(b => b.bond_type).filter(Boolean))];

    // Government vs Corporate bonds analysis
    const governmentBonds = bonds.filter(b => b.bond_type?.toLowerCase().includes('government'));
    const corporateBonds = bonds.filter(b => b.bond_type?.toLowerCase().includes('corporate'));
    
    const governmentVsCorporate = {
      government: {
        count: governmentBonds.length,
        avg_yield: governmentBonds.length > 0 
          ? governmentBonds.reduce((sum, b) => sum + (b.yield || 0), 0) / governmentBonds.length 
          : 0
      },
      corporate: {
        count: corporateBonds.length,
        avg_yield: corporateBonds.length > 0 
          ? corporateBonds.reduce((sum, b) => sum + (b.yield || 0), 0) / corporateBonds.length 
          : 0
      }
    };

    // Get unique ETF categories
    const etfCategories = [...new Set(etfs.map(e => e.category).filter(Boolean))];

    // Get ETF performance leaders
    const etfPerformanceLeaders = etfs
      .filter(etf => etf.performance_1y !== null)
      .sort((a, b) => (b.performance_1y || 0) - (a.performance_1y || 0))
      .slice(0, 5);

    // Process gold prices
    const goldData = {
      current_24k: goldPrices?.price_24k || null,
      change_24h: goldPrices?.change_24h || null,
      trend: goldPrices?.change_24h > 0 ? 'up' : goldPrices?.change_24h < 0 ? 'down' : 'stable'
    };

    // Process major currency pairs
    const majorPairs = currencyRates
      .filter(rate => ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF'].includes(rate.base_currency))
      .slice(0, 10);

    // Find strongest currencies (best performers)
    const strongestCurrencies = currencyRates
      .filter(rate => rate.change_24h !== null)
      .sort((a, b) => (b.change_24h || 0) - (a.change_24h || 0))
      .slice(0, 5);

    // Get best bank product rates
    const bestBankRates = bankProducts
      .sort((a, b) => (b.interest_rate || 0) - (a.interest_rate || 0))
      .slice(0, 10);

    // Savings vs CD comparison
    const savingsProducts = bankProducts.filter(p => p.product_type?.toLowerCase().includes('savings'));
    const cdProducts = bankProducts.filter(p => p.product_type?.toLowerCase().includes('cd') || p.product_type?.toLowerCase().includes('certificate'));
    
    const savingsVsCd = {
      savings: {
        count: savingsProducts.length,
        avg_rate: savingsProducts.length > 0 
          ? savingsProducts.reduce((sum, p) => sum + (p.interest_rate || 0), 0) / savingsProducts.length 
          : 0,
        best_rate: savingsProducts.length > 0 
          ? Math.max(...savingsProducts.map(p => p.interest_rate || 0)) 
          : 0
      },
      cd: {
        count: cdProducts.length,
        avg_rate: cdProducts.length > 0 
          ? cdProducts.reduce((sum, p) => sum + (p.interest_rate || 0), 0) / cdProducts.length 
          : 0,
        best_rate: cdProducts.length > 0 
          ? Math.max(...cdProducts.map(p => p.interest_rate || 0)) 
          : 0
      }
    };

    const summary: MarketDataSummary = {
      stocks: {
        total: stocks.length,
        countries: stockCountries,
        top_performers: topStockPerformers,
        best_performers: topStockPerformers,
        worst_performers: worstStockPerformers
      },
      crypto: {
        total: crypto.length,
        top_by_market_cap: crypto.slice(0, 10),
        market_cap_total: cryptoMarketCapTotal,
        trending: trendingCrypto
      },
      real_estate: {
        total_neighborhoods: realEstate.length,
        cities: realEstateCities,
        avg_price_ranges: avgPriceRanges,
        hottest_areas: hottestAreas
      },
      bonds: {
        total: 0,
        avg_yield: 0,
        types: [],
        government_vs_corporate: { government: 0, corporate: 0 }
      },
      etfs: {
        total: etfs.length,
        categories: etfCategories,
        performance_leaders: etfPerformanceLeaders
      },
      gold_prices: goldData,
      currency_rates: {
        major_pairs: majorPairs,
        strongest_currencies: strongestCurrencies
      },
      bank_products: {
        total: bankProducts.length,
        best_rates: bestBankRates,
        savings_vs_cd: savingsVsCd
      }
    };

    console.log('Market data summary compiled:', {
      stocks: summary.stocks.total,
      crypto: summary.crypto.total,
      realEstate: summary.real_estate.total_neighborhoods,
      bonds: summary.bonds.total,
      etfs: summary.etfs.total,
      bankProducts: summary.bank_products.total
    });

    return summary;
  } catch (error) {
    console.error('Error fetching market data:', error);
    // Return empty structure on error
    return {
      stocks: { total: 0, countries: [], top_performers: [] },
      crypto: { total: 0, top_by_market_cap: [] },
      real_estate: { total_neighborhoods: 0, cities: [], avg_price_ranges: [] },
      bonds: { total: 0, avg_yield: 0, types: [] },
      etfs: { total: 0, categories: [] },
      gold_prices: { current_24k: null, change_24h: null },
      currency_rates: { major_pairs: [] },
      bank_products: { total: 0, best_rates: [] }
    };
  }
}

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

interface PendingAction {
  type: 'update_income' | 'update_expenses' | 'update_savings' | 'update_investing' | 'add_goal' | 'update_goal' | 
        'add_income_stream' | 'add_expense_stream' | 'add_debt' | 'add_deposit' | 'update_debt' | 'delete_debt' |
        'add_asset' | 'update_asset' | 'delete_asset' | 'rebalance_portfolio' | 'create_portfolio' |
        'update_goal_progress' | 'delete_goal' | 'update_deposit' | 'delete_deposit' |
        'add_portfolio_recommendation' | 'market_analysis_request';
  data: any;
  description: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

serve(async (req) => {
  console.log('Request received:', req.method, req.url);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Parsing request body...');
    const { message, userId, action, messages, model, analyzeNews } = await req.json();
    console.log('Request data:', { message, userId, actionType: action?.type, messageHistory: messages?.length, model, analyzeNews });

    // Handle news analysis requests
    if (analyzeNews) {
      return await handleNewsAnalysis(userId);
    }

    // Read Groq API key at request time to pick up latest secret
    const groqApiKey = Deno.env.get('groq anakin');
    console.log('Groq API key exists:', !!groqApiKey);
    console.log('Groq API key length:', groqApiKey?.length || 0);
    console.log('All available env vars:', Object.keys(Deno.env.toObject()).filter(k => k.toLowerCase().includes('groq')));

    if (!groqApiKey) {
      console.error('Groq API key not configured - checking all variants...');
      // Try alternative secret names
      const altKey1 = Deno.env.get('GROQ');
      const altKey2 = Deno.env.get('GROQ_API_KEY');
      console.log('Alternative key 1 (GROQ):', !!altKey1);
      console.log('Alternative key 2 (GROQ_API_KEY):', !!altKey2);
      
      const finalKey = groqApiKey || altKey1 || altKey2;
      if (!finalKey) {
        return new Response(JSON.stringify({ 
          error: 'Groq API key not configured in any format',
          response: 'I need the Groq API key configured in Supabase Edge Function secrets. Please add it as "groq anakin", "GROQ", or "GROQ_API_KEY".'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Load agent memory and get comprehensive user data including market analysis
    console.log('Loading agent memory and comprehensive user data...');
    const [agentMemory, userData] = await Promise.all([
      loadAgentMemory(userId),
      getUserFinancialData(userId)
    ]);
    
    // Create a simple market data summary to avoid errors
    const marketDataSummary = {
      stocks: { total: 0, countries: [], top_performers: [] },
      crypto: { total: 0, top_by_market_cap: [] },
      real_estate: { total_neighborhoods: 0, cities: [], avg_price_ranges: [] },
      bonds: { total: 0, avg_yield: 0, types: [] },
      etfs: { total: 0, categories: [] },
      gold_prices: { current_24k: null, change_24h: null },
      currency_rates: { major_pairs: [] },
      bank_products: { total: 0, best_rates: [] }
    };
    
    console.log('Data loaded:', { 
      hasMemory: !!agentMemory, 
      financesExist: !!userData.finances, 
      goalsCount: userData.goals.length,
      assetsCount: userData.assets.length,
      debtsCount: userData.debts.length,
      incomeStreamsCount: userData.incomeStreams.length,
      expenseStreamsCount: userData.expenseStreams.length,
      depositsCount: userData.deposits.length,
      portfoliosCount: userData.portfolios.length,
      hasMarketData: !!marketDataSummary,
      stocksAvailable: marketDataSummary.stocks.total,
      cryptoAvailable: marketDataSummary.crypto.total
    });

    // Get the working API key
    const workingGroqKey = groqApiKey || Deno.env.get('GROQ') || Deno.env.get('GROQ_API_KEY');
    
    // Analyze the user message and get the response
    console.log('Analyzing user message...');
    const { analysis } = await analyzeUserMessage(
      message, 
      userData, 
      agentMemory, 
      marketDataSummary, 
      messages || [], 
      workingGroqKey,
      model
    );

    // Update agent memory with new interaction
    await updateAgentMemory(userId, {
      last_interaction: {
        user_message: message,
        ai_response: analysis,
        timestamp: new Date().toISOString()
      }
    });

    return new Response(JSON.stringify({ 
      response: analysis
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-financial-agent function:', error);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    // Provide user-friendly error messages
    let userMessage = 'I apologize, but I\'m experiencing technical difficulties at the moment. Please try rephrasing your request or try again in a few moments. If the issue persists, our technical team has been notified.';
    
    if (error.message?.includes('rate limit')) {
      userMessage = 'I\'m currently experiencing high traffic. Please wait a moment and try again.';
    } else if (error.message?.includes('quota exceeded')) {
      userMessage = 'The AI service is temporarily unavailable due to usage limits. Please try again later.';
    } else if (error.message?.includes('timeout') || error.message?.includes('AbortError')) {
      userMessage = 'The request timed out. Please try again with a shorter message.';
    } else if (error.message?.includes('Cannot read properties of undefined')) {
      userMessage = 'I\'m having trouble accessing your financial data. Please try again.';
    }
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to process request',
        response: userMessage,
        errorDetails: {
          name: error.name,
          message: error.message,
          stack: error.stack?.split('\n')[0] // Just first line of stack
        }
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Handle news analysis for users
async function handleNewsAnalysis(userId: string) {
  try {
    console.log('=== STARTING NEWS ANALYSIS ===')
    console.log('User ID:', userId)
    
    // Test database connection first
    console.log('Testing database connection...')
    const { data: testData, error: testError } = await supabase
      .from('news_articles')
      .select('count(*)')
      .limit(1)
    
    console.log('Database test result:', { testData, testError })
    
    // Get user's financial data and country
    console.log('Getting user financial data...')
    const userData = await getUserFinancialData(userId)
    // Always default to EGY since that's where we have news articles
    const userCountry = 'EGY' // userData.userProfile?.country || 'EGY'
    
    console.log('User country determined as:', userCountry)
    console.log('User profile exists:', !!userData.userProfile)
    
    // Fetch top 3 recent news articles for the user's country
    console.log('Fetching news articles from database...')
    const { data: newsArticles, error: newsError } = await supabase
      .from('news_articles')
      .select('*')
      .eq('country', userCountry)
      .order('priority_score', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(3)
    
    console.log('Query executed with country:', userCountry)
    console.log('News query result:', { 
      articlesCount: newsArticles?.length || 0, 
      error: newsError,
      firstArticle: newsArticles?.[0]?.title || 'No articles'
    })
    
    if (newsError) {
      console.error('Error fetching news:', newsError)
      throw new Error('Failed to fetch news articles')
    }

    console.log(`Found ${newsArticles?.length || 0} news articles for analysis`)

    const analyses = []
    
    for (const article of newsArticles || []) {
      // Check if analysis already exists
      const { data: existingAnalysis } = await supabase
        .from('personalized_news_analysis')
        .select('*')
        .eq('user_id', userId)
        .eq('article_id', article.id)
        .single()

      if (existingAnalysis) {
        analyses.push({
          article: article,
          analysis: existingAnalysis.analysis_content,
          impact_score: existingAnalysis.impact_score,
          recommendations: existingAnalysis.recommendations
        })
        continue
      }

      // Generate new analysis
      const analysis = await generatePersonalizedNewsAnalysis(article, userData)
      
      if (analysis) {
        // Store the analysis
        const { error: insertError } = await supabase
          .from('personalized_news_analysis')
          .insert({
            user_id: userId,
            article_id: article.id,
            analysis_content: analysis.content,
            impact_score: analysis.impact_score,
            recommendations: analysis.recommendations,
            relevance_score: analysis.relevance_score
          })

        if (insertError) {
          console.error('Error storing analysis:', insertError)
        }

        analyses.push({
          article: article,
          analysis: analysis.content,
          impact_score: analysis.impact_score,
          recommendations: analysis.recommendations
        })
      }
    }

    console.log('Final analyses count:', analyses.length)

    return new Response(JSON.stringify({
      response: `Here's how today's top news affects your financial situation:${analyses.length === 0 ? ' (No recent news found for analysis)' : ''}`,
      newsAnalyses: analyses,
      summary: `Analyzed ${analyses.length} articles relevant to your portfolio and financial goals.`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in news analysis:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      response: "I couldn't analyze the news right now. Please try again later."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
}

// Generate personalized news analysis
async function generatePersonalizedNewsAnalysis(article: any, userData: any) {
  try {
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY')
    if (!openRouterApiKey) {
      console.error('OpenRouter API key not found')
      return null
    }

    const prompt = `You are a sophisticated financial advisor analyzing news for personalized impact assessment.

USER FINANCIAL PROFILE:
- Net Worth: ${userData.metrics?.netWorth ? `$${userData.metrics.netWorth.toLocaleString()}` : 'Not specified'}
- Monthly Income: ${userData.finances?.monthly_income ? `$${userData.finances.monthly_income.toLocaleString()}` : 'Not specified'}
- Monthly Expenses: ${userData.finances?.monthly_expenses ? `$${userData.finances.monthly_expenses.toLocaleString()}` : 'Not specified'}
- Investment Amount: ${userData.finances?.monthly_investing_amount ? `$${userData.finances.monthly_investing_amount.toLocaleString()}` : 'Not specified'}
- Portfolio Value: ${userData.metrics?.totalPortfolioValue ? `$${userData.metrics.totalPortfolioValue.toLocaleString()}` : 'Not specified'}
- Primary Assets: ${userData.assets?.slice(0, 3).map((a: any) => `${a.asset_name} (${a.asset_type})`).join(', ') || 'None specified'}
- Financial Goals: ${userData.goals?.slice(0, 2).map((g: any) => `${g.title} ($${g.target_amount?.toLocaleString()})`).join(', ') || 'None specified'}
- Country: ${userData.userProfile?.country || 'Not specified'}

NEWS ARTICLE:
Title: ${article.title}
Summary: ${article.summary}
Category: ${article.category}
Sentiment: ${article.sentiment}

Provide a personalized analysis of how this news affects this specific user. Include:
1. Direct impact on their portfolio/investments (if any)
2. Relevance to their financial goals
3. Recommended actions (if any)
4. Impact score (0-100, where 100 is highly impactful)
5. Relevance score (0-100, where 100 is highly relevant)

Keep the analysis concise (2-3 paragraphs) and actionable. Focus on practical implications for this user's specific situation.`

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      console.error('OpenRouter API error:', await response.text())
      return null
    }

    const data = await response.json()
    const analysisText = data.choices[0]?.message?.content

    if (!analysisText) {
      console.error('No analysis content received')
      return null
    }

    // Extract scores from the analysis (simple pattern matching)
    const impactMatch = analysisText.match(/impact score[:\s]*(\d+)/i)
    const relevanceMatch = analysisText.match(/relevance score[:\s]*(\d+)/i)
    
    const impactScore = impactMatch ? parseInt(impactMatch[1]) : 50
    const relevanceScore = relevanceMatch ? parseInt(relevanceMatch[1]) : 50

    return {
      content: analysisText,
      impact_score: Math.min(100, Math.max(0, impactScore)),
      relevance_score: Math.min(100, Math.max(0, relevanceScore)),
      recommendations: extractRecommendations(analysisText)
    }

  } catch (error) {
    console.error('Error generating news analysis:', error)
    return null
  }
}

// Extract recommendations from analysis text
function extractRecommendations(analysisText: string): string {
  const recommendationSections = [
    'recommended actions',
    'recommendations',
    'action items',
    'what to do',
    'next steps'
  ]
  
  for (const section of recommendationSections) {
    const regex = new RegExp(`${section}[:\s]*([^\.]+(?:\.[^\.]+)*?)(?:\n|$)`, 'i')
    const match = analysisText.match(regex)
    if (match && match[1]) {
      return match[1].trim()
    }
  }
  
  // Fallback: look for sentences with action words
  const actionWords = ['should', 'consider', 'recommend', 'suggest', 'advise']
  const sentences = analysisText.split(/[.!?]+/)
  
  for (const sentence of sentences) {
    for (const word of actionWords) {
      if (sentence.toLowerCase().includes(word)) {
        return sentence.trim()
      }
    }
  }
  
  return 'Continue monitoring this development for potential impacts.'
}

async function getUserFinancialData(userId: string) {
  try {
    const [
      financesResult, 
      goalsResult, 
      assetsResult, 
      debtsResult,
      incomeStreamsResult,
      expenseStreamsResult,
      depositsResult,
      portfoliosResult,
      userProfileResult,
      currencyRatesResult
    ] = await Promise.all([
      supabase.from('personal_finances').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('financial_goals').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('assets').select('*, portfolios(name)').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('debts').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('income_streams').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('expense_streams').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('deposits').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('portfolios').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').eq('user_id', userId).single(),
      supabase.from('currency_rates').select('*').order('last_updated', { ascending: false }).limit(100)
    ]);

    // Get user's currency preference
    const userCurrency = userProfileResult.data?.currency || financesResult.data?.currency || 'USD';
    
    // Create currency conversion helper
    const currencyRatesMap = (currencyRatesResult.data || []).reduce((acc, rate) => {
      const key = `${rate.base_currency}_${rate.target_currency}`;
      acc[key] = rate.exchange_rate;
      return acc;
    }, {});

    const convertCurrency = (amount: number, fromCurrency: string, toCurrency = userCurrency) => {
      if (fromCurrency === toCurrency) return amount;
      
      // Direct conversion
      const directKey = `${fromCurrency}_${toCurrency}`;
      if (currencyRatesMap[directKey]) {
        return amount * currencyRatesMap[directKey];
      }
      
      // Indirect conversion via USD
      const fromToUsd = currencyRatesMap[`${fromCurrency}_USD`];
      const usdToTarget = currencyRatesMap[`USD_${toCurrency}`];
      
      if (fromToUsd && usdToTarget) {
        return amount * fromToUsd * usdToTarget;
      }
      
      // Reverse indirect conversion
      const usdToFrom = currencyRatesMap[`USD_${fromCurrency}`];
      const targetToUsd = currencyRatesMap[`${toCurrency}_USD`];
      
      if (usdToFrom && targetToUsd) {
        return amount * targetToUsd / usdToFrom;
      }
      
      return amount; // Fallback to original amount
    };

    const currencySymbols = {
      AED: 'د.إ', SAR: 'ر.س', QAR: 'ر.ق', KWD: 'د.ك', BHD: 'د.ب', OMR: 'ر.ع',
      JOD: 'د.أ', LBP: 'ل.ل', EGP: 'ج.م', MAD: 'د.م', TND: 'د.ت', DZD: 'د.ج',
      IQD: 'د.ع', USD: '$', GBP: '£', EUR: '€', INR: '₹', CNY: '¥'
    };

    const formatCurrency = (amount: number, currency = userCurrency) => {
      if (amount === null || amount === undefined || isNaN(amount)) {
        amount = 0;
      }
      const symbol = currencySymbols[currency] || currency;
      return `${symbol}${amount.toLocaleString()}`;
    };

    // Calculate portfolio metrics
    const totalPortfolioValue = assetsResult.data?.reduce((sum, asset) => {
      const currentValue = (asset.current_price || asset.purchase_price || 0) * (asset.quantity || 1);
      return sum + currentValue;
    }, 0) || 0;

    const totalInvestment = assetsResult.data?.reduce((sum, asset) => {
      const purchaseValue = (asset.purchase_price || 0) * (asset.quantity || 1);
      return sum + purchaseValue;
    }, 0) || 0;

    const portfolioReturn = totalInvestment > 0 ? ((totalPortfolioValue - totalInvestment) / totalInvestment) * 100 : 0;

    // Calculate debt metrics
    const totalDebt = debtsResult.data?.reduce((sum, debt) => sum + (debt.total_amount - debt.paid_amount), 0) || 0;
    const monthlyDebtPayments = debtsResult.data?.reduce((sum, debt) => sum + (debt.monthly_payment || 0), 0) || 0;

    // Calculate savings metrics
    const totalSavings = depositsResult.data?.reduce((sum, deposit) => sum + deposit.principal, 0) || 0;
    const totalInterestAccrued = depositsResult.data?.reduce((sum, deposit) => sum + deposit.accrued_interest, 0) || 0;

    return {
      finances: financesResult.data || { monthly_income: 0, monthly_expenses: 0, net_savings: 0, monthly_investing_amount: 0 },
      goals: goalsResult.data || [],
      assets: assetsResult.data || [],
      debts: debtsResult.data || [],
      incomeStreams: incomeStreamsResult.data || [],
      expenseStreams: expenseStreamsResult.data || [],
      deposits: depositsResult.data || [],
      portfolios: portfoliosResult.data || [],
      userProfile: userProfileResult.data,
      // Currency data
      userCurrency,
      currencyRates: currencyRatesResult.data || [],
      convertCurrency,
      formatCurrency,
      // Calculated metrics
      metrics: {
        totalPortfolioValue,
        totalInvestment,
        portfolioReturn,
        totalDebt,
        monthlyDebtPayments,
        totalSavings,
        totalInterestAccrued,
        netWorth: totalPortfolioValue + totalSavings - totalDebt,
        debtToIncomeRatio: financesResult.data?.monthly_income ? (monthlyDebtPayments / financesResult.data.monthly_income) * 100 : 0,
        savingsRate: financesResult.data?.monthly_income ? ((financesResult.data.net_savings || 0) / financesResult.data.monthly_income) * 100 : 0
      }
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    return {
      finances: { monthly_income: 0, monthly_expenses: 0, net_savings: 0, monthly_investing_amount: 0 },
      goals: [],
      assets: [],
      debts: [],
      incomeStreams: [],
      expenseStreams: [],
      deposits: [],
      portfolios: [],
      userProfile: null,
      userCurrency: 'USD',
      currencyRates: [],
      convertCurrency: (amount: number) => amount,
      formatCurrency: (amount: number) => {
        if (amount === null || amount === undefined || isNaN(amount)) {
          amount = 0;
        }
        return `$${amount.toLocaleString()}`;
      },
      metrics: {
        totalPortfolioValue: 0,
        totalInvestment: 0,
        portfolioReturn: 0,
        totalDebt: 0,
        monthlyDebtPayments: 0,
        totalSavings: 0,
        totalInterestAccrued: 0,
        netWorth: 0,
        debtToIncomeRatio: 0,
        savingsRate: 0
      }
    };
  }
}

// Load agent memory for personalized interactions
async function loadAgentMemory(userId: string) {
  try {
    const { data: memory, error } = await supabase
      .from('ai_agent_memory')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error loading agent memory:', error);
      return null;
    }

    return memory || null;
  } catch (error) {
    console.error('Error in loadAgentMemory:', error);
    return null;
  }
}

// Update agent memory with new interactions
async function updateAgentMemory(userId: string, memoryUpdate: any) {
  try {
    const { data: existingMemory } = await supabase
      .from('ai_agent_memory')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingMemory) {
      // Update existing memory
      const updatedMemory = {
        ...existingMemory.memory,
        ...memoryUpdate,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('ai_agent_memory')
        .update({ 
          memory: updatedMemory,
          summary: memoryUpdate.summary || existingMemory.summary
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating agent memory:', error);
      }
    } else {
      // Create new memory
      const { error } = await supabase
        .from('ai_agent_memory')
        .insert({
          user_id: userId,
          memory: {
            ...memoryUpdate,
            created_at: new Date().toISOString()
          },
          summary: memoryUpdate.summary || 'New user interaction'
        });

      if (error) {
        console.error('Error creating agent memory:', error);
      }
    }
  } catch (error) {
    console.error('Error in updateAgentMemory:', error);
  }
}

// Enhanced web search function
async function performWebSearch(query: string, maxResults: number = 3): Promise<any[]> {
  try {
    console.log(`Performing web search for: ${query}`);
    
    // This is a simplified web search - in a real implementation you'd use
    // a proper search API like Serper, SerpAPI, or Google Custom Search
    const searchResults = [
      {
        title: "Market Analysis",
        snippet: "Current market trends and financial insights",
        url: "https://example.com/market-analysis"
      }
    ];
    
    return searchResults;
  } catch (error) {
    console.error('Web search error:', error);
    return [];
  }
}

// Analyze user message and generate response with enhanced capabilities
async function analyzeUserMessage(
  message: string, 
  userData: any, 
  agentMemory: any, 
  marketData: MarketDataSummary, 
  messageHistory: Message[], 
  groqApiKey: string,
  model?: string
) {
  try {
    console.log('Starting message analysis with Groq...');
    
    // Determine if web search is needed
    const needsWebSearch = message.toLowerCase().includes('news') || 
                          message.toLowerCase().includes('current') ||
                          message.toLowerCase().includes('latest') ||
                          message.toLowerCase().includes('trending') ||
                          message.toLowerCase().includes('today');
    
    let webSearchResults = [];
    if (needsWebSearch) {
      console.log('Performing web search for current information...');
      webSearchResults = await performWebSearch(message);
    }
    
    // Build comprehensive context with web search results
    const context = buildComprehensiveContext(userData, agentMemory, marketData, webSearchResults);
    
    // Build conversation history with memory
    const conversationHistory = messageHistory.slice(-6).map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const systemPrompt = `You are an advanced AI Financial Advisor with complete access to the user's financial data, real-time market intelligence, web search capabilities, and persistent memory. You are designed to be helpful, accurate, and actionable.

CORE CAPABILITIES:
- Complete financial portfolio analysis and management
- Real-time market data analysis and recommendations  
- Web search for current financial news and trends
- Personalized investment advice based on user's specific situation
- Financial goal planning and progress tracking
- Debt management and optimization strategies
- Income and expense stream management
- Multi-currency support and conversion
- Persistent memory of user preferences and interactions

ENHANCED TOOLS AVAILABLE:
- Live market data for stocks, crypto, bonds, ETFs, and real estate
- Web search for current financial news and market trends
- User memory system for personalized interactions
- Portfolio analysis and optimization tools
- Risk assessment and recommendation engines

CURRENT USER CONTEXT:
${context}

INTERACTION GUIDELINES:
1. Always provide specific, actionable advice based on the user's actual financial data
2. Use web search results to provide current, relevant information
3. Reference real market data when making investment recommendations
4. Remember user preferences and past interactions from memory
5. Be conversational but professional
6. Ask clarifying questions when needed
7. Provide concrete next steps with tools and capabilities
8. Use the user's preferred currency for all amounts
9. Consider their risk tolerance and financial goals
10. Explain your reasoning clearly with supporting data

RESPONSE FORMAT:
- Provide clear, well-structured responses
- Use bullet points for lists and recommendations
- Include specific numbers and calculations when relevant
- Highlight important insights or warnings
- Reference web search results when applicable
- End with actionable next steps when appropriate
- Show how you're using available tools and data

Remember: You have access to live market data, web search, and user memory - use these tools to provide the most current, personalized, and relevant advice possible.`;

    const userPrompt = `User message: "${message}"

Please analyze this message in the context of the user's complete financial situation, current market conditions, and any relevant web search results. Use all available tools and data to provide a comprehensive, personalized response with specific recommendations and actionable advice.

${webSearchResults.length > 0 ? `\nWeb search results: ${JSON.stringify(webSearchResults, null, 2)}` : ''}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: userPrompt }
    ];

    console.log('Sending request to Groq API...');
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model || 'llama-3.3-70b-versatile', // Using Groq's compound model
          messages: messages,
          max_tokens: 2000,
          temperature: 0.7,
          top_p: 0.9,
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Groq API error response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorText
        });
        
        // Handle specific error codes
        if (response.status === 429) {
          throw new Error('API rate limit exceeded. Please try again in a moment.');
        } else if (response.status === 401) {
          throw new Error('API authentication failed. Please check configuration.');
        } else if (response.status === 402) {
          throw new Error('API quota exceeded. Please check your billing status.');
        } else if (response.status >= 500) {
          throw new Error('API service temporarily unavailable. Please try again later.');
        } else {
          throw new Error(`API error (${response.status}): ${errorText}`);
        }
      }

      const data = await response.json();
      console.log('Groq API response received');

      const analysis = data.choices[0]?.message?.content || 'I apologize, but I could not generate a response at this time.';

      // Store web search context in memory for future reference
      if (webSearchResults.length > 0) {
        await updateAgentMemory(userData.userProfile?.user_id, {
          last_web_search: {
            query: message,
            results: webSearchResults,
            timestamp: new Date().toISOString()
          }
        });
      }

      return { analysis };
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('Error during Groq API call:', fetchError);
      throw fetchError;
    }

  } catch (error) {
    console.error('Error in analyzeUserMessage:', error);
    throw error;
  }
}

// Build comprehensive context for the AI with web search results
function buildComprehensiveContext(userData: any, agentMemory: any, marketData: MarketDataSummary, webSearchResults: any[] = []): string {
  const { finances, goals, assets, debts, incomeStreams, expenseStreams, deposits, portfolios, userProfile, metrics, userCurrency, formatCurrency } = userData;

  let context = `USER FINANCIAL PROFILE:
Currency: ${userCurrency}
Net Worth: ${formatCurrency(metrics.netWorth)}
Monthly Income: ${formatCurrency(finances.monthly_income)}
Monthly Expenses: ${formatCurrency(finances.monthly_expenses)}
Net Savings: ${formatCurrency(finances.net_savings)}
Monthly Investing: ${formatCurrency(finances.monthly_investing_amount)}
Debt-to-Income Ratio: ${metrics.debtToIncomeRatio.toFixed(1)}%
Savings Rate: ${metrics.savingsRate.toFixed(1)}%

PORTFOLIO OVERVIEW:
Total Portfolio Value: ${formatCurrency(metrics.totalPortfolioValue)}
Total Investment: ${formatCurrency(metrics.totalInvestment)}
Portfolio Return: ${metrics.portfolioReturn.toFixed(2)}%
Number of Assets: ${assets.length}

ASSETS BREAKDOWN:`;

  if (assets.length > 0) {
    assets.slice(0, 10).forEach(asset => {
      const currentValue = (asset.current_price || asset.purchase_price || 0) * (asset.quantity || 1);
      const purchaseValue = (asset.purchase_price || 0) * (asset.quantity || 1);
      const returnPct = purchaseValue > 0 ? ((currentValue - purchaseValue) / purchaseValue * 100).toFixed(2) : '0.00';
      context += `\n- ${asset.asset_name} (${asset.asset_type}): ${asset.quantity || 1} shares, Current Value: ${formatCurrency(currentValue)}, Return: ${returnPct}%`;
    });
  } else {
    context += '\n- No assets currently tracked';
  }

  context += `\n\nFINANCIAL GOALS:`;
  if (goals.length > 0) {
    goals.slice(0, 5).forEach(goal => {
      const progress = goal.target_amount > 0 ? ((goal.current_amount / goal.target_amount) * 100).toFixed(1) : '0.0';
      context += `\n- ${goal.title}: ${formatCurrency(goal.current_amount)} / ${formatCurrency(goal.target_amount)} (${progress}%)`;
    });
  } else {
    context += '\n- No financial goals set';
  }

  context += `\n\nDEBTS:`;
  if (debts.length > 0) {
    debts.forEach(debt => {
      const remaining = debt.total_amount - debt.paid_amount;
      context += `\n- ${debt.debt_name}: ${formatCurrency(remaining)} remaining, ${formatCurrency(debt.monthly_payment)}/month`;
    });
    context += `\nTotal Debt: ${formatCurrency(metrics.totalDebt)}`;
    context += `\nMonthly Debt Payments: ${formatCurrency(metrics.monthlyDebtPayments)}`;
  } else {
    context += '\n- No debts tracked';
  }

  context += `\n\nSAVINGS & DEPOSITS:`;
  if (deposits.length > 0) {
    deposits.slice(0, 5).forEach(deposit => {
      const totalValue = deposit.principal + deposit.accrued_interest;
      context += `\n- ${deposit.bank_name} ${deposit.product_type}: ${formatCurrency(totalValue)} (${deposit.interest_rate}% APY)`;
    });
    context += `\nTotal Savings: ${formatCurrency(metrics.totalSavings)}`;
    context += `\nTotal Interest Accrued: ${formatCurrency(metrics.totalInterestAccrued)}`;
  } else {
    context += '\n- No savings deposits tracked';
  }

  context += `\n\nINCOME STREAMS:`;
  if (incomeStreams.length > 0) {
    incomeStreams.forEach(stream => {
      context += `\n- ${stream.source_name}: ${formatCurrency(stream.monthly_amount)}/month (${stream.income_type})`;
    });
  } else {
    context += '\n- Primary income only';
  }

  context += `\n\nEXPENSE STREAMS:`;
  if (expenseStreams.length > 0) {
    expenseStreams.slice(0, 5).forEach(stream => {
      context += `\n- ${stream.expense_name}: ${formatCurrency(stream.monthly_amount)}/month (${stream.expense_type})`;
    });
  } else {
    context += '\n- Basic expenses only';
  }

  // Add market data context
  context += `\n\nCURRENT MARKET CONDITIONS:
Stocks Available: ${marketData.stocks.total} (${marketData.stocks.countries.length} countries)
Top Stock Performers Today: ${marketData.stocks.top_performers.slice(0, 3).map(s => `${s.symbol} (+${s.change_percent?.toFixed(2)}%)`).join(', ')}
Crypto Available: ${marketData.crypto.total} currencies
Top Crypto by Market Cap: ${marketData.crypto.top_by_market_cap.slice(0, 3).map(c => `${c.symbol} ($${(c.market_cap / 1e9).toFixed(1)}B)`).join(', ')}
Average Bond Yield: ${marketData.bonds.avg_yield?.toFixed(2)}%
Gold Price (24K): $${marketData.gold_prices.current_24k}/oz (${marketData.gold_prices.trend})
Real Estate Markets: ${marketData.real_estate.cities.length} cities tracked
Bank Products: ${marketData.bank_products.total} products, Best Rate: ${marketData.bank_products.best_rates[0]?.interest_rate?.toFixed(2)}%`;

  // Add agent memory if available
  if (agentMemory?.memory) {
    context += `\n\nPREVIOUS INTERACTIONS:`;
    if (agentMemory.memory.last_interaction) {
      context += `\nLast discussed: ${agentMemory.memory.last_interaction.user_message}`;
    }
    if (agentMemory.memory.preferences) {
      context += `\nUser preferences: ${JSON.stringify(agentMemory.memory.preferences)}`;
    }
    if (agentMemory.memory.last_web_search) {
      context += `\nLast web search: ${agentMemory.memory.last_web_search.query} at ${agentMemory.memory.last_web_search.timestamp}`;
    }
  }

  // Add web search results if available
  if (webSearchResults.length > 0) {
    context += `\n\nCURRENT WEB SEARCH RESULTS:`;
    webSearchResults.forEach((result, index) => {
      context += `\n${index + 1}. ${result.title}: ${result.snippet}`;
    });
  }

  return context;
}
