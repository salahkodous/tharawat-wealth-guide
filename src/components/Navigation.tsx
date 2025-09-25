import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Home, 
  Briefcase, 
  Calculator, 
  Bot,
  TrendingUp,
  LogOut,
  Settings,
  Menu,
  X,
  Globe,
  ChevronDown,
  Mountain,
  Building2,
  Palmtree
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { useUserCountry } from '@/hooks/useUserCountry';
import { Link, useLocation } from 'react-router-dom';
import AnakinLogo from '@/components/AnakinLogo';
import { useState } from 'react';

const Navigation = () => {
  const { signOut } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, isRTL } = useTranslation();
  const { userCountry, setUserCountry, getAllCountries } = useUserCountry();
  
  const countries = getAllCountries();

  // Get country landmark icon
  const getCountryIcon = (countryCode?: string) => {
    switch (countryCode) {
      case 'EG':
        return Mountain; // Represents pyramids
      case 'SA':
        return Palmtree; // Represents Arabian heritage
      case 'AE':
        return Building2; // Represents modern architecture like Burj Khalifa
      default:
        return Mountain; // Default to Egypt's pyramid
    }
  };

  const CountryIcon = getCountryIcon(userCountry?.code);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleCountryChange = (countryCode: string) => {
    console.log('🌍 Navigation: Changing country to:', countryCode);
    const selectedCountry = countries.find(c => c.code === countryCode);
    console.log('🌍 Navigation: Found country:', selectedCountry);
    if (selectedCountry) {
      setUserCountry(selectedCountry);
      console.log('🌍 Navigation: Country changed successfully to:', selectedCountry.name);
    }
  };

  const navItems = [
    { path: '/dashboard', icon: Home, label: t('dashboard') },
    { path: '/portfolio', icon: Briefcase, label: t('portfolio') },
    { path: '/finances', icon: Calculator, label: t('finances') },
    { path: '/analytics', icon: Globe, label: 'News' },
  ];

  return (
    <header className={`border-b border-border/20 backdrop-blur-md bg-background/80 sticky top-0 z-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <AnakinLogo size="lg" />
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button 
                  variant={location.pathname === item.path ? "default" : "ghost"}
                  className="flex items-center gap-2"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* Country Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 bg-background/80 backdrop-blur-sm">
                  <CountryIcon className="w-4 h-4" />
                  <span>{userCountry?.flag} {userCountry?.code || 'EG'}</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background/95 backdrop-blur-md border border-border/20 z-50" align="end">
                {countries.map((country) => (
                  <DropdownMenuItem
                    key={country.code}
                    onClick={() => handleCountryChange(country.code)}
                    className="flex items-center gap-2 cursor-pointer hover:bg-accent/50"
                  >
                    <span>{country.flag}</span>
                    <span>{country.name}</span>
                    <span className="text-xs text-muted-foreground">({country.currency})</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Link to="/settings">
              <Button variant="ghost" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                {t('settings')}
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              className="hover:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t('signOut')}
            </Button>
          </div>

          {/* Mobile Country Selector - Always visible */}
          <div className="md:hidden flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1">
                  <CountryIcon className="w-3 h-3" />
                  <span className="text-xs">{userCountry?.flag || '🇪🇬'}</span>
                  <ChevronDown className="w-2 h-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background/95 backdrop-blur-md border border-border/20 z-50 w-48" align="end">
                {countries.map((country) => (
                  <DropdownMenuItem
                    key={country.code}
                    onClick={() => handleCountryChange(country.code)}
                    className="flex items-center gap-2 cursor-pointer hover:bg-accent/50"
                  >
                    <span>{country.flag}</span>
                    <span className="text-sm">{country.name}</span>
                    <span className="text-xs text-muted-foreground">({country.currency})</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              className="p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border/20">
            <nav className="flex flex-col gap-2 mt-4">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)}>
                  <Button 
                    variant={location.pathname === item.path ? "default" : "ghost"}
                    className="w-full justify-start gap-2"
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
              
              <Link to="/settings" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Settings className="w-4 h-4" />
                  {t('settings')}
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2 hover:text-destructive"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4" />
                {t('signOut')}
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navigation;