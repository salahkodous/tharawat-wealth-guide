import React from 'react';
import { AlertTriangle, TrendingUp, Target, Shield, Lightbulb, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AIRecommendations: React.FC = () => {
  const recommendations = [
    {
      id: 1,
      type: 'warning',
      priority: 'high',
      title: 'Portfolio Risk Alert',
      description: 'Your Saudi Aramco position (35% of portfolio) is overconcentrated. Consider diversifying.',
      action: 'Rebalance Portfolio',
      impact: 'Reduce Risk by 23%',
      category: 'Risk Management'
    },
    {
      id: 2,
      type: 'opportunity',
      priority: 'medium',
      title: 'Market Opportunity',
      description: 'UAE banking sector showing strong Q4 performance. ADCB and ENBD trending upward.',
      action: 'Research UAE Banks',
      impact: 'Potential 15% upside',
      category: 'Growth Opportunity'
    },
    {
      id: 3,
      type: 'insight',
      priority: 'medium',
      title: 'Currency Diversification',
      description: 'Your portfolio is 80% SAR exposure. Consider adding EGP or AED positions.',
      action: 'Add Multi-Currency Assets',
      impact: 'Reduce Currency Risk',
      category: 'Diversification'
    },
    {
      id: 4,
      type: 'savings',
      priority: 'low',
      title: 'Emergency Fund Status',
      description: 'Your emergency fund covers 4.2 months of expenses. Targeting 6 months.',
      action: 'Increase Monthly Savings',
      impact: 'Complete in 3 months',
      category: 'Financial Planning'
    }
  ];

  const marketInsights = [
    {
      market: 'Saudi Arabia (Tadawul)',
      status: 'bullish',
      change: '+2.3%',
      insight: 'Energy sector driving growth with oil price recovery'
    },
    {
      market: 'UAE (DFM/ADX)', 
      status: 'neutral',
      change: '+0.8%',
      insight: 'Banking and real estate showing steady performance'
    },
    {
      market: 'Egypt (EGX)',
      status: 'bearish',
      change: '-1.2%',
      insight: 'Currency volatility affecting foreign investment'
    },
    {
      market: 'Kuwait (Boursa)',
      status: 'bullish',
      change: '+1.7%',
      insight: 'Banking sector benefiting from rising interest rates'
    }
  ];

  const getIconForType = (type: string) => {
    switch (type) {
      case 'warning': return AlertTriangle;
      case 'opportunity': return TrendingUp;
      case 'insight': return Lightbulb;
      case 'savings': return Target;
      default: return Shield;
    }
  };

  const getColorForType = (type: string) => {
    switch (type) {
      case 'warning': return 'text-warning border-warning/20 bg-warning/5';
      case 'opportunity': return 'text-success border-success/20 bg-success/5';
      case 'insight': return 'text-primary border-primary/20 bg-primary/5';
      case 'savings': return 'text-muted-foreground border-muted/20 bg-muted/5';
      default: return 'text-foreground border-border bg-card';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-warning text-warning-foreground';
      case 'medium': return 'bg-primary text-primary-foreground';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getMarketStatusColor = (status: string) => {
    switch (status) {
      case 'bullish': return 'text-success';
      case 'bearish': return 'text-warning';
      case 'neutral': return 'text-muted-foreground';
      default: return 'text-foreground';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gradient-electric">AI Investment Recommendations</h2>
        <p className="text-muted-foreground">
          Personalized insights powered by market analysis and your portfolio data
        </p>
      </div>

      {/* Market Overview */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Arab Markets Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {marketInsights.map((market, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-sm">{market.market}</h4>
                  <span className={`font-semibold ${getMarketStatusColor(market.status)}`}>
                    {market.change}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {market.insight}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {recommendations.map((rec) => {
          const Icon = getIconForType(rec.type);
          return (
            <Card key={rec.id} className={`glass-card ${getColorForType(rec.type)}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <div>
                      <CardTitle className="text-lg">{rec.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className={getPriorityColor(rec.priority)}>
                          {rec.priority.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {rec.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed">{rec.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Expected Impact</p>
                    <p className="font-semibold text-sm">{rec.impact}</p>
                  </div>
                  
                  <Button size="sm" variant="outline" className="flex items-center gap-2">
                    {rec.action}
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="gradient-electric text-primary-foreground h-auto p-4">
              <div className="text-center space-y-1">
                <Shield className="w-6 h-6 mx-auto" />
                <div className="font-semibold">Portfolio Analysis</div>
                <div className="text-xs opacity-90">Deep dive into your holdings</div>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4">
              <div className="text-center space-y-1">
                <Target className="w-6 h-6 mx-auto" />
                <div className="font-semibold">Set Investment Goals</div>
                <div className="text-xs text-muted-foreground">Plan your financial future</div>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4">
              <div className="text-center space-y-1">
                <TrendingUp className="w-6 h-6 mx-auto" />
                <div className="font-semibold">Market Research</div>
                <div className="text-xs text-muted-foreground">Explore new opportunities</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Disclaimer */}
      <Alert className="glass-card border-primary/20">
        <Lightbulb className="h-4 w-4" />
        <AlertDescription>
          These recommendations are generated by AI analysis and should not be considered as financial advice. 
          Always consult with qualified financial advisors before making investment decisions.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default AIRecommendations;