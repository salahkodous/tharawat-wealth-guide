import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface ChatMessage {
  id: string;
  chat_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface Chat {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export const useChatHistory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load all chats for the user
  const loadChats = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setChats(data || []);
    } catch (error) {
      console.error('Error loading chats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chat history',
        variant: 'destructive',
      });
    }
  };

  // Load messages for a specific chat
  const loadMessages = async (chatId: string) => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data || []) as ChatMessage[]);
      setCurrentChatId(chatId);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new chat
  const createChat = async (title: string = 'New Chat') => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('chats')
        .insert({ user_id: user.id, title })
        .select()
        .single();

      if (error) throw error;
      
      setChats(prev => [data, ...prev]);
      setCurrentChatId(data.id);
      setMessages([]);
      return data.id;
    } catch (error) {
      console.error('Error creating chat:', error);
      toast({
        title: 'Error',
        description: 'Failed to create new chat',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Add a message to the current chat
  const addMessage = async (chatId: string, role: 'user' | 'assistant', content: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          chat_id: chatId,
          user_id: user.id,
          role,
          content,
        })
        .select()
        .single();

      if (error) throw error;
      
      setMessages(prev => [...prev, data as ChatMessage]);
      return data;
    } catch (error) {
      console.error('Error adding message:', error);
      return null;
    }
  };

  // Update chat title
  const updateChatTitle = async (chatId: string, title: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chats')
        .update({ title })
        .eq('id', chatId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setChats(prev => 
        prev.map(chat => chat.id === chatId ? { ...chat, title } : chat)
      );
    } catch (error) {
      console.error('Error updating chat title:', error);
      toast({
        title: 'Error',
        description: 'Failed to update chat title',
        variant: 'destructive',
      });
    }
  };

  // Delete a chat
  const deleteChat = async (chatId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      if (currentChatId === chatId) {
        setCurrentChatId(null);
        setMessages([]);
      }

      toast({
        title: 'Success',
        description: 'Chat deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete chat',
        variant: 'destructive',
      });
    }
  };

  // Load chats on mount
  useEffect(() => {
    loadChats();
  }, [user]);

  return {
    chats,
    messages,
    currentChatId,
    isLoading,
    loadMessages,
    createChat,
    addMessage,
    updateChatTitle,
    deleteChat,
    loadChats,
  };
};
