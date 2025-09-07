import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useMarketData } from './useMarketData';

interface CountryInfo {
  code: string;
  name: string;
  currency: string;
  flag: string;
}

const countryData: CountryInfo[] = [
  { code: 'EG', name: 'Egypt', currency: 'EGP', flag: '🇪🇬' },
  { code: 'US', name: 'United States', currency: 'USD', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', currency: 'EUR', flag: '🇩🇪' },
  { code: 'FR', name: 'France', currency: 'EUR', flag: '🇫🇷' },
  { code: 'SA', name: 'Saudi Arabia', currency: 'SAR', flag: '🇸🇦' },
  { code: 'AE', name: 'United Arab Emirates', currency: 'AED', flag: '🇦🇪' },
  { code: 'IN', name: 'India', currency: 'INR', flag: '🇮🇳' },
  { code: 'CN', name: 'China', currency: 'CNY', flag: '🇨🇳' },
  { code: 'QA', name: 'Qatar', currency: 'QAR', flag: '🇶🇦' },
  { code: 'KW', name: 'Kuwait', currency: 'KWD', flag: '🇰🇼' },
  { code: 'BH', name: 'Bahrain', currency: 'BHD', flag: '🇧🇭' },
  { code: 'OM', name: 'Oman', currency: 'OMR', flag: '🇴🇲' },
  { code: 'JO', name: 'Jordan', currency: 'JOD', flag: '🇯🇴' },
  { code: 'LB', name: 'Lebanon', currency: 'LBP', flag: '🇱🇧' },
  { code: 'MA', name: 'Morocco', currency: 'MAD', flag: '🇲🇦' },
  { code: 'TN', name: 'Tunisia', currency: 'TND', flag: '🇹🇳' },
  { code: 'DZ', name: 'Algeria', currency: 'DZD', flag: '🇩🇿' },
  { code: 'IQ', name: 'Iraq', currency: 'IQD', flag: '🇮🇶' },
];

export const useUserCountry = () => {
  const { user } = useAuth();
  const { stocks, bonds, etfs, realEstate } = useMarketData();
  const [userCountry, setUserCountry] = useState<CountryInfo | null>(null);

  useEffect(() => {
    if (user?.user_metadata?.country) {
      const country = countryData.find(c => c.code === user.user_metadata.country);
      setUserCountry(country || null);
    }
  }, [user]);

  const getLocalAssets = () => {
    if (!userCountry) return { stocks: [], bonds: [], etfs: [], realEstate: [] };

    const countryMapping: Record<string, string> = {
      'AE': 'UAE',
      'SA': 'Saudi Arabia',
      'EG': 'Egypt',
      'QA': 'Qatar',
      'KW': 'Kuwait',
      'BH': 'Bahrain',
      'OM': 'Oman',
      'JO': 'Jordan',
      'LB': 'Lebanon',
      'MA': 'Morocco',
      'TN': 'Tunisia',
      'DZ': 'Algeria',
      'IQ': 'Iraq'
    };

    const countryName = countryMapping[userCountry.code];

    return {
      stocks: stocks.filter(s => s.country === countryName),
      bonds: bonds.filter(b => b.country === countryName),
      etfs: etfs.filter(e => e.country === countryName),
      realEstate: realEstate.filter(r => r.city_name && countryName === 'Egypt' || 
                                    r.city_name && countryName === 'UAE')
    };
  };

  const getInternationalAssets = () => {
    if (!userCountry) return { stocks: [], bonds: [], etfs: [], realEstate: [] };

    const countryMapping: Record<string, string> = {
      'AE': 'UAE',
      'SA': 'Saudi Arabia',
      'EG': 'Egypt',
      'QA': 'Qatar',
      'KW': 'Kuwait',
      'BH': 'Bahrain',
      'OM': 'Oman',
      'JO': 'Jordan',
      'LB': 'Lebanon',
      'MA': 'Morocco',
      'TN': 'Tunisia',
      'DZ': 'Algeria',
      'IQ': 'Iraq'
    };

    const countryName = countryMapping[userCountry.code];

    return {
      stocks: stocks.filter(s => s.country !== countryName),
      bonds: bonds.filter(b => b.country !== countryName),
      etfs: etfs.filter(e => e.country !== countryName),
      realEstate: realEstate.filter(r => !(r.city_name && countryName === 'Egypt') && 
                                    !(r.city_name && countryName === 'UAE'))
    };
  };

  const getCountryInfo = (countryCode: string): CountryInfo | null => {
    return countryData.find(c => c.code === countryCode) || null;
  };

  const getAllCountries = (): CountryInfo[] => {
    return countryData;
  };

  return {
    userCountry,
    setUserCountry,
    getLocalAssets,
    getInternationalAssets,
    getCountryInfo,
    getAllCountries,
    countryData,
  };
};