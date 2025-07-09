import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { ChatSession, Message } from '@/types/chat';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

export type { Message };

const supabase = createClient();

interface ChatStore {
  sessions: ChatSession[];
  sessionsFetched: boolean;
  currentSession: ChatSession | null;
  messages: Message[];
  user: User | null;
  isLoading: boolean;
  isSendingMessage: boolean;
  isResponding: boolean;
  error: string | null;
  isSidebarOpen: boolean;
  language: 'tr' | 'en';
  
  // Actions
  fetchSessions: () => Promise<void>;
  fetchMessages: (sessionId: string) => Promise<void>;
  createNewSession: (title?: string, initialMessageContent?: string) => Promise<ChatSession | null>;
  setCurrentSession: (session: ChatSession | null) => void;
  sendMessage: (text: string, router: any) => Promise<void>;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  deleteSession: (sessionId: string) => Promise<void>;
  setUser: (user: User | null) => void;
  clearChat: () => void;
  logout: () => Promise<void>;
  startNewConversation: (router: any) => void;
  setLanguage: (lang: 'tr' | 'en') => void;
  updateSessionTitle: (sessionId: string, newTitle: string) => Promise<void>;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  sessions: [],
  sessionsFetched: false,
  currentSession: null,
  messages: [],
  user: null,
  isLoading: false,
  isSendingMessage: false,
  isResponding: false,
  error: null,
  isSidebarOpen: true,
  language: 'tr',

  setUser: (user) => set({ user }),

