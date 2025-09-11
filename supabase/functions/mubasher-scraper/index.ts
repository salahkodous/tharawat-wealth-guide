import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import FirecrawlApp from 'https://esm.sh/@mendable/firecrawl-js@latest'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  console.log('Mubasher scraper function called')

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

    // Initialize Firecrawl
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY')
    if (!firecrawlApiKey) {
      throw new Error('FIRECRAWL_API_KEY not configured')
    }

    const app = new FirecrawlApp({ apiKey: firecrawlApiKey })
    
    console.log('Starting crawl of Mubasher Egypt companies page...')
    
    // Crawl the Mubasher page
    const crawlResponse = await app.crawlUrl('https://www.mubasher.info/countries/eg/companies', {
      limit: 5,
      scrapeOptions: {
        formats: ['markdown', 'html'],
        waitFor: 2000
      }
    })

    if (!crawlResponse.success) {
      throw new Error(`Crawl failed: ${crawlResponse.error || 'Unknown error'}`)
    }

    console.log(`Crawl completed. Processing ${crawlResponse.data?.length || 0} pages...`)

    const stocksData: any[] = []
    
    // Process crawled data
    for (const pageData of crawlResponse.data || []) {
      if (pageData.markdown) {
        // Extract stock information from markdown
        const lines = pageData.markdown.split('\n')
        
        for (const line of lines) {
          // Look for patterns that might contain stock data
          // This is a simplified parser - you may need to adjust based on actual page structure
          if (line.includes('|') && (line.includes('EGP') || line.includes('%'))) {
            const parts = line.split('|').map(p => p.trim()).filter(p => p)
            
            if (parts.length >= 4) {
              try {
                const stockData = {
                  name: parts[0] || '',
                  symbol: parts[1] || '',
                  price: parts[2] ? parseFloat(parts[2].replace(/[^0-9.-]/g, '')) : null,
                  change_percentage: parts[3] ? parseFloat(parts[3].replace(/[^0-9.-]/g, '')) : null,
                  url: pageData.sourceURL || '',
                  metadata: {
                    scraped_at: new Date().toISOString(),
                    source_page: pageData.sourceURL
                  }
                }

                if (stockData.name && stockData.symbol) {
                  stocksData.push(stockData)
                }
              } catch (error) {
                console.warn('Error parsing stock data from line:', line, error)
              }
            }
          }
        }
      }
    }

    console.log(`Extracted ${stocksData.length} stock records`)

    if (stocksData.length > 0) {
      // Upsert data to Supabase
      const { data, error } = await supabaseClient
        .from('mupashir_egypt_stocks')
        .upsert(stocksData, { 
          onConflict: 'symbol',
          ignoreDuplicates: false 
        })
        .select()

      if (error) {
        console.error('Database upsert error:', error)
        throw error
      }

      console.log(`Successfully upserted ${data?.length || 0} stock records`)

      return new Response(
        JSON.stringify({
          success: true,
          message: `Successfully scraped and stored ${data?.length || 0} stocks`,
          crawled_pages: crawlResponse.data?.length || 0,
          extracted_stocks: stocksData.length,
          stored_stocks: data?.length || 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'No stock data could be extracted from the crawled pages',
          crawled_pages: crawlResponse.data?.length || 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})