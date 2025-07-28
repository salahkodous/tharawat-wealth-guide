import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bot, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  DollarSign,
  Brain,
  Zap
} from 'lucide-react';

const AIInvestmentAssistant = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sampleQueries = [
    "Should I sell my Saudi Aramco stocks now?",
    "Is it a good time to invest in Dubai real estate?",
    "What percentage of my portfolio should be in crypto?",
    "Should I diversify more across different Arab markets?"
  ];

  const handleAnalyze = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setResponse('');
    
    try {
      toast({
        title: "AI Analysis Starting",
        description: "Analyzing your query with market data...",
      });

      const { data, error } = await supabase.functions.invoke('ai-investment-analysis', {
        body: {
          query: query,
          portfolioData: {
            // Mock portfolio data - in real implementation, fetch from database
            totalValue: 125450,
            allocation: { stocks: 70, realEstate: 25, cash: 5 },
            topHoldings: ['Saudi Aramco', 'Emirates NBD', 'Dubai Real Estate']
          },
          userProfile: {
            // Mock user profile - in real implementation, fetch from user profile
            riskTolerance: 'moderate',
            investmentGoals: ['wealth_building', 'retirement'],
            timeHorizon: 'long_term'
          }
        }
      });

      if (error) {
        throw error;
      }

      setResponse(data.analysis);
      
      toast({
        title: "Analysis Complete",
        description: "AI has generated your personalized investment insights.",
      });
      
    } catch (error) {
      console.error('AI Analysis Error:', error);
      setResponse(`Sorry, I encountered an error while analyzing your query. ${error.message || 'Please try again later.'}`);
      
      toast({
        title: "Analysis Failed",
        description: "Could not generate AI analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="flex items-center gap-2">
              AI Investment Assistant
              <Badge variant="secondary" className="text-xs">
                <Brain className="w-3 h-3 mr-1" />
                Smart Analysis
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Get AI-powered investment insights based on your portfolio and market data
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Alert className="border-amber-500/20 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            <strong>Important:</strong> Add your complete personal investing data (income, goals, risk tolerance) 
            in your profile to get the most accurate AI recommendations for buying, selling, or holding decisions.
          </AlertDescription>
        </Alert>

        <div>
          <label className="text-sm font-medium mb-2 block">Ask the AI Assistant</label>
          <Textarea
            placeholder="e.g., Should I sell my tech stocks now? Is real estate a good investment in Dubai?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {sampleQueries.map((sample, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => setQuery(sample)}
              className="text-left justify-start h-auto p-3 text-xs"
            >
              {sample}
            </Button>
          ))}
        </div>

        <Button 
          onClick={handleAnalyze}
          disabled={!query.trim() || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Zap className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 mr-2" />
              Get AI Analysis
            </>
          )}
        </Button>

        {response && (
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-3">
                <Bot className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">AI Analysis</span>
              </div>
              <div className="text-sm whitespace-pre-line text-muted-foreground">
                {response}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-4 border-t">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-green-500" />
            Market Data: Live
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-blue-500" />
            Portfolio: Synced
          </div>
          <div className="flex items-center gap-1">
            <Bot className="w-3 h-3 text-primary" />
            AI Model: GPT-4
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInvestmentAssistant;