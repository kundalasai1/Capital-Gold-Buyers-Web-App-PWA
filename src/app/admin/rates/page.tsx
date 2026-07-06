'use client';

import React, { useState, useEffect } from 'react';
import {
  Coins,
  RefreshCw,
  TrendingUp,
  FileText,
  Clock,
  User,
  CheckCircle,
  AlertTriangle,
  History,
} from 'lucide-react';

interface GoldRate {
  id: string;
  metal: string;
  purity: string;
  ratePerGram: number;
  ratePerTola: number;
  isPublished: boolean;
  updatedAt: string;
  updatedBy: string;
}

interface ChangeLog {
  id: string;
  rateId: string;
  previousValue: number;
  newValue: number;
  changedBy: string;
  changedAt: string;
  rate: { metal: string; purity: string };
}

export default function RatesAdminPage() {
  const [rates, setRates] = useState<GoldRate[]>([]);
  const [logs, setLogs] = useState<ChangeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Manual update inputs
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRateGram, setEditRateGram] = useState('');
  const [editPublished, setEditPublished] = useState(true);

  // States
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [ratesRes, logsRes] = await Promise.all([
        fetch('/api/rates'),
        // Fetch logs by creating an api route or fetching logs.
        // Wait, do we have an api/rates/logs? Let's check: we can fetch logs directly in the GET endpoint or we can return them together in GET /api/rates.
        // Let's modify api/rates/route.ts to return rate changelogs if admin requests it! That is highly efficient!
        // For now, let's create a separate fetch or query database. If we request it, let's check: did we write a log endpoint?
        // Let's create an endpoint GET /api/rates/logs or include it in api/rates. Let's create a quick API GET /api/rates/logs.
        // That is very clean. Let's look at how we can load logs.
        fetch('/api/rates/logs'),
      ]);

      if (ratesRes.ok) {
        const data = await ratesRes.json();
        setRates(data);
      }

      if (logsRes.ok) {
        const data = await logsRes.json();
        setLogs(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 1. Trigger manual save
  const handleSaveRate = async (id: string) => {
    setErrorMsg('');
    setSaveSuccess(false);

    const val = parseFloat(editRateGram);
    if (isNaN(val) || val <= 0) {
      setErrorMsg('Please enter a valid rate value');
      return;
    }

    try {
      const res = await fetch('/api/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          ratePerGram: val,
          isPublished: editPublished,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setEditingId(null);
        loadData(); // reload rates & logs
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to update rate');
      }
    } catch (err) {
      setErrorMsg('Failed to connect to server');
    }
  };

  // 2. Trigger Market API Sync
  const handleMarketSync = async () => {
    setSyncing(true);
    setErrorMsg('');
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/rates/sync', { method: 'POST' });
      if (res.ok) {
        setSaveSuccess(true);
        loadData();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to sync rates');
      }
    } catch (e) {
      setErrorMsg('Connection error during sync');
    } finally {
      setSyncing(false);
    }
  };

  const handleEditClick = (rate: GoldRate) => {
    setEditingId(rate.id);
    setEditRateGram(rate.ratePerGram.toString());
    setEditPublished(rate.isPublished);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-gold-600/10 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white uppercase tracking-wider">Spot Rate Management</h1>
          <p className="text-xs text-gray-400 mt-0.5">Control public pricing feeds and sync spot rates</p>
        </div>
        <button
          onClick={handleMarketSync}
          disabled={syncing}
          className="flex items-center space-x-1.5 px-4 py-2 bg-gold-600 hover:bg-gold-500 text-black font-bold text-xs uppercase tracking-wider rounded transition-colors shadow-lg btn-gold-glow"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Syncing...' : 'Sync with Market API'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-green-500/10 border border-green-500/25 rounded text-green-400 text-xs flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span>Rates updated and logged successfully!</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded flex items-center space-x-2 text-xs text-red-400">
          <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Overwrite Forms */}
        <div className="lg:col-span-7 glass border border-gold-600/10 rounded-xl overflow-hidden">
          <div className="bg-charcoal-900 border-b border-gold-600/10 p-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center">
              <Coins className="h-4.5 w-4.5 mr-2 text-gold-600" />
              Manual Rate Entries
            </h2>
          </div>

          {loading ? (
            <div className="p-8 space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-10 w-full animate-shimmer-bg rounded" />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-gray-850">
              {rates.map((rate) => (
                <div key={rate.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <p className="font-bold text-white uppercase tracking-wide">
                      {rate.metal} ({rate.purity})
                    </p>
                    <p className="text-[10px] text-gray-500">
                      Current: <strong>₹{rate.ratePerGram.toLocaleString('en-IN', { minimumFractionDigits: 2 })}/g</strong> | <strong>₹{rate.ratePerTola.toLocaleString('en-IN', { minimumFractionDigits: 2 })}/tola</strong>
                    </p>
                    <p className="text-[9px] text-gray-500">
                      Status: <span className={rate.isPublished ? 'text-green-400 font-bold' : 'text-red-400'}>
                        {rate.isPublished ? 'Published' : 'Hidden'}
                      </span>
                    </p>
                  </div>

                  {editingId === rate.id ? (
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col space-y-1">
                        <input
                          type="number"
                          step="any"
                          value={editRateGram}
                          onChange={(e) => setEditRateGram(e.target.value)}
                          className="w-24 bg-charcoal-950 border border-gray-850 rounded px-2.5 py-1.5 text-white focus:outline-none"
                        />
                        <label className="flex items-center space-x-1 text-[10px] text-gray-400">
                          <input
                            type="checkbox"
                            checked={editPublished}
                            onChange={(e) => setEditPublished(e.target.checked)}
                            className="rounded border-gray-800 text-gold-600 focus:ring-0 focus:ring-offset-0"
                          />
                          <span>Publish</span>
                        </label>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleSaveRate(rate.id)}
                          className="px-3 py-1 bg-gold-600 hover:bg-gold-500 text-black font-bold rounded text-[10px] uppercase transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 bg-charcoal-900 border border-gray-800 text-gray-400 hover:text-white rounded text-[10px] uppercase transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEditClick(rate)}
                      className="px-4 py-2 border border-gold-600/30 text-gold-600 hover:bg-gold-600 hover:text-black rounded font-bold transition-all"
                    >
                      Update Rate
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Audit Log Table */}
        <div className="lg:col-span-5 glass border border-gold-600/10 rounded-xl overflow-hidden">
          <div className="bg-charcoal-900 border-b border-gold-600/10 p-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center">
              <History className="h-4.5 w-4.5 mr-2 text-gold-600" />
              Audit Change Log History
            </h2>
          </div>

          <div className="p-4 space-y-4 max-h-[360px] overflow-y-auto pr-1">
            {logs.map((log) => (
              <div key={log.id} className="bg-charcoal-950 p-3 rounded border border-gray-850 space-y-2 text-[11px]">
                <div className="flex items-center justify-between text-white font-bold uppercase tracking-wider">
                  <span>{log.rate.metal} ({log.rate.purity})</span>
                  <span className="text-gold-600">Rate Change</span>
                </div>
                <p className="text-gray-400">
                  Valuation shifted from <strong>₹{log.previousValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong> to{' '}
                  <strong className="text-gold-200">₹{log.newValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong> per gram.
                </p>
                <div className="flex items-center justify-between text-[9px] text-gray-500 pt-1 border-t border-gray-900">
                  <span className="flex items-center">
                    <User className="h-3 w-3 mr-1 text-gold-600" />
                    {log.changedBy}
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1 text-gold-600" />
                    {new Date(log.changedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
            {logs.length === 0 && (
              <p className="text-center text-xs text-gray-500 py-10">No audits recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
