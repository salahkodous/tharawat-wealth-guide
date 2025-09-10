import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bot, 
  Send,
  User,
  Brain,
  MessageSquare
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'agent' | 'error';
  content: string;
  timestamp: Date;
  errorDetails?: {
    name?: string;
    message?: string;
    stack?: string;
    statusCode?: number;
  };
}

const AIFinancialAgent = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'agent',
      content: '🤖 **Welcome to your AI Financial Advisor!** I have complete access to your financial data and live market intelligence. Here\'s what I can do:\n\n💼 **Portfolio Management**\n• Analyze your investment performance and allocations\n• Add/update assets across stocks, crypto, bonds, ETFs, real estate\n• Provide personalized investment recommendations\n• Track portfolio returns and rebalancing needs\n\n💰 **Financial Management**\n• Update income, expenses, savings & investing amounts\n• Manage income & expense streams\n• Handle debt tracking and payment strategies\n• Create and monitor financial goals with progress tracking\n• Manage savings accounts and deposit products\n\n📊 **Market Intelligence**\n• Real-time analysis of stocks, crypto, bonds, ETFs\n• Gold prices and currency exchange rates\n• Real estate market trends and hottest areas\n• Bank product comparisons and recommendations\n\n🧠 **Advanced Analytics**\n• Calculate debt-to-income ratios and savings rates\n• Net worth tracking and financial health metrics\n• Investment return analysis and projections\n• Risk assessment and portfolio optimization\n\n💬 **Try asking me:**\n• "Analyze my complete financial situation"\n• "My salary increased to $8000, update my income"\n• "Add Apple stock to my portfolio, 10 shares at $150"\n• "What are the best performing stocks today?"\n• "Should I invest in crypto or bonds right now?"\n• "Help me create a goal to save $50,000 for a house"',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !user) {
      console.log('Send message blocked:', { input: input.trim(), isLoading, user: !!user });
      return;
    }

    console.log('Sending message:', input);
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = input;
    // Clear input only after successfully adding to messages
    setInput('');
    setIsLoading(true);

    try {
      console.log('Sending message to AI agent:', messageToSend);
      
      const { data, error } = await supabase.functions.invoke('ai-financial-agent', {
        body: {
          message: messageToSend,
          userId: user.id,
          messages: messages.map(m => ({ 
            role: m.type === 'user' ? 'user' : 'assistant', 
            content: m.content 
          }))
        }
      });

      console.log('AI agent response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`API Error: ${error.message || 'Unknown error'}`);
      }

      // Handle both success and error responses from the function
      if (data?.error) {
        console.error('Function returned error:', data);
        throw new Error(data.error);
      }

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: data?.response || 'No response received',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // Try to extract server-provided error details from Edge Function
      let serverBody: any = (error && typeof error === 'object' && 'context' in error) ? (error as any).context?.body : null;
      if (serverBody && typeof serverBody === 'string') {
        try { serverBody = JSON.parse(serverBody); } catch {}
      }

      const mergedDetails = {
        name: serverBody?.errorDetails?.name || error.name || 'Unknown Error',
        message: serverBody?.errorDetails?.message || serverBody?.error || error.message || 'No error message',
        stack: serverBody?.errorDetails?.stack || error.stack?.split('\n')[0] || 'No stack trace',
        statusCode: (error as any)?.status || (error as any)?.statusCode
      };

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'error',
        content: `I apologize, but I'm experiencing technical difficulties at the moment. Please try rephrasing your request or try again in a few moments. If the issue persists, our technical team has been notified.`,
        timestamp: new Date(),
        errorDetails: mergedDetails
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 h-[600px] flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="flex items-center gap-2">
              AI Financial Agent
              <Badge variant="secondary" className="text-xs">
                <Brain className="w-3 h-3 mr-1" />
                Agentic Chat
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Chat with your AI advisor to analyze and manage your finances
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : ''}`}>
              {(message.type === 'agent' || message.type === 'error') && (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'error' ? 'bg-red-100' : 'bg-primary/20'
                }`}>
                  <Bot className={`w-4 h-4 ${message.type === 'error' ? 'text-red-600' : 'text-primary'}`} />
                </div>
              )}
              
              <div className={`max-w-[80%] ${message.type === 'user' ? 'order-1' : ''}`}>
                <div className={`p-4 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-white text-black font-semibold border-2 border-primary/30 shadow-sm ml-auto' 
                    : message.type === 'error'
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-muted'
                }`}>
                  <div className={`leading-relaxed whitespace-pre-line ${
                    message.type === 'error' ? 'text-red-800' : ''
                  }`}>
                    {(() => {
                      const lines = message.content.split('\n');
                      const processedSections = new Set<string>();
                      const renderedElements = [];

                      lines.forEach((line, index) => {
                        // Skip all technical sections completely
                        if (line.includes('action:') || line.includes('Action:') || 
                            line.includes('analysis:') || line.includes('Analysis:') ||
                            line.includes('To proceed with this recommendation') ||
                            line.includes('I suggest the following action') ||
                            (line.includes('{') && (line.includes('type:') || line.includes('data:') || line.includes('description:'))) ||
                            line.match(/^\s*\{.*\}\s*$/) ||
                            line.includes('asset_type:') || line.includes('location:') || 
                            line.includes('investment_amount:') || line.includes('expected_return:')) {
                          return;
                        }

                        // Aggressive cleaning of all technical formatting
                        let cleanLine = line
                          .replace(/\*\*/g, '') // Remove all asterisks
                          .replace(/\[.*?\]/g, '') // Remove brackets
                          .replace(/"/g, '') // Remove quotes
                          .replace(/`/g, '') // Remove backticks
                          .replace(/\{[^}]*\}/g, '') // Remove curly braces and content
                          .replace(/analysis:\s*/gi, '') // Remove analysis prefix
                          .replace(/action:\s*/gi, '') // Remove action prefix
                          .replace(/data:\s*/gi, '') // Remove data prefix
                          .replace(/description:\s*/gi, '') // Remove description prefix
                          .replace(/type:\s*/gi, '') // Remove type prefix
                          .trim();

                        // Skip empty lines and technical remnants
                        if (!cleanLine || cleanLine.match(/^[{},\s]*$/)) {
                          return;
                        }

                        // Enhanced duplicate detection - check for similar content
                        const normalizedContent = cleanLine.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
                        const contentWords = normalizedContent.split(' ').filter(word => word.length > 3);
                        
                        // Check if this content is too similar to already processed content
                        let isDuplicate = false;
                        if (normalizedContent.length > 15) {
                          for (const existingContent of processedSections) {
                            const existingWords = existingContent.split(' ').filter(word => word.length > 3);
                            const commonWords = contentWords.filter(word => existingWords.includes(word));
                            const similarity = commonWords.length / Math.max(contentWords.length, existingWords.length);
                            
                            if (similarity > 0.7) { // 70% similarity threshold
                              isDuplicate = true;
                              break;
                            }
                          }
                          
                          if (!isDuplicate) {
                            processedSections.add(normalizedContent);
                          }
                        }
                        
                        if (isDuplicate) {
                          return; // Skip duplicate content
                        }

                        // Detect and style main section headers (originally with **)
                        if (line.includes('**') && !line.startsWith('•') && !line.startsWith('*')) {
                          renderedElements.push(
                            <h2 key={index} className="text-2xl font-bold mb-4 mt-6 first:mt-0 text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                              {cleanLine}
                            </h2>
                          );
                          return;
                        }
                        
                        // Handle category headers (lines that end with :)
                        if (cleanLine.endsWith(':') && !line.startsWith('•') && cleanLine.length < 50) {
                          renderedElements.push(
                            <h3 key={index} className="text-lg font-semibold mb-3 mt-4 text-foreground border-l-4 border-primary pl-3">
                              {cleanLine.replace(':', '')}
                            </h3>
                          );
                          return;
                        }
                        
                        // Handle bullet points with enhanced styling
                        if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* ')) {
                          const bulletText = cleanLine.replace(/^[•\-*]\s*/, '');
                          renderedElements.push(
                            <div key={index} className="flex items-start gap-3 mb-3 ml-4 p-2 rounded-lg bg-muted/30">
                              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                              <p className="text-sm text-muted-foreground leading-relaxed">{bulletText}</p>
                            </div>
                          );
                          return;
                        }
                        
                        // Handle numbered lists with better styling
                        if (line.match(/^\d+\.\s/)) {
                          renderedElements.push(
                            <div key={index} className="flex items-start gap-3 mb-3 ml-4 p-3 rounded-lg bg-accent/20">
                              <span className="text-primary font-bold text-sm mt-0.5">{line.match(/^\d+/)?.[0]}.</span>
                              <p className="text-sm font-medium text-foreground leading-relaxed">
                                {cleanLine.replace(/^\d+\.\s*/, '')}
                              </p>
                            </div>
                          );
                          return;
                        }
                        
                         // Handle regular paragraphs with enhanced typography
                         if (cleanLine && cleanLine.length > 10) {
                           const isImportant = line.includes('recommend') || line.includes('important') || line.includes('significant');
                           if (isImportant) {
                             renderedElements.push(
                               <p key={index} className="text-base font-medium text-foreground bg-accent/10 p-3 rounded-lg border-l-2 border-primary mb-3 leading-relaxed">
                                 {cleanLine}
                               </p>
                             );
                           }
                         }
                      });

                      return renderedElements;
                    })()}
                  </div>
                  </div>
              </div>
              
              {message.type === 'user' && (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary animate-pulse" />
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex gap-2 pt-4 border-t">
          <Input
            placeholder="Type your message... e.g., 'my income has been 9000'"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1">
            <Brain className="w-3 h-3 text-primary" />
            AI Financial Advisor
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIFinancialAgent;