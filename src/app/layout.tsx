import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CallAgentWidget from '@/components/CallAgentWidget';
import PWARegistration from '@/components/PWARegistration';

export const metadata: Metadata = {
  title: 'Capital Gold Buyers | High Payout Gold & Silver Buyers',
  description: 'Convert your gold, silver, and jewelry into instant cash. Capital Gold Buyers offers certified assaying, transparent weighing, and the highest market payouts.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Capital Gold Buyers',
  },
};

export const viewport: Viewport = {
  themeColor: '#070a10',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="flex flex-col min-h-screen bg-charcoal-950 text-slate-100">
        <Navbar />
        <main className="flex-grow pb-16 md:pb-0">
          {children}
        </main>
        <Footer />
        <CallAgentWidget />
        <PWARegistration />
      </body>
    </html>
  );
}
