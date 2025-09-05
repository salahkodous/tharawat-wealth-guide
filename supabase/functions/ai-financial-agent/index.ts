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

interface MarketDataSummary {
  stocks: {
    total: number;
    countries: string[];
    top_performers: any[];
    best_performers?: any[];
    worst_performers?: any[];
  };
  crypto: {
    total: number;
    top_by_market_cap: any[];
    market_cap_total?: number;
    trending?: any[];
  };
  real_estate: {
    total_neighborhoods: number;
    cities: string[];
    avg_price_ranges: any[];
    hottest_areas?: any[];
  };
  bonds: {
    total: number;
    avg_yield: number;
    types: string[];
    government_vs_corporate?: any;
  };
  etfs: {
    total: number;
    categories: string[];
    performance_leaders?: any[];
  };
  gold_prices: {
    current_24k: number | null;
    change_24h: number | null;
    trend?: string;
  };
  currency_rates: {
    major_pairs: any[];
    strongest_currencies?: any[];
  };
  bank_products: {
    total: number;
    best_rates: any[];
    savings_vs_cd?: any;
  };
}

const getMarketDataSummary = async (supabase: any): Promise<MarketDataSummary> => {
  try {
    // Enhanced stocks data with performance analysis
    const { data: stocks } = await supabase
      .from('stocks')
      .select('name, symbol, price, change_percent, country, market_cap, volume, exchange')
      .order('market_cap', { ascending: false });

    // Enhanced crypto data
    const { data: crypto } = await supabase
      .from('cryptocurrencies')
      .select('name, symbol, price_usd, change_percentage_24h, market_cap, rank, volume_24h')
      .order('rank', { ascending: true });

    // Enhanced real estate data
    const { data: realEstate } = await supabase
      .from('real_estate_prices')
      .select('city_name, neighborhood_name, avg_price_per_meter, property_type, min_price, max_price, total_properties')
      .order('avg_price_per_meter', { ascending: false });

    // Enhanced bonds data
    const { data: bonds } = await supabase
      .from('bonds')
      .select('name, bond_type, yield_to_maturity, current_price, issuer, maturity_date, coupon_rate')
      .order('yield_to_maturity', { ascending: false });

    // Enhanced ETFs data
    const { data: etfs } = await supabase
      .from('etfs')
      .select('name, symbol, price, change_percentage, market_cap, category, expense_ratio, dividend_yield')
      .order('market_cap', { ascending: false });

    // Gold prices with trend analysis
    const { data: goldPrices } = await supabase
      .from('gold_prices')
      .select('price_24k_egp, price_22k_egp, price_21k_egp, price_18k_egp, change_percentage_24h, source, price_per_ounce_usd')
      .order('last_updated', { ascending: false })
      .limit(5);

    // Enhanced currency rates
    const { data: currencyRates } = await supabase
      .from('currency_rates')
      .select('base_currency, target_currency, exchange_rate, change_percentage_24h, bid_rate, ask_rate')
      .order('last_updated', { ascending: false });

    // Enhanced bank products
    const { data: bankProducts } = await supabase
      .from('bank_products')
      .select('bank_name, product_name, interest_rate, product_type, minimum_amount, maximum_amount, term_months, features')
      .eq('is_active', true)
      .order('interest_rate', { ascending: false });

    // Performance analysis
    const bestStocks = stocks?.filter(s => s.change_percent > 0).sort((a, b) => b.change_percent - a.change_percent).slice(0, 5) || [];
    const worstStocks = stocks?.filter(s => s.change_percent < 0).sort((a, b) => a.change_percent - b.change_percent).slice(0, 5) || [];
    const trendingCrypto = crypto?.filter(c => c.change_percentage_24h > 5).slice(0, 5) || [];
    const hottestAreas = realEstate?.sort((a, b) => (b.total_properties || 0) - (a.total_properties || 0)).slice(0, 5) || [];
    const performanceETFs = etfs?.filter(e => e.change_percentage > 0).sort((a, b) => b.change_percentage - a.change_percentage).slice(0, 5) || [];

    return {
      stocks: {
        total: stocks?.length || 0,
        countries: [...new Set(stocks?.map(s => s.country) || [])],
        top_performers: stocks?.slice(0, 10) || [],
        best_performers: bestStocks,
        worst_performers: worstStocks
      },
      crypto: {
        total: crypto?.length || 0,
        top_by_market_cap: crypto?.slice(0, 10) || [],
        market_cap_total: crypto?.reduce((sum, c) => sum + (c.market_cap || 0), 0) || 0,
        trending: trendingCrypto
      },
      real_estate: {
        total_neighborhoods: realEstate?.length || 0,
        cities: [...new Set(realEstate?.map(r => r.city_name) || [])],
        avg_price_ranges: realEstate?.slice(0, 10) || [],
        hottest_areas: hottestAreas
      },
      bonds: {
        total: bonds?.length || 0,
        avg_yield: bonds?.reduce((sum, b) => sum + (b.yield_to_maturity || 0), 0) / (bonds?.length || 1),
        types: [...new Set(bonds?.map(b => b.bond_type) || [])],
        government_vs_corporate: {
          government: bonds?.filter(b => b.bond_type === 'GOVERNMENT').length || 0,
          corporate: bonds?.filter(b => b.bond_type === 'CORPORATE').length || 0
        }
      },
      etfs: {
        total: etfs?.length || 0,
        categories: [...new Set(etfs?.map(e => e.category) || [])],
        performance_leaders: performanceETFs
      },
      gold_prices: {
        current_24k: goldPrices?.[0]?.price_24k_egp || null,
        change_24h: goldPrices?.[0]?.change_percentage_24h || null,
        trend: goldPrices?.[0]?.change_percentage_24h > 0 ? 'rising' : goldPrices?.[0]?.change_percentage_24h < 0 ? 'falling' : 'stable'
      },
      currency_rates: {
        major_pairs: currencyRates?.filter(r => ['USD', 'EUR', 'GBP'].includes(r.base_currency)) || [],
        strongest_currencies: currencyRates?.filter(r => r.change_percentage_24h > 0).sort((a, b) => b.change_percentage_24h - a.change_percentage_24h).slice(0, 5) || []
      },
      bank_products: {
        total: bankProducts?.length || 0,
        best_rates: bankProducts?.slice(0, 10) || [],
        savings_vs_cd: {
          savings: bankProducts?.filter(p => p.product_type?.toLowerCase().includes('savings')).length || 0,
          cd: bankProducts?.filter(p => p.product_type?.toLowerCase().includes('deposit')).length || 0
        }
      }
    };
  } catch (error) {
    console.error('Error fetching market data:', error);
    return {
      stocks: { total: 0, countries: [], top_performers: [], best_performers: [], worst_performers: [] },
      crypto: { total: 0, top_by_market_cap: [], market_cap_total: 0, trending: [] },
      real_estate: { total_neighborhoods: 0, cities: [], avg_price_ranges: [], hottest_areas: [] },
      bonds: { total: 0, avg_yield: 0, types: [], government_vs_corporate: { government: 0, corporate: 0 } },
      etfs: { total: 0, categories: [], performance_leaders: [] },
      gold_prices: { current_24k: null, change_24h: null, trend: 'stable' },
      currency_rates: { major_pairs: [], strongest_currencies: [] },
      bank_products: { total: 0, best_rates: [], savings_vs_cd: { savings: 0, cd: 0 } }
    };
  }
};

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

