import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  TrendingUp, 
  Calculator, 
  FileText, 
  Bell, 
  Settings,
  Download,
  Target
} from 'lucide-react';

const QuickActions = () => {
  const actions = [
    { 
      icon: Plus, 
      label: 'Add Investment', 
      description: 'Add new stocks, crypto, or real estate',
      variant: 'default' as const
    },
    { 
      icon: TrendingUp, 
      label: 'Market Analysis', 
      description: 'Get AI-powered market insights',
      variant: 'outline' as const
    },
    { 
      icon: Calculator, 
      label: 'Calculate Returns', 
      description: 'ROI and risk assessment tools',
      variant: 'outline' as const
    },
    { 
      icon: Target, 
      label: 'Set Goal', 
      description: 'Create new financial goals',
      variant: 'outline' as const
    },
    { 
      icon: FileText, 
      label: 'Generate Report', 
      description: 'Portfolio performance report',
      variant: 'outline' as const
    },
    { 
      icon: Download, 
      label: 'Export Data', 
      description: 'Download portfolio data',
      variant: 'outline' as const
    },
    { 
      icon: Bell, 
      label: 'Alerts', 
      description: 'Manage price alerts',
      variant: 'outline' as const
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      description: 'Account and preferences',
      variant: 'outline' as const
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Quick Actions</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Card key={index} className="glass-card hover:scale-105 transition-all duration-300 cursor-pointer">
              <CardContent className="p-4 text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-sm">{action.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{action.description}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;