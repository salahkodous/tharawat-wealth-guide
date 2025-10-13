import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Stock {
  id: number;
  symbol: string;
  name: string;
  price: number | null;
  change: number | null;
  change_percent: number | null;
  volume: number | null;
  market_cap: number | null;
  country: string;
  currency: string;
  exchange: string;
  sector: string | null;
  last_updated?: string;
  high?: number | null;
  low?: number | null;
  open?: number | null;
  turnover?: number | null;
}

export interface Cryptocurrency {
  id: number;
  symbol: string;
  name: string;
  price_usd: number | null;
  price_egp: number | null;
  change_24h: number | null;
  change_percentage_24h: number | null;
  volume_24h: number | null;
  market_cap: number | null;
  rank: number | null;
  last_updated?: string;
}

export interface Bond {
  id: number;
  symbol: string;
  name: string;
  name_ar?: string;
  bond_type: string;
  issuer: string;
  current_price: number | null;
  face_value: number | null;
  yield_to_maturity: number | null;
  coupon_rate: number | null;
  maturity_date?: string;
  currency: string;
  country: string;
  last_updated?: string;
}

export interface ETF {
  id: number;
  symbol: string;
  name: string;
  name_ar?: string;
  price: number | null;
  change: number | null;
  change_percentage: number | null;
  volume: number | null;
  market_cap: number | null;
  nav: number | null;
  expense_ratio: number | null;
  currency: string;
  country: string;
  exchange: string;
  last_updated?: string;
}

export interface RealEstatePrice {
  id: number;
  city_name?: string;
  neighborhood_name?: string;
  property_type: string;
  min_price: number | null;
  max_price: number | null;
  avg_price_per_meter: number | null;
  min_price_per_meter: number | null;
  max_price_per_meter: number | null;
  currency: string;
  total_properties?: number;
  last_updated?: string;
}

export interface GoldPrice {
  id: number;
  source: string;
  price_24k_egp: number | null;
  price_22k_egp: number | null;
  price_21k_egp: number | null;
  price_18k_egp: number | null;
  price_14k_egp: number | null;
  price_per_ounce_usd: number | null;
  price_per_ounce_egp: number;
  change_24h: number | null;
  change_percentage_24h: number | null;
  last_updated?: string;
}

export interface CurrencyRate {
  id: number;
  base_currency: string;
  target_currency: string;
  exchange_rate: number;
  bid_rate: number | null;
  ask_rate: number | null;
  change_24h: number | null;
  change_percentage_24h: number | null;
  source: string;
  last_updated?: string;
}

export interface BankProduct {
  id: number;
  bank_name: string;
  bank_name_ar?: string;
  product_name: string;
  product_name_ar?: string;
  product_type: string;
  interest_rate: number | null;
  minimum_amount: number | null;
  maximum_amount: number | null;
  term_months: number | null;
  currency: string;
  features?: string;
  eligibility?: string;
  monthly_fee: number | null;
  opening_fee: number | null;
  is_active?: boolean;
}

