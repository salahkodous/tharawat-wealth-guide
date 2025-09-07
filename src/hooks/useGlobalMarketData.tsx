import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserCountry } from './useUserCountry';

export interface GlobalStock {
  id: number;
  symbol: string;
  name: string;
  price: number | null;
  change: number | null;
  change_percentage: number | null;
  volume: number | null;
  market_cap: number | null;
  currency: string;
  country: string;
  exchange: string;
  sector?: string;
}

export interface GlobalBond {
  id: number;
  symbol?: string;
  bond_name: string;
  bond_type: string;
  issuer: string;
  current_price: number | null;
  face_value: number | null;
  yield_rate?: number | null;
  yield_to_maturity?: number | null;
  coupon_rate: number | null;
  maturity_date?: string;
  currency: string;
  country: string;
}

export interface GlobalETF {
  id: number;
  symbol: string;
  name: string;
  price: number | null;
  change?: number | null;
  change_percentage?: number | null;
  volume?: number | null;
  nav: number;
  expense_ratio?: number | null;
  currency: string;
  country: string;
  exchange?: string;
  category?: string;
}

export interface GlobalRealEstate {
  id: number;
  city: string;
  neighborhood?: string;
  property_type: string;
  median_price_local?: number | null;
  price_per_sqm_local?: number | null;
  price_per_sqft_inr?: number | null;
  currency: string;
  country: string;
  market_trend?: string;
}

export interface GlobalBankProduct {
  id: number;
  bank_name: string;
  product_name: string;
  product_type: string;
  interest_rate: number;
  minimum_amount?: number | null;
  maximum_amount?: number | null;
  currency: string;
  country: string;
  features?: string;
}

const countryTableMapping = {
  EG: { prefix: '', country: 'Egypt' },
  US: { prefix: 'us_', country: 'United States' },
  GB: { prefix: 'europe_', country: 'United Kingdom' },
  DE: { prefix: 'europe_', country: 'Germany' },
  FR: { prefix: 'europe_', country: 'France' },
  IN: { prefix: 'india_', country: 'India' },
  CN: { prefix: 'china_', country: 'China' },
  SA: { prefix: '', country: 'Saudi Arabia' },
  AE: { prefix: '', country: 'UAE' },
  // Other GCC and Arab countries use the base tables (Egypt structure)
  QA: { prefix: '', country: 'Qatar' },
  KW: { prefix: '', country: 'Kuwait' },
  BH: { prefix: '', country: 'Bahrain' },
  OM: { prefix: '', country: 'Oman' },
  JO: { prefix: '', country: 'Jordan' },
  LB: { prefix: '', country: 'Lebanon' },
  MA: { prefix: '', country: 'Morocco' },
  TN: { prefix: '', country: 'Tunisia' },
  DZ: { prefix: '', country: 'Algeria' },
  IQ: { prefix: '', country: 'Iraq' },
};

