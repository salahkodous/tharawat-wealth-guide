import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HF_API_KEY = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');

async function creativeAnalysis(query: string): Promise<string> {
  const lowerQuery = query.toLowerCase().trim();
  
  // Detect language
  const arabicPattern = /[\u0600-\u06FF]/g;
  const arabicMatches = query.match(arabicPattern);
  const isArabic = arabicMatches && arabicMatches.length > query.length * 0.3;
  
  // Instant responses in detected language - no API call needed
  const greetingPattern = /^(hi|hello|hey|مرحبا|السلام عليكم|أهلا)$/i;
  if (greetingPattern.test(lowerQuery)) {
    return isArabic 
      ? "مرحباً! أنا أناكين، مساعدك المالي الذكي. كيف يمكنني مساعدتك اليوم في أمورك المالية أو الاستثمارية أو أي استفسارات أخرى؟"
      : "Hello! I'm Anakin, your AI financial assistant. How can I help you today with your finances, investments, or any questions you have?";
  }
  
  if (lowerQuery.match(/^(ok|okay|thanks|thank you|شكرا|حسنا)$/i)) {
    return isArabic 
      ? "على الرحب والسعة! أخبرني إذا احتجت أي شيء آخر."
      : "You're welcome! Let me know if you need anything else.";
  }
  
  if (lowerQuery.match(/how are you|كيف حالك/i)) {
    return isArabic
      ? "أنا بخير، شكراً! مستعد لمساعدتك في أي أسئلة مالية أو استفسارات عامة."
      : "I'm doing great, thank you! Ready to help you with any financial questions or general inquiries you have.";
  }
  
  // For other short general queries, provide helpful instant response in detected language
  if (lowerQuery.length < 30) {
    return isArabic
      ? "أنا أناكين، مساعدك الذكي. يمكنني مساعدتك في التخطيط المالي، تحليل الاستثمارات، إدارة المحفظة، والأسئلة العامة. ماذا تريد أن تعرف؟"
      : "I'm Anakin, your AI assistant. I can help you with financial planning, investment analysis, portfolio management, and general questions. What would you like to know?";
  }
  
  // For longer queries, provide quick response in same language
  return isArabic
    ? "أنا هنا لمساعدتك! كيف يمكنني خدمتك؟"
    : "I'm here to help! What would you like to know?";
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    if (!query) {
      throw new Error('Query is required');
    }

    console.log('Creative agent processing:', query);
    
    const output = await creativeAnalysis(query);
    
    return new Response(JSON.stringify({
      agent: 'creative',
      output
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Creative agent error:', error);
    return new Response(JSON.stringify({ 
      agent: 'creative',
      error: error instanceof Error ? error.message : 'Creative agent failed',
      output: 'Creative analysis unavailable.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
