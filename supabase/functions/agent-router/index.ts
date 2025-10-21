import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HF_API_KEY = "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";

async function detectIntent(text: string): Promise<any> {
  const lowerText = text.toLowerCase();
  const intents: string[] = [];
  
  // Translator intent
  if (lowerText.match(/(ترجم|translate|arabic|english)/)) {
    intents.push('translator');
  }
  
  // Finance intent
  if (lowerText.match(/(ميزانية|مصروفات|أهداف|دخل|budget|expense|income|financial|goal)/)) {
    intents.push('finance');
  }
  
  // Portfolio intent
  if (lowerText.match(/(استثمار|محفظة|عائد|risk|portfolio|investment|return|stock|fund)/)) {
    intents.push('portfolio');
  }
  
  // Data Analyst intent
  if (lowerText.match(/(تحليل|نمط|data|chart|analysis|trend|pattern)/)) {
    intents.push('data_analyst');
  }
  
  // Scam detection intent
  if (lowerText.match(/(احتيال|نصب|scam|fraud|suspicious|fake)/)) {
    intents.push('scam');
  }
  
  // Summarizer intent
  if (lowerText.match(/(خبر|ملخص|report|summary|news|article)/)) {
    intents.push('summarizer');
  }
  
  // Creative intent
  if (lowerText.match(/(idea|قيم|تحليل مفاهيمي|concept|creative|evaluate|value)/)) {
    intents.push('creative');
  }
  
  // Default to finance if no specific intent
  if (intents.length === 0) {
    intents.push('finance');
  }
  
  return intents;
}

function generateOrchestrationPlan(intents: string[], text: string, originalLanguage: string): string {
  const plans: string[] = [];
  
  if (intents.includes('finance') && intents.includes('portfolio')) {
    plans.push('Combine Finance and Portfolio outputs to form one comprehensive investment and financial summary.');
  }
  
  if (intents.includes('data_analyst')) {
    plans.push('Use Data Analyst insights to identify patterns and trends that should inform other agents.');
  }
  
  if (intents.includes('scam')) {
    plans.push('Prioritize Scam Agent warnings and integrate them prominently in the final response.');
  }
  
  if (intents.includes('summarizer')) {
    plans.push('Use Summarizer output as the foundation and enrich it with other agent insights.');
  }
  
  if (intents.includes('creative')) {
    plans.push('Incorporate Creative Agent conceptual analysis to provide deeper value assessment.');
  }
  
  // Language instruction
  const languageInstruction = originalLanguage === 'ar' 
    ? 'Ensure the final orchestrated response is in Arabic.'
    : 'Ensure the final orchestrated response is in English.';
  
  plans.push(languageInstruction);
  
  return plans.join(' ');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, originalLanguage } = await req.json();
    
    if (!text) {
      throw new Error('Text is required');
    }

    console.log('Router analyzing:', text);
    
    const intents = await detectIntent(text);
    const plan = generateOrchestrationPlan(intents, text, originalLanguage);
    
    const needsClarification = intents.length > 3;
    
    return new Response(JSON.stringify({
      agent: 'router',
      intents,
      plan,
      needsClarification,
      originalLanguage,
      agentsToActivate: intents.filter((i: string) => i !== 'translator')
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Router agent error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Router failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
