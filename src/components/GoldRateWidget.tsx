'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Clock, ArrowUpRight, TrendingUp } from 'lucide-react';

interface GoldRate {
  id: string;
  metal: string;
  purity: string;
  ratePerGram: number;
  ratePerTola: number;
  updatedAt: string;
}

export default function GoldRateWidget() {
  const [rates, setRates] = useState<GoldRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/rates');
      if (res.ok) {
        const data = await res.json();
        // filter only published rates
        const published = data.filter((r: any) => r.isPublished);
        setRates(published);
        setLastUpdated(new Date());
      }
    } catch (e) {
      console.error('Failed to fetch rates:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
    // Poll every 5 minutes
    const interval = setInterval(fetchRates, 300000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="w-full glass rounded-xl p-6 border border-gold-600/20 relative overflow-hidden">
      {/* Glow decorative bubble */}
      <div className="absolute top-0 right-0 h-32 w-32 bg-gold-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between border-b border-gold-600/10 pb-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-gold-600 animate-float" />
            <span>Live Precious Metal Rates</span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">Real-time spot market pricing</p>
        </div>
        <button
          onClick={fetchRates}
          disabled={loading}
          className="p-2 rounded bg-charcoal-800 hover:bg-gold-600 hover:text-black transition-all duration-300 text-gold-600 focus:outline-none"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        /* Shimmer Loading Skeletons */
        <div className="space-y-3 py-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 w-full animate-shimmer-bg rounded border border-gray-800" />
          ))}
        </div>
      ) : (
        /* Rates Table */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-850">
                <th className="py-2.5">Metal & Purity</th>
                <th className="py-2.5 text-right">Per Gram</th>
                <th className="py-2.5 text-right">Per Tola (11.66g)</th>
                <th className="py-2.5 text-right">Trend</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((rate) => (
                <tr
                  key={rate.id}
                  className="border-b border-gray-800 hover:bg-gold-600/5 transition-colors font-medium text-white"
                >
                  <td className="py-3.5 flex items-center space-x-2">
                    <span className="h-2 w-2 rounded-full bg-gold-600" />
                    <span>
                      {rate.metal} ({rate.purity})
                    </span>
                  </td>
                  <td className="py-3.5 text-right font-mono text-gold-200">
                    ₹{rate.ratePerGram.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 text-right font-mono text-gray-300">
                    ₹{rate.ratePerTola.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 text-right">
                    <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded bg-green-500/10 text-green-400">
                      <ArrowUpRight className="h-3 w-3 mr-0.5" />
                      +0.14%
                    </span>
                  </td>
                </tr>
              ))}
              {rates.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-500">
                    No active rates found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Timestamp */}
      {lastUpdated && (
        <div className="flex items-center text-[10px] text-gray-500 mt-4 justify-end space-x-1">
          <Clock className="h-3.5 w-3.5" />
          <span>Last synchronized: {formatDate(lastUpdated)}</span>
        </div>
      )}
    </div>
  );
}
