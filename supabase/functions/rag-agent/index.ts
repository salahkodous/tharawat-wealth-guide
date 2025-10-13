import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
const SCRAPERAPI_KEY = Deno.env.get('SCRAPERAPI_KEY');
const GOOGLE_SEARCH_API_KEY = Deno.env.get('GOOGLE_SEARCH_API_KEY');
const GOOGLE_SEARCH_ENGINE_ID = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

// Resolve context references before routing
async function resolveContextReferences(message: string, conversationHistory: any[]): Promise<string> {
  if (!conversationHistory || conversationHistory.length === 0) {
    return message;
  }

  // Check if query contains pronouns/references that need context
  const hasPronouns = /\b(it|that|this|them|its|those|these|he|she|they)\b/i.test(message);
  const hasRelativeTerms = /\b(average|price|cost|same|similar|better)\b/i.test(message);
  const arabicPronouns = /\b(ه|هذا|تلك|نفس|متوسط|سعر)\b/.test(message);
  
  if (!hasPronouns && !hasRelativeTerms && !arabicPronouns) {
    return message; // No context resolution needed
  }

  console.log('🔄 Resolving context references in query...');
  
  // Use LLM to expand the query with conversation context
  try {
    const contextMessages = conversationHistory.slice(-4); // Last 2 exchanges
    const contextSummary = contextMessages
      .map((msg: any) => `${msg.role}: ${msg.content}`)
      .join('\n');

    const resolutionResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{
          role: 'system',
          content: `You are a context resolver. Expand the user's query by replacing pronouns and implicit references with explicit terms from the conversation history.

CRITICAL RULES:
1. Replace "it", "this", "that", "them" with the actual subject from context
2. If asking about "average price" or "price of it", identify what "it" refers to
3. Keep the expanded query concise and search-friendly
4. Return ONLY the expanded query, nothing else
5. Maintain the original language (Arabic or English)

Examples:
- "average price of it" + context about fridges → "average price of refrigerators in Egypt"
- "متوسط سعره" + context about fridges → "متوسط سعر الثلاجات في مصر"
- "is it better to buy now or later" → keep as is (no pronoun to resolve)

CONVERSATION CONTEXT:
${contextSummary}

USER'S NEW QUERY: "${message}"

Return only the expanded query:`
        }],
        temperature: 0.3,
        max_tokens: 100,
      }),
    });

    if (resolutionResponse.ok) {
      const data = await resolutionResponse.json();
      const expandedQuery = data.choices[0].message.content.trim();
      console.log(`✓ Context resolved: "${message}" → "${expandedQuery}"`);
      return expandedQuery;
    }
  } catch (e) {
    console.error('Context resolution failed:', e);
  }

  return message; // Fallback to original
}

// AI agent to determine SINGLE BEST search query
async function determineSearchTopics(
  resolvedQuery: string,
  conversationHistory: any[]
): Promise<{
  searchTopics: string[];
  primaryTopic: string;
  searchQueries: string[];
  reasoning: string;
}> {
  console.log('🤖 AI Agent determining SINGLE BEST search query...');

  try {
    const contextSummary = conversationHistory
      .slice(-4)
      .map((msg: any) => `${msg.role}: ${msg.content.substring(0, 150)}`)
      .join('\n');

    const topicResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{
          role: 'system',
          content: `You are a search optimization AI for an Egyptian platform. Generate ONE PERFECT search query for maximum relevance.

CRITICAL LANGUAGE RULES:
- For Arabic queries → keep query in ARABIC (better results for Arabic websites)
- For English queries → keep query in ENGLISH
- PRESERVE the user's language choice

OPTIMIZATION RULES:
1. Keep original language (Arabic stays Arabic, English stays English)
2. Include "مصر 2025" (Arabic) or "Egypt 2025" (English) for current data
3. Add specific brands/banks relevant in Egypt
4. For prices: include "جنيه" or "EGP", brand names
5. For products: major retailers (Tradeline, B.TECH, Carrefour, Extra Stores)
6. For investments: bank names (NBE, Banque Misr, CIB, بنك الأهلى، بنك مصر)
7. Be ultra-specific with product models and details
8. Add "أحدث" or "latest" for time-sensitive queries

EXAMPLES:
User: "متوسط سعر الثلاجة" → "سعر الثلاجات سامسونج إل جي شارب مصر 2025 جنيه مصري"
User: "صناديق الاستثمار" → "صناديق استثمار بنك الأهلي بنك مصر CIB مصر 2025 عائد"
User: "used cars" → "used cars prices Egypt 2025 market trends"
User: "السيارات المستعملة" → "أسعار السيارات المستعملة مصر 2025 أخبار سوق"

CONTEXT:
${contextSummary}

QUERY: "${resolvedQuery}"

Return ONLY JSON:
{
  "primaryTopic": "main topic",
  "searchTopics": ["main topic"],
  "searchQueries": ["ONE PERFECT QUERY IN SAME LANGUAGE AS USER"],
  "reasoning": "why this query is optimal"
}`
        }],
        temperature: 0.1,
        max_tokens: 250,
      }),
    });

    if (topicResponse.ok) {
      const data = await topicResponse.json();
      let content = data.choices[0].message.content;
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const result = JSON.parse(content);
      
      console.log('📊 Search Topics Determined:');
      console.log(`  Primary: ${result.primaryTopic}`);
      console.log(`  Topics: ${result.searchTopics.join(', ')}`);
      console.log(`  Queries: ${result.searchQueries.join(' | ')}`);
      console.log(`  Reasoning: ${result.reasoning}`);
      
      return result;
    }
  } catch (e) {
    console.error('Topic determination failed:', e);
  }

  // Fallback: use resolved query as-is
  return {
    primaryTopic: resolvedQuery,
    searchTopics: [resolvedQuery],
    searchQueries: [resolvedQuery],
    reasoning: 'Fallback to direct query',
  };
}

