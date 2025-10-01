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
- quick_value: Asking for specific numbers (income, net worth, balance, gold prices, currency rates, stock prices)
- portfolio_analysis: Holdings, performance, diversification questions
- debt_management: Debt strategy, payments, consolidation questions  
- investment_advice: Buying/selling, asset allocation recommendations
- news_analysis: Market news impact on portfolio, latest news requests
- goal_tracking: Financial goals progress and planning
- expense_analysis: Spending patterns, budgeting advice
- income_optimization: Income strategies, tax efficiency
- market_research: Market trends, economic analysis, company/industry information
- risk_assessment: Risk evaluation, insurance planning
- general_financial: General financial advice and education

CONTEXT TYPES: personal_finances, debts, assets, goals, income, expenses, deposits, news

RESPONSE TYPES:
- brief: Short greeting or simple answer (50-100 tokens)
- value: Just return a number/value with minimal context (20-50 tokens)  
- medium: Focused analysis with key points (300-500 tokens)
- detailed: Comprehensive analysis with full insights (800-1500 tokens)

TOOLS NEEDED:
- web_search: ONLY for market research about companies, investment opportunities, economic trends that are NOT in our database
- egyptian_news: For Egyptian stock market news specifically
- portfolio_analysis: For detailed portfolio insights and recommendations
- goal_planning: For long-term financial planning and projections
- risk_analysis: For risk assessment and insurance planning

