import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const GOOGLE_SEARCH_API_KEY = Deno.env.get('GOOGLE_SEARCH_API_KEY');
const GOOGLE_SEARCH_ENGINE_ID = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

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

    // Step 2: Retrieve relevant context from knowledge base
    console.log('Retrieving relevant context...');
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

    let knowledgeContext = [];
    let sources = [];

    if (retrievalResponse.ok) {
      const retrievalData = await retrievalResponse.json();
      knowledgeContext = retrievalData.results || [];
      console.log(`Retrieved ${knowledgeContext.length} knowledge documents`);
      
      // Extract sources for citation
      sources = knowledgeContext.map((doc: any) => ({
        title: doc.metadata?.title || 'Source',
        url: doc.sourceUrl,
        type: doc.sourceType,
      })).filter((s: any) => s.url);
    }

    // Step 2: Check if we need to fetch fresh data from web
    const needsWebSearch = knowledgeContext.length === 0 || 
                           message.toLowerCase().includes('latest') ||
                           message.toLowerCase().includes('current') ||
                           message.toLowerCase().includes('today');

    if (needsWebSearch && GOOGLE_SEARCH_API_KEY && GOOGLE_SEARCH_ENGINE_ID) {
      console.log('Fetching fresh data from web...');
      // Use the original query without forcing "financial market news" context
      const searchQuery = encodeURIComponent(message);
      const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_SEARCH_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&q=${searchQuery}&num=3`;
      
      const searchResponse = await fetch(searchUrl);
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        
        // Ingest search results into knowledge base
        for (const item of searchData.items || []) {
          const content = `${item.title}\n\n${item.snippet}`;
          
          // Store in knowledge base (fire and forget)
          fetch(`${supabaseUrl}/functions/v1/rag-ingest`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseAnonKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              content,
              metadata: { title: item.title },
              sourceUrl: item.link,
              sourceType: 'web',
              userId: null, // Global knowledge
              validate: false,
            }),
          }).catch(e => console.error('Failed to ingest:', e));

          // Add to sources
          sources.push({
            title: item.title,
            url: item.link,
            type: 'web',
          });
          
          knowledgeContext.push({
            content,
            metadata: { title: item.title },
            sourceUrl: item.link,
          });
        }
      }
    }

    // Step 3: Build context for LLM
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

    // Step 4: Generate response with LLM using retrieved context
    console.log('Generating response with AI...');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{
          role: 'system',
          content: `You are a comprehensive financial advisor AI with deep access to the user's complete financial profile. You provide informed, personalized advice based on their actual financial situation, market data, and web research.

${userFinancialContext}

KNOWLEDGE BASE & WEB RESEARCH:
${contextText}

YOUR ROLE:
- You are an informative decision-making agent
- Analyze the user's complete financial picture (income, expenses, debts, assets, goals, savings)
- Use both their personal data AND external knowledge/news to provide context-aware advice
- Make specific recommendations based on their actual financial situation
- Always cite sources for external information using [SOURCE:Title|URL] format
- Be proactive in identifying opportunities or risks based on their portfolio and goals
- Explain reasoning clearly and tie recommendations to their specific circumstances

GUIDELINES:
- Start by acknowledging relevant aspects of their financial situation when appropriate
- Provide actionable, personalized advice (not generic)
- If they ask about something that conflicts with their goals or situation, point it out
- Use their actual numbers (income, expenses, asset values) in your analysis
- Consider their risk tolerance based on their portfolio composition
- If you need more information to give good advice, ask specific questions`,
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

    // Step 5: Add source citations if not already present
    if (sources.length > 0 && !response.includes('[SOURCE:')) {
      const uniqueSources = sources.filter((s: any, idx: number, self: any[]) => 
        self.findIndex((x: any) => x.url === s.url) === idx
      );
      
      for (const source of uniqueSources) {
        if (!response.includes(source.url)) {
          response += ` [SOURCE:${source.title}|${source.url}]`;
        }
      }
    }

    // Step 6: Store the conversation
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