// Advanced Router Agent with intent classification
async function analyzeQueryAndSelectTools(message: string, resolvedMessage: string): Promise<{
  intent: 'price_check' | 'recent_news' | 'research' | 'portfolio_analysis' | 'product_research' | 'general';
  timeConstraint: 'realtime' | 'recent' | 'any';
  useKnowledgeBase: boolean;
  useWebSearch: boolean;
  useSemanticSearch: boolean;
  useKeywordSearch: boolean;
  searchQuery?: string;
  dateFilter?: string;
  reasoning: string;
}> {
  console.log('🔍 Router Agent analyzing query intent...');
  console.log(`📝 Original: "${message}", Resolved: "${resolvedMessage}"`);
  
  // Quick Arabic product detection (use RESOLVED message for better detection)
  const hasProductTerms = /صناد|صندوق|شهاد|شهادة|وديع|ودائع/.test(resolvedMessage);
  const hasInvestmentTerms = /استثمار|استثمارات/.test(resolvedMessage);
  
  if (hasProductTerms || (hasInvestmentTerms && /بنك|بنوك/.test(resolvedMessage))) {
    console.log('🎯 Detected Arabic investment product query - using web search');
    return {
      intent: 'product_research',
      timeConstraint: 'recent',
      useKnowledgeBase: false,
      useWebSearch: true,
      useSemanticSearch: false,
      useKeywordSearch: false,
      searchQuery: resolvedMessage, // Use resolved query for search
      reasoning: 'Arabic investment product query detected',
    };
  }
  
  const analysisResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{
        role: 'system',
        content: `You are a financial query router. Return ONLY valid JSON.

CRITICAL ARABIC DETECTION:
- "صناديق" or "صندوق" → intent: "product_research", useWebSearch: true
- "شهادات" or "شهادة" → intent: "product_research", useWebSearch: true  
- "وديعة" or "ودائع" → intent: "product_research", useWebSearch: true
- Investment funds, certificates, deposits → intent: "product_research", useWebSearch: true

INTENT TYPES:
- product_research: Bank funds, certificates, investment products (MUST use web search)
- price_check: Real-time prices (use APIs)
- recent_news: Latest news only
- research: Deep analysis
- portfolio_analysis: User holdings
- general: Other

TIME: realtime (24h), recent (7-30d), any

Return ONLY this JSON:
{
  "intent": "product_research|price_check|recent_news|research|portfolio_analysis|general",
  "timeConstraint": "realtime|recent|any",
  "useKnowledgeBase": boolean,
  "useWebSearch": boolean,
  "useSemanticSearch": boolean,
  "useKeywordSearch": boolean,
  "searchQuery": "query",
  "dateFilter": "m1|w1|d1" or null,
  "reasoning": "explanation"
}`,
      }, {
        role: 'user',
        content: `Analyze: "${resolvedMessage}"`, // Use resolved query
      }],
      temperature: 0.1,
      max_tokens: 300,
    }),
  });

  if (analysisResponse.ok) {
    const data = await analysisResponse.json();
    try {
      let content = data.choices[0].message.content;
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const result = JSON.parse(content);
      console.log('📊 Router decision:', result);
      return result;
    } catch (e) {
      console.error('Failed to parse routing decision:', e);
    }
  }

  // Enhanced fallback heuristics (use RESOLVED message)
  const lowerMsg = resolvedMessage.toLowerCase();
  const isTimeSensitive = /today|now|latest|recent|current|this (week|month)|أخبار/.test(lowerMsg);
  const isPriceQuery = /price|cost|value|worth|trading at|سعر/.test(lowerMsg);
  const isNewsQuery = /news|event|happen|update|أخبار/.test(lowerMsg);
  const isProductQuery = /fund|funds|certificate|deposit|refrigerator|fridge|صناد|صندوق|شهاد|وديع|ثلاج/.test(lowerMsg);
  
  return {
    intent: isProductQuery ? 'product_research' : isPriceQuery ? 'price_check' : isNewsQuery ? 'recent_news' : 'general',
    timeConstraint: isTimeSensitive ? 'recent' : 'any',
    useKnowledgeBase: !isProductQuery,
    useWebSearch: isProductQuery || isTimeSensitive || isNewsQuery || isPriceQuery, // Enable web search for price queries too
    useSemanticSearch: !isPriceQuery && !isProductQuery,
    useKeywordSearch: isTimeSensitive || isPriceQuery,
    searchQuery: resolvedMessage, // Use resolved query
    dateFilter: isTimeSensitive ? 'm1' : undefined,
    reasoning: 'Fallback heuristic classification',
  };
}

