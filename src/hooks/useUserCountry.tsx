import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useMarketData } from './useMarketData';
import { useSettings } from './useSettings';

interface CountryInfo {
  code: string;
  name: string;
  currency: string;
  flag: string;
}

const countryData: CountryInfo[] = [
  { code: 'EG', name: 'Egypt', currency: 'EGP', flag: '🇪🇬' },
  { code: 'SA', name: 'Saudi Arabia', currency: 'SAR', flag: '🇸🇦' },
  { code: 'AE', name: 'United Arab Emirates', currency: 'AED', flag: '🇦🇪' },
];

export const useUserCountry = () => {
  const { user } = useAuth();
  const { updateSettings } = useSettings();
  const [userCountry, setUserCountry] = useState<CountryInfo | null>(null);
  const { stocks, bonds, etfs, realEstate } = useMarketData(userCountry?.code);

  const setUserCountryWithSettings = (country: CountryInfo | null) => {
    console.log('🏳️ Country changed to:', country?.code, country?.name, 'Currency:', country?.currency);
    setUserCountry(country);
    // Update user settings to reflect the currency of the selected country
    if (country?.currency) {
      updateSettings({ currency: country.currency });
    }
  };

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
    setUserCountry: setUserCountryWithSettings,
    getLocalAssets,
    getInternationalAssets,
    getCountryInfo,
    getAllCountries,
    countryData,
  };
};