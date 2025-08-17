import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

console.log('Environment check:');
console.log('OPENROUTER_API_KEY exists:', !!openRouterApiKey);
console.log('SUPABASE_URL exists:', !!supabaseUrl);
console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    const { message, userId, action, messages } = await req.json();
    console.log('Request data:', { message, userId, actionType: action?.type, messageHistory: messages?.length });

    // Check if API key exists
    if (!openRouterApiKey) {
      console.error('OPENROUTER_API_KEY is not configured');
      return new Response(JSON.stringify({ 
        error: 'OPENROUTER_API_KEY not configured',
        response: 'I need the OpenRouter API key to be configured. Please check the Supabase Edge Function secrets.'
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
    const { analysis, pendingAction } = await analyzeUserMessage(message, userData, agentMemory, marketData, messages);
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
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to process request',
        response: 'Sorry, I encountered an error while processing your request. Please try again.'
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
  messages: Message[] = []
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

  console.log('Calling OpenRouter API with enhanced context...');
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openRouterApiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://lovable.dev',
      'X-Title': 'Tharawat Investment Platform'
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 3000,
    }),
  });

  console.log('OpenRouter response status:', response.status);
  
  if (!response.ok) {
    console.error('OpenRouter API error:', response.status, response.statusText);
    throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log('OpenRouter response data:', JSON.stringify(data, null, 2));

  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    console.error('Unexpected OpenRouter response structure:', data);
    throw new Error('Invalid response format from OpenRouter API');
  }

  const aiResponse = data.choices[0].message.content;
  console.log('AI response content:', aiResponse);

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
        const { error: incomeError } = await supabase
          .from('personal_finances')
          .upsert({ 
            user_id: userId, 
            monthly_income: action.data.monthly_income,
            updated_at: new Date().toISOString()
          });
        if (incomeError) throw incomeError;
        return { success: true, message: `Monthly income updated to $${action.data.monthly_income}` };

      case 'update_expenses':
        const { error: expensesError } = await supabase
          .from('personal_finances')
          .upsert({ 
            user_id: userId, 
            monthly_expenses: action.data.monthly_expenses,
            updated_at: new Date().toISOString()
          });
        if (expensesError) throw expensesError;
        return { success: true, message: `Monthly expenses updated to $${action.data.monthly_expenses}` };

      case 'update_savings':
        const { error: savingsError } = await supabase
          .from('personal_finances')
          .upsert({ 
            user_id: userId, 
            net_savings: action.data.net_savings,
            updated_at: new Date().toISOString()
          });
        if (savingsError) throw savingsError;
        return { success: true, message: `Net savings updated to $${action.data.net_savings}` };

      case 'update_investing':
        const { error: investingError } = await supabase
          .from('personal_finances')
          .upsert({ 
            user_id: userId, 
            monthly_investing_amount: action.data.monthly_investing_amount,
            updated_at: new Date().toISOString()
          });
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
        const { error: debtError } = await supabase
          .from('debts')
          .insert({ 
            user_id: userId, 
            ...action.data,
            created_at: new Date().toISOString()
          });
        if (debtError) throw debtError;
        return { success: true, message: `Debt "${action.data.name}" added: $${action.data.total_amount} total, $${action.data.monthly_payment}/month` };

      case 'update_debt':
        const { error: updateDebtError } = await supabase
          .from('debts')
          .update({ 
            ...action.data,
            updated_at: new Date().toISOString()
          })
          .eq('id', action.data.id)
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