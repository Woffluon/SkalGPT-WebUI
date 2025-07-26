'use client';

import { motion } from 'framer-motion';
import { useChatStore } from '@/lib/store';
import React, { useState, useEffect } from 'react';

interface TypingIndicatorProps {
  message?: string;
}

const TypingIndicatorComponent = React.forwardRef<HTMLDivElement, TypingIndicatorProps>(({ message: initialMessage }, ref) => {
  const [displayedMessage, setDisplayedMessage] = useState<string | undefined>(initialMessage);

  const messages = [
    "Cevap oluşturuluyor...",
    "Bilgiler derleniyor...",
    "Yanıt kişiselleştiriliyor...",
    "Veritabanı sorgulanıyor...",
    "İçerik analiz ediliyor..."
  ];

  const { isResponding } = useChatStore();

  useEffect(() => {
    if (initialMessage) {
      setDisplayedMessage(initialMessage);
      return;
    }

    if (!isResponding) {
      setDisplayedMessage(undefined);
      return;
    }

    let messageIndex = 0;
    setDisplayedMessage(messages[messageIndex]);

    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setDisplayedMessage(messages[messageIndex]);
    }, 2000);

    return () => {
      clearInterval(messageInterval);
    };
  }, [initialMessage, isResponding]);

  if (!isResponding) return null;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="flex items-center space-x-2 p-4"
    >
      <div className="flex flex-col items-center justify-center p-2 max-w-xs text-wrap h-auto text-center border border-gray-200 dark:border-gray-700 shadow-md rounded-lg bg-white dark:bg-gray-800">
        <div className="flex items-center justify-center">
          <svg fill="hsl(228, 97%, 42%)" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
            <path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/>
            <path d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z">
              <animateTransform attributeName="transform" type="rotate" dur="0.75s" values="0 12 12;360 12 12" repeatCount="indefinite"/>
            </path>
          </svg>
        </div>
        <motion.span
          className="text-sm text-foreground/70 dark:text-foreground/70 text-center"
        >
          {displayedMessage}
        </motion.span>
      </div>
    </motion.div>
  );
});

TypingIndicatorComponent.displayName = 'TypingIndicator';

export const TypingIndicator = TypingIndicatorComponent;