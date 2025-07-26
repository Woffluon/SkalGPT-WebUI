'use client';

import { Logo } from "./logo";

export function WelcomeMessage() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center px-4">
      <div className="mb-6">
        <Logo size={100} />
      </div>
      <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-6">
        SkalGPT&apos;ye Hoş Geldiniz
      </h2>
      <p className="text-lg text-gray-600 max-w-2xl leading-relaxed mb-8">
        Bu yapay zeka asistanı, Sezai Karakoç Anadolu Lisesi için özel olarak tasarlanmıştır. Dersler, ödevler ve okul hakkında merak ettiğiniz her şeyi sorabilirsiniz.
      </p>
      <p className="text-xl font-medium text-gray-800 mb-2">
        Bugün size nasıl yardımcı olabilirim?
      </p>
      <p className="text-base text-gray-500 max-w-2xl leading-relaxed">
        Merak ettiğiniz her şeyi sormaktan çekinmeyin. Ödevler, ders notları veya okul hakkında bilgi almak için buradayım.
      </p>
      <p className="text-sm text-gray-400 mt-8">
        SkalGPT, Sezai Karakoç Anadolu Lisesi&apos;nin bilgi birikimiyle donatıldı.
      </p>
    </div>
  );
} 