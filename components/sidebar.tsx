'use client';

import { motion } from 'framer-motion';
import { MessageSquare, Trash2, Plus, User, LogOut, Languages, X, Search, MoreHorizontal, Pencil, Moon, Sun } from 'lucide-react';
import { useTheme } from './theme-provider';
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
import React, { useEffect, useState, useRef } from 'react';
import { useChatStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

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
  const [displayedSessionCount, setDisplayedSessionCount] = useState(10);
   const [renameSession, setRenameSession] = useState<ChatSession | null>(null);
   const [hasMoreSessions, setHasMoreSessions] = useState(true);
   const isInitialLoadDone = useRef(false);
   const [isLoadMoreClicked, setIsLoadMoreClicked] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
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
    startNewConversation,
    isLoading,
    sessionsFetched,
    fetchSessions
  } = useChatStore();

  useEffect(() => {
     // Oturumlar zaten yüklenmişse ve sessionsFetched true ise, sadece hasMore durumunu güncelle
     if (sessionsFetched && !isInitialLoadDone.current) {
       // Mevcut oturum sayısını ve toplam sayıyı kontrol et
       const currentCount = sessions.length;
       // Eğer daha fazla oturum varsa (toplam sayı > mevcut sayı), hasMore'u true olarak ayarla
       setHasMoreSessions(currentCount >= 10); // Eğer en az 10 oturum varsa, muhtemelen daha fazlası vardır
       isInitialLoadDone.current = true;
     }
     // Oturumlar henüz yüklenmemişse, ChatPage bileşeni bunları yükleyecektir
     // Bu nedenle burada tekrar fetchSessions çağrısı yapmıyoruz
   }, [sessionsFetched, sessions.length])

   useEffect(() => {
      if (isLoadMoreClicked) {
        const loadMoreSessions = async () => {
          const moreSessions = await fetchSessions(displayedSessionCount, 5);
          setDisplayedSessionCount(prevCount => prevCount + 5);
          setHasMoreSessions(moreSessions);
        };
        loadMoreSessions();
        setIsLoadMoreClicked(false);
      }
    }, [isLoadMoreClicked, displayedSessionCount]);

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
      english: 'English',
      light: 'Açık Tema',
      dark: 'Koyu Tema',

      theme: 'Tema',
      rename: 'Yeniden Adlandır',
      delete: 'Sohbeti Sil',
      loadingSessions: 'Sohbetler yükleniyor...',
      loadMore: 'Daha Fazla Yükle',
      noMoreSessions: 'Daha fazla sohbet yok.'
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
      english: 'English',
      light: 'Light Theme',
      dark: 'Dark Theme',

      theme: 'Theme',
      rename: 'Rename',
      delete: 'Delete Chat',
      loadingSessions: 'Loading chats...',
      loadMore: 'Load More',
      noMoreSessions: 'No more chats.'
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
  ).slice(0, displayedSessionCount);



  const handleLoadMore = async () => {
      setIsLoadMoreClicked(true);
    };

  const groupedSessions = groupSessionsByDate(filteredSessions);


  const renderSessionGroup = (groupKey: string, groupSessions: ChatSession[]) => {
    if (groupSessions.length === 0) return null;

    return (
      <div key={groupKey} className="mb-4 md:mb-6">
        <h3 className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wider px-3 md:px-5 mb-2 md:mb-3">
          {texts[language][groupKey as keyof typeof texts.tr]} ({groupSessions.length})
        </h3>
        <div className="space-y-1 md:space-y-2">
          {groupSessions.map((session) => (
            <div
              key={session.id}
              className={`group relative p-3 md:p-4 rounded-xl cursor-pointer transition-all duration-200 h-[76px] flex flex-col justify-center ${
                currentSession?.id === session.id
                  ? 'bg-accent border border-border shadow-sm dark:bg-accent dark:border-border'
                  : 'hover:bg-secondary border border-transparent dark:hover:bg-secondary'
              }`}
              onClick={() => {
                  setCurrentSession(session);
                  router.push(`/chat/${session.id}`);
                  // Removed automatic sidebar closing on mobile after selection
                  // if (window.innerWidth < 768) {
                  //   toggleSidebar();
                  // }
                }}
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm ${
                  currentSession?.id === session.id 
                    ? 'bg-gradient-to-r from-[#F3904F] to-[#3B4371]' 
                    : 'bg-muted'
                }`}>
                  <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <div className="w-0 flex-1 min-w-0 overflow-hidden pr-8">
                  <p className="text-sm md:text-base font-medium text-foreground truncate">
                    {session.isGeneratingTitle ? (
                      <span className="animate-pulse">...</span>
                  ) : (
                    session.title
                  )}
                  </p>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(session.created_at), { addSuffix: true, locale })}
          </p>
                </div>
              </div>

              <DropdownMenu>
            {/* Loading animation for individual chat sessions if needed */}
            {session.isGeneratingTitle && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              </div>
            )}
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 h-7 w-7 rounded-full transition-opacity data-[state=open]:opacity-100 @[media(hover:none)]:opacity-100 @[media(hover:hover)]:opacity-0 @[media(hover:hover)]:group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
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
                    <span>{texts[language].rename}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-500 dark:text-red-400 focus:text-red-500 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/50"
                    onClick={() => deleteSession(session.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>{texts[language].delete}</span>
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
      <div className="sidebar-card relative flex-1 flex flex-col min-h-0 bg-card rounded-2xl shadow-xl border border-border dark:bg-card dark:border-border">

        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-border dark:border-border">
          <Button 
            className="w-full h-10 rounded-xl bg-gradient-to-r from-[#F3904F] to-[#3B4371] text-white font-semibold shadow transition-all text-sm md:text-base flex items-center gap-2 justify-center px-4 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gradient-to-r hover:from-[#F3904F] hover:to-[#3B4371]"
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
            className="h-9 w-9 rounded-full md:hidden hover:bg-transparent"
          >
            <X className="h-5 w-5 text-gray-500" />
          </Button>
        </div>

        {/* Search Input */}
        <div className="px-4 pt-3 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={texts[language].searchChats}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-full bg-background border-border pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all dark:bg-background dark:border-border"
            />
          </div>
        </div>

        {/* Sohbet Geçmişi */}
        <ScrollArea className="flex-1 -mx-2 px-2">
          <div className="p-2">
            {isLoading && !sessionsFetched ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-10 absolute inset-0">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                <p>{texts[language].loadingSessions}</p>
              </div>
            ) : (
              <>
                {Object.entries(groupedSessions).map(([groupKey, sessions]) =>
                  renderSessionGroup(groupKey, sessions)
                )}
                {hasMoreSessions && filteredSessions.length > 0 ? (
                  <div className="flex justify-center mt-4 shadow-md rounded-md">
                    <Button onClick={handleLoadMore} variant="secondary" className="w-full">
                      {texts[language].loadMore}
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-center mt-4 text-muted-foreground text-sm">
                    {texts[language].noMoreSessions}
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
        <div className="mt-auto p-4 border-t border-border dark:border-border">
          {/* Kullanıcı Bilgisi ve Çıkış */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start items-center gap-3 p-3 h-auto">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  {user?.user_metadata?.name ? user.user_metadata.name[0] : <User className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm md:text-base font-semibold text-foreground truncate">
                    {user?.user_metadata?.name} {user?.user_metadata?.surname}
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground">{user?.email}</p>
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

          {/* Tema Seçimi */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start items-center gap-3 p-3 h-auto"
              >
                {theme === 'dark' ? (
                  <Moon className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Sun className="h-4 w-4 text-muted-foreground" />
                )}
                <div className="text-left flex-1">
                  <p className="text-sm md:text-base font-semibold text-foreground truncate">
                    {texts[language].theme}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" side="top" className="w-48">
              <DropdownMenuItem
                onClick={() => setTheme('light')}
                className={`text-sm md:text-base ${theme === 'light' ? 'bg-accent' : ''}`}
              >
                <Sun className="mr-2 h-4 w-4" />
                {texts[language].light}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme('dark')}
                className={`text-sm md:text-base ${theme === 'dark' ? 'bg-accent' : ''}`}
              >
                <Moon className="mr-2 h-4 w-4" />
                {texts[language].dark}
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
                <Languages className="h-4 w-4 text-muted-foreground" />
                <div className="text-left flex-1">
                  <p className="text-sm md:text-base font-semibold text-foreground truncate">
                    {language === 'tr' ? texts[language].turkish : texts[language].english}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" side="top" className="w-40">
              <DropdownMenuItem
                onClick={() => setLanguage('tr')}
                className={`text-sm md:text-base ${language === 'tr' ? 'bg-accent' : ''}`}
              >
                🇹🇷 {texts[language].turkish}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLanguage('en')}
                className={`text-sm md:text-base ${language === 'en' ? 'bg-accent' : ''}`}
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