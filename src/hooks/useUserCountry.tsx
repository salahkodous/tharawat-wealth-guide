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