import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useChatHistory } from '@/hooks/useChatHistory';
import { Bot, Send, User, MessageSquarePlus, History, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SourceChip } from '@/components/SourceChip';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

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
  const {
    chats,
    currentChatId,
    createChat,
    loadMessages,
    deleteChat,
    updateChatTitle,
    messages: historyMessages,
  } = useChatHistory();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history when a chat is selected
  useEffect(() => {
    if (historyMessages.length > 0) {
      const formattedMessages: Message[] = historyMessages.map(msg => ({
        id: msg.id,
        type: msg.role === 'user' ? 'user' : 'agent',
        content: msg.content,
        timestamp: new Date(msg.created_at),
      }));
      setMessages(formattedMessages);
    }
  }, [historyMessages]);

  const handleNewChat = async () => {
    const chatId = await createChat();
    if (chatId) {
      setMessages([]);
    }
  };

  const handleLoadChat = async (chatId: string) => {
    await loadMessages(chatId);
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteChat(chatId);
  };

  const formatAgentResponse = (content: string) => {
    // Parse content with source citations in format [SOURCE:Title|URL]
    const parts = [];
    let lastIndex = 0;
    // Updated regex to handle both [SOURCE:Title|URL] and [SOURCE: Title|URL] (with optional space)
    const sourceRegex = /\[SOURCE:\s*(.*?)\|(.*?)\]/g;
    let match;
    let sourceIndex = 1;

    while ((match = sourceRegex.exec(content)) !== null) {
      // Add text before the source
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {content.substring(lastIndex, match.index)}
          </span>
        );
      }

      // Add the source chip
      const title = match[1];
      const url = match[2];
      parts.push(
        <SourceChip key={`source-${match.index}`} title={title} url={url} index={sourceIndex} />
      );
      sourceIndex++;

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {content.substring(lastIndex)}
        </span>
      );
    }

    return <div className="text-base leading-relaxed whitespace-pre-wrap">{parts}</div>;
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !user) return;

    // Check if this is the first message in the chat
    const isFirstMessage = messages.length === 0;

    // Create a new chat if none exists
    let chatId = currentChatId;
    if (!chatId) {
      chatId = await createChat('New Chat');
      if (!chatId) return;
    }

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
          userId: user.id,
          chatId: chatId
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

      // If this is the first message exchange, generate a title from the user's message
      if (isFirstMessage && chatId) {
        const title = messageToSend.length > 50 
          ? messageToSend.substring(0, 47) + '...'
          : messageToSend;
        await updateChatTitle(chatId, title);
      }
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
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Financial Agent
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNewChat}
              className="h-8 w-8 p-0"
            >
              <MessageSquarePlus className="h-4 w-4" />
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <History className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Chat History</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-100px)] mt-4">
                  <div className="space-y-2">
                    {chats.map((chat) => (
                      <div
                        key={chat.id}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-accent ${
                          currentChatId === chat.id ? 'bg-accent' : ''
                        }`}
                        onClick={() => handleLoadChat(chat.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{chat.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(chat.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteChat(chat.id, e)}
                          className="h-8 w-8 p-0 ml-2"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    {chats.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No chat history yet
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>
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