import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Briefcase, 
  Calculator, 
  Bot,
  TrendingUp,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link, useLocation } from 'react-router-dom';
import TharawatLogo from '@/components/TharawatLogo';

const Navigation = () => {
  const { signOut } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/portfolio', icon: Briefcase, label: 'Portfolio' },
    { path: '/finances', icon: Calculator, label: 'Finances' },
    { path: '/assistant', icon: Bot, label: 'AI Assistant' },
    { path: '/analytics', icon: TrendingUp, label: 'Analytics' },
  ];

  return (
    <header className="border-b border-border/20 backdrop-blur-md bg-background/80 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <TharawatLogo size="lg" />
          
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

          <Button 
            variant="ghost" 
            className="hover:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navigation;