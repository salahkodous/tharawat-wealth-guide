import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
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
  const [userCountry, setUserCountry] = useState<CountryInfo | null>(countryData[0]); // Default to first country (Egypt)
  
  console.log('🏛️ useUserCountry hook initialized with default:', countryData[0]);
  console.log('🏛️ useUserCountry current state:', userCountry?.code, userCountry?.name);

  const setUserCountryWithSettings = (country: CountryInfo | null) => {
    console.log('🏳️ useUserCountry: Setting country to:', country?.code, country?.name, 'Currency:', country?.currency);
    console.log('🏳️ useUserCountry: Previous userCountry was:', userCountry?.code, userCountry?.name);
    setUserCountry(country);
    console.log('🏳️ useUserCountry: State updated, new userCountry should be:', country?.code);
    // Update user settings to reflect the currency of the selected country
    if (country?.currency) {
      updateSettings({ currency: country.currency });
      console.log('🏳️ useUserCountry: Currency updated to:', country.currency);
    }
  };

  useEffect(() => {
    if (user?.user_metadata?.country) {
      const country = countryData.find(c => c.code === user.user_metadata.country);
      setUserCountry(country || null);
    } else {
      // Set default country to Egypt if no user metadata
      const defaultCountry = countryData.find(c => c.code === 'EG');
      setUserCountry(defaultCountry || null);
    }
  }, [user]);


  const getCountryInfo = (countryCode: string): CountryInfo | null => {
    return countryData.find(c => c.code === countryCode) || null;
  };

  const getAllCountries = (): CountryInfo[] => {
    return countryData;
  };

  return {
    userCountry,
    setUserCountry: setUserCountryWithSettings,
    getCountryInfo,
    getAllCountries,
    countryData,
  };
};