export const useMarketData = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [cryptos, setCryptos] = useState<Cryptocurrency[]>([]);
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [etfs, setETFs] = useState<ETF[]>([]);
  const [realEstate, setRealEstate] = useState<RealEstatePrice[]>([]);
  const [goldPrices, setGoldPrices] = useState<GoldPrice[]>([]);
  const [currencyRates, setCurrencyRates] = useState<CurrencyRate[]>([]);
  const [bankProducts, setBankProducts] = useState<BankProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // For backward compatibility, this hook still fetches from base tables (Egypt)
  // Use useGlobalMarketData for country-specific data

  const fetchStocks = async () => {
    try {
      console.log('Fetching stocks from Egypt stocks table...');

      // Fetch data from the Egypt stocks table with 24h changes
      const { data, error } = await (supabase as any)
        .from('egyptian_stocks')
        .select('*')
        .order('change_percent', { ascending: false });
      
      if (error) {
        console.error('Error fetching stocks:', error);
        return;
      }
      
      console.log('Fetched stocks:', data?.length || 0);
      
      const formattedStocks: Stock[] = (data || []).map((stock: any) => ({
        id: stock.id,
        symbol: stock.symbol || 'N/A',
        name: stock.name || 'Unknown',
        price: stock.price,
        change: stock.change,
        change_percent: stock.change_percent,
        volume: stock.volume,
        market_cap: stock.market_cap || null,
        country: stock.country || 'Egypt',
        currency: stock.currency || 'EGP',
        exchange: stock.exchange || 'EGX',
        sector: stock.sector || null,
        last_updated: stock.last_updated,
        high: stock.high,
        low: stock.low,
        open: stock.open,
        turnover: stock.turnover
      }));
      
      setStocks(formattedStocks);
    } catch (error) {
      console.error('Error in fetchStocks:', error);
    }
  };

  const fetchCryptocurrencies = async () => {
    const { data, error } = await supabase
      .from('cryptocurrencies')
      .select('*')
      .order('rank', { ascending: true });
    
    if (!error && data) {
      setCryptos(data as Cryptocurrency[]);
    }
  };

  const fetchBonds = async () => {
    // Note: bonds table does not exist in current schema
    // const { data, error } = await supabase
    //   .from('bonds')
    //   .select('*')
    //   .order('yield_to_maturity', { ascending: false });
    
    // if (!error && data) {
    //   setBonds(data as Bond[]);
    // }
    console.log('Bonds table not available in current schema');
  };

  const fetchETFs = async () => {
    const { data, error } = await supabase
      .from('etfs')
      .select('*')
      .order('market_cap', { ascending: false });
    
    if (!error && data) {
      // Map database fields to interface fields
      const mappedData = data.map(etf => ({
        id: etf.id as unknown as number,
        symbol: etf.symbol,
        name: etf.name,
        price: etf.price,
        change: etf.change_amount,
        change_percentage: etf.change_percent,
        volume: etf.volume,
        market_cap: etf.market_cap,
        nav: etf.nav,
        expense_ratio: etf.expense_ratio,
        currency: etf.country === 'Egypt' ? 'EGP' : 'USD', // Default currency based on country
        country: etf.country,
        exchange: 'N/A', // Not in database, set default
        last_updated: etf.last_updated,
      }));
      setETFs(mappedData as ETF[]);
    }
  };

  const fetchRealEstate = async () => {
    const { data, error } = await supabase
      .from('real_estate_prices')
      .select('*')
      .order('avg_price_per_meter', { ascending: false });
    
    if (!error && data) {
      setRealEstate(data as RealEstatePrice[]);
    }
  };

  const fetchGoldPrices = async () => {
    // Note: gold_prices table does not exist in current schema
    // const { data, error } = await supabase
    //   .from('gold_prices')
    //   .select('*')
    //   .order('last_updated', { ascending: false })
    //   .limit(10);
    
    // if (!error && data) {
    //   setGoldPrices(data as GoldPrice[]);
    // }
    console.log('Gold prices table not available in current schema');
  };

  const fetchCurrencyRates = async () => {
    const { data, error } = await supabase
      .from('currency_rates')
      .select('*')
      .order('last_updated', { ascending: false });
    
    if (!error && data) {
      setCurrencyRates(data as CurrencyRate[]);
    }
  };

  const fetchBankProducts = async () => {
    const { data, error } = await supabase
      .from('bank_products')
      .select('*')
      .eq('is_active', true)
      .order('interest_rate', { ascending: false });
    
    if (!error && data) {
      setBankProducts(data as BankProduct[]);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStocks(),
        fetchCryptocurrencies(),
        fetchBonds(),
        fetchETFs(),
        fetchRealEstate(),
        fetchGoldPrices(),
        fetchCurrencyRates(),
        fetchBankProducts(),
      ]);
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const refetch = fetchAllData;

  return {
    stocks,
    cryptos,
    bonds,
    etfs,
    realEstate,
    goldPrices,
    currencyRates,
    bankProducts,
    loading,
    refetch,
    fetchStocks,
    fetchCryptocurrencies,
    fetchBonds,
    fetchETFs,
    fetchRealEstate,
    fetchGoldPrices,
    fetchCurrencyRates,
    fetchBankProducts,
  };
};