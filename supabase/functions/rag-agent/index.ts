import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
const GOOGLE_SEARCH_API_KEY = Deno.env.get('GOOGLE_SEARCH_API_KEY');
const GOOGLE_SEARCH_ENGINE_ID = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

// Advanced Router Agent with intent classification
async function analyzeQueryAndSelectTools(message: string): Promise<{
  intent: 'price_check' | 'recent_news' | 'research' | 'portfolio_analysis' | 'general';
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
        content: `You are an intelligent routing agent. Analyze queries and determine optimal retrieval strategy.

INTENT CLASSIFICATION:
- price_check: Real-time price, market data (use external APIs)
- recent_news: Latest news, events (use keyword search + time filter)
- research: Deep analysis, concepts (use semantic vector search)
- portfolio_analysis: User's holdings analysis (use user data + relevant news)
- general: General questions (hybrid approach)

TIME CONSTRAINTS:
- realtime: Last 24 hours (today, now, current)
- recent: Last 7-30 days (latest, recent, this week/month)
- any: No time constraint

SEARCH STRATEGY:
- useKnowledgeBase: Historical knowledge, past conversations
- useWebSearch: Google Search for fresh content
- useSemanticSearch: Vector DB for conceptual matches
- useKeywordSearch: Exact matches, named entities, dates

Return JSON:
{
  "intent": "recent_news" | "price_check" | "research" | "portfolio_analysis" | "general",
  "timeConstraint": "realtime" | "recent" | "any",
  "useKnowledgeBase": boolean,
  "useWebSearch": boolean,
  "useSemanticSearch": boolean,
  "useKeywordSearch": boolean,
  "searchQuery": "optimized query with keywords and year",
  "dateFilter": "m1" | "w1" | "d1" or null,
  "reasoning": "explanation"
}`,
      }, {
        role: 'user',
        content: `Analyze: "${message}"`,
      }],
      temperature: 0.2,
      max_tokens: 400,
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

  // Enhanced fallback heuristics
  const lowerMsg = message.toLowerCase();
  const isTimeSensitive = /today|now|latest|recent|current|this (week|month)/.test(lowerMsg);
  const isPriceQuery = /price|cost|value|worth|trading at/.test(lowerMsg);
  const isNewsQuery = /news|event|happen|update/.test(lowerMsg);
  
  return {
    intent: isPriceQuery ? 'price_check' : isNewsQuery ? 'recent_news' : 'general',
    timeConstraint: isTimeSensitive ? 'recent' : 'any',
    useKnowledgeBase: true,
    useWebSearch: isTimeSensitive || isNewsQuery,
    useSemanticSearch: !isPriceQuery,
    useKeywordSearch: isTimeSensitive || isPriceQuery,
    searchQuery: message,
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
    const { message, userId, chatId } = await req.json();
    console.log('RAG Agent request:', { message, userId });

    if (!message) {
      throw new Error('Message is required');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Step 1: Fetch user's financial data
    console.log('Fetching user financial data...');
    const userData = await getUserFinancialData(userId, supabase);

    // Step 2: Advanced Router Agent
    const toolSelection = await analyzeQueryAndSelectTools(message);
    console.log(`📋 Intent: ${toolSelection.intent}, Time: ${toolSelection.timeConstraint}`);
    console.log('💡 Reasoning:', toolSelection.reasoning);

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
      console.log('🔑 Egypt-focused keyword search via Google:', toolSelection.searchQuery);
      
      if (!FIRECRAWL_API_KEY) {
        console.error('⚠️ FIRECRAWL_API_KEY missing - will skip article scraping');
      }
      
      // Add Egypt-specific context to search for better local results
      const baseQuery = toolSelection.searchQuery || message;
      const egyptFocusedQuery = isArabic 
        ? `${baseQuery} مصر OR السوق المصري OR البورصة المصرية OR القاهرة`
        : `${baseQuery} Egypt OR Egyptian market OR EGX OR Cairo`;
      
      // Build search with time constraint and Egypt focus
      const dateRestrict = toolSelection.dateFilter || (toolSelection.timeConstraint === 'realtime' ? 'd1' : toolSelection.timeConstraint === 'recent' ? 'w1' : 'm1');
      const searchParams = new URLSearchParams({
        key: GOOGLE_SEARCH_API_KEY,
        cx: GOOGLE_SEARCH_ENGINE_ID,
        q: egyptFocusedQuery,
        dateRestrict,
        num: '10',
        lr: isArabic ? 'lang_ar' : 'lang_en', // Language restriction
        gl: 'eg', // Geographic location: Egypt
      });
      
      const searchUrl = `https://www.googleapis.com/customsearch/v1?${searchParams.toString()}`;
      
      console.log(`📅 Date filter: ${dateRestrict}, Language: ${isArabic ? 'Arabic' : 'English'}, Region: Egypt`);
      console.log(`🔍 Egypt-focused query: "${egyptFocusedQuery}"`);
      const searchResponse = await fetch(searchUrl);
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        const resultCount = searchData.items?.length || 0;
        console.log(`Found ${resultCount} search results`);
        
        if (resultCount === 0) {
          console.error('No search results found! Check search query and API settings.');
        }
        
        // Log all URLs for debugging
        console.log('All search results:');
        (searchData.items || []).forEach((item: any, idx: number) => {
          console.log(`  ${idx + 1}. ${item.title}`);
          console.log(`     URL: ${item.link}`);
        });
        
        // Deduplicate and filter articles
        const articleItems = (searchData.items || []).filter((item: any) => {
          const url = item.link.toLowerCase();
          if (seenUrls.has(url)) return false; // Already have this
          const isHomepage = url.match(/^https?:\/\/[^\/]+\/?$/);
          return !isHomepage;
        });
        
        console.log(`📰 Found ${articleItems.length} unique articles (${resultCount - articleItems.length} duplicates removed)`);
        
        if (!FIRECRAWL_API_KEY) {
          console.warn('⚠️ Skipping Firecrawl - using snippets only');
          // Fallback to snippets
          articleItems.slice(0, 5).forEach((item: any) => {
            seenUrls.add(item.link);
            knowledgeContext.push({
              content: item.snippet,
              metadata: { title: item.title, source: 'Google Search' },
              sourceUrl: item.link,
              retrievalType: 'keyword',
              score: 0.9,
            });
            sources.push({ title: item.title, url: item.link, type: 'news_article' });
          });
        } else if (articleItems.length > 0) {
          // Scrape top articles with Firecrawl
          for (const item of articleItems.slice(0, 3)) {
            if (seenUrls.has(item.link)) continue;
            try {
              console.log('🔥 Firecrawl scraping:', item.title);
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
                
                if (!content) {
                  console.warn('Firecrawl returned empty content for:', item.link);
                }
                
                const actualContent = content || item.snippet;
                seenUrls.add(item.link);
                
                knowledgeContext.push({
                  content: actualContent.substring(0, 12000),
                  metadata: { 
                    title: item.title, 
                    source: 'Firecrawl',
                    date: new Date().toISOString(),
                    domain: new URL(item.link).hostname,
                  },
                  sourceUrl: item.link,
                  retrievalType: 'keyword',
                  score: 0.95, // Fresh content gets high score
                });
                
                sources.push({
                  title: item.title,
                  url: item.link,
                  type: 'news_article',
                });
                
                console.log('✅ Full article scraped:', item.title);
              } else {
                const errorText = await firecrawlResponse.text();
                console.error('Firecrawl API error:', firecrawlResponse.status, errorText);
                // Skip this source if Firecrawl fails
                console.warn('Skipping source due to Firecrawl failure');
              }
            } catch (e) {
              console.error('Exception during Firecrawl for:', item.link, e);
            }
          }
        } else {
          console.warn('No valid article URLs found in search results');
        }
      } else {
        const errorText = await searchResponse.text();
        console.error('Google Search API error:', searchResponse.status, errorText);
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

    // Step 6: Build context for LLM
    const contextText = knowledgeContext
      .map((doc: any, idx: number) => `[${idx + 1}] ${doc.content}`)
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
    const aiResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{
          role: 'system',
          content: `You are an Egyptian financial advisor AI specializing in the Egyptian market (EGX, Egyptian pounds, local regulations). You have deep access to the user's complete financial profile.

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
3. The sources above WERE SUCCESSFULLY RETRIEVED and contain the latest news
4. You MUST analyze and reference the specific content provided in the EXTERNAL KNOWLEDGE section
5. DO NOT say "the provided articles don't mention..." when they clearly do
6. Start your response by summarizing the KEY POINTS from the articles above
7. Then connect those specific points to the user's Egyptian portfolio
8. Consider Egyptian market regulations, tax implications, and local economic conditions

YOUR ROLE:
- Analyze the ACTUAL CONTENT from the ${knowledgeContext.length} sources (Arabic and English) provided above
- Extract specific facts, events, and data from these sources
- Connect these specific events to the user's Egyptian portfolio holdings
- Provide actionable recommendations based on the real news content and Egyptian market context
- Reference specific details from the articles (quotes, data points, events)
- All financial advice should be relevant to Egyptian investors

RESPONSE STRUCTURE (in ${responseLanguage}):
1. **Latest News Summary:** Summarize the key events/developments from the sources
2. **Portfolio Impact Analysis:** Connect specific news to specific Egyptian assets in their portfolio
3. **Risk Assessment:** Identify potential risks based on Egyptian market conditions
4. **Recommendations:** Provide specific actions appropriate for Egyptian investors

NEVER say "the articles don't mention" or "no specific information" - you have ${knowledgeContext.length} sources with full content to analyze.`,
        }, {
          role: 'user',
          content: message,
        }],
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