  fetchSessions: async () => {
    const { isSendingMessage, sessionsFetched } = get();
    if (isSendingMessage) {
      return;
    }
    if (sessionsFetched) {
      return;
    }

    set({ isLoading: true });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ sessions: [], isLoading: false, user: null, sessionsFetched: true });
      return;
    }
    set({ user });

    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Oturumlar yüklenirken bir hata oluştu.');
      console.error('Error fetching sessions:', error);
      set({ isLoading: false });
      return;
    }
    set({ sessions: data || [], isLoading: false, sessionsFetched: true });
  },

  fetchMessages: async (sessionId: string) => {
    if (get().isSendingMessage) {
      return;
    }
    set({ isLoading: true, messages: [] });
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      toast.error('Mesajlar yüklenirken bir hata oluştu.');
      console.error('Error fetching messages:', error);
      set({ messages: [], isLoading: false });
      return;
    }
    set({ messages: data || [], isLoading: false });
  },

  setCurrentSession: (session: ChatSession | null) => {
    if (get().currentSession?.id === session?.id && session !== null) {
      return;
    }

    if (session) {
      set({ currentSession: session, isLoading: true });
      get().fetchMessages(session.id);
    } else {
      set({ currentSession: null, messages: [], isLoading: false });
    }
  },

  updateSessionTitle: async (sessionId: string, newTitle: string) => {
    set(state => ({
      sessions: state.sessions.map(s => 
        s.id === sessionId ? { ...s, title: newTitle, isGeneratingTitle: false } : s
      ),
      currentSession: state.currentSession?.id === sessionId 
        ? { ...state.currentSession, title: newTitle, isGeneratingTitle: false } 
        : state.currentSession
    }));

    const { error } = await supabase
      .from('chat_sessions')
      .update({ title: newTitle })
      .eq('id', sessionId);

    if (error) {
      toast.error('Oturum başlığı güncellenirken bir hata oluştu.');
    }
  },

  createNewSession: async (title: string = 'Yeni Sohbet') => {
    const user = get().user;
    if (!user) {
      toast.error('Oturum oluşturmak için giriş yapmalısınız.');
      return null;
    }
    
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({ user_id: user.id, title })
      .select()
      .single();

    if (error) {
      toast.error('Yeni oturum oluşturulurken bir hata oluştu.');
      console.error('Error creating new session:', error);
      return null;
    }
    return data;
  },
  
  sendMessage: async (text: string, router: any): Promise<void> => {
    set({ isSendingMessage: true, error: null });
    const isNewSession = !get().currentSession;

    if (isNewSession) {
      const tempSessionId = crypto.randomUUID();
      const tempSession: ChatSession = {
        id: tempSessionId,
        user_id: get().user!.id,
        title: 'Yeni Sohbet',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        isGeneratingTitle: true,
      };

      const userMessage: Message = {
        id: crypto.randomUUID(), session_id: tempSessionId, user_id: get().user!.id, role: 'user', content: text, created_at: new Date().toISOString(),
      };
      const assistantMessage: Message = {
        id: crypto.randomUUID(), session_id: tempSessionId, user_id: get().user!.id, role: 'assistant', content: '', created_at: new Date().toISOString(),
      };

      set(state => ({
        sessions: [tempSession, ...state.sessions],
        currentSession: tempSession,
        messages: [userMessage, assistantMessage],
        isResponding: true,
      }));

      const newSession = await get().createNewSession('Yeni Sohbet');

      if (newSession) {
        set(state => ({
          sessions: state.sessions.map(s => s.id === tempSessionId ? { ...newSession, isGeneratingTitle: true } : s),
          currentSession: { ...newSession, isGeneratingTitle: true },
          messages: state.messages.map(m => m.session_id === tempSessionId ? { ...m, session_id: newSession.id } : m),
        }));

        router.push(`/chat/${newSession.id}`);

        fetch('/api/generate-title', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text }),
        }).then(async res => {
          if (res.ok) {
            const data = await res.json();
            get().updateSessionTitle(newSession.id, data.title);
          }
        }).catch(error => console.error('AI title generation failed:', error));

      } else {
        console.error('Failed to create new session in DB.');
        toast.error('Yeni sohbet oluşturulamadı.');
        set({ isResponding: false });
        return;
      }

    } else {
      const session = get().currentSession!;
      const userMessage: Message = {
        id: crypto.randomUUID(), session_id: session.id, user_id: session.user_id, role: 'user', content: text, created_at: new Date().toISOString(),
      };
      const assistantMessage: Message = {
        id: crypto.randomUUID(), session_id: session.id, user_id: session.user_id, role: 'assistant', content: '', created_at: new Date().toISOString(),
      };
      set(state => ({ 
        messages: [...state.messages, userMessage, assistantMessage],
        isResponding: true 
      }));
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId: get().currentSession!.id }),
      });

      if (!response.ok) throw new Error(await response.text());
      if (!response.body) throw new Error('Response body is null');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let content = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        content += decoder.decode(value, { stream: true });
        set(state => ({
          messages: state.messages.map((m, i) => 
            i === state.messages.length - 1 ? { ...m, content } : m
          ),
        }));
      }
    } catch (error) {
      console.error('Fetch to /api/chat failed:', error);
      toast.error('Yapay zeka yanıtı alınırken bir hata oluştu.');
      set(state => ({
        messages: state.messages.map((m, i) => 
          i === state.messages.length - 1 ? { ...m, content: 'Üzgünüm, bir hata oluştu.' } : m
        ),
      }));
    } finally {
      set({ isResponding: false, isSendingMessage: false });
    }
  },
  
  deleteSession: async (sessionId: string) => {
    const previousState = { sessions: get().sessions, currentSession: get().currentSession };
    const newSessions = previousState.sessions.filter(s => s.id !== sessionId);
    const newCurrentSession = previousState.currentSession?.id === sessionId ? null : previousState.currentSession;

    set({ sessions: newSessions, currentSession: newCurrentSession, messages: newCurrentSession ? get().messages : [] });

    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      toast.error('Oturum silinirken bir hata oluştu.');
      console.error('Error deleting session:', error);
      set(previousState);
    } else {
      toast.success("Oturum başarıyla silindi.");
    }
  },

  toggleSidebar: () => set(state => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open: boolean) => set({ isSidebarOpen: open }),

  setLanguage: (lang) => set({ language: lang }),

  clearChat: () => {
    set({
      messages: [],
      currentSession: null,
    });
  },

  startNewConversation: (router: any) => {
    const { isResponding } = get();
    if (isResponding) {
      toast.warning('Lütfen asistanın yanıt vermesini bekleyin.');
      return;
    }
    router.push('/chat');
  },



  logout: async () => {
    await supabase.auth.signOut();
    set({
      user: null,
      sessions: [],
      messages: [],
      currentSession: null,
      isLoading: false,
    });
    toast.success("Başarıyla çıkış yapıldı.");
  }
}));

if (process.env.NODE_ENV === 'development') {
  // ... existing code ...
}