async function getUserFinancialData(userId: string, supabase: any) {
  console.log('Fetching user financial data for:', userId);
  
  const [
    { data: personalFinances },
    { data: debts },
    { data: assets },
    { data: portfolios },
    { data: financialGoals },
    { data: incomeStreams },
    { data: expenseStreams },
    { data: deposits },
    { data: portfolioGoals },
    { data: newsArticles }
  ] = await Promise.all([
    supabase.from('personal_finances').select('*').eq('user_id', userId).single(),
    supabase.from('debts').select('*').eq('user_id', userId),
    supabase.from('assets').select('*').eq('user_id', userId),
    supabase.from('portfolios').select('*').eq('user_id', userId),
    supabase.from('financial_goals').select('*').eq('user_id', userId),
    supabase.from('income_streams').select('*').eq('user_id', userId),
    supabase.from('expense_streams').select('*').eq('user_id', userId),
    supabase.from('deposits').select('*').eq('user_id', userId),
    supabase.from('portfolio_goals').select('*').eq('user_id', userId),
    supabase.from('news_articles').select('*').order('created_at', { ascending: false }).limit(10)
  ]);

  return {
    personalFinances: personalFinances || {},
    debts: debts || [],
    assets: assets || [],
    portfolios: portfolios || [],
    financialGoals: financialGoals || [],
    incomeStreams: incomeStreams || [],
    expenseStreams: expenseStreams || [],
    deposits: deposits || [],
    portfolioGoals: portfolioGoals || [],
    newsArticles: newsArticles || []
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId, chatId, conversationHistory = [] } = await req.json();
    console.log('RAG Agent request:', { message, userId, historyLength: conversationHistory.length });

    if (!message) {
      throw new Error('Message is required');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Step 1: Resolve context references in the query
    console.log('🔄 Resolving context references...');
    const resolvedMessage = await resolveContextReferences(message, conversationHistory);
    
    // Step 2: AI Agent determines search topics
    console.log('🤖 Determining search topics...');
    const searchStrategy = await determineSearchTopics(resolvedMessage, conversationHistory);
    
    // Step 3: Fetch user's financial data
    console.log('Fetching user financial data...');
    const userData = await getUserFinancialData(userId, supabase);

    // Step 4: Advanced Router Agent (use resolved message and search topics)
    const toolSelection = await analyzeQueryAndSelectTools(message, resolvedMessage);
    
    // Override search query with AI-determined queries
    if (searchStrategy.searchQueries.length > 0) {
      toolSelection.searchQuery = searchStrategy.searchQueries[0]; // Use primary search query
    }
    
    console.log(`📋 Intent: ${toolSelection.intent}, Time: ${toolSelection.timeConstraint}`);
    console.log('💡 Reasoning:', toolSelection.reasoning);
    console.log('🎯 Search Strategy:', searchStrategy.reasoning);

    let knowledgeContext: any[] = [];
    let sources: any[] = [];
    const seenUrls = new Set<string>();

    // Step 3A: Semantic Vector Search (for conceptual queries)
    if (toolSelection.useSemanticSearch) {
      console.log('🔮 Semantic vector search...');
      const retrievalResponse = await fetch(`${supabaseUrl}/functions/v1/rag-retriever`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: message,
          userId,
        }),
      });

      if (retrievalResponse.ok) {
        const retrievalData = await retrievalResponse.json();
        const semanticResults = retrievalData.results || [];
        console.log(`✓ Retrieved ${semanticResults.length} semantic matches`);
        
        semanticResults.forEach((doc: any) => {
          const url = doc.sourceUrl;
          if (url && !seenUrls.has(url)) {
            seenUrls.add(url);
            knowledgeContext.push({
              ...doc,
              retrievalType: 'semantic',
              score: doc.similarity || 0.8,
            });
            sources.push({
              title: doc.metadata?.title || 'Knowledge Base',
              url,
              type: 'semantic_match',
            });
          }
        });
      }
    }

    // Detect input language (Arabic vs English)
    const isArabic = /[\u0600-\u06FF]/.test(message);
    const responseLanguage = isArabic ? 'Arabic' : 'English';
    console.log(`🌐 Input language detected: ${responseLanguage}`);

    // Step 3B: Egypt-focused Keyword Search via Google (for fresh, time-sensitive content)
    if (toolSelection.useWebSearch && GOOGLE_SEARCH_API_KEY && GOOGLE_SEARCH_ENGINE_ID) {
      // Use AI-determined search queries for better results
      const searchQueriesToUse = searchStrategy.searchQueries.length > 0 
        ? searchStrategy.searchQueries 
        : [toolSelection.searchQuery || message];
      
      console.log('🔑 AI-powered search queries:', searchQueriesToUse);
      
      if (!FIRECRAWL_API_KEY) {
        console.error('⚠️ FIRECRAWL_API_KEY missing - will skip article scraping');
      }
      
      // Use ONLY the single best AI-optimized query for speed
      const bestSearchQuery = searchQueriesToUse[0]; // AI already gave us the best one
      console.log(`🎯 Using OPTIMIZED QUERY: "${bestSearchQuery}"`);
      
      // Build search with time constraint (minimal parameters for speed)
      const dateRestrict = toolSelection.dateFilter || (toolSelection.timeConstraint === 'realtime' ? 'd1' : toolSelection.timeConstraint === 'recent' ? 'w1' : 'm3');
      const searchParams = new URLSearchParams({
        key: GOOGLE_SEARCH_API_KEY,
        cx: GOOGLE_SEARCH_ENGINE_ID,
        q: bestSearchQuery, // Already optimized by AI
        dateRestrict,
        num: '3', // Only top 3 results for speed
        lr: isArabic ? 'lang_ar' : 'lang_en',
        gl: 'eg',
      });
        
      const searchUrl = `https://www.googleapis.com/customsearch/v1?${searchParams.toString()}`;
      
      console.log(`📅 Date: ${dateRestrict}, Lang: ${isArabic ? 'AR' : 'EN'}`);
      const searchResponse = await fetch(searchUrl);
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        const resultCount = searchData.items?.length || 0;
        console.log(`✓ Found ${resultCount} total results`);
        
        // Filter out irrelevant domains
        const irrelevantDomains = ['booking.com', 'hotels.com', 'airbnb.com', 'expedia.com', 'tripadvisor.com'];
        
        // Take only top 3 unique articles
        const articleItems = (searchData.items || [])
          .filter((item: any) => {
            const url = item.link.toLowerCase();
            if (seenUrls.has(url)) return false;
            
            const domain = new URL(item.link).hostname.toLowerCase();
            if (irrelevantDomains.some(d => domain.includes(d))) return false;
            
            const isHomepage = url.match(/^https?:\/\/[^\/]+\/?$/);
            return !isHomepage;
          })
          .slice(0, 3); // ONLY TOP 3
        
        console.log(`📰 Processing ${articleItems.length} top articles`);
          
        if (!FIRECRAWL_API_KEY) {
          console.warn('⚠️ Skipping Firecrawl - using snippets only');
          // Fallback to snippets
          articleItems.forEach((item: any) => {
            seenUrls.add(item.link);
            knowledgeContext.push({
              content: item.snippet,
              metadata: { title: item.title, source: 'Google Search', query: bestSearchQuery },
              sourceUrl: item.link,
              retrievalType: 'keyword',
              score: 0.9,
            });
            sources.push({ title: item.title, url: item.link, type: 'news_article' });
          });
        } else if (articleItems.length > 0) {
          // Scrape ALL 3 articles with Firecrawl for quality
          let successfulScrapes = 0;
          
          for (const item of articleItems) {
            if (seenUrls.has(item.link)) continue;
              
              let articleAdded = false;
              
            try {
              console.log(`🔥 Scraping ${successfulScrapes + 1}/3: ${item.title.substring(0, 50)}...`);
              const firecrawlResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  url: item.link,
                  formats: ['markdown'],
                  onlyMainContent: true,
                }),
              });

              console.log('Firecrawl response status:', firecrawlResponse.status);

              if (firecrawlResponse.ok) {
                const firecrawlData = await firecrawlResponse.json();
                const content = firecrawlData.data?.markdown || '';
                
                if (content) {
                  seenUrls.add(item.link);
                  
                  knowledgeContext.push({
                    content: content.substring(0, 12000),
                    metadata: { 
                      title: item.title, 
                      source: 'Firecrawl',
                      searchQuery: bestSearchQuery,
                      date: new Date().toISOString(),
                      domain: new URL(item.link).hostname,
                    },
                    sourceUrl: item.link,
                    retrievalType: 'keyword',
                    score: 0.95,
                  });
                  
                  sources.push({
                    title: item.title,
                    url: item.link,
                    type: 'news_article',
                  });
                  
                  articleAdded = true;
                  successfulScrapes++;
                  console.log(`✅ Source ${successfulScrapes}/3 scraped`);
                } else {
                  console.warn('Firecrawl empty, trying ScraperAPI');
                }
              } else {
                console.error(`❌ Firecrawl ${firecrawlResponse.status}, trying ScraperAPI`);
              }
            } catch (e) {
              console.error(`❌ Firecrawl failed:`, e);
            }
              
            // Try ScraperAPI if Firecrawl failed and we have the API key
            if (!articleAdded && SCRAPERAPI_KEY) {
              try {
                console.log(`🕷️ Trying ScraperAPI...`);
                const scraperApiUrl = `http://api.scraperapi.com?api_key=${SCRAPERAPI_KEY}&url=${encodeURIComponent(item.link)}`;
                  
                const scraperResponse = await fetch(scraperApiUrl);
                
                if (scraperResponse.ok) {
                  const htmlContent = await scraperResponse.text();
                  
                  // Basic HTML to text conversion
                  const textContent = htmlContent
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                    .replace(/<[^>]+>/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();
                  
                  if (textContent && textContent.length > 100) {
                    seenUrls.add(item.link);
                    
                    knowledgeContext.push({
                      content: textContent.substring(0, 12000),
                      metadata: { 
                        title: item.title, 
                        source: 'ScraperAPI',
                        searchQuery: bestSearchQuery,
                          date: new Date().toISOString(),
                          domain: new URL(item.link).hostname,
                        },
                        sourceUrl: item.link,
                        retrievalType: 'keyword',
                        score: 0.92,
                      });
                      
                      sources.push({
                        title: item.title,
                        url: item.link,
                        type: 'news_article',
                      });
                    
                    articleAdded = true;
                    successfulScrapes++;
                    console.log(`✅ Source ${successfulScrapes}/3 scraped`);
                  } else {
                    console.warn('ScraperAPI empty');
                  }
                } else {
                  console.error(`❌ ScraperAPI ${scraperResponse.status}`);
                }
              } catch (e) {
                console.error(`❌ ScraperAPI failed:`, e);
              }
            }
              
            // Enhanced fallback with more context from Google results
            if (!articleAdded && !seenUrls.has(item.link)) {
              seenUrls.add(item.link);
              
              // Combine snippet with any additional context from the search result
              const enhancedContent = [
                item.title || '',
                item.snippet || '',
                item.displayLink ? `Source: ${item.displayLink}` : '',
                item.formattedUrl || '',
              ].filter(Boolean).join('\n\n');
              
              knowledgeContext.push({
                content: enhancedContent,
                metadata: { 
                  title: item.title, 
                  source: 'Google Search Result', 
                  query: bestSearchQuery,
                  note: 'Full article scraping unavailable - using search result preview',
                },
                sourceUrl: item.link,
                retrievalType: 'keyword',
                score: 0.85,
              });
              
              sources.push({ 
                title: item.title, 
                url: item.link, 
                type: 'search_result' 
              });
              
              console.log(`⚠️ Using search result preview for: ${item.title.substring(0, 50)}...`);
            }
          }
          
          console.log(`✅ Successfully processed ${successfulScrapes}/3 sources`);
        }
      } else {
        console.warn('Google Search failed');
      }
    }

    // Step 4: Rank and deduplicate context
    console.log(`📊 Total context items: ${knowledgeContext.length}, Unique sources: ${sources.length}`);
    
    // Sort by score (freshness + relevance)
    knowledgeContext.sort((a, b) => (b.score || 0) - (a.score || 0));
    
    // Take top results (balance keyword + semantic)
    const maxResults = 6;
    knowledgeContext = knowledgeContext.slice(0, maxResults);
    
    console.log(`✂️ Using top ${knowledgeContext.length} results (${knowledgeContext.filter(c => c.retrievalType === 'keyword').length} keyword, ${knowledgeContext.filter(c => c.retrievalType === 'semantic').length} semantic)`);

    // Step 5: Optional deep analysis of specific URL
    if (toolSelection.searchQuery?.startsWith('http') && FIRECRAWL_API_KEY) {
      const targetUrl = toolSelection.searchQuery;
      console.log('🎯 Deep URL analysis:', targetUrl);
      
      try {
        const firecrawlResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: targetUrl,
            formats: ['markdown'],
            onlyMainContent: true,
          }),
        });

        if (firecrawlResponse.ok) {
          const firecrawlData = await firecrawlResponse.json();
          const content = firecrawlData.data?.markdown || '';
          
          if (content && !seenUrls.has(targetUrl)) {
            seenUrls.add(targetUrl);
            knowledgeContext.push({
              content: content.substring(0, 10000),
              metadata: { title: firecrawlData.data?.title, source: 'Deep Analysis' },
              sourceUrl: targetUrl,
              retrievalType: 'deep_crawl',
              score: 1.0,
            });
            sources.push({
              title: firecrawlData.data?.title || 'Deep Analysis',
              url: targetUrl,
              type: 'deep_analysis',
            });
            console.log('✅ Deep crawl complete');
          }
        }
      } catch (error) {
        console.error('Deep crawl error:', error);
      }
    }

    // Step 6: Build context for LLM (truncate to max 1500 chars per source)
    const contextText = knowledgeContext
      .map((doc: any, idx: number) => {
        const truncated = doc.content.length > 1500 
          ? doc.content.substring(0, 1500) + '...[truncated]'
          : doc.content;
        return `[${idx + 1}] ${truncated}`;
      })
      .join('\n\n');

    // Build user financial context
    const userFinancialContext = `
USER'S FINANCIAL PROFILE:
=========================

PERSONAL FINANCES:
- Monthly Income: ${userData.personalFinances.monthly_income || 0}
- Monthly Expenses: ${userData.personalFinances.monthly_expenses || 0}
- Net Savings: ${userData.personalFinances.net_savings || 0}
- Monthly Investing Amount: ${userData.personalFinances.monthly_investing_amount || 0}

INCOME STREAMS (${userData.incomeStreams.length}):
${userData.incomeStreams.map((s: any) => `- ${s.name}: ${s.amount} (${s.income_type}, ${s.is_active ? 'active' : 'inactive'})`).join('\n') || 'None'}

EXPENSE STREAMS (${userData.expenseStreams.length}):
${userData.expenseStreams.map((s: any) => `- ${s.name}: ${s.amount} (${s.expense_type}, ${s.is_active ? 'active' : 'inactive'})`).join('\n') || 'None'}

DEBTS (${userData.debts.length}):
${userData.debts.map((d: any) => `- ${d.name}: Total ${d.total_amount}, Paid ${d.paid_amount}, Monthly Payment ${d.monthly_payment}, Interest Rate ${d.interest_rate}%`).join('\n') || 'None'}

PORTFOLIOS (${userData.portfolios.length}):
${userData.portfolios.map((p: any) => `- ${p.name}`).join('\n') || 'None'}

ASSETS (${userData.assets.length}):
${userData.assets.map((a: any) => `- ${a.asset_name} (${a.asset_type}): Current ${a.current_price}, Purchase ${a.purchase_price}, Quantity ${a.quantity}`).join('\n') || 'None'}

DEPOSITS & SAVINGS (${userData.deposits.length}):
${userData.deposits.map((d: any) => `- ${d.deposit_type}: Principal ${d.principal}, Rate ${d.rate}%, Status ${d.status}`).join('\n') || 'None'}

FINANCIAL GOALS (${userData.financialGoals.length}):
${userData.financialGoals.map((g: any) => `- ${g.title}: Target ${g.target_amount}, Current ${g.current_amount}, Status ${g.status}`).join('\n') || 'None'}

PORTFOLIO GOALS (${userData.portfolioGoals.length}):
${userData.portfolioGoals.map((g: any) => `- ${g.title} (${g.goal_type}): Target ${g.target_value}, Current ${g.current_value}, Status ${g.status}`).join('\n') || 'None'}

RECENT NEWS ARTICLES:
${userData.newsArticles.map((n: any) => `- ${n.title} (${n.category}, ${n.sentiment})`).join('\n') || 'None'}
`;

    // Step 7: Generate bilingual response with Groq using all context
    console.log(`Generating ${responseLanguage} response with Groq AI...`);
    
    // Build intent-specific system prompt
    let responseStructure = '';
    let roleDescription = '';
    
    if (toolSelection.intent === 'product_research') {
      roleDescription = `You are an Egyptian financial product specialist helping users understand and compare investment products (funds, deposits, bonds, etc.) available in Egypt.`;
      responseStructure = `
RESPONSE STRUCTURE (in ${responseLanguage}):
1. **المنتجات المتاحة / Available Products:** List and describe the specific investment products found (funds, certificates, deposits)
2. **المقارنة والمميزات / Comparison & Features:** Compare features, returns, risks, and requirements
3. **التوصيات / Recommendations:** Suggest which products match the user's financial profile and goals
4. **الخطوات التالية / Next Steps:** Explain how to invest (which bank, minimum amounts, procedures)

Focus on:
- Specific product names, rates, and terms from Egyptian banks
- Minimum investment amounts and eligibility
- Expected returns and risk levels
- How to purchase/subscribe
- Bank contact information and procedures`;
    } else if (toolSelection.intent === 'news_analysis') {
      roleDescription = `You are an Egyptian financial advisor analyzing how recent news affects the user's portfolio and Egyptian market investments.`;
      responseStructure = `
RESPONSE STRUCTURE (in ${responseLanguage}):
1. **ملخص الأخبار الأخيرة / Latest News Summary:** Summarize key events/developments from the sources
2. **تأثير على المحفظة / Portfolio Impact Analysis:** Connect specific news to specific Egyptian assets in their portfolio
3. **تقييم المخاطر / Risk Assessment:** Identify potential risks based on Egyptian market conditions
4. **التوصيات / Recommendations:** Provide specific actions appropriate for Egyptian investors`;
    } else if (toolSelection.intent === 'portfolio_analysis') {
      roleDescription = `You are an Egyptian portfolio analyst evaluating the user's investment holdings and providing optimization recommendations.`;
      responseStructure = `
RESPONSE STRUCTURE (in ${responseLanguage}):
1. **تحليل المحفظة الحالية / Current Portfolio Analysis:** Evaluate asset allocation, diversification, and risk
2. **نقاط القوة والضعف / Strengths & Weaknesses:** Identify what's working and areas for improvement
3. **فرص التحسين / Optimization Opportunities:** Suggest rebalancing or new investments
4. **التوصيات / Recommendations:** Specific actionable steps for portfolio improvement`;
    } else {
      roleDescription = `You are an Egyptian financial advisor helping users with their financial questions and investment decisions.`;
      responseStructure = `
RESPONSE STRUCTURE (in ${responseLanguage}):
Provide a clear, helpful response that directly answers the user's question with specific information from the sources.`;
    }
    
    // Build messages array with conversation history
    const messages = [
      {
        role: 'system',
        content: `${roleDescription}

🌍 CRITICAL: Respond ENTIRELY in ${responseLanguage}. Match the user's language exactly.

💰 CURRENCY: All monetary values should be in Egyptian Pounds (EGP) unless explicitly stated otherwise.

🇪🇬 MARKET CONTEXT: Focus on Egyptian market dynamics, EGX stocks, Egyptian regulations, and local economic conditions.

QUERY ANALYSIS:
- Intent: ${toolSelection.intent}
- Time Constraint: ${toolSelection.timeConstraint}
- Language: ${responseLanguage}
- Retrieval Strategy: ${toolSelection.reasoning}

${userFinancialContext}

EXTERNAL KNOWLEDGE & RESEARCH (${knowledgeContext.length} sources - may include Arabic sources):
${contextText}

CRITICAL INSTRUCTIONS - READ CAREFULLY:
1. Respond ENTIRELY in ${responseLanguage} - no mixing languages
2. Use EGP as the default currency for all amounts
3. The sources above WERE SUCCESSFULLY RETRIEVED - analyze their ACTUAL content
4. You MUST reference specific details from the EXTERNAL KNOWLEDGE section
5. DO NOT say "the provided articles don't mention..." when they clearly do
6. Extract and cite specific product names, rates, terms, and details from the sources
7. All financial advice should be relevant to Egyptian investors
8. MAINTAIN CONVERSATION CONTEXT - refer to previous questions/answers when relevant

${responseStructure}

NEVER say "the articles don't mention" or "no specific information" - you have ${knowledgeContext.length} sources with full content to analyze.`
      }
    ];

    // Add conversation history (limit to last 2 messages to save tokens)
    if (conversationHistory && conversationHistory.length > 0) {
      const limitedHistory = conversationHistory.slice(-2);
      console.log(`📜 Including ${limitedHistory.length} previous messages for context`);
      messages.push(...limitedHistory);
    }

    // Add current message
    messages.push({
      role: 'user',
      content: message,
    });

    const aiResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      
      // Handle specific error codes
      if (aiResponse.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      } else if (aiResponse.status === 402) {
        throw new Error('AI service payment required. Please contact support.');
      }
      
      throw new Error('Failed to generate AI response');
    }

    const aiData = await aiResponse.json();
    let response = aiData.choices[0].message.content;

    // Determine UI components to include based on query
    const uiComponents: string[] = [];
    let assetDetails = null;
    const messageLower = message.toLowerCase();

    // Check for finance-related queries
    const isFinanceQuery = /\b(income|expenses|budget|finances|salary|debt|savings|spending|financial|overview)\b/i.test(message);
    if (isFinanceQuery) {
      uiComponents.push('PersonalFinanceCard');
    }

    // Check for asset/crypto price queries (more flexible matching)
    const assetKeywords = ['bitcoin', 'bit coin', 'btc', 'ethereum', 'eth', 'stock price', 'crypto price', 'asset price', 'value of', 'price of'];
    const isAssetPriceQuery = assetKeywords.some(keyword => messageLower.includes(keyword));

    // Check for portfolio-related queries (but not specific asset queries)
    const isPortfolioQuery = /\b(portfolio|holdings|my assets|investments|allocation|diversification)\b/i.test(message) && !isAssetPriceQuery;
    
    if (isPortfolioQuery) {
      uiComponents.push('PortfolioHoldingsCard');
    }

    // Check for specific asset queries
    if (isAssetPriceQuery) {
      // First try to find in user's portfolio
      let foundAsset = null;
      if (userData.assets && userData.assets.length > 0) {
        foundAsset = userData.assets.find((asset: any) => 
          messageLower.includes(asset.asset_name.toLowerCase()) ||
          (asset.symbol && messageLower.includes(asset.symbol.toLowerCase())) ||
          // Handle spaces in search (e.g., "bit coin" vs "bitcoin")
          messageLower.replace(/\s+/g, '').includes(asset.asset_name.toLowerCase().replace(/\s+/g, ''))
        );
      }

      if (foundAsset) {
        // Asset found in portfolio
        assetDetails = {
          assetName: foundAsset.asset_name,
          assetType: foundAsset.asset_type,
          symbol: foundAsset.symbol,
          currentPrice: foundAsset.current_price,
          purchasePrice: foundAsset.purchase_price,
          quantity: foundAsset.quantity,
          country: foundAsset.country,
          city: foundAsset.city,
          purchaseDate: foundAsset.purchase_date,
          inPortfolio: true,
        };
        uiComponents.push('AssetDetailCard');
      } else {
        // Asset not in portfolio - fetch from market data
        const normalizedMessage = messageLower.replace(/\s+/g, '');
        
        if (normalizedMessage.includes('bitcoin') || messageLower.includes('btc')) {
          const { data: cryptoData } = await supabase
            .from('cryptocurrencies')
            .select('*')
            .ilike('symbol', 'BTC')
            .single();
          
          if (cryptoData) {
            assetDetails = {
              assetName: cryptoData.name,
              assetType: 'Cryptocurrency',
              symbol: cryptoData.symbol,
              currentPrice: cryptoData.price_egp || cryptoData.price_usd,
              country: 'Global',
              inPortfolio: false,
              marketData: {
                change24h: cryptoData.change_24h,
                changePercent24h: cryptoData.change_percentage_24h,
                volume24h: cryptoData.volume_24h,
                marketCap: cryptoData.market_cap,
                high24h: cryptoData.high_24h,
                low24h: cryptoData.low_24h,
              }
            };
            uiComponents.push('AssetDetailCard');
          }
        } else if (normalizedMessage.includes('ethereum') || messageLower.includes('eth')) {
          const { data: cryptoData } = await supabase
            .from('cryptocurrencies')
            .select('*')
            .ilike('symbol', 'ETH')
            .single();
          
          if (cryptoData) {
            assetDetails = {
              assetName: cryptoData.name,
              assetType: 'Cryptocurrency',
              symbol: cryptoData.symbol,
              currentPrice: cryptoData.price_egp || cryptoData.price_usd,
              country: 'Global',
              inPortfolio: false,
              marketData: {
                change24h: cryptoData.change_24h,
                changePercent24h: cryptoData.change_percentage_24h,
                volume24h: cryptoData.volume_24h,
                marketCap: cryptoData.market_cap,
                high24h: cryptoData.high_24h,
                low24h: cryptoData.low_24h,
              }
            };
            uiComponents.push('AssetDetailCard');
          }
        }
      }
    }

    // Step 8: Format sources as structured data (not markdown)
    const uniqueSources = sources.filter((s: any, idx: number, self: any[]) => 
      self.findIndex((x: any) => x.url === s.url) === idx
    );
    
    // Add source tags inline for frontend to parse
    if (uniqueSources.length > 0) {
      uniqueSources.forEach((source: any, idx: number) => {
        response += `[SOURCE: ${source.title}|${source.url}]`;
      });
    }

    // Step 9: Store the conversation
    if (chatId) {
      await supabase.from('chat_messages').insert([
        { chat_id: chatId, user_id: userId, role: 'user', content: message },
        { chat_id: chatId, user_id: userId, role: 'assistant', content: response },
      ]);
    }

    console.log('Response generated successfully');

    return new Response(JSON.stringify({
      success: true,
      response,
      uiComponents,
      assetDetails,
      sourcesUsed: sources.length,
      contextRetrieved: knowledgeContext.length,
      toolsUsed: {
        intent: toolSelection.intent,
        timeConstraint: toolSelection.timeConstraint,
        semanticSearch: toolSelection.useSemanticSearch,
        keywordSearch: toolSelection.useKeywordSearch,
      },
      retrievalBreakdown: {
        keyword: knowledgeContext.filter(c => c.retrievalType === 'keyword').length,
        semantic: knowledgeContext.filter(c => c.retrievalType === 'semantic').length,
        deepCrawl: knowledgeContext.filter(c => c.retrievalType === 'deep_crawl').length,
      },
      reasoning: toolSelection.reasoning,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in RAG agent:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      success: false,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
