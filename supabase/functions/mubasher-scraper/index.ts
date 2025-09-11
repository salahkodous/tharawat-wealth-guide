import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  console.log('Mubasher scraper function called (API mode)')

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        }
      }
    )

    // Fetch listed companies directly from Mubasher API
    const apiUrl = 'https://www.mubasher.info/api/1/listed-companies?country=eg'
    console.log('Fetching:', apiUrl)

    const response = await fetch(apiUrl, { headers: { 'accept': 'application/json' } })
    if (!response.ok) {
      throw new Error(`Mubasher API error: ${response.status} ${response.statusText}`)
    }

    const payload = await response.json()
    const rows: any[] = Array.isArray(payload?.rows) ? payload.rows : []

    console.log(`Fetched ${rows.length} companies from Mubasher API`)

    const baseUrl = 'https://www.mubasher.info'
    const stocksData = rows.map((row) => {
      const symbol = String(row.symbol || '').trim()
      const name = String(row.name || '').trim()
      const price = typeof row.price === 'number' ? row.price : null
      const change_percentage = typeof row.changePercentage === 'number' ? row.changePercentage : (typeof row.change_percentage === 'number' ? row.change_percentage : null)
      const relativeUrl = String(row.url || row.profileUrl || '')

      return {
        symbol,
        name,
        price,
        change_percentage,
        url: relativeUrl ? `${baseUrl}${relativeUrl}` : baseUrl,
        currency: row.currency || 'EGP',
        country: 'Egypt',
        exchange: 'EGX',
        metadata: {
          sector: row.sector || null,
          market: row.market || 'EGX',
          last_update_text: row.lastUpdate || null,
          source: 'mubasher_api_v1',
        },
        last_updated: new Date().toISOString(),
      }
    }).filter((s: any) => s.symbol && s.name)

    if (stocksData.length === 0) {
      console.warn('No stocks parsed from Mubasher API response')
      return new Response(
        JSON.stringify({ success: false, message: 'No companies found from Mubasher API' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Upsert into Supabase
    const { data, error } = await supabaseClient
      .from('mupashir_egypt_stocks')
      .upsert(stocksData, { onConflict: 'symbol', ignoreDuplicates: false })
      .select()

    if (error) {
      console.error('Database upsert error:', error)
      throw error
    }

    console.log(`Successfully upserted ${data?.length || 0} stock records`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Upserted ${data?.length || 0} Egypt companies from Mubasher API`,
        fetched: rows.length,
        stored: data?.length || 0,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})