-- Fix remaining functions with missing search_path configuration

-- Fix all the update trigger functions
CREATE OR REPLACE FUNCTION public.update_us_stocks_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_india_stocks_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_europe_bonds_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_us_real_estate_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_europe_etfs_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_us_bank_products_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_india_bank_products_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_us_bonds_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_india_real_estate_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_us_etfs_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_india_bonds_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_egypt_stocks_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_india_etfs_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_europe_stocks_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_europe_bank_products_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Fix the market summary functions
CREATE OR REPLACE FUNCTION public.get_etf_performance_summary()
RETURNS TABLE(total_etfs integer, avg_change numeric, positive_etfs integer, negative_etfs integer, total_market_cap numeric, total_volume bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_etfs,
        AVG(change_percentage) as avg_change,
        COUNT(CASE WHEN change_percentage > 0 THEN 1 END)::INTEGER as positive_etfs,
        COUNT(CASE WHEN change_percentage < 0 THEN 1 END)::INTEGER as negative_etfs,
        SUM(market_cap) as total_market_cap,
        SUM(volume) as total_volume
    FROM public.etfs
    WHERE price IS NOT NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_crypto_market_summary()
RETURNS TABLE(total_cryptos integer, total_market_cap numeric, total_volume_24h numeric, avg_change numeric, positive_cryptos integer, negative_cryptos integer, bitcoin_dominance numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    btc_market_cap DECIMAL(25,2);
    total_cap DECIMAL(25,2);
BEGIN
    SELECT market_cap INTO btc_market_cap FROM public.cryptocurrencies WHERE symbol = 'BTC' LIMIT 1;
    SELECT SUM(market_cap) INTO total_cap FROM public.cryptocurrencies WHERE market_cap IS NOT NULL;
    
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_cryptos,
        SUM(market_cap) as total_market_cap,
        SUM(volume_24h) as total_volume_24h,
        AVG(change_percentage_24h) as avg_change,
        COUNT(CASE WHEN change_percentage_24h > 0 THEN 1 END)::INTEGER as positive_cryptos,
        COUNT(CASE WHEN change_percentage_24h < 0 THEN 1 END)::INTEGER as negative_cryptos,
        CASE 
            WHEN total_cap > 0 AND btc_market_cap IS NOT NULL 
            THEN (btc_market_cap / total_cap * 100)
            ELSE 0 
        END as bitcoin_dominance
    FROM public.cryptocurrencies
    WHERE price_usd IS NOT NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_bond_market_summary()
RETURNS TABLE(total_bonds integer, avg_yield numeric, avg_coupon numeric, total_face_value numeric, government_bonds integer, corporate_bonds integer, sukuk_bonds integer, treasury_bonds integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_bonds,
        AVG(yield_to_maturity) as avg_yield,
        AVG(coupon_rate) as avg_coupon,
        SUM(face_value) as total_face_value,
        COUNT(CASE WHEN bond_type = 'GOVERNMENT' THEN 1 END)::INTEGER as government_bonds,
        COUNT(CASE WHEN bond_type = 'CORPORATE' THEN 1 END)::INTEGER as corporate_bonds,
        COUNT(CASE WHEN bond_type = 'SUKUK' THEN 1 END)::INTEGER as sukuk_bonds,
        COUNT(CASE WHEN bond_type = 'TREASURY' THEN 1 END)::INTEGER as treasury_bonds
    FROM public.bonds
    WHERE current_price IS NOT NULL;
END;
$$;

-- Fix cleanup functions
CREATE OR REPLACE FUNCTION public.cleanup_old_gold_prices(keep_records integer DEFAULT 100)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    deleted_count INTEGER := 0;
    current_deleted INTEGER;
    source_name VARCHAR(100);
BEGIN
    -- Loop through each source
    FOR source_name IN SELECT DISTINCT source FROM public.gold_prices LOOP
        -- Delete old records for this source, keeping only the latest ones
        WITH ranked_prices AS (
            SELECT id, ROW_NUMBER() OVER (ORDER BY last_updated DESC) as rn
            FROM public.gold_prices 
            WHERE source = source_name
        )
        DELETE FROM public.gold_prices 
        WHERE id IN (
            SELECT id FROM ranked_prices WHERE rn > keep_records
        );
        
        GET DIAGNOSTICS current_deleted = ROW_COUNT;
        deleted_count := deleted_count + current_deleted;
    END LOOP;
    
    RETURN deleted_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_old_currency_rates(keep_records integer DEFAULT 100)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    deleted_count INTEGER := 0;
    current_deleted INTEGER;
    pair_record RECORD;
BEGIN
    -- Loop through each currency pair
    FOR pair_record IN 
        SELECT DISTINCT base_currency, target_currency 
        FROM public.currency_rates 
    LOOP
        -- Delete old records for this pair, keeping only the latest ones
        WITH ranked_rates AS (
            SELECT id, ROW_NUMBER() OVER (ORDER BY last_updated DESC) as rn
            FROM public.currency_rates 
            WHERE base_currency = pair_record.base_currency 
            AND target_currency = pair_record.target_currency
        )
        DELETE FROM public.currency_rates 
        WHERE id IN (
            SELECT id FROM ranked_rates WHERE rn > keep_records
        );
        
        GET DIAGNOSTICS current_deleted = ROW_COUNT;
        deleted_count := deleted_count + current_deleted;
    END LOOP;
    
    RETURN deleted_count;
END;
$$;