CRITICAL TOOL RULES:
- DO NOT use web_search for: gold prices, currency rates, stock prices, indices - these are in our database
- ONLY use web_search for: company research, economic analysis, investment opportunities not in database
- For queries about "gold price", "currency rate", "stock price", "EGX index" → toolsNeeded: []

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
- "24 karat gold price" → {"type":"quick_value","context":["assets","gold"],"priority":"low","responseType":"value","toolsNeeded":[]}
- "ETF EGX30 price" → {"type":"quick_value","context":["assets","EGX30","etf"],"priority":"low","responseType":"value","toolsNeeded":[]}
- "USD to EGP rate" → {"type":"quick_value","context":["assets","currency"],"priority":"low","responseType":"value","toolsNeeded":[]}
- "Egyptian stock market news" → {"type":"news_analysis","context":["news"],"priority":"medium","responseType":"medium","toolsNeeded":["egyptian_news"]}
- "Apple stock information" → {"type":"market_research","context":["news"],"priority":"medium","responseType":"medium","toolsNeeded":["web_search"]}
- "How should I invest $10k?" → {"type":"investment_advice","context":["personal_finances","assets"],"priority":"high","responseType":"detailed","toolsNeeded":["portfolio_analysis"]}`
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

// Helper function to fetch market data from Supabase
async function fetchMarketData(classification: any, userCountry: string) {
  const marketData: Record<string, any> = {};
  const context = classification.context || [];
  
  // Map country to currency code
  const countryCurrencyMap: Record<string, string> = {
    'Egypt': 'EGP',
    'Saudi Arabia': 'SAR',
    'UAE': 'AED',
    'Kuwait': 'KWD',
    'Bahrain': 'BHD',
    'Oman': 'OMR',
    'Qatar': 'QAR',
    'Jordan': 'JOD',
    'Lebanon': 'LBP'
  };
  const userCurrencyCode = countryCurrencyMap[userCountry] || 'EGP';
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials for market data');
      return marketData;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch Egyptian stocks
    if (context.includes('assets') || context.includes('news') || classification.type === 'market_research') {
      const { data: egyptStocks } = await supabase
        .from('egypt_stocks')
        .select('*')
        .order('market_cap', { ascending: false })
        .limit(15);
      
      if (egyptStocks && egyptStocks.length > 0) {
        marketData.egypt_stocks = egyptStocks;
      }

      // Fetch Saudi stocks
      const { data: saudiStocks } = await supabase
        .from('saudi_stocks')
        .select('*')
        .order('market_cap', { ascending: false })
        .limit(15);
      
      if (saudiStocks && saudiStocks.length > 0) {
        marketData.saudi_stocks = saudiStocks;
      }

      // Fetch UAE stocks
      const { data: uaeStocks } = await supabase
        .from('uae_stocks')
        .select('*')
        .order('market_cap', { ascending: false })
        .limit(15);
      
      if (uaeStocks && uaeStocks.length > 0) {
        marketData.uae_stocks = uaeStocks;
      }
    }

    // Fetch gold prices - try country-specific first, then fallback
    let goldPricesData = null;
    
    // Try exact country match first
    const { data: countryGold } = await supabase
      .from('gold_prices')
      .select('*')
      .ilike('country', `%${userCountry}%`)
      .order('last_updated', { ascending: false });
    
    if (countryGold && countryGold.length > 0) {
      goldPricesData = countryGold;
      console.log(`Fetched ${countryGold.length} gold prices for ${userCountry} (exact match)`);
    } else {
      // Fallback to all gold prices and let AI filter
      const { data: allGold } = await supabase
        .from('gold_prices')
        .select('*')
        .order('last_updated', { ascending: false })
        .limit(30);
      
      if (allGold && allGold.length > 0) {
        goldPricesData = allGold;
        console.log(`Fetched ${allGold.length} gold prices (all countries). Available countries:`, 
          [...new Set(allGold.map((g: any) => g.country))]);
      }
    }
    
    if (goldPricesData) {
      marketData.gold_prices = goldPricesData;
    }

    // Fetch currency rates - prioritize USD and user's local currency
    const { data: currencyRates } = await supabase
      .from('currency_rates')
      .select('*')
      .or(`base_currency.eq.USD,target_currency.eq.USD,base_currency.eq.${userCurrencyCode},target_currency.eq.${userCurrencyCode}`)
      .order('last_updated', { ascending: false })
      .limit(50);
    
    if (currencyRates && currencyRates.length > 0) {
      marketData.currency_rates = currencyRates;
    }

    // Fetch cryptocurrencies
    if (context.includes('crypto') || classification.type === 'market_research') {
      const { data: cryptos } = await supabase
        .from('cryptocurrencies')
        .select('*')
        .order('market_cap', { ascending: false })
        .limit(15);
      
      if (cryptos && cryptos.length > 0) {
        marketData.cryptocurrencies = cryptos;
      }
    }

    // Fetch international indices
    const { data: indices } = await supabase
      .from('international_indices')
      .select('*')
      .order('last_updated', { ascending: false })
      .limit(20);
    
    if (indices && indices.length > 0) {
      marketData.international_indices = indices;
    }

    // Fetch real estate data
    if (context.includes('real_estate') || context.includes('property')) {
      const { data: realEstate } = await supabase
        .from('real_estate')
        .select('*')
        .eq('country', userCountry)
        .limit(15);
      
      if (realEstate && realEstate.length > 0) {
        marketData.real_estate = realEstate;
      }
    }

    // Fetch ETFs - check case-insensitively
    const contextLower = context.map((c: string) => c.toLowerCase());
    console.log('Checking ETF fetch condition. Context:', context, 'Context lower:', contextLower);
    if (contextLower.some((c: string) => c.includes('etf') || c.includes('fund') || c.includes('egx'))) {
      console.log('Fetching ETFs...');
      const { data: etfs } = await supabase
        .from('etfs')
        .select('*')
        .order('market_cap', { ascending: false })
        .limit(15);
      
      if (etfs && etfs.length > 0) {
        console.log(`Fetched ${etfs.length} ETFs`);
        marketData.etfs = etfs;
      } else {
        console.log('No ETFs found in database');
      }
    } else {
      console.log('ETF fetch condition not met');
    }

    // Fetch bank products
    if (context.includes('bank') || context.includes('savings')) {
      const { data: bankProducts } = await supabase
        .from('bank_products')
        .select('*')
        .eq('is_active', true)
        .limit(15);
      
      if (bankProducts && bankProducts.length > 0) {
        marketData.bank_products = bankProducts;
      }
    }

    console.log('Market data fetched:', Object.keys(marketData));
  } catch (error) {
    console.error('Error fetching market data:', error);
  }

  return marketData;
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
          console.log('Performing enhanced web search...');
          try {
            const googleApiKey = Deno.env.get('GOOGLE_SEARCH_API_KEY');
            const searchEngineId = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID');
            
            if (googleApiKey && searchEngineId) {
              // Enhanced search queries for better results
              let searchQueries = [];
              
              // Primary search based on user message
              let primaryQuery = `${message} financial market analysis investment news ${userCountry} ${userCurrency}`;
              searchQueries.push(primaryQuery);
              
              // Additional specific searches based on keywords
              if (message.toLowerCase().includes('stock') || message.toLowerCase().includes('equity')) {
                searchQueries.push(`stock market trends ${userCountry} latest news analysis`);
              }
              if (message.toLowerCase().includes('crypto') || message.toLowerCase().includes('bitcoin')) {
                searchQueries.push(`cryptocurrency market analysis ${userCountry} regulation news`);
              }
              if (message.toLowerCase().includes('real estate') || message.toLowerCase().includes('property')) {
                searchQueries.push(`real estate market trends ${userCountry} property investment`);
              }
              
              const allResults: any[] = [];
              
              // Execute multiple searches for comprehensive results
              for (const query of searchQueries.slice(0, 2)) { // Limit to 2 searches to avoid rate limits
                const googleSearchUrl = `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&num=5&safe=active`;
                
                try {
                  const searchResponse = await fetch(googleSearchUrl);
                  
                  if (searchResponse.ok) {
                    const searchData = await searchResponse.json();
                    
                    if (searchData.items && searchData.items.length > 0) {
                      allResults.push(...searchData.items.map((item: any) => ({
                        title: item.title,
                        snippet: item.snippet,
                        link: item.link,
                        source: item.displayLink,
                        query: query
                      })));
                    }
                  }
                } catch (searchError) {
                  console.error('Individual search error:', searchError);
                }
              }
              
              if (allResults.length > 0) {
                // Remove duplicates and select best results
                const uniqueResults = allResults.filter((item, index, self) => 
                  index === self.findIndex(t => t.link === item.link)
                ).slice(0, 5);
                
                // Extract key insights and topics
                const keyInsights = uniqueResults.map(item => 
                  `${item.title}: ${item.snippet}`
                ).join('\n\n');
                
                const marketTopics = uniqueResults.map(item => {
                  const title = item.title.toLowerCase();
                  const snippet = item.snippet.toLowerCase();
                  const topics = [];
                  
                  if (title.includes('stock') || snippet.includes('stock')) topics.push('Stock Market');
                  if (title.includes('crypto') || snippet.includes('crypto')) topics.push('Cryptocurrency');
                  if (title.includes('real estate') || snippet.includes('property')) topics.push('Real Estate');
                  if (title.includes('bond') || snippet.includes('bond')) topics.push('Bonds');
                  if (title.includes('economy') || snippet.includes('economic')) topics.push('Economic Outlook');
                  
                  return topics;
                }).flat();
                
                const uniqueTopics = [...new Set(marketTopics)];
                
                toolResults.web_search = {
                  success: true,
                  results: uniqueResults,
                  summary: `Found ${uniqueResults.length} comprehensive market insights covering ${uniqueTopics.join(', ')}`,
                  key_insights: keyInsights,
                  market_topics: uniqueTopics,
                  sources: uniqueResults.map(item => item.source),
                  search_queries: searchQueries
                };
              } else {
                toolResults.web_search = {
                  success: false,
                  error: 'No relevant search results found',
                  message: `No current market information found for: ${message}`
                };
              }
            } else {
              toolResults.web_search = {
                success: false,
                error: 'Search API not configured',
                message: 'Web search service is not available - Google API credentials missing'
              };
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
          if (userData.assets && userData.assets.length > 0) {
            const assets = userData.assets.map((asset: any) => {
              const quantity = parseFloat(asset.quantity || 0);
              const currentPrice = parseFloat(asset.current_price || 0);
              const purchasePrice = parseFloat(asset.purchase_price || 0);
              
              const currentValue = currentPrice * quantity;
              const purchaseValue = purchasePrice * quantity;
              const gainLoss = currentValue - purchaseValue;
              const gainLossPercent = purchaseValue > 0 ? (gainLoss / purchaseValue) * 100 : 0;
              
              return {
                name: asset.asset_name,
                symbol: asset.symbol,
                type: asset.asset_type,
                country: asset.country,
                quantity: quantity,
                purchase_price: purchasePrice,
                current_price: currentPrice,
                current_value: parseFloat(currentValue.toFixed(2)),
                purchase_value: parseFloat(purchaseValue.toFixed(2)),
                gain_loss: parseFloat(gainLoss.toFixed(2)),
                gain_loss_percent: parseFloat(gainLossPercent.toFixed(2)),
                purchase_date: asset.purchase_date
              };
            });
            
            const totalValue = parseFloat(assets.reduce((sum: number, asset: any) => sum + asset.current_value, 0).toFixed(2));
            const totalPurchaseValue = parseFloat(assets.reduce((sum: number, asset: any) => sum + asset.purchase_value, 0).toFixed(2));
            const totalGainLoss = parseFloat((totalValue - totalPurchaseValue).toFixed(2));
            const totalGainLossPercent = totalPurchaseValue > 0 ? parseFloat(((totalGainLoss / totalPurchaseValue) * 100).toFixed(2)) : 0;
            
            toolResults.portfolio_analysis = {
              total_value: totalValue,
              total_purchase_value: totalPurchaseValue,
              total_gain_loss: totalGainLoss,
              total_gain_loss_percent: totalGainLossPercent,
              currency: userCurrency,
              asset_count: userData.assets.length,
              assets: assets,
              asset_types: [...new Set(assets.map((a: any) => a.type))],
              countries: [...new Set(assets.map((a: any) => a.country))],
              diversification: userData.assets.length > 1 ? "Diversified" : "Concentrated"
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

async function generateResponse(classification: any, userData: any, toolResults: any, marketData: any, groqApiKey: string) {
  console.log('Generating response for type:', classification.type);
  
  const userCountry = userData.personal_finances?.country || userData.user_country || 'Egypt';
  const userCurrency = userData.personal_finances?.currency || 'EGP';
  
  // Helper function to build compact market data summary based on query
  const buildMarketDataSummary = (query: string, data: any) => {
    const lowerQuery = query.toLowerCase();
    let summary = '';
    
    // Gold prices - only if query mentions gold
    if ((lowerQuery.includes('gold') || lowerQuery.includes('ذهب')) && data.gold_prices) {
      const goldData = data.gold_prices.filter((g: any) => 
        g.country.toLowerCase().includes(userCountry.toLowerCase())
      );
      summary += `\n🔸 GOLD PRICES (${userCountry}):\n`;
      goldData.slice(0, 4).forEach((g: any) => {
        summary += `- ${g.karat}K gold: ${g.price_per_gram} ${g.currency}/gram (updated: ${g.last_updated?.split('T')[0]})\n`;
      });
      console.log('Gold price summary sent to AI:', summary);
    }
    
    // Currency rates - only if query mentions currency/exchange/forex
    if ((lowerQuery.includes('currency') || lowerQuery.includes('exchange') || lowerQuery.includes('usd') || lowerQuery.includes('eur') || lowerQuery.includes('عملة') || lowerQuery.includes('dollar') || lowerQuery.includes('دولار')) && data.currency_rates) {
      summary += `\n🔸 CURRENCY RATES:\n`;
      let currencyData = data.currency_rates || [];
      console.log('Currency rates data fetched:', currencyData.length, 'rates');
      console.log('Sample currency pairs before filter:', currencyData.slice(0, 5).map((r: any) => `${r.base_currency}/${r.target_currency}`));
      
      // Filter for relevant currency pairs based on query
      if (lowerQuery.includes('dollar') || lowerQuery.includes('دولار') || lowerQuery.includes('usd')) {
        // Prioritize USD pairs, especially USD/EGP for Egyptian users
        const filteredData = currencyData.filter((r: any) => 
          r.base_currency === 'USD' || r.target_currency === 'USD'
        );
        console.log('USD rates found:', filteredData.length, 'out of', currencyData.length);
        if (filteredData.length > 0) {
          currencyData = filteredData.sort((a: any, b: any) => {
            // Put USD/EGP first
            if (a.base_currency === 'USD' && a.target_currency === 'EGP') return -1;
            if (b.base_currency === 'USD' && b.target_currency === 'EGP') return 1;
            if (a.base_currency === 'EGP' && a.target_currency === 'USD') return -1;
            if (b.base_currency === 'EGP' && b.target_currency === 'USD') return 1;
            return 0;
          });
        }
      }
      
      currencyData.slice(0, 10).forEach((r: any) => {
        summary += `- ${r.base_currency}/${r.target_currency}: ${r.exchange_rate} (updated: ${r.last_updated?.split('T')[0]})\n`;
      });
      console.log('Currency summary sent to AI:', summary.substring(summary.indexOf('CURRENCY RATES')));
    }
    
    // Egypt stocks - if query mentions stock/egx/egyptian company
    if ((lowerQuery.includes('stock') || lowerQuery.includes('egx') || lowerQuery.includes('سهم')) && data.egypt_stocks) {
      summary += `\n🔸 EGYPT STOCKS (Top 5):\n`;
      data.egypt_stocks.slice(0, 5).forEach((s: any) => {
        summary += `- ${s.name} (${s.symbol}): ${s.price} ${s.currency}, ${s.change_percent >= 0 ? '+' : ''}${s.change_percent}%\n`;
      });
    }
    
    // Saudi stocks - if query mentions saudi/tadawul
    if ((lowerQuery.includes('saudi') || lowerQuery.includes('tadawul') || lowerQuery.includes('سعودي')) && data.saudi_stocks) {
      summary += `\n🔸 SAUDI STOCKS (Top 3):\n`;
      data.saudi_stocks.slice(0, 3).forEach((s: any) => {
        summary += `- ${s.name} (${s.symbol}): ${s.price} SAR, ${s.change_percent >= 0 ? '+' : ''}${s.change_percent}%\n`;
      });
    }
    
    // UAE stocks - if query mentions uae/dubai/abu dhabi
    if ((lowerQuery.includes('uae') || lowerQuery.includes('dubai') || lowerQuery.includes('abu dhabi') || lowerQuery.includes('إمارات')) && data.uae_stocks) {
      summary += `\n🔸 UAE STOCKS (Top 3):\n`;
      data.uae_stocks.slice(0, 3).forEach((s: any) => {
        summary += `- ${s.name} (${s.symbol}): ${s.price} AED, ${s.change_percent >= 0 ? '+' : ''}${s.change_percent}%\n`;
      });
    }
    
    // Crypto - if query mentions crypto/bitcoin/ethereum
    if ((lowerQuery.includes('crypto') || lowerQuery.includes('bitcoin') || lowerQuery.includes('btc') || lowerQuery.includes('eth') || lowerQuery.includes('عملة رقمية')) && data.cryptocurrencies) {
      summary += `\n🔸 CRYPTOCURRENCIES (Top 5):\n`;
      data.cryptocurrencies.slice(0, 5).forEach((c: any) => {
        summary += `- ${c.name} (${c.symbol}): $${c.price_usd} (${c.price_egp} EGP), ${c.change_percentage_24h >= 0 ? '+' : ''}${c.change_percentage_24h}%\n`;
      });
    }
    
    // Indices - if query mentions index/s&p/nasdaq/dow
    if ((lowerQuery.includes('index') || lowerQuery.includes('indices') || lowerQuery.includes('s&p') || lowerQuery.includes('nasdaq') || lowerQuery.includes('مؤشر')) && data.international_indices) {
      summary += `\n🔸 MARKET INDICES (Top 5):\n`;
      data.international_indices.slice(0, 5).forEach((i: any) => {
        summary += `- ${i.name} (${i.country}): ${i.value} pts, ${i.change_percent >= 0 ? '+' : ''}${i.change_percent}%\n`;
      });
    }
    
    // ETFs - if query mentions etf/fund/egx
    if ((lowerQuery.includes('etf') || lowerQuery.includes('fund') || lowerQuery.includes('egx')) && data.etfs) {
      summary += `\n🔸 ETFs:\n`;
      data.etfs.slice(0, 3).forEach((e: any) => {
        const priceStr = Number(e.price).toFixed(2);
        const navStr = Number(e.nav).toFixed(2);
        const changeStr = e.change_percent >= 0 ? `+${Number(e.change_percent).toFixed(2)}` : Number(e.change_percent).toFixed(2);
        summary += `- ${e.name} (${e.symbol}): Price=${priceStr} EGP, NAV=${navStr}, Change=${changeStr}%\n`;
      });
    }
    
    // Real estate - if query mentions real estate/property
    if ((lowerQuery.includes('real estate') || lowerQuery.includes('property') || lowerQuery.includes('عقار')) && data.real_estate) {
      summary += `\n🔸 REAL ESTATE (${userCountry}):\n`;
      data.real_estate.slice(0, 3).forEach((r: any) => {
        summary += `- ${r.property_type} in ${r.area_name}, ${r.city}: ${r.price_per_sqm} ${r.currency}/sqm\n`;
      });
    }
    
    // Bank products - if query mentions bank/savings/deposit
    if ((lowerQuery.includes('bank') || lowerQuery.includes('savings') || lowerQuery.includes('deposit') || lowerQuery.includes('بنك')) && data.bank_products) {
      summary += `\n🔸 BANK PRODUCTS:\n`;
      data.bank_products.slice(0, 3).forEach((b: any) => {
        summary += `- ${b.bank_name} ${b.product_name}: ${b.interest_rate}% interest, min: ${b.minimum_amount} ${b.currency}\n`;
      });
    }
    
    return summary;
  };

  const marketDataSummary = buildMarketDataSummary(userData.originalMessage, marketData);
  
  let systemPrompt = `You are an expert financial advisor assistant with deep knowledge of ${userCountry} markets and ${userCurrency} currency. Provide helpful, accurate financial guidance.

