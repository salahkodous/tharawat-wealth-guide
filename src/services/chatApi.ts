import { supabase } from '@/integrations/supabase/client';

// Anakin AI Chat System API
const EXTERNAL_API_URL = 'https://vercel-chat-le3acpefj-salah-kodous-s-projects.vercel.app';
const USE_EXTERNAL_API = true; // Set to false to use Supabase functions instead

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at?: string;
}

interface SendMessageRequest {
  message: string;
  userId: string;
  chatId?: string;
  conversationHistory?: ChatMessage[];
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

/**
 * Get authorization headers with Supabase JWT
 */
const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

/**
 * Send a message to either the Supabase function or external API
 */
export const sendChatMessage = async (
  request: SendMessageRequest
): Promise<SendMessageResponse> => {
  if (USE_EXTERNAL_API) {
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
 * Send message to External Anakin API
 */
const sendToExternalAPI = async (
  request: SendMessageRequest
): Promise<SendMessageResponse> => {
  const headers = await getAuthHeaders();

  const response = await fetch(`${EXTERNAL_API_URL}/api/chat/send-message`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      message: request.message,
      userId: request.userId,
      chatId: request.chatId,
      conversationHistory: request.conversationHistory,
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized: Please sign in again');
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API request failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    success: data.success,
    response: data.response || '',
    metadata: data.metadata,
    ui_components: data.ui_components,
  };
};

/**
 * Fetch user conversations from either source
 */
export const fetchConversations = async (userId: string) => {
  if (USE_EXTERNAL_API) {
    const headers = await getAuthHeaders();

    const response = await fetch(`${EXTERNAL_API_URL}/api/chat/conversations/${userId}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch conversations: ${response.status}`);
    }

    const result = await response.json();
    return result.data || result; // Handle both {success, data} and direct array
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
  if (USE_EXTERNAL_API) {
    const headers = await getAuthHeaders();

    const response = await fetch(`${EXTERNAL_API_URL}/api/chat/messages/${chatId}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch messages: ${response.status}`);
    }

    const result = await response.json();
    return result.data || result; // Handle both {success, data} and direct array
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
  if (USE_EXTERNAL_API) {
    const headers = await getAuthHeaders();

    const response = await fetch(`${EXTERNAL_API_URL}/api/chat/conversations/create`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create conversation: ${response.status}`);
    }

    const result = await response.json();
    return result.data || result;
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
  if (USE_EXTERNAL_API) {
    const headers = await getAuthHeaders();

    const response = await fetch(`${EXTERNAL_API_URL}/api/chat/conversations/delete?chatId=${chatId}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to delete conversation: ${response.status}`);
    }

    return { success: true };
  }

  // Use Supabase
  const { error } = await supabase
    .from('chats')
    .delete()
    .eq('id', chatId);

  if (error) throw error;
  return { success: true };
};
