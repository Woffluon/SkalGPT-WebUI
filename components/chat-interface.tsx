'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '@/lib/store';

import { Sidebar } from './sidebar';
import { ChatArea } from './chat-area';
import { ChatInput } from './chat-input';
import { TopBar } from './top-bar';

export function ChatInterface() {
  const { 
    isSidebarOpen,
    toggleSidebar,
  } = useChatStore();


  // This effect now correctly handles toggling based on screen size changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    
    const handleResize = () => {
      const shouldBeOpen = mediaQuery.matches;
      const isCurrentlyOpen = useChatStore.getState().isSidebarOpen;
      if (shouldBeOpen !== isCurrentlyOpen) {
        toggleSidebar();
      }
    };

    mediaQuery.addEventListener('change', handleResize);
    handleResize(); // Initial check on component mount

    return () => mediaQuery.removeEventListener('change', handleResize);
  }, [toggleSidebar]);

  return (
    <div className="relative h-screen w-full bg-background dark:bg-background flex">
      {/* --- DESKTOP SIDEBAR --- */}
      <motion.div
        className="hidden lg:block overflow-hidden"
        animate={{ width: isSidebarOpen ? 320 : 0 }}
        initial={false}
        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
      >
        <div className="lg:w-80 h-full">
          <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        </div>
      </motion.div>

      {/* --- MOBILE SIDEBAR (OVERLAY) --- */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
              onClick={toggleSidebar} // Closes the sidebar
            />
            {/* Sidebar Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 h-full z-50 lg:hidden"
            >
              <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col min-h-0">
        <TopBar />
        <div className="flex-1 flex flex-col min-h-0 relative">
          <ChatArea />
          <ChatInput />
        </div>
      </main>
    </div>
  );
}