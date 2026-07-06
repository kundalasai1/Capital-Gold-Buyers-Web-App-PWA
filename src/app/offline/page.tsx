'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, AlertCircle, Coins, Clock } from 'lucide-react';

interface GoldRate {
  id: string;
  metal: string;
  purity: string;
  ratePerGram: number;
  ratePerTola: number;
}

export default function OfflinePage() {
  const [cachedRates, setCachedRates] = useState<GoldRate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Attempt to load rates. Since Service Worker caches /api/rates,
    // fetch will retrieve the cached data even when offline!
    fetch('/api/rates')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to load rates');
      })
      .then((data: GoldRate[]) => {
        setCachedRates(data.filter((r: any) => r.isPublished));
      })
      .catch((err) => console.log('Rates unavailable offline:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center space-y-8 animate-slide-in">
      <div className="h-16 w-16 bg-red-500/10 border border-red-500/25 rounded-full flex items-center justify-center mx-auto">
        <WifiOff className="h-8 w-8 text-red-400" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-white">Connection Lost</h1>
        <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
          It looks like you are currently offline. Please check your network connection and click retry to reload the page.
        </p>
      </div>

      <button
        onClick={handleRetry}
        className="inline-flex items-center space-x-2 px-6 py-2.5 rounded bg-gold-600 hover:bg-gold-500 text-black font-bold text-xs uppercase tracking-wider transition-colors shadow-lg btn-gold-glow"
      >
        <RefreshCw className="h-4 w-4" />
        <span>Retry Connection</span>
      </button>

      {/* OFFLINE RATES CACHE BOX */}
      <div className="glass border border-gold-600/15 rounded-xl p-5 text-left space-y-4">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between border-b border-gold-600/10 pb-2">
          <span className="flex items-center">
            <Coins className="h-4 w-4 mr-1.5 text-gold-600" />
            Last Known Spot Rates
          </span>
          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[8px] font-bold uppercase tracking-widest border border-amber-500/20">
            Offline Cache
          </span>
        </h2>

        {loading ? (
          <div className="space-y-2.5">
            <div className="h-8 w-full animate-shimmer-bg rounded" />
            <div className="h-8 w-full animate-shimmer-bg rounded" />
          </div>
        ) : cachedRates.length > 0 ? (
          <div className="space-y-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-gray-500 font-bold uppercase tracking-wider">
                  <th>Metal</th>
                  <th className="text-right">Per Gram</th>
                  <th className="text-right">Per Tola</th>
                </tr>
              </thead>
              <tbody>
                {cachedRates.map((rate) => (
                  <tr key={rate.id} className="border-b border-gray-850 text-white font-medium">
                    <td className="py-2.5">
                      {rate.metal} ({rate.purity})
                    </td>
                    <td className="py-2.5 text-right font-mono text-gold-200">
                      ₹{rate.ratePerGram.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 text-right font-mono text-gray-300">
                      ₹{rate.ratePerTola.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[9px] text-gray-500 flex items-center justify-end pt-2">
              <Clock className="h-3 w-3 mr-1 text-gold-600" />
              Served from browser cache. Actual valuation rates will refresh once online.
            </p>
          </div>
        ) : (
          <p className="text-center text-xs text-gray-500 py-4">
            No cached rate data is currently stored on this device.
          </p>
        )}
      </div>

      <div className="p-3 bg-charcoal-900/60 rounded border border-gold-600/10 flex items-start space-x-2 text-[10px] text-left text-gray-500 leading-relaxed">
        <AlertCircle className="h-4.5 w-4.5 text-amber-500 shrink-0" />
        <span>
          Note: Online booking, gold calculation submissions, and live calling features are disabled while offline. These actions require a live network connection to verify server schedules.
        </span>
      </div>
    </div>
  );
}
