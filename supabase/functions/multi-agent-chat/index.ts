import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

async function getUserFinancialData(userId: string, supabase: any) {
  try {
    const [
      profile,
      personalFinances,
      debts,
      assets,
      portfolioGoals,
      incomeStreams,
      expenseStreams,
      portfolios,
      newsArticles
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('personal_finances').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('debts').select('*').eq('user_id', userId),
      supabase.from('assets').select('*').eq('user_id', userId),
      supabase.from('portfolio_goals').select('*').eq('user_id', userId),
      supabase.from('income_streams').select('*').eq('user_id', userId),
      supabase.from('expense_streams').select('*').eq('user_id', userId),
      supabase.from('portfolios').select('*').eq('user_id', userId),
      supabase.from('news_articles').select('*').limit(5)
    ]);

    return {
      profile: profile.data,
      personalFinances: personalFinances.data,
      debts: debts.data || [],
      assets: assets.data || [],
      portfolioGoals: portfolioGoals.data || [],
      incomeStreams: incomeStreams.data || [],
      expenseStreams: expenseStreams.data || [],
      portfolios: portfolios.data || [],
      newsArticles: newsArticles.data || []
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

async function callAgent(agentName: string, payload: any): Promise<any> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/agent-${agentName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      console.error(`Agent ${agentName} error:`, await response.text());
      return { agent: agentName, output: `${agentName} agent unavailable`, error: true };
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error calling ${agentName} agent:`, error);
    return { agent: agentName, output: `${agentName} agent error`, error: true };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId } = await req.json();
    console.log('Multi-agent chat processing:', message);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    // Fetch user data
    let userData = null;
    if (userId) {
      userData = await getUserFinancialData(userId, supabase);
    }

    // 1️⃣ TRANSLATOR: Detect language and unify
    console.log('Step 1: Translator');
    const translatorResult = await callAgent('translator', { 
      text: message, 
      mode: 'unify' 
    });
    
    const unifiedText = translatorResult.processedText || message;
    const originalLanguage = translatorResult.originalLanguage || 'ar';
    
    // 2️⃣ ROUTER: Detect intent and create plan
    console.log('Step 2: Router');
    const routerResult = await callAgent('router', { 
      text: unifiedText,
      originalLanguage 
    });
    
    const agentsToActivate = routerResult.agentsToActivate || ['finance'];
    const orchestrationPlan = routerResult.plan || 'Combine all outputs';
    
    // 3️⃣ AGENTS POOL: Run agents in parallel
    console.log('Step 3: Activating agents:', agentsToActivate);
    const agentPromises = agentsToActivate.map((agentName: string) => {
      const payload: any = { query: unifiedText };
      
      if (agentName === 'finance' || agentName === 'portfolio' || agentName === 'data_analyst') {
        payload.userData = userData;
      }
      
      if (agentName === 'summarizer') {
        payload.newsData = userData;
      }
      
      return callAgent(agentName, payload);
    });
    
    const agentResults = await Promise.all(agentPromises);
    
    let finalResponse: string;
    
    // If only creative agent is activated, skip orchestration for faster response
    if (agentsToActivate.length === 1 && agentsToActivate[0] === 'creative') {
      finalResponse = agentResults[0].output;
    } else {
      // 4️⃣ ORCHESTRATOR: Combine outputs
      console.log('Step 4: Orchestrator');
      const orchestratorResult = await callAgent('orchestrator', {
        agentOutputs: agentResults,
        plan: orchestrationPlan
      });
      
      const internalResponse = orchestratorResult.output || 'Unable to generate response';
      
      // 5️⃣ TRANSLATOR: Final language adjustment
      console.log('Step 5: Final translation');
      const finalResult = await callAgent('translator', {
        text: internalResponse,
        mode: 'finalize',
        targetLanguage: originalLanguage,
        internalText: internalResponse
      });
      
      finalResponse = finalResult.processedText || internalResponse;
    }

    return new Response(JSON.stringify({ 
      response: finalResponse,
      metadata: {
        originalLanguage,
        agentsUsed: agentsToActivate,
        plan: orchestrationPlan
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Multi-agent chat error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to process request',
      response: 'Sorry, I encountered an error. Please try again.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
