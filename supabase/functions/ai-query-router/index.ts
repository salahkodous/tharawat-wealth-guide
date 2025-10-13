import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuickQueryResult {
  isQuick: boolean;
  category?: 'greeting' | 'gold' | 'stocks' | 'funds' | 'crypto' | 'currency' | 'bonds' | 'etfs' | 
             'personal_finance' | 'portfolio' | 'debts' | 'deposits' | 'goals' | 'income' | 'expenses' | 'news';
  symbol?: string;
  financeType?: string;
}

// Quick classification without LLM for common patterns
function quickClassify(message: string): QuickQueryResult {
  const lower = message.toLowerCase();
  const trimmed = message.trim();
  
  // Greetings (instant response)
  if (/^(hi|hello|hey|مرحبا|أهلا|السلام عليكم|سلام)$/i.test(trimmed)) {
    return { isQuick: true, category: 'greeting' };
  }
  
  // News queries (needs web search)
  if (/أخبار|news|خبر|تقرير|report|مستجدات|updates|أحداث|events/i.test(lower)) {
    return { isQuick: false }; // Route to RAG agent for web search
  }
  
  // Personal Finance queries
  if (/دخلي|income|راتب|salary|مصروفات|expenses|نفقات/i.test(lower)) {
    return { isQuick: true, category: 'personal_finance', financeType: 'overview' };
  }
  
  if (/ديون|debts?|قرض|loans?/i.test(lower)) {
    return { isQuick: true, category: 'debts' };
  }
  
  if (/ودائع|deposits?|شهادات|certificates?/i.test(lower)) {
    return { isQuick: true, category: 'deposits' };
  }
  
  if (/أهداف|goals?|مدخرات|savings?/i.test(lower)) {
    return { isQuick: true, category: 'goals' };
  }
  
  if (/محفظة|portfolio|أصول|assets?|استثمارات|investments?/i.test(lower)) {
    return { isQuick: true, category: 'portfolio' };
  }
  
  // Market Data queries
  if (/ذهب|جرام|عيار|gold|gram|karat/i.test(lower)) {
    return { isQuick: true, category: 'gold' };
  }
  
  if (/سهم|stock|أسهم|shares?/i.test(lower)) {
    return { isQuick: true, category: 'stocks' };
  }
  
  if (/صناديق|صندوق|funds?|mutual/i.test(lower)) {
    return { isQuick: true, category: 'funds' };
  }
  
  if (/bitcoin|btc|crypto|عملة رقمية|بيتكوين/i.test(lower)) {
    return { isQuick: true, category: 'crypto' };
  }
  
  if (/dollar|euro|currency|دولار|يورو|جنيه|pound/i.test(lower)) {
    return { isQuick: true, category: 'currency' };
  }
  
  return { isQuick: false };
}

