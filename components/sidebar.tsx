'use client';

import { motion } from 'framer-motion';
import { MessageSquare, Trash2, Plus, User, LogOut, Languages, X, Search, MoreHorizontal, Pencil } from 'lucide-react';
import { 
  formatDistanceToNow,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
  subWeeks,
  subMonths,
  isAfter,
  isBefore,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth
} from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import { useChatStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { ChatSession } from '@/types/chat';
import { RenameChatDialog } from './rename-chat-dialog';

interface SidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export function Sidebar({ isSidebarOpen, toggleSidebar }: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [renameSession, setRenameSession] = useState<ChatSession | null>(null);
  const router = useRouter();
  const { 
    sessions, 
    currentSession, 
    setCurrentSession, 
    deleteSession,
    updateSessionTitle,
    language,
    user,
    logout,
    setLanguage,
    startNewConversation
  } = useChatStore();

  const texts = {
    tr: {
      newChat: 'Yeni Sohbet',
      searchChats: 'Sohbetlerde ara...',
      today: 'Bugün',
      yesterday: 'Dün',
      thisWeek: 'Bu Hafta',
      lastWeek: 'Geçen Hafta',
      thisMonth: 'Bu Ay',
      lastMonth: 'Geçen Ay',
      older: 'Daha Eski',
      logout: 'Çıkış Yap',
      student: 'Öğrenci',
      turkish: 'Türkçe',
      english: 'English'
    },
    en: {
      newChat: 'New Chat',
      searchChats: 'Search in chats...',
      today: 'Today',
      yesterday: 'Yesterday',
      thisWeek: 'This Week',
      lastWeek: 'Last Week',
      thisMonth: 'This Month',
      lastMonth: 'Last Month',
      older: 'Older',
      logout: 'Logout',
      student: 'Student',
      turkish: 'Türkçe',
      english: 'English'
    }
  };

  const locale = language === 'tr' ? tr : enUS;

  const isLastWeek = (date: Date) => {
    const now = new Date();
    const lastWeekStart = startOfWeek(subWeeks(now, 1));
    const lastWeekEnd = endOfWeek(subWeeks(now, 1));
    return isAfter(date, lastWeekStart) && isBefore(date, lastWeekEnd);
  };

  const isLastMonth = (date: Date) => {
    const now = new Date();
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));
    return isAfter(date, lastMonthStart) && isBefore(date, lastMonthEnd);
  };

  const groupSessionsByDate = (sessionsToGroup: ChatSession[]) => {
    const groups: { [key: string]: ChatSession[] } = {
      today: [],
      yesterday: [],
      thisWeek: [],
      lastWeek: [],
      thisMonth: [],
      lastMonth: [],
      older: []
    };

    (sessionsToGroup || []).forEach(session => {
      const date = new Date(session.created_at);
      if (isToday(date)) groups.today.push(session);
      else if (isYesterday(date)) groups.yesterday.push(session);
      else if (isThisWeek(date)) groups.thisWeek.push(session);
      else if (isLastWeek(date)) groups.lastWeek.push(session);
      else if (isThisMonth(date)) groups.thisMonth.push(session);
      else if (isLastMonth(date)) groups.lastMonth.push(session);
      else groups.older.push(session);
    });

    return groups;
  };

  const filteredSessions = sessions.filter(session => 
    session.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedSessions = groupSessionsByDate(filteredSessions);

  const renderSessionGroup = (groupKey: string, groupSessions: ChatSession[]) => {
    if (groupSessions.length === 0) return null;

    return (
      <div key={groupKey} className="mb-4 md:mb-6">
        <h3 className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider px-3 md:px-5 mb-2 md:mb-3">
          {texts[language][groupKey as keyof typeof texts.tr]} ({groupSessions.length})
        </h3>
        <div className="space-y-1 md:space-y-2">
          {groupSessions.map((session) => (
            <div
              key={session.id}
              className={`group relative p-3 md:p-4 rounded-xl cursor-pointer transition-all duration-200 h-[76px] flex flex-col justify-center ${
                currentSession?.id === session.id
                  ? 'bg-gray-100/80 border border-gray-200/60 shadow-sm'
                  : 'hover:bg-gray-50/60 border border-transparent'
              }`}
              onClick={() => {
                  setCurrentSession(session);
                  router.push(`/chat/${session.id}`);
                  if (window.innerWidth < 768) { // Close sidebar on mobile after selection
                    toggleSidebar();
                  }
                }}
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm ${
                  currentSession?.id === session.id 
                    ? 'skal-gradient' 
                    : 'bg-gray-200/60'
                }`}>
                  <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <div className="w-0 flex-1 min-w-0 overflow-hidden pr-8">
                  <p className="text-sm md:text-base font-medium text-gray-800 truncate">
                    {session.isGeneratingTitle ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      session.title
                    )}
                  </p>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(session.updated_at), { addSuffix: true, locale })}
                  </p>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 h-7 w-7 rounded-full transition-opacity data-[state=open]:opacity-100 @[media(hover:none)]:opacity-100 @[media(hover:hover)]:opacity-0 @[media(hover:hover)]:group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  side="bottom" 
                  align="end" 
                  className="w-48"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenuItem onClick={() => setRenameSession(session)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    <span>Yeniden Adlandır</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-500 focus:text-red-500 focus:bg-red-50"
                    onClick={() => deleteSession(session.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Sohbeti Sil</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <aside
      className="w-full sm:w-80 lg:w-80 h-full p-2 sm:p-4 flex flex-col"
    >
      <div className="sidebar-card relative flex-1 flex flex-col min-h-0 bg-white/80 rounded-2xl shadow-xl border border-gray-200/70">

        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200/60">
          <Button 
            className="h-10 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-500 text-white font-semibold shadow hover:from-sky-500 hover:to-indigo-600 transition-all text-sm md:text-base flex items-center gap-2 justify-center px-4 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => startNewConversation(router)}
          >
            <Plus className="h-5 w-5" />
            {texts[language].newChat}
          </Button>
          
          {/* Mobile Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-9 w-9 rounded-full md:hidden"
          >
            <X className="h-5 w-5 text-gray-500" />
          </Button>
        </div>

        {/* Search Input */}
        <div className="px-4 pt-3 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder={texts[language].searchChats}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-full bg-gray-100/80 border-gray-200/60 pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all"
            />
          </div>
        </div>

        {/* Sohbet Geçmişi */}
        <ScrollArea className="flex-1 -mx-2 px-2">
          <div className="p-2">
            {Object.entries(groupedSessions).map(([groupKey, sessions]) =>
              renderSessionGroup(groupKey, sessions)
            )}
          </div>
        </ScrollArea>
        <div className="mt-auto p-4 border-t border-gray-200/60">
          {/* Kullanıcı Bilgisi ve Çıkış */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start items-center gap-3 p-3 h-auto">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  {user?.user_metadata?.name ? user.user_metadata.name[0] : <User className="h-4 w-4 text-gray-600" />}
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm md:text-base font-semibold text-gray-800 truncate">
                    {user?.user_metadata?.name} {user?.user_metadata?.surname}
                  </p>
                  <p className="text-xs md:text-sm text-gray-500">{user?.email}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 mb-2" side="top" align="start">
              <DropdownMenuItem onClick={logout} className="text-sm md:text-base">
                <LogOut className="mr-2 h-4 w-4" />
                <span>{texts[language].logout}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Dil Seçimi */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-full justify-start items-center gap-3 p-3 h-auto"
              >
                <Languages className="h-4 w-4 text-gray-600" />
                <div className="text-left flex-1">
                  <p className="text-sm md:text-base font-semibold text-gray-800 truncate">
                    {language === 'tr' ? texts[language].turkish : texts[language].english}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="right" className="w-40">
              <DropdownMenuItem
                onClick={() => setLanguage('tr')}
                className={`text-sm md:text-base ${language === 'tr' ? 'bg-gray-100' : ''}`}
              >
                🇹🇷 {texts[language].turkish}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLanguage('en')}
                className={`text-sm md:text-base ${language === 'en' ? 'bg-gray-100' : ''}`}
              >
                🇬🇧 {texts[language].english}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    <RenameChatDialog 
        session={renameSession}
        isOpen={!!renameSession}
        onClose={() => setRenameSession(null)}
      />
    </aside>
  );
}