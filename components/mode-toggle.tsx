'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/components/theme-provider';
import { useChatStore } from '@/lib/store';

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const { language } = useChatStore();

  const texts = {
    tr: {
      light: 'Açık',
      dark: 'Koyu',
      theme: 'Tema'
    },
    en: {
      light: 'Light',
      dark: 'Dark',
      theme: 'Theme'
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">
          <Sun className="h-4 w-4 sm:h-5 sm:w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 sm:h-5 sm:w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">{texts[language].theme}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuItem onClick={() => setTheme('light')} className={theme === 'light' ? 'bg-gray-100 dark:bg-gray-800' : ''}>
          <Sun className="mr-2 h-4 w-4" />
          <span>{texts[language].light}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')} className={theme === 'dark' ? 'bg-gray-100 dark:bg-gray-800' : ''}>
          <Moon className="mr-2 h-4 w-4" />
          <span>{texts[language].dark}</span>
        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  );
}