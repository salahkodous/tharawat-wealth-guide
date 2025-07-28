import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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

  const sampleQueries = [
    "Should I sell my Saudi Aramco stocks now?",
    "Is it a good time to invest in Dubai real estate?",
    "What percentage of my portfolio should be in crypto?",
    "Should I diversify more across different Arab markets?"
  ];

  const handleAnalyze = async () => {
    setIsLoading(true);
    // Simulate AI analysis
    setTimeout(() => {
      setResponse(`Based on your current portfolio and market conditions:

📊 **Analysis**: Your query about "${query}" has been analyzed considering:
- Your current asset allocation (70% stocks, 25% real estate, 5% cash)
- Market volatility in MENA region (+2.3% this week)
- Your risk tolerance and investment goals

💡 **Recommendation**: 
- **Moderate Risk**: Consider gradual position adjustment
- **Timeline**: 3-6 months for optimal execution
- **Market Timing**: Current conditions show mixed signals

⚠️ **Important**: This analysis is based on general market data. For personalized advice, please ensure your complete financial profile is updated in the system.`);
      setIsLoading(false);
    }, 2000);
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