async function handleQuickQuery(
  category: string,
  message: string,
  supabase: any,
  userId: string
): Promise<string> {
  const isArabic = /[\u0600-\u06FF]/.test(message);
  
  try {
    switch (category) {
      case 'greeting': {
        return isArabic 
          ? 'مرحباً! كيف يمكنني مساعدتك اليوم؟ 😊'
          : 'Hi! How can I help you today? 😊';
      }
      
      case 'personal_finance': {
        const { data: finances } = await supabase
          .from('personal_finances')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        const { data: incomes } = await supabase
          .from('income_streams')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true);
        
        const { data: expenses } = await supabase
          .from('expense_streams')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true);
        
        const totalIncome = incomes?.reduce((sum, i) => sum + Number(i.amount), 0) || 0;
        const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
        const netSavings = totalIncome - totalExpenses;
        
        if (isArabic) {
          return `📊 **ملخص مالياتك الشخصية:**\n\n` +
            `💰 الدخل الشهري: ${totalIncome.toLocaleString()} جنيه\n` +
            `📉 المصروفات الشهرية: ${totalExpenses.toLocaleString()} جنيه\n` +
            `💎 صافي المدخرات: ${netSavings.toLocaleString()} جنيه\n` +
            `📈 نسبة الادخار: ${totalIncome > 0 ? ((netSavings/totalIncome)*100).toFixed(1) : 0}%`;
        } else {
          return `📊 **Your Personal Finance Summary:**\n\n` +
            `💰 Monthly Income: ${totalIncome.toLocaleString()} EGP\n` +
            `📉 Monthly Expenses: ${totalExpenses.toLocaleString()} EGP\n` +
            `💎 Net Savings: ${netSavings.toLocaleString()} EGP\n` +
            `📈 Savings Rate: ${totalIncome > 0 ? ((netSavings/totalIncome)*100).toFixed(1) : 0}%`;
        }
      }
      
      case 'debts': {
        const { data: debts } = await supabase
          .from('debts')
          .select('*')
          .eq('user_id', userId);
        
        if (!debts || debts.length === 0) {
          return isArabic ? '✅ ليس لديك ديون مسجلة.' : '✅ You have no recorded debts.';
        }
        
        const totalDebt = debts.reduce((sum, d) => sum + Number(d.total_amount), 0);
        const totalPaid = debts.reduce((sum, d) => sum + Number(d.paid_amount), 0);
        const remaining = totalDebt - totalPaid;
        
        if (isArabic) {
          return `📊 **ملخص الديون:**\n\n` +
            `💰 إجمالي الديون: ${totalDebt.toLocaleString()} جنيه\n` +
            `✅ المدفوع: ${totalPaid.toLocaleString()} جنيه\n` +
            `⏳ المتبقي: ${remaining.toLocaleString()} جنيه`;
        } else {
          return `📊 **Debt Summary:**\n\n` +
            `💰 Total Debt: ${totalDebt.toLocaleString()} EGP\n` +
            `✅ Paid: ${totalPaid.toLocaleString()} EGP\n` +
            `⏳ Remaining: ${remaining.toLocaleString()} EGP`;
        }
      }
      
      case 'deposits': {
        const { data: deposits } = await supabase
          .from('deposits')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active');
        
        if (!deposits || deposits.length === 0) {
          return isArabic ? '📭 ليس لديك ودائع نشطة.' : '📭 You have no active deposits.';
        }
        
        const totalPrincipal = deposits.reduce((sum, d) => sum + Number(d.principal), 0);
        const totalAccrued = deposits.reduce((sum, d) => sum + Number(d.accrued_interest), 0);
        
        if (isArabic) {
          return `💰 **ملخص الودائع:**\n\n` +
            `📊 عدد الودائع: ${deposits.length}\n` +
            `💵 رأس المال: ${totalPrincipal.toLocaleString()} جنيه\n` +
            `📈 الفوائد المتراكمة: ${totalAccrued.toLocaleString()} جنيه\n` +
            `💎 القيمة الإجمالية: ${(totalPrincipal + totalAccrued).toLocaleString()} جنيه`;
        } else {
          return `💰 **Deposits Summary:**\n\n` +
            `📊 Number of Deposits: ${deposits.length}\n` +
            `💵 Principal: ${totalPrincipal.toLocaleString()} EGP\n` +
            `📈 Accrued Interest: ${totalAccrued.toLocaleString()} EGP\n` +
            `💎 Total Value: ${(totalPrincipal + totalAccrued).toLocaleString()} EGP`;
        }
      }
      
      case 'goals': {
        const { data: goals } = await supabase
          .from('financial_goals')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active');
        
        if (!goals || goals.length === 0) {
          return isArabic ? '🎯 ليس لديك أهداف مالية نشطة.' : '🎯 You have no active financial goals.';
        }
        
        const totalTarget = goals.reduce((sum, g) => sum + Number(g.target_amount), 0);
        const totalCurrent = goals.reduce((sum, g) => sum + Number(g.current_amount), 0);
        const progress = totalTarget > 0 ? (totalCurrent / totalTarget * 100).toFixed(1) : 0;
        
        if (isArabic) {
          return `🎯 **ملخص الأهداف المالية:**\n\n` +
            `📊 عدد الأهداف: ${goals.length}\n` +
            `💰 المبلغ المستهدف: ${totalTarget.toLocaleString()} جنيه\n` +
            `✅ المبلغ الحالي: ${totalCurrent.toLocaleString()} جنيه\n` +
            `📈 نسبة التقدم: ${progress}%`;
        } else {
          return `🎯 **Financial Goals Summary:**\n\n` +
            `📊 Number of Goals: ${goals.length}\n` +
            `💰 Target Amount: ${totalTarget.toLocaleString()} EGP\n` +
            `✅ Current Amount: ${totalCurrent.toLocaleString()} EGP\n` +
            `📈 Progress: ${progress}%`;
        }
      }
      
      case 'portfolio': {
        const { data: assets } = await supabase
          .from('assets')
          .select('*')
          .eq('user_id', userId);
        
        if (!assets || assets.length === 0) {
          return isArabic ? '📊 محفظتك فارغة حالياً.' : '📊 Your portfolio is currently empty.';
        }
        
        const totalValue = assets.reduce((sum, a) => 
          sum + (Number(a.quantity) * Number(a.current_price)), 0);
        const totalCost = assets.reduce((sum, a) => 
          sum + (Number(a.quantity) * Number(a.purchase_price)), 0);
        const pnl = totalValue - totalCost;
        const pnlPercent = totalCost > 0 ? (pnl / totalCost * 100).toFixed(2) : 0;
        
        if (isArabic) {
          return `📊 **ملخص المحفظة:**\n\n` +
            `🔢 عدد الأصول: ${assets.length}\n` +
            `💰 القيمة الحالية: ${totalValue.toLocaleString()} جنيه\n` +
            `📊 تكلفة الشراء: ${totalCost.toLocaleString()} جنيه\n` +
            `${pnl >= 0 ? '📈' : '📉'} الربح/الخسارة: ${pnl.toLocaleString()} (${pnlPercent}%)`;
        } else {
          return `📊 **Portfolio Summary:**\n\n` +
            `🔢 Number of Assets: ${assets.length}\n` +
            `💰 Current Value: ${totalValue.toLocaleString()} EGP\n` +
            `📊 Purchase Cost: ${totalCost.toLocaleString()} EGP\n` +
            `${pnl >= 0 ? '📈' : '📉'} P&L: ${pnl.toLocaleString()} (${pnlPercent}%)`;
        }
      }
      
      case 'gold': {
        const { data: goldPrices, error } = await supabase
          .from('egyptian_gold_prices')
          .select('*')
          .order('scraped_at', { ascending: false })
          .limit(10);
        
        if (error) throw error;
        
        if (!goldPrices || goldPrices.length === 0) {
          return isArabic 
            ? 'عذراً، لا توجد بيانات متاحة حالياً عن أسعار الذهب.'
            : 'Sorry, no gold price data is currently available.';
        }
        
        if (isArabic) {
          let response = '✨ **أسعار الذهب:**\n\n';
          goldPrices.slice(0, 5).forEach((price: any) => {
            response += `**${price.product_name}**: ${price.price_egp} جنيه`;
            if (price.karat) response += ` (${price.karat})`;
            response += '\n';
          });
          return response;
        } else {
          let response = '✨ **Gold Prices:**\n\n';
          goldPrices.slice(0, 5).forEach((price: any) => {
            response += `**${price.product_name}**: ${price.price_egp} EGP`;
            if (price.karat) response += ` (${price.karat})`;
            response += '\n';
          });
          return response;
        }
      }
      
      case 'stocks': {
        const { data: stocks, error } = await supabase
          .from('egyptian_stocks')
          .select('*')
          .order('borsa_date', { ascending: false })
          .limit(20);
        
        if (error) throw error;
        
        if (!stocks || stocks.length === 0) {
          return isArabic 
            ? 'عذراً، لا توجد بيانات متاحة حالياً عن الأسهم.'
            : 'Sorry, no stock data is currently available.';
        }
        
        if (isArabic) {
          let response = '📈 **أحدث أسعار الأسهم:**\n\n';
          stocks.slice(0, 5).forEach((stock: any) => {
            response += `**${stock.symbol}**: ${stock.last_price} ${stock.currency}`;
            if (stock.change_amount) {
              const arrow = stock.change_amount > 0 ? '📈' : '📉';
              response += ` ${arrow} ${stock.change_percent?.toFixed(1)}%`;
            }
            response += '\n';
          });
          return response;
        } else {
          let response = '📈 **Latest Stock Prices:**\n\n';
          stocks.slice(0, 5).forEach((stock: any) => {
            response += `**${stock.symbol}**: ${stock.last_price} ${stock.currency}`;
            if (stock.change_amount) {
              const arrow = stock.change_amount > 0 ? '📈' : '📉';
              response += ` ${arrow} ${stock.change_percent?.toFixed(1)}%`;
            }
            response += '\n';
          });
          return response;
        }
      }
      
      case 'funds': {
        const { data: funds, error } = await supabase
          .from('egyptian_funds')
          .select('*')
          .order('scraped_at', { ascending: false })
          .limit(10);
        
        if (error) throw error;
        
        if (!funds || funds.length === 0) {
          return isArabic 
            ? 'عذراً، لا توجد بيانات متاحة حالياً عن صناديق الاستثمار.'
            : 'Sorry, no investment fund data is currently available.';
        }
        
        if (isArabic) {
          let response = '💼 **صناديق الاستثمار:**\n\n';
          funds.slice(0, 5).forEach((fund: any) => {
            response += `**${fund.fund_name}**: ${fund.last_price} ${fund.currency}`;
            if (fund.ytd_return) response += ` | عائد: ${fund.ytd_return}%`;
            response += '\n';
          });
          return response;
        } else {
          let response = '💼 **Investment Funds:**\n\n';
          funds.slice(0, 5).forEach((fund: any) => {
            response += `**${fund.fund_name}**: ${fund.last_price} ${fund.currency}`;
            if (fund.ytd_return) response += ` | Return: ${fund.ytd_return}%`;
            response += '\n';
          });
          return response;
        }
      }
      
      case 'crypto': {
        const { data: crypto, error } = await supabase
          .from('cryptocurrencies')
          .select('*')
          .order('rank', { ascending: true })
          .limit(10);
        
        if (error) throw error;
        
        if (!crypto || crypto.length === 0) {
          return isArabic 
            ? 'عذراً، لا توجد بيانات متاحة حالياً عن العملات الرقمية.'
            : 'Sorry, no cryptocurrency data is currently available.';
        }
        
        if (isArabic) {
          let response = '₿ **العملات الرقمية:**\n\n';
          crypto.slice(0, 5).forEach((coin: any) => {
            response += `**${coin.symbol}**: $${coin.price_usd?.toFixed(2)}`;
            if (coin.change_percentage_24h) {
              const arrow = coin.change_percentage_24h > 0 ? '📈' : '📉';
              response += ` ${arrow} ${coin.change_percentage_24h?.toFixed(1)}%`;
            }
            response += '\n';
          });
          return response;
        } else {
          let response = '₿ **Cryptocurrencies:**\n\n';
          crypto.slice(0, 5).forEach((coin: any) => {
            response += `**${coin.symbol}**: $${coin.price_usd?.toFixed(2)}`;
            if (coin.change_percentage_24h) {
              const arrow = coin.change_percentage_24h > 0 ? '📈' : '📉';
              response += ` ${arrow} ${coin.change_percentage_24h?.toFixed(1)}%`;
            }
            response += '\n';
          });
          return response;
        }
      }
      
      case 'currency': {
        const { data: rates, error } = await supabase
          .from('currency_rates')
          .select('*')
          .order('last_updated', { ascending: false })
          .limit(10);
        
        if (error) throw error;
        
        if (!rates || rates.length === 0) {
          return isArabic 
            ? 'عذراً، لا توجد بيانات متاحة حالياً عن أسعار العملات.'
            : 'Sorry, no currency rate data is currently available.';
        }
        
        if (isArabic) {
          let response = '💱 **أسعار العملات:**\n\n';
          rates.slice(0, 5).forEach((rate: any) => {
            response += `${rate.base_currency}/${rate.target_currency}: ${rate.exchange_rate?.toFixed(4)}`;
            if (rate.change_percentage_24h) {
              const arrow = rate.change_percentage_24h > 0 ? '📈' : '📉';
              response += ` ${arrow} ${rate.change_percentage_24h?.toFixed(1)}%`;
            }
            response += '\n';
          });
          return response;
        } else {
          let response = '💱 **Currency Rates:**\n\n';
          rates.slice(0, 5).forEach((rate: any) => {
            response += `${rate.base_currency}/${rate.target_currency}: ${rate.exchange_rate?.toFixed(4)}`;
            if (rate.change_percentage_24h) {
              const arrow = rate.change_percentage_24h > 0 ? '📈' : '📉';
              response += ` ${arrow} ${rate.change_percentage_24h?.toFixed(1)}%`;
            }
            response += '\n';
          });
          return response;
        }
      }
      
      default:
        return '';
    }
  } catch (error) {
    console.error('Error in quick query:', error);
    return '';
  }
}

