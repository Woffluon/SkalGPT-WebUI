'use client';

import { Logo } from "./logo";

export function WelcomeMessage() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="mb-4">
        <Logo size={80} />
      </div>
      <h2 className="text-2xl font-semibold text-foreground">
        SkalGPT&apos;ye Hoş Geldiniz
      </h2>
      <p className="mt-2 max-w-md text-muted-foreground">
        Bu yapay zeka asistanı, Sezai Karakoç Anadolu Lisesi için özel olarak tasarlanmıştır. Dersler, ödevler ve okul hakkında merak ettiğiniz her şeyi sorabilirsiniz.
      </p>
      <p className="text-center text-lg text-slate-600">
        Bugün sana nasıl yardımcı olabilirim? Merak ettiğin her şeyi sorabilirsin.
      </p>
      <p className="text-center text-sm text-slate-500 mt-4">
        SkalGPT, Sezai Karakoç Anadolu Lisesi&apos;nin bilgi birikimiyle donatıldı.
      </p>
    </div>
  );
} 