export const useGlobalMarketData = () => {
  const { userCountry } = useUserCountry();
  const [stocks, setStocks] = useState<GlobalStock[]>([]);
  const [bonds, setBonds] = useState<GlobalBond[]>([]);
  const [etfs, setETFs] = useState<GlobalETF[]>([]);
  const [realEstate, setRealEstate] = useState<GlobalRealEstate[]>([]);
  const [bankProducts, setBankProducts] = useState<GlobalBankProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const getTableConfig = (countryCode: string) => {
    return countryTableMapping[countryCode as keyof typeof countryTableMapping] || 
           { prefix: '', country: 'Egypt' };
  };

  const fetchCountryStocks = async (countryCode: string) => {
    const config = getTableConfig(countryCode);
    const tableName = config.prefix ? `${config.prefix}stocks` : 'stocks';
    
    try {
      const { data, error } = await supabase
        .from(tableName as any)
        .select('*')
        .order('market_cap', { ascending: false });
      
      if (!error && data) {
        // Normalize the data structure
        const normalizedData = data.map((item: any) => ({
          ...item,
          country: config.country,
          change_percentage: item.change_percentage || item.change_percent || item.change_percentage || 0
        }));
        return normalizedData as GlobalStock[];
      }
    } catch (err) {
      console.warn(`Error fetching ${tableName}:`, err);
    }
    return [];
  };

  const fetchCountryBonds = async (countryCode: string) => {
    const config = getTableConfig(countryCode);
    const tableName = config.prefix ? `${config.prefix}bonds` : 'bonds';
    
    try {
      const { data, error } = await supabase
        .from(tableName as any)
        .select('*')
        .order('yield_rate', { ascending: false });
      
      if (!error && data) {
        const normalizedData = data.map((item: any) => ({
          ...item,
          bond_name: item.bond_name || item.name,
          country: config.country,
          yield_rate: item.yield_rate || item.yield_to_maturity
        }));
        return normalizedData as GlobalBond[];
      }
    } catch (err) {
      console.warn(`Error fetching ${tableName}:`, err);
    }
    return [];
  };

  const fetchCountryETFs = async (countryCode: string) => {
    const config = getTableConfig(countryCode);
    const tableName = config.prefix ? `${config.prefix}etfs` : 'etfs';
    
    try {
      const { data, error } = await supabase
        .from(tableName as any)
        .select('*')
        .order('nav', { ascending: false });
      
      if (!error && data) {
        const normalizedData = data.map((item: any) => ({
          ...item,
          country: config.country
        }));
        return normalizedData as GlobalETF[];
      }
    } catch (err) {
      console.warn(`Error fetching ${tableName}:`, err);
    }
    return [];
  };

  const fetchCountryRealEstate = async (countryCode: string) => {
    const config = getTableConfig(countryCode);
    const tableName = config.prefix ? `${config.prefix}real_estate` : 'real_estate_prices';
    
    try {
      const { data, error } = await supabase
        .from(tableName as any)
        .select('*')
        .order('price_per_sqm_local', { ascending: false });
      
      if (!error && data) {
        const normalizedData = data.map((item: any) => ({
          ...item,
          city: item.city || item.city_name,
          neighborhood: item.neighborhood || item.neighborhood_name,
          country: config.country
        }));
        return normalizedData as GlobalRealEstate[];
      }
    } catch (err) {
      console.warn(`Error fetching ${tableName}:`, err);
    }
    return [];
  };

  const fetchCountryBankProducts = async (countryCode: string) => {
    const config = getTableConfig(countryCode);
    const tableName = config.prefix ? `${config.prefix}bank_products` : 'bank_products';
    
    try {
      const { data, error } = await supabase
        .from(tableName as any)
        .select('*')
        .eq('is_active', true)
        .order('interest_rate', { ascending: false });
      
      if (!error && data) {
        const normalizedData = data.map((item: any) => ({
          ...item,
          country: config.country
        }));
        return normalizedData as GlobalBankProduct[];
      }
    } catch (err) {
      console.warn(`Error fetching ${tableName}:`, err);
    }
    return [];
  };

  const fetchAllCountriesData = async () => {
    setLoading(true);
    try {
      const allCountryCodes = Object.keys(countryTableMapping);
      
      const [stocksData, bondsData, etfsData, realEstateData, bankProductsData] = await Promise.all([
        Promise.all(allCountryCodes.map(code => fetchCountryStocks(code))),
        Promise.all(allCountryCodes.map(code => fetchCountryBonds(code))),
        Promise.all(allCountryCodes.map(code => fetchCountryETFs(code))),
        Promise.all(allCountryCodes.map(code => fetchCountryRealEstate(code))),
        Promise.all(allCountryCodes.map(code => fetchCountryBankProducts(code))),
      ]);

      setStocks(stocksData.flat());
      setBonds(bondsData.flat());
      setETFs(etfsData.flat());
      setRealEstate(realEstateData.flat());
      setBankProducts(bankProductsData.flat());
    } catch (error) {
      console.error('Error fetching global market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCountryData = async (countryCode: string) => {
    setLoading(true);
    try {
      const [stocksData, bondsData, etfsData, realEstateData, bankProductsData] = await Promise.all([
        fetchCountryStocks(countryCode),
        fetchCountryBonds(countryCode),
        fetchCountryETFs(countryCode),
        fetchCountryRealEstate(countryCode),
        fetchCountryBankProducts(countryCode),
      ]);

      setStocks(stocksData);
      setBonds(bondsData);
      setETFs(etfsData);
      setRealEstate(realEstateData);
      setBankProducts(bankProductsData);
    } catch (error) {
      console.error('Error fetching user country market data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userCountry?.code) {
      fetchUserCountryData(userCountry.code);
    } else {
      // Default to Egypt data if no country is set
      fetchUserCountryData('EG');
    }
  }, [userCountry]);

  return {
    stocks,
    bonds,
    etfs,
    realEstate,
    bankProducts,
    loading,
    fetchAllCountriesData,
    fetchUserCountryData,
  };
};
