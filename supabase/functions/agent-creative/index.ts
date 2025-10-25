import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HF_API_KEY = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');

async function creativeAnalysis(query: string): Promise<string> {
  const lowerQuery = query.toLowerCase().trim();
  
  // Instant responses for common queries - no API call needed
  const greetingPattern = /^(hi|hello|hey|مرحبا|السلام عليكم|أهلا)$/i;
  if (greetingPattern.test(lowerQuery)) {
    return "Hello! I'm Anakin, your AI financial assistant. How can I help you today with your finances, investments, or any questions you have?";
  }
  
  if (lowerQuery.match(/^(ok|okay|thanks|thank you|شكرا|حسنا)$/i)) {
    return "You're welcome! Let me know if you need anything else.";
  }
  
  if (lowerQuery.match(/how are you|كيف حالك/i)) {
    return "I'm doing great, thank you! Ready to help you with any financial questions or general inquiries you have.";
  }
  
  // For other general queries, provide helpful instant response
  if (lowerQuery.length < 30) {
    return "I'm Anakin, your AI assistant. I can help you with financial planning, investment analysis, portfolio management, and general questions. What would you like to know?";
  }
  
  // For longer creative queries, use AI model
  try {
    const model = "microsoft/phi-2";
    const prompt = `You are Anakin, a helpful and friendly AI assistant. Respond naturally and conversationally to: ${query}`;

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          inputs: prompt,
          parameters: {
            max_new_tokens: 150,
            temperature: 0.8,
            return_full_text: false
          }
        }),
      }
    );
    
    if (!response.ok) {
      return 'I\'m here to help! Please let me know what you\'d like to know.';
    }
    
    const result = await response.json();
    return result[0]?.generated_text || 'I\'m here to assist you. What would you like to know?';
  } catch (error) {
    console.error('Creative analysis error:', error);
    return 'Hello! I\'m ready to help. What can I do for you?';
  }
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
