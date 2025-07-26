'use client';

import { motion } from 'framer-motion';
import { Calculator, BookOpen, FileText, Lightbulb, Code, Globe } from 'lucide-react';
import { useChatStore } from '@/lib/store';
import { Button } from './ui/button';

export function QuickActions() {
  const { language } = useChatStore();

  const quickActions = {
    tr: [
      {
        icon: Calculator,
        label: 'Matematik',
        prompt: 'Bu matematik problemini çöz: ',
        color: 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:hover:bg-blue-900/50'
      },
      {
        icon: BookOpen,
        label: 'Açıkla',
        prompt: 'Bu konuyu detaylı açıkla: ',
        color: 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-950/50 dark:text-green-300 dark:hover:bg-green-900/50'
      },
      {
        icon: FileText,
        label: 'Özet',
        prompt: 'Bu metni özetle: ',
        color: 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:hover:bg-purple-900/50'
      },
      {
        icon: Lightbulb,
        label: 'Fikir',
        prompt: 'Bu konu hakkında yaratıcı fikirler ver: ',
        color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-300 dark:hover:bg-yellow-900/50'
      },
      {
        icon: Code,
        label: 'Kod',
        prompt: 'Bu kodu açıkla ve örnekle: ',
        color: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
      },
      {
        icon: Globe,
        label: 'Çevir',
        prompt: 'Bu metni çevir: ',
        color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-900/50'
      }
    ],
    en: [
      {
        icon: Calculator,
        label: 'Math',
        prompt: 'Solve this math problem: ',
        color: 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:hover:bg-blue-900/50'
      },
      {
        icon: BookOpen,
        label: 'Explain',
        prompt: 'Explain this topic in detail: ',
        color: 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-950/50 dark:text-green-300 dark:hover:bg-green-900/50'
      },
      {
        icon: FileText,
        label: 'Summary',
        prompt: 'Summarize this text: ',
        color: 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:hover:bg-purple-900/50'
      },
      {
        icon: Lightbulb,
        label: 'Ideas',
        prompt: 'Give creative ideas about: ',
        color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-300 dark:hover:bg-yellow-900/50'
      },
      {
        icon: Code,
        label: 'Code',
        prompt: 'Explain this code with examples: ',
        color: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
      },
      {
        icon: Globe,
        label: 'Translate',
        prompt: 'Translate this text: ',
        color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-900/50'
      }
    ]
  };

  const handleQuickAction = (prompt: string) => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.focus();
      textarea.value = prompt;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      {quickActions[language].map((action, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Button
            variant="outline"
            size="sm"
            className={`rounded-full h-8 sm:h-9 text-xs sm:text-sm transition-all duration-300 ${action.color}`}
            onClick={() => handleQuickAction(action.prompt)}
          >
            <action.icon className="mr-1.5 h-3 w-3 sm:h-4 sm:w-4" />
            {action.label}
          </Button>
        </motion.div>
      ))}
    </div>
  );
}
