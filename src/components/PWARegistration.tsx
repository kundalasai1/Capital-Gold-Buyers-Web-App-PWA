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
    <div className="fixed bottom-24 left-6 right-6 md:left-6 md:right-auto md:w-[360px] z-50 glass border border-gold-600/30 rounded-lg p-4 shadow-2xl flex items-center justify-between animate-slide-in max-w-[calc(100vw-3rem)]">
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 bg-gold-600/10 rounded-full flex items-center justify-center border border-gold-600/25 shrink-0">
          <Download className="h-5 w-5 text-gold-600 animate-bounce" />
        </div>
        <div className="text-xs">
          <p className="font-bold text-white">Install Web App</p>
          <p className="text-gray-400 text-[10px]">Access live gold rates offline & book visits instantly.</p>
        </div>
      </div>
      <div className="flex items-center space-x-2 shrink-0 ml-3">
        <button
          onClick={handleInstallApp}
          className="px-3.5 py-1.5 bg-gold-600 hover:bg-gold-500 text-black font-bold rounded text-[10px] uppercase tracking-wider transition-colors"
        >
          Install
        </button>
        <button
          onClick={() => setShowBanner(false)}
          className="text-gray-400 hover:text-white p-1"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>
    </div>
  );
}
