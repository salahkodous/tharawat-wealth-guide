import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function getSupabaseClient(req: Request) {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: { Authorization: req.headers.get('Authorization') ?? '' },
    },
    auth: { persistSession: false },
  });
  return supabase;
}

function parsePath(pathname: string) {
  // supports: /deposits, /deposits/{id}, /deposits/{id}/process
  const parts = pathname.split('/').filter(Boolean);
  return { parts };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const { parts } = parsePath(url.pathname);
  const supabase = getSupabaseClient(req);

  try {
    // Ensure authenticated user for all endpoints
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userId = authData.user.id;

    // POST /deposits -> create deposit
    if (req.method === 'POST' && parts.length === 1 && parts[0] === 'deposits') {
      const body = await req.json();
      const {
        deposit_type,
        principal,
        rate = 0,
        start_date = new Date().toISOString().slice(0, 10),
        maturity_date = null,
        linked_asset = null,
        metadata = {},
      } = body ?? {};

      if (!deposit_type || !['fixed_cd', 'savings', 'investment_linked', 'cash_savings'].includes(deposit_type)) {
        return new Response(JSON.stringify({ error: 'Invalid deposit_type' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (principal == null || Number(principal) < 0) {
        return new Response(JSON.stringify({ error: 'Invalid principal' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const insertPayload: any = {
        user_id: userId,
        deposit_type,
        principal: String(principal),
        rate: String(rate ?? 0),
        start_date,
        maturity_date,
        linked_asset,
        metadata,
      };

      const { data: created, error } = await supabase
        .from('deposits')
        .insert(insertPayload)
        .select('*')
        .single();

      if (error) throw error;

      // log creation
      await supabase.from('deposit_transactions').insert({
        user_id: userId,
        deposit_id: created.id,
        tx_type: 'creation',
        amount: String(principal),
        description: 'Initial principal',
      });

      return new Response(JSON.stringify(created), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      });
    }

    // GET /deposits/{id}
    if (req.method === 'GET' && parts.length === 2 && parts[0] === 'deposits') {
      const id = parts[1];
      // RLS ensures user ownership; also verify user_id for clarity
      const { data: deposit, error: depErr } = await supabase
        .from('deposits')
        .select('id,user_id')
        .eq('id', id)
        .maybeSingle();
      if (depErr) throw depErr;
      if (!deposit) {
        return new Response(JSON.stringify({ error: 'Not Found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: viewData, error: viewErr } = await supabase.rpc('get_deposit_view', {
        p_deposit_id: id,
      });
      if (viewErr) throw viewErr;

      return new Response(JSON.stringify(viewData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PUT /deposits/{id}/process
    if (
      req.method === 'PUT' &&
      parts.length === 3 &&
      parts[0] === 'deposits' &&
      parts[2] === 'process'
    ) {
      const id = parts[1];
      // Ensure it belongs to user (RLS also guards)
      const { data: deposit, error: depErr } = await supabase
        .from('deposits')
        .select('id,user_id')
        .eq('id', id)
        .maybeSingle();
      if (depErr) throw depErr;
      if (!deposit) {
        return new Response(JSON.stringify({ error: 'Not Found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: result, error: procErr } = await supabase.rpc('process_deposit', {
        p_deposit_id: id,
      });
      if (procErr) throw procErr;

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Route not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('deposits function error', e);
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
