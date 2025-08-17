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
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  pendingAction?: any;
}

const AIFinancialAgent = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'agent',
      content: '👋 Hello! I\'m your enhanced AI financial advisor with full access to your financial data and market insights. I can:\n\n🔍 Analyze your complete financial situation\n💰 Update income, expenses, savings & investing amounts\n📊 Manage income & expense streams\n🏦 Handle debts and deposit accounts\n🎯 Create and track financial goals\n📈 Provide market analysis and insights\n🧠 Remember our conversations\n\nTry saying: "analyze my financial situation", "my salary increased to 12000", "add a new expense for education 500 monthly", or "what should I invest in?"',
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

      if (error) throw error;

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: data.response,
        timestamp: new Date(),
        pendingAction: data.pendingAction
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
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
          content: data.response,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, confirmMessage]);
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

    } catch (error) {
      console.error('Error handling action:', error);
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
              {message.type === 'agent' && (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              
              <div className={`max-w-[80%] ${message.type === 'user' ? 'order-1' : ''}`}>
                <div className={`p-3 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-primary text-primary-foreground ml-auto' 
                    : 'bg-muted'
                }`}>
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
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

        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3 text-primary" />
            Powered by OpenRouter
          </div>
          <div className="flex items-center gap-1">
            <Brain className="w-3 h-3 text-primary" />
            Claude 3.5 Sonnet
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIFinancialAgent;