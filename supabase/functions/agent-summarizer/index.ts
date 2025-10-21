import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HF_API_KEY = "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";

async function summarizeContent(query: string, newsData: any): Promise<string> {
  try {
    const model = "google/flan-t5-small";
    
    const newsContext = newsData?.newsArticles?.slice(0, 3).map((article: any) => 
      `${article.title}: ${article.summary}`
    ).join('\n') || '';
    
    const prompt = `Summarize this information concisely: ${newsContext}. User question: ${query}`;

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
            max_length: 200
          }
        }),
      }
    );
    
    if (!response.ok) {
      console.error('Summarizer API error:', await response.text());
      return 'Summarization temporarily unavailable.';
    }
    
    const result = await response.json();
    return result[0]?.generated_text || 'Unable to generate summary.';
  } catch (error) {
    console.error('Summarization error:', error);
    return 'Summarization encountered an error.';
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, newsData } = await req.json();
    
    if (!query) {
      throw new Error('Query is required');
    }

    console.log('Summarizer agent processing:', query);
    
    const output = await summarizeContent(query, newsData);
    
    return new Response(JSON.stringify({
      agent: 'summarizer',
      output
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Summarizer agent error:', error);
    return new Response(JSON.stringify({ 
      agent: 'summarizer',
      error: error instanceof Error ? error.message : 'Summarizer failed',
      output: 'Summarization unavailable.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