// Simple LLM response for creative/general queries
async function generateSimpleLLMResponse(message: string, groqApiKey: string): Promise<string> {
  try {
    const isArabic = /[\u0600-\u06FF]/.test(message);
    console.info(`Generating simple LLM response for: "${message}", isArabic: ${isArabic}`);
    
    const requestBody = {
      model: 'llama-3.3-70b-specdec',
      messages: [
        {
          role: 'system',
          content: isArabic 
            ? 'أنت مساعد مالي ذكي ومفيد. أجب على الأسئلة باللغة العربية بشكل واضح ومفيد. إذا كان السؤال عن موضوع معين، قدم معلومات مفيدة عنه.'
            : 'You are a smart and helpful financial assistant. Answer questions in English clearly and helpfully. If asked about a topic, provide useful information about it.'
        },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 300,
    };

    console.info('Calling Groq API with:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);
      return isArabic ? 'عذراً، حدث خطأ في الاتصال بالخدمة.' : 'Sorry, an error occurred connecting to the service.';
    }

    const data = await response.json();
    console.info('Groq API response:', JSON.stringify(data, null, 2));
    
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      console.error('No content in Groq response');
      return isArabic ? 'عذراً، لم أتمكن من معالجة ذلك.' : 'Sorry, I couldn\'t process that.';
    }
    
    console.info('Returning content:', content);
    return content;
  } catch (error) {
    console.error('Error generating simple LLM response:', error);
    const isArabic = /[\u0600-\u06FF]/.test(message);
    return isArabic ? 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.' : 'Sorry, an error occurred. Please try again.';
  }
}

