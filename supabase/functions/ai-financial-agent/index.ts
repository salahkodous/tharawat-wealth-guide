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

    // Update agent memory with new interaction
    await updateAgentMemory(userId, {
      last_interaction: {
        user_message: message,
        ai_response: analysis,
        timestamp: new Date().toISOString()
      }
    });

    return new Response(JSON.stringify({ 
      response: analysis
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
      portfoliosResult,
      userProfileResult,
      currencyRatesResult
    ] = await Promise.all([
      supabase.from('personal_finances').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('financial_goals').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('assets').select('*, portfolios(name)').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('debts').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('income_streams').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('expense_streams').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('deposits').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('portfolios').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').eq('user_id', userId).single(),
      supabase.from('currency_rates').select('*').order('last_updated', { ascending: false }).limit(100)
    ]);

    // Get user's currency preference
    const userCurrency = userProfileResult.data?.currency || financesResult.data?.currency || 'USD';
    
    // Create currency conversion helper
    const currencyRatesMap = (currencyRatesResult.data || []).reduce((acc, rate) => {
      const key = `${rate.base_currency}_${rate.target_currency}`;
      acc[key] = rate.exchange_rate;
      return acc;
    }, {});

    const convertCurrency = (amount: number, fromCurrency: string, toCurrency = userCurrency) => {
      if (fromCurrency === toCurrency) return amount;
      
      // Direct conversion
      const directKey = `${fromCurrency}_${toCurrency}`;
      if (currencyRatesMap[directKey]) {
        return amount * currencyRatesMap[directKey];
      }
      
      // Indirect conversion via USD
      const fromToUsd = currencyRatesMap[`${fromCurrency}_USD`];
      const usdToTarget = currencyRatesMap[`USD_${toCurrency}`];
      
      if (fromToUsd && usdToTarget) {
        return amount * fromToUsd * usdToTarget;
      }
      
      // Reverse indirect conversion
      const usdToFrom = currencyRatesMap[`USD_${fromCurrency}`];
      const targetToUsd = currencyRatesMap[`${toCurrency}_USD`];
      
      if (usdToFrom && targetToUsd) {
        return amount * targetToUsd / usdToFrom;
      }
      
      return amount; // Fallback to original amount
    };

    const currencySymbols = {
      AED: 'د.إ', SAR: 'ر.س', QAR: 'ر.ق', KWD: 'د.ك', BHD: 'د.ب', OMR: 'ر.ع',
      JOD: 'د.أ', LBP: 'ل.ل', EGP: 'ج.م', MAD: 'د.م', TND: 'د.ت', DZD: 'د.ج',
      IQD: 'د.ع', USD: '$', GBP: '£', EUR: '€', INR: '₹', CNY: '¥'
    };

    const formatCurrency = (amount: number, currency = userCurrency) => {
      const symbol = currencySymbols[currency] || currency;
      return `${symbol}${amount.toLocaleString()}`;
    };

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
      // Currency data
      userCurrency,
      currencyRates: currencyRatesResult.data || [],
      convertCurrency,
      formatCurrency,
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
      userCurrency: 'USD',
      currencyRates: [],
      convertCurrency: (amount: number) => amount,
      formatCurrency: (amount: number) => `$${amount.toLocaleString()}`,
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
  
  const systemPrompt = `You are a sophisticated AI financial advisor with institutional-grade capabilities and comprehensive access to real-time market data. Provide professional, insightful analysis that demonstrates deep financial expertise.

## Professional Capabilities:
1. **Advanced Portfolio Management**: Multi-asset optimization, risk-adjusted returns, rebalancing strategies
2. **Comprehensive Financial Planning**: Income optimization, expense management, tax-efficient strategies
3. **Investment Analysis**: Fundamental and technical analysis across all asset classes
4. **Risk Management**: Portfolio diversification, hedging strategies, scenario planning
5. **Market Intelligence**: Real-time analysis of global markets, economic indicators, trend identification
6. **Wealth Building**: Goal-based investing, asset allocation models, retirement planning
7. **Debt Optimization**: Strategic debt management, refinancing analysis, leverage optimization
8. **Alternative Investments**: Real estate, commodities, private equity evaluation
9. **Behavioral Finance**: Psychological factors, market sentiment analysis
10. **Regulatory Compliance**: Tax implications, legal considerations, fiduciary standards

## Currency & International Finance:
- **User's Preferred Currency**: ${userData.userCurrency}
- **Available Exchange Rates**: ${userData.currencyRates?.length || 0} currency pairs
- **Currency Conversion**: All amounts are displayed in user's preferred currency unless specified
- **Multi-Currency Support**: Can analyze investments across different currencies with real-time conversion
- **Exchange Rate Analysis**: Monitor currency fluctuations and their impact on international investments

## Current User Financial Overview:

### Personal Finances Summary:
- Monthly Income: ${userData.formatCurrency(userData.finances.monthly_income)}
- Monthly Expenses: ${userData.formatCurrency(userData.finances.monthly_expenses)}
- Net Savings: ${userData.formatCurrency(userData.finances.net_savings)}
- Monthly Investing: ${userData.formatCurrency(userData.finances.monthly_investing_amount)}

### Calculated Financial Metrics:
- Net Worth: ${userData.formatCurrency(userData.metrics?.netWorth || 0)}
- Total Portfolio Value: ${userData.formatCurrency(userData.metrics?.totalPortfolioValue || 0)}
- Portfolio Return: ${userData.metrics?.portfolioReturn?.toFixed(2) || 0}%
- Total Debt: ${userData.formatCurrency(userData.metrics?.totalDebt || 0)}
- Total Savings: ${userData.formatCurrency(userData.metrics?.totalSavings || 0)}
- Debt-to-Income Ratio: ${userData.metrics?.debtToIncomeRatio?.toFixed(1) || 0}%
- Savings Rate: ${userData.metrics?.savingsRate?.toFixed(1) || 0}%

### Detailed Financial Data:

**Income Streams (${userData.incomeStreams.length}):**
${userData.incomeStreams.map(s => `- ${s.name}: ${userData.formatCurrency(s.amount)} (${s.income_type})`).join('\n') || '- No income streams set up'}

**Expense Streams (${userData.expenseStreams.length}):**
${userData.expenseStreams.map(s => `- ${s.name}: ${userData.formatCurrency(s.amount)} (${s.expense_type})`).join('\n') || '- No expense streams set up'}

**Debts (${userData.debts.length}):**
${userData.debts.map(d => `- ${d.name}: ${userData.formatCurrency(d.total_amount - d.paid_amount)} remaining (Monthly: ${userData.formatCurrency(d.monthly_payment)}, Rate: ${d.interest_rate}%)`).join('\n') || '- No active debts'}

**Financial Goals (${userData.goals.length}):**
${userData.goals.map(g => `- ${g.title}: ${userData.formatCurrency(g.current_amount)}/${userData.formatCurrency(g.target_amount)} (${Math.round((g.current_amount/(g.target_amount || 1))*100)}%) - Target: ${g.target_date || 'No date'}`).join('\n') || '- No financial goals set'}

**Deposits/Savings Accounts (${userData.deposits.length}):**
${userData.deposits.map(d => `- ${d.deposit_type}: ${userData.formatCurrency(d.principal)} at ${d.rate}% (Interest: ${userData.formatCurrency(d.accrued_interest || 0)})`).join('\n') || '- No deposits/savings accounts'}

**Investment Portfolios (${userData.portfolios.length}):**
${userData.portfolios.map(p => `- ${p.name} (Created: ${p.created_at?.slice(0,10)})`).join('\n') || '- No portfolios created'}

**Investment Assets (${userData.assets.length}):**
${userData.assets.map(a => {
  const currentValue = (a.current_price || a.purchase_price || 0) * (a.quantity || 1);
  const purchaseValue = (a.purchase_price || 0) * (a.quantity || 1);
  const returnPct = purchaseValue > 0 ? (((currentValue - purchaseValue) / purchaseValue) * 100).toFixed(1) : '0';
  return `- ${a.asset_name} (${a.asset_type}): ${a.quantity || 'N/A'} units, Value: ${userData.formatCurrency(currentValue)}, Return: ${returnPct}%`;
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

## Response Guidelines:
- Provide comprehensive financial analysis and advice only
- No data modifications or actions will be performed
- Focus on insights, recommendations, and market analysis
- Use real market data to support your analysis
- Calculate and explain financial ratios and metrics
- Suggest optimization strategies without implementing them
- Identify opportunities and risks in the current financial situation
- Provide educational content about financial concepts
- Always format monetary values in the user's preferred currency: ${userData.userCurrency}

Your response should be detailed, professional, and purely advisory without any executable actions.`;

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

  return aiResponse;
    const textLower = message.toLowerCase();
    
    // Income/Salary changes or additions
    if ((textLower.includes('salary') || textLower.includes('income')) && 
        (textLower.includes('change') || textLower.includes('update') || textLower.includes('add') || textLower.includes('create'))) {
      const salaryMatch = message.match(/(\d+)/);
      
      if (salaryMatch) {
        const incomeAmount = parseInt(salaryMatch[0]);
        
        // Check if it's adding a new income stream vs updating salary
        if ((textLower.includes('add') || textLower.includes('create')) && !textLower.includes('salary')) {
          // Extract income name
          const incomeNameMatch = message.match(/(?:add|create)\s+([^,.\n]+?)\s+income/i) || 
                                  message.match(/(?:income)\s+([^,.\n\d]+)/i) ||
                                  message.match(/([a-zA-Z\s]+)\s+income/i);
          
          const incomeName = incomeNameMatch ? incomeNameMatch[1].trim() : 'New Income';
          
          return {
            analysis: `I can add a new income stream "${incomeName}" with $${incomeAmount} monthly income. Do you want me to proceed?`,
            pendingAction: {
              type: 'add_income_stream',
              data: {
                name: incomeName,
                amount: incomeAmount,
                income_type: 'stable',
                is_active: true
              },
              description: `Add income stream: ${incomeName} ($${incomeAmount})`
            }
          };
        } else {
          // Update salary/total income
          return {
            analysis: `I need to update your salary to $${incomeAmount}. This will update both your personal finance summary and your salary income stream. Do you want me to proceed?`,
            pendingAction: {
              type: 'update_income',
              data: {
                monthly_income: incomeAmount,
                salary: incomeAmount
              },
              description: `Update your monthly salary to $${incomeAmount}`
            }
          };
        }
      }
    }
    
    // Expense changes or additions
    if ((textLower.includes('expense') || textLower.includes('spending')) && 
        (textLower.includes('change') || textLower.includes('update') || textLower.includes('add') || textLower.includes('create'))) {
      const expenseMatch = message.match(/(\d+)/);
      
      if (expenseMatch) {
        const expenseAmount = parseInt(expenseMatch[0]);
        
        // Check if it's adding a new expense stream vs updating total expenses
        if (textLower.includes('add') || textLower.includes('create')) {
          // Extract expense name
          const expenseNameMatch = message.match(/(?:add|create)\s+([^,.\n]+?)\s+expense/i) || 
                                   message.match(/(?:expense(?:s)?)\s+([^,.\n\d]+)/i) ||
                                   message.match(/([a-zA-Z\s]+)\s+expense/i);
          
          const expenseName = expenseNameMatch ? expenseNameMatch[1].trim() : 'New Expense';
          
          return {
            analysis: `I can add a new expense stream "${expenseName}" with $${expenseAmount} monthly cost. Do you want me to proceed?`,
            pendingAction: {
              type: 'add_expense_stream',
              data: {
                name: expenseName,
                amount: expenseAmount,
                expense_type: 'fixed',
                is_active: true
              },
              description: `Add expense stream: ${expenseName} ($${expenseAmount})`
            }
          };
        } else {
          // Update total monthly expenses
          return {
            analysis: `I need to update your monthly expenses to $${expenseAmount}. This will update your personal finance summary. Do you want me to proceed?`,
            pendingAction: {
              type: 'update_expenses',
              data: {
                monthly_expenses: expenseAmount
              },
              description: `Update your monthly expenses to $${expenseAmount}`
            }
          };
        }
      }
    }
    
    // Investment amount changes
    if ((textLower.includes('invest') || textLower.includes('investing')) && (textLower.includes('change') || textLower.includes('update') || textLower.includes('set') || textLower.includes('increase') || textLower.includes('decrease') || textLower.includes('add'))) {
      const investMatch = message.match(/(\d+)/);
      if (investMatch) {
        const newInvesting = parseInt(investMatch[0]);
        
        return {
          analysis: `I need to update your monthly investing amount to $${newInvesting}. This will update your personal finance summary. Do you want me to proceed?`,
          pendingAction: {
            type: 'update_investing',
            data: {
              monthly_investing_amount: newInvesting
            },
            description: `Update your monthly investing amount to $${newInvesting}`
          }
        };
      }
    }
    
    // Savings: update a specific deposit by name (e.g., "reduce the cash savings to 4500")
    if ((textLower.includes('savings') || textLower.includes('deposit')) &&
        (textLower.includes('reduce') || textLower.includes('lower') || textLower.includes('raise') || textLower.includes('increase') || textLower.includes('decrease') || textLower.includes('set') || textLower.includes('change') || textLower.includes('update'))) {
      const amtMatch = message.match(/(\d+[\d,]*\.?\d*)/);
      if (amtMatch) {
        const amount = Number(amtMatch[1].replace(/,/g, ''));
        if (Number.isFinite(amount)) {
          // Try to extract a deposit name before the word "savings" or "deposit"
          let nameMatch = message.match(/the\s+([a-zA-Z_\s]+?)\s+savings/i) ||
                          message.match(/([a-zA-Z_\s]+?)\s+savings/i) ||
                          message.match(/the\s+([a-zA-Z_\s]+?)\s+deposit/i) ||
                          message.match(/([a-zA-Z_\s]+?)\s+deposit/i);
          let depositName = nameMatch ? nameMatch[1].trim() : undefined;
          if (depositName) {
            // Clean common determiners
            depositName = depositName.replace(/^(the|my)\s+/i, '').trim();
          }

          if (depositName) {
            return {
              analysis: `I will update the ${depositName} savings/deposit to $${amount}. Do you want me to proceed?`,
              pendingAction: {
                type: 'update_deposit',
                data: {
                  name: depositName,
                  principal: amount
                },
                description: `Update deposit \"${depositName}\" to $${amount}`
              }
            };
          }
        }
      }
    }
    
    // Savings: add deposit accounts
    if ((textLower.includes('deposit') || textLower.includes('savings')) && (textLower.includes('add') || textLower.includes('create') || textLower.includes('open'))) {
      const amtMatch = message.match(/(\d+[\d,]*\.?\d*)/);
      const rateMatch = message.match(/(\d+(?:\.\d+)?)%/);
      const amount = amtMatch ? Number(amtMatch[1].replace(/,/g, '')) : undefined;
      const rate = rateMatch ? Number(rateMatch[1]) : 5; // sensible default
      if (Number.isFinite(amount)) {
        let depositType: 'savings' | 'fixed_cd' | 'investment_linked' = 'savings';
        if (textLower.includes('cd') || textLower.includes('certificate') || textLower.includes('fixed')) depositType = 'fixed_cd';
        if (textLower.includes('investment') && textLower.includes('linked')) depositType = 'investment_linked';
        
        return {
          analysis: `I can open a ${depositType.replace('_',' ')} account with $${amount} at ${rate}%. Do you want me to proceed?`,
          pendingAction: {
            type: 'add_deposit',
            data: {
              deposit_type: depositType,
              principal: amount,
              rate,
              start_date: new Date().toISOString().slice(0,10)
            },
            description: `Create ${depositType} deposit: $${amount} at ${rate}%`
          }
        };
      }
    }

    // Savings: update net savings total
    if (textLower.includes('savings') && (textLower.includes('set') || textLower.includes('change') || textLower.includes('update')) && !textLower.includes('deposit')) {
      const savingsMatch = message.match(/(\d+[\d,]*\.?\d*)/);
      if (savingsMatch) {
        const net = Number(savingsMatch[1].replace(/,/g, ''));
        if (Number.isFinite(net)) {
          return {
            analysis: `I need to update your net savings to $${net}. Do you want me to proceed?`,
            pendingAction: {
              type: 'update_savings',
              data: { net_savings: net },
              description: `Update net savings to $${net}`
            }
          };
        }
      }
    }
    
    // Goal creation
    if ((textLower.includes('goal') || textLower.includes('save for')) && (textLower.includes('add') || textLower.includes('create'))) {
      const goalMatch = message.match(/(\d+)/);
      let goalNameMatch = message.match(/(?:goal|save for)\s+([^,.\n\d]+)/i) ||
                         message.match(/(?:add|create)\s+([^,.\n]+?)\s+goal/i) ||
                         message.match(/goal\s+([^,.\n\d]+)/i);
      
      if (goalMatch) {
        const targetAmount = parseInt(goalMatch[0]);
        const goalName = goalNameMatch ? goalNameMatch[1].trim() : 'Financial Goal';
        
        return {
          analysis: `I can create a new financial goal "${goalName}" with a target of $${targetAmount}. Do you want me to proceed?`,
          pendingAction: {
            type: 'create_goal',
            data: {
              title: goalName,
              target_amount: targetAmount,
              current_amount: 0,
              category: 'general'
            },
            description: `Create financial goal: ${goalName} ($${targetAmount})`
          }
        };
      }
    }
    
    // Debt management  
    if ((textLower.includes('debt') || textLower.includes('loan')) && (textLower.includes('add') || textLower.includes('create'))) {
      const debtMatch = message.match(/(\d+)/);
      let debtNameMatch = message.match(/(?:debt|loan)\s+([^,.\n\d]+)/i) ||
                         message.match(/(?:add|create)\s+([^,.\n]+?)\s+(?:debt|loan)/i) ||
                         message.match(/([a-zA-Z\s]+)\s+(?:debt|loan)/i);
      
      if (debtMatch) {
        const totalAmount = parseInt(debtMatch[0]);
        const debtName = debtNameMatch ? debtNameMatch[1].trim() : 'New Debt';
        
        return {
          analysis: `I can add a new debt "${debtName}" with a total amount of $${totalAmount}. Do you want me to proceed?`,
          pendingAction: {
            type: 'add_debt',
            data: {
              name: debtName,
              total_amount: totalAmount,
              paid_amount: 0,
              monthly_payment: 0,
              interest_rate: 0
            },
            description: `Add debt: ${debtName} ($${totalAmount})`
          }
        };
      }
    }
    
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