Context: ${userCountry} | ${userCurrency} | Query: ${classification.type}

DATABASE MARKET DATA:${marketDataSummary || '\nNo relevant market data available for this query.'}

🔸 EXTRACTION RULES:
1. Use EXACT values from database - NO calculations or modifications
2. Always include currency (EGP, USD, SAR, AED, etc.)
3. Cite date when available (e.g., "As of 2025-09-24...")
4. Format: "[Asset] is [price] [currency], [+/-]X% [timeframe]"
5. If data missing: state "Data not currently available"
6. NEVER make up prices or data
7. For ETFs: Use the "price" field (NOT nav) - extract the COMPLETE number including all digits before and after the decimal point (e.g., "26.06" NOT ".06")
8. For GOLD: The price_per_gram field contains the full price (e.g., "5070.00" NOT "21.62"). Extract ALL digits as shown in the data.`;



  if (classification.responseType === 'brief') {
    systemPrompt += '\n\nKeep response under 100 words.';
  } else if (classification.responseType === 'value') {
    systemPrompt += '\n\nProvide just the specific value/number requested with minimal context.';
  } else if (classification.responseType === 'medium') {
    systemPrompt += '\n\nProvide 200-400 words with key insights and recommendations.';
  } else {
    systemPrompt += '\n\nProvide comprehensive 500-800 word analysis with detailed insights.';
  }

  systemPrompt += '\n\nCRITICAL: If you have web search data, NEVER include links, URLs, or source references. Extract and present only the factual information as a clean, professional answer.';

  // Add tool results context
  let toolContext = '';
  
  if (toolResults.egyptian_news?.success) {
    toolContext += `\n\nLATEST EGYPTIAN MARKET NEWS:\n${toolResults.egyptian_news.key_insights}`;
  }
  
  if (toolResults.web_search?.success) {
    toolContext += `\n\nCURRENT MARKET DATA FROM WEB SEARCH:
