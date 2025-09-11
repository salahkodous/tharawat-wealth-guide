-- Ensure required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Unschedule previous 4-hour job if it exists
SELECT cron.unschedule('mubasher-scraper-job');

-- Schedule the scraper to run hourly
SELECT cron.schedule(
  'mubasher-scraper-job',
  '0 * * * *', -- every hour
  $$
  SELECT
    net.http_post(
        url:='https://nuslehifiiopxqggsejl.supabase.co/functions/v1/mubasher-scraper',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51c2xlaGlmaWlvcHhxZ2dzZWpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0Mjk2NzksImV4cCI6MjA2OTAwNTY3OX0.RIIVNszOSW-23_71Pft_muIl7x_afYfD3SrKJ2Ypad8"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);

-- Run an immediate initial scrape now
SELECT net.http_post(
  url:='https://nuslehifiiopxqggsejl.supabase.co/functions/v1/mubasher-scraper',
  headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51c2xlaGlmaWlvcHhxZ2dzZWpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0Mjk2NzksImV4cCI6MjA2OTAwNTY3OX0.RIIVNszOSW-23_71Pft_muIl7x_afYfD3SrKJ2Ypad8"}'::jsonb,
  body:='{"trigger":"manual_initial"}'::jsonb
);