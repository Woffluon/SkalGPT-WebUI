'use client';

import { Message } from '@/types/chat';
import dynamic from 'next/dynamic';
import { useEffect, useState, useRef } from 'react';
import { formatTime } from '@/lib/utils';

// Markdown renderer'ı dinamik olarak yüklüyoruz.
const DynamicMarkdownRenderer = dynamic(
  () => import('./markdown-renderer').then(mod => mod.MarkdownRenderer),
  {
    // Yüklenirken boş bir alan göstererek atlamayı önlüyoruz.
    loading: () => <div className="prose prose-sm max-w-none prose-p:my-0"></div>,
    ssr: false,
  }
);

interface ChatBubbleProps {
  message: Message;
  isLastMessage: boolean;
  isResponding: boolean;
  responseTime?: number; // New prop for response time
}

export function ChatBubble({ message, isLastMessage, isResponding }: ChatBubbleProps) {
  const isUser = message.role === 'user';
  // 'showStreaming' animasyonun başlaması gerekip gerekmediğini kontrol eder.
  const showStreaming = !isUser && isLastMessage && isResponding;

  const [displayedText, setDisplayedText] = useState('');
  
  // Animasyonun her mesaj için sıfırlandığından emin olmak için referans kullanıyoruz.
  const prevMessageIdRef = useRef<string | null>(null);
  // Animasyonun ortasında kesilmesini önlemek için bir referans daha.
  const isAnimatingRef = useRef(false);
  const prevContentRef = useRef<string>('');

  useEffect(() => {
    const isNewMessage = prevMessageIdRef.current !== message.id;
    const isContentChanged = prevContentRef.current !== message.content;
    
    // Eğer mesaj ID'si değiştiyse, bu yeni bir mesaj demektir. Animasyonu sıfırla.
    if (isNewMessage) {
      setDisplayedText('');
      prevMessageIdRef.current = message.id;
      isAnimatingRef.current = false; // Yeni mesaj için animasyon durumunu sıfırla.
      prevContentRef.current = '';
    }

    // İçerik değişmemişse hiçbir şey yapma
    if (!isContentChanged && !isNewMessage) {
      return;
    }

    prevContentRef.current = message.content;

    // Animasyonun başlaması veya devam etmesi için koşul.
    // 'showStreaming' true ise veya animasyon zaten başlamışsa devam et.
    const shouldAnimate = showStreaming || (isAnimatingRef.current && !isUser && isLastMessage);

    if (shouldAnimate) {
      // Animasyon devam ederken metni karakter karakter ekle.
      if (displayedText.length < message.content.length) {
        isAnimatingRef.current = true; // Animasyonun başladığını işaretle.
        const timer = setTimeout(() => {
          setDisplayedText(message.content.slice(0, displayedText.length + 1));
        }, 15); // Yazma hızını buradan ayarlayabilirsiniz.
        return () => clearTimeout(timer);
      } else {
        // Animasyon tamamlandı.
        isAnimatingRef.current = false;
      }
    } else {
      // Eğer animasyon yoksa, metnin tamamını anında göster.
      setDisplayedText(message.content || '');
    }
    // 'isUser' ve 'isLastMessage' prop'lardan türetildiği için bağımlılıklara eklemek
    // render döngüsünü stabilize etmeye yardımcı olur.
  }, [displayedText, message.content, showStreaming, message.id, isUser, isLastMessage]);

  return (
    <div className={`flex w-full my-6 ${isUser ? 'justify-end' : 'justify-start'} flex-col`}>
      <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div
          className={`max-w-[90%] rounded-xl px-3 py-2 sm:px-4 sm:py-3 shadow-md transition-all ${
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-card text-foreground border border-border dark:bg-card dark:text-foreground dark:border-border'
          }`}
        >
          {/* Metni ve stilleri tek bir yerden yönetiyoruz */}
          <div className="prose prose-sm sm:prose-base max-w-none text-current dark:prose-invert prose-p:my-2 prose-headings:my-3">
            <DynamicMarkdownRenderer content={displayedText} />
          </div>
        </div>
      </div>
      {!isUser && 'responseTime' in message && message.responseTime !== undefined && (
        <div className="text-left text-xs text-muted-foreground mt-1 ml-1">
          Response time: {formatTime(Number(message.responseTime) || 0)}
        </div>
      )}
    </div>
  );
}