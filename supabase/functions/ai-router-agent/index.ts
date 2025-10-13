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
        content: `You are a financial query classifier. Analyze the query and return ONLY a JSON object.

CRITICAL ARABIC TERM DETECTION:
- If query contains "صناديق" or "صندوق" → type MUST be "product_research", toolsNeeded MUST include "web_search"
- If query contains "شهادات" or "شهادة" → type MUST be "product_research", toolsNeeded MUST include "web_search"  
- If query contains "وديعة" or "ودائع" → type MUST be "product_research", toolsNeeded MUST include "web_search"
- If query contains "استثمار" with "بنك" → type MUST be "product_research", toolsNeeded MUST include "web_search"
- If query contains "fund" or "funds" or "mutual fund" → type MUST be "product_research", toolsNeeded MUST include "web_search"
- If query asks about "أخبار" or "news" ONLY → type is "news_analysis", use "egyptian_news" tool

QUERY TYPES:
- greeting: Simple greetings only
- quick_value: Direct price/value questions (gold price, USD rate, stock price)
- product_research: Bank products, funds, certificates, investment products
- investment_advice: General investment strategy, asset allocation
- news_analysis: News summaries, market news (NOT product research)
- portfolio_analysis: User's holdings analysis
- market_research: Company/economic research
- general_financial: General advice

CONTEXT: personal_finances, debts, assets, goals, income, expenses, deposits, news, bank, fund, etf

RESPONSE TYPES: brief, value, medium, detailed

TOOLS:
- web_search: For Egyptian bank products, funds, certificates, company research
- egyptian_news: For Egyptian market NEWS only (NOT for product research)
- portfolio_analysis: User portfolio insights
- goal_planning: Financial planning
- risk_analysis: Risk assessment

Return ONLY this JSON:
{
  "type": "query_type",
  "context": ["context1", "context2"],
  "priority": "high|medium|low",
  "responseType": "brief|value|medium|detailed",
  "toolsNeeded": ["tool1"]
}

Examples:
- "صناديق الاستثمار في الأسهم" → {"type":"product_research","context":["bank","fund","assets"],"priority":"high","responseType":"detailed","toolsNeeded":["web_search"]}
- "صناديق الاستثمار البنوك المصرية" → {"type":"product_research","context":["bank","fund"],"priority":"high","responseType":"detailed","toolsNeeded":["web_search"]}
- "شهادات استثمار 18%" → {"type":"product_research","context":["bank"],"priority":"high","responseType":"detailed","toolsNeeded":["web_search"]}
- "أخبار البورصة المصرية" → {"type":"news_analysis","context":["news"],"priority":"medium","responseType":"medium","toolsNeeded":["egyptian_news"]}
- "سعر الذهب" → {"type":"quick_value","context":["gold"],"priority":"low","responseType":"value","toolsNeeded":[]}
- "USD to EGP" → {"type":"quick_value","context":["currency"],"priority":"low","responseType":"value","toolsNeeded":[]}`
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

    // Fetch Egyptian gold prices with Arabic names
    const { data: egyptianGoldPrices } = await supabase
      .from('egyptian_gold_prices')
      .select('*')
      .order('scraped_at', { ascending: false })
      .limit(15);
    
    if (egyptianGoldPrices && egyptianGoldPrices.length > 0) {
      marketData.egyptian_gold_prices = egyptianGoldPrices;
      console.log(`Fetched ${egyptianGoldPrices.length} Egyptian gold prices with Arabic names`);
    }
    
    // Also fetch general gold prices - try country-specific first, then fallback
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
      
      // Also fetch real estate prices (neighborhood-level data)
      const { data: realEstatePrices } = await supabase
        .from('real_estate_prices')
        .select('*')
        .order('last_updated', { ascending: false })
        .limit(50);
      
      if (realEstatePrices && realEstatePrices.length > 0) {
        marketData.real_estate_prices = realEstatePrices;
        console.log(`Fetched ${realEstatePrices.length} real estate neighborhood prices`);
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

    // Fetch Egyptian funds with Arabic names
    if (context.includes('fund') || context.includes('etf') || context.includes('صناديق')) {
      const { data: egyptianFunds } = await supabase
        .from('egyptian_funds')
        .select('*')
        .order('last_price', { ascending: false })
        .limit(30);
      
      if (egyptianFunds && egyptianFunds.length > 0) {
        marketData.egyptian_funds = egyptianFunds;
        console.log(`Fetched ${egyptianFunds.length} Egyptian funds with Arabic names`);
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
              const messageLower = message.toLowerCase();
              const isArabic = /[\u0600-\u06FF]/.test(message);
              
              // Detect Egyptian banking product queries
              const isBankProduct = messageLower.includes('صناد') || messageLower.includes('شهاد') || 
                                   messageLower.includes('وديع') || messageLower.includes('bank fund') ||
                                   messageLower.includes('صندوق') || messageLower.includes('certificate');
              
              // Detect general news/events queries
              const isGeneralNews = messageLower.includes('news') && 
                                   !messageLower.includes('market') &&
                                   !messageLower.includes('stock') &&
                                   !messageLower.includes('price');
              
              // Build primary search query based on query type
              let primaryQuery = '';
              
              if (isBankProduct) {
                // Egyptian bank product research - use Arabic and English terms
                if (isArabic) {
                  primaryQuery = `${message} مصر البنوك 2024`;
                  searchQueries.push(`صناديق الاستثمار البنوك المصرية 2024`);
                  searchQueries.push(`أفضل صناديق الأسهم مصر`);
                } else {
                  primaryQuery = `${message} Egypt banks 2024`;
                  searchQueries.push(`Egyptian bank investment funds stock funds 2024`);
                  searchQueries.push(`best mutual funds Egypt banks`);
                }
              } else if (isGeneralNews) {
                primaryQuery = `${message} ${userCountry} latest updates`;
              } else {
                primaryQuery = `${message} financial market analysis investment ${userCountry} ${userCurrency}`;
              }
              
              searchQueries.unshift(primaryQuery);
              
              // Additional specific searches based on keywords
              if (messageLower.includes('stock') || messageLower.includes('سهم') || messageLower.includes('equity')) {
                searchQueries.push(`stock market trends ${userCountry} latest analysis`);
              }
              if (messageLower.includes('crypto') || messageLower.includes('bitcoin')) {
                searchQueries.push(`cryptocurrency market analysis ${userCountry} regulation`);
              }
              if (messageLower.includes('real estate') || messageLower.includes('property') || messageLower.includes('عقار')) {
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
                
                // Log search results for debugging
                console.log('Web search results:', JSON.stringify(uniqueResults.map(r => ({
                  title: r.title,
                  url: r.link,
                  source: r.source
                })), null, 2));
                
                // Scrape actual content from top 2-3 results for news queries
                const isNewsQuery = message.toLowerCase().includes('news') || 
                                   message.toLowerCase().includes('latest') ||
                                   classification.type === 'news_analysis';
                
                if (isNewsQuery && uniqueResults.length > 0) {
                  const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
                  if (firecrawlApiKey) {
                    console.log('Scraping article content with Firecrawl...');
                    const scrapedContent: any[] = [];
                    
                    // Scrape top 2 results
                    for (const result of uniqueResults.slice(0, 2)) {
                      try {
                        const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${firecrawlApiKey}`,
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            url: result.link,
                            formats: ['markdown'],
                            onlyMainContent: true,
                            waitFor: 2000
                          })
                        });
                        
                        if (scrapeResponse.ok) {
                          const scrapeData = await scrapeResponse.json();
                          if (scrapeData.data?.markdown) {
                            // Get first 2000 characters of content
                            const content = scrapeData.data.markdown.substring(0, 2000);
                            scrapedContent.push({
                              title: result.title,
                              url: result.link,
                              content: content,
                              snippet: result.snippet
                            });
                            console.log(`Scraped content from: ${result.link}`);
                          }
                        }
                      } catch (scrapeError) {
                        console.error(`Failed to scrape ${result.link}:`, scrapeError);
                      }
                    }
                    
                    // Add scraped content to results
                    if (scrapedContent.length > 0) {
                      uniqueResults.forEach((result: any) => {
                        const scraped = scrapedContent.find(s => s.url === result.link);
                        if (scraped) {
                          result.fullContent = scraped.content;
                        }
                      });
                      console.log(`Successfully scraped ${scrapedContent.length} articles`);
                    }
                  }
                }
                
                // Extract key insights and topics
                const keyInsights = uniqueResults.map(item => 
                  item.fullContent ? `${item.title}:\n${item.fullContent.substring(0, 500)}...` : `${item.title}: ${item.snippet}`
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
                  summary: `Found ${uniqueResults.length} comprehensive insights${uniqueTopics.length > 0 ? ` covering ${uniqueTopics.join(', ')}` : ''}`,
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
    
    // Egyptian gold prices with Arabic names
    if ((lowerQuery.includes('gold') || lowerQuery.includes('ذهب')) && data.egyptian_gold_prices) {
      summary += `\n🔸 EGYPTIAN GOLD PRICES (أسعار الذهب المصري):\n`;
      data.egyptian_gold_prices.slice(0, 5).forEach((g: any) => {
        summary += `- ${g.product_name} (${g.karat}): ${g.price_egp} EGP`;
        if (g.buy_price && g.sell_price) {
          summary += ` | Buy: ${g.buy_price} EGP, Sell: ${g.sell_price} EGP`;
        }
        summary += `\n`;
      });
    }
    
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
    
    // Egyptian investment funds with Arabic names
    if ((lowerQuery.includes('fund') || lowerQuery.includes('صناديق') || lowerQuery.includes('صندوق')) && data.egyptian_funds) {
      summary += `\n🔸 EGYPTIAN INVESTMENT FUNDS (صناديق الاستثمار المصرية):\n`;
      data.egyptian_funds.slice(0, 10).forEach((f: any) => {
        summary += `- ${f.fund_name} | ${f.issuer}: ${f.last_price} EGP`;
        if (f.ytd_return) summary += ` | YTD: ${f.ytd_return}%`;
        if (f.one_year_return) summary += ` | 1Y: ${f.one_year_return}%`;
        if (f.category) summary += ` | ${f.category}`;
        if (f.risk_level) summary += ` | Risk: ${f.risk_level}`;
        summary += `\n`;
      });
    }
    
    // Real estate - if query mentions real estate/property
    if ((lowerQuery.includes('real estate') || lowerQuery.includes('property') || lowerQuery.includes('عقار')) && data.real_estate) {
      summary += `\n🔸 REAL ESTATE (${userCountry}):\n`;
      data.real_estate.slice(0, 3).forEach((r: any) => {
        summary += `- ${r.property_type} in ${r.area_name}, ${r.city}: ${r.price_per_sqm} ${r.currency}/sqm\n`;
      });
    }
    
    // Real estate prices (neighborhood-level) - if query mentions specific areas
    if ((lowerQuery.includes('real estate') || lowerQuery.includes('property') || lowerQuery.includes('neighborhood') || 
         lowerQuery.includes('zamalek') || lowerQuery.includes('maadi') || lowerQuery.includes('heliopolis') || 
         lowerQuery.includes('عقار') || lowerQuery.includes('حي')) && data.real_estate_prices) {
      summary += `\n🔸 REAL ESTATE PRICES (Neighborhoods):\n`;
      
      // Filter by neighborhood if specific area mentioned
      let filteredPrices = data.real_estate_prices;
      const areaKeywords = ['zamalek', 'maadi', 'heliopolis', 'new cairo', 'nasr city', 'dokki', 'mohandessin'];
      const mentionedArea = areaKeywords.find(area => lowerQuery.includes(area));
      
      if (mentionedArea) {
        filteredPrices = data.real_estate_prices.filter((p: any) => 
          p.neighborhood_name?.toLowerCase().includes(mentionedArea) ||
          p.neighborhood_slug?.toLowerCase().includes(mentionedArea)
        );
      }
      
      filteredPrices.slice(0, 5).forEach((p: any) => {
        summary += `- ${p.neighborhood_name}, ${p.city_name}: ${p.price_per_meter} ${p.currency}/sqm (${p.property_type})\n`;
      });
      
      console.log(`Real estate prices summary: Found ${filteredPrices.length} neighborhoods`);
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
  
  let systemPrompt = `You are a professional financial analyst and advisor for ${userCountry} markets, specializing in ${userCurrency} currency. Provide clear, evidence-based analysis with proper source citations.

USER PROFILE:
Name: ${userData.profile?.full_name || 'Unknown'}
Job: ${userData.profile?.job || 'Not specified'}

Context: ${userCountry} | ${userCurrency} | Query: ${classification.type}

DATABASE MARKET DATA:${marketDataSummary || '\nNo relevant market data available for this query.'}

🔸 DATA EXTRACTION RULES:
1. Use EXACT values from database - NO calculations or modifications EXCEPT for rule 9
2. Always include currency (EGP, USD, SAR, AED, etc.)
3. Cite date when available (e.g., "As of 2025-09-24...")
4. Format: "[Asset] is [price] [currency], [+/-]X% [timeframe]"
5. If data missing: state "Data not currently available"
6. NEVER make up prices or data
7. For ETFs: Use the "price" field (NOT nav) - extract the COMPLETE number including all digits before and after the decimal point (e.g., "26.06" NOT ".06")
8. For GOLD: The price_per_gram field contains the full price (e.g., "5070.00" NOT "21.62"). Extract ALL digits as shown in the data.
9. For REAL ESTATE: When user asks for a specific area size (e.g., "100 meters", "150 sqm"), CALCULATE the TOTAL PRICE by multiplying price_per_meter by the area. Example: If price is 65442 EGP/sqm and user asks for 100 meters, respond "A 100 sqm unit in El Zamalek costs 6,544,200 EGP (6.54 million EGP)"

📋 PROFESSIONAL RESPONSE FORMAT:

Write in a clear narrative style with these sections:

**Current Situation**
Brief overview of what's happening (2-3 sentences)

**Key Findings**  
Present specific data and facts from your research. For EVERY factual claim about current events or news:
- YOU MUST cite the source using this EXACT format: [SOURCE:Title|URL]
- Place the source tag immediately after the fact
- Example: "Egypt's GDP grew by 3.2% in Q4 2024 [SOURCE:World Bank Report|https://worldbank.org/report], showing recovery in the tourism sector."
- Use real data from the toolResults.web_search.results array provided
- Each result has: title, link, snippet, source

CRITICAL SOURCE CITATION REQUIREMENTS:
${toolResults.web_search ? `
YOU HAVE THESE SEARCH RESULTS - USE THEM:
${JSON.stringify(toolResults.web_search.results.map((r: any) => ({
  title: r.title,
  url: r.link,
  snippet: r.snippet
})), null, 2)}

MANDATORY RULES:
1. ONLY cite information found in these actual search results above
2. Use EXACT URLs from the results - DO NOT modify or fabricate URLs
3. If these results don't answer the user's question, SAY SO - don't make up information
4. Format: [SOURCE:Exact Title|Exact URL from above]
5. DO NOT cite https://worldbank.org/q4 or any shortened/fabricated URL
` : 'No search results available - acknowledge you cannot provide current news without sources'}

**Analysis**
Connect the findings to the user's financial situation:
- Reference user's actual portfolio data when relevant (from toolResults.portfolio_analysis)
- Explain implications for their currency (${userCurrency})
- Discuss market impacts on their assets/goals

**Recommendation**
Provide clear guidance on actions to take (or not take):
- Be specific about what to do and when
- Explain the reasoning based on the data
- Include risk considerations

🚨 SOURCE CITATION EXAMPLES:

From web_search results like:
{
  "title": "Gaza Conflict Economic Impact Report",
  "link": "https://example.com/report",
  "snippet": "Analysis shows regional impact..."
}

Write: "The conflict has impacted regional trade [SOURCE:Gaza Conflict Economic Impact Report|https://example.com/report], with shipping routes affected."

MULTIPLE SOURCES:
"Tourism declined 15% in Q4 [SOURCE:World Bank Report|https://worldbank.org/q4], while foreign investment dropped 8% [SOURCE:IMF Analysis|https://imf.org/egypt]."

🚨 MANDATORY RULES:
- If toolResults.web_search exists and has results, you MUST cite at least 2-3 sources from it
- Use the EXACT format [SOURCE:Title|URL] - no other format is acceptable
- Sources MUST come from toolResults.web_search.results - do NOT make up sources
- If no web_search results provided, state "Based on market data analysis" instead
- Never present research findings without proper attribution`;



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
- Debts: ${userData.debts?.length || 0} debts
${userData.debts && userData.debts.length > 0 ? '\n\nDEBT DETAILS:\n' + userData.debts.map((debt: any) => 
  `• ${debt.name}: Total ${debt.total_amount} ${userCurrency}, Paid ${debt.paid_amount} ${userCurrency}, Remaining ${debt.total_amount - debt.paid_amount} ${userCurrency}, Monthly Payment ${debt.monthly_payment} ${userCurrency}, Interest Rate ${debt.interest_rate}%`
).join('\n') : ''}`;

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
    const { message, userId, chatId } = await req.json();
    
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
      { data: profile },
      { data: personalFinances },
      { data: assets },
      { data: debts },
      { data: incomeStreams },
      { data: expenseStreams },
      { data: deposits },
      { data: goals },
      { data: userSettings }
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
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
      profile: profile,
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

    // Save messages to chat history if chatId is provided
    if (chatId) {
      try {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // Save user message
        await supabaseClient.from('chat_messages').insert({
          chat_id: chatId,
          user_id: userId,
          role: 'user',
          content: message,
        });

        // Save assistant response
        await supabaseClient.from('chat_messages').insert({
          chat_id: chatId,
          user_id: userId,
          role: 'assistant',
          content: response,
        });

        console.log('Messages saved to chat history');
      } catch (saveError) {
        console.error('Error saving messages to history:', saveError);
        // Don't fail the request if saving history fails
      }
    }

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