interface PendingAction {
  type: 'update_income' | 'update_expenses' | 'update_savings' | 'update_investing' | 'add_goal' | 'update_goal' | 
        'add_income_stream' | 'add_expense_stream' | 'add_debt' | 'add_deposit' | 'update_debt' | 'delete_debt' |
        'add_asset' | 'update_asset' | 'delete_asset' | 'rebalance_portfolio' | 'create_portfolio' |
        'update_goal_progress' | 'delete_goal' | 'update_deposit' | 'delete_deposit' |
        'add_portfolio_recommendation' | 'market_analysis_request';
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

    // Load agent memory and get comprehensive user data including market analysis
    console.log('Loading agent memory and comprehensive user data...');
    const [agentMemory, userData, marketDataSummary] = await Promise.all([
      loadAgentMemory(userId),
      getUserFinancialData(userId),
      getMarketDataSummary(supabase)
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
      portfoliosCount: userData.portfolios.length,
      hasMarketData: !!marketDataSummary,
      stocksAvailable: marketDataSummary.stocks.total,
      cryptoAvailable: marketDataSummary.crypto.total
    });
    
    // Analyze message for potential actions
    console.log('Analyzing user message with full context...');
    const { analysis, pendingAction } = await analyzeUserMessage(message, userData, agentMemory, marketDataSummary, messages, groqApiKey as string, model);
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
      depositsResult,
      portfoliosResult
    ] = await Promise.all([
      supabase.from('personal_finances').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('financial_goals').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('assets').select('*, portfolios(name)').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('debts').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('income_streams').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('expense_streams').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('deposits').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('portfolios').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    ]);

    // Calculate portfolio metrics
    const totalPortfolioValue = assetsResult.data?.reduce((sum, asset) => {
      const currentValue = (asset.current_price || asset.purchase_price || 0) * (asset.quantity || 1);
      return sum + currentValue;
    }, 0) || 0;

    const totalInvestment = assetsResult.data?.reduce((sum, asset) => {
      const purchaseValue = (asset.purchase_price || 0) * (asset.quantity || 1);
      return sum + purchaseValue;
    }, 0) || 0;

    const portfolioReturn = totalInvestment > 0 ? ((totalPortfolioValue - totalInvestment) / totalInvestment) * 100 : 0;

    // Calculate debt metrics
    const totalDebt = debtsResult.data?.reduce((sum, debt) => sum + (debt.total_amount - debt.paid_amount), 0) || 0;
    const monthlyDebtPayments = debtsResult.data?.reduce((sum, debt) => sum + (debt.monthly_payment || 0), 0) || 0;

    // Calculate savings metrics
    const totalSavings = depositsResult.data?.reduce((sum, deposit) => sum + deposit.principal, 0) || 0;
    const totalInterestAccrued = depositsResult.data?.reduce((sum, deposit) => sum + deposit.accrued_interest, 0) || 0;

    return {
      finances: financesResult.data || { monthly_income: 0, monthly_expenses: 0, net_savings: 0, monthly_investing_amount: 0 },
      goals: goalsResult.data || [],
      assets: assetsResult.data || [],
      debts: debtsResult.data || [],
      incomeStreams: incomeStreamsResult.data || [],
      expenseStreams: expenseStreamsResult.data || [],
      deposits: depositsResult.data || [],
      portfolios: portfoliosResult.data || [],
      // Calculated metrics
      metrics: {
        totalPortfolioValue,
        totalInvestment,
        portfolioReturn,
        totalDebt,
        monthlyDebtPayments,
        totalSavings,
        totalInterestAccrued,
        netWorth: totalPortfolioValue + totalSavings - totalDebt,
        debtToIncomeRatio: financesResult.data?.monthly_income ? (monthlyDebtPayments / financesResult.data.monthly_income) * 100 : 0,
        savingsRate: financesResult.data?.monthly_income ? ((financesResult.data.net_savings || 0) / financesResult.data.monthly_income) * 100 : 0
      }
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
      deposits: [],
      portfolios: [],
      metrics: {
        totalPortfolioValue: 0,
        totalInvestment: 0,
        portfolioReturn: 0,
        totalDebt: 0,
        monthlyDebtPayments: 0,
        totalSavings: 0,
        totalInterestAccrued: 0,
        netWorth: 0,
        debtToIncomeRatio: 0,
        savingsRate: 0
      }
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
1. **Personal Finance Management**: income, expenses, savings, investing amounts
2. **Income Stream Management**: add/update salary, rent, bonuses, freelance income
3. **Expense Stream Management**: add/update fixed, variable, and one-time expenses
4. **Debt Management**: add, update, or delete debts with payment plans
5. **Financial Goal Management**: create, track, and update financial goals
6. **Savings & Deposit Management**: create/manage savings accounts, CDs, investment-linked deposits
7. **Portfolio & Asset Management**: add/update/analyze investment assets and portfolios
8. **Market Analysis**: access real-time market data for stocks, crypto, bonds, ETFs, real estate, gold, currencies
9. **Investment Recommendations**: provide personalized investment advice based on user profile and market conditions
10. **Financial Analytics**: calculate ratios, returns, projections, and comprehensive financial health metrics
11. **Memory & Learning**: remember past conversations, preferences, and financial history

## Current User Financial Overview:

### Personal Finances Summary:
- Monthly Income: $${userData.finances.monthly_income}
- Monthly Expenses: $${userData.finances.monthly_expenses}
- Net Savings: $${userData.finances.net_savings}
- Monthly Investing: $${userData.finances.monthly_investing_amount}

### Calculated Financial Metrics:
- Net Worth: $${userData.metrics?.netWorth || 0}
- Total Portfolio Value: $${userData.metrics?.totalPortfolioValue || 0}
- Portfolio Return: ${userData.metrics?.portfolioReturn?.toFixed(2) || 0}%
- Total Debt: $${userData.metrics?.totalDebt || 0}
- Total Savings: $${userData.metrics?.totalSavings || 0}
- Debt-to-Income Ratio: ${userData.metrics?.debtToIncomeRatio?.toFixed(1) || 0}%
- Savings Rate: ${userData.metrics?.savingsRate?.toFixed(1) || 0}%

### Detailed Financial Data:

**Income Streams (${userData.incomeStreams.length}):**
${userData.incomeStreams.map(s => `- ${s.name}: $${s.amount} (${s.income_type})`).join('\n') || '- No income streams set up'}

**Expense Streams (${userData.expenseStreams.length}):**
${userData.expenseStreams.map(s => `- ${s.name}: $${s.amount} (${s.expense_type})`).join('\n') || '- No expense streams set up'}

**Debts (${userData.debts.length}):**
${userData.debts.map(d => `- ${d.name}: $${d.total_amount - d.paid_amount} remaining (Monthly: $${d.monthly_payment}, Rate: ${d.interest_rate}%)`).join('\n') || '- No active debts'}

**Financial Goals (${userData.goals.length}):**
${userData.goals.map(g => `- ${g.title}: $${g.current_amount}/$${g.target_amount} (${Math.round((g.current_amount/(g.target_amount || 1))*100)}%) - Target: ${g.target_date || 'No date'}`).join('\n') || '- No financial goals set'}

**Deposits/Savings Accounts (${userData.deposits.length}):**
${userData.deposits.map(d => `- ${d.deposit_type}: $${d.principal} at ${d.rate}% (Interest: $${d.accrued_interest || 0})`).join('\n') || '- No deposits/savings accounts'}

**Investment Portfolios (${userData.portfolios.length}):**
${userData.portfolios.map(p => `- ${p.name} (Created: ${p.created_at?.slice(0,10)})`).join('\n') || '- No portfolios created'}

**Investment Assets (${userData.assets.length}):**
${userData.assets.map(a => {
  const currentValue = (a.current_price || a.purchase_price || 0) * (a.quantity || 1);
  const purchaseValue = (a.purchase_price || 0) * (a.quantity || 1);
  const returnPct = purchaseValue > 0 ? (((currentValue - purchaseValue) / purchaseValue) * 100).toFixed(1) : '0';
  return `- ${a.asset_name} (${a.asset_type}): ${a.quantity || 'N/A'} units, Value: $${currentValue.toFixed(2)}, Return: ${returnPct}%`;
}).join('\n') || '- No portfolio assets'}

## Live Market Data Available:

### Stocks (${marketData.stocks?.total || 0} available):
- Countries: ${marketData.stocks?.countries?.join(', ') || 'None'}
- Best Performers: ${marketData.stocks?.best_performers?.map(s => `${s.symbol} (+${s.change_percent}%)`).join(', ') || 'None'}
- Worst Performers: ${marketData.stocks?.worst_performers?.map(s => `${s.symbol} (${s.change_percent}%)`).join(', ') || 'None'}

### Cryptocurrency (${marketData.crypto?.total || 0} available):
- Total Market Cap: $${(marketData.crypto?.market_cap_total || 0).toLocaleString()}
- Trending: ${marketData.crypto?.trending?.map(c => `${c.symbol} (+${c.change_percentage_24h}%)`).join(', ') || 'None'}

### Real Estate (${marketData.real_estate?.total_neighborhoods || 0} neighborhoods):
- Cities: ${marketData.real_estate?.cities?.slice(0,5).join(', ') || 'None'}
- Hottest Areas: ${marketData.real_estate?.hottest_areas?.map(r => `${r.neighborhood_name}, ${r.city_name}`).slice(0,3).join(', ') || 'None'}

### Bonds (${marketData.bonds?.total || 0} available):
- Average Yield: ${marketData.bonds?.avg_yield?.toFixed(2) || 0}%
- Types: ${marketData.bonds?.types?.join(', ') || 'None'}
- Government: ${marketData.bonds?.government_vs_corporate?.government || 0}, Corporate: ${marketData.bonds?.government_vs_corporate?.corporate || 0}

### ETFs (${marketData.etfs?.total || 0} available):
- Categories: ${marketData.etfs?.categories?.slice(0,5).join(', ') || 'None'}
- Performance Leaders: ${marketData.etfs?.performance_leaders?.map(e => `${e.symbol} (+${e.change_percentage}%)`).join(', ') || 'None'}

### Gold Prices:
- 24K: ${marketData.gold_prices?.current_24k || 'N/A'} EGP (${marketData.gold_prices?.trend || 'stable'})
- 24H Change: ${marketData.gold_prices?.change_24h || 0}%

### Currency Rates:
- Major Pairs: ${marketData.currency_rates?.major_pairs?.map(r => `${r.base_currency}/${r.target_currency}: ${r.exchange_rate}`).slice(0,3).join(', ') || 'None'}
- Strongest: ${marketData.currency_rates?.strongest_currencies?.map(r => `${r.base_currency} (+${r.change_percentage_24h}%)`).slice(0,3).join(', ') || 'None'}

### Bank Products (${marketData.bank_products?.total || 0} available):
- Best Rates: ${marketData.bank_products?.best_rates?.map(p => `${p.bank_name} ${p.product_name}: ${p.interest_rate}%`).slice(0,3).join(', ') || 'None'}

## Agent Memory:
${agentMemory ? JSON.stringify(agentMemory.memory, null, 2) : 'No previous memory'}

## Recent Conversation:
${conversationHistory}

## Available Actions:
You can propose the following actions when users request changes:

**Financial Updates:**
- update_income, update_expenses, update_savings, update_investing
- add_income_stream, add_expense_stream
- add_debt, update_debt, delete_debt
- add_goal, update_goal, delete_goal, update_goal_progress
- add_deposit, update_deposit, delete_deposit

**Portfolio & Investment Actions:**
- add_asset, update_asset, delete_asset
- create_portfolio, rebalance_portfolio
- add_portfolio_recommendation

**Analysis Actions:**
- market_analysis_request

## Response Format:

For data changes/actions:
{
  "analysis": "Your detailed analysis and conversational response explaining the recommendation and its impact",
  "action": {
    "type": "action_type_from_above_list",
    "data": { relevant_fields_for_action },
    "description": "Clear description of what will be changed"
  }
}

For advice/analysis only:
{
  "analysis": "Your comprehensive financial analysis, investment advice, market insights, or portfolio recommendations"
}

## Guidelines:
- Always provide specific, actionable financial advice based on their complete financial picture
- Use real market data to make investment recommendations
- Identify financial risks and opportunities
- Calculate and explain financial ratios and metrics
- Suggest portfolio diversification and rebalancing when appropriate
- Warn about high debt-to-income ratios or poor savings rates
- Recommend suitable bank products or investment opportunities based on their risk profile
- Be proactive in suggesting financial improvements and optimizations`;

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
    
    // Check if the response contains action keywords - if so, try to extract action intent
    const actionKeywords = ['add', 'update', 'create', 'delete', 'remove'];
    const hasActionIntent = actionKeywords.some(keyword => 
      message.toLowerCase().includes(keyword) && 
      (message.toLowerCase().includes('stock') || 
       message.toLowerCase().includes('asset') || 
       message.toLowerCase().includes('portfolio'))
    );

    if (hasActionIntent && message.toLowerCase().includes('add') && message.toLowerCase().includes('stock')) {
      // Extract stock details from the message
      const stockMatch = message.match(/(\d+)\s+stock(?:s)?\s+of\s+([^,\n]+)/i);
      if (stockMatch) {
        const quantity = parseInt(stockMatch[1]);
        const stockName = stockMatch[2].trim();
        
        return {
          analysis: `I can add ${quantity} shares of ${stockName} to your portfolio. This will create a new asset entry with the current market price. Do you want me to proceed?`,
          pendingAction: {
            type: 'add_asset',
            data: {
              asset_name: stockName,
              asset_type: 'stocks',
              quantity: quantity,
              purchase_price: 115, // Default price - should be fetched from market data
              current_price: 115,
              country: 'Egypt'
            },
            description: `Add ${quantity} shares of ${stockName} to your portfolio at current market price`
          }
        };
      }
    }
    
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

      case 'update_goal_progress':
        const { error: progressError } = await supabase
          .from('financial_goals')
          .update({ 
            current_amount: action.data.current_amount,
            updated_at: new Date().toISOString()
          })
          .eq('id', action.data.id)
          .eq('user_id', userId);
        if (progressError) throw progressError;
        return { success: true, message: `Goal progress updated to $${action.data.current_amount}` };

      case 'delete_goal':
        const { error: deleteGoalError } = await supabase
          .from('financial_goals')
          .delete()
          .eq('id', action.data.id)
          .eq('user_id', userId);
        if (deleteGoalError) throw deleteGoalError;
        return { success: true, message: `Financial goal deleted successfully` };

      case 'create_portfolio':
        const { error: portfolioError } = await supabase
          .from('portfolios')
          .insert({ 
            user_id: userId, 
            name: action.data.name || 'My Portfolio',
            created_at: new Date().toISOString()
          });
        if (portfolioError) throw portfolioError;
        return { success: true, message: `Portfolio "${action.data.name || 'My Portfolio'}" created successfully` };

      case 'add_asset':
        // Get or create default portfolio
        let portfolioId = action.data.portfolio_id;
        if (!portfolioId) {
          const { data: existingPortfolio } = await supabase
            .from('portfolios')
            .select('id')
            .eq('user_id', userId)
            .limit(1)
            .maybeSingle();
          
          if (existingPortfolio) {
            portfolioId = existingPortfolio.id;
          } else {
            const { data: newPortfolio, error: newPortfolioError } = await supabase
              .from('portfolios')
              .insert({ 
                user_id: userId, 
                name: 'My Portfolio',
                created_at: new Date().toISOString()
              })
              .select('id')
              .single();
            if (newPortfolioError) throw newPortfolioError;
            portfolioId = newPortfolio.id;
          }
        }

        const { error: assetError } = await supabase
          .from('assets')
          .insert({ 
            user_id: userId, 
            portfolio_id: portfolioId,
            asset_name: action.data.asset_name || action.data.name,
            asset_type: action.data.asset_type || 'stocks',
            symbol: action.data.symbol || null,
            quantity: Number(action.data.quantity) || 1,
            purchase_price: Number(action.data.purchase_price) || 0,
            current_price: Number(action.data.current_price) || Number(action.data.purchase_price) || 0,
            purchase_date: action.data.purchase_date || new Date().toISOString().slice(0, 10),
            country: action.data.country || 'Egypt',
            created_at: new Date().toISOString()
          });
        if (assetError) throw assetError;
        return { success: true, message: `Asset "${action.data.asset_name || action.data.name}" added to portfolio` };

      case 'update_asset':
        const updateAssetPayload: any = { updated_at: new Date().toISOString() };
        if (action.data.current_price !== undefined) updateAssetPayload.current_price = Number(action.data.current_price);
        if (action.data.quantity !== undefined) updateAssetPayload.quantity = Number(action.data.quantity);
        if (action.data.asset_name) updateAssetPayload.asset_name = action.data.asset_name;
        
        const { error: updateAssetError } = await supabase
          .from('assets')
          .update(updateAssetPayload)
          .eq('id', action.data.id)
          .eq('user_id', userId);
        if (updateAssetError) throw updateAssetError;
        return { success: true, message: `Asset updated successfully` };

      case 'delete_asset':
        const { error: deleteAssetError } = await supabase
          .from('assets')
          .delete()
          .eq('id', action.data.id)
          .eq('user_id', userId);
        if (deleteAssetError) throw deleteAssetError;
        return { success: true, message: `Asset removed from portfolio` };

      case 'update_deposit':
        const { error: updateDepositError } = await supabase
          .from('deposits')
          .update({ 
            ...action.data,
            updated_at: new Date().toISOString()
          })
          .eq('id', action.data.id)
          .eq('user_id', userId);
        if (updateDepositError) throw updateDepositError;
        return { success: true, message: `Deposit account updated successfully` };

      case 'delete_deposit':
        const { error: deleteDepositError } = await supabase
          .from('deposits')
          .delete()
          .eq('id', action.data.id)
          .eq('user_id', userId);
        if (deleteDepositError) throw deleteDepositError;
        return { success: true, message: `Deposit account deleted successfully` };

      default:
        return { success: false, error: 'Unknown action type' };
    }
  } catch (error) {
    console.error('Error executing action:', error);
    return { success: false, error: error.message };
  }
}