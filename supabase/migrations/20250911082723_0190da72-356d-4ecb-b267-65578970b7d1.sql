-- Enable the pg_cron extension to run scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable the pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the Mubasher scraper to run every 4 hours to keep data fresh
SELECT cron.schedule(
  'mubasher-scraper-job',
  '0 */4 * * *', -- every 4 hours
  $$
  SELECT
    net.http_post(
        url:='https://nuslehifiiopxqggsejl.supabase.co/functions/v1/mubasher-scraper',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51c2xlaGlmaWlvcHhxZ2dzZWpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0Mjk2NzksImV4cCI6MjA2OTAwNTY3OX0.RIIVNszOSW-23_71Pft_muIl7x_afYfD3SrKJ2Ypad8"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);

-- Initial population: Insert some sample Egyptian stocks to show immediately
INSERT INTO mupashir_egypt_stocks (symbol, name, price, change_percentage, volume, market_cap, currency, country, exchange) VALUES
('CIB', 'Commercial International Bank', 85.50, 2.15, 1250000, 85500000000, 'EGP', 'Egypt', 'EGX'),
('ETEL', 'Eastern Company', 15.25, -1.20, 890000, 15250000000, 'EGP', 'Egypt', 'EGX'),
('HRHO', 'Hassan Allam Holding', 12.80, 0.85, 450000, 12800000000, 'EGP', 'Egypt', 'EGX'),
('SWDY', 'El Sewedy Electric Company', 22.10, 1.55, 670000, 22100000000, 'EGP', 'Egypt', 'EGX'),
('TMGH', 'TMG Holding', 8.45, -0.75, 320000, 8450000000, 'EGP', 'Egypt', 'EGX')
ON CONFLICT (symbol) DO UPDATE SET
  price = EXCLUDED.price,
  change_percentage = EXCLUDED.change_percentage,
  volume = EXCLUDED.volume,
  market_cap = EXCLUDED.market_cap,
  last_updated = now();