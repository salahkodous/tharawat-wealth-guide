import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at?: string;
}

interface SendMessageRequest {
  message: string;
  userId: string;
  chatId: string;
  conversationHistory: ChatMessage[];
}

interface SendMessageResponse {
  success: boolean;
  response: string;
  metadata?: {
    agents_used?: string[];
    execution_time_ms?: number;
    original_language?: string;
  };
  ui_components?: {
    show_finances?: boolean;
    show_portfolio?: boolean;
    show_asset_detail?: any;
  };
}

const USE_EXTERNAL_API = import.meta.env.VITE_USE_EXTERNAL_CHAT_API === 'true';
const EXTERNAL_API_URL = import.meta.env.VITE_EXTERNAL_CHAT_API_URL;

/**
 * Send a message to either the Supabase function or external API
 */
export const sendChatMessage = async (
  request: SendMessageRequest
): Promise<SendMessageResponse> => {
  if (USE_EXTERNAL_API && EXTERNAL_API_URL) {
    return sendToExternalAPI(request);
  }
  
  return sendToSupabaseFunction(request);
};

/**
 * Send message to Supabase Edge Function
 */
const sendToSupabaseFunction = async (
  request: SendMessageRequest
): Promise<SendMessageResponse> => {
  const { data, error } = await supabase.functions.invoke('multi-agent-chat', {
    body: {
      message: request.message,
      userId: request.userId,
      chatId: request.chatId,
      conversationHistory: request.conversationHistory,
    },
  });

  if (error) {
    console.error('Supabase function error:', error);
    throw new Error(error.message || 'Failed to get AI response');
  }

  return {
    success: true,
    response: data.response || data.answer || '',
    metadata: data.metadata,
    ui_components: data.ui_components,
  };
};

/**
 * Send message to External API
 */
const sendToExternalAPI = async (
  request: SendMessageRequest
): Promise<SendMessageResponse> => {
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;

  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${EXTERNAL_API_URL}/api/chat/send-message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API request failed: ${response.status}`);
  }

  const data = await response.json();
  return data;
};

/**
 * Fetch user conversations from either source
 */
export const fetchConversations = async (userId: string) => {
  if (USE_EXTERNAL_API && EXTERNAL_API_URL) {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    const response = await fetch(`${EXTERNAL_API_URL}/api/chat/conversations/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.json();
  }

  // Use Supabase
  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data;
};

/**
 * Fetch messages for a conversation
 */
export const fetchMessages = async (chatId: string) => {
  if (USE_EXTERNAL_API && EXTERNAL_API_URL) {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    const response = await fetch(`${EXTERNAL_API_URL}/api/chat/messages/${chatId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.json();
  }

  // Use Supabase
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
};

/**
 * Create a new conversation
 */
export const createConversation = async (userId: string, title: string = 'New Chat') => {
  if (USE_EXTERNAL_API && EXTERNAL_API_URL) {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    const response = await fetch(`${EXTERNAL_API_URL}/api/chat/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, title }),
    });

    return response.json();
  }

  // Use Supabase
  const { data, error } = await supabase
    .from('chats')
    .insert({ user_id: userId, title })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete a conversation
 */
export const deleteConversation = async (chatId: string) => {
  if (USE_EXTERNAL_API && EXTERNAL_API_URL) {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    const response = await fetch(`${EXTERNAL_API_URL}/api/chat/conversations/${chatId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.json();
  }

  // Use Supabase
  const { error } = await supabase
    .from('chats')
    .delete()
    .eq('id', chatId);

  if (error) throw error;
  return { success: true };
};
