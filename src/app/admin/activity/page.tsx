'use client';

import React, { useState, useEffect } from 'react';
import { FileClock, User, Clock, AlertCircle, RefreshCw } from 'lucide-react';

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/activity');
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const parseLogLine = (line: string) => {
    // Format: [timestamp] userEmail | action | details
    const match = line.match(/^\[(.*?)\] (.*?) \| (.*?) \| (.*)$/);
    if (match) {
      return {
        timestamp: match[1],
        user: match[2],
        action: match[3],
        details: match[4],
      };
    }
    
    // Fallback split
    const parts = line.split('|');
    return {
      timestamp: parts[0] ? parts[0].replace(/[\[\]]/g, '').trim() : '',
      user: parts[0] ? 'System' : '',
      action: parts[1] ? parts[1].trim() : 'LOG',
      details: parts[2] ? parts[2].trim() : line,
    };
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-gold-600/10 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white uppercase tracking-wider">System Activity Logs</h1>
          <p className="text-xs text-gray-400 mt-0.5">Audit trail of administrator actions</p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-charcoal-900 border border-gold-600/20 rounded text-xs font-semibold text-gold-600 hover:bg-gold-600 hover:text-black transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Logs Table */}
      <div className="glass rounded-xl border border-gold-600/10 overflow-hidden">
        {loading ? (
          <div className="p-12 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-full animate-shimmer-bg rounded" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-charcoal-900 border-b border-gold-600/10 text-gray-400 font-bold uppercase tracking-wider">
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">Audit Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((line, idx) => {
                  const log = parseLogLine(line);
                  return (
                    <tr key={idx} className="border-b border-gray-850 hover:bg-gold-600/5 transition-colors">
                      <td className="p-3.5 whitespace-nowrap text-gray-450 font-mono">
                        <span className="flex items-center">
                          <Clock className="h-3.5 w-3.5 text-gold-600 mr-1.5" />
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </td>
                      <td className="p-3.5 text-white font-bold whitespace-nowrap">
                        <span className="flex items-center">
                          <User className="h-3.5 w-3.5 text-gold-600 mr-1.5" />
                          {log.user}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-charcoal-950 text-gold-600 font-semibold border border-gold-600/20 uppercase text-[9px] tracking-wider">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3.5 text-gray-400 leading-relaxed max-w-md truncate" title={log.details}>
                        {log.details}
                      </td>
                    </tr>
                  );
                })}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-10 text-center text-gray-500">
                      No admin actions logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
