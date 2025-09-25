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

export const useMarketData = (userCountryCode?: string) => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [cryptos, setCryptos] = useState<Cryptocurrency[]>([]);
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [etfs, setETFs] = useState<ETF[]>([]);
  const [realEstate, setRealEstate] = useState<RealEstatePrice[]>([]);
  const [goldPrices, setGoldPrices] = useState<GoldPrice[]>([]);
  const [currencyRates, setCurrencyRates] = useState<CurrencyRate[]>([]);
  const [bankProducts, setBankProducts] = useState<BankProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Country to table mapping for stocks
  const getStockTableName = (countryCode: string) => {
    switch (countryCode) {
      case 'EG':
        return 'egypt_stocks';
      case 'SA':
        return 'saudi_stocks';
      case 'AE':
        return 'uae_stocks';
      default:
        return 'egypt_stocks'; // Default to Egypt
    }
  };

  // Country name mapping
  const getCountryName = (countryCode: string) => {
    switch (countryCode) {
      case 'EG':
        return 'Egypt';
      case 'SA':
        return 'Saudi Arabia';
      case 'AE':
        return 'UAE';
      default:
        return 'Egypt';
    }
  };

  const fetchStocks = async () => {
    try {
      const countryCode = userCountryCode || 'EG';
      const tableName = getStockTableName(countryCode);
      const countryName = getCountryName(countryCode);
      
      console.log(`Fetching stocks from ${tableName} for ${countryName}...`);

      const { data, error } = await supabase
        .from(tableName as any)
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
        country: stock.country || countryName,
        currency: stock.currency || (countryCode === 'EG' ? 'EGP' : countryCode === 'SA' ? 'SAR' : 'AED'),
        exchange: stock.exchange || (countryCode === 'EG' ? 'EGX' : countryCode === 'SA' ? 'TADAWUL' : 'ADX'),
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
    const countryName = getCountryName(userCountryCode || 'EG');
    console.log(`📊 Fetching bonds for: ${countryName}`);
    
    try {
      // Try to fetch from bonds table with country filter
      const { data, error } = await supabase
        .from('bonds' as any)
        .select('*')
        .eq('country', countryName)
        .order('yield', { ascending: false });
      
      if (!error && data) {
        console.log(`✅ Found ${data.length} bonds for ${countryName}`);
        setBonds(data as unknown as Bond[]);
      } else {
        console.log(`⚠️ Bonds table not available or no data for country: ${countryName}`);
      }
    } catch (err) {
      console.log('❌ Bonds table not available:', err);
    }
  };

  const fetchETFs = async () => {
    const countryName = getCountryName(userCountryCode || 'EG');
    
    try {
      // Try etfs table first
      const { data: etfsData, error: etfsError } = await supabase
        .from('etfs')
        .select('*')
        .eq('country', countryName)
        .order('market_cap', { ascending: false });
      
      if (!etfsError && etfsData && etfsData.length > 0) {
        setETFs(etfsData as ETF[]);
        return;
      }
      
      // Fallback to europe_etfs if no data in etfs table
      const { data: europeData, error: europeError } = await supabase
        .from('europe_etfs')
        .select('*')
        .eq('country', countryName)
        .order('assets_under_management', { ascending: false });
      
      if (!europeError && europeData) {
        // Map europe_etfs format to ETF interface
        const mappedData = europeData.map((item: any) => ({
          id: item.id,
          symbol: item.symbol,
          name: item.name,
          price: item.price,
          change: item.change,
          change_percentage: item.change_percentage,
          volume: item.volume,
          market_cap: item.assets_under_management,
          nav: item.nav,
          expense_ratio: item.expense_ratio,
          currency: item.currency,
          country: item.country,
          exchange: item.exchange,
          last_updated: item.last_updated,
        }));
        setETFs(mappedData as ETF[]);
      }
    } catch (error) {
      console.log('ETF tables not available:', error);
    }
  };

  const fetchRealEstate = async () => {
    const countryName = getCountryName(userCountryCode || 'EG');
    
    // Check if we have real estate data with country column
    const { data, error } = await supabase
      .from('real_estate' as any)
      .select('*')
      .eq('country', countryName)
      .order('price_per_sqm', { ascending: false });
    
    if (!error && data) {
      // Map real_estate table format to RealEstatePrice interface
      const mappedData = data.map((item: any) => ({
        id: item.id,
        city_name: item.city,
        neighborhood_name: item.area_name,
        property_type: item.property_type,
        min_price: null,
        max_price: item.avg_total_price,
        avg_price_per_meter: item.price_per_sqm,
        min_price_per_meter: null,
        max_price_per_meter: null,
        currency: item.currency,
        total_properties: null,
        last_updated: item.last_updated,
      }));
      setRealEstate(mappedData as RealEstatePrice[]);
    } else {
      // Fallback to real_estate_prices table if real_estate doesn't exist
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('real_estate_prices')
        .select('*')
        .order('avg_price_per_meter', { ascending: false });
      
      if (!fallbackError && fallbackData) {
        setRealEstate(fallbackData as RealEstatePrice[]);
      }
    }
  };

  const fetchGoldPrices = async () => {
    const countryName = getCountryName(userCountryCode || 'EG');
    
    try {
      // Try to fetch from gold_prices table with country filter
      const { data, error } = await supabase
        .from('gold_prices' as any)
        .select('*')
        .eq('country', countryName)
        .order('last_updated', { ascending: false })
        .limit(10);
      
      if (!error && data) {
        setGoldPrices(data as unknown as GoldPrice[]);
      } else {
        console.log('Gold prices table not available or no data for country:', countryName);
      }
    } catch (err) {
      console.log('Gold prices table not available:', err);
    }
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
    const countryName = getCountryName(userCountryCode || 'EG');
    const currencyCode = userCountryCode === 'EG' ? 'EGP' : userCountryCode === 'SA' ? 'SAR' : userCountryCode === 'AE' ? 'AED' : 'EGP';
    
    try {
      // Filter bank products by currency as they might not have country column
      const { data, error } = await supabase
        .from('bank_products')
        .select('*')
        .eq('is_active', true)
        .eq('currency', currencyCode)
        .order('interest_rate', { ascending: false });
      
      if (!error && data) {
        setBankProducts(data as BankProduct[]);
      } else {
        console.log('Bank products not available for currency:', currencyCode);
      }
    } catch (error) {
      console.log('Bank products table not available:', error);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    console.log(`🌍 Fetching market data for country: ${userCountryCode || 'EG'} (${getCountryName(userCountryCode || 'EG')})`);
    
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
      console.log('✅ Market data fetch complete');
    } catch (error) {
      console.error('❌ Error fetching market data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [userCountryCode]);

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