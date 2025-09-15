-- Enable Row Level Security on all market data tables and create public read policies

-- China market data tables
ALTER TABLE public.china_bank_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.china_bonds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.china_etfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.china_real_estate ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.china_stocks ENABLE ROW LEVEL SECURITY;

-- Egypt market data tables
ALTER TABLE public.egypt_stocks ENABLE ROW LEVEL SECURITY;

-- Europe market data tables
ALTER TABLE public.europe_bank_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.europe_bonds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.europe_etfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.europe_real_estate ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.europe_stocks ENABLE ROW LEVEL SECURITY;

-- Germany market data tables
ALTER TABLE public.germany_stocks ENABLE ROW LEVEL SECURITY;

-- India market data tables
ALTER TABLE public.india_bank_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.india_bonds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.india_etfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.india_real_estate ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.india_stocks ENABLE ROW LEVEL SECURITY;

-- Saudi Arabia market data tables
ALTER TABLE public.saudi_bank_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saudi_bonds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saudi_etfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saudi_real_estate ENABLE ROW LEVEL SECURITY;

-- UAE market data tables
ALTER TABLE public.uae_bank_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uae_bonds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uae_etfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uae_real_estate ENABLE ROW LEVEL SECURITY;

-- US market data tables
ALTER TABLE public.us_bank_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.us_bonds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.us_etfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.us_real_estate ENABLE ROW LEVEL SECURITY;

-- Create public read policies for all market data tables (these are publicly accessible data)

-- China market data policies
CREATE POLICY "China bank products are publicly readable" ON public.china_bank_products FOR SELECT USING (true);
CREATE POLICY "China bonds are publicly readable" ON public.china_bonds FOR SELECT USING (true);
CREATE POLICY "China ETFs are publicly readable" ON public.china_etfs FOR SELECT USING (true);
CREATE POLICY "China real estate data is publicly readable" ON public.china_real_estate FOR SELECT USING (true);
CREATE POLICY "China stocks are publicly readable" ON public.china_stocks FOR SELECT USING (true);

-- Egypt market data policies
CREATE POLICY "Egypt stocks are publicly readable" ON public.egypt_stocks FOR SELECT USING (true);

-- Europe market data policies
CREATE POLICY "Europe bank products are publicly readable" ON public.europe_bank_products FOR SELECT USING (true);
CREATE POLICY "Europe bonds are publicly readable" ON public.europe_bonds FOR SELECT USING (true);
CREATE POLICY "Europe ETFs are publicly readable" ON public.europe_etfs FOR SELECT USING (true);
CREATE POLICY "Europe real estate data is publicly readable" ON public.europe_real_estate FOR SELECT USING (true);
CREATE POLICY "Europe stocks are publicly readable" ON public.europe_stocks FOR SELECT USING (true);

-- Germany market data policies
CREATE POLICY "Germany stocks are publicly readable" ON public.germany_stocks FOR SELECT USING (true);

-- India market data policies
CREATE POLICY "India bank products are publicly readable" ON public.india_bank_products FOR SELECT USING (true);
CREATE POLICY "India bonds are publicly readable" ON public.india_bonds FOR SELECT USING (true);
CREATE POLICY "India ETFs are publicly readable" ON public.india_etfs FOR SELECT USING (true);
CREATE POLICY "India real estate data is publicly readable" ON public.india_real_estate FOR SELECT USING (true);
CREATE POLICY "India stocks are publicly readable" ON public.india_stocks FOR SELECT USING (true);

-- Saudi Arabia market data policies
CREATE POLICY "Saudi bank products are publicly readable" ON public.saudi_bank_products FOR SELECT USING (true);
CREATE POLICY "Saudi bonds are publicly readable" ON public.saudi_bonds FOR SELECT USING (true);
CREATE POLICY "Saudi ETFs are publicly readable" ON public.saudi_etfs FOR SELECT USING (true);
CREATE POLICY "Saudi real estate data is publicly readable" ON public.saudi_real_estate FOR SELECT USING (true);

-- UAE market data policies
CREATE POLICY "UAE bank products are publicly readable" ON public.uae_bank_products FOR SELECT USING (true);
CREATE POLICY "UAE bonds are publicly readable" ON public.uae_bonds FOR SELECT USING (true);
CREATE POLICY "UAE ETFs are publicly readable" ON public.uae_etfs FOR SELECT USING (true);
CREATE POLICY "UAE real estate data is publicly readable" ON public.uae_real_estate FOR SELECT USING (true);

-- US market data policies
CREATE POLICY "US bank products are publicly readable" ON public.us_bank_products FOR SELECT USING (true);
CREATE POLICY "US bonds are publicly readable" ON public.us_bonds FOR SELECT USING (true);
CREATE POLICY "US ETFs are publicly readable" ON public.us_etfs FOR SELECT USING (true);
CREATE POLICY "US real estate data is publicly readable" ON public.us_real_estate FOR SELECT USING (true);