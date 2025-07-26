'use client';

import { useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useChatStore } from '@/lib/store';
import { ChatInterface } from '@/components/chat-interface';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();

  const slug = params.slug ? (params.slug as string[])[0] : null;

  const {
    sessions,
    currentSession,
    fetchSessions,
    setCurrentSession,
    isLoading,
    isSendingMessage,
    sessionsFetched,
  } = useChatStore();

  const hasFetchedInitialSessions = useRef(false);

  // 1. Fetch all sessions on initial load
  useEffect(() => {
    // Oturumlar henüz yüklenmemişse ve daha önce yükleme denemesi yapılmamışsa
    if (!hasFetchedInitialSessions.current && !sessionsFetched) {
      // Oturumları yükle
      fetchSessions();
      hasFetchedInitialSessions.current = true;
    }
  }, [fetchSessions, sessionsFetched]);




  // 2. Sync Store from URL (`slug`)
  // This effect ensures that the active session in the store matches the session ID in the URL.
  useEffect(() => {
    // While sending a message, optimistic updates are in progress. Do not interfere.
    if (isSendingMessage) {
      return;
    }
    // Also, wait for sessions to be loaded initially.
    if (isLoading || !sessionsFetched) {
      return;
    }

    if (slug) {
      const sessionFromSlug = sessions.find(s => s.id === slug);
      if (sessionFromSlug) {
        // A valid session ID is in the URL. If it's not the current one, set it.
        if (currentSession?.id !== sessionFromSlug.id) {
          setCurrentSession(sessionFromSlug);
        }
      } else {
        // An invalid session ID is in the URL. Redirect to the base page.
        if (sessions.length > 0) {
          router.replace('/chat');
        }
      }
    } else {
      // No session ID in the URL. Ensure no session is active in the store.
      if (currentSession) {
        setCurrentSession(null);
      }
    }
  }, [slug, sessions, isLoading, isSendingMessage, currentSession, setCurrentSession, router]);



  return <ChatInterface />;
}