// Detect if query needs detailed analysis or web search via RAG agent
function needsDetailedAnalysis(message: string): boolean {
  // Keywords for news/web search that need RAG agent
  const newsKeywords = /أخبار|news|خبر|تقرير|report|مستجدات|updates|أحداث|events|آخر|latest|حديث|recent/i;
  
  // Keywords for detailed analysis
  const detailedKeywords = /analyze|analysis|compare|recommend|should i|advice|strategy|plan|تحليل|مقارنة|نصيحة|استراتيجية|خطة/i;
  
  return newsKeywords.test(message) || detailedKeywords.test(message) || message.length > 100;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId, conversationHistory = [] } = await req.json();
    
    if (!message) {
      throw new Error('Message is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const groqApiKey = Deno.env.get('GROQ_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Classifying query:', message);
    const classification = quickClassify(message);
    
    // Handle instant queries (greetings, database lookups)
    if (classification.isQuick && classification.category) {
      console.log('Quick query detected:', classification.category);
      const quickResponse = await handleQuickQuery(
        classification.category,
        message,
        supabase,
        userId
      );
      
      if (quickResponse) {
        return new Response(
          JSON.stringify({
            response: quickResponse,
            sources: [],
            uiComponents: [],
            processingTime: Date.now(),
            queryType: 'instant',
            category: classification.category
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Check if query needs detailed analysis
    if (needsDetailedAnalysis(message)) {
      console.log('Complex query, delegating to RAG agent');
      const ragResponse = await fetch(`${supabaseUrl}/functions/v1/rag-agent`, {
      method: 'POST',
      headers: {
        'Authorization': req.headers.get('Authorization') || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, userId, conversationHistory }),
    });

    if (!ragResponse.ok) {
      throw new Error(`RAG agent error: ${ragResponse.status}`);
    }

      const ragData = await ragResponse.json();
      return new Response(
        JSON.stringify({ ...ragData, queryType: 'detailed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For simple creative queries, use fast LLM
    console.log('Simple query, using fast LLM');
    const llmResponse = await generateSimpleLLMResponse(message, groqApiKey);
    return new Response(
      JSON.stringify({
        response: llmResponse,
        sources: [],
        uiComponents: [],
        processingTime: Date.now(),
        queryType: 'simple'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Router error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        response: 'عذراً، حدث خطأ في معالجة طلبك. / Sorry, an error occurred processing your request.'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
