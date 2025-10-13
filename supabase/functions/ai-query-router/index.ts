import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuickQueryResult {
  isQuick: boolean;
  category?: 'gold' | 'stocks' | 'funds' | 'crypto' | 'currency' | 'bonds' | 'etfs';
  symbol?: string;
}

// Quick classification without LLM for common patterns
function quickClassify(message: string): QuickQueryResult {
  const lower = message.toLowerCase();
  const arabicGold = /ذهب|جرام|عيار/;
  const englishGold = /gold|gram|karat/i;
  
  // Gold price queries
  if (arabicGold.test(message) || englishGold.test(message)) {
    return { isQuick: true, category: 'gold' };
  }
  
  // Stock queries with specific symbol
  const stockPattern = /(?:سهم|stock|price of|سعر)\s+([A-Z]{2,6}|\w+)/i;
  const stockMatch = message.match(stockPattern);
  if (stockMatch) {
    return { isQuick: true, category: 'stocks', symbol: stockMatch[1] };
  }
  
  // Funds queries
  if (/صناديق|صندوق|funds?|mutual/i.test(lower)) {
    return { isQuick: true, category: 'funds' };
  }
  
  // Crypto queries
  if (/bitcoin|btc|crypto|عملة رقمية/i.test(lower)) {
    return { isQuick: true, category: 'crypto' };
  }
  
  // Currency queries
  if (/dollar|euro|currency|دولار|يورو|عملة/i.test(lower)) {
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
          let response = '📊 **أسعار الذهب الحالية في مصر:**\n\n';
          goldPrices.forEach((price: any) => {
            response += `**${price.product_name}**\n`;
            if (price.karat) response += `- العيار: ${price.karat}\n`;
            response += `- السعر: ${price.price_egp} جنيه مصري\n`;
            if (price.buy_price) response += `- سعر الشراء: ${price.buy_price} جنيه\n`;
            if (price.sell_price) response += `- سعر البيع: ${price.sell_price} جنيه\n`;
            response += '\n';
          });
          return response;
        } else {
          let response = '📊 **Current Gold Prices in Egypt:**\n\n';
          goldPrices.forEach((price: any) => {
            response += `**${price.product_name}**\n`;
            if (price.karat) response += `- Karat: ${price.karat}\n`;
            response += `- Price: ${price.price_egp} EGP\n`;
            if (price.buy_price) response += `- Buy Price: ${price.buy_price} EGP\n`;
            if (price.sell_price) response += `- Sell Price: ${price.sell_price} EGP\n`;
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
          let response = '📈 **أحدث أسعار الأسهم المصرية:**\n\n';
          stocks.slice(0, 10).forEach((stock: any) => {
            response += `**${stock.symbol}** - ${stock.company_name || ''}\n`;
            response += `- السعر: ${stock.last_price} ${stock.currency}\n`;
            if (stock.change_amount) {
              const arrow = stock.change_amount > 0 ? '📈' : stock.change_amount < 0 ? '📉' : '➡️';
              response += `- التغيير: ${arrow} ${stock.change_amount} (${stock.change_percent?.toFixed(2)}%)\n`;
            }
            response += '\n';
          });
          return response;
        } else {
          let response = '📈 **Latest Egyptian Stock Prices:**\n\n';
          stocks.slice(0, 10).forEach((stock: any) => {
            response += `**${stock.symbol}** - ${stock.company_name || ''}\n`;
            response += `- Price: ${stock.last_price} ${stock.currency}\n`;
            if (stock.change_amount) {
              const arrow = stock.change_amount > 0 ? '📈' : stock.change_amount < 0 ? '📉' : '➡️';
              response += `- Change: ${arrow} ${stock.change_amount} (${stock.change_percent?.toFixed(2)}%)\n`;
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
          let response = '💼 **صناديق الاستثمار المصرية:**\n\n';
          funds.forEach((fund: any) => {
            response += `**${fund.fund_name}**\n`;
            if (fund.issuer) response += `- المُصدر: ${fund.issuer}\n`;
            if (fund.last_price) response += `- آخر سعر: ${fund.last_price} ${fund.currency}\n`;
            if (fund.ytd_return) response += `- العائد السنوي: ${fund.ytd_return}%\n`;
            response += '\n';
          });
          return response;
        } else {
          let response = '💼 **Egyptian Investment Funds:**\n\n';
          funds.forEach((fund: any) => {
            response += `**${fund.fund_name}**\n`;
            if (fund.issuer) response += `- Issuer: ${fund.issuer}\n`;
            if (fund.last_price) response += `- Last Price: ${fund.last_price} ${fund.currency}\n`;
            if (fund.ytd_return) response += `- YTD Return: ${fund.ytd_return}%\n`;
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
          let response = '₿ **أسعار العملات الرقمية:**\n\n';
          crypto.forEach((coin: any) => {
            response += `**${coin.name} (${coin.symbol})**\n`;
            response += `- السعر: $${coin.price_usd?.toFixed(2)}\n`;
            if (coin.change_percentage_24h) {
              const arrow = coin.change_percentage_24h > 0 ? '📈' : '📉';
              response += `- التغيير 24 ساعة: ${arrow} ${coin.change_percentage_24h?.toFixed(2)}%\n`;
            }
            response += '\n';
          });
          return response;
        } else {
          let response = '₿ **Cryptocurrency Prices:**\n\n';
          crypto.forEach((coin: any) => {
            response += `**${coin.name} (${coin.symbol})**\n`;
            response += `- Price: $${coin.price_usd?.toFixed(2)}\n`;
            if (coin.change_percentage_24h) {
              const arrow = coin.change_percentage_24h > 0 ? '📈' : '📉';
              response += `- 24h Change: ${arrow} ${coin.change_percentage_24h?.toFixed(2)}%\n`;
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
          rates.forEach((rate: any) => {
            response += `**${rate.base_currency}/${rate.target_currency}**\n`;
            response += `- السعر: ${rate.exchange_rate?.toFixed(4)}\n`;
            if (rate.change_percentage_24h) {
              const arrow = rate.change_percentage_24h > 0 ? '📈' : '📉';
              response += `- التغيير 24 ساعة: ${arrow} ${rate.change_percentage_24h?.toFixed(2)}%\n`;
            }
            response += '\n';
          });
          return response;
        } else {
          let response = '💱 **Currency Rates:**\n\n';
          rates.forEach((rate: any) => {
            response += `**${rate.base_currency}/${rate.target_currency}**\n`;
            response += `- Rate: ${rate.exchange_rate?.toFixed(4)}\n`;
            if (rate.change_percentage_24h) {
              const arrow = rate.change_percentage_24h > 0 ? '📈' : '📉';
              response += `- 24h Change: ${arrow} ${rate.change_percentage_24h?.toFixed(2)}%\n`;
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
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Classifying query:', message);
    const classification = quickClassify(message);
    
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
            queryType: 'quick',
            category: classification.category
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // For complex queries, delegate to RAG agent
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
      JSON.stringify({ ...ragData, queryType: 'complex' }),
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
