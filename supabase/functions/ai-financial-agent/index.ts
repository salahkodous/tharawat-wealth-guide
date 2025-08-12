import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

interface PendingAction {
  type: 'update_income' | 'update_expenses' | 'update_savings' | 'update_investing' | 'add_goal' | 'update_goal';
  data: any;
  description: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId, action } = await req.json();

    // If this is a confirmation action, execute the pending action
    if (action?.type === 'confirm' && action?.pendingAction) {
      const result = await executePendingAction(userId, action.pendingAction);
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

    // Get user's current financial data
    const userData = await getUserFinancialData(userId);
    
    // Analyze message for potential actions
    const { analysis, pendingAction } = await analyzeUserMessage(message, userData);

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
    const [financesResult, goalsResult, assetsResult, debtsResult] = await Promise.all([
      supabase.from('personal_finances').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('financial_goals').select('*').eq('user_id', userId),
      supabase.from('assets').select('*').eq('user_id', userId),
      supabase.from('debts').select('*').eq('user_id', userId)
    ]);

    return {
      finances: financesResult.data || { monthly_income: 0, monthly_expenses: 0, net_savings: 0, monthly_investing_amount: 0 },
      goals: goalsResult.data || [],
      assets: assetsResult.data || [],
      debts: debtsResult.data || []
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    return {
      finances: { monthly_income: 0, monthly_expenses: 0, net_savings: 0, monthly_investing_amount: 0 },
      goals: [],
      assets: [],
      debts: []
    };
  }
}

async function analyzeUserMessage(message: string, userData: any): Promise<{ analysis: string, pendingAction: PendingAction | null }> {
  const systemPrompt = `You are an AI financial advisor agent specializing in MENA markets. You can:

1. Provide financial analysis and advice
2. Suggest changes to user's financial data
3. Help manage goals and investments

When a user mentions specific financial changes (like "my income is 9000" or "I want to save 2000 monthly"), you should:
- Acknowledge the information
- Propose the specific change
- Ask for confirmation before applying changes
- Be conversational and helpful

Current user financial data:
- Monthly Income: ${userData.finances.monthly_income}
- Monthly Expenses: ${userData.finances.monthly_expenses}
- Net Savings: ${userData.finances.net_savings}
- Monthly Investing: ${userData.finances.monthly_investing_amount}
- Goals: ${userData.goals.length} active goals
- Assets: ${userData.assets.length} portfolio items
- Debts: ${userData.debts.length} active debts

If you detect a request to change financial data, respond in JSON format:
{
  "analysis": "Your conversational response",
  "action": {
    "type": "update_income|update_expenses|update_savings|update_investing|add_goal",
    "data": { "field": value },
    "description": "What will be changed"
  }
}

Otherwise, just provide helpful financial advice in JSON format:
{
  "analysis": "Your response"
}`;

  console.log('Calling OpenRouter API...');
  
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
      max_tokens: 2000,
    }),
  });

  console.log('OpenRouter response status:', response.status);
  
  if (!response.ok) {
    console.error('OpenRouter API error:', response.status, response.statusText);
    throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log('OpenRouter response data:', JSON.stringify(data, null, 2));

  // Check if response has the expected structure
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
    // If not JSON, treat as regular response
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
        return { success: true, message: `Monthly income updated to ${action.data.monthly_income}` };

      case 'update_expenses':
        const { error: expensesError } = await supabase
          .from('personal_finances')
          .upsert({ 
            user_id: userId, 
            monthly_expenses: action.data.monthly_expenses,
            updated_at: new Date().toISOString()
          });
        if (expensesError) throw expensesError;
        return { success: true, message: `Monthly expenses updated to ${action.data.monthly_expenses}` };

      case 'update_savings':
        const { error: savingsError } = await supabase
          .from('personal_finances')
          .upsert({ 
            user_id: userId, 
            net_savings: action.data.net_savings,
            updated_at: new Date().toISOString()
          });
        if (savingsError) throw savingsError;
        return { success: true, message: `Net savings updated to ${action.data.net_savings}` };

      case 'update_investing':
        const { error: investingError } = await supabase
          .from('personal_finances')
          .upsert({ 
            user_id: userId, 
            monthly_investing_amount: action.data.monthly_investing_amount,
            updated_at: new Date().toISOString()
          });
        if (investingError) throw investingError;
        return { success: true, message: `Monthly investing amount updated to ${action.data.monthly_investing_amount}` };

      case 'add_goal':
        const { error: goalError } = await supabase
          .from('financial_goals')
          .insert({ 
            user_id: userId, 
            ...action.data,
            created_at: new Date().toISOString()
          });
        if (goalError) throw goalError;
        return { success: true, message: `New financial goal "${action.data.title}" added` };

      default:
        return { success: false, error: 'Unknown action type' };
    }
  } catch (error) {
    console.error('Error executing action:', error);
    return { success: false, error: error.message };
  }
}