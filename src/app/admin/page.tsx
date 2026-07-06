'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  PhoneCall,
  TrendingUp,
  BarChart3,
  Globe,
  Smartphone,
  Monitor,
  ArrowRight,
  TrendingDown,
  RefreshCw,
} from 'lucide-react';

interface AnalyticsData {
  summary: {
    totalLeads: number;
    totalAppointments: number;
    totalCalls: number;
  };
  leads: {
    byStatus: Record<string, number>;
    bySource: Record<string, number>;
  };
  appointments: {
    byStatus: Record<string, number>;
  };
  branches: Array<{
    branchId: string;
    branchName: string;
    leadsCount: number;
    appointmentsCount: number;
  }>;
  calls: {
    totalCalls: number;
    byType: Record<string, number>;
    byOutcome: Record<string, number>;
    averageDurationSeconds: number;
  };
  website: {
    totalVisitors: number;
    uniqueVisitors: number;
    pageViews: number;
    bounceRatePercent: number;
    trafficSources: Array<{ name: string; value: number }>;
    deviceBreakdown: Array<{ name: string; value: number }>;
  };
  trends: Array<{ month: string; leads: number; appointments: number }>;
}

export default function AnalyticsDashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error('Error fetching analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-gold-600/10 pb-4">
          <h1 className="text-xl font-bold text-white uppercase tracking-wider">Dashboard Analytics</h1>
          <div className="h-6 w-24 animate-shimmer-bg rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-shimmer-bg rounded-xl border border-gray-800" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
          <div className="h-80 animate-shimmer-bg rounded-xl border border-gray-800" />
          <div className="h-80 animate-shimmer-bg rounded-xl border border-gray-800" />
        </div>
      </div>
    );
  }

  // Find max value in trends for scale
  const maxTrendLeads = Math.max(...data.trends.map((t) => t.leads), 10);
  const maxBranchLeads = Math.max(...data.branches.map((b) => b.leadsCount), 10);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gold-600/10 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white uppercase tracking-wider">Operational Analytics</h1>
          <p className="text-xs text-gray-400 mt-0.5">Real-time performance metrics</p>
        </div>
        <button
          onClick={loadAnalytics}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-charcoal-900 border border-gold-600/20 rounded text-xs font-semibold text-gold-600 hover:bg-gold-600 hover:text-black transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 1. OVERVIEW SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Leads */}
        <div className="glass p-5 rounded-xl border border-gold-600/10 flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Total Active Leads</p>
            <p className="text-3xl font-extrabold text-white">{data.summary.totalLeads}</p>
            <div className="text-[10px] text-green-400 font-semibold flex items-center">
              <TrendingUp className="h-3.5 w-3.5 mr-0.5" />
              <span>+18.4% monthly growth</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-lg bg-gold-600/10 flex items-center justify-center border border-gold-600/20">
            <Users className="h-6 w-6 text-gold-600" />
          </div>
        </div>

        {/* Card 2: Appointments */}
        <div className="glass p-5 rounded-xl border border-gold-600/10 flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Total Bookings</p>
            <p className="text-3xl font-extrabold text-white">{data.summary.totalAppointments}</p>
            <div className="text-[10px] text-green-400 font-semibold flex items-center">
              <TrendingUp className="h-3.5 w-3.5 mr-0.5" />
              <span>+12.1% monthly bookings</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-lg bg-gold-600/10 flex items-center justify-center border border-gold-600/20">
            <Calendar className="h-6 w-6 text-gold-600" />
          </div>
        </div>

        {/* Card 3: Calls */}
        <div className="glass p-5 rounded-xl border border-gold-600/10 flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Agent Phone Connects</p>
            <p className="text-3xl font-extrabold text-white">{data.summary.totalCalls}</p>
            <div className="text-[10px] text-gold-600 font-semibold flex items-center">
              <span>Avg: {Math.round(data.calls.averageDurationSeconds / 60)} mins per call</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-lg bg-gold-600/10 flex items-center justify-center border border-gold-600/20">
            <PhoneCall className="h-6 w-6 text-gold-600" />
          </div>
        </div>
      </div>

      {/* 2. CHARTS GRID (Leads Monthly & Branch Performance) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trend Bar Chart */}
        <div className="glass p-6 rounded-xl border border-gold-600/10 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center">
              <BarChart3 className="h-4.5 w-4.5 mr-2 text-gold-600" />
              Monthly Lead Growth Trends
            </h3>
            <p className="text-[10px] text-gray-400">Leads versus completed bookings</p>
          </div>

          <div className="h-48 flex items-end justify-between px-2 pt-4 border-b border-gray-800">
            {data.trends.map((t) => {
              const leadsHeight = `${(t.leads / maxTrendLeads) * 100}%`;
              const apptsHeight = `${(t.appointments / maxTrendLeads) * 100}%`;
              return (
                <div key={t.month} className="flex flex-col items-center space-y-2 w-12">
                  <div className="w-full flex justify-center space-x-1 h-36 items-end">
                    <div
                      style={{ height: leadsHeight }}
                      className="w-3 rounded-t bg-gold-600 text-[9px] text-black font-extrabold flex justify-center items-start pt-1 hover:brightness-115 transition-all duration-300"
                      title={`Leads: ${t.leads}`}
                    />
                    <div
                      style={{ height: apptsHeight }}
                      className="w-3 rounded-t bg-charcoal-700 hover:brightness-115 transition-all duration-300"
                      title={`Bookings: ${t.appointments}`}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">{t.month}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center space-x-6 text-[10px]">
            <div className="flex items-center space-x-1">
              <span className="h-2 w-2 rounded-full bg-gold-600" />
              <span className="text-gray-400">Inquiries/Leads</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="h-2 w-2 rounded-full bg-charcoal-700" />
              <span className="text-gray-400">Booked Appts</span>
            </div>
          </div>
        </div>

        {/* Branch Workloads */}
        <div className="glass p-6 rounded-xl border border-gold-600/10 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center">
              <BarChart3 className="h-4.5 w-4.5 mr-2 text-gold-600" />
              Branch Workloads comparison
            </h3>
            <p className="text-[10px] text-gray-400">Leads generated per location</p>
          </div>

          <div className="space-y-4">
            {data.branches.map((b) => {
              const pct = `${(b.leadsCount / maxBranchLeads) * 100}%`;
              return (
                <div key={b.branchId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{b.branchName}</span>
                    <span className="text-gold-600 font-bold">{b.leadsCount} leads</span>
                  </div>
                  <div className="w-full h-3 bg-charcoal-900 rounded overflow-hidden">
                    <div
                      style={{ width: pct }}
                      className="h-full bg-gradient-to-r from-gold-900 to-gold-600 rounded"
                    />
                  </div>
                  <p className="text-[9px] text-gray-500">
                    Appointments booked: {b.appointmentsCount}
                  </p>
                </div>
              );
            })}
            {data.branches.length === 0 && (
              <p className="text-center text-xs text-gray-500 py-10">No active branches configured.</p>
            )}
          </div>
        </div>
      </div>

      {/* 3. WEBSITE & INQUIRY ANALYTICS (Device breakdowns & traffic sources) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device breakdown */}
        <div className="glass p-5 rounded-xl border border-gold-600/10 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-gold-600/10 pb-2 flex items-center justify-between">
            <span>Device Breakdown</span>
            <span className="text-[10px] text-gray-400">Web Traffic</span>
          </h3>
          <div className="space-y-3.5">
            {data.website.deviceBreakdown.map((dev) => (
              <div key={dev.name} className="flex items-center justify-between text-xs">
                <span className="text-gray-400 flex items-center">
                  {dev.name.toLowerCase() === 'mobile' ? (
                    <Smartphone className="h-4 w-4 mr-2 text-gold-600" />
                  ) : (
                    <Monitor className="h-4 w-4 mr-2 text-gold-600" />
                  )}
                  {dev.name}
                </span>
                <span className="font-bold text-white">{dev.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="glass p-5 rounded-xl border border-gold-600/10 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-gold-600/10 pb-2 flex items-center justify-between">
            <span>Traffic Channels</span>
            <span className="text-[10px] text-gray-400">Visitor Sources</span>
          </h3>
          <div className="space-y-3">
            {data.website.trafficSources.map((source) => (
              <div key={source.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">{source.name}</span>
                  <span className="font-semibold text-white">{source.value}%</span>
                </div>
                <div className="w-full h-1.5 bg-charcoal-900 rounded overflow-hidden">
                  <div
                    style={{ width: `${source.value}%` }}
                    className="h-full bg-gold-600/70"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Google Analytics Overview Card */}
        <div className="glass p-5 rounded-xl border border-gold-600/10 space-y-4 flex flex-col justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-gold-600/10 pb-2 flex items-center">
            <Globe className="h-4.5 w-4.5 mr-2 text-gold-600" />
            Website Traffic Overview
          </h3>
          
          <div className="grid grid-cols-2 gap-4 py-2 text-center">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 uppercase">Page Views</p>
              <p className="text-xl font-bold text-white">{data.website.pageViews.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 uppercase">Unique Visitors</p>
              <p className="text-xl font-bold text-white">{data.website.uniqueVisitors.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-charcoal-950 p-2.5 rounded border border-gray-850 text-center text-[10px] text-gray-500">
            Bounce Rate: <strong>{data.website.bounceRatePercent}%</strong> | Tracked via Google Analytics GA4 Measurement Protocol.
          </div>
        </div>
      </div>
    </div>
  );
}
