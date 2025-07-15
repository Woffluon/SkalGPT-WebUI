'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

import { useChatStore } from '@/lib/store';
import { ChatBubble } from './chat-bubble';
import { TypingIndicator } from './typing-indicator';
import { ScrollArea } from './ui/scroll-area';
import { QuickActions } from './quick-actions';

export function ChatArea() {
  const { messages, currentSession, language, isResponding } = useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = useCallback(() => {
    if (!viewportRef.current) return;
    
    // ScrollArea'nın viewport'unu bul
    const scrollAreaViewport = viewportRef.current.querySelector('[data-radix-scroll-area-viewport]');
    if (!scrollAreaViewport) return;
    
    // Scroll işlemini gerçekleştir
    scrollAreaViewport.scrollTo({
      top: scrollAreaViewport.scrollHeight,
      behavior: 'smooth'
    });
  }, []);


  const itemCount = messages.length + (isResponding ? 1 : 0);

  const rowVirtualizer = useVirtualizer({
    count: itemCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 200, // Ortalama bir mesaj yüksekliği tahmini (boşluk dahil)
    overscan: 5,
  });

  // Auto-scroll to bottom when messages change or when responding
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, isResponding, scrollToBottom]);

  const lastMessageContent = messages[messages.length - 1]?.content;

  const texts = {
    tr: {
      greeting: 'Merhaba! Ben SkalGPT',
      description: 'Sezai Karakoç Anadolu Lisesi için özel geliştirilmiş eğitim asistanınızım.',
      question: 'Size nasıl yardımcı olabilirim?',
      quickStart: 'Hızlı başlangıç:',
    },
    en: {
      greeting: 'Hello! I am SkalGPT',
      description: 'I am your educational assistant specially developed for Sezai Karakoç Anatolian High School.',
      question: 'How can I help you?',
      quickStart: 'Quick start:',
    },
  };

  if (!currentSession) {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col items-center justify-start p-4 sm:p-8 min-h-full">
            <div className="flex-1 flex flex-col items-center justify-center max-w-5xl w-full">
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold text-gray-900 mb-2">
                  {texts[language].greeting}
                </h2>
                <p className="text-gray-700 leading-relaxed mb-2 text-base sm:text-lg lg:text-xl">
                  {texts[language].description}
                </p>
                <p className="text-xs sm:text-sm lg:text-base text-gray-500 mb-6">
                  {texts[language].question}
                </p>
                <div className="mb-7">
                  <QuickActions />
                </div>
              </div>
              <div className="w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const virtualItems = rowVirtualizer.getVirtualItems();

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-hidden">
        <ScrollArea ref={viewportRef} className="h-full">
          {messages.length > 0 ? (
            <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8">
              {messages.map((message, index) => (
                <ChatBubble
                  key={`message-${message.id}`}
                  message={message}
                  isLastMessage={index === messages.length - 1 && !isResponding}
                  isResponding={isResponding}
                />
              ))}
              {isResponding && <TypingIndicator />}
            </div>
          ) : (
            <div className="max-w-5xl mx-auto p-3 sm:p-6 lg:p-8">
              <div className="text-center text-gray-500 pt-10">
                Bu sohbette henüz mesaj yok. İlk mesajı göndererek başlayın.
              </div>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}