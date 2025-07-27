import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Sparkles, 
  TrendingUp, 
  Newspaper, 
  Brain,
  BarChart3,
  LineChart,
  PieChart
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AIAssistantWithCharts = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    toast({
      title: "🤖 AI Processing",
      description: `Analyzing: "${query}"`,
    });

    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "💡 AI Analysis Complete",
        description: "Recommendations and charts updated based on your query.",
      });
    }, 2000);
  };

  const newsItems = [
    {
      title: "Saudi Aramco Reports Strong Q4 Earnings",
      source: "Reuters",
      time: "2 hours ago",
      impact: "positive"
    },
    {
      title: "UAE Central Bank Maintains Interest Rates",
      source: "Bloomberg",
      time: "4 hours ago",
      impact: "neutral"
    },
    {
      title: "Egyptian Pound Strengthens Against Dollar",
      source: "Al Ahram",
      time: "6 hours ago",
      impact: "positive"
    },
    {
      title: "Kuwait Oil Production Increases 5%",
      source: "KUNA",
      time: "8 hours ago",
      impact: "positive"
    }
  ];

  const chartData = [
    { name: 'Stocks', value: 45, color: '#3B82F6' },
    { name: 'Real Estate', value: 30, color: '#10B981' },
    { name: 'Crypto', value: 15, color: '#F59E0B' },
    { name: 'Bonds', value: 10, color: '#8B5CF6' }
  ];

  const recommendations = [
    {
      type: "Buy",
      asset: "Saudi Basic Industries (SABIC)",
      confidence: 85,
      reason: "Strong earnings growth and favorable market conditions"
    },
    {
      type: "Hold",
      asset: "Emirates NBD Bank",
      confidence: 75,
      reason: "Stable performance with moderate growth potential"
    },
    {
      type: "Watch",
      asset: "Orascom Construction",
      confidence: 65,
      reason: "Potential breakout if construction sector improves"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Search Interface */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            AI Investment Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about market trends, specific stocks, or investment strategies..."
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button 
              onClick={handleSearch}
              disabled={!query.trim() || isLoading}
              className="gradient-electric"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="charts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="charts" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Charts
          </TabsTrigger>
          <TabsTrigger value="news" className="flex items-center gap-2">
            <Newspaper className="w-4 h-4" />
            News
          </TabsTrigger>
          <TabsTrigger value="decisions" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI Decisions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Portfolio Allocation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {chartData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <span className="text-lg font-bold">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5" />
                  Performance Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 mx-auto mb-2 text-primary" />
                    <p>Interactive chart will appear here</p>
                    <p className="text-sm">Based on your AI query</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="news" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Market News & Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {newsItems.map((news, index) => (
                  <div key={index} className="flex items-start justify-between p-4 bg-secondary/30 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{news.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{news.source}</span>
                        <span>•</span>
                        <span>{news.time}</span>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      news.impact === 'positive' ? 'bg-green-500/20 text-green-500' :
                      news.impact === 'negative' ? 'bg-red-500/20 text-red-500' :
                      'bg-gray-500/20 text-gray-500'
                    }`}>
                      {news.impact}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="decisions" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>AI Investment Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className="p-4 bg-secondary/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          rec.type === 'Buy' ? 'bg-green-500/20 text-green-500' :
                          rec.type === 'Sell' ? 'bg-red-500/20 text-red-500' :
                          'bg-yellow-500/20 text-yellow-500'
                        }`}>
                          {rec.type}
                        </div>
                        <span className="font-medium">{rec.asset}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Confidence: {rec.confidence}%
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{rec.reason}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIAssistantWithCharts;