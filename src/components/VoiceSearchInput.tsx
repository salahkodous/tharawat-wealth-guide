import React, { useState } from 'react';
import { Mic, MicOff, Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const VoiceSearchInput: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleVoiceToggle = () => {
    setIsListening(!isListening);
    
    if (!isListening) {
      toast({
        title: "🎤 Voice Assistant Ready",
        description: "Ask me anything about investments in Arabic or English",
      });
    } else {
      toast({
        title: "Voice Assistant Stopped",
        description: "Click the microphone to start listening again",
      });
    }
  };

  const handleSearch = () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    toast({
      title: "🤖 AI Processing",
      description: `Analyzing: "${query}"`,
    });

    // Simulate AI processing
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "💡 AI Recommendation Ready",
        description: "Based on current market conditions, I found several insights for you.",
      });
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const exampleQueries = [
    "ما هي أفضل الأسهم في السعودية اليوم؟",
    "How should I diversify my portfolio in UAE?",
    "أريد الاستثمار في العقارات في مصر",
    "Show me cryptocurrency opportunities in Kuwait"
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Main Search Interface */}
      <Card className="glass-card p-6 electric-glow">
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-gradient-electric">
              <Sparkles className="w-6 h-6" />
              <h2 className="text-2xl font-bold">AI Investment Assistant</h2>
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="text-muted-foreground">
              Ask me anything about investing in Arab markets • اسألني عن الاستثمار في الأسواق العربية
            </p>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about stocks, crypto, real estate... اسأل عن الأسهم، العملات الرقمية، العقارات..."
              className="pl-12 pr-24 h-14 text-lg bg-secondary/50 border-primary/20 focus:border-primary"
              dir="auto"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
              <Button
                onClick={handleVoiceToggle}
                variant={isListening ? "default" : "outline"}
                size="sm"
                className={`${isListening ? 'gradient-electric text-primary-foreground electric-pulse' : ''}`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              
              <Button
                onClick={handleSearch}
                disabled={!query.trim() || isLoading}
                className="gradient-electric text-primary-foreground"
                size="sm"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Ask AI"
                )}
              </Button>
            </div>
          </div>

          {/* Voice Status */}
          {isListening && (
            <div className="flex items-center justify-center gap-2 text-primary animate-pulse">
              <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
              <span className="text-sm font-medium">Listening... تستمع</span>
              <div className="w-2 h-2 bg-primary rounded-full animate-ping animation-delay-100"></div>
            </div>
          )}
        </div>
      </Card>

      {/* Example Queries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exampleQueries.map((example, index) => (
          <Card
            key={index}
            className="glass-card p-4 cursor-pointer hover:border-primary/40 transition-all hover:electric-glow"
            onClick={() => setQuery(example)}
          >
            <p className="text-sm text-muted-foreground hover:text-foreground transition-colors" dir="auto">
              "{example}"
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VoiceSearchInput;