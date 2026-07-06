'use client';

import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

export default function PWARegistration() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // 1. Service Worker Registration
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('PWA Service Worker registered with scope: ', registration.scope);
          })
          .catch((err) => {
            console.warn('PWA Service Worker registration failed: ', err);
          });
      });
    }

    // 2. Custom App Install Prompt trigger listener
    const saveInstallPrompt = (e: Event) => {
      e.preventDefault();
      // Store the event so it can be triggered later.
      setDeferredPrompt(e);
      // Show the install promotion banner
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', saveInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', saveInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    // Show the browser install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA install prompt outcome: ${outcome}`);
    // We no longer need the prompt. Clear it
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="w-full bg-gold-600/10 border-b border-gold-600/20 text-slate-100 py-3 px-4 md:px-8 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 z-[999] relative animate-slide-in">
      <div className="flex items-center space-x-2.5 text-center sm:text-left">
        <Download className="h-4 w-4 text-gold-600 animate-bounce shrink-0 hidden sm:block" />
        <span className="font-semibold tracking-wide">
          Experience <strong className="text-gold-600 font-bold">Capital Gold</strong> as an app: get instant offline gold valuations, live spot rates, and rapid branch bookings!
        </span>
      </div>
      <div className="flex items-center space-x-3 shrink-0">
        <button
          onClick={handleInstallApp}
          className="px-4 py-1.5 bg-gold-600 hover:bg-gold-500 text-black font-extrabold rounded text-[10px] uppercase tracking-wider transition-all duration-300 btn-gold-glow shadow-md"
        >
          Install App
        </button>
        <button
          onClick={() => setShowBanner(false)}
          className="text-gray-400 hover:text-white p-1 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
