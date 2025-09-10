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
  CheckCircle,
  XCircle,
  MessageSquare
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'agent' | 'error';
  content: string;
  timestamp: Date;
  pendingAction?: any;
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
    if (!input.trim() || isLoading || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = input;
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
        timestamp: new Date(),
        pendingAction: data?.pendingAction
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

  const handleActionResponse = async (messageId: string, accept: boolean) => {
    const message = messages.find(m => m.id === messageId);
    if (!message?.pendingAction || !user) return;

    setIsLoading(true);

      try {
        if (accept) {
          const { data, error } = await supabase.functions.invoke('ai-financial-agent', {
            body: {
              message: 'confirm',
              userId: user.id,
              action: {
                type: 'confirm',
                pendingAction: message.pendingAction
              }
            }
          });

          if (error) throw error;

          const confirmMessage: Message = {
            id: (Date.now() + 2).toString(),
            type: 'agent',
            content: data?.response || 'Action completed',
            timestamp: new Date()
          };

          setMessages(prev => [...prev, confirmMessage]);
          // Notify other parts of the app to refresh finance data
          window.dispatchEvent(new Event('finances-updated'));
        } else {
          const declineMessage: Message = {
            id: (Date.now() + 2).toString(),
            type: 'agent',
            content: '👍 No problem! The changes have been cancelled. Is there anything else I can help you with?',
            timestamp: new Date()
          };

          setMessages(prev => [...prev, declineMessage]);
        }

        // Remove pending action from the original message
        setMessages(prev => prev.map(m => 
          m.id === messageId ? { ...m, pendingAction: undefined } : m
        ));

      } catch (error: any) {
        console.error('Error handling action:', error);
        
        const errorMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: 'error',
          content: `Failed to execute action: ${error.message || 'Unknown error'}`,
          timestamp: new Date(),
          errorDetails: {
            name: error.name,
            message: error.message,
            stack: error.stack?.split('\n')[0]
          }
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
                <div className={`p-3 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-primary text-primary-foreground ml-auto' 
                    : message.type === 'error'
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-muted'
                }`}>
                  <p className={`text-sm whitespace-pre-line ${
                    message.type === 'error' ? 'text-red-800' : ''
                  }`}>{message.content}</p>
                </div>
                
                {message.pendingAction && (
                  <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800 mb-2">
                      <strong>Proposed Action:</strong> {message.pendingAction.description}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleActionResponse(message.id, true)}
                        disabled={isLoading}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleActionResponse(message.id, false)}
                        disabled={isLoading}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Decline
                      </Button>
                    </div>
                  </div>
                )}
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