'use client';

import { useState, useEffect } from 'react';
import { Menu, Plus, Languages } from 'lucide-react';
import Image from 'next/image';
import { useChatStore } from '@/lib/store';
import Link from 'next/link';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { ModeToggle } from './mode-toggle';

export function TopBar() {
  const { toggleSidebar, language, setLanguage } = useChatStore();

  const texts = {
    tr: {
      school: 'Sezai Karakoç Anadolu Lisesi',
      turkish: 'Türkçe',
      english: 'English'
    },
    en: {
      school: 'Sezai Karakoç Anatolian High School',
      turkish: 'Türkçe',
      english: 'English'
    }
  };

  return (
    <header className="relative z-30 h-16 sm:h-20 px-3 sm:px-6 pt-4">
      <div className="h-full flex items-center justify-between px-3 sm:px-6 mx-2 sm:mx-4 bg-card border border-border rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-r from-[#F3904F] to-[#3B4371] text-white dark:text-white hover:bg-gradient-to-r hover:from-[#F3904F] hover:to-[#3B4371] hover:text-white"
          >
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                SkalGPT
              </h1>
              <p className="text-xs font-medium text-muted-foreground hidden sm:block tracking-normal">
                {texts[language].school}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <div>
            <Button asChild variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">
              <Link href="/chat">
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
          </div>

          <ModeToggle />

          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                >
                  <Languages className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem 
                  onClick={() => setLanguage('tr')}
                  className={language === 'tr' ? 'bg-gray-100 dark:bg-gray-800' : ''}
                >
                  🇹🇷 {texts[language].turkish}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage('en')}
                  className={language === 'en' ? 'bg-gray-100 dark:bg-gray-800' : ''}
                >
                  🇬🇧 {texts[language].english}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}