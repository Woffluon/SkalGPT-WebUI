'use client';

import { useState, useRef, useEffect } from 'react';

import { Send } from 'lucide-react';
import { useChatStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

export function ChatInput({ className }: any) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const { sendMessage, isResponding, language } = useChatStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const texts = {
    tr: {
      placeholder: 'Herhangi bir şey sor...',
      disclaimer: 'SkalGPT hata yapabilir. Önemli bilgileri doğrulamayı unutmayın.'
    },
    en: {
      placeholder: 'Ask anything...',
      disclaimer: 'SkalGPT can make mistakes. Remember to verify important information.'
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isResponding) return;


    const messageText = message.trim();
    await sendMessage(messageText, router);
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <div className="flex-shrink-0">
      <div className="p-3 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="p-3 sm:p-4 bg-card border border-border rounded-2xl shadow-sm">
            <form onSubmit={handleSubmit} className="flex items-center gap-2 sm:gap-3">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={texts[language].placeholder}
                  className="min-h-[40px] sm:min-h-[48px] max-h-32 resize-none bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 text-sm sm:text-base cursor-text dark:bg-background dark:border-border dark:text-foreground dark:placeholder:text-muted-foreground"
                  disabled={isResponding}
                />
              </div>

              {/* Send Button */}
              <div>
                <Button
                  type="submit"
                  disabled={!message.trim() || isResponding}
                  className="bg-gradient-to-r from-[#F3904F] to-[#3B4371] hover:from-[#3B4371] hover:to-[#F3904F] text-primary-foreground border-0 flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10 rounded-xl shadow-sm"
                  size="icon"
                >
                  <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </form>
          </div>
          {/* Disclaimer */}
          <div className="text-center mt-2 sm:mt-3">
            <p className="text-xs text-muted-foreground px-4 sm:px-0">
              {texts[language].disclaimer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}