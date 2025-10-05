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

// Tool selection and routing logic
async function analyzeQueryAndSelectTools(message: string): Promise<{
  useKnowledgeBase: boolean;
  useWebSearch: boolean;
  useFirecrawl: boolean;
  searchQuery?: string;
  crawlUrl?: string;
  reasoning: string;
}> {
  console.log('Analyzing query to select appropriate tools...');
  
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
        content: `You are a tool selection AI. Analyze the user's query and decide which tools to use:
- Knowledge Base: For questions about stored/historical information, past conversations, or already-known data
- Web Search (Google): ALWAYS use for news, current events, market updates, geopolitical events
- Firecrawl: Automatically used with web search to get full article content

CRITICAL SEARCH QUERY RULES:
- For news queries, create specific search terms like "Gaza latest news 2025" or "Gaza conflict October 2025"
- Include the current year (2025) for recent news
- Add keywords like "latest", "today", "news", "update" for recent articles
- Be specific about the topic (e.g., "Gaza economy impact" not just "Gaza")

Return ONLY a JSON object with this exact structure:
{
  "useKnowledgeBase": boolean,
  "useWebSearch": boolean,
  "useFirecrawl": boolean,
  "searchQuery": "optimized news search query with year and keywords" or null,
  "crawlUrl": "URL to crawl with Firecrawl" or null,
  "reasoning": "brief explanation of tool selection"
}`,
      }, {
        role: 'user',
        content: `Analyze this query and select appropriate tools: "${message}"`,
      }],
      temperature: 0.3,
      max_tokens: 300,
    }),
  });

  if (analysisResponse.ok) {
    const data = await analysisResponse.json();
    try {
      let content = data.choices[0].message.content;
      // Remove markdown code blocks if present
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const result = JSON.parse(content);
      console.log('Tool selection:', result);
      return result;
    } catch (e) {
      console.error('Failed to parse tool selection:', e, data.choices[0].message.content);
    }
  }

  // Fallback to simple heuristics
  const needsWebSearch = message.toLowerCase().includes('latest') ||
                         message.toLowerCase().includes('recent') ||
                         message.toLowerCase().includes('news') ||
                         message.toLowerCase().includes('today') ||
                         message.toLowerCase().includes('current');
  
  return {
    useKnowledgeBase: true,
    useWebSearch: needsWebSearch,
    useFirecrawl: false,
    searchQuery: needsWebSearch ? message : undefined,
    reasoning: 'Fallback heuristic selection',
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

    // Step 2: Intelligent tool selection
    const toolSelection = await analyzeQueryAndSelectTools(message);
    console.log('Tool selection reasoning:', toolSelection.reasoning);

    let knowledgeContext: any[] = [];
    let sources: any[] = [];

    // Step 3: Retrieve from knowledge base if selected
    if (toolSelection.useKnowledgeBase) {
      console.log('Retrieving from knowledge base...');
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
        knowledgeContext = retrievalData.results || [];
        console.log(`Retrieved ${knowledgeContext.length} knowledge documents`);
        
        sources = knowledgeContext.map((doc: any) => ({
          title: doc.metadata?.title || 'Knowledge Base',
          url: doc.sourceUrl,
          type: doc.sourceType,
        })).filter((s: any) => s.url);
      }
    }

    // Step 4: Fetch from web search if selected
    if (toolSelection.useWebSearch && GOOGLE_SEARCH_API_KEY && GOOGLE_SEARCH_ENGINE_ID) {
      console.log('Fetching top recent news from Google Search:', toolSelection.searchQuery);
      
      if (!FIRECRAWL_API_KEY) {
        console.error('CRITICAL: FIRECRAWL_API_KEY not found! Cannot retrieve full articles.');
      }
      
      // Use the AI-optimized search query directly (it already has year and keywords)
      const searchQuery = encodeURIComponent(toolSelection.searchQuery || `${message} latest news 2025`);
      const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_SEARCH_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&q=${searchQuery}&dateRestrict=m1&num=10`;
      
      console.log('Searching for:', toolSelection.searchQuery || message);
      console.log('Full search URL:', searchUrl);
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
        
        // Keep URLs that look like articles (less aggressive filtering)
        const articleItems = (searchData.items || []).filter((item: any) => {
          const url = item.link.toLowerCase();
          // Only exclude obvious homepages
          const isObviousHomepage = url.match(/^https?:\/\/[^\/]+\/?$/);
          return !isObviousHomepage;
        });
        
        console.log(`Using ${articleItems.length} URLs (removed ${resultCount - articleItems.length} obvious homepages)`);
        
        // MUST use Firecrawl for full article content
        if (!FIRECRAWL_API_KEY) {
          console.error('CRITICAL: Cannot proceed without FIRECRAWL_API_KEY');
          throw new Error('Firecrawl API key required for news retrieval');
        }
        
        if (articleItems.length > 0) {
          for (const item of articleItems.slice(0, 3)) {
            try {
              console.log('Firecrawl: Scraping article:', item.title, 'URL:', item.link);
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
                
                sources.push({
                  title: item.title,
                  url: item.link,
                  type: 'news_article',
                });
                
                knowledgeContext.push({
                  content: actualContent.substring(0, 12000), // Large chunk for comprehensive analysis
                  metadata: { 
                    title: item.title, 
                    source: 'Firecrawl',
                    date: new Date().toISOString()
                  },
                  sourceUrl: item.link,
                });
                
                console.log('✓ Successfully crawled full article:', item.title);
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

    // Step 5: Use Firecrawl for specific URL analysis if requested
    if (toolSelection.useFirecrawl && toolSelection.crawlUrl && FIRECRAWL_API_KEY) {
      console.log('Using Firecrawl to analyze specific URL:', toolSelection.crawlUrl);
      
      try {
        const firecrawlResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: toolSelection.crawlUrl,
            formats: ['markdown'],
          }),
        });

        if (firecrawlResponse.ok) {
          const firecrawlData = await firecrawlResponse.json();
          const content = firecrawlData.data?.markdown || '';
          
          if (content) {
            sources.push({
              title: firecrawlData.data?.title || 'Website Analysis',
              url: toolSelection.crawlUrl,
              type: 'deep_analysis',
            });

            knowledgeContext.push({
              content: content.substring(0, 8000),
              metadata: { title: firecrawlData.data?.title, source: 'Firecrawl Deep Analysis' },
              sourceUrl: toolSelection.crawlUrl,
            });

            console.log('Successfully retrieved content from Firecrawl');
          }
        }
      } catch (error) {
        console.error('Firecrawl error:', error);
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

    // Step 7: Generate response with Groq using all context
    console.log('Generating response with Groq AI...');
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
          content: `You are a comprehensive financial advisor AI with deep access to the user's complete financial profile. You provide informed, personalized advice based on their actual financial situation, market data, and current news.

TOOL SELECTION REASONING:
${toolSelection.reasoning}

${userFinancialContext}

EXTERNAL KNOWLEDGE & RESEARCH (${knowledgeContext.length} sources):
${contextText}

CRITICAL INSTRUCTIONS - READ CAREFULLY:
1. The sources above WERE SUCCESSFULLY RETRIEVED and contain the latest news
2. You MUST analyze and reference the specific content provided in the EXTERNAL KNOWLEDGE section
3. DO NOT say "the provided articles don't mention..." when they clearly do
4. Start your response by summarizing the KEY POINTS from the articles above
5. Then connect those specific points to the user's portfolio

YOUR ROLE:
- Analyze the ACTUAL CONTENT from the ${knowledgeContext.length} sources provided above
- Extract specific facts, events, and data from these sources
- Connect these specific events to the user's portfolio holdings
- Provide actionable recommendations based on the real news content
- Reference specific details from the articles (quotes, data points, events)

RESPONSE STRUCTURE:
1. **Latest News Summary:** Summarize the key events/developments from the sources
2. **Portfolio Impact Analysis:** Connect specific news to specific assets in their portfolio
3. **Risk Assessment:** Identify potential risks based on the news
4. **Recommendations:** Provide specific actions they should consider

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

    // Step 8: Format source citations properly
    const uniqueSources = sources.filter((s: any, idx: number, self: any[]) => 
      self.findIndex((x: any) => x.url === s.url) === idx
    );
    
    if (uniqueSources.length > 0) {
      response += '\n\n**Sources:**\n';
      uniqueSources.forEach((source: any, idx: number) => {
        response += `${idx + 1}. [${source.title}](${source.url})\n`;
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
        knowledgeBase: toolSelection.useKnowledgeBase,
        webSearch: toolSelection.useWebSearch,
        firecrawl: toolSelection.useFirecrawl,
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
