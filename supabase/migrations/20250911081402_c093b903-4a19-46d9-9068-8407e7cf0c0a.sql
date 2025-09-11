-- Create table for Mubasher Egypt stocks (sanitized as mupashir_egypt_stocks)
CREATE TABLE IF NOT EXISTS public.mupashir_egypt_stocks (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  symbol VARCHAR(50) NOT NULL,
  exchange VARCHAR(20) NOT NULL DEFAULT 'EGX',
  currency VARCHAR(10) NOT NULL DEFAULT 'EGP',
  country VARCHAR(50) NOT NULL DEFAULT 'Egypt',
  price NUMERIC,
  change NUMERIC,
  change_percentage NUMERIC,
  previous_close NUMERIC,
  open NUMERIC,
  high NUMERIC,
  low NUMERIC,
  volume BIGINT,
  market_cap NUMERIC,
  sector VARCHAR(120),
  url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_mupashir_egx_symbol UNIQUE(symbol)
);

-- Enable Row Level Security and allow public read access only
ALTER TABLE public.mupashir_egypt_stocks ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'mupashir_egypt_stocks'
      AND policyname = 'Mubasher EG stocks are publicly readable'
  ) THEN
    CREATE POLICY "Mubasher EG stocks are publicly readable"
    ON public.mupashir_egypt_stocks
    FOR SELECT
    USING (true);
  END IF;
END $$;

-- Updated at trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_mupashir_egypt_stocks_updated_at'
  ) THEN
    CREATE TRIGGER trg_mupashir_egypt_stocks_updated_at
    BEFORE UPDATE ON public.mupashir_egypt_stocks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;