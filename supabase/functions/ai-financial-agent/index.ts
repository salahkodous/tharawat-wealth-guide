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

const getMarketDataSummary = async (supabase: any): Promise<MarketDataSummary> => {
  try {
    // Get stocks data
    const { data: stocks } = await supabase
      .from('stocks')
      .select('name, symbol, price, change_percent, country, market_cap')
      .order('market_cap', { ascending: false })
      .limit(10);

    // Get crypto data
    const { data: crypto } = await supabase
      .from('cryptocurrencies')
      .select('name, symbol, price_usd, change_percentage_24h, market_cap, rank')
      .order('rank', { ascending: true })
      .limit(10);

    // Get real estate data
    const { data: realEstate } = await supabase
      .from('real_estate_prices')
      .select('city_name, neighborhood_name, avg_price_per_meter, property_type')
      .order('avg_price_per_meter', { ascending: false })
      .limit(10);

    // Get bonds data
    const { data: bonds } = await supabase
      .from('bonds')
      .select('name, bond_type, yield_to_maturity, current_price, issuer')
      .order('yield_to_maturity', { ascending: false });

    // Get ETFs data
    const { data: etfs } = await supabase
      .from('etfs')
      .select('name, symbol, price, change_percentage, market_cap, category')
      .order('market_cap', { ascending: false });

    // Get gold prices
    const { data: goldPrices } = await supabase
      .from('gold_prices')
      .select('price_24k_egp, change_percentage_24h, source')
      .order('last_updated', { ascending: false })
      .limit(1);

    // Get currency rates
    const { data: currencyRates } = await supabase
      .from('currency_rates')
      .select('base_currency, target_currency, exchange_rate, change_percentage_24h')
      .in('base_currency', ['USD', 'EUR', 'GBP'])
      .order('last_updated', { ascending: false })
      .limit(10);

    // Get bank products
    const { data: bankProducts } = await supabase
      .from('bank_products')
      .select('bank_name, product_name, interest_rate, product_type, minimum_amount')
      .eq('is_active', true)
      .order('interest_rate', { ascending: false })
      .limit(10);

    return {
      stocks: {
        total: stocks?.length || 0,
        countries: [...new Set(stocks?.map(s => s.country) || [])],
        top_performers: stocks || []
      },
      crypto: {
        total: crypto?.length || 0,
        top_by_market_cap: crypto || []
      },
      real_estate: {
        total_neighborhoods: realEstate?.length || 0,
        cities: [...new Set(realEstate?.map(r => r.city_name) || [])],
        avg_price_ranges: realEstate || []
      },
      bonds: {
        total: bonds?.length || 0,
        avg_yield: bonds?.reduce((sum, b) => sum + (b.yield_to_maturity || 0), 0) / (bonds?.length || 1),
        types: [...new Set(bonds?.map(b => b.bond_type) || [])]
      },
      etfs: {
        total: etfs?.length || 0,
        categories: [...new Set(etfs?.map(e => e.category) || [])]
      },
      gold_prices: {
        current_24k: goldPrices?.[0]?.price_24k_egp || null,
        change_24h: goldPrices?.[0]?.change_percentage_24h || null
      },
      currency_rates: {
        major_pairs: currencyRates || []
      },
      bank_products: {
        total: bankProducts?.length || 0,
        best_rates: bankProducts || []
      }
    };
  } catch (error) {
    console.error('Error fetching market data:', error);
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
};

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

interface PendingAction {
  type: 'update_income' | 'update_expenses' | 'update_savings' | 'update_investing' | 'add_goal' | 'update_goal' | 
        'add_income_stream' | 'add_expense_stream' | 'add_debt' | 'add_deposit' | 'update_debt' | 'delete_debt';
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
    const { message, userId, action, messages, model } = await req.json();
    console.log('Request data:', { message, userId, actionType: action?.type, messageHistory: messages?.length, model });

    // Read GROQ API key at request time to pick up latest secret
    const groqApiKey = Deno.env.get('GROQ');
    console.log('GROQ key exists:', !!groqApiKey);

    if (!groqApiKey) {
      console.error('GROQ API key is not configured');
      return new Response(JSON.stringify({ 
        error: 'GROQ API key not configured',
        response: 'I need the GROQ API key configured in Supabase Edge Function secrets.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If this is a confirmation action, execute the pending action
    if (action?.type === 'confirm' && action?.pendingAction) {
      console.log('Executing pending action:', action.pendingAction);
      const result = await executePendingAction(userId, action.pendingAction);
      console.log('Action result:', result);
      
      // Update memory after successful action
      if (result.success) {
        await updateAgentMemory(userId, {
          action_executed: {
            type: action.pendingAction.type,
            data: action.pendingAction.data,
            timestamp: new Date().toISOString()
          }
        });
      }
      
      if (result.success) {
        return new Response(JSON.stringify({ 
          response: `✅ Changes applied successfully! ${result.message}`,
          actionExecuted: true
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        return new Response(JSON.stringify({ 
          response: `❌ Failed to apply changes: ${result.error}`,
          actionExecuted: false
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Load agent memory and get comprehensive user data
    console.log('Loading agent memory and user data...');
    const [agentMemory, userData, marketData] = await Promise.all([
      loadAgentMemory(userId),
      getUserFinancialData(userId),
      getMarketAnalysis()
    ]);
    
    console.log('Data loaded:', { 
      hasMemory: !!agentMemory, 
      financesExist: !!userData.finances, 
      goalsCount: userData.goals.length,
      assetsCount: userData.assets.length,
      debtsCount: userData.debts.length,
      incomeStreamsCount: userData.incomeStreams.length,
      expenseStreamsCount: userData.expenseStreams.length,
      depositsCount: userData.deposits.length,
      hasMarketData: !!marketData
    });
    
    // Analyze message for potential actions
    console.log('Analyzing user message with full context...');
    const { analysis, pendingAction } = await analyzeUserMessage(message, userData, agentMemory, marketData, messages, groqApiKey as string, model);
    console.log('Analysis complete:', { 
      analysisLength: analysis.length, 
      hasPendingAction: !!pendingAction 
    });

    // Update agent memory with new interaction
    await updateAgentMemory(userId, {
      last_interaction: {
        user_message: message,
        ai_response: analysis,
        pending_action: pendingAction,
        timestamp: new Date().toISOString()
      }
    });

    return new Response(JSON.stringify({ 
      response: analysis,
      pendingAction: pendingAction
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-financial-agent function:', error);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to process request',
        response: `Sorry, I encountered an error: ${error.message || 'Unknown error'}. Please try again.`,
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

async function getUserFinancialData(userId: string) {
  try {
    const [
      financesResult, 
      goalsResult, 
      assetsResult, 
      debtsResult,
      incomeStreamsResult,
      expenseStreamsResult,
      depositsResult
    ] = await Promise.all([
      supabase.from('personal_finances').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('financial_goals').select('*').eq('user_id', userId),
      supabase.from('assets').select('*').eq('user_id', userId),
      supabase.from('debts').select('*').eq('user_id', userId),
      supabase.from('income_streams').select('*').eq('user_id', userId),
      supabase.from('expense_streams').select('*').eq('user_id', userId),
      supabase.from('deposits').select('*').eq('user_id', userId)
    ]);

    return {
      finances: financesResult.data || { monthly_income: 0, monthly_expenses: 0, net_savings: 0, monthly_investing_amount: 0 },
      goals: goalsResult.data || [],
      assets: assetsResult.data || [],
      debts: debtsResult.data || [],
      incomeStreams: incomeStreamsResult.data || [],
      expenseStreams: expenseStreamsResult.data || [],
      deposits: depositsResult.data || []
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
      deposits: []
    };
  }
}

async function loadAgentMemory(userId: string) {
  try {
    const { data } = await supabase
      .from('ai_agent_memory')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    return data;
  } catch (error) {
    console.error('Error loading agent memory:', error);
    return null;
  }
}

async function updateAgentMemory(userId: string, memoryUpdate: any) {
  try {
    const { data: existing } = await supabase
      .from('ai_agent_memory')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      const updatedMemory = { ...existing.memory, ...memoryUpdate };
      await supabase
        .from('ai_agent_memory')
        .update({ memory: updatedMemory, updated_at: new Date().toISOString() })
        .eq('user_id', userId);
    } else {
      await supabase
        .from('ai_agent_memory')
        .insert({
          user_id: userId,
          memory: memoryUpdate,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    }
  } catch (error) {
    console.error('Error updating agent memory:', error);
  }
}

async function getMarketAnalysis() {
  try {
    const { data, error } = await supabase.functions.invoke('market-analysis', {
      body: { analysis_type: 'overview' }
    });
    
    if (error) {
      console.error('Market analysis error:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error getting market analysis:', error);
    return null;
  }
}

async function analyzeUserMessage(
  message: string, 
  userData: any, 
  agentMemory: any, 
  marketData: any, 
  messages: Message[] = [],
  groqApiKey: string,
  preferredModel?: string
): Promise<{ analysis: string, pendingAction: PendingAction | null }> {
  
  const conversationHistory = messages.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n');
  
  const systemPrompt = `You are an AI financial advisor agent with comprehensive access to user data and tools. You can:

## Your Capabilities:
1. **Analyze and update personal finances**: income, expenses, savings, investing amounts
2. **Manage income streams**: add salary, rent, bonuses, freelance income
3. **Manage expense streams**: add fixed, variable, and one-time expenses
4. **Debt management**: add, update, or delete debts with payment plans
5. **Goal management**: create and track financial goals
6. **Deposit management**: create savings accounts, CDs, investment-linked deposits
7. **Market analysis**: access current market trends and investment opportunities
8. **Memory**: remember past conversations and user preferences

## Current User Financial Overview:
**Personal Finances:**
- Monthly Income: $${userData.finances.monthly_income}
- Monthly Expenses: $${userData.finances.monthly_expenses}
- Net Savings: $${userData.finances.net_savings}
- Monthly Investing: $${userData.finances.monthly_investing_amount}

**Income Streams (${userData.incomeStreams.length}):**
${userData.incomeStreams.map(s => `- ${s.name}: $${s.amount} (${s.income_type})`).join('\n') || '- No income streams set up'}

**Expense Streams (${userData.expenseStreams.length}):**
${userData.expenseStreams.map(s => `- ${s.name}: $${s.amount} (${s.expense_type})`).join('\n') || '- No expense streams set up'}

**Debts (${userData.debts.length}):**
${userData.debts.map(d => `- ${d.name}: $${d.total_amount - d.paid_amount} remaining (Monthly: $${d.monthly_payment})`).join('\n') || '- No active debts'}

**Financial Goals (${userData.goals.length}):**
${userData.goals.map(g => `- ${g.title}: $${g.current_amount}/$${g.target_amount} (${Math.round((g.current_amount/g.target_amount)*100)}%)`).join('\n') || '- No financial goals set'}

**Deposits/Savings (${userData.deposits.length}):**
${userData.deposits.map(d => `- ${d.deposit_type}: $${d.principal} at ${d.rate}%`).join('\n') || '- No deposits/savings accounts'}

**Assets/Portfolio (${userData.assets.length}):**
${userData.assets.map(a => `- ${a.asset_name} (${a.asset_type}): ${a.quantity || 'N/A'} units`).join('\n') || '- No portfolio assets'}

## Agent Memory:
${agentMemory ? JSON.stringify(agentMemory.memory, null, 2) : 'No previous memory'}

## Market Context:
${marketData ? JSON.stringify(marketData, null, 2) : 'Market data unavailable'}

## Recent Conversation:
${conversationHistory}

## Instructions:
When users request changes or additions, propose specific actions. Respond in JSON format:

For data changes:
{
  "analysis": "Your conversational response with analysis",
  "action": {
    "type": "update_income|update_expenses|update_savings|update_investing|add_income_stream|add_expense_stream|add_debt|add_goal|add_deposit|update_debt|delete_debt",
    "data": { relevant_fields },
    "description": "Clear description of what will be changed"
  }
}

For advice only:
{
  "analysis": "Your comprehensive financial advice"
}

Be proactive in suggesting improvements, identifying trends, and providing personalized advice based on their complete financial picture.`;

  console.log('Calling GROQ Chat Completions with enhanced context...');

  // Determine model: prefer request input, then env, default to 8B for reliability
  const selectedModel = (preferredModel === '8b' || preferredModel === 'llama-3.1-8b-instant')
    ? 'llama-3.1-8b-instant'
    : (preferredModel === '70b' || preferredModel === 'llama-3.3-70b-versatile')
      ? 'llama-3.3-70b-versatile'
      : (Deno.env.get('GROQ_MODEL') || 'llama-3.1-8b-instant');

  const chatMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.slice(-5).map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: message }
  ];

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: selectedModel,
      messages: chatMessages,
      max_tokens: 1000,
      temperature: 0.2,
    }),
  });

  console.log('GROQ response status:', response.status);

  if (!response.ok) {
    const errText = await response.text();
    console.error('GROQ API error:', response.status, response.statusText, errText);
    throw new Error(`GROQ API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log('GROQ response data (truncated):', JSON.stringify({
    model: data.model,
    usage: data.usage,
    messagePreview: data.choices?.[0]?.message?.content?.slice(0, 200)
  }));

  const aiResponse = data.choices?.[0]?.message?.content?.trim() || JSON.stringify(data);

  console.log('AI response content (first 500 chars):', aiResponse.slice(0, 500));

  try {
    const parsed = JSON.parse(aiResponse);
    return {
      analysis: parsed.analysis,
      pendingAction: parsed.action || null
    };
  } catch (parseError) {
    console.log('Response is not JSON, treating as plain text');
    return {
      analysis: aiResponse,
      pendingAction: null
    };
  }
}

async function executePendingAction(userId: string, action: PendingAction): Promise<{ success: boolean, message?: string, error?: string }> {
  try {
    switch (action.type) {
        case 'update_income':
          // Accept flexible field names from the LLM and nested income_streams
          const streams = action?.data?.income_streams ?? action?.data?.incomeStreams ?? action?.data?.streams;
          const directRaw = action?.data?.monthly_income ?? action?.data?.income ?? action?.data?.amount ?? action?.data?.salary;
          let resolvedRaw: any = directRaw;
          if ((resolvedRaw === undefined || resolvedRaw === null || Number.isNaN(Number(resolvedRaw))) && Array.isArray(streams) && streams.length > 0) {
            const salaryStream = streams.find((s: any) => s?.name?.toLowerCase?.() === 'salary') ?? streams[0];
            resolvedRaw = salaryStream?.amount ?? salaryStream?.value;
          }
          const incomeValue = Number(resolvedRaw);
          if (!Number.isFinite(incomeValue)) {
            return { success: false, error: 'Invalid income amount provided' };
          }

          // Update personal_finances.monthly_income via upsert on user_id
          const { error: incomeError } = await supabase
            .from('personal_finances')
            .upsert(
              { 
                user_id: userId, 
                monthly_income: incomeValue,
                updated_at: new Date().toISOString()
              },
              { onConflict: 'user_id' }
            );
          if (incomeError) throw incomeError;

          // Keep "salary" income stream in sync as well
          const { data: existingSalary, error: fetchSalaryError } = await supabase
            .from('income_streams')
            .select('id')
            .eq('user_id', userId)
            .eq('name', 'salary')
            .maybeSingle();
          if (fetchSalaryError) throw fetchSalaryError;

          if (existingSalary?.id) {
            const { error: updateSalaryError } = await supabase
              .from('income_streams')
              .update({
                amount: incomeValue,
                income_type: 'salary',
                is_active: true,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingSalary.id)
              .eq('user_id', userId);
            if (updateSalaryError) throw updateSalaryError;
          } else {
            const { error: insertSalaryError } = await supabase
              .from('income_streams')
              .insert({
                user_id: userId,
                name: 'salary',
                amount: incomeValue,
                income_type: 'salary',
                is_active: true,
                created_at: new Date().toISOString()
              });
            if (insertSalaryError) throw insertSalaryError;
          }

          return { success: true, message: `Monthly income updated to $${incomeValue}` };

        case 'update_expenses':
          const { error: expensesError } = await supabase
            .from('personal_finances')
            .upsert(
              { 
                user_id: userId, 
                monthly_expenses: action.data.monthly_expenses,
                updated_at: new Date().toISOString()
              },
              { onConflict: 'user_id' }
            );
          if (expensesError) throw expensesError;
          return { success: true, message: `Monthly expenses updated to $${action.data.monthly_expenses}` };

        case 'update_savings':
          const { error: savingsError } = await supabase
            .from('personal_finances')
            .upsert(
              { 
                user_id: userId, 
                net_savings: action.data.net_savings,
                updated_at: new Date().toISOString()
              },
              { onConflict: 'user_id' }
            );
          if (savingsError) throw savingsError;
          return { success: true, message: `Net savings updated to $${action.data.net_savings}` };

        case 'update_investing':
          const { error: investingError } = await supabase
            .from('personal_finances')
            .upsert(
              { 
                user_id: userId, 
                monthly_investing_amount: action.data.monthly_investing_amount,
                updated_at: new Date().toISOString()
              },
              { onConflict: 'user_id' }
            );
          if (investingError) throw investingError;
          return { success: true, message: `Monthly investing amount updated to $${action.data.monthly_investing_amount}` };

      case 'add_income_stream':
        const { error: incomeStreamError } = await supabase
          .from('income_streams')
          .insert({ 
            user_id: userId, 
            ...action.data,
            created_at: new Date().toISOString()
          });
        if (incomeStreamError) throw incomeStreamError;
        return { success: true, message: `Income stream "${action.data.name}" added: $${action.data.amount} (${action.data.income_type})` };

      case 'add_expense_stream':
        const { error: expenseStreamError } = await supabase
          .from('expense_streams')
          .insert({ 
            user_id: userId, 
            ...action.data,
            created_at: new Date().toISOString()
          });
        if (expenseStreamError) throw expenseStreamError;
        return { success: true, message: `Expense stream "${action.data.name}" added: $${action.data.amount} (${action.data.expense_type})` };

      case 'add_debt':
        // Normalize incoming fields from the LLM to match DB schema
        const d = action?.data || {};
        const mappedNewDebt: any = {
          name: d.name ?? d.debt_name ?? d.title,
          total_amount: Number(d.total_amount ?? d.amount ?? d.principal ?? 0),
          paid_amount: Number(d.paid_amount ?? 0),
          monthly_payment: Number(d.monthly_payment ?? d.monthly ?? d.payment ?? 0),
          interest_rate: Number(d.interest_rate ?? d.interest ?? 0),
          duration_months: Number(d.duration_months ?? d.months ?? 0),
          start_date: d.start_date ?? new Date().toISOString().slice(0, 10),
        };
        if (!mappedNewDebt.name || !Number.isFinite(mappedNewDebt.total_amount)) {
          return { success: false, error: 'Invalid debt payload (name/total_amount required)' };
        }
        const { error: debtError } = await supabase
          .from('debts')
          .insert({ 
            user_id: userId, 
            ...mappedNewDebt,
            created_at: new Date().toISOString()
          });
        if (debtError) throw debtError;
        return { success: true, message: `Debt "${mappedNewDebt.name}" added: $${mappedNewDebt.total_amount} total, $${mappedNewDebt.monthly_payment}/month` };

      case 'update_debt':
        // Normalize and update only valid columns
        const ud = action?.data || {};
        const debtId = ud.id ?? ud.debt_id;
        if (!debtId) return { success: false, error: 'Debt id is required' };

        const updatePayload: any = {};
        const toNum = (x: any) => (x === undefined || x === null ? undefined : Number(x));
        const setIfNum = (key: string, val: any) => {
          const n = toNum(val);
          if (Number.isFinite(n)) updatePayload[key] = n;
        };

        if (ud.name ?? ud.debt_name ?? ud.title) updatePayload.name = ud.name ?? ud.debt_name ?? ud.title;
        setIfNum('total_amount', ud.total_amount ?? ud.amount ?? ud.principal);
        setIfNum('paid_amount', ud.paid_amount);
        setIfNum('monthly_payment', ud.monthly_payment ?? ud.monthly ?? ud.payment);
        setIfNum('interest_rate', ud.interest_rate ?? ud.interest);
        setIfNum('duration_months', ud.duration_months ?? ud.months);
        if (ud.start_date) updatePayload.start_date = ud.start_date;
        updatePayload.updated_at = new Date().toISOString();

        const { error: updateDebtError } = await supabase
          .from('debts')
          .update(updatePayload)
          .eq('id', debtId)
          .eq('user_id', userId);
        if (updateDebtError) throw updateDebtError;
        return { success: true, message: `Debt updated successfully` };

      case 'delete_debt':
        const { error: deleteDebtError } = await supabase
          .from('debts')
          .delete()
          .eq('id', action.data.id)
          .eq('user_id', userId);
        if (deleteDebtError) throw deleteDebtError;
        return { success: true, message: `Debt deleted successfully` };

      case 'add_goal':
        const { error: goalError } = await supabase
          .from('financial_goals')
          .insert({ 
            user_id: userId, 
            ...action.data,
            created_at: new Date().toISOString()
          });
        if (goalError) throw goalError;
        return { success: true, message: `Financial goal "${action.data.title}" added: $${action.data.target_amount} by ${action.data.target_date}` };

      case 'update_goal':
        const { error: updateGoalError } = await supabase
          .from('financial_goals')
          .update({ 
            ...action.data,
            updated_at: new Date().toISOString()
          })
          .eq('id', action.data.id)
          .eq('user_id', userId);
        if (updateGoalError) throw updateGoalError;
        return { success: true, message: `Financial goal updated successfully` };

      case 'add_deposit':
        const { data: depositData, error: depositError } = await supabase.functions.invoke('deposits', {
          body: {
            ...action.data,
            user_id: userId
          }
        });
        if (depositError) throw depositError;
        return { success: true, message: `Deposit account created: ${action.data.deposit_type} with $${action.data.principal} at ${action.data.rate}% rate` };

      default:
        return { success: false, error: 'Unknown action type' };
    }
  } catch (error) {
    console.error('Error executing action:', error);
    return { success: false, error: error.message };
  }
}