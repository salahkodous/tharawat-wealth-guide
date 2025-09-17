import React from 'react';
import AnimatedBackground from '@/components/AnimatedBackground';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock, ExternalLink, Star, Globe } from 'lucide-react';

const Analytics = () => {
  // Mock news data with user interests
  const mockNews = [
    {
      id: 1,
      title: "Saudi Arabia's PIF Announces $50B Investment in Green Energy",
      summary: "The Public Investment Fund continues its commitment to Vision 2030 with massive renewable energy initiatives.",
      source: "Al Arabiya Business",
      time: "2 hours ago",
      category: "Investment",
      interest: "Saudi Markets",
      trending: true,
      url: "#"
    },
    {
      id: 2,
      title: "UAE Central Bank Raises Interest Rates Following Fed Decision",
      summary: "The CBUAE adjusts monetary policy in line with global economic conditions affecting regional markets.",
      source: "Gulf News",
      time: "4 hours ago",
      category: "Monetary Policy",
      interest: "UAE Banking",
      trending: false,
      url: "#"
    },
    {
      id: 3,
      title: "Egyptian Stock Exchange Hits New Highs Amid Economic Reforms",
      summary: "EGX30 index reaches record levels as investor confidence grows in government economic policies.",
      source: "Reuters",
      time: "6 hours ago",
      category: "Markets",
      interest: "Egyptian Stocks",
      trending: true,
      url: "#"
    },
    {
      id: 4,
      title: "Qatar's LNG Exports Surge 15% in Q3 2024",
      summary: "Strong global demand for liquefied natural gas boosts Qatar's energy sector revenues significantly.",
      source: "Bloomberg",
      time: "8 hours ago",
      category: "Energy",
      interest: "Qatar Energy",
      trending: false,
      url: "#"
    },
    {
      id: 5,
      title: "Bahrain Fintech Sector Attracts $200M in New Investments",
      summary: "The kingdom's regulatory sandbox continues to attract international fintech companies and investors.",
      source: "Trade Arabia",
      time: "10 hours ago",
      category: "Fintech",
      interest: "GCC Fintech",
      trending: false,
      url: "#"
    },
    {
      id: 6,
      title: "Aramco Announces Partnership with Global Tech Giants",
      summary: "Strategic alliances aimed at digital transformation and AI integration across operations.",
      source: "Arab News",
      time: "12 hours ago",
      category: "Technology",
      interest: "Saudi Tech",
      trending: true,
      url: "#"
    },
    {
      id: 7,
      title: "Morocco's Economic Growth Exceeds Expectations",
      summary: "GDP growth reaches 3.2% driven by agricultural recovery and increased tourism revenues.",
      source: "Morocco World News",
      time: "14 hours ago",
      category: "Economy",
      interest: "North Africa",
      trending: false,
      url: "#"
    },
    {
      id: 8,
      title: "Jordan's Banking Sector Shows Resilience Amid Regional Challenges",
      summary: "Local banks report strong performance despite regional economic headwinds.",
      source: "Jordan Times",
      time: "16 hours ago",
      category: "Banking",
      interest: "Jordan Finance",
      trending: false,
      url: "#"
    },
    {
      id: 9,
      title: "Kuwait Investment Authority Diversifies Into European Markets",
      summary: "The sovereign wealth fund expands portfolio with significant European real estate acquisitions.",
      source: "KUNA",
      time: "18 hours ago",
      category: "Investment",
      interest: "Kuwait SWF",
      trending: false,
      url: "#"
    },
    {
      id: 10,
      title: "Oman's Tourism Sector Recovery Accelerates",
      summary: "Visitor arrivals increase 25% year-over-year as the sultanate promotes sustainable tourism.",
      source: "Times of Oman",
      time: "20 hours ago",
      category: "Tourism",
      interest: "Oman Economy",
      trending: false,
      url: "#"
    }
  ];

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Investment': 'bg-blue-100 text-blue-800',
      'Monetary Policy': 'bg-purple-100 text-purple-800',
      'Markets': 'bg-green-100 text-green-800',
      'Energy': 'bg-orange-100 text-orange-800',
      'Fintech': 'bg-cyan-100 text-cyan-800',
      'Technology': 'bg-indigo-100 text-indigo-800',
      'Economy': 'bg-yellow-100 text-yellow-800',
      'Banking': 'bg-red-100 text-red-800',
      'Tourism': 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10">
        <Navigation />
        
        <section className="py-8">
          <div className="container mx-auto px-4 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  <Globe className="h-8 w-8 text-primary" />
                  Personalized News
                </h1>
                <p className="text-muted-foreground">Top 10 news tailored to your interests</p>
              </div>
              <Badge variant="secondary" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Based on your interests
              </Badge>
            </div>
            
            <div className="grid gap-4">
              {mockNews.map((news, index) => (
                <Card key={news.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg font-semibold text-muted-foreground">#{index + 1}</span>
                          {news.trending && (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              Trending
                            </Badge>
                          )}
                          <Badge className={getCategoryColor(news.category)}>
                            {news.category}
                          </Badge>
                          <Badge variant="outline">
                            {news.interest}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl leading-tight hover:text-primary cursor-pointer">
                          {news.title}
                        </CardTitle>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground mt-1 cursor-pointer hover:text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {news.summary}
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="font-medium">{news.source}</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {news.time}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Analytics;