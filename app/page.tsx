'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        router.replace('/chat');
      } else {
        router.replace('/auth/login');
      }
    };

    checkUserAndRedirect();
  }, [router]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-100 text-gray-800">
      <div className="flex items-center space-x-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-t-transparent"></div>
        <p className="text-lg font-semibold">Yönlendiriliyor...</p>
      </div>
      <p className="mt-4 text-sm text-gray-400">Lütfen bekleyin, sayfa yükleniyor.</p>
    </div>
  );
}