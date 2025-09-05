-- Enable RLS on market data tables to fix security issues
-- These tables contain public market data so we'll make them readable by everyone

-- Enable RLS on all tables that don't have it
ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cryptocurrencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.etfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gold_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.currency_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.real_estate_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neighborhoods ENABLE ROW LEVEL SECURITY;

-- Create policies for market data tables (public read access)
CREATE POLICY "Market data is publicly readable" ON public.stocks FOR SELECT USING (true);
CREATE POLICY "Crypto data is publicly readable" ON public.cryptocurrencies FOR SELECT USING (true);
CREATE POLICY "Bond data is publicly readable" ON public.bonds FOR SELECT USING (true);
CREATE POLICY "ETF data is publicly readable" ON public.etfs FOR SELECT USING (true);
CREATE POLICY "Gold prices are publicly readable" ON public.gold_prices FOR SELECT USING (true);
CREATE POLICY "Currency rates are publicly readable" ON public.currency_rates FOR SELECT USING (true);
CREATE POLICY "Real estate prices are publicly readable" ON public.real_estate_prices FOR SELECT USING (true);
CREATE POLICY "Bank products are publicly readable" ON public.bank_products FOR SELECT USING (true);
CREATE POLICY "Cities are publicly readable" ON public.cities FOR SELECT USING (true);
CREATE POLICY "Neighborhoods are publicly readable" ON public.neighborhoods FOR SELECT USING (true);