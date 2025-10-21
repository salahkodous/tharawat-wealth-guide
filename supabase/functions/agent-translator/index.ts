import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HF_API_KEY = "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";

async function detectLanguage(text: string): Promise<{ language: 'ar' | 'en' | 'mixed', arabicRatio: number }> {
  const arabicPattern = /[\u0600-\u06FF]/g;
  const englishPattern = /[a-zA-Z]/g;
  
  const arabicMatches = text.match(arabicPattern)?.length || 0;
  const englishMatches = text.match(englishPattern)?.length || 0;
  const total = arabicMatches + englishMatches;
  
  if (total === 0) return { language: 'ar', arabicRatio: 0 };
  
  const arabicRatio = arabicMatches / total;
  
  if (arabicRatio > 0.7) return { language: 'ar', arabicRatio };
  if (arabicRatio < 0.3) return { language: 'en', arabicRatio };
  return { language: 'mixed', arabicRatio };
}

async function translateText(text: string, sourceL: string, targetL: string): Promise<string> {
  const modelMap: Record<string, string> = {
    'ar-en': 'Helsinki-NLP/opus-mt-ar-en',
    'en-ar': 'Helsinki-NLP/opus-mt-en-ar'
  };
  
  const model = modelMap[`${sourceL}-${targetL}`];
  if (!model) return text;
  
  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: text }),
      }
    );
    
    if (!response.ok) {
      console.error('Translation error:', await response.text());
      return text;
    }
    
    const result = await response.json();
    return result[0]?.translation_text || text;
  } catch (error) {
    console.error('Translation failed:', error);
    return text;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, mode } = await req.json();
    
    if (!text) {
      throw new Error('Text is required');
    }

    const detection = await detectLanguage(text);
    console.log('Language detection:', detection);

    let processedText = text;
    let originalLanguage = detection.language;

    // Mode: 'unify' - prepare text for internal processing
    if (mode === 'unify') {
      if (detection.language === 'en') {
        // Keep English as-is
        processedText = text;
      } else if (detection.language === 'mixed') {
        // Mixed: unify to Arabic for better internal processing
        processedText = await translateText(text, 'en', 'ar');
        originalLanguage = 'ar';
      }
      // Pure Arabic stays Arabic
    }
    
    // Mode: 'finalize' - translate back to user's language
    else if (mode === 'finalize') {
      const { targetLanguage, internalText } = await req.json();
      
      if (targetLanguage === 'ar' && detection.language === 'en') {
        processedText = await translateText(internalText, 'ar', 'en');
      } else if (targetLanguage === 'en' && detection.language === 'ar') {
        processedText = await translateText(internalText, 'en', 'ar');
      } else {
        processedText = internalText;
      }
    }

    return new Response(JSON.stringify({
      agent: 'translator',
      originalLanguage,
      detectedLanguage: detection.language,
      arabicRatio: detection.arabicRatio,
      processedText,
      mode
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Translator agent error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Translation failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

