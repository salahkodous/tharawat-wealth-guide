import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCurrency } from '@/hooks/useCurrency';
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
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { toast } = useToast();
  const { currency } = useCurrency();

  const handleMarketAnalysis = async () => {
    setIsLoading('market');
    
    try {
      toast({
        title: "Market Analysis Starting",
        description: "Generating AI-powered market insights...",
      });

      const { data, error } = await supabase.functions.invoke('market-analysis', {
        body: {
          region: 'MENA',
          assetType: 'general',
          currency: currency
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Market Analysis Complete",
        description: "Check the AI Assistant page for detailed insights.",
      });
      
    } catch (error) {
      console.error('Market Analysis Error:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not generate market analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleQuickAction = async (actionType: string) => {
    setIsLoading(actionType);
    
    // Simulate action processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Action Completed",
      description: `${actionType} action has been processed.`,
    });
    
    setIsLoading(null);
  };
  const actions = [
    { 
      icon: Plus, 
      label: 'Add Investment', 
      description: 'Add new stocks, crypto, or real estate',
      variant: 'default' as const,
      action: () => handleQuickAction('Add Investment')
    },
    { 
      icon: TrendingUp, 
      label: 'Market Analysis', 
      description: 'Get AI-powered market insights',
      variant: 'outline' as const,
      action: handleMarketAnalysis
    },
    { 
      icon: Calculator, 
      label: 'Calculate Returns', 
      description: 'ROI and risk assessment tools',
      variant: 'outline' as const,
      action: () => handleQuickAction('Calculate Returns')
    },
    { 
      icon: Target, 
      label: 'Set Goal', 
      description: 'Create new financial goals',
      variant: 'outline' as const,
      action: () => handleQuickAction('Set Goal')
    },
    { 
      icon: FileText, 
      label: 'Generate Report', 
      description: 'Portfolio performance report',
      variant: 'outline' as const,
      action: () => handleQuickAction('Generate Report')
    },
    { 
      icon: Download, 
      label: 'Export Data', 
      description: 'Download portfolio data',
      variant: 'outline' as const,
      action: () => handleQuickAction('Export Data')
    },
    { 
      icon: Bell, 
      label: 'Alerts', 
      description: 'Manage price alerts',
      variant: 'outline' as const,
      action: () => handleQuickAction('Alerts')
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      description: 'Account and preferences',
      variant: 'outline' as const,
      action: () => handleQuickAction('Settings')
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Quick Actions</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          const loading = isLoading === action.label;
          return (
            <Card 
              key={index} 
              className="glass-card hover:scale-105 transition-all duration-300 cursor-pointer"
              onClick={action.action}
            >
              <CardContent className="p-4 text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  {loading ? (
                    <div className="w-6 h-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  ) : (
                    <Icon className="w-6 h-6 text-primary" />
                  )}
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