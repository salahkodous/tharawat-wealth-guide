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
  ChevronDown
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { useUserCountry } from '@/hooks/useUserCountry';
import { Link, useLocation } from 'react-router-dom';
import AnakinLogo from '@/components/AnakinLogo';
import CurrencySymbol from '@/components/CurrencySymbol';
import { useState } from 'react';

const Navigation = () => {
  const { signOut } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, isRTL } = useTranslation();
  const { userCountry, setUserCountry, getAllCountries } = useUserCountry();
  
  const countries = getAllCountries();

  const handleSignOut = async () => {
    await signOut();
  };

  const handleCountryChange = (countryCode: string) => {
    const selectedCountry = countries.find(c => c.code === countryCode);
    if (selectedCountry) {
      setUserCountry(selectedCountry);
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
                  <Globe className="w-4 h-4" />
                  <span>{userCountry?.flag} {userCountry?.code || 'Select Country'}</span>
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
            
            <CurrencySymbol variant="ghost" />
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

          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
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
              {/* Mobile Country Selector */}
              <div className="px-3 py-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start gap-2 bg-background/80 backdrop-blur-sm">
                      <Globe className="w-4 h-4" />
                      <span>{userCountry?.flag} {userCountry?.name || 'Select Country'}</span>
                      <ChevronDown className="w-3 h-3 ml-auto" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-background/95 backdrop-blur-md border border-border/20 z-50 w-56">
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
              </div>
              
              <div className="px-3 py-2">
                <CurrencySymbol variant="ghost" className="w-full" />
              </div>
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