IMPORTANT: Use this information to ANSWER the user's question directly. Do NOT show links.

SEARCH FINDINGS TO ANALYZE:
${toolResults.web_search.results.map((r: any) => 
  `SOURCE: ${r.source}
TITLE: ${r.title}  
CONTENT: ${r.snippet}
---`
).join('\n')}

INSTRUCTION: Extract specific prices, trends, market data, or insights from the above content to provide a direct answer to the user's question about "${userData.originalMessage}". Present this as professional financial analysis, not as a list of search results.`;
  }
  
  if (toolResults.portfolio_analysis) {
    const portfolio = toolResults.portfolio_analysis;
    toolContext += `\n\nACTUAL PORTFOLIO DATA:
Total Portfolio Value: ${portfolio.total_value} ${userCurrency}
Total Purchase Value: ${portfolio.total_purchase_value} ${userCurrency}
Total Gain/Loss: ${portfolio.total_gain_loss} ${userCurrency} (${portfolio.total_gain_loss_percent?.toFixed(2)}%)
Asset Count: ${portfolio.asset_count}
Asset Types: ${portfolio.asset_types?.join(', ')}
Countries: ${portfolio.countries?.join(', ')}

INDIVIDUAL ASSETS (CALCULATION: Quantity × Current Price = Current Value):
${portfolio.assets?.map((asset: any) => 
  `- ${asset.name} (${asset.symbol}):
    * Asset Type: ${asset.type}
    * Country: ${asset.country}
    * Quantity: ${asset.quantity}
    * Current Price: ${asset.current_price} ${userCurrency} per unit
    * Current Value: ${asset.quantity} × ${asset.current_price} = ${asset.current_value} ${userCurrency}
    * Purchase Price: ${asset.purchase_price} ${userCurrency} per unit
    * Purchase Value: ${asset.quantity} × ${asset.purchase_price} = ${asset.purchase_value} ${userCurrency}
    * Gain/Loss: ${asset.gain_loss} ${userCurrency} (${asset.gain_loss_percent}%)
    * Purchase Date: ${asset.purchase_date}`
).join('\n\n') || 'No assets found'}

CRITICAL: These are the EXACT calculations. Do NOT recalculate or modify these numbers.`;
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

  console.log('Making Groq API call with:', {
    model: 'llama-3.1-8b-instant',
    messageCount: messages.length,
    systemPromptLength: messages[0].content.length
  });

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages,
      max_tokens: classification.responseType === 'brief' ? 150 : 
                   classification.responseType === 'value' ? 50 :
                   classification.responseType === 'medium' ? 500 : 800,
      temperature: 0.7
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Groq API error:', response.status, response.statusText, errorText);
    
    // Simple direct response based on query type
    if (classification.type === 'quick_value' && userData.originalMessage.toLowerCase().includes('income')) {
      const totalIncome = userData.income_streams?.reduce((sum: number, stream: any) => sum + (stream.amount || 0), 0) || 0;
      return `Your total monthly income is ${totalIncome} ${userCurrency}.`;
    }
    
    return `I apologize, but I'm experiencing technical difficulties. Let me try to help you directly: ${userData.originalMessage}`;
  }

  const data = await response.json();
  console.log('Groq API response success:', !!data.choices?.[0]?.message?.content);
  
  let finalResponse = 'I apologize, but I encountered an error processing your request.';
  
  if (data && data.choices && data.choices.length > 0 && data.choices[0].message) {
    finalResponse = data.choices[0].message.content || finalResponse;
    console.log('Groq returned response:', finalResponse);
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

    // Fetch market data from database
    const marketData = await fetchMarketData(classification, userData.user_country);
    console.log('Market data retrieved:', Object.keys(marketData));

    // Execute required tools
    const toolResults = await executeTools(classification.toolsNeeded || [], message, userData);
    console.log('Tool results:', Object.keys(toolResults));

    // Generate response
    const response = await generateResponse(classification, userData, toolResults, marketData, groqApiKey);

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