import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  icons: {
    icon: '/favicon.png',
  },
  metadataBase: new URL('https://skalgpt.vercel.app'),
  title: 'SkalGPT - Eğitimde Yapay Zeka Devrimi | Sezai Karakoç Anadolu Lisesi',
  description: 'SkalGPT, Sezai Karakoç Anadolu Lisesi için özel geliştirilmiş yapay zeka destekli eğitim asistanıdır. Öğrenciler, öğretmenler ve idare için kişiselleştirilmiş destek.',
  keywords: 'SkalGPT, yapay zeka, eğitim, AI, Sezai Karakoç Anadolu Lisesi, öğretim asistanı',
  authors: [{ name: 'SkalGPT Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'SkalGPT - Eğitimde Yapay Zeka Devrimi',
    description: 'Okulunuza özel tasarlanmış AI destekli eğitim asistanı',
    type: 'website',
    locale: 'tr_TR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SkalGPT - Eğitimde Yapay Zeka Devrimi',
    description: 'Okulunuza özel tasarlanmış AI destekli eğitim asistanı',
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} ${montserrat.variable} font-sans antialiased`}>
        <ThemeProvider defaultTheme="light" storageKey="skalgpt-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}