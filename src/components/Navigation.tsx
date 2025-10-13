import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Home, 
  Briefcase, 
  Calculator, 
  TrendingUp,
  LogOut,
  Settings,
  Menu,
  X,
  Globe,
  ChevronDown,
  User
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useTranslation } from '@/hooks/useTranslation';
import { useUserCountry } from '@/hooks/useUserCountry';
import { Link, useLocation, useParams } from 'react-router-dom';
import AnakinLogo from '@/components/AnakinLogo';
import CurrencySymbol from '@/components/CurrencySymbol';
import { useState } from 'react';

const Navigation = () => {
  const { signOut } = useAuth();
  const { profile } = useProfile();
  const location = useLocation();
  const { lang } = useParams<{ lang: string }>();
  const currentLang = lang || 'en';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, isRTL } = useTranslation();
  const { userCountry, setUserCountry, getAllCountries } = useUserCountry();
  
  const countries = getAllCountries();
  
  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleCountryChange = (countryCode: string) => {
    const selectedCountry = countries.find(c => c.code === countryCode);
    if (selectedCountry) {
      setUserCountry(selectedCountry);
    }
  };

  // Language-aware navigation items
  const navItems = [
    { path: `/${currentLang}/dashboard`, icon: Home, label: t('dashboard') },
    { path: `/${currentLang}/portfolio`, icon: Briefcase, label: t('portfolio') },
    { path: `/${currentLang}/finances`, icon: Calculator, label: t('finances') },
    { path: `/${currentLang}/analytics`, icon: Globe, label: 'News' },
  ];

  return (
    <header className={`border-b border-border/20 backdrop-blur-md bg-background/80 sticky top-0 z-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Desktop Navigation - Left Side */}
          <nav className="hidden md:flex items-center gap-4 flex-1">
            {navItems.slice(0, 2).map((item) => (
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

          {/* Centered Logo */}
          <div className="flex-shrink-0">
            <AnakinLogo size="lg" />
          </div>

          {/* Desktop Navigation - Right Side */}
          <div className="hidden md:flex items-center gap-4 flex-1 justify-end">
            {navItems.slice(2).map((item) => (
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
            
            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback>
                      {getInitials(profile?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">
                      {profile?.full_name || 'User'}
                    </span>
                    {profile?.job && (
                      <span className="text-xs text-muted-foreground">
                        {profile.job}
                      </span>
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <Link to={`/${currentLang}/settings`}>
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    {t('settings')}
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('signOut')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
            {/* User Profile - Mobile */}
            <div className="flex items-center gap-3 p-4 border-b border-border/20">
              <Avatar className="w-10 h-10">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback>
                  {getInitials(profile?.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {profile?.full_name || 'User'}
                </span>
                {profile?.job && (
                  <span className="text-xs text-muted-foreground">
                    {profile.job}
                  </span>
                )}
              </div>
            </div>
            
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
              <Link to={`/${currentLang}/settings`} onClick={() => setIsMenuOpen(false)}>
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