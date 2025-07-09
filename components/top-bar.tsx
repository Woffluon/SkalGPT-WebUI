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
      <div className="card-modern h-full flex items-center justify-between px-3 sm:px-6 mx-2 sm:mx-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl hover:bg-gray-100 text-gray-600"
          >
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <Image src="/favicon.png" alt="SkalGPT Logo" width={40} height={40} className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl shadow-md" />
            <div>
              <h1 className="h3 font-semibold text-gray-800">
                SkalGPT
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                {texts[language].school}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <div>
            <Button asChild variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl hover:bg-gray-100 text-gray-600">
              <Link href="/chat">
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
          </div>

          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl hover:bg-gray-100 text-gray-600"
                >
                  <Languages className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem 
                  onClick={() => setLanguage('tr')}
                  className={language === 'tr' ? 'bg-gray-100' : ''}
                >
                  🇹🇷 {texts[language].turkish}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage('en')}
                  className={language === 'en' ? 'bg-gray-100' : ''}
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