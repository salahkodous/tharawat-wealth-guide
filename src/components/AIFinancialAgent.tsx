import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Bot, Send, User } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'agent' | 'error';
  content: string;
  timestamp: Date;
}

const AIFinancialAgent = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatAgentResponse = (content: string) => {
    // Clean up any markdown formatting that might be causing issues
    const cleanContent = content.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
    
    // Check if it's a simple greeting or short response
    if (cleanContent.length < 100 && (
      cleanContent.toLowerCase().includes('hello') || 
      cleanContent.toLowerCase().includes('hi') ||
      cleanContent.toLowerCase().includes('welcome')
    )) {
      return <span className="text-base">{cleanContent}</span>;
    }
    
    // Split into logical sections - only split on list numbers (1. 2. etc) not decimals (26.06)
    const sections = cleanContent.split(/(?:\d+\.\s|•|\n\n|:\s)/).filter(section => section.trim());
    
    return sections.map((section, index) => {
      const trimmedSection = section.trim();
      if (!trimmedSection) return null;
      
      const isTitle = index === 0 || trimmedSection.length < 50;
      const isImportant = trimmedSection.toLowerCase().includes('recommend') || 
                         trimmedSection.toLowerCase().includes('important') || 
                         trimmedSection.toLowerCase().includes('alert') ||
                         trimmedSection.toLowerCase().includes('warning');
      const hasNumbers = /\$[\d,]+|\d+%|\d+\.\d+/.test(trimmedSection);
      
      let className = 'block ';
      let marginClass = index > 0 ? 'mt-3 ' : '';
      
      if (isTitle && index === 0) {
        className += 'text-lg font-bold text-foreground';
      } else if (isImportant) {
        className += 'text-base font-semibold text-primary';
      } else if (hasNumbers) {
        className += 'text-base font-medium text-success';
      } else {
        className += 'text-sm text-muted-foreground leading-relaxed';
      }
      
      return (
        <span key={index} className={className + marginClass}>
          {index > 0 && !isTitle ? '• ' : ''}{trimmedSection}
          {!trimmedSection.endsWith('.') && !trimmedSection.endsWith('?') && !trimmedSection.endsWith('!') ? '.' : ''}
        </span>
      );
    }).filter(Boolean);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !user) return;

    console.log('Sending message:', input);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    const messageToSend = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-router-agent', {
        body: {
          message: messageToSend,
          userId: user.id
        }
      });

      console.log('AI response:', { data, error });

      if (error) {
        throw new Error(`API Error: ${error.message}`);
      }

      if (data?.error) {
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
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'error',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
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
    <Card className="h-[450px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Financial Agent
        </CardTitle>
      </CardHeader>
      
      <CardContent className={`flex-1 flex flex-col gap-4 overflow-hidden ${messages.length === 0 ? 'justify-center' : ''}`}>
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex gap-2 w-full max-w-md">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your finances..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : ''}`}>
                  {message.type !== 'user' && (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'error' ? 'bg-red-100' : 'bg-primary/20'
                    }`}>
                      <Bot className={`w-4 h-4 ${message.type === 'error' ? 'text-red-600' : 'text-primary'}`} />
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] ${message.type === 'user' ? 'order-1' : ''}`}>
                    <div className={`p-3 rounded-lg ${
                      message.type === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : message.type === 'error'
                        ? 'bg-red-50 border border-red-200 text-red-800'
                        : 'bg-muted'
                    }`}>
                      {message.type === 'agent' ? (
                        <div className="space-y-1">
                          {formatAgentResponse(message.content)}
                        </div>
                      ) : (
                        message.content
                      )}
                    </div>
                  </div>
                  
                  {message.type === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary animate-pulse" />
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="text-sm text-muted-foreground animate-pulse">
                      Analyzing your financial data...
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your finances..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AIFinancialAgent;