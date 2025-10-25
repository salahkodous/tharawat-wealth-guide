import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HF_API_KEY = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');

async function orchestrateOutputs(agentOutputs: any[], plan: string): Promise<string> {
  try {
    // If only one agent, return its output directly without orchestration
    if (agentOutputs.length === 1) {
      return agentOutputs[0].output;
    }
    
    const model = "microsoft/phi-2";
    
    // Combine all agent outputs WITHOUT agent name prefixes
    const combinedOutputs = agentOutputs.map(output => output.output).join('\n\n');
    
    const prompt = `You are an AI assistant. Combine these insights into one natural, coherent response following this plan:

PLAN: ${plan}

INSIGHTS:
${combinedOutputs}

Provide a unified response without mentioning agent names or sources:`;

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
            max_new_tokens: 300,
            temperature: 0.7,
            return_full_text: false
          }
        }),
      }
    );
    
    if (!response.ok) {
      console.error('Orchestrator API error:', await response.text());
      // Fallback: simple concatenation without agent names
      return agentOutputs.map(o => o.output).join('\n\n');
    }
    
    const result = await response.json();
    return result[0]?.generated_text || combinedOutputs;
  } catch (error) {
    console.error('Orchestration error:', error);
    // Fallback: combine outputs without agent names
    return agentOutputs.map(o => o.output).join('\n\n');
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agentOutputs, plan } = await req.json();
    
    if (!agentOutputs || !Array.isArray(agentOutputs)) {
      throw new Error('Agent outputs array is required');
    }

    console.log('Orchestrator combining', agentOutputs.length, 'agent outputs');
    
    const output = await orchestrateOutputs(agentOutputs, plan || 'Combine all outputs coherently');
    
    return new Response(JSON.stringify({
      agent: 'orchestrator',
      output
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Orchestrator error:', error);
    return new Response(JSON.stringify({ 
      agent: 'orchestrator',
      error: error instanceof Error ? error.message : 'Orchestration failed',
      output: 'Unable to combine agent outputs.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
