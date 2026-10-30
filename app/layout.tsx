import type { Metadata, Viewport } from 'next';
import '../src/index.css';

export const viewport: Viewport = {
  themeColor: '#0B0F19',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'KickPredict 192h - Pronostici Calcio HT & Over',
  description:
    'PWA responsive per smartphone con analisi e pronostici calcistici sulle 192 ore (Top 4 Leghe): Over 1.5 1° Tempo, Combo HT + Over 2.5 HT, Schedina Cinquina stampabile e Risultato Esatto con metriche xG.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'KickPredict',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/pwa-192x192.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className="dark">
      <body className="bg-[#0B0F19] text-slate-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-300">
        {children}
      </body>
    </